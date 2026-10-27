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

  // Filter out any previous incomplete attempts of Islam MCQs if necessary
  const allMcqs: any[] = existing.filter(m => m.subject !== 'ইসলাম ও নৈতিক শিক্ষা');
  let islamDone = 0;
  const totalChapters = ISLAM_CHAPTERS.length;

  for (let cIdx = 0; cIdx < totalChapters; cIdx++) {
    const chapterName = ISLAM_CHAPTERS[cIdx];
    islamDone++;
    const chNumStr = String(cIdx + 1).padStart(2, '0');
    
    console.log(`Generating MCQs for chapter: ${chapterName}...`);
    
    // Generate 50 MCQ per chapter in batches of 25
    for (let batch = 0; batch < 2; batch++) {
      let retries = 3;
      let success = false;
      
      while (retries > 0 && !success) {
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
            model: 'gemini-3.8-flash',
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
          success = true;
        } catch (err) {
          retries--;
          console.error(`Error generating batch ${batch} for ${chapterName}, retries left: ${retries}`, err);
          await new Promise(r => setTimeout(r, 2000));
        }
      }
    }
    console.log(`✅ DONE ISLAM [${islamDone}/${totalChapters}]: ${chapterName} - Total: ${allMcqs.length}`);
    fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
  }
}

generateIslamMCQs().catch(console.error);
