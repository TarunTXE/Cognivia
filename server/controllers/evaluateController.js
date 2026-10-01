const aiService = require('../services/aiService');
const { success } = require('../utils/response');

/**
 * POST /api/evaluate
 * Body: { answers: { [questionIndex]: selectedOptionIndex }, questions: [] }
 */
async function evaluateQuiz(req, res, next) {
  try {
    const { answers, questions } = req.body;
    const result = await aiService.evaluateQuiz({ answers, questions });
    return success(res, result);
  } catch (err) {
    next(err);
  }
}

module.exports = { evaluateQuiz };
