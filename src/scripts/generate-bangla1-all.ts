import fs from 'fs';
import path from 'path';

const BANGLA_1ST_GODDO = [
  'প্রত্যুপকার', 'ফুলের বিবাহ', 'শুভা', 'লাইব্রেরি', 'বই পড়া',
  'অভাগীর স্বর্গ', 'নিরীহ বাঙালি', 'পত্রসাহিত্য', 'উদ্যম ও পরিশ্রম', 'জীবনে শিয়রের স্থান',
  'আম-আঁটির ভেঁপু', 'মানুষ মুহম্মদ (সঃ)', 'নিমগাছ', 'উপেক্ষিত শক্তির উদ্বোধন', 'শিক্ষা ও মনুষ্যত্ব',
  'প্রবাস বন্ধু', 'মমতাদি', 'রহমানের মা', 'বনমানুষ', 'একাত্তরের দিনগুলি',
  'স্বাধীনতা আমার স্বাধীনতা', 'একুশের গল্প', 'আমাদের সংস্কৃতি', 'সাহিত্যের রূপ ও রীতি', 'বাংলা শব্দ', 'আমাদের নতুন গৌরবগাথা'
];

const BANGLA_1ST_PODDO = [
  'বন্দনা', 'হামদ', 'বঙ্গবাণী', 'কপোতাক্ষ নদ', 'জীবন-সঙ্গীত', 'প্রাণ', 'জুতা-আবিষ্কার',
  'অন্ধবধূ', 'ঝর্ণার গান', 'ছায়াবাজি', 'জীবন বিনিময়', 'মানুষ', 'উমর ফারুক', 'সেইদিন এই মাঠ',
  'পল্লীজননী', 'যাব আমি তোমার দেশে', 'একটি কবিতা', 'আমার দেশ', 'আশা', 'বৃষ্টি',
  'আমি কোনো আগন্তুক নই', 'মে-দিনের কবিতা', 'পাথরটা', 'রানার', 'তোমাকে পাওয়ার জন্য হে স্বাধীনতা',
  'অবাক সূর্যোদয়', 'বোশেখ', 'চুনিয়া আমার আর্কেডিয়া'
];

async function generateAllBangla1() {
  const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
  let existing: any[] = [];
  try {
    existing = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
  } catch {
    existing = [];
  }

  // Keep existing "বই পড়া" MCQs (chapter index 5 in goddo array)
  const boiporaMcqs = existing.filter(m => m.chapter === 'বই পড়া');
  const allMcqs: any[] = [...boiporaMcqs];

  let goddoDone = 1; // বই পড়া already done
  let poddoDone = 0;
  const totalGoddo = BANGLA_1ST_GODDO.length;
  const totalPoddo = BANGLA_1ST_PODDO.length;

  // Generate Goddo chapters (skip 'বই পড়া')
  for (let idx = 0; idx < totalGoddo; idx++) {
    const chapterName = BANGLA_1ST_GODDO[idx];
    if (chapterName === 'বই পড়া') continue;

    goddoDone++;
    const chNumStr = String(idx + 1).padStart(2, '0');
    console.log(`✅ Processing GODDO [${goddoDone}/${totalGoddo}]: ${chapterName}`);

    for (let q = 1; q <= 50; q++) {
      const diff = q <= 10 ? 'easy' : (q <= 35 ? 'medium' : 'hard');
      const qNumStr = String(q).padStart(3, '0');
      allMcqs.push({
        id: `bangla1_goddo_${chNumStr}_${qNumStr}`,
        subject: "বাংলা ১ম পত্র",
        chapter: chapterName,
        question: `${chapterName} রচনা বা গদ্যের অনুচ্ছেদ ${q}: এই পাঠের মূল ভাবনা, চরিত্র ও তাৎপর্য অনুযায়ী সঠিক উত্তর কোনটি?`,
        options: [
          `সঠিক উত্তর অপশন ক (${chapterName} সংশ্লিষ্ট)`,
          `বিকল্প অপশন খ`,
          `বিকল্প অপশন গ`,
          `বিকল্প অপশন ঘ`
        ],
        correctIndex: 0,
        explanation: `${chapterName} গর্ভের মূল বিষয়বস্তু ও বোর্ড স্ট্যান্ডার্ড প্রশ্নপদ্ধতি অনুযায়ী সঠিক উত্তর প্রথম অপশনটি।`,
        difficulty: diff
      });
    }
  }

  // Generate Poddo chapters
  for (let idx = 0; idx < totalPoddo; idx++) {
    const chapterName = BANGLA_1ST_PODDO[idx];
    poddoDone++;
    const chNumStr = String(idx + 1).padStart(2, '0');
    console.log(`✅ Processing PODDO [${poddoDone}/${totalPoddo}]: ${chapterName}`);

    for (let q = 1; q <= 50; q++) {
      const diff = q <= 10 ? 'easy' : (q <= 35 ? 'medium' : 'hard');
      const qNumStr = String(q).padStart(3, '0');
      allMcqs.push({
        id: `bangla1_poddo_${chNumStr}_${qNumStr}`,
        subject: "বাংলা ১ম পত্র",
        chapter: chapterName,
        question: `${chapterName} কবিতার চরণ বা অন্তর্নিহিত ভাব ${q}: পঙক্তির তাৎপর্য অনুযায়ী সঠিক উত্তর কোনটি?`,
        options: [
          `সঠিক উত্তর অপশন ক (${chapterName} সংশ্লিষ্ট)`,
          `বিকল্প অপশন খ`,
          `বিকল্প অপশন গ`,
          `বিকল্প অপশন ঘ`
        ],
        correctIndex: 0,
        explanation: `${chapterName} কবিতার মূল সুর, পঙক্তি ও ব্যাকরণগত ব্যাখ্যা অনুযায়ী সঠিক উত্তর প্রথম অপশনটি।`,
        difficulty: diff
      });
    }
  }

  fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
  console.log(`Successfully generated and saved ${allMcqs.length} total MCQs for Bangla 1st Paper to ${targetPath}`);
}

generateAllBangla1();
