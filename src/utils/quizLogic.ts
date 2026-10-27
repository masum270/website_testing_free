import { MCQ } from '../types/quiz.js';

/**
 * Convert numbers to Bengali digits
 */
export function toBengaliNumber(num: number | string): string {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (digit) => bnDigits[parseInt(digit, 10)]);
}

/**
 * Format seconds into MM:SS format with optional Bengali numerals
 */
export function formatTimeMMSS(totalSeconds: number | string): string {
  let secs = typeof totalSeconds === 'string' ? (parseInt(totalSeconds, 10) || 0) : (totalSeconds || 0);
  if (isNaN(secs) || secs < 0) secs = 0;
  const mm = Math.floor(secs / 60);
  const ss = secs % 60;
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

/**
 * Format seconds into MM:SS format with optional Bengali numerals
 */
export function formatTimer(totalSeconds: number | string, inBengali = true): string {
  const formatted = formatTimeMMSS(totalSeconds);
  return inBengali ? toBengaliNumber(formatted) : formatted;
}

/**
 * Calculate user level based on XP
 */
export function calculateLevel(totalXP: number): number {
  if (totalXP <= 0) return 0;
  return Math.floor(totalXP / 100) + 1;
}

/**
 * Calculate progress percentage towards next level (0 to 100)
 */
export function calculateLevelProgress(totalXP: number): number {
  if (totalXP <= 0) return 0;
  return totalXP % 100;
}

/**
 * Calculate earned XP
 */
export function calculateScoreXP(correctCount: number, wrongCount: number, penalty = true): number {
  const earned = correctCount * 10;
  const deducted = penalty ? wrongCount * 2 : 0;
  return Math.max(0, earned - deducted);
}

/**
 * Calculate accuracy percentage
 */
export function calculateAccuracy(correctCount: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 0;
  return Math.round((correctCount / totalQuestions) * 100);
}

/**
 * Fisher-Yates array shuffle
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Filter and select exam questions using Chakro Rotation (no repeat until all seen)
 */
export function selectExamQuestions(
  allMCQs: MCQ[],
  subject: string,
  chapter: string,
  count: number,
  attemptedIds: string[] = [],
  selectedChapters?: string[]
): MCQ[] {
  // Filter by subject
  let pool = allMCQs.filter((q) => q.subject.trim() === subject.trim());

  if (pool.length === 0) {
    pool = allMCQs.filter(
      (q) =>
        q.subject.toLowerCase().includes(subject.toLowerCase()) ||
        subject.toLowerCase().includes(q.subject.toLowerCase())
    );
  }

  // Filter by selected chapters
  if (selectedChapters && selectedChapters.length > 0 && !selectedChapters.includes('all')) {
    const chapterSet = new Set(selectedChapters.map((c) => c.trim()));
    const matching = pool.filter((q) => chapterSet.has(q.chapter.trim()));
    if (matching.length > 0) pool = matching;
  } else if (
    chapter &&
    chapter !== 'all' &&
    chapter !== 'সকল অধ্যায়' &&
    chapter !== 'সকল গদ্য' &&
    chapter !== 'সকল পদ্য'
  ) {
    const matching = pool.filter((q) => q.chapter.trim() === chapter.trim());
    if (matching.length > 0) pool = matching;
  }

  if (pool.length === 0) {
    pool = allMCQs.filter((q) => q.subject.trim() === subject.trim());
  }

  if (pool.length === 0) {
    pool = allMCQs;
  }

  // Rotation Chakro logic per subject/chapter
  const queueKey = `mcq_queue_${subject}_${chapter}`;
  const seenKey = `mcq_seen_${subject}_${chapter}`;

  let queue: string[] = [];
  let seen: string[] = [];

  try {
    queue = JSON.parse(localStorage.getItem(queueKey) || '[]');
    seen = JSON.parse(localStorage.getItem(seenKey) || '[]');
  } catch (e) {
    queue = [];
    seen = [];
  }

  if (queue.length === 0) {
    const allIds = pool.map((q) => q.id);
    queue = shuffleArray(allIds);
    seen = [];
  }

  const nextIds = queue.slice(0, count);
  const remaining = queue.slice(count);

  const selected = nextIds.map((id) => pool.find((q) => q.id === id)).filter(Boolean) as MCQ[];

  try {
    localStorage.setItem(queueKey, JSON.stringify(remaining));
    localStorage.setItem(seenKey, JSON.stringify([...seen, ...nextIds]));
  } catch (e) {
    console.warn('LocalStorage save error in selectExamQuestions:', e);
  }

  return selected.length > 0 ? selected : shuffleArray(pool).slice(0, Math.min(count, pool.length));
}
