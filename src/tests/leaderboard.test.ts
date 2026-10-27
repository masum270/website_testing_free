import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTimeMMSS, calculateAccuracy, formatTimer } from '../utils/quizLogic.js';

test('Leaderboard Percentage calculation for 15, 30, 50, 100 MCQ systems', () => {
  // 15 MCQ System
  assert.equal(calculateAccuracy(15, 15), 100, '15/15 should be 100%');
  assert.equal(calculateAccuracy(12, 15), 80, '12/15 should be 80%');
  assert.equal(calculateAccuracy(0, 15), 0, '0/15 should be 0%');

  // 30 MCQ System
  assert.equal(calculateAccuracy(30, 30), 100, '30/30 should be 100%');
  assert.equal(calculateAccuracy(24, 30), 80, '24/30 should be 80%');
  assert.equal(calculateAccuracy(15, 30), 50, '15/30 should be 50%');

  // 50 MCQ System
  assert.equal(calculateAccuracy(50, 50), 100, '50/50 should be 100%');
  assert.equal(calculateAccuracy(40, 50), 80, '40/50 should be 80%');
  assert.equal(calculateAccuracy(25, 50), 50, '25/50 should be 50%');

  // 100 MCQ System
  assert.equal(calculateAccuracy(100, 100), 100, '100/100 should be 100%');
  assert.equal(calculateAccuracy(75, 100), 75, '75/100 should be 75%');
  assert.equal(calculateAccuracy(0, 100), 0, '0/100 should be 0%');
});

test('Time formatting mm:ss guarantees seconds strictly under 60', () => {
  // 88 seconds -> 1 minute 28 seconds (01:28, NOT 00:88)
  assert.equal(formatTimeMMSS(88), '01:28');
  assert.equal(formatTimeMMSS(150), '02:30');
  assert.equal(formatTimeMMSS(44), '00:44');
  assert.equal(formatTimeMMSS(0), '00:00');
  assert.equal(formatTimeMMSS(3599), '59:59');

  // In Bengali numeral format
  assert.equal(formatTimer(88, true), '০১:২৮');
  assert.equal(formatTimer(44, true), '০০:৪৪');
});
