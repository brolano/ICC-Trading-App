import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { MongoClient, ObjectId } from 'mongodb'

const app = express()
const port = Number(process.env.PORT || 3001)
const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017'
const mongoDbName = process.env.MONGODB_DB || 'icc_trading_app'
const jwtSecret = process.env.JWT_SECRET || 'icc-development-secret'

const client = new MongoClient(mongoUri)
let usersCollection

app.use(cors())
app.use(express.json({ limit: '1mb' }))

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

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.post('/api/auth/login', async (req, res) => {
  const username = String(req.body.username || '').trim().toLowerCase()
  const password = String(req.body.password || '')
  const displayName = String(req.body.displayName || '').trim() || username

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' })
  }

  const existingUser = await usersCollection.findOne({ username })

  if (!existingUser) {
    const passwordHash = await bcrypt.hash(password, 10)
    const created = {
      username,
      displayName,
      passwordHash,
      progress: defaultProgress(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    const result = await usersCollection.insertOne(created)
    const user = { ...created, _id: result.insertedId }
    const token = createToken(user)
    return res.json({ token, user: normalizeUserPayload(user) })
  }

  const passwordMatches = await bcrypt.compare(password, existingUser.passwordHash)
  if (!passwordMatches) {
    return res.status(401).json({ message: 'Incorrect password.' })
  }

  const token = createToken(existingUser)
  return res.json({ token, user: normalizeUserPayload(existingUser) })
})

app.get('/api/auth/me', authRequired, async (req, res) => {
  const user = await usersCollection.findOne({ _id: new ObjectId(req.auth.sub) })
  if (!user) {
    return res.status(404).json({ message: 'User not found.' })
  }
  return res.json({ user: normalizeUserPayload(user) })
})

app.put('/api/progress', authRequired, async (req, res) => {
  const progress = req.body.progress
  if (!progress || typeof progress !== 'object') {
    return res.status(400).json({ message: 'Progress payload is required.' })
  }

  await usersCollection.updateOne(
    { _id: new ObjectId(req.auth.sub) },
    {
      $set: {
        progress,
        updatedAt: new Date(),
      },
    },
  )

  return res.json({ ok: true })
})

async function start() {
  await client.connect()
  usersCollection = client.db(mongoDbName).collection('users')
  await usersCollection.createIndex({ username: 1 }, { unique: true })

  app.listen(port, () => {
    console.log(`ICC backend running on http://localhost:${port}`)
  })
}

start().catch((error) => {
  console.error('Failed to start backend', error)
  process.exit(1)
})
