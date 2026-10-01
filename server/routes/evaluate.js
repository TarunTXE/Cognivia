const { Router } = require('express');
const validate = require('../middleware/validate');
const { evaluateQuiz } = require('../controllers/evaluateController');

const router = Router();

const rules = {
  answers:   { required: true },       // object — validated by controller logic
  questions: { required: true, type: 'array' },
};

router.post('/', validate(rules), evaluateQuiz);

module.exports = router;
