import { useCallback } from 'react';

export function useMCQRotation() {
  const getShuffledQueue = (ids: string[]) => {
    const arr = [...ids];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const getNextExam = (subject: string, chapter: string, allMcqs: any[], examSize: number = 20) => {
    let chapterMcqs = allMcqs.filter(
      (m) => m.subject.trim() === subject.trim() && (chapter === 'all' || chapter === 'সকল অধ্যায়' || m.chapter.trim() === chapter.trim())
    );

    if (chapterMcqs.length === 0) {
      chapterMcqs = allMcqs.filter(
        (m) =>
          (m.subject.toLowerCase().includes(subject.toLowerCase()) || subject.toLowerCase().includes(m.subject.toLowerCase())) &&
          (chapter === 'all' || chapter === 'সকল অধ্যায়' || m.chapter.toLowerCase().includes(chapter.toLowerCase()) || chapter.toLowerCase().includes(m.chapter.toLowerCase()))
      );
    }

    if (chapterMcqs.length === 0) {
      chapterMcqs = allMcqs.filter((m) => m.subject.trim() === subject.trim());
    }

    if (chapterMcqs.length === 0) {
      chapterMcqs = allMcqs;
    }

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

    // If queue empty or less than examSize, start new chakro - shuffle all IDs
    if (queue.length === 0) {
      const allIds = chapterMcqs.map((m: any) => m.id);
      queue = getShuffledQueue(allIds);
      seen = [];
    }

    // Take examSize from queue
    const nextIds = queue.slice(0, examSize);
    const remaining = queue.slice(examSize);

    const result = nextIds.map((id: string) => chapterMcqs.find((m: any) => m.id === id)).filter(Boolean);

    // Save state
    try {
      localStorage.setItem(queueKey, JSON.stringify(remaining));
      localStorage.setItem(seenKey, JSON.stringify([...seen, ...nextIds]));
    } catch (e) {
      console.warn('LocalStorage error in useMCQRotation:', e);
    }

    return result.length > 0 ? result : chapterMcqs.slice(0, examSize);
  };

  const getProgress = (subject: string, chapter: string, total: number) => {
    let seen: string[] = [];
    let queue: string[] = [];
    try {
      seen = JSON.parse(localStorage.getItem(`mcq_seen_${subject}_${chapter}`) || '[]');
      queue = JSON.parse(localStorage.getItem(`mcq_queue_${subject}_${chapter}`) || '[]');
    } catch (e) {
      seen = [];
      queue = [];
    }
    const tot = total || 1;
    return {
      seen: seen.length,
      remaining: queue.length,
      total: tot,
      percent: Math.round(((seen.length % tot) / tot) * 100)
    };
  };

  const resetProgress = (subject: string, chapter: string) => {
    localStorage.removeItem(`mcq_queue_${subject}_${chapter}`);
    localStorage.removeItem(`mcq_seen_${subject}_${chapter}`);
  };

  return { getNextExam, getProgress, resetProgress };
}
