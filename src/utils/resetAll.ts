import { db, collection, getDocs, deleteDoc, doc } from '../firebase.js';

export const resetEverything = async (): Promise<number> => {
  if (typeof window === 'undefined') return 0;

  // Clear all localStorage keys related to MCQ and leaderboard
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (
      key &&
      (key.startsWith('mcq_') ||
        key.startsWith('leaderboard') ||
        key.startsWith('exam_') ||
        key.startsWith('progress_') ||
        key.startsWith('score_') ||
        key.startsWith('user_') ||
        key.startsWith('ssc_prep_') ||
        key.includes('seen') ||
        key.includes('queue') ||
        key.includes('attempted'))
    ) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));

  // Clear specific keys
  localStorage.removeItem('leaderboard');
  localStorage.removeItem('allScores');
  localStorage.removeItem('userScores');
  localStorage.removeItem('examHistory');
  localStorage.removeItem('mcqProgress');
  localStorage.removeItem('ssc_prep_admin_results');
  localStorage.removeItem('ssc_prep_admin_sessions');
  localStorage.removeItem('ssc_prep_user_profile_v1');

  // Clear Firestore leaderboard/exam_results collection docs
  try {
    const querySnapshot = await getDocs(collection(db, 'exam_results'));
    const deletePromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, 'exam_results', docSnap.id)));
    await Promise.all(deletePromises);
  } catch (e) {
    console.warn('Firestore exam_results cleanup notice:', e);
  }

  console.log('✅ All cleaned:', keysToRemove.length, 'keys removed');
  return keysToRemove.length;
};

export const resetLeaderboardFile = () => {
  localStorage.removeItem('ssc_prep_admin_results');
  localStorage.removeItem('leaderboard');
};
