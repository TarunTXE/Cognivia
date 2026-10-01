export const ACTIVE_PLAN_KEY = 'cognivia_active_study_plan';
export const QUIZ_HISTORY_KEY = 'cognivia_quiz_history';

/**
 * Retrieve the active study plan from localStorage
 * @returns {Object|null}
 */
export function getActiveStudyPlan() {
  try {
    const raw = localStorage.getItem(ACTIVE_PLAN_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to parse active study plan from localStorage:', err);
    return null;
  }
}

/**
 * Save an active study plan to localStorage
 * @param {Object} plan
 * @returns {Object}
 */
export function saveActiveStudyPlan(plan) {
  try {
    if (!plan) {
      localStorage.removeItem(ACTIVE_PLAN_KEY);
      return null;
    }
    const schedule = Array.isArray(plan.dailySchedule) ? plan.dailySchedule : [];
    const completedDays = Array.isArray(plan.completedDays)
      ? plan.completedDays
      : schedule.filter((d) => d.status === 'completed').map((d) => d.day);

    const totalDays = Number(plan.duration) || schedule.length || 1;
    const progress = Math.round((completedDays.length / totalDays) * 100);

    const planToSave = {
      ...plan,
      duration: totalDays,
      completedDays,
      progress,
      generatedAt: plan.generatedAt || new Date().toISOString(),
    };
    localStorage.setItem(ACTIVE_PLAN_KEY, JSON.stringify(planToSave));
    return planToSave;
  } catch (err) {
    console.error('Failed to save active study plan to localStorage:', err);
    return plan;
  }
}

/**
 * Remove the active study plan from localStorage
 */
export function deleteActiveStudyPlan() {
  try {
    localStorage.removeItem(ACTIVE_PLAN_KEY);
  } catch (err) {
    console.error('Failed to remove active study plan from localStorage:', err);
  }
}

/**
 * Toggle completion of a specific study day in the active plan
 * @param {number} dayNum
 * @returns {Object|null} updated plan
 */
export function toggleDayCompletion(dayNum) {
  const plan = getActiveStudyPlan();
  if (!plan) return null;

  const currentCompleted = Array.isArray(plan.completedDays)
    ? [...plan.completedDays]
    : (plan.dailySchedule || [])
        .filter((d) => d.status === 'completed')
        .map((d) => d.day);

  const isCompleted = currentCompleted.includes(dayNum);
  const nextCompleted = isCompleted
    ? currentCompleted.filter((d) => d !== dayNum)
    : [...currentCompleted, dayNum].sort((a, b) => a - b);

  const schedule = Array.isArray(plan.dailySchedule) ? plan.dailySchedule : [];
  const nextSchedule = schedule.map((d) => {
    if (d.day === dayNum) {
      return {
        ...d,
        status: isCompleted ? 'upcoming' : 'completed',
      };
    }
    return d;
  });

  const totalDays = Number(plan.duration) || nextSchedule.length || 1;
  const progress = Math.round((nextCompleted.length / totalDays) * 100);

  const updatedPlan = {
    ...plan,
    dailySchedule: nextSchedule,
    completedDays: nextCompleted,
    progress,
    lastUpdated: new Date().toISOString(),
  };

  saveActiveStudyPlan(updatedPlan);
  return updatedPlan;
}

/**
 * Retrieve all completed quizzes from localStorage
 * @returns {Array<Object>}
 */
export function getQuizHistory() {
  try {
    const raw = localStorage.getItem(QUIZ_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse quiz history from localStorage:', err);
    return [];
  }
}

/**
 * Save a newly completed quiz to localStorage
 * @param {Object} quizData
 * @returns {Object}
 */
export function saveQuizResult(quizData) {
  try {
    const history = getQuizHistory();
    const entry = {
      id: quizData.id || `quiz_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      topic: quizData.topic || 'General',
      subject: quizData.subject || '',
      score: typeof quizData.score === 'number' ? quizData.score : (quizData.correctAnswers ?? 0),
      totalQuestions: typeof quizData.totalQuestions === 'number' ? quizData.totalQuestions : (quizData.total ?? 0),
      percentage: typeof quizData.percentage === 'number' ? quizData.percentage : 0,
      completedAt: quizData.completedAt || new Date().toISOString(),
      weakTopics: Array.isArray(quizData.weakTopics) ? quizData.weakTopics : [],
      recommendations: Array.isArray(quizData.recommendations) ? quizData.recommendations : [],
    };

    const updated = [entry, ...history];
    localStorage.setItem(QUIZ_HISTORY_KEY, JSON.stringify(updated));
    return entry;
  } catch (err) {
    console.error('Failed to save quiz result to localStorage:', err);
    return null;
  }
}

/**
 * Clear quiz history from localStorage
 */
export function clearQuizHistory() {
  try {
    localStorage.removeItem(QUIZ_HISTORY_KEY);
  } catch (err) {
    console.error('Failed to clear quiz history from localStorage:', err);
  }
}
