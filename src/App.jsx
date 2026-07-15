import { useEffect, useMemo, useState } from 'react'
import './App.css'

const PHASES = [
  {
    id: 'accumulation',
    name: 'Accumulation',
    color: '#1f8a70',
    summary: 'Price compresses into a balanced range while positions build quietly.',
  },
  {
    id: 'manipulation',
    name: 'Manipulation',
    color: '#e67e22',
    summary: 'Sharp liquidity grab that sweeps stops before the true move emerges.',
  },
  {
    id: 'expansion',
    name: 'Expansion',
    color: '#2962ff',
    summary: 'Decisive impulse as imbalance drives directional delivery.',
  },
  {
    id: 'distribution',
    name: 'Distribution',
    color: '#d64545',
    summary: 'Trend weakens, inventory unloads, and the auction rotates lower.',
  },
]

const MODULE_TOPICS = [
  'Market Structure Foundations',
  'Liquidity and Intent',
  'Execution Timing',
  'Risk and Position Craft',
  'Multi-Timeframe Alignment',
  'Advanced ICC Playbooks',
]

const QUIZ_TEMPLATES = [
  {
    prompt: 'Which ICC phase usually forms a tight range with reduced volatility?',
    options: ['Expansion', 'Accumulation', 'Distribution', 'Manipulation'],
    correct: 1,
    explanation:
      'Accumulation is typically range-bound with controlled volatility while large participants build positions.',
  },
  {
    prompt: 'A sudden wick below support that instantly reverses is most likely:',
    options: ['Expansion', 'Manipulation', 'Distribution', 'Continuation drift'],
    correct: 1,
    explanation:
      'That behavior reflects a liquidity sweep, a core feature of the manipulation phase.',
  },
  {
    prompt: 'In ICC logic, expansion is confirmed best by:',
    options: [
      'Repeated equal highs',
      'Higher volume impulse and displacement',
      'Flat ATR',
      'Low range candles',
    ],
    correct: 1,
    explanation:
      'Expansion requires displacement and directional commitment, often visible with stronger candle bodies and participation.',
  },
  {
    prompt: 'Distribution frequently appears after:',
    options: ['A prolonged directional move', 'A single doji', 'News blackout', 'Session open only'],
    correct: 0,
    explanation:
      'After a sustained run, inventory often rotates from strong hands to weak hands, producing distribution behavior.',
  },
  {
    prompt: 'Best response after identifying manipulation into key liquidity:',
    options: [
      'Chase immediately',
      'Wait for structure shift and confirmation',
      'Ignore context',
      'Double risk size',
    ],
    correct: 1,
    explanation:
      'ICC execution favors confirmation after the sweep, not emotional entries during the spike.',
  },
  {
    prompt: 'Which metric most directly improves long-term survivability?',
    options: ['Higher leverage', 'Consistent risk per trade', 'More trades per day', 'No stop loss'],
    correct: 1,
    explanation:
      'Position sizing consistency prevents a small sample of losses from destroying your equity curve.',
  },
  {
    prompt:
      'When higher timeframe is bullish and lower timeframe manipulates down, ICC bias is often:',
    options: ['Short only', 'Long on confirmation', 'Neutral forever', 'Exit all analysis'],
    correct: 1,
    explanation:
      'Lower timeframe manipulation against higher timeframe bias often provides discounted long entries after confirmation.',
  },
  {
    prompt: 'A healthy expansion leg generally contains:',
    options: [
      'No pullbacks',
      'Clean structure and follow-through',
      'Only wicks no bodies',
      'Random gaps every bar',
    ],
    correct: 1,
    explanation:
      'Sustainable expansion usually prints orderly continuation with efficient structure rather than chaotic churn.',
  },
  {
    prompt: 'If quiz accuracy is high but simulator performance is low, most likely gap is:',
    options: [
      'Pattern recognition in live context',
      'Risk management',
      'Broker spread only',
      'Keyboard speed',
    ],
    correct: 0,
    explanation:
      'Knowing definitions is different from reading evolving charts. Practice recognition under motion improves transfer.',
  },
  {
    prompt: 'The strongest ICC setups generally align:',
    options: [
      'One timeframe only',
      'Phase context, liquidity, and timing',
      'Random indicators',
      'Social media sentiment',
    ],
    correct: 1,
    explanation:
      'High-confluence setups combine phase location, liquidity story, and execution timing.',
  },
]

