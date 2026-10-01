const { Router } = require('express');
const validate = require('../middleware/validate');
const { createNotes } = require('../controllers/notesController');

const router = Router();

const rules = {
  topic:      { required: true, type: 'string' },
  difficulty: {
    required: true,
    type: 'string',
    allowedValues: ['Beginner', 'Intermediate', 'Advanced'],
  },
};

router.post('/', validate(rules), createNotes);

module.exports = router;
