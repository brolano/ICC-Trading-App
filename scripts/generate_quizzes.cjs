const fs = require('fs');
const path = require('path');

function pickRandom(arr, n, exclude) {
  const pool = arr.filter(x => x !== exclude);
  const out = [];
  while (out.length < n && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i,1)[0]);
  }
  return out;
}

const coursePath = path.resolve(__dirname, '..', 'src', 'assets', 'icc_course.json');
const outQuizPath = path.resolve(__dirname, '..', 'src', 'assets', 'quiz_bank.json');

const course = JSON.parse(fs.readFileSync(coursePath, 'utf8'));
const allTitles = course.modules.flatMap(m => m.lessons.map(l => l.title));

const quizOutput = { generatedAt: new Date().toISOString(), modules: [] };

course.modules.forEach(module => {
  const moduleTitles = module.lessons.map(l => l.title);
  const moduleQuiz = [];

  for (let i = 0; i < 10; i++) {
    const lesson = module.lessons[i % module.lessons.length];
    const correct = lesson.title;
    const distractors = pickRandom(allTitles, 3, correct);
    const options = [correct, ...distractors];
    // shuffle
    for (let j = options.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [options[j], options[k]] = [options[k], options[j]];
    }
    const correctIndex = options.indexOf(correct);

    moduleQuiz.push({
      id: `${module.id}-q${i+1}`,
      moduleId: module.id,
      question: `Which lesson best matches this objective: "${lesson.objective}"?`,
      type: 'mcq',
      options,
      correctIndex,
      explanation: lesson.objective
    });
  }

  // attach into course structure
  module.quizBank = moduleQuiz;
  quizOutput.modules.push({ moduleId: module.id, quiz: moduleQuiz });
});

fs.writeFileSync(outQuizPath, JSON.stringify(quizOutput, null, 2), 'utf8');
fs.writeFileSync(coursePath, JSON.stringify(course, null, 2), 'utf8');

console.log('Generated quiz bank at', outQuizPath);