function buildModules() {
  return MODULE_TOPICS.map((topic, moduleIndex) => {
    const lessons = Array.from({ length: 4 }, (_, lessonIndex) => {
      const phase = PHASES[(moduleIndex * 4 + lessonIndex) % PHASES.length]
      const lessonNumber = moduleIndex * 4 + lessonIndex + 1
      return {
        id: `M${moduleIndex + 1}-L${lessonIndex + 1}`,
        number: lessonNumber,
        title: `Lesson ${lessonNumber}: ${phase.name} Blueprint`,
        phase,
        objective: `Apply ${phase.name.toLowerCase()} logic inside ${topic.toLowerCase()} and identify high-probability execution windows.`,
        reveals: [
          {
            title: 'Tap to Reveal: Market Story',
            content: `${phase.name} tells you where inventory is likely building or releasing. Read this phase first before planning entries.`,
          },
          {
            title: 'Tap to Reveal: Confirmation Signals',
            content: `Track candle efficiency, liquidity reactions, and structure shifts to validate ${phase.name.toLowerCase()} in real time.`,
          },
          {
            title: 'Tap to Reveal: Execution Rule',
            content: `Execute only when phase context and risk model align. Skip any setup that violates your pre-defined invalidation level.`,
          },
        ],
      }
    })

    const quizBank = QUIZ_TEMPLATES.map((question, questionIndex) => ({
      ...question,
      id: `M${moduleIndex + 1}-Q${questionIndex + 1}`,
      prompt: `[${topic}] ${question.prompt}`,
    }))

    return {
      id: `module-${moduleIndex + 1}`,
      title: `Module ${moduleIndex + 1}`,
      topic,
      lessons,
      quizBank,
    }
  })
}

const MODULES = buildModules()

function randomNumber(min, max) {
  return min + Math.random() * (max - min)
}

function buildPatternSeries(phaseId, length = 64) {
  let value = randomNumber(95, 125)
  return Array.from({ length }, (_, index) => {
    if (phaseId === 'accumulation') {
      value += randomNumber(-0.9, 0.9)
      if (index > length * 0.7) value += randomNumber(0.1, 0.7)
    }
    if (phaseId === 'manipulation') {
      if (index === Math.floor(length * 0.45)) value -= randomNumber(5, 8)
      if (index > length * 0.45) value += randomNumber(0.2, 1.4)
      else value += randomNumber(-0.5, 0.4)
    }
    if (phaseId === 'expansion') {
      value += randomNumber(0.2, 1.6)
      if (index % 8 === 0) value -= randomNumber(0.1, 0.8)
    }
    if (phaseId === 'distribution') {
      if (index < length * 0.35) value += randomNumber(0.1, 0.8)
      if (index >= length * 0.35) value -= randomNumber(0.2, 1.3)
    }
    return Number(value.toFixed(2))
  })
}

