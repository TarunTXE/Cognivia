const aiService = require('../services/aiService');
const { success } = require('../utils/response');

/**
 * POST /api/study-plan
 * Body: { subject, topic, difficulty, goal, duration, dailyTime? }
 */
async function createStudyPlan(req, res, next) {
  try {
    const { subject, topic, difficulty, goal, duration, dailyTime } = req.body;
    const plan = await aiService.generateStudyPlan({
      subject,
      topic,
      difficulty,
      goal,
      duration,
      dailyTime,
    });
    return success(res, plan, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { createStudyPlan };
