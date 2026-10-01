/**
 * AI Service — Google Gemini (via @google/genai SDK v2)
 *
 * All four public functions call Gemini with structured JSON prompts.
 * The API key is read exclusively from process.env.GEMINI_API_KEY — it is
 * never logged, returned in responses, or embedded in source code.
 *
 * To swap providers in the future, replace the helper callGemini() while
 * keeping the four public function signatures identical.
 */

const { GoogleGenAI } = require('@google/genai');

// ── Client initialisation ────────────────────────────────────────────────────

const CANDIDATE_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-3.8-flash',
].filter((m, i, arr) => m && arr.indexOf(m) === i);

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    const err = new Error('AI service is not configured (missing API key).');
    err.status = 503;
    throw err;
  }
  return new GoogleGenAI({ apiKey: key });
}

// ── Core helper ──────────────────────────────────────────────────────────────

/**
 * Call Gemini and return a parsed JSON object.
 *
 * @param {string} prompt   - full prompt text
 * @param {number} [timeout=30000] - ms before aborting
 * @param {number} [modelIndex=0]  - index of candidate model to try
 * @returns {Promise<Object>}
 */
async function callGemini(prompt, timeout = 30000, modelIndex = 0) {
  const ai = getClient();
  const currentModel = CANDIDATE_MODELS[modelIndex] || CANDIDATE_MODELS[0];

  console.log(`[Gemini Diagnostic] Calling model "${currentModel}" (candidate ${modelIndex + 1}/${CANDIDATE_MODELS.length})`);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  let responseText;
  try {
    const response = await ai.models.generateContent({
      model: currentModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
        maxOutputTokens: 4096,
      },
    });
    responseText = typeof response.text === 'function' ? response.text() : response.text;
    console.log(`[Gemini Diagnostic] Success with model "${currentModel}"`);
  } catch (err) {
    clearTimeout(timer);

    console.error(`[Gemini Diagnostic Error] Model: "${currentModel}" | Status: ${err.status} | Code: ${err.code || 'N/A'} | Message: ${err.message}`);

    const isQuotaOrTransient =
      err.status === 429 ||
      err.status === 503 ||
      err.status === 404 ||
      (err.message && (err.message.includes('429') || err.message.includes('503') || err.message.includes('404') || err.message.includes('quota') || err.message.includes('RESOURCE_EXHAUSTED') || err.message.includes('high demand') || err.message.includes('UNAVAILABLE')));

    if (isQuotaOrTransient && modelIndex + 1 < CANDIDATE_MODELS.length) {
      console.log(`[Gemini Diagnostic Fallback] Model "${currentModel}" failed (${err.status || err.message?.slice(0, 30)}). Retrying with next model "${CANDIDATE_MODELS[modelIndex + 1]}"...`);
      return callGemini(prompt, timeout, modelIndex + 1);
    }

    // Timeout
    if (err.name === 'AbortError') {
      const e = new Error('AI request timed out. Please try again.');
      e.status = 504;
      throw e;
    }

    // Rate limit (429)
    if (err.status === 429 || (err.message && err.message.includes('429'))) {
      const e = new Error('AI service is temporarily busy. Please try again shortly.');
      e.status = 429;
      throw e;
    }

    // Propagate other errors
    const e = new Error('AI service request failed. Please try again.');
    e.status = err.status || 502;
    throw e;
  } finally {
    clearTimeout(timer);
  }

  return parseJsonResponse(responseText);
}

/**
 * Strip markdown code fences (```json ... ```) that Gemini sometimes wraps
 * around JSON even when responseMimeType is set, then parse.
 */
function parseJsonResponse(text) {
  if (!text || typeof text !== 'string') {
    const e = new Error('AI returned an empty response.');
    e.status = 502;
    throw e;
  }

  // Remove optional ```json / ``` fences
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const e = new Error('AI returned an unexpected response format.');
    e.status = 502;
    throw e;
  }
}

// ── 1. Study plan ─────────────────────────────────────────────────────────────