function createScenario() {
  const phase = PHASES[Math.floor(Math.random() * PHASES.length)]
  return {
    id: `scenario-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
    phase,
    series: buildPatternSeries(phase.id),
  }
}

function App() {
  const [activeView, setActiveView] = useState('lessons')
  const [selectedModuleId, setSelectedModuleId] = useState(MODULES[0].id)
  const [revealedCards, setRevealedCards] = useState({})
  const [progress, setProgress] = useState(() => {
    const fromStorage = localStorage.getItem('icc-progress-v1')
    if (!fromStorage) {
      return {
        completedLessons: [],
        quizScores: {},
        simulator: { attempts: 0, correct: 0 },
      }
    }
    return JSON.parse(fromStorage)
  })
  const [quizState, setQuizState] = useState({})
  const [scenario, setScenario] = useState(createScenario)
  const [visiblePoints, setVisiblePoints] = useState(8)
  const [simulatorFeedback, setSimulatorFeedback] = useState(null)

  const selectedModule = MODULES.find((module) => module.id === selectedModuleId) ?? MODULES[0]

  useEffect(() => {
    localStorage.setItem('icc-progress-v1', JSON.stringify(progress))
  }, [progress])

  useEffect(() => {
    setSimulatorFeedback(null)
    setVisiblePoints(8)
  }, [scenario.id])

  useEffect(() => {
    const timer = setInterval(() => {
      setVisiblePoints((previous) => {
        if (previous >= scenario.series.length) return previous
        return previous + 1
      })
    }, 120)
    return () => clearInterval(timer)
  }, [scenario.id, scenario.series.length])

  const courseStats = useMemo(() => {
    const completedLessonsCount = progress.completedLessons.length
    const quizEntries = Object.values(progress.quizScores)
    const averageQuizAccuracy =
      quizEntries.length > 0
        ? quizEntries.reduce((sum, item) => sum + item.accuracy, 0) / quizEntries.length
        : 0
    const simulatorAccuracy =
      progress.simulator.attempts > 0
        ? (progress.simulator.correct / progress.simulator.attempts) * 100
        : 0
    const overall = Math.min(
      100,
      Math.round(
        (completedLessonsCount / 24) * 50 +
          (averageQuizAccuracy / 100) * 35 +
          (simulatorAccuracy / 100) * 15,
      ),
    )
    return {
      completedLessonsCount,
      averageQuizAccuracy,
      simulatorAccuracy,
      overall,
    }
  }, [progress])

  const moduleProgress = useMemo(() => {
    return MODULES.map((module) => {
      const lessonDone = module.lessons.filter((lesson) =>
        progress.completedLessons.includes(lesson.id),
      ).length
      const quizResult = progress.quizScores[module.id]
      const completion =
        (lessonDone / module.lessons.length) * 70 + ((quizResult?.accuracy ?? 0) / 100) * 30
      return {
        module,
        lessonDone,
        quizResult,
        completion: Math.round(completion),
        completed: lessonDone === module.lessons.length && (quizResult?.accuracy ?? 0) >= 70,
      }
    })
  }, [progress])

  const unlockedBadges = useMemo(() => {
    const completedModules = moduleProgress.filter((item) => item.completed).length
    const quizEntries = Object.values(progress.quizScores)
    const badges = [
      {
        id: 'starter',
        name: 'Lesson Starter',
        rule: 'Complete your first lesson',
        unlocked: progress.completedLessons.length >= 1,
      },
      {
        id: 'phase-reader',
        name: 'Phase Reader',
        rule: 'Get 3 correct simulator calls',
        unlocked: progress.simulator.correct >= 3,
      },
      {
        id: 'quiz-tactician',
        name: 'Quiz Tactician',
        rule: 'Score 70%+ average across 3 modules',
        unlocked: quizEntries.length >= 3 && courseStats.averageQuizAccuracy >= 70,
      },
      {
        id: 'module-finisher',
        name: 'Module Finisher',
        rule: 'Fully complete 3 modules',
        unlocked: completedModules >= 3,
      },
      {
        id: 'icc-strategist',
        name: 'ICC Strategist',
        rule: 'Complete all modules and 75%+ simulator accuracy (12+ attempts)',
        unlocked:
          completedModules === MODULES.length &&
          progress.simulator.attempts >= 12 &&
          courseStats.simulatorAccuracy >= 75,
      },
    ]
    return badges
  }, [courseStats.averageQuizAccuracy, courseStats.simulatorAccuracy, moduleProgress, progress])

  const currentQuiz =
    quizState[selectedModule.id] ?? {
      index: 0,
      answers: {},
      completed: false,
      score: null,
    }

  const currentQuestion = selectedModule.quizBank[currentQuiz.index]
  const selectedAnswer = currentQuestion ? currentQuiz.answers[currentQuestion.id] : undefined

  function toggleReveal(lessonId, revealIndex) {
    const key = `${lessonId}-${revealIndex}`
    setRevealedCards((previous) => ({
      ...previous,
      [key]: !previous[key],
    }))
  }

  function toggleLessonComplete(lessonId) {
    setProgress((previous) => {
      const hasLesson = previous.completedLessons.includes(lessonId)
      const completedLessons = hasLesson
        ? previous.completedLessons.filter((id) => id !== lessonId)
        : [...previous.completedLessons, lessonId]
      return {
        ...previous,
        completedLessons,
      }
    })
  }

  function resetQuiz(moduleId) {
    setQuizState((previous) => ({
      ...previous,
      [moduleId]: {
        index: 0,
        answers: {},
        completed: false,
        score: null,
      },
    }))
  }

  function answerQuiz(optionIndex) {
    if (!currentQuestion || selectedAnswer !== undefined) return

    setQuizState((previous) => {
      const active =
        previous[selectedModule.id] ?? {
          index: 0,
          answers: {},
          completed: false,
          score: null,
        }
      return {
        ...previous,
        [selectedModule.id]: {
          ...active,
          answers: {
            ...active.answers,
            [currentQuestion.id]: optionIndex,
          },
        },
      }
    })
  }

  function nextQuizQuestion() {
    if (!currentQuestion || selectedAnswer === undefined) return

    const isLast = currentQuiz.index === selectedModule.quizBank.length - 1
    if (isLast) {
      const answersAfterSelection = {
        ...currentQuiz.answers,
        [currentQuestion.id]: selectedAnswer,
      }
      const correctCount = selectedModule.quizBank.reduce((sum, question) => {
        const picked = answersAfterSelection[question.id]
        return sum + (picked === question.correct ? 1 : 0)
      }, 0)
      const accuracy = Math.round((correctCount / selectedModule.quizBank.length) * 100)

      setQuizState((previous) => ({
        ...previous,
        [selectedModule.id]: {
          ...currentQuiz,
          answers: answersAfterSelection,
          completed: true,
          score: { correctCount, total: selectedModule.quizBank.length, accuracy },
        },
      }))

      setProgress((previous) => ({
        ...previous,
        quizScores: {
          ...previous.quizScores,
          [selectedModule.id]: {
            correct: correctCount,
            total: selectedModule.quizBank.length,
            accuracy,
          },
        },
      }))
      return
    }

    setQuizState((previous) => ({
      ...previous,
      [selectedModule.id]: {
        ...currentQuiz,
        index: currentQuiz.index + 1,
      },
    }))
  }

  function guessPhase(phaseId) {
    const correct = phaseId === scenario.phase.id
    setSimulatorFeedback({
      correct,
      guessed: PHASES.find((phase) => phase.id === phaseId)?.name ?? phaseId,
      actual: scenario.phase.name,
    })
    setProgress((previous) => ({
      ...previous,
      simulator: {
        attempts: previous.simulator.attempts + 1,
        correct: previous.simulator.correct + (correct ? 1 : 0),
      },
    }))
  }

  function newScenario() {
    setScenario(createScenario())
  }

  const visibleSeries = scenario.series.slice(0, visiblePoints)
  const min = Math.min(...scenario.series)
  const max = Math.max(...scenario.series)
  const points = visibleSeries
    .map((value, index) => {
      const x = (index / (scenario.series.length - 1)) * 100
      const y = 95 - ((value - min) / Math.max(max - min, 1)) * 90
      return `${x},${y}`
    })
    .join(' ')

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Interactive Crypto Curriculum</p>
          <h1>ICC Trading Academy</h1>
          <p className="lead">
            24 lessons, live phase simulation, instant scoring, and module quiz intelligence in one
            adaptive workspace.
          </p>
        </div>
        <div className="hero-metrics">
          <div>
            <span>Lessons Completed</span>
            <strong>{courseStats.completedLessonsCount}/24</strong>
          </div>
          <div>
            <span>Quiz Accuracy</span>
            <strong>{courseStats.averageQuizAccuracy.toFixed(1)}%</strong>
          </div>
          <div>
            <span>Simulator Accuracy</span>
            <strong>{courseStats.simulatorAccuracy.toFixed(1)}%</strong>
          </div>
        </div>
      </header>

      <section className="phase-board" aria-label="ICC phase breakdown">
        <div>
          <h2>Phase Breakdown</h2>
          <p>Use this map while learning and while labeling random chart scenarios.</p>
        </div>
        <div className="phase-grid">
          {PHASES.map((phase) => (
            <article key={phase.id} className="phase-card" style={{ '--phase-color': phase.color }}>
              <h3>{phase.name}</h3>
              <p>{phase.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <nav className="tab-row" aria-label="application sections">
        <button onClick={() => setActiveView('lessons')} className={activeView === 'lessons' ? 'active' : ''}>
          Lessons
        </button>
        <button
          onClick={() => setActiveView('simulator')}
          className={activeView === 'simulator' ? 'active' : ''}
        >
          Chart Simulator
        </button>
        <button onClick={() => setActiveView('quiz')} className={activeView === 'quiz' ? 'active' : ''}>
          Quizzes
        </button>
        <button
          onClick={() => setActiveView('dashboard')}
          className={activeView === 'dashboard' ? 'active' : ''}
        >
          Progress Dashboard
        </button>
      </nav>

      <section className="workspace-grid">
        <aside className="module-panel">
          <h2>Modules</h2>
          {MODULES.map((module) => {
            const moduleItem = moduleProgress.find((item) => item.module.id === module.id)
            return (
              <button
                key={module.id}
                className={`module-chip ${selectedModule.id === module.id ? 'selected' : ''}`}
                onClick={() => setSelectedModuleId(module.id)}
              >
                <span>{module.title}</span>
                <small>{module.topic}</small>
                <strong>{moduleItem?.completion ?? 0}%</strong>
              </button>
            )
          })}
        </aside>

        <div className="content-panel">
          {activeView === 'lessons' && (
            <section>
              <h2>{selectedModule.title}: Lessons</h2>
              <p className="subtle">Tap each card to reveal hidden coaching notes and phase cues.</p>
              <div className="lesson-stack">
                {selectedModule.lessons.map((lesson) => {
                  const isDone = progress.completedLessons.includes(lesson.id)
                  return (
                    <article key={lesson.id} className="lesson-card">
                      <div className="lesson-header">
                        <div>
                          <h3>{lesson.title}</h3>
                          <p>{lesson.objective}</p>
                        </div>
                        <button
                          className={`mark-btn ${isDone ? 'done' : ''}`}
                          onClick={() => toggleLessonComplete(lesson.id)}
                        >
                          {isDone ? 'Completed' : 'Mark Complete'}
                        </button>
                      </div>
                      <div className="diagram-strip">
                        <span style={{ backgroundColor: lesson.phase.color }}></span>
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      <div className="reveal-grid">
                        {lesson.reveals.map((reveal, revealIndex) => {
                          const key = `${lesson.id}-${revealIndex}`
                          const open = Boolean(revealedCards[key])
                          return (
                            <button
                              key={reveal.title}
                              className={`reveal-card ${open ? 'open' : ''}`}
                              onClick={() => toggleReveal(lesson.id, revealIndex)}
                            >
                              <h4>{reveal.title}</h4>
                              <p>{open ? reveal.content : 'Tap to reveal content'}</p>
                            </button>
                          )
                        })}
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          )}

          {activeView === 'simulator' && (
            <section>
              <h2>Live ICC Phase Chart Simulator</h2>
              <p className="subtle">
                A random crypto pattern is generated live. Identify the most likely ICC phase and get
                instant scored feedback.
              </p>
              <div className="chart-box">
                <svg viewBox="0 0 100 100" role="img" aria-label="Live generated crypto chart pattern">
                  <polyline points={points} fill="none" stroke="#1ec8a5" strokeWidth="1.8" />
                </svg>
              </div>
              <div className="phase-guess-row">
                {PHASES.map((phase) => (
                  <button key={phase.id} onClick={() => guessPhase(phase.id)}>
                    {phase.name}
                  </button>
                ))}
                <button onClick={newScenario} className="new-chart-btn">
                  Generate New Chart
                </button>
              </div>
              {simulatorFeedback && (
                <div className={`feedback ${simulatorFeedback.correct ? 'correct' : 'wrong'}`}>
                  <strong>{simulatorFeedback.correct ? 'Correct call.' : 'Not quite.'}</strong>
                  <p>
                    You selected {simulatorFeedback.guessed}. Actual phase: {simulatorFeedback.actual}.
                  </p>
                </div>
              )}
            </section>
          )}

          {activeView === 'quiz' && (
            <section>
              <h2>{selectedModule.title} Quiz Bank</h2>
              <p className="subtle">10 questions with answer explanations and tracked module accuracy.</p>
              {!currentQuiz.completed && currentQuestion && (
                <article className="quiz-card">
                  <h3>
                    Question {currentQuiz.index + 1} / {selectedModule.quizBank.length}
                  </h3>
                  <p>{currentQuestion.prompt}</p>
                  <div className="option-grid">
                    {currentQuestion.options.map((option, optionIndex) => {
                      const showResult = selectedAnswer !== undefined
                      const isCorrect = optionIndex === currentQuestion.correct
                      const isSelected = selectedAnswer === optionIndex
                      return (
                        <button
                          key={option}
                          disabled={showResult}
                          className={
                            showResult
                              ? isCorrect
                                ? 'correct'
                                : isSelected
                                  ? 'wrong'
                                  : ''
                              : ''
                          }
                          onClick={() => answerQuiz(optionIndex)}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                  {selectedAnswer !== undefined && (
                    <div className="quiz-explain">
                      <strong>
                        {selectedAnswer === currentQuestion.correct ? 'Correct answer.' : 'Review this concept.'}
                      </strong>
                      <p>{currentQuestion.explanation}</p>
                      <button onClick={nextQuizQuestion} className="next-btn">
                        {currentQuiz.index === selectedModule.quizBank.length - 1
                          ? 'Finish Quiz'
                          : 'Next Question'}
                      </button>
                    </div>
                  )}
                </article>
              )}

              {currentQuiz.completed && currentQuiz.score && (
                <article className="quiz-result">
                  <h3>Quiz Complete</h3>
                  <p>
                    Score: {currentQuiz.score.correctCount} / {currentQuiz.score.total} (
                    {currentQuiz.score.accuracy}%)
                  </p>
                  <button onClick={() => resetQuiz(selectedModule.id)}>Retake Quiz</button>
                </article>
              )}
            </section>
          )}

          {activeView === 'dashboard' && (
            <section>
              <h2>Progress Dashboard</h2>
              <div className="progress-block">
                <div className="progress-label">
                  <span>Live Course Progress</span>
                  <strong>{courseStats.overall}%</strong>
                </div>
                <div className="progress-track">
                  <div style={{ width: `${courseStats.overall}%` }}></div>
                </div>
              </div>

              <div className="module-progress-list">
                {moduleProgress.map((entry) => (
                  <article key={entry.module.id}>
                    <h3>
                      {entry.module.title} - {entry.module.topic}
                    </h3>
                    <p>
                      Lessons: {entry.lessonDone}/{entry.module.lessons.length} | Quiz:{' '}
                      {entry.quizResult?.accuracy ?? 0}%
                    </p>
                    <div className="mini-progress">
                      <div style={{ width: `${entry.completion}%` }}></div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="badge-grid">
                {unlockedBadges.map((badge) => (
                  <article key={badge.id} className={badge.unlocked ? 'unlocked' : 'locked'}>
                    <h4>{badge.name}</h4>
                    <p>{badge.rule}</p>
                    <strong>{badge.unlocked ? 'Unlocked' : 'Locked'}</strong>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
      </section>

      <footer className="app-footer">
        <span>ICC Academy Engine</span>
        <span>Modules: {MODULES.length}</span>
        <span>Total Lessons: 24</span>
      </footer>
    </main>
  )
}

export default App
