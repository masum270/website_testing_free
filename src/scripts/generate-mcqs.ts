import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error("Error: GEMINI_API_KEY environment variable is missing.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

// Define subjects and chapters to generate
const SUBJECT_CONFIGS = [
  {
    subject: "পদার্থবিজ্ঞান",
    prefix: "phy",
    chapters: [
      "ভৌত রাশি ও পরিমাপ", "গতি", "বল", "কাজ ক্ষমতা ও শক্তি", 
      "পদার্থের অবস্থা ও চাপ", "বস্তুর উপর তাপের প্রভাব", "তরঙ্গ ও শব্দ", 
      "আলোর প্রতিফলন", "আলোর প্রতিসরণ", "স্থির তড়িৎ", "চল তড়িৎ", 
      "তড়িতের চৌম্বক ক্রিয়া", "আধুনিক পদার্থবিজ্ঞান ও ইলেকট্রনিক্স", "জীবন বাঁচাতে পদার্থবিজ্ঞান"
    ]
  },
  {
    subject: "রসায়ন",
    prefix: "chem",
    chapters: [
      "রসায়নের ধারণা", "পদার্থের অবস্থা", "পদার্থের গঠন", "পর্যায় সারণি", 
      "রাসায়নিক বন্ধন", "মোলের ধারণা ও রাসায়নিক গণনা", "রাসায়নিক বিক্রিয়া", 
      "রসায়ন ও শক্তি", "এসিড-ক্ষারক সমতা", "খনিজ সম্পদ: ধাতু-অধাতু", 
      "খনিজ সম্পদ: জীবাশ্ম", "আমাদের জীবনে রসায়ন"
    ]
  },
  {
    subject: "সাধারণ গণিত",
    prefix: "math",
    chapters: [
      "বাস্তব সংখ্যা", "সেট ও ফাংশন", "বীজগাণিতিক রাশি", "সূচক ও লগারিদম", 
      "এক চলকবিশিষ্ট সমীকরণ", "বীজগণিতীয় অনুপাত ও সমানুপাত", "দুই চলকবিশিষ্ট সরল সহসমীকরণ", 
      "সসীম ধারা", "রেখা, কোণ ও ত্রিভুজ", "ব্যবহারিক জ্যামিতি", "বৃত্ত", 
      "অনুপাত, সদৃশতা ও প্রতিসমতা", "ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য", 
      "ত্রিকোণমিতিক অনুপাত", "দূরত্ব ও উচ্চতা", "পরিমিতি", "পরিসংখ্যান"
    ]
  },
  {
    subject: "উচ্চতর গণিত",
    prefix: "hmath",
    chapters: [
      "সেট ও ফাংশন", "বীজগাণিতিক রাশি", "জ্যামিতি", "জ্যামিতিক অঙ্কন", 
      "সমীকরণ", "অসমতা", "অসীম ধারা", "ত্রিকোণমিতি", 
      "সূচকীয় ও লগারিদমীয় ফাংশন", "দ্বিপদী বিস্তৃতি", "স্থানাঙ্ক জ্যামিতি", 
      "সমতলে ভেক্টর", "ঘন জ্যামিতি", "সম্ভাবনা"
    ]
  },
  {
    subject: "বাংলা ১ম পত্র",
    prefix: "bangla1",
    chapters: [
      "প্রত্যুপকার", "শুভা", "লাইব্রেরি", "বই পড়া", "অভাগীর স্বর্গ", 
      "আম-আঁটির ভেঁপু", "মানুষ মুহম্মদ (সঃ)", "নিমগাছ", "উপেক্ষিত শক্তির উদ্বোধন", 
      "শিক্ষা ও মনুষ্যত্ব", "প্রবাস বন্ধু", "মমতাদি", "একাত্তরের দিনগুলি", 
      "সাহিত্যের রূপ ও রীতি", "কপোতাক্ষ নদ", "জীবন-সঙ্গীত", "জুতা-আবিষ্কার", 
      "ঝর্ণার গান", "মানুষ", "সেইদিন এই মাঠ", "পল্লীজননী", "রানার", "তোমাকে পাওয়ার জন্য হে স্বাধীনতা"
    ]
  },
  {
    subject: "বাংলা ২য় পত্র",
    prefix: "bangla2",
    chapters: [
      "ধ্বনি ও বর্ণ", "ণ-ত্ব ও ষ-ত্ব বিধান", "সন্ধি", "সমাস", 
      "কারক ও বিভক্তি", "উপসর্গ", "শব্দ ও পদ", "বাক্য প্রকরণ", "বাগধারা", "বিরামচিহ্ন"
    ]
  },
  {
    subject: "ইসলাম শিক্ষা",
    prefix: "islam",
    chapters: [
      "আকাইদ", "ইবাদত", "কুরআন ও হাদিস", "আখলাক", "আদর্শ জীবনচরিত", "বিজ্ঞান ও ইসলাম", "সমাজ সংস্কার"
    ]
  },
  {
    subject: "তথ্য ও যোগাযোগ প্রযুক্তি",
    prefix: "ict",
    chapters: [
      "তথ্য প্রযুক্তি ও বাংলাদেশ", "কম্পিউটার নিরাপত্তা", "ইন্টারনেট ও যোগাযোগ", 
      "আমার লেখালেখি", "হিসাব নিকাশ ও স্প্রেডশিট", "মাল্টিমিডিয়া ও গ্রাফিক্স", 
      "ডাটাবেস পরিচিতি", "ডিজিটাল বাংলাদেশ", "ডিজিটাল নিরাপত্তা", "ক্লাউড কম্পিউটিং"
    ]
  }
];

async function generateAll() {
  const allMcqs: any[] = [];
  let globalCount = 0;

  for (const cfg of SUBJECT_CONFIGS) {
    console.log(`\n========================================`);
    console.log(`Generating MCQs for subject: ${cfg.subject}`);
    console.log(`========================================`);

    for (let cIdx = 0; cIdx < cfg.chapters.length; cIdx++) {
      const chapter = cfg.chapters[cIdx];
      const chNum = cIdx + 1;
      console.log(`-> Chapter ${chNum}/${cfg.chapters.length}: ${chapter}`);

      // We want to generate 50 MCQs for this chapter. We can generate in batches of 25 using Gemini.
      const chapterMcqs: any[] = [];
      const batchSizes = [25, 25]; // 2 batches of 25 to get 50 per chapter reliably

      for (let batch = 0; batch < batchSizes.length; batch++) {
        const count = batchSizes[batch];
        const startIndex = batch * 25 + 1;

        const prompt = `You are an expert NCTB board question setter in Bangladesh for SSC. Generate exactly ${count} high-quality board-standard Multiple Choice Questions (MCQs) in Bengali for the subject "${cfg.subject}", chapter "${chapter}".
Difficulty distribution: 20% easy, 50% medium, 30% hard.
Return ONLY valid JSON array without any markdown formatting or extra text.

Each object in the JSON array must have this exact structure:
{
  "id": "${cfg.prefix}_ch${chNum}_001",
  "subject": "${cfg.subject}",
  "chapter": "${chapter}",
  "question": "Question text in Bengali",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "correctIndex": 0,
  "explanation": "Clear explanation in Bengali why this option is correct",
  "difficulty": "medium"
}

Ensure questions are 100% accurate, based on NCTB textbook and SSC board exam standards. Avoid trivial or low-quality questions. Make sure correctIndex matches the correct option accurately. Return strictly valid JSON array.`;

        try {
          const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          const text = response.text || '';
          // Clean JSON string
          let jsonStr = text.trim();
          if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr.replace(/^```json/, '').replace(/```$/, '').trim();
          } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/^```/, '').replace(/```$/, '').trim();
          }

          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed)) {
            // Fix IDs and ensure structure
            parsed.forEach((item: any, idx: number) => {
              const seq = startIndex + idx;
              item.id = `${cfg.prefix}_ch${chNum}_${String(seq).padStart(3, '0')}`;
              item.subject = cfg.subject;
              item.chapter = chapter;
            });
            chapterMcqs.push(...parsed);
          }
        } catch (err) {
          console.error(`Error generating batch for ${cfg.subject} - ${chapter} (batch ${batch}):`, err);
        }
      }

      console.log(`   Generated ${chapterMcqs.length} MCQs for ${chapter}`);
      allMcqs.push(...chapterMcqs);
      globalCount += chapterMcqs.length;

      // Small pause to respect rate limits
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  // Save to src/data/mcqs.json
  const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');
  fs.writeFileSync(targetPath, JSON.stringify(allMcqs, null, 2), 'utf-8');
  console.log(`\nSuccessfully generated and saved ${globalCount} total MCQs to ${targetPath}`);
}

generateAll().catch(err => {
  console.error("Generation failed:", err);
  process.exit(1);
});
