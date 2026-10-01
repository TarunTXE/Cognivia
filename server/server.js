require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');

const errorHandler = require('./middleware/errorHandler');
const studyPlanRouter = require('./routes/studyPlan');
const notesRouter = require('./routes/notes');
const quizRouter = require('./routes/quiz');
const evaluateRouter = require('./routes/evaluate');

// ── App setup ─────────────────────────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 5000;

// ── CORS ──────────────────────────────────────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', environment: process.env.NODE_ENV || 'development' });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/study-plan', studyPlanRouter);
app.use('/api/notes',      notesRouter);
app.use('/api/quiz',       quizRouter);
app.use('/api/evaluate',   evaluateRouter);

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// ── Centralized error handler (must be last) ──────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Cognivia API server running`);
  console.log(`   Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   CORS origin : ${process.env.CLIENT_ORIGIN || 'http://localhost:5173'}`);
  console.log(`\n   Endpoints:`);
  console.log(`     POST /api/study-plan`);
  console.log(`     POST /api/notes`);
  console.log(`     POST /api/quiz`);
  console.log(`     POST /api/evaluate`);
  console.log(`      GET /health\n`);
});

module.exports = app; // export for testing
