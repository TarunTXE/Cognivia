import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { getActiveStudyPlan, getQuizHistory } from '../utils/storage';

const priorityConfig = {
  high:   { variant: 'red',    label: 'High',   dot: 'bg-red-500' },
  medium: { variant: 'yellow', label: 'Medium', dot: 'bg-amber-500' },
  low:    { variant: 'default', label: 'Low',   dot: 'bg-slate-400' },
};

function formatQuizDate(isoString) {
  if (!isoString) return 'Recently';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

function StatCard({ label, value, icon, color }) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xl font-extrabold text-slate-900 leading-none">{value}</div>
        <div className="text-xs text-slate-500 font-medium mt-1">{label}</div>
      </div>
    </Card>
  );
}

export default function Dashboard() {
  const [activePlan, setActivePlan] = useState(() => getActiveStudyPlan());
  const [quizHistory, setQuizHistory] = useState(() => getQuizHistory());

  const refreshData = () => {
    setActivePlan(getActiveStudyPlan());
    setQuizHistory(getQuizHistory());
  };

  useEffect(() => {
    refreshData();
    window.addEventListener('storage', refreshData);
    return () => window.removeEventListener('storage', refreshData);
  }, []);

  // ── Real Plan Stats ───────────────────────────────────────────
  const planStats = useMemo(() => {
    if (!activePlan) return null;
    const schedule = Array.isArray(activePlan.dailySchedule) ? activePlan.dailySchedule : [];
    const totalDays = Number(activePlan.duration) || schedule.length || 1;
    const completedDays = Array.isArray(activePlan.completedDays)
      ? activePlan.completedDays
      : schedule.filter((d) => d.status === 'completed').map((d) => d.day);
    const completedDaysCount = completedDays.length;
    const progress = Math.round((completedDaysCount / totalDays) * 100);
    const daysRemaining = Math.max(0, totalDays - completedDaysCount);
    const isCompleted = totalDays > 0 && completedDaysCount >= totalDays;
    const nextDay = schedule.find((d) => !completedDays.includes(d.day));

    return {
      totalDays,
      completedDaysCount,
      progress,
      daysRemaining,
      isCompleted,
      nextDay,
      subject: activePlan.subject || 'General',
      topic: activePlan.topic || 'Active Plan',
      difficulty: activePlan.difficulty || '',
    };
  }, [activePlan]);

  // ── Real Weak Topics from Quiz History ────────────────────────
  const weakTopicsList = useMemo(() => {
    const map = new Map();
    quizHistory.forEach((q) => {
      if (Array.isArray(q.weakTopics)) {
        q.weakTopics.forEach((wt) => {
          if (!wt) return;
          const prev = map.get(wt) || { count: 0, latestPct: q.percentage };
          map.set(wt, { count: prev.count + 1, latestPct: q.percentage });
        });
      }
      if (typeof q.percentage === 'number' && q.percentage < 60 && q.topic) {
        const prev = map.get(q.topic) || { count: 0, latestPct: q.percentage };
        map.set(q.topic, { count: prev.count + 1, latestPct: q.percentage });
      }
    });

    return Array.from(map.entries()).map(([topic, data]) => ({
      topic,
      count: data.count,
      score: data.latestPct,
    }));
  }, [quizHistory]);

  // ── Real Recommended Actions ──────────────────────────────────
  const recommendedActions = useMemo(() => {
    const list = [];

    // A. Incomplete study-plan days
    if (planStats) {
      if (!planStats.isCompleted && planStats.nextDay) {
        list.push({
          action: `Complete Day ${planStats.nextDay.day}: ${planStats.nextDay.title || planStats.topic}`,
          priority: 'high',
          to: '/plan',
        });
      } else if (planStats.isCompleted) {
        // D. Completed plan
        list.push({
          action: `Completed ${planStats.topic}! Create a new AI study plan`,
          priority: 'medium',
          to: '/planner',
        });
      }
    }

    // B. Weak topics from actual quiz results
    weakTopicsList.slice(0, 2).forEach((wt) => {
      list.push({
        action: `Review ${wt.topic}`,
        priority: 'high',
        to: '/notes',
      });
    });

    // C. Low quiz performance (< 60%)
    const lowScoreQuiz = quizHistory.find((q) => typeof q.percentage === 'number' && q.percentage < 60);
    if (lowScoreQuiz) {
      list.push({
        action: `Retake ${lowScoreQuiz.topic} quiz (${lowScoreQuiz.percentage}%)`,
        priority: 'medium',
        to: '/quiz',
      });
    }

    // Plan-related quiz recommendation if not taken yet
    if (activePlan && !planStats?.isCompleted) {
      const hasPlanQuiz = quizHistory.some(
        (q) => q.topic?.toLowerCase() === activePlan.topic?.toLowerCase()
      );
      if (!hasPlanQuiz) {
        list.push({
          action: `Practice quiz for ${activePlan.topic}`,
          priority: 'medium',
          to: '/quiz',
        });
      }
    }

    // Fallback if no specific recommendations
    if (list.length === 0) {
      if (!activePlan) {
        list.push({
          action: 'Create your first AI study plan to start learning',
          priority: 'high',
          to: '/planner',
        });
      }
      list.push({
        action: 'Take a practice quiz to test your knowledge',
        priority: 'medium',
        to: '/quiz',
      });
    }

    return list.slice(0, 4);
  }, [planStats, weakTopicsList, quizHistory, activePlan]);

  // ── Real Topics Studied List ──────────────────────────────────
  const topicsStudiedList = useMemo(() => {
    const set = new Set();
    if (activePlan) {
      const schedule = Array.isArray(activePlan.dailySchedule) ? activePlan.dailySchedule : [];
      const completed = Array.isArray(activePlan.completedDays)
        ? activePlan.completedDays
        : schedule.filter((d) => d.status === 'completed').map((d) => d.day);

      schedule.forEach((d) => {
        if (completed.includes(d.day) && Array.isArray(d.topics)) {
          d.topics.forEach((t) => t && set.add(t));
        }
      });
      if (completed.length > 0 && activePlan.topic) {
        set.add(activePlan.topic);
      }
    }
    quizHistory.forEach((q) => {
      if (q.topic) set.add(q.topic);
    });
    return Array.from(set);
  }, [activePlan, quizHistory]);

  // ── Real Top Statistics ───────────────────────────────────────
  const quizzesTaken = quizHistory.length;

  const averageScore = useMemo(() => {
    if (quizHistory.length === 0) return null;
    const total = quizHistory.reduce((acc, q) => acc + (Number(q.percentage) || 0), 0);
    return Math.round(total / quizHistory.length);
  }, [quizHistory]);

  const studyStreak = useMemo(() => {
    const dates = new Set();
    if (activePlan?.lastUpdated) {
      dates.add(new Date(activePlan.lastUpdated).toDateString());
    } else if (activePlan?.generatedAt && (activePlan.completedDays?.length > 0)) {
      dates.add(new Date(activePlan.generatedAt).toDateString());
    }
    quizHistory.forEach((q) => {
      if (q.completedAt) {
        dates.add(new Date(q.completedAt).toDateString());
      }
    });

    if (dates.size === 0) return '0d';

    const today = new Date();
    const todayStr = today.toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    if (!dates.has(todayStr) && !dates.has(yesterdayStr)) {
      return '0d';
    }

    let streak = 0;
    let checkDate = dates.has(todayStr) ? today : yesterday;
    while (true) {
      if (dates.has(checkDate.toDateString())) {
        streak++;
        const prev = new Date(checkDate);
        prev.setDate(prev.getDate() - 1);
        checkDate = prev;
      } else {
        break;
      }
    }
    return `${streak}d`;
  }, [activePlan, quizHistory]);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* ── Welcome bar ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-1">Dashboard</p>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back 👋
            </h1>
            <p className="mt-1.5 text-slate-500 text-sm">Here's your learning progress. Keep up the great work!</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Link to="/planner">
              <Button variant="secondary" size="sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Plan
              </Button>
            </Link>
            <Link to="/quiz">
              <Button size="sm">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Take Quiz
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Stats row ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Topics Studied"
            value={topicsStudiedList.length}
            color="bg-indigo-100"
            icon={<svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" /></svg>}
          />
          <StatCard
            label="Quizzes Taken"
            value={quizzesTaken}
            color="bg-sky-100"
            icon={<svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            label="Average Score"
            value={averageScore !== null ? `${averageScore}%` : '0%'}
            color="bg-emerald-100"
            icon={<svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <StatCard
            label="Study Streak"
            value={studyStreak}
            color="bg-orange-100"
            icon={<svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /></svg>}
          />
        </div>

        {/* ── Main layout ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left/main column ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Current Study Plan */}
            {planStats ? (
              <Card>
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`w-2 h-2 rounded-full ${planStats.isCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        {planStats.isCompleted ? 'Completed Plan' : 'Active Plan'}
                      </span>
                      {planStats.difficulty && (
                        <Badge variant="indigo">{planStats.difficulty}</Badge>
                      )}
                      {planStats.isCompleted && (
                        <Badge variant="green">Completed ✓</Badge>
                      )}
                    </div>
                    <h2 className="font-bold text-slate-900 text-base">{planStats.topic}</h2>
                    <p className="text-xs text-slate-500 mt-0.5">{planStats.subject}</p>
                  </div>
                  <Link to="/plan" state={{ plan: activePlan }}>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
                      View Plan
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-500">
                    {planStats.isCompleted
                      ? 'All days completed'
                      : `${planStats.completedDaysCount} of ${planStats.totalDays} days completed · ${planStats.daysRemaining} ${planStats.daysRemaining === 1 ? 'day' : 'days'} remaining`}
                  </span>
                  <span className="text-xs font-semibold text-indigo-600">{planStats.progress}%</span>
                </div>
                <ProgressBar
                  value={planStats.progress}
                  max={100}
                  showLabel={false}
                  color={planStats.isCompleted ? 'green' : 'indigo'}
                />

                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center">
                    <div className="text-sm font-bold text-slate-900">{planStats.totalDays}</div>
                    <div className="text-xs text-slate-500">Total Days</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center">
                    <div className="text-sm font-bold text-slate-900">{planStats.completedDaysCount}</div>
                    <div className="text-xs text-slate-500">Days Done</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-center">
                    <div className="text-sm font-bold text-slate-900">{planStats.daysRemaining}</div>
                    <div className="text-xs text-slate-500">Days Left</div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-slate-300" />
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Plan</span>
                </div>
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto mb-3 text-indigo-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                    </svg>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">No active study plan</h3>
                  <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">
                    You don't have an active study plan yet. Set your learning goals and create your personalized AI study plan.
                  </p>
                  <Link to="/planner">
                    <Button size="sm">
                      <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Study Plan
                    </Button>
                  </Link>
                </div>
              </Card>
            )}

            {/* Recent Quiz Scores */}
            <Card>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-slate-900">Recent Quiz Scores</h2>
                <Link to="/quiz">
                  <Button variant="ghost" size="sm" className="text-indigo-600 text-xs">
                    New Quiz
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Button>
                </Link>
              </div>

              {quizHistory.length > 0 ? (
                <div className="space-y-4">
                  {quizHistory.slice(0, 5).map((quiz) => {
                    const pct = Number(quiz.percentage) || 0;
                    const scoreColor =
                      pct >= 80 ? 'text-emerald-600' :
                      pct >= 60 ? 'text-amber-600' : 'text-red-500';
                    const barColor =
                      pct >= 80 ? 'green' :
                      pct >= 60 ? 'yellow' : 'red';
                    return (
                      <div key={quiz.id || quiz.completedAt}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div>
                            <span className="text-sm font-medium text-slate-700">{quiz.topic}</span>
                            {quiz.subject && (
                              <span className="text-xs text-slate-400 ml-2">({quiz.subject})</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2.5">
                            <span className="text-xs text-slate-400">{formatQuizDate(quiz.completedAt)}</span>
                            <span className={`text-sm font-extrabold ${scoreColor}`}>{pct}%</span>
                          </div>
                        </div>
                        <ProgressBar value={pct} max={100} showLabel={false} color={barColor} />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">No quizzes completed yet</p>
                  <p className="text-xs text-slate-400 mb-4">Complete your first quiz to see your performance results here.</p>
                  <Link to="/quiz">
                    <Button size="sm" variant="secondary">Take a Quiz</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Weak Topics */}
            <Card>
              <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Weak Topics
              </h2>

              {weakTopicsList.length > 0 ? (
                <div className="space-y-3">
                  {weakTopicsList.map((wt) => (
                    <div key={wt.topic} className="flex items-center justify-between p-3 bg-red-50/60 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-sm font-semibold text-slate-800">{wt.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {typeof wt.score === 'number' && wt.score < 60 && (
                          <span className="text-xs font-bold text-red-600">{wt.score}%</span>
                        )}
                        <Badge variant="red">Needs Review</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700 mb-1">No weak topics identified yet</p>
                  <p className="text-xs text-slate-400 mb-4">Complete quizzes to highlight areas that need more attention.</p>
                  <Link to="/quiz">
                    <Button size="sm" variant="secondary">Take a Quiz</Button>
                  </Link>
                </div>
              )}
            </Card>
          </div>

          {/* ── Right column ──────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Recommended Actions */}
            <Card>
              <h2 className="font-bold text-slate-900 mb-5 flex items-center gap-2">
                <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Recommended Actions
              </h2>
              <ul className="space-y-3">
                {recommendedActions.map((item) => {
                  const cfg = priorityConfig[item.priority] || priorityConfig.medium;
                  return (
                    <li key={item.action} className="p-3 bg-slate-50 border border-slate-200 rounded-xl hover:border-indigo-200 transition-colors">
                      <Link to={item.to || '/planner'} className="flex items-start gap-3">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mt-1.5 flex-shrink-0`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-slate-700 leading-snug hover:text-indigo-600 transition-colors">{item.action}</span>
                        </div>
                        <Badge variant={cfg.variant} className="flex-shrink-0 mt-0.5">{cfg.label}</Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </Card>

            {/* Topics Studied */}
            <Card>
              <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
                </svg>
                Topics Studied
              </h2>
              {topicsStudiedList.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {topicsStudiedList.map((t) => (
                    <Badge key={t} variant="indigo">{t}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-2">
                  No topics studied yet. Completed study plan days and quizzes will appear here.
                </p>
              )}
            </Card>

            {/* Quick Actions */}
            <Card>
              <h2 className="font-bold text-slate-900 mb-4">Quick Actions</h2>
              <div className="space-y-2.5">
                {[
                  {
                    to: '/planner',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
                    iconBg: 'bg-indigo-100 text-indigo-600',
                    title: 'New Study Plan',
                    sub: 'Set a new topic & schedule',
                  },
                  {
                    to: '/notes',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13" /></svg>,
                    iconBg: 'bg-violet-100 text-violet-600',
                    title: 'Generate Notes',
                    sub: 'AI-powered study notes',
                  },
                  {
                    to: '/quiz',
                    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
                    iconBg: 'bg-emerald-100 text-emerald-600',
                    title: 'Practice Quiz',
                    sub: 'Test your knowledge',
                  },
                ].map((action) => (
                  <Link to={action.to} key={action.to} className="block">
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-200 hover:bg-indigo-50 transition-all duration-150">
                      <div className={`w-8 h-8 ${action.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{action.title}</p>
                        <p className="text-xs text-slate-500">{action.sub}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
}
