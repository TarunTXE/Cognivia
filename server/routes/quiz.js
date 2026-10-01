const { Router } = require('express');
const validate = require('../middleware/validate');
const { createQuiz } = require('../controllers/quizController');

const router = Router();

const rules = {
  topic:      { required: true, type: 'string' },
  difficulty: {
    required: true,
    type: 'string',
    allowedValues: ['Beginner', 'Intermediate', 'Advanced'],
  },
  numQuestions: { required: false, type: 'number', min: 1, max: 10 },
};

router.post('/', validate(rules), createQuiz);

module.exports = router;
