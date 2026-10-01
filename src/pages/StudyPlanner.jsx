import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import FormField, { Input, Select } from '../components/FormField';
import { generateStudyPlan } from '../services/api';
import { getActiveStudyPlan, saveActiveStudyPlan } from '../utils/storage';

const INITIAL = {
  subject: '',
  topic: '',
  duration: '',
  difficulty: '',
  goal: '',
  dailyTime: '',
};

const difficultyMeta = {
  Beginner:     { emoji: '🌱', desc: 'Just starting out' },
  Intermediate: { emoji: '⚡', desc: 'Some experience' },
  Advanced:     { emoji: '🔥', desc: 'Deep mastery' },
};

const dailyTimeOpts = [
  { value: '30 min',   label: '30 min',   sub: 'Quick sessions' },
  { value: '1 hour',   label: '1 hour',   sub: 'Focused study' },
  { value: '2 hours',  label: '2 hours',  sub: 'Deep work' },
  { value: '3+ hours', label: '3+ hours', sub: 'Intensive' },
];

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Check for active plan from localStorage
  const [activePlan, setActivePlan] = useState(() => getActiveStudyPlan());

  useEffect(() => {
    const handleStorageChange = () => {
      setActivePlan(getActiveStudyPlan());
    };
    window.addEventListener('storage', handleStorageChange);
    setActivePlan(getActiveStudyPlan());
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const planStats = useMemo(() => {
    if (!activePlan) return null;
    const schedule = Array.isArray(activePlan.dailySchedule) ? activePlan.dailySchedule : [];
    const totalDays = Number(activePlan.duration) || schedule.length || 1;
    const completedDays = Array.isArray(activePlan.completedDays)
      ? activePlan.completedDays
      : schedule.filter((d) => d.status === 'completed').map((d) => d.day);
    const completedCount = completedDays.length;
    const progress = Math.round((completedCount / totalDays) * 100);

    return {
      subject: activePlan.subject || 'General',
      topic: activePlan.topic || 'Active Plan',
      difficulty: activePlan.difficulty || 'Intermediate',
      goal: activePlan.goal || '',
      duration: totalDays,
      dailyStudyTime: activePlan.dailyStudyTime || '1 hour',
      progress,
      completedCount,
      totalDays,
      isCompleted: totalDays > 0 && completedCount >= totalDays,
    };
  }, [activePlan]);

  const validate = () => {
    const e = {};
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.topic.trim()) e.topic = 'Topic is required.';
    if (!form.duration) e.duration = 'Please select a duration.';
    if (!form.difficulty) e.difficulty = 'Please select a difficulty level.';
    if (!form.goal) e.goal = 'Please select your learning goal.';
    if (!form.dailyTime) e.dailyTime = 'Please select your daily study time.';
    return e;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field] || apiError) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setApiError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) {
      setErrors(e2);
      return;
    }

    setLoading(true);
    setApiError(null);
    try {
      const plan = await generateStudyPlan({
        subject: form.subject.trim(),
        topic: form.topic.trim(),
        difficulty: form.difficulty,
        goal: form.goal,
        duration: Number(form.duration),
        dailyTime: form.dailyTime,
      });

      const planWithMeta = {
        ...plan,
        subject: plan.subject || form.subject.trim(),
        topic: plan.topic || form.topic.trim(),
        difficulty: plan.difficulty || form.difficulty,
        goal: plan.goal || form.goal,
        duration: Number(plan.duration) || Number(form.duration),
        dailyStudyTime: plan.dailyStudyTime || form.dailyTime,
        completedDays: [],
        progress: 0,
        generatedAt: new Date().toISOString(),
      };

      saveActiveStudyPlan(planWithMeta);
      setActivePlan(planWithMeta);
      navigate('/plan', { state: { plan: planWithMeta, formData: form } });
    } catch (err) {
      setApiError(err.message || 'Failed to generate study plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isComplete = form.subject && form.topic && form.duration && form.difficulty && form.goal && form.dailyTime;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Current Active Plan Card */}
        {planStats && (
          <Card className="mb-10 border-indigo-200 bg-white shadow-md">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${planStats.isCompleted ? 'bg-emerald-500' : 'bg-emerald-500 animate-pulse'}`} />
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                  Current Study Plan
                </span>
                {planStats.isCompleted ? (
                  <Badge variant="green">Completed ✓</Badge>
                ) : (
                  <Badge variant="indigo">Active</Badge>
                )}
              </div>
              <Badge variant="default">{planStats.subject}</Badge>
            </div>

            <div className="mb-4">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {planStats.topic}
              </h2>
              <p className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-semibold text-slate-700">{planStats.difficulty}</span>
                {planStats.goal && (
                  <>
                    <span>·</span>
                    <span>{planStats.goal}</span>
                  </>
                )}
                <span>·</span>
                <span>{planStats.duration} {planStats.duration === 1 ? 'day' : 'days'}</span>
                <span>·</span>
                <span>{planStats.dailyStudyTime}</span>
              </p>
            </div>

            {/* Progress section */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-700">Progress</span>
                <span className="font-extrabold text-indigo-600">
                  {planStats.progress}% · {planStats.completedCount}/{planStats.totalDays} days completed
                </span>
              </div>
              <ProgressBar
                value={planStats.progress}
                max={100}
                showLabel={false}
                color={planStats.isCompleted ? 'green' : 'indigo'}
              />
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/plan" state={{ plan: activePlan }} className="flex-1">
                <Button className="w-full justify-center">
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  Continue Plan
                </Button>
              </Link>
              <Button
                variant="secondary"
                className="flex-1 justify-center"
                onClick={() => {
                  const formEl = document.getElementById('planner-form');
                  if (formEl) {
                    formEl.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Plan
              </Button>
            </div>
          </Card>
        )}

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs font-semibold mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            AI Study Planner
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Tell Cognivia what<br className="hidden sm:block" /> you want to learn
          </h1>
          <p className="mt-3 text-slate-500 text-base leading-relaxed">
            Fill in your details and we'll build a personalized study plan in seconds.
          </p>
        </div>

        <Card id="planner-form" className="shadow-md">
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 flex items-start gap-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-red-800">Generation Failed</p>
                <p className="mt-0.5 text-red-700">{apiError}</p>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} noValidate className="space-y-7">

            {/* Subject + Topic */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <FormField label="Subject" id="subject" required error={errors.subject}
                hint="e.g. Computer Science, Mathematics">
                <Input
                  id="subject"
                  placeholder="Computer Science"
                  value={form.subject}
                  onChange={handleChange('subject')}
                />
              </FormField>
              <FormField label="Topic" id="topic" required error={errors.topic}
                hint="The specific topic to study">
                <Input
                  id="topic"
                  placeholder="Data Structures & Algorithms"
                  value={form.topic}
                  onChange={handleChange('topic')}
                />
              </FormField>
            </div>

            {/* Duration */}
            <FormField label="Available Duration" id="duration" required error={errors.duration}>
              <Select id="duration" value={form.duration} onChange={handleChange('duration')}>
                <option value="">Select duration</option>
                <option value="1">1 Day — Quick sprint</option>
                <option value="3">3 Days — Short focus</option>
                <option value="5">5 Days — One week</option>
                <option value="7">7 Days — Deep dive</option>
                <option value="14">14 Days — Full mastery</option>
              </Select>
            </FormField>

            {/* Difficulty */}
            <FormField label="Difficulty Level" id="difficulty" required>
              <div className="grid grid-cols-3 gap-3" role="group" aria-label="Difficulty">
                {Object.entries(difficultyMeta).map(([level, meta]) => (
                  <label
                    key={level}
                    className={`flex flex-col items-center justify-center p-4 border rounded-xl cursor-pointer transition-all text-sm font-medium select-none ${
                      form.difficulty === level
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={form.difficulty === level}
                      onChange={handleChange('difficulty')}
                      className="sr-only"
                    />
                    <span className="text-2xl mb-1.5">{meta.emoji}</span>
                    <span className="font-semibold">{level}</span>
                    <span className="text-xs mt-0.5 text-slate-400 font-normal">{meta.desc}</span>
                  </label>
                ))}
              </div>
              {errors.difficulty && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.difficulty}
                </p>
              )}
            </FormField>

            {/* Goal */}
            <FormField label="Learning Goal" id="goal" required error={errors.goal}>
              <Select id="goal" value={form.goal} onChange={handleChange('goal')}>
                <option value="">Select your goal</option>
                <option value="Exam Preparation">Exam Preparation</option>
                <option value="Interview Preparation">Interview Preparation</option>
                <option value="Concept Learning">Concept Learning</option>
                <option value="Revision">Revision</option>
              </Select>
            </FormField>

            {/* Daily Study Time */}
            <FormField label="Daily Study Time" id="dailyTime" required>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Daily study time">
                {dailyTimeOpts.map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col items-center justify-center p-3.5 border rounded-xl cursor-pointer transition-all select-none ${
                      form.dailyTime === opt.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="dailyTime"
                      value={opt.value}
                      checked={form.dailyTime === opt.value}
                      onChange={handleChange('dailyTime')}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">{opt.label}</span>
                    <span className="text-xs mt-0.5 text-slate-400 font-normal">{opt.sub}</span>
                  </label>
                ))}
              </div>
              {errors.dailyTime && (
                <p className="text-xs text-red-600 flex items-center gap-1 mt-1.5">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.dailyTime}
                </p>
              )}
            </FormField>

            {/* Preview summary */}
            {isComplete && (
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-2">Your Plan Summary</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'Subject', value: form.subject },
                    { label: 'Topic', value: form.topic },
                    { label: 'Duration', value: `${form.duration} day${form.duration === '1' ? '' : 's'}` },
                    { label: 'Difficulty', value: form.difficulty },
                    { label: 'Goal', value: form.goal },
                    { label: 'Daily time', value: form.dailyTime },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-indigo-500 font-medium">{item.label}</p>
                      <p className="text-sm text-indigo-900 font-semibold leading-tight">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-1">
              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <svg className="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Generating Study Plan…
                  </>
                ) : (
                  <>
                    Generate My Study Plan
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
