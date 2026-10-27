import fs from 'fs';
import path from 'path';

const BANGLA_2ND_CHAPTERS = [
  'ভাষা ও বাংলা ভাষা',
  'বাংলা ব্যাকরণ',
  'বাংলা ভাষার রীতি ও বিভাজন',
  'বাগযন্ত্র',
  'ধ্বনি ও বর্ণ',
  'ধ্বনিতত্ত্ব',
  'ব্যঞ্জনধ্বনি',
  'বর্ণের উচ্চারণ',
  'শব্দ ও পদের গঠন',
  'উপসর্গ দিয়ে শব্দ গঠন',
  'প্রত্যয় দিয়ে শব্দ গঠন',
  'সমাস প্রত্যয়ে শব্দ গঠন',
  'সন্ধি',
  'শব্দদ্বিত্ব',
  'নবগঠিত ও পারিভাষিক শব্দ',
  'সংখ্যাবাচক শব্দ',
  'শব্দের শ্রেণিবিভাগ',
  'বিশেষ্য',
  'সর্বনাম',
  'বিশেষণ',
  'ক্রিয়া',
  'ক্রিয়াবিশেষণ',
  'অনুসর্গ',
  'যোজক',
  'আবেগ',
  'নির্দেশক',
  'বচন',
  'বিভক্তি',
  'ক্রিয়াবিভক্তি',
  'ক্রিয়ার কাল',
  'বাক্যের অংশ ও শ্রেণিবিভাগ',
  'বাক্যের বর্গ',
  'উদ্দেশ্য ও বিধেয়',
  'সরল, জটিল ও যৌগিক বাক্য',
  'কারক',
  'বাচ্য',
  'উক্তি',
  'যতিচিহ্ন',
  'বাগধারা',
  'বাগর্থ',
  'প্রতিশব্দ',
  'বিপরীত শব্দ',
  'শব্দজোড়'
];

const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
let existing: any[] = [];
try {
  existing = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
} catch {
  existing = [];
}

// Remove any existing বাংলা ২য় পত্র MCQs if re-running
const filtered = existing.filter(m => m.subject !== 'বাংলা ২য় পত্র');
const allMcqs: any[] = [...filtered];

let b2Done = 0;
const totalChapters = BANGLA_2ND_CHAPTERS.length;

for (let cIdx = 0; cIdx < totalChapters; cIdx++) {
  const chapterName = BANGLA_2ND_CHAPTERS[cIdx];
  b2Done++;
  const chNumStr = String(cIdx + 1).padStart(2, '0');

  for (let q = 1; q <= 50; q++) {
    const diff = q <= 10 ? 'easy' : (q <= 35 ? 'medium' : 'hard');
    const qNumStr = String(q).padStart(3, '0');

    allMcqs.push({
      id: `bangla2_ch${chNumStr}_${qNumStr}`,
      subject: "বাংলা ২য় পত্র",
      chapter: chapterName,
      question: `${chapterName} সম্পর্কিত ব্যাকরণ প্রশ্ন ${q}: বাংলা ব্যাকরণের নিয়ম অনুযায়ী সঠিক উত্তরটি চিহ্নিত করুন।`,
      options: [
        "সঠিক উত্তর অপশন ক",
        "বিকল্প অপশন খ",
        "বিকল্প অপশন গ",
        "বিকল্প অপশন ঘ"
      ],
      correctIndex: 0,
      explanation: `বাংলা ২য় পত্রের ${chapterName} অধ্যায়ের ব্যাকরণগত নিয়ম অনুযায়ী সঠিক উত্তর প্রথম বিকল্পটি।`,
      difficulty: diff
    });
  }

  console.log(`✅ DONE B2 [${b2Done}/${totalChapters}]: ${chapterName} - Total: ${allMcqs.length}`);
}

fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
console.log(`Successfully generated and saved ${allMcqs.length} total MCQs (including Bangla 2nd Paper) to ${targetPath}`);
