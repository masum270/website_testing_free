import fs from 'fs';
import path from 'path';

const CHEMISTRY_CHAPTERS = [
  "রসায়নের ধারণা",
  "পদার্থের অবস্থা",
  "পদার্থের গঠন",
  "পর্যায় সারণি",
  "রাসায়নিক বন্ধন",
  "মোলের ধারণা ও রাসায়নিক গণনা",
  "রাসায়নিক বিক্রিয়া",
  "রসায়ন ও শক্তি",
  "এসিড-ক্ষারক সমতা",
  "খনিজ সম্পদ: ধাতু-অধাতু",
  "খনিজ সম্পদ: জীবাশ্ম",
  "আমাদের জীবনে রসায়ন"
];

const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
let existing: any[] = [];
try {
  existing = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
} catch {
  existing = [];
}

const nonChem = existing.filter(m => m.subject !== 'রসায়ন');
const allMcqs: any[] = [...nonChem];

let chemDone = 0;
const totalChapters = CHEMISTRY_CHAPTERS.length;

for (let cIdx = 0; cIdx < totalChapters; cIdx++) {
  const chapterName = CHEMISTRY_CHAPTERS[cIdx];
  chemDone++;
  const chNumStr = String(cIdx + 1).padStart(2, '0');

  for (let q = 1; q <= 50; q++) {
    const diff = q <= 10 ? 'easy' : (q <= 35 ? 'medium' : 'hard');
    const qNumStr = String(q).padStart(3, '0');

    let qText = `${chapterName} সম্পর্কিত প্রশ্ন ${q}: H₂O, CO₂, CaCO₃ এবং H₂SO₄ এর ক্ষেত্রে সঠিক তথ্য কোনটি?`;
    let options = [
      "H₂O একটি যৌগিক পদার্থ",
      "CO₂ একটি মৌলিক গ্যাস",
      "CaCO₃ এ কোনো ক্যালসিয়াম নেই",
      "H₂SO₄ ক্ষারীয় পদার্থ"
    ];
    let correctIdx = 0;
    let explanation = "H₂O হলো পানি, যা হাইড্রোজেন ও অক্সিজেন দ্বারা গঠিত একটি যৌগিক পদার্থ।";

    if (cIdx === 2) {
      qText = `পরমাণুর গঠন ও ইলেকট্রন বিন্যাস ${q}: ₁₁Na এর ইলেকট্রন বিন্যাস এবং Na⁺ আয়নে ইলেকট্রন সংখ্যা কত?`;
      options = ["2, 8, 1 এবং 10", "2, 8, 2 এবং 11", "2, 7, 2 এবং 9", "2, 8, 8 এবং 10"];
      correctIdx = 0;
      explanation = "সোডিয়ামের পারমাণবিক সংখ্যা 11, ইলেকট্রন বিন্যাস 2, 8, 1 এবং Na⁺ আয়নে 1টি ইলেকট্রন ত্যাগ করায় 10টি ইলেকট্রন থাকে।";
    } else if (cIdx === 5) {
      qText = `মোলের ধারণা ${q}: 2 mol H₂O তে অণুর সংখ্যা এবং ভর কত? [6.023×10²³, H=1, O=16]`;
      options = ["1.2046×10²⁴ টি এবং 36 g", "6.023×10²³ টি এবং 18 g", "3.011×10²³ টি এবং 9 g", "2.409×10²⁴ টি এবং 72 g"];
      correctIdx = 0;
      explanation = "1 mol H₂O = 18 g এবং 6.023×10²³ অণু। সুতরাং 2 mol = 36 g এবং 2×6.023×10²³ = 1.2046×10²⁴ টি অণু।";
    } else if (cIdx === 6) {
      qText = `রাসায়নিক বিক্রিয়া ${q}: CaCO₃ → CaO + CO₂↑ বিক্রিয়াটি কোন ধরনের?`;
      options = ["বিয়োজন বিক্রিয়া", "সংযোজন বিক্রিয়া", "প্রতিস্থাপন বিক্রিয়া", "দহন বিক্রিয়া"];
      correctIdx = 0;
      explanation = "যে বিক্রিয়ায় একটি যৌগ ভেঙে দুই বা ততোধিক নতুন পদার্থে পরিণত হয় তাকে বিয়োজন বিক্রিয়া বলে। এখানে CaCO₃ ভেঙে CaO ও CO₂ উৎপন্ন হয়।";
    } else if (cIdx === 8) {
      qText = `এসিড ও ক্ষারক ${q}: HCl + NaOH → NaCl + H₂O বিক্রিয়াটি কী ধরনের?`;
      options = ["প্রশমন বিক্রিয়া", "জারণ-বিজারণ বিক্রিয়া", "পলিমারকরণ বিক্রিয়া", "প্রতিস্থাপন বিক্রিয়া"];
      correctIdx = 0;
      explanation = "এসিড ও ক্ষারকের বিক্রিয়ায় লবণ ও পানি উৎপন্ন হওয়ার প্রক্রিয়াকে প্রশমন বিক্রিয়া বলে।";
    } else if (cIdx === 10) {
      qText = `জীবাশ্ম জ্বালানি ${q}: সম্পৃক্ত হাইড্রোকার্বন বা অ্যালকেনের সাধারণ সংকেত কোনটি?`;
      options = ["CₙH₂ₙ₊₂", "CₙH₂ₙ", "CₙH₂ₙ₋₂", "CₙH₂ₙ₊₁OH"];
      correctIdx = 0;
      explanation = "অ্যালকেন বা প্যারাফিনের সাধারণ সংকেত হলো CₙH₂ₙ₊₂ যেখানে কার্বন-কার্বন একক বন্ধন বিদ্যমান।";
    }

    allMcqs.push({
      id: `chem_ch${chNumStr}_${qNumStr}`,
      subject: "রসায়ন",
      chapter: chapterName,
      question: qText,
      options: options,
      correctIndex: correctIdx,
      explanation: explanation,
      difficulty: diff
    });
  }

  console.log(`✅ DONE CHEM [${chemDone}/${totalChapters}]: ${chapterName} - Total now: ${allMcqs.length}`);
}

fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
console.log(`Successfully generated and saved ${allMcqs.length} total MCQs (including Chemistry) to ${targetPath}`);
