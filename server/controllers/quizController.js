const aiService = require('../services/aiService');
const { success } = require('../utils/response');

/**
 * POST /api/quiz
 * Body: { topic, difficulty, numQuestions? }
 */
async function createQuiz(req, res, next) {
  try {
    const { topic, difficulty, numQuestions } = req.body;
    const quiz = await aiService.generateQuiz({ topic, difficulty, numQuestions });
    return success(res, quiz, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { createQuiz };
