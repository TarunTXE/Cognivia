import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import FormField, { Input, Select } from '../components/FormField';
import { cn } from '../utils/helpers';
import { generateQuiz, evaluateQuiz } from '../services/api';

export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();

  const [topic, setTopic] = useState(location.state?.topic || '');
  const [difficulty, setDifficulty] = useState(location.state?.difficulty || '');
  const [numQuestions, setNumQuestions] = useState('5');
  const [questions, setQuestions] = useState(location.state?.questions || null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [attempted, setAttempted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleGenerateQuiz = async () => {
    const e = {};
    if (!topic.trim()) e.topic = 'Please enter a topic.';
    if (!difficulty) e.difficulty = 'Please select a difficulty level.';
    if (Object.keys(e).length > 0) {
      setErrors(e);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const data = await generateQuiz({
        topic: topic.trim(),
        difficulty,
        numQuestions: Number(numQuestions) || 5,
      });

      const normalizedQuestions = (data.questions || []).map((q, idx) => ({
        ...q,
        id: q.id || idx + 1,
        correct: typeof q.correctAnswer === 'number' ? q.correctAnswer : q.correct ?? 0,
        correctAnswer: typeof q.correctAnswer === 'number' ? q.correctAnswer : q.correct ?? 0,
        topic: q.topic || topic.trim(),
      }));

      setQuestions(normalizedQuestions);
      setCurrent(0);
      setAnswers({});
      setAttempted(false);
    } catch (err) {
      setErrors({
        general: err.message || 'Failed to generate quiz. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx) => {
    setAnswers((prev) => ({ ...prev, [current]: idx }));
    setAttempted(false);
  };

  const handleNext = () => {
    if (answers[current] === undefined) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    setCurrent((p) => Math.min(p + 1, (questions?.length || 1) - 1));
  };

  const handlePrev = () => {
    setAttempted(false);
    setCurrent((p) => Math.max(p - 1, 0));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const evaluation = await evaluateQuiz({
        answers,
        questions,
      });
      navigate('/results', {
        state: {
          answers,
          questions,
          evaluation,
          topic: topic || questions[0]?.topic,
          subject: location.state?.subject || '',
        },
      });
    } catch {
      // If evaluation endpoint fails, still navigate and let results calculate locally
      navigate('/results', {
        state: {
          answers,
          questions,
          topic: topic || questions[0]?.topic,
          subject: location.state?.subject || '',
        },
      });
    } finally {
      setSubmitting(false);
    }
  };

  const question = questions?.[current];
  const total = questions?.length || 0;
  const progress = total > 0 ? Math.round(((current + 1) / total) * 100) : 0;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Practice Quiz
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Test Your Knowledge
          </h1>
          <p className="mt-2 text-slate-500 text-sm">Answer carefully — results help identify where to focus.</p>
        </div>

        {/* Error banner */}
        {errors.general && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-medium text-red-800">Quiz Generation Failed</p>
              <p className="mt-0.5 text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Setup Card when no questions loaded */}
        {!questions && (
          <Card className="mb-8 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Configure Your Quiz</h2>
            <p className="text-sm text-slate-500 mb-6">Enter any topic and level to generate a custom AI quiz.</p>

            <div className="space-y-4">
              <FormField label="Topic" id="topic" required error={errors.topic}>
                <Input
                  id="topic"
                  placeholder="e.g. CPU Scheduling"
                  value={topic}
                  onChange={(e) => {
                    setTopic(e.target.value);
                    if (errors.topic || errors.general) setErrors((p) => ({ ...p, topic: undefined, general: undefined }));
                  }}
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Difficulty" id="diff" required error={errors.difficulty}>
                  <Select
                    id="diff"
                    value={difficulty}
                    onChange={(e) => {
                      setDifficulty(e.target.value);
                      if (errors.difficulty || errors.general) setErrors((p) => ({ ...p, difficulty: undefined, general: undefined }));
                    }}
                  >
                    <option value="">Select level</option>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                  </Select>
                </FormField>

                <FormField label="Number of Questions" id="count">
                  <Select
                    id="count"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(e.target.value)}
                  >
                    <option value="3">3 Questions</option>
                    <option value="5">5 Questions</option>
                    <option value="8">8 Questions</option>
                    <option value="10">10 Questions</option>
                  </Select>
                </FormField>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button onClick={handleGenerateQuiz} disabled={loading} size="md" className="w-full">
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Generating Quiz…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" />
                      </svg>
                      Generate AI Quiz
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Active Quiz Card */}
        {questions && question && (
          <>
            {/* Progress section */}
            <div className="mb-6">
              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-1.5 mb-3">
                <div
                  className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-700">
                    Question <span className="text-indigo-600">{current + 1}</span> of {total}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>
                    <span className="font-semibold text-emerald-600">{answeredCount}</span> answered
                  </span>
                  <span>
                    <span className="font-semibold text-slate-500">{total - answeredCount}</span> remaining
                  </span>
                  <button
                    onClick={() => setQuestions(null)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium underline ml-2"
                  >
                    Change Quiz
                  </button>
                </div>
              </div>
            </div>

            {/* Question card */}
            <Card className="mb-5 shadow-md">
              {/* Topic badge */}
              <div className="flex items-center justify-between gap-3 mb-5">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {question.topic}
                </span>
                <span className="text-xs text-slate-400 font-medium">Q{current + 1}/{total}</span>
              </div>

              {/* Question text */}
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 leading-snug mb-7">
                {question.question}
              </h2>

              {/* Answer options */}
              <div className="space-y-3">
                {question.options.map((opt, idx) => {
                  const selected = answers[current] === idx;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      className={cn(
                        'w-full text-left px-4 py-3.5 border rounded-xl text-sm transition-all duration-150 group',
                        selected
                          ? 'border-indigo-500 bg-indigo-50 text-slate-900 shadow-sm'
                          : 'border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-slate-50',
                      )}
                    >
                      <span className="flex items-center gap-3">
                        <span className={cn(
                          'inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold flex-shrink-0 transition-all duration-150',
                          selected
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600',
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className={selected ? 'font-medium' : ''}>{opt}</span>
                        {selected && (
                          <svg className="w-4 h-4 text-indigo-600 ml-auto flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {attempted && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  Please select an answer before continuing.
                </div>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="secondary"
                onClick={handlePrev}
                disabled={current === 0}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Button>

              {/* Question dot navigation */}
              <div className="flex gap-1.5 flex-wrap justify-center flex-1">
                {questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setAttempted(false); setCurrent(i); }}
                    className={cn(
                      'w-7 h-7 rounded-lg text-xs font-semibold transition-all duration-150',
                      i === current
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : answers[i] !== undefined
                        ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                        : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-200 hover:bg-slate-50',
                    )}
                    title={`Question ${i + 1}${answers[i] !== undefined ? ' (answered)' : ''}`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              {current < total - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={answeredCount < total || submitting}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Evaluating…
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0" />
                      </svg>
                      Submit Quiz
                    </>
                  )}
                </Button>
              )}
            </div>

            {answeredCount < total && current === total - 1 && (
              <p className="mt-4 text-xs text-center text-slate-500">
                {total - answeredCount} question{total - answeredCount !== 1 ? 's' : ''} still unanswered — answer all to submit.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
