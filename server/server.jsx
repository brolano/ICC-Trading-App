import express from 'express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { GraphQLScalarType, Kind } from 'graphql'

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

const port = Number(process.env.PORT || 3001)
const mongoURI = process.env.MONGODB_URI
const mongoDbName = process.env.MONGODB_DB || 'icc_trading_app'
const jwtSecret = process.env.JWT_SECRET || 'icc-development-secret'

if (!mongoURI) {
  console.error('MongoDB URI missing in environment variables.')
  process.exit(1)
}

const progressSchema = new mongoose.Schema(
  {
    completedLessons: { type: [String], default: [] },
    quizScores: { type: mongoose.Schema.Types.Mixed, default: {} },
    simulator: {
      attempts: { type: Number, default: 0 },
      correct: { type: Number, default: 0 },
    },
  },
  { _id: false },
)

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true, index: true, required: true },
    displayName: { type: String, required: true },
    passwordHash: { type: String, required: true },
    progress: { type: progressSchema, default: () => ({}) },
  },
  { timestamps: true },
)

const User = mongoose.model('User', userSchema)

function defaultProgress() {
  return {
    completedLessons: [],
    quizScores: {},
    simulator: { attempts: 0, correct: 0 },
  }
}

function normalizeUserPayload(user) {
  return {
    id: user._id.toString(),
    username: user.username,
    displayName: user.displayName,
    progress: user.progress ?? defaultProgress(),
  }
}

function createToken(user) {
  return jwt.sign(
    {
      sub: user._id.toString(),
      username: user.username,
      displayName: user.displayName,
    },
    jwtSecret,
    { expiresIn: '7d' },
  )
}

function authRequired(req, res, next) {
  const header = req.headers.authorization || ''
  const [scheme, token] = header.split(' ')

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Missing access token.' })
  }

  try {
    req.auth = jwt.verify(token, jwtSecret)
    return next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session.' })
  }
}

const typeDefs = `#graphql
  scalar JSON

  type SimulatorProgress {
    attempts: Int!
    correct: Int!
  }

  type Progress {
    completedLessons: [String!]!
    quizScores: JSON!
    simulator: SimulatorProgress!
  }

  type User {
    id: ID!
    username: String!
    displayName: String!
    progress: Progress!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    me: User
    health: String!
  }

  input SimulatorProgressInput {
    attempts: Int!
    correct: Int!
  }

  input ProgressInput {
    completedLessons: [String!]!
    quizScores: JSON!
    simulator: SimulatorProgressInput!
  }

  type Mutation {
    login(username: String!, password: String!, displayName: String): AuthPayload!
    saveProgress(progress: ProgressInput!): User!
  }
`

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'Arbitrary JSON payload',
  serialize: (value) => value,
  parseValue: (value) => value,
  parseLiteral(ast) {
    switch (ast.kind) {
      case Kind.STRING:
      case Kind.BOOLEAN:
        return ast.value
      case Kind.INT:
      case Kind.FLOAT:
        return Number(ast.value)
      case Kind.OBJECT:
        return ast.fields.reduce((object, field) => {
          object[field.name.value] = field.value.value
          return object
        }, {})
      case Kind.LIST:
        return ast.values.map((value) => value.value)
      default:
        return null
    }
  },
})

const resolvers = {
  JSON: jsonScalar,
  Query: {
    health: () => 'ok',
    me: async (_parent, _args, context) => {
      if (!context.userId) return null
      const user = await User.findById(context.userId)
      return user ? normalizeUserPayload(user) : null
    },
  },
  Mutation: {
    login: async (_parent, { username, password, displayName }) => {
      const normalizedUsername = String(username || '').trim().toLowerCase()
      const normalizedPassword = String(password || '')
      const resolvedDisplayName = String(displayName || '').trim() || normalizedUsername

      if (!normalizedUsername || !normalizedPassword) {
        throw new Error('Username and password are required.')
      }

      let user = await User.findOne({ username: normalizedUsername })

      if (!user) {
        const passwordHash = await bcrypt.hash(normalizedPassword, 10)
        user = await User.create({
          username: normalizedUsername,
          displayName: resolvedDisplayName,
          passwordHash,
          progress: defaultProgress(),
        })
      } else {
        const passwordMatches = await bcrypt.compare(normalizedPassword, user.passwordHash)
        if (!passwordMatches) {
          throw new Error('Incorrect password.')
        }
      }

      return {
        token: createToken(user),
        user: normalizeUserPayload(user),
      }
    },
    saveProgress: async (_parent, { progress }, context) => {
      if (!context.userId) {
        throw new Error('Unauthorized')
      }

      const user = await User.findByIdAndUpdate(
        context.userId,
        { $set: { progress: JSON.parse(JSON.stringify(progress)) } },
        { new: true },
      )

      if (!user) {
        throw new Error('User not found')
      }

      return normalizeUserPayload(user)
    },
  },
}

const startApolloServer = async () => {
  await mongoose.connect(mongoURI, {
    dbName: mongoDbName,
  })
  console.log('MongoDB connected')

  const server = new ApolloServer({
    typeDefs,
    resolvers,
  })

  await server.start()

  app.use(
    '/graphql',
    expressMiddleware(server, {
      context: async ({ req }) => {
        const header = req.headers.authorization || ''
        const [, token] = header.split(' ')
        if (!token) {
          return { userId: null }
        }

        try {
          const payload = jwt.verify(token, jwtSecret)
          return { userId: payload.sub }
        } catch {
          return { userId: null }
        }
      },
    }),
  )

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true })
  })

  app.post('/api/auth/login', async (req, res) => {
    try {
      const payload = await resolvers.Mutation.login(null, req.body, {})
      res.json(payload)
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  })

  app.get('/api/auth/me', authRequired, async (req, res) => {
    const user = await User.findById(req.auth.sub)
    if (!user) {
      return res.status(404).json({ message: 'User not found.' })
    }
    return res.json({ user: normalizeUserPayload(user) })
  })

  app.put('/api/progress', authRequired, async (req, res) => {
    try {
      const user = await resolvers.Mutation.saveProgress(null, { progress: req.body.progress }, { userId: req.auth.sub })
      res.json({ ok: true, user })
    } catch (error) {
      res.status(400).json({ message: error.message })
    }
  })

  app.get('/', (_req, res) => {
    res.send('ICC Trading API is running with Apollo Server v4 and MongoDB')
  })

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/graphql`)
  })
}

startApolloServer().catch((error) => {
  console.error('Server startup failed', error)
  process.exit(1)
})