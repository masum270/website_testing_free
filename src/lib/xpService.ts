/**
 * Tension Free Science - XP & Reward Calculation Service
 */

export interface ExamXPSpec {
  duration?: number; // in minutes
  questionsCount?: number; // total number of questions
  totalQuestions?: number;
  type?: string;
}

/**
 * Calculates base XP reward for an exam based on duration, question count, or exam type.
 * Rules:
 * - 15 min or <= 15 Q => 50 XP
 * - 30 min or <= 30 Q => 100 XP
 * - 45 min or <= 45 Q => 150 XP
 * - 60 min or <= 60 Q => 200 XP
 * - 60+ min => 250 XP
 * - Daily Challenge => 150 XP
 * - Mock Test => 250 XP
 */
export function getXPForExam(spec: ExamXPSpec): number {
  const duration = spec.duration || 15;
  const qCount = spec.questionsCount || spec.totalQuestions || 15;
  const examType = (spec.type || '').toLowerCase();

  if (examType.includes('daily') || examType.includes('দৈনিক')) {
    return 150;
  }
  if (examType.includes('mock') || examType.includes('মডেল') || examType.includes('mega')) {
    return 250;
  }

  if (duration <= 15 && qCount <= 15) return 50;
  if (duration <= 15 || qCount <= 15) return 50;
  if (duration <= 30 || qCount <= 30) return 100;
  if (duration <= 45 || qCount <= 45) return 150;
  if (duration <= 60 || qCount <= 60) return 200;
  return 250;
}

/**
 * Calculates final XP including accuracy bonuses:
 * - Accuracy >= 90% => +50% bonus
 * - Accuracy >= 80% => +20% bonus
 * - Final XP capped at baseXP * 1.5
 */
export function calculateFinalEarnedXP(baseXP: number, percentage: number): number {
  let bonusRatio = 0;
  if (percentage >= 90) {
    bonusRatio = 0.5;
  } else if (percentage >= 80) {
    bonusRatio = 0.2;
  }
  const bonus = Math.round(baseXP * bonusRatio);
  return Math.min(Math.round(baseXP * 1.5), baseXP + bonus);
}
