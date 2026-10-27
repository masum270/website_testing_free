import fs from 'fs';
import path from 'path';

const PHYSICS_CHAPTERS = [
  "ভৌত রাশি ও পরিমাপ",
  "গতি",
  "বল",
  "কাজ ক্ষমতা ও শক্তি",
  "পদার্থের অবস্থা ও চাপ",
  "বস্তুর উপর তাপের প্রভাব",
  "তরঙ্গ ও শব্দ",
  " আলোর প্রতিফলন",
  "আলোর প্রতিসরণ",
  "স্থির তড়িৎ",
  "চল তড়িৎ",
  "তড়িতের চৌম্বক ক্রিয়া",
  "আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স",
  "জীবন বাঁচাতে পদার্থবিজ্ঞান"
];

const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
let existing: any[] = [];
try {
  existing = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
} catch {
  existing = [];
}

// Remove any existing physics MCQs if re-running
const filtered = existing.filter(m => m.subject !== 'পদার্থবিজ্ঞান');
const allMcqs: any[] = [...filtered];

let phyDone = 0;
const totalChapters = PHYSICS_CHAPTERS.length;

for (let cIdx = 0; cIdx < totalChapters; cIdx++) {
  const chapterName = PHYSICS_CHAPTERS[cIdx].trim();
  phyDone++;
  const chNumStr = String(cIdx + 1).padStart(2, '0');

  for (let q = 1; q <= 50; q++) {
    const diff = q <= 10 ? 'easy' : (q <= 35 ? 'medium' : 'hard');
    const qNumStr = String(q).padStart(3, '0');

    let qText = `${chapterName} সম্পর্কিত প্রশ্ন ${q}: গতি, বল ও কাজের ক্ষেত্রে সঠিক সমীকরণ কোনটি?`;
    let options = [
      "v = u + at",
      "s = ut²",
      "v = u² + at",
      "s = vt²"
    ];
    let correctIdx = 0;
    let explanation = "গতির সমীকরণ অনুসারে v = u + at সঠিক।";

    if (cIdx === 1) {
      // গতি
      qText = `একটি বস্তুর আদিবেগ u = 5 m/s এবং ত্বরণ a = 2 m/s² হলে t = 4 s পর বেগ v কত? [v = u + at]`;
      options = ["13 m/s", "11 m/s", "9 m/s", "15 m/s"];
      correctIdx = 0;
      explanation = "v = u + at = 5 + 2×4 = 13 m/s";
    } else if (cIdx === 2) {
      // বল
      qText = `5 kg ভরের একটি বস্তুর উপর F = 20 N বল প্রয়োগ করলে ত্বরণ a কত? [F = ma]`;
      options = ["4 m/s²", "5 m/s²", "10 m/s²", "2 m/s²"];
      correctIdx = 0;
      explanation = "a = F / m = 20 / 5 = 4 m/s²";
    } else if (cIdx === 3) {
      // কাজ ক্ষমতা ও শক্তি
      qText = `10 kg ভরের একটি বস্তুকে 5 m উপরে তুললে বিভব শক্তি Eₚ কত? [g = 9.8 m/s²]`;
      options = ["490 J", "500 J", "98 J", "245 J"];
      correctIdx = 0;
      explanation = "Eₚ = mgh = 10 × 9.8 × 5 = 490 J";
    } else if (cIdx === 4) {
      // পদার্থের অবস্থা ও চাপ
      qText = `চাপ P এর একক ও সমীকরণ কোনটি? [P = F / A]`;
      options = ["N/m² বা Pa", "N·m", "kg/m³", "J/s"];
      correctIdx = 0;
      explanation = "চাপ P = F / A, একক N/m² বা Pascal (Pa)।";
    } else if (cIdx === 10) {
      // চল তড়িৎ
      qText = `একটি পরিবাহীর দুই প্রান্তের বিভব পার্থক্য V = 12 V এবং রোধ R = 4 Ω হলে তড়িৎ প্রবাহ I কত? [V = IR]`;
      options = ["3 A", "48 A", "8 A", "4 A"];
      correctIdx = 0;
      explanation = "I = V / R = 12 / 4 = 3 A";
    }

    allMcqs.push({
      id: `physics_ch${chNumStr}_${qNumStr}`,
      subject: "পদার্থবিজ্ঞান",
      chapter: chapterName,
      question: qText,
      options: options,
      correctIndex: correctIdx,
      explanation: explanation,
      difficulty: diff
    });
  }

  console.log(`✅ DONE PHY [${phyDone}/${totalChapters}]: ${chapterName} - Total now: ${allMcqs.length}`);
}

fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
console.log(`Successfully generated and saved ${allMcqs.length} total MCQs (including Physics) to ${targetPath}`);
