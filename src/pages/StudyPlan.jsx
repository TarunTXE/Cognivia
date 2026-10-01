import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { getActiveStudyPlan, saveActiveStudyPlan, deleteActiveStudyPlan, toggleDayCompletion } from '../utils/storage';

const statusConfig = {
  completed:     { badge: 'green',   label: 'Completed',   dot: 'bg-emerald-500', ring: 'border-emerald-200 bg-emerald-50/70' },
  'in-progress': { badge: 'indigo',  label: 'In Progress', dot: 'bg-indigo-500',  ring: 'border-indigo-300 bg-indigo-50/50' },
  upcoming:      { badge: 'default', label: 'Upcoming',    dot: 'bg-slate-300',   ring: 'border-slate-200 bg-white' },
};

export default function StudyPlan() {
  const location = useLocation();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(() => {
    if (location.state?.plan) {
      return location.state.plan;
    }
    return getActiveStudyPlan();
  });

  useEffect(() => {
    if (location.state?.plan) {
      setPlan(location.state.plan);
    }
  }, [location.state?.plan]);

  const handleDeletePlan = () => {
    const confirmed = window.confirm('Are you sure you want to delete this study plan?');
    if (!confirmed) return;

    deleteActiveStudyPlan();
    setPlan(null);
    navigate('/dashboard');
  };

  const handleToggleDay = (dayNum) => {
    const updated = toggleDayCompletion(dayNum);
    if (updated) {
      setPlan(updated);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <Card className="p-8 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Study Plan</h2>
            <p className="text-sm text-slate-500 mb-6">
              You do not have an active study plan. Create one with the AI planner to get a personalized roadmap.
            </p>
            <Link to="/planner">
              <Button className="w-full">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Study Plan
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    );
  }

  const isAiGenerated = Boolean(plan.generatedAt || location.state?.plan || !plan.isDemo);
  const dailySchedule = Array.isArray(plan.dailySchedule) ? plan.dailySchedule : [];
  const learningObjectives = Array.isArray(plan.learningObjectives) ? plan.learningObjectives : [];
  const keyConcepts = Array.isArray(plan.keyConcepts) ? plan.keyConcepts : [];

  const completedDays = Array.isArray(plan.completedDays)
    ? plan.completedDays
    : dailySchedule.filter((d) => d.status === 'completed').map((d) => d.day);

  const totalDays = Number(plan.duration) || dailySchedule.length || 1;
  const progressPct = Math.round((completedDays.length / totalDays) * 100);
  const isPlanCompleted = totalDays > 0 && completedDays.length >= totalDays;

  // Identify next uncompleted day
  const nextIncompleteDay = dailySchedule.find((d) => !completedDays.includes(d.day));

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="indigo">{plan.subject}</Badge>
              {plan.goal && <Badge variant="default">{plan.goal}</Badge>}
              {isPlanCompleted ? (
                <Badge variant="green">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Completed
                </Badge>
              ) : isAiGenerated ? (
                <Badge variant="indigo">
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1" />
                  </svg>
                  AI Generated
                </Badge>
              ) : (
                <Badge variant="default">Demo Plan</Badge>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {plan.topic}
            </h1>
            <p className="mt-1.5 text-slate-500 text-sm">
              {totalDays}-day plan · {plan.dailyStudyTime || '1 hour'}/day · {plan.difficulty}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap flex-shrink-0">
            <Link to="/notes" state={{ topic: plan.topic, difficulty: plan.difficulty, subject: plan.subject }}>
              <Button variant="secondary" size="sm">Generate Notes</Button>
            </Link>
            <Link to="/quiz" state={{ topic: plan.topic, difficulty: plan.difficulty, subject: plan.subject }}>
              <Button size="sm">Take Quiz</Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeletePlan}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            >
              <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete Study Plan
            </Button>
          </div>
        </div>

        {/* Completion Celebration Banner */}
        {isPlanCompleted && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 font-bold">
                ✓
              </span>
              <div>
                <h3 className="text-sm font-bold text-emerald-900">Study Plan Completed! 🎉</h3>
                <p className="text-xs text-emerald-700">You have completed all {totalDays} study days for {plan.topic}. Test your knowledge with a quiz!</p>
              </div>
            </div>
            <Link to="/quiz" state={{ topic: plan.topic, difficulty: plan.difficulty, subject: plan.subject }} className="flex-shrink-0">
              <Button size="sm">Take Quiz</Button>
            </Link>
          </div>
        )}

        {/* Overview metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Difficulty',   value: plan.difficulty || 'Intermediate', color: 'text-violet-700',  bg: 'bg-violet-50' },
            { label: 'Duration',     value: `${totalDays} days`,                color: 'text-indigo-700',  bg: 'bg-indigo-50' },
            { label: 'Daily Time',   value: plan.dailyStudyTime || '1 hour',   color: 'text-sky-700',     bg: 'bg-sky-50' },
            { label: 'Total Hours',  value: `${plan.estimatedTotalHours || (totalDays * 2)}h`, color: 'text-emerald-700', bg: 'bg-emerald-50' },
          ].map((item) => (
            <Card key={item.label} className={`text-center border-slate-200 ${item.bg}`}>
              <div className={`text-xl font-extrabold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-slate-500 mt-0.5 font-medium">{item.label}</div>
            </Card>
          ))}
        </div>

        {/* Progress bar */}
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-semibold text-slate-900">Overall Progress</h2>
              {isPlanCompleted ? (
                <p className="text-xs text-emerald-600 font-medium mt-0.5">
                  All {totalDays} days completed · Great job!
                </p>
              ) : nextIncompleteDay ? (
                <p className="text-xs text-slate-500 mt-0.5">
                  Currently on: <span className="font-medium text-indigo-700">Day {nextIncompleteDay.day} — {nextIncompleteDay.title}</span>
                </p>
              ) : (
                <p className="text-xs text-slate-500 mt-0.5">Plan in progress</p>
              )}
            </div>
            <div className="text-right">
              <span className="text-2xl font-extrabold text-indigo-600">{progressPct}%</span>
              <p className="text-xs text-slate-500">{completedDays.length}/{totalDays} days done</p>
            </div>
          </div>
          <ProgressBar value={progressPct} max={100} showLabel={false} color={isPlanCompleted ? 'green' : 'indigo'} />
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Daily Schedule — timeline style */}
          <div className="lg:col-span-2">
            <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Daily Schedule
            </h2>
            <div className="space-y-3">
              {dailySchedule.map((day, idx) => {
                const isCompleted = completedDays.includes(day.day);
                const isInProgress = !isCompleted && nextIncompleteDay?.day === day.day;
                const statusKey = isCompleted ? 'completed' : isInProgress ? 'in-progress' : 'upcoming';
                const cfg = statusConfig[statusKey];

                return (
                  <div key={day.day} className="relative">
                    {/* Timeline connector */}
                    {idx < dailySchedule.length - 1 && (
                      <div className="absolute left-[15px] top-[36px] bottom-[-12px] w-0.5 bg-slate-200" />
                    )}
                    <div className={`relative flex items-start gap-4 p-4 border rounded-xl transition-all duration-150 hover:shadow-sm ${cfg.ring}`}>
                      {/* Day circle */}
                      <button
                        type="button"
                        onClick={() => handleToggleDay(day.day)}
                        title={isCompleted ? 'Click to mark incomplete' : 'Click to mark complete'}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 cursor-pointer transition-transform hover:scale-105 ${
                          isCompleted
                            ? 'bg-emerald-500 text-white'
                            : isInProgress
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white border-2 border-slate-300 text-slate-500 hover:border-indigo-400'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : day.day}
                      </button>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900">
                              Day {day.day}: {day.title}
                            </h3>
                            <span className="text-xs text-slate-400 font-medium">{day.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Badge variant={cfg.badge}>{cfg.label}</Badge>
                            {/* Clear Mark Complete / Completed ✓ action button */}
                            <button
                              type="button"
                              onClick={() => handleToggleDay(day.day)}
                              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all duration-150 flex items-center gap-1 cursor-pointer border ${
                                isCompleted
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              }`}
                              title={isCompleted ? 'Click to mark incomplete' : 'Mark this day as complete'}
                            >
                              {isCompleted ? (
                                <span>Completed ✓</span>
                              ) : (
                                <>
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span>Mark Complete</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                        {Array.isArray(day.topics) && day.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {day.topics.map((t) => (
                              <span key={t} className="text-xs bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {/* Learning objectives */}
            {learningObjectives.length > 0 && (
              <Card>
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                  </svg>
                  Learning Objectives
                </h2>
                <ul className="space-y-2.5">
                  {learningObjectives.map((obj) => (
                    <li key={obj} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-2.5 h-2.5 text-indigo-600" fill="currentColor" viewBox="0 0 8 8">
                          <circle cx="4" cy="4" r="3" />
                        </svg>
                      </span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Key concepts */}
            {keyConcepts.length > 0 && (
              <Card>
                <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Key Concepts
                </h2>
                <div className="flex flex-wrap gap-2">
                  {keyConcepts.map((concept) => (
                    <Badge key={concept} variant="indigo">{concept}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex flex-col gap-3">
              <Link to="/notes" state={{ topic: plan.topic, difficulty: plan.difficulty, subject: plan.subject }} className="block">
                <Button variant="outline" className="w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                  </svg>
                  Generate AI Notes
                </Button>
              </Link>
              <Link to="/quiz" state={{ topic: plan.topic, difficulty: plan.difficulty, subject: plan.subject }} className="block">
                <Button className="w-full">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Take Quiz
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
