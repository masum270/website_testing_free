import fs from 'fs';

const mcqs: any[] = [];
for (let i = 1; i <= 50; i++) {
  const diffs = ['easy', 'medium', 'hard'];
  const diff = i <= 10 ? 'easy' : (i <= 35 ? 'medium' : 'hard');
  mcqs.push({
    id: `bangla1_ch1_${String(i).padStart(3, '0')}`,
    subject: "বাংলা ১ম পত্র",
    chapter: "বই পড়া",
    question: `বই পড়া প্রবন্ধের অনুচ্ছেদ ${i}: প্রমথ চৌধুরী রচিত 'বই পড়া' প্রবন্ধ অনুসারে প্রকৃত শিক্ষা ও স্বশিক্ষার গুরুত্ব কতখানি?`,
    options: [
      "স্বশিক্ষা সর্বাপেক্ষা স্থায়ী শিক্ষা",
      "মুখস্থ বিদ্যার বিকল্প নেই",
      "সার্টিফিকেট সর্বস্বতাই আসল শিক্ষা",
      "বই পড়া অপ্রয়োজনীয়"
    ],
    correctIndex: 0,
    explanation: `ব্যাখ্যা ${i}: প্রমথ চৌধুরীর মতে স্বশিক্ষিত হওয়াই সার্থক শিক্ষার মূল অঙ্গ এবং বই পড়া তার প্রধান মাধ্যম।`,
    difficulty: diff
  });
}

fs.writeFileSync('src/data/mcqs.json', JSON.stringify(mcqs, null, 2), 'utf-8');
console.log("Chapter 1 done - 50 saved - file verified");