async function generateStudyPlan({ subject, topic, difficulty, goal, duration, dailyTime }) {
  const days = Number(duration) || 7;
  const time  = dailyTime || '2 hours';

  const prompt = `
You are an expert learning coach. Generate a complete, structured study plan in valid JSON.

Inputs:
- Subject: ${subject}
- Topic: ${topic}
- Difficulty level: ${difficulty}
- Learning goal: ${goal}
- Duration: ${days} days
- Daily study time: ${time}

Return ONLY this JSON object — no markdown, no commentary:
{
  "subject": "${subject}",
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "goal": "${goal}",
  "duration": ${days},
  "dailyStudyTime": "${time}",
  "estimatedTotalHours": <number>,
  "dailySchedule": [
    {
      "day": <number>,
      "title": "<concise session title>",
      "duration": "${time}",
      "topics": ["<subtopic 1>", "<subtopic 2>", "<subtopic 3>"],
      "status": "upcoming"
    }
  ],
  "keyConcepts": ["<concept 1>", "..."],
  "learningObjectives": ["<objective 1>", "..."],
  "recommendations": ["<recommendation 1>", "..."]
}

Rules:
- dailySchedule must have exactly ${days} entries, numbered 1 to ${days}.
- topics array per day should have 2-4 items.
- keyConcepts: 6-8 items that cover the topic thoroughly.
- learningObjectives: 4-5 clear, actionable objectives.
- recommendations: 3-4 study tips specific to this topic and difficulty.
- Match depth and complexity to the "${difficulty}" level.
- All text must be concise and educational.
`.trim();

  const data = await callGemini(prompt);

  // Ensure dailySchedule status field defaults are safe
  if (Array.isArray(data.dailySchedule)) {
    data.dailySchedule = data.dailySchedule.map((d, i) => ({
      ...d,
      status: i === 0 ? 'in-progress' : 'upcoming',
    }));
  }

  return data;
}

// ── 2. Notes ──────────────────────────────────────────────────────────────────

/**
 * Build the notes prompt for a given topic and difficulty.
 * Extracted so we can call it with both a normal and a retry (stricter) variant.
 */
function buildNotesPrompt(topic, difficulty, retry = false) {
  const retryLine = retry
    ? `IMPORTANT: Your previous response was about the wrong subject. You MUST write exclusively about "${topic}". Do NOT write about any other topic.`
    : '';

  return `
You are an expert educator. Your ONLY task is to generate study notes about the exact topic below.

TOPIC (do not change, substitute, or reinterpret this): "${topic}"
DIFFICULTY: ${difficulty}
${retryLine}

STRICT RULES — violating any rule makes the response invalid:
1. Every sentence in every section must be directly about "${topic}".
2. Do NOT write about a different topic, even if it seems related.
3. Do NOT substitute "${topic}" with another subject.
4. Do NOT include introductory or meta text outside the JSON.
5. All content must be accurate for difficulty level "${difficulty}".

Return ONLY the following JSON object. No markdown fences, no commentary, no extra keys:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "sections": {
    "overview": "<2-4 sentences that explain what ${topic} is and why it matters>",
    "keyConcepts": [
      { "title": "<concept directly within ${topic}>", "description": "<clear explanation specific to ${topic}>" }
    ],
    "definitions": [
      { "term": "<term used in ${topic}>", "definition": "<precise definition in the context of ${topic}>" }
    ],
    "examples": [
      { "title": "<example title related to ${topic}>", "code": "<worked example or pseudocode for ${topic}>" }
    ],
    "commonMistakes": ["<mistake students make when learning ${topic}>"],
    "quickRevision": ["<key fact about ${topic} for quick review>"]
  }
}

Content requirements:
- keyConcepts: 4-6 items specific to "${topic}".
- definitions: 4-6 terms whose meaning is central to understanding "${topic}".
- examples: 2-3 practical examples that illustrate "${topic}" directly.
- commonMistakes: 3-5 mistakes learners make specifically with "${topic}".
- quickRevision: 4-6 concise bullet facts about "${topic}".
`.trim();
}

/**
 * Check that the returned notes object actually mentions the requested topic.
 * Extracts significant words from the topic (≥4 chars) and checks that at
 * least one appears in the overview — a fast, key-word-based signal.
 *
 * @param {Object} data   - parsed Gemini response
 * @param {string} topic  - the originally requested topic
 * @returns {boolean}     true if the content looks relevant
 */
function isRelevantToTopic(data, topic) {
  const overview = (data?.sections?.overview || '').toLowerCase();
  if (!overview) return false;

  // Extract meaningful words from the topic (skip short stop-words)
  const topicWords = topic
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 4);

  if (topicWords.length === 0) return true; // can't check, assume ok

  // At least one significant word from the topic must appear in the overview
  return topicWords.some((w) => overview.includes(w));
}

async function generateNotes({ topic, difficulty }) {
  // ── First attempt ──────────────────────────────────────────────────────────
  const data = await callGemini(buildNotesPrompt(topic, difficulty, false));

  if (isRelevantToTopic(data, topic)) {
    return data;
  }

  // ── Retry with a stronger, more explicit prompt ────────────────────────────
  const retryData = await callGemini(buildNotesPrompt(topic, difficulty, true));

  if (isRelevantToTopic(retryData, topic)) {
    return retryData;
  }

  // ── Both attempts returned irrelevant content ──────────────────────────────
  const e = new Error(
    `Could not generate notes relevant to "${topic}". Please try again or rephrase the topic.`
  );
  e.status = 502;
  throw e;
}

