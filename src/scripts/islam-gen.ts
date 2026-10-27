import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}
const ai = new GoogleGenAI({ apiKey });

const ISLAM_CHAPTERS = [
  "আকাইদ", "ইবাদত", "কুরআন ও হাদিস", "আখলাক", "আদর্শ জীবনচরিত", "বিজ্ঞান ও ইসলাম", "সমাজ সংস্কার"
];

async function generateIslamMCQs() {
  const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
  let existing: any[] = [];
  try {
    existing = JSON.parse(fs.readFileSync(targetPath, 'utf-8'));
  } catch {
    existing = [];
  }

  const allMcqs: any[] = [...existing];
  let islamDone = 0;
  const totalChapters = ISLAM_CHAPTERS.length;

  for (let cIdx = 0; cIdx < totalChapters; cIdx++) {
    const chapterName = ISLAM_CHAPTERS[cIdx];
    islamDone++;
    const chNumStr = String(cIdx + 1).padStart(2, '0');
    
    console.log(`Generating MCQs for chapter: ${chapterName}...`);
    
    for (let batch = 0; batch < 2; batch++) {
      const prompt = `You are an expert NCTB board question setter for Islamic Studies. Generate 25 board-standard MCQs in Bengali for subject "ইসলাম ও নৈতিক শিক্ষা", chapter "${chapterName}".
      
      CRITICAL FORMATTING RULES:
      - Arabic perfect: الله, محمد ﷺ, সালাত, যাকাত, সাওম, হজ্জ, কুরআন, হাদিস, ঈমান, আখিরাত.
      - References: সূরা আল-বাকারা: ২, আয়াত: ৪৩, হাদিস: বুখারী, মুসলিম.
      - Use correct symbols: (সঃ), (আঃ), (রাঃ) only. NO (SAW), (PBUH).
      - Difficulty: mix of easy, medium, hard.
      - Return ONLY valid JSON array.

      Object Structure:
      {
        "question": "Question text in Bengali with Arabic terms where needed",
        "options": ["Op1", "Op2", "Op3", "Op4"],
        "correctIndex": 0,
        "explanation": "Clear explanation in Bengali",
        "difficulty": "medium"
      }`;

      try {
        const response = await ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: prompt,
        });

        let jsonStr = response.text.replace(/```json/g, '').replace(/```/g, '').trim();
        const batchMcqs = JSON.parse(jsonStr);
        batchMcqs.forEach((item: any, index: number) => {
          item.id = `islam_ch${chNumStr}_${String(batch * 25 + index + 1).padStart(3, '0')}`;
          item.subject = "ইসলাম ও নৈতিক শিক্ষা";
          item.chapter = chapterName;
        });
        allMcqs.push(...batchMcqs);
      } catch (err) {
        console.error(`Error generating batch ${batch} for ${chapterName}:`, err);
      }
    }
    console.log(`✅ DONE ISLAM [${islamDone}/${totalChapters}]: ${chapterName} - Total: ${allMcqs.length}`);
    fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
    
    if (islamDone % 3 === 0) {
      console.log('Build check requested after chapter 3 or 6');
    }
  }
}

generateIslamMCQs();
