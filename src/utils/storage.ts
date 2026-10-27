import { UserProfile, ExamResult } from '../types/quiz.js';

export const DEFAULT_USER_PROFILE: UserProfile = {
  id: 'guest_user',
  name: 'শিক্ষার্থী (Guest Student)',
  email: 'student@ssc-prep.bd',
  xp: 150,
  level: 1,
  examsCompleted: 0,
  totalCorrect: 0,
  totalAnswered: 0,
  history: [],
  streak: 1,
  lastActiveDate: new Date().toISOString()
};

const STORAGE_KEY = 'ssc_prep_user_profile_v1';

export function getUserProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_USER_PROFILE, ...parsed };
    }
  } catch (e) {
    console.warn('Failed to parse profile from localStorage', e);
  }
  return DEFAULT_USER_PROFILE;
}

export function saveUserProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save profile to localStorage', e);
  }
}

export function recordExamCompletion(result: ExamResult): UserProfile {
  const current = getUserProfile();
  const xpEarned = Math.max(10, result.correctCount * 10);
  const updatedHistory = [result, ...(current.history || [])].slice(0, 50);

  const updated: UserProfile = {
    ...current,
    xp: (current.xp || 0) + xpEarned,
    examsCompleted: (current.examsCompleted || 0) + 1,
    totalCorrect: (current.totalCorrect || 0) + result.correctCount,
    totalAnswered: (current.totalAnswered || 0) + result.totalQuestions,
    history: updatedHistory,
    lastActiveDate: new Date().toISOString()
  };

  saveUserProfile(updated);
  return updated;
}
