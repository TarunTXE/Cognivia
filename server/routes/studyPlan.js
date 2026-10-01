const { Router } = require('express');
const validate = require('../middleware/validate');
const { createStudyPlan } = require('../controllers/studyPlanController');

const router = Router();

const rules = {
  subject:    { required: true, type: 'string' },
  topic:      { required: true, type: 'string' },
  difficulty: {
    required: true,
    type: 'string',
    allowedValues: ['Beginner', 'Intermediate', 'Advanced'],
  },
  goal: {
    required: true,
    type: 'string',
    allowedValues: ['Exam Preparation', 'Interview Preparation', 'Concept Learning', 'Revision'],
  },
  duration: { required: true, type: 'number', min: 1, max: 30 },
};

router.post(
  '/',
  (req, _res, next) => {
    if (typeof req.body.duration === 'string') {
      const parsed = parseInt(req.body.duration, 10);
      if (!isNaN(parsed)) {
        req.body.duration = parsed;
      }
    }
    next();
  },
  validate(rules),
  createStudyPlan
);

module.exports = router;