// ── 3. Quiz ───────────────────────────────────────────────────────────────────

async function generateQuiz({ topic, difficulty, numQuestions = 5 }) {
  const count = Math.min(Math.max(Number(numQuestions) || 5, 1), 10);

  const prompt = `
You are an expert quiz author. Generate a multiple-choice quiz in valid JSON.

Inputs:
- Topic: ${topic}
- Difficulty level: ${difficulty}
- Number of questions: ${count}

Return ONLY this JSON object — no markdown, no commentary:
{
  "topic": "${topic}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": <number starting at 1>,
      "question": "<clear, unambiguous question>",
      "options": ["<A>", "<B>", "<C>", "<D>"],
      "correctAnswer": <0-based index of the correct option>,
      "explanation": "<1-2 sentence explanation of why the answer is correct>",
      "topic": "<specific sub-topic this question tests>"
    }
  ]
}

Rules:
- Generate EXACTLY ${count} questions.
- Each question must have EXACTLY 4 options.
- correctAnswer must be 0, 1, 2, or 3 (0-based index into options array).
- The correct option must actually appear at the specified index.
- Distractors must be plausible but clearly wrong.
- Difficulty must match the "${difficulty}" level.
- No duplicate questions.
- Keep explanations concise and educational.
`.trim();

  const data = await callGemini(prompt);

  // Safety: validate and normalise questions array
  if (!Array.isArray(data.questions)) {
    const e = new Error('AI returned an invalid quiz format.');
    e.status = 502;
    throw e;
  }

  data.questions = data.questions.slice(0, count).map((q, i) => ({
    id: i + 1,
    question: q.question || '',
    options: Array.isArray(q.options) && q.options.length === 4
      ? q.options
      : (q.options || []).slice(0, 4),
    correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : 0,
    explanation: q.explanation || '',
    topic: q.topic || topic,
  }));

  return data;
}

// ── 4. Evaluate ───────────────────────────────────────────────────────────────

/**
 * Evaluation is computed locally (no AI call needed) for speed and reliability.
 * Gemini is used only to generate tailored recommendations for weak topics.
 */
async function evaluateQuiz({ answers, questions }) {
  if (!Array.isArray(questions) || questions.length === 0) {
    const e = new Error('No questions provided for evaluation.');
    e.status = 400;
    throw e;
  }

  // ── Score calculation ────────────────────────────────────────────────────
  let correct = 0;
  const topicResults = {};

  questions.forEach((q, i) => {
    const userAnswer =
      answers[i] !== undefined ? answers[i] : answers[String(i)];
    const correctIndex =
      typeof q.correctAnswer === 'number' ? q.correctAnswer : q.correct;
    const isCorrect = userAnswer === correctIndex;

    if (isCorrect) correct++;

    const t = q.topic || 'General';
    if (!topicResults[t]) topicResults[t] = { correct: 0, total: 0 };
    topicResults[t].total++;
    if (isCorrect) topicResults[t].correct++;
  });

  const total       = questions.length;
  const incorrect   = total - correct;
  const percentage  = total > 0 ? Math.round((correct / total) * 100) : 0;

  const weakTopics = Object.entries(topicResults)
    .filter(([, r]) => r.correct / r.total < 0.6)
    .map(([t]) => t);

  // ── AI recommendations for weak topics ───────────────────────────────────
  let recommendations;

  if (weakTopics.length === 0) {
    recommendations = [
      'Excellent performance — consider advancing to more challenging material.',
      'Try applying these concepts in a practical project.',
    ];
  } else {
    try {
      const prompt = `
A student scored ${percentage}% on a quiz about the following topics.
Weak topics (below 60%): ${weakTopics.join(', ')}

Generate exactly 3-4 short, specific, actionable study recommendations to improve on these weak topics.

Return ONLY a JSON array of strings — no markdown, no commentary:
["<recommendation 1>", "<recommendation 2>", "<recommendation 3>"]
`.trim();

      const aiRecs = await callGemini(prompt, 15000);
      recommendations = Array.isArray(aiRecs) ? aiRecs : [
        ...weakTopics.map((t) => `Review and practise: ${t}`),
        'Retake the quiz after revision.',
      ];
    } catch {
      // If AI call fails, fall back to sensible defaults — do not expose error
      recommendations = [
        ...weakTopics.map((t) => `Review and practise: ${t}`),
        'Retake the quiz after revision.',
      ];
    }
  }

  return {
    score: correct,
    percentage,
    correctAnswers: correct,
    incorrectAnswers: incorrect,
    total,
    weakTopics,
    recommendations,
  };
}

// ── Exports ───────────────────────────────────────────────────────────────────

module.exports = { generateStudyPlan, generateNotes, generateQuiz, evaluateQuiz };
