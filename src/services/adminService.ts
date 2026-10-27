import { ExamSessionDoc, ExamResultDoc } from '../types/admin.js';

export const OWNER_EMAIL = 'mdrayhankobir227@gmail.com';
export const ADMIN_PIN = '123456';

const SESSIONS_KEY = 'ssc_prep_admin_sessions';
const RESULTS_KEY = 'ssc_prep_admin_results';

export function getLocalResults(): ExamResultDoc[] {
  try {
    const raw = localStorage.getItem(RESULTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local results', e);
  }
  return [];
}

export function recordExamResult(result: ExamResultDoc): void {
  try {
    const existing = getLocalResults();
    const updated = [result, ...existing].slice(0, 100);
    localStorage.setItem(RESULTS_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to record exam result', e);
  }
}

export function getLocalSessions(): ExamSessionDoc[] {
  try {
    const raw = localStorage.getItem(SESSIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('Failed to parse local sessions', e);
  }
  return [];
}

export function createExamSession(data: Partial<ExamSessionDoc>): ExamSessionDoc {
  const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  const session: ExamSessionDoc = {
    sessionId,
    userId: data.userId || 'guest_user',
    userEmail: data.userEmail || 'guest@ssc-prep.bd',
    userName: data.userName || 'Guest Student',
    subject: data.subject || 'General',
    chapter: data.chapter || 'All Chapters',
    startTime: new Date().toISOString(),
    lastActiveTime: new Date().toISOString(),
    status: 'live',
    totalQuestions: data.totalQuestions || 15,
    answeredCount: 0,
    currentQuestionIndex: 0,
    progressPercent: 0,
    ...data
  };

  try {
    const existing = getLocalSessions();
    localStorage.setItem(SESSIONS_KEY, JSON.stringify([session, ...existing].slice(0, 50)));
  } catch (e) {
    console.warn('Failed to create local exam session', e);
  }

  return session;
}

export function updateExamSessionProgress(sessionId: string, progress: Partial<ExamSessionDoc>): void {
  try {
    const sessions = getLocalSessions();
    const idx = sessions.findIndex(s => s.sessionId === sessionId);
    if (idx !== -1) {
      sessions[idx] = {
        ...sessions[idx],
        ...progress,
        lastActiveTime: new Date().toISOString()
      };
      localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
    }
  } catch (e) {
    console.warn('Failed to update exam session', e);
  }
}

export function finishExamSession(sessionId: string, finalData?: Partial<ExamSessionDoc>): void {
  updateExamSessionProgress(sessionId, {
    status: 'finished',
    progressPercent: 100,
    ...finalData
  });
}
