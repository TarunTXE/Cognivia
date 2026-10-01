/**
 * Frontend API client for Cognivia backend services.
 * Uses VITE_API_URL for the backend base URL.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(response, defaultError) {
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Server returned status ${response.status}`);
  }

  if (!response.ok || !data.success) {
    const errorMsg =
      data.error ||
      (Array.isArray(data.details) ? data.details.join(', ') : defaultError);
    throw new Error(errorMsg);
  }

  return data.data;
}

/**
 * Generate AI study notes for a topic and difficulty level.
 * POST /api/notes
 */
export async function generateNotes({ topic, difficulty }) {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ topic, difficulty }),
  });
  return handleResponse(response, 'Failed to generate study notes.');
}

/**
 * Generate a personalized study plan.
 * POST /api/study-plan
 */
export async function generateStudyPlan({ subject, topic, difficulty, goal, duration, dailyTime }) {
  const response = await fetch(`${API_URL}/api/study-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      subject,
      topic,
      difficulty,
      goal,
      duration: Number(duration),
      dailyTime,
    }),
  });
  return handleResponse(response, 'Failed to generate study plan.');
}

/**
 * Generate multiple-choice quiz questions.
 * POST /api/quiz
 */
export async function generateQuiz({ topic, difficulty, numQuestions = 5 }) {
  const response = await fetch(`${API_URL}/api/quiz`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      difficulty,
      numQuestions: Number(numQuestions),
    }),
  });
  return handleResponse(response, 'Failed to generate quiz.');
}

/**
 * Evaluate submitted quiz answers and get recommendations.
 * POST /api/evaluate
 */
export async function evaluateQuiz({ answers, questions }) {
  const response = await fetch(`${API_URL}/api/evaluate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers, questions }),
  });
  return handleResponse(response, 'Failed to evaluate quiz.');
}
