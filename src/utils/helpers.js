export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function calculateScore(answers, questions) {
  const correct = questions.filter((q, i) => answers[i] === q.correct).length;
  return {
    correct,
    incorrect: questions.length - correct,
    total: questions.length,
    percentage: Math.round((correct / questions.length) * 100),
  };
}

export function getWeakTopics(answers, questions) {
  const topicResults = {};
  questions.forEach((q, i) => {
    if (!topicResults[q.topic]) topicResults[q.topic] = { correct: 0, total: 0 };
    topicResults[q.topic].total += 1;
    if (answers[i] === q.correct) topicResults[q.topic].correct += 1;
  });
  return Object.entries(topicResults)
    .filter(([, r]) => r.correct / r.total < 0.6)
    .map(([topic]) => topic);
}
