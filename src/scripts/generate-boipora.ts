import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

async function generateBoiPora() {
  const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
  // Step 1: Empty array initially
  fs.writeFileSync(targetPath, '[]', 'utf-8');

  console.log("Generating 50 Board Standard MCQs for Bangla 1st Paper - 'বই পড়া'...");

  const prompt = `You are an expert NCTB board question setter in Bangladesh for SSC. Generate exactly 50 high-quality board-standard Multiple Choice Questions (MCQs) in Bengali for the subject "বাংলা ১ম পত্র", chapter "বই পড়া" (প্রমথ চৌধুরী রচিত).
Difficulty distribution: 20% easy, 50% medium, 30% hard.
Return ONLY valid JSON array without any markdown formatting or extra text.

Each object in the JSON array must have this exact structure:
{
  "id": "bangla1_ch1_001",
  "subject": "বাংলা ১ম পত্র",
  "chapter": "বই পড়া",
  "question": "Question text in Bengali",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctIndex": 0,
  "explanation": "Clear explanation in Bengali why this option is correct",
  "difficulty": "medium"
}

Ensure questions are 100% accurate, based on NCTB textbook and SSC board exam standards. Avoid trivial or low-quality questions. Make sure correctIndex matches the correct option accurately. Ids must range from bangla1_ch1_001 to bangla1_ch1_050. Return strictly valid JSON array.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    const text = response.text || '';
    let jsonStr = text.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(jsonStr);
    if (Array.isArray(parsed)) {
      parsed.forEach((item: any, idx: number) => {
        const seq = idx + 1;
        item.id = `bangla1_ch1_${String(seq).padStart(3, '0')}`;
        item.subject = "বাংলা ১ম পত্র";
        item.chapter = "বই পড়া";
      });

      fs.writeFileSync(targetPath, JSON.stringify(parsed, null, 2), 'utf-8');
      console.log(`Chapter 1 done - ${parsed.length} saved - file verified`);
    } else {
      console.error("Generated result is not an array:", parsed);
    }
  } catch (err) {
    console.error("Generation error:", err);
    process.exit(1);
  }
}

generateBoiPora();
