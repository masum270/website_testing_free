import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json' with { type: 'json' };

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app, 'ai-studio-website-95ff7c9a-7503-4800-846a-3605e43775ad');

async function resetAllStudents() {
  console.log('[RESET] Starting complete student data reset to 0/0...');

  const collectionsToClear = [
    'exam_results',
    'examResults',
    'submissions',
    'leaderboard',
    'userProgress',
    'results',
    'progress',
    'mega_exam_results'
  ];

  for (const colName of collectionsToClear) {
    try {
      const snap = await getDocs(collection(db, colName));
      console.log(`[RESET] Clearing collection ${colName} (${snap.docs.length} docs)...`);
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (err: any) {
      console.warn(`[RESET] Error clearing ${colName}:`, err?.message || err);
    }
  }

  try {
    const usersSnap = await getDocs(collection(db, 'users'));
    console.log(`[RESET] Resetting ${usersSnap.docs.length} user profiles to 0/0...`);
    for (const u of usersSnap.docs) {
      await updateDoc(doc(db, 'users', u.id), {
        xp: 0,
        totalXP: 0,
        level: 1,
        correctAnswers: 0,
        totalAttempts: 0,
        totalAttempted: 0,
        totalCorrect: 0,
        examsCompleted: 0,
        totalExams: 0,
        currentStreak: 0,
        percentage: 0,
        score: '0/0'
      });
    }
  } catch (err: any) {
    console.warn('[RESET] Error resetting users collection:', err?.message || err);
  }

  console.log('✅ All student data successfully reset to 0/0!');
  process.exit(0);
}

resetAllStudents();
