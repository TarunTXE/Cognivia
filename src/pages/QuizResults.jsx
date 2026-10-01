import { useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { mockQuizQuestions } from '../data/mockData';
import { calculateScore, getWeakTopics } from '../utils/helpers';
import { saveQuizResult } from '../utils/storage';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';

function ScoreRing({ percentage, color }) {
  const r = 45;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (percentage / 100) * circumference;

  const strokeColors = {
    green:  '#10b981',
    yellow: '#f59e0b',
    red:    '#ef4444',
  };

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={strokeColors[color]}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-2xl font-extrabold ${
          color === 'green' ? 'text-emerald-600' : color === 'yellow' ? 'text-amber-600' : 'text-red-500'
        }`}>{percentage}%</span>
      </div>
    </div>
  );
}

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();

  const answers = location.state?.answers || {};
  const questions = location.state?.questions || mockQuizQuestions;
  const evaluation = location.state?.evaluation;
  const topic = location.state?.topic || questions[0]?.topic || '';
  const subject = location.state?.subject || '';

  // Use evaluation from API if available; fallback to local calculation
  const score = evaluation
    ? {
        correct: evaluation.correctAnswers ?? evaluation.score,
        incorrect: evaluation.incorrectAnswers ?? ((evaluation.total || questions.length) - (evaluation.correctAnswers ?? evaluation.score)),
        total: evaluation.total ?? questions.length,
        percentage: evaluation.percentage ?? Math.round(((evaluation.score || 0) / (evaluation.total || questions.length || 1)) * 100),
      }
    : calculateScore(answers, questions);

  const weakTopics = evaluation?.weakTopics || getWeakTopics(answers, questions);
  const recommendations = evaluation?.recommendations || [];

  const savedRef = useRef(false);
  useEffect(() => {
    if (savedRef.current) return;
    if (Object.keys(answers).length > 0 || evaluation) {
      savedRef.current = true;
      saveQuizResult({
        topic: topic || questions[0]?.topic || 'General Quiz',
        subject: subject,
        score: score.correct,
        totalQuestions: score.total,
        percentage: score.percentage,
        completedAt: new Date().toISOString(),
        weakTopics: Array.isArray(weakTopics) ? weakTopics : [],
        recommendations: Array.isArray(recommendations) ? recommendations : [],
      });
    }
  }, [answers, evaluation, topic, subject, score.correct, score.total, score.percentage, weakTopics, recommendations, questions]);

  const getScoreColor = (pct) => {
    if (pct >= 80) return { color: 'green',  badge: 'green',  label: 'Excellent',   bg: 'bg-emerald-50', border: 'border-emerald-200' };
    if (pct >= 60) return { color: 'yellow', badge: 'yellow', label: 'Good',         bg: 'bg-amber-50',   border: 'border-amber-200' };
    return           { color: 'red',    badge: 'red',    label: 'Needs Work',  bg: 'bg-red-50',     border: 'border-red-200' };
  };

  const colors = getScoreColor(score.percentage);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Quiz Assessment
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Quiz Results</h1>
          {topic && (
            <p className="mt-1 text-indigo-600 font-semibold text-sm">{topic}</p>
          )}
          <p className="mt-1 text-slate-500 text-sm">Here's a breakdown of your performance.</p>
        </div>

        {/* Score hero card */}
        <Card className={`mb-8 border ${colors.border} ${colors.bg}`}>
          <div className="flex flex-col sm:flex-row items-center gap-6 py-3">
            {/* Ring */}
            <div className="flex-shrink-0">
              <ScoreRing percentage={score.percentage} color={colors.color} />
            </div>

            {/* Score info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                <Badge variant={colors.badge} className="text-sm px-3 py-1">{colors.label}</Badge>
                {evaluation && (
                  <Badge variant="indigo" className="text-xs">
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1" />
                    </svg>
                    AI Evaluated
                  </Badge>
                )}
              </div>
              <p className="text-2xl font-extrabold text-slate-900 mb-1">
                {score.correct} / {score.total} correct
              </p>
              <p className="text-slate-500 text-sm">
                {score.incorrect === 0
                  ? 'Perfect score — outstanding work!'
                  : `${score.incorrect} question${score.incorrect !== 1 ? 's' : ''} to review`}
              </p>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-4 flex-shrink-0 w-full sm:w-auto">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-emerald-600">{score.correct}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-red-500">{score.incorrect}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-slate-700">{score.total}</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Total</div>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

          {/* Answer breakdown */}
          <Card>
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Answer Breakdown
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, i) => {
                const userAnswer = answers[i];
                const correctIdx = typeof q.correctAnswer === 'number' ? q.correctAnswer : (typeof q.correct === 'number' ? q.correct : 0);
                const isCorrect = userAnswer === correctIdx;
                return (
                  <div key={q.id || i} className={`flex items-start gap-3 p-3 rounded-xl text-xs ${
                    isCorrect ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'
                  }`}>
                    <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 font-bold ${
                      isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <div>
                      <p className="text-slate-800 font-medium leading-snug mb-0.5">
                        Q{i + 1}: {q.question?.length > 65 ? q.question.slice(0, 65) + '…' : q.question}
                      </p>
                      {!isCorrect && (
                        <p className="text-slate-500">
                          Correct: <span className="font-semibold text-emerald-700">{q.options?.[correctIdx]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Weak topics + Recommendations */}
          <div className="space-y-5">
            <Card>
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Weak Topics
              </h2>
              {weakTopics.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {weakTopics.map((t) => (
                    <Badge key={t} variant="red">{t}</Badge>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2.5">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  No weak topics detected — great work!
                </div>
              )}
            </Card>

            <Card>
              <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1" />
                </svg>
                Recommended Revision
              </h2>
              {recommendations.length > 0 ? (
                <ul className="space-y-2.5">
                  {recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                        </svg>
                      </span>
                      <span>{typeof rec === 'string' ? rec : rec.text || JSON.stringify(rec)}</span>
                    </li>
                  ))}
                </ul>
              ) : weakTopics.length > 0 ? (
                <ul className="space-y-2.5">
                  {weakTopics.map((t) => (
                    <li key={t} className="flex items-center gap-2.5 text-sm text-slate-600">
                      <span className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                        <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
                        </svg>
                      </span>
                      Review notes on {t}
                    </li>
                  ))}
                  <li className="flex items-center gap-2.5 text-sm text-slate-600">
                    <span className="w-5 h-5 bg-indigo-100 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </span>
                    Retake this quiz after revision
                  </li>
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Try the next topic to keep progressing.</p>
              )}
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={() => navigate('/quiz', { state: { topic } })} variant="secondary" className="flex-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Quiz
          </Button>
          <Link to="/notes" state={{ topic }} className="flex-1">
            <Button variant="outline" className="w-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
              </svg>
              Review Notes
            </Button>
          </Link>
          <Link to="/planner" className="flex-1">
            <Button className="w-full">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Study Plan
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
