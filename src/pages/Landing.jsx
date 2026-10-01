import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Footer from '../components/Footer';
import { getActiveStudyPlan, getPlanStats, PLAN_UPDATED_EVENT } from '../utils/storage';

const features = [
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    color: 'indigo',
    title: 'Personalized Study Plans',
    description: 'Get a day-by-day study schedule tailored to your subject, timeline, and learning goal.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    color: 'violet',
    title: 'AI-Powered Notes',
    description: 'Generate concise, structured study notes covering key concepts, definitions, and examples.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: 'emerald',
    title: 'Practice Quizzes',
    description: 'Test your knowledge with topic-specific quizzes and get immediate, actionable feedback.',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'sky',
    title: 'Learning Insights',
    description: 'Track your progress, identify weak areas, and receive smart recommendations to improve.',
  },
];

const featureColorMap = {
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', border: 'hover:border-indigo-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-600', border: 'hover:border-violet-200' },
  emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'hover:border-emerald-200' },
  sky: { bg: 'bg-sky-50', text: 'text-sky-600', border: 'hover:border-sky-200' },
};

const steps = [
  {
    number: '01',
    title: 'Enter your topic',
    description: 'Tell Cognivia what you want to study, how much time you have, and your learning goal.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Get your plan',
    description: 'Receive a personalized day-by-day study schedule with key concepts and objectives.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Study with AI notes',
    description: 'Dive into concise, structured notes covering everything you need to know.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Test your knowledge',
    description: 'Take topic quizzes, see your score, and find out exactly where to focus next.',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

function getPreviewTopics(schedule, completedDays) {
  if (!Array.isArray(schedule) || schedule.length === 0) return [];

  const completedList = schedule.filter((d) => completedDays.includes(d.day));
  const incompleteList = schedule.filter((d) => !completedDays.includes(d.day));

  const items = [];

  if (incompleteList.length === 0) {
    // All completed: show up to the last 3 completed
    const slice = completedList.slice(-3);
    slice.forEach((d) => {
      items.push({
        id: `day-${d.day}`,
        title: d.title || (Array.isArray(d.topics) && d.topics[0]) || `Day ${d.day}`,
        status: 'completed',
      });
    });
    return items;
  }

  const activeDay = incompleteList[0];

  if (completedList.length >= 2) {
    // Show 2 completed and 1 active
    const recentCompleted = completedList.slice(-2);
    recentCompleted.forEach((d) => {
      items.push({
        id: `day-${d.day}`,
        title: d.title || (Array.isArray(d.topics) && d.topics[0]) || `Day ${d.day}`,
        status: 'completed',
      });
    });
    items.push({
      id: `day-${activeDay.day}`,
      title: activeDay.title || (Array.isArray(activeDay.topics) && activeDay.topics[0]) || `Day ${activeDay.day}`,
      status: 'active',
    });
  } else if (completedList.length === 1) {
    // Show 1 completed, 1 active, and up to 1 upcoming
    items.push({
      id: `day-${completedList[0].day}`,
      title: completedList[0].title || (Array.isArray(completedList[0].topics) && completedList[0].topics[0]) || `Day ${completedList[0].day}`,
      status: 'completed',
    });
    items.push({
      id: `day-${activeDay.day}`,
      title: activeDay.title || (Array.isArray(activeDay.topics) && activeDay.topics[0]) || `Day ${activeDay.day}`,
      status: 'active',
    });
    if (incompleteList.length > 1) {
      const nextUpcoming = incompleteList[1];
      items.push({
        id: `day-${nextUpcoming.day}`,
        title: nextUpcoming.title || (Array.isArray(nextUpcoming.topics) && nextUpcoming.topics[0]) || `Day ${nextUpcoming.day}`,
        status: 'upcoming',
      });
    }
  } else {
    // 0 completed: show 1 active and up to 2 upcoming
    items.push({
      id: `day-${activeDay.day}`,
      title: activeDay.title || (Array.isArray(activeDay.topics) && activeDay.topics[0]) || `Day ${activeDay.day}`,
      status: 'active',
    });
    incompleteList.slice(1, 3).forEach((d) => {
      items.push({
        id: `day-${d.day}`,
        title: d.title || (Array.isArray(d.topics) && d.topics[0]) || `Day ${d.day}`,
        status: 'upcoming',
      });
    });
  }

  return items;
}

function AIPreviewCard() {
  const [activePlan, setActivePlan] = useState(() => getActiveStudyPlan());

  useEffect(() => {
    const handleUpdate = () => {
      setActivePlan(getActiveStudyPlan());
    };

    handleUpdate();
    window.addEventListener('storage', handleUpdate);
    window.addEventListener(PLAN_UPDATED_EVENT, handleUpdate);
    window.addEventListener('focus', handleUpdate);

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener(PLAN_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, []);

  const hasPlan = Boolean(
    activePlan &&
    typeof activePlan === 'object' &&
    (activePlan.subject || activePlan.topic || (Array.isArray(activePlan.dailySchedule) && activePlan.dailySchedule.length > 0))
  );

  if (!hasPlan) {
    return (
      <div className="float-card w-full max-w-sm mx-auto lg:mx-0">
        {/* Outer glow ring */}
        <div className="relative rounded-2xl p-0.5 bg-gradient-to-br from-indigo-200 via-violet-100 to-indigo-50 shadow-xl">
          <div className="bg-white rounded-[14px] p-5 space-y-4">

            {/* Card header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-none">Cognivia AI</p>
                  <p className="text-xs text-slate-400">Study Plan</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                No Plan
              </span>
            </div>

            {/* Empty state container */}
            <div className="text-center py-7 px-3 bg-slate-50/70 border border-dashed border-slate-200 rounded-xl">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600 shadow-xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-800">No active study plan</p>
              <p className="text-xs text-slate-500 mt-1 max-w-[220px] mx-auto leading-relaxed">
                Create your study plan to see your progress here.
              </p>
              <div className="mt-4">
                <Link to="/planner">
                  <Button size="sm" variant="primary">
                    Create Study Plan
                    <svg className="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  const stats = getPlanStats(activePlan);
  const progress = stats?.progress ?? 0;
  const completedDaysCount = stats?.completedDaysCount ?? 0;
  const totalDays = stats?.totalDays ?? 1;
  const isCompleted = stats?.isCompleted ?? false;
  const circumference = 2 * Math.PI * 20; // r=20
  const offset = circumference - (progress / 100) * circumference;

  const subjectTitle = activePlan.subject || activePlan.topic || 'General';

  const previewTopics = getPreviewTopics(activePlan.dailySchedule, stats?.completedDays || []);

  let rawRec = null;
  if (Array.isArray(activePlan.recommendations) && activePlan.recommendations.length > 0) {
    rawRec = activePlan.recommendations[0];
  } else if (typeof activePlan.recommendations === 'string' && activePlan.recommendations.trim()) {
    rawRec = activePlan.recommendations.trim();
  } else if (typeof activePlan.recommendation === 'string' && activePlan.recommendation.trim()) {
    rawRec = activePlan.recommendation.trim();
  }

  const aiRecommendation = rawRec ? rawRec.replace(/^["']|["']$/g, '').trim() : null;

  return (
    <div className="float-card w-full max-w-sm mx-auto lg:mx-0">
      {/* Outer glow ring */}
      <div className="relative rounded-2xl p-0.5 bg-gradient-to-br from-indigo-200 via-violet-100 to-indigo-50 shadow-xl">
        <div className="bg-white rounded-[14px] p-5 space-y-4">

          {/* Card header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-none">Cognivia AI</p>
                <p className="text-xs text-slate-400">Study Plan</p>
              </div>
            </div>
            <Link
              to="/plan"
              className={`text-xs font-semibold px-2 py-0.5 rounded-md border transition-colors ${
                isCompleted
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'text-indigo-600 bg-indigo-50 border-indigo-100 hover:bg-indigo-100'
              }`}
            >
              {isCompleted ? 'Completed' : 'Active'}
            </Link>
          </div>

          {/* Subject row */}
          <Link
            to="/plan"
            className="flex items-center justify-between bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-3 py-2.5 transition-colors group"
          >
            <div className="min-w-0 pr-2">
              <p className="text-xs text-slate-400 font-medium">Subject</p>
              <p className="text-sm font-bold text-slate-900 leading-tight truncate" title={subjectTitle}>
                {subjectTitle}
              </p>
            </div>
            <svg className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
          </Link>

          {/* Progress row */}
          <div className="flex items-center gap-4">
            {/* Circular progress */}
            <div className="relative flex-shrink-0">
              <svg width="52" height="52" viewBox="0 0 52 52" className="-rotate-90">
                <circle cx="26" cy="26" r="20" fill="none" stroke="#e2e8f0" strokeWidth="5" />
                <circle
                  cx="26" cy="26" r="20"
                  fill="none"
                  stroke={isCompleted ? '#059669' : '#4f46e5'}
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                />
              </svg>
              <span className={`absolute inset-0 flex items-center justify-center text-xs font-extrabold ${isCompleted ? 'text-emerald-700' : 'text-indigo-700'}`}>
                {progress}%
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-400 font-medium mb-1">Overall Progress</p>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-1.5 rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-600' : 'bg-indigo-600'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1 truncate">
                {completedDaysCount} of {totalDays} {totalDays === 1 ? 'day' : 'days'} completed
              </p>
            </div>
          </div>

          {/* Topics */}
          {previewTopics.length > 0 && (
            <div className="space-y-2">
              {previewTopics.map((item) => {
                if (item.status === 'completed') {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2"
                    >
                      <span className="w-4 h-4 bg-emerald-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-emerald-800 truncate" title={item.title}>
                        {item.title}
                      </span>
                      <span className="ml-auto text-xs text-emerald-600 font-semibold flex-shrink-0">
                        Done
                      </span>
                    </div>
                  );
                }

                if (item.status === 'active') {
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-2.5 bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2"
                    >
                      <span className="w-4 h-4 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6l4 2" />
                        </svg>
                      </span>
                      <span className="text-xs font-medium text-indigo-800 truncate" title={item.title}>
                        {item.title}
                      </span>
                      <span className="ml-auto text-xs text-indigo-600 font-semibold flex-shrink-0">
                        Active
                      </span>
                    </div>
                  );
                }

                // upcoming
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-2.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                  >
                    <span className="w-4 h-4 bg-slate-200 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" fill="currentColor" />
                      </svg>
                    </span>
                    <span className="text-xs font-medium text-slate-700 truncate" title={item.title}>
                      {item.title}
                    </span>
                    <span className="ml-auto text-xs text-slate-400 font-semibold flex-shrink-0">
                      Upcoming
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* AI Recommendation */}
          {aiRecommendation && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl px-3.5 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <svg className="w-3 h-3 text-violet-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.293.083-.578.2-.85A5.002 5.002 0 0010 4a5 5 0 00-2.2 9.15c.117.272.185.557.2.85h4z" />
                </svg>
                <span className="text-xs font-bold text-violet-700 uppercase tracking-wide">AI Recommendation</span>
              </div>
              <p className="text-xs text-violet-900 leading-relaxed">
                "{aiRecommendation}"
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" />
        {/* Glow blob */}
        <div className="absolute inset-0 hero-glow pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-16 xl:gap-20">

            {/* ── Left: text content ──────────────────────────────── */}
            <div className="flex-1 text-center lg:text-left">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-7 shadow-sm">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                AI-Powered Learning Assistant
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1]">
                Learn Smarter.
                <br />
                <span className="text-indigo-600">Progress Faster.</span>
              </h1>

              <p className="mt-7 max-w-xl mx-auto lg:mx-0 text-lg text-slate-500 leading-relaxed">
                Cognivia builds personalized study plans, generates AI-powered notes, and tests your
                knowledge — so you study exactly what you need, when you need it.
              </p>

              {/* CTAs */}
              <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Link to="/planner">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Learning Free
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                    View Dashboard
                  </Button>
                </Link>
              </div>

              {/* Stats strip */}
              <div className="mt-12 inline-flex flex-wrap justify-center lg:justify-start gap-x-10 gap-y-5 bg-white/80 border border-slate-200 rounded-2xl px-6 py-4 shadow-sm backdrop-blur">
                {[
                  { label: 'AI Tools',       value: '4' },
                  { label: 'Personalized',   value: '100%' },
                  { label: '24/7 Assistance', value: '∞' },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <div className="text-2xl font-extrabold text-slate-900">{s.value}</div>
                    <div className="text-xs text-slate-500 mt-0.5 font-medium">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: AI preview card ───────────────────────────── */}
            <div className="flex-shrink-0 mt-14 lg:mt-0 lg:w-80 xl:w-96">
              <AIPreviewCard />
            </div>

          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────────── */}
      <section className="bg-slate-50 border-t border-slate-200 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
              Everything you need
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Study better with four powerful tools
            </h2>
            <p className="mt-4 text-slate-500 max-w-xl mx-auto">
              Four AI-powered tools that work together to make your study sessions more focused and effective.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => {
              const c = featureColorMap[f.color];
              return (
                <Card
                  key={f.title}
                  hover
                  className={`border-slate-200 transition-all duration-200 ${c.border} group`}
                >
                  <div className={`w-11 h-11 ${c.bg} rounded-xl flex items-center justify-center ${c.text} mb-5 group-hover:scale-105 transition-transform duration-200`}>
                    {f.icon}
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-24 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-3">
              Simple process
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              From topic to mastery in 4 steps
            </h2>
            <p className="mt-4 text-slate-500">No setup required. Start studying in under a minute.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Connector line (desktop) */}
                {i < steps.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-5 h-px bg-slate-200 z-0"
                    style={{ left: '2.75rem', right: '-1rem' }}
                  />
                )}
                <div className="relative z-10">
                  {/* Step circle */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      {step.icon}
                    </div>
                    <span className="text-xs font-bold text-slate-400 tracking-wider">STEP {step.number}</span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-14">
            <Link to="/planner">
              <Button size="lg">
                Create Your Study Plan
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────── */}
      <section className="bg-indigo-600 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-indigo-200 text-lg mb-8 leading-relaxed">
            Join thousands of students who use Cognivia to learn more efficiently,
            retain more, and score higher.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/planner">
              <button className="w-full sm:w-auto px-8 py-3 bg-white text-indigo-700 font-semibold rounded-lg hover:bg-indigo-50 active:bg-indigo-100 transition-all duration-150 shadow-sm hover:shadow-md">
                Start for Free
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="w-full sm:w-auto px-8 py-3 border border-indigo-400 text-white font-semibold rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition-all duration-150">
                Explore Dashboard
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
