const aiService = require('../services/aiService');
const { success } = require('../utils/response');

/**
 * POST /api/notes
 * Body: { topic, difficulty }
 */
async function createNotes(req, res, next) {
  try {
    const { topic, difficulty } = req.body;
    const notes = await aiService.generateNotes({ topic, difficulty });
    return success(res, notes, 201);
  } catch (err) {
    next(err);
  }
}

module.exports = { createNotes };
