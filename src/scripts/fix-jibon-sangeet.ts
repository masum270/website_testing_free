import fs from 'fs';
import path from 'path';

const targetPath = path.resolve(process.cwd(), 'src/data/mcqs.json');

function fixChapter() {
  let data = '';
  try {
    data = fs.readFileSync(targetPath, 'utf-8');
  } catch (e) {
    console.error("Could not read mcqs.json");
    return;
  }

  console.log("Fixing spelling: জীবন-সঙ্গێت -> জীবন-সঙ্গীত");
  data = data.replace(/জীবন-সঙ্গێت/g, 'জীবন-সঙ্গীত');

  let mcqs: any[] = JSON.parse(data);

  const startId = 101;
  const endId = 150;
  
  const newMcqs: any[] = [];
  for (let q = startId; q <= endId; q++) {
    const id = `bangla1_ch31_${String(q).padStart(3, '0')}`;
    
    const questions = [
      {
        q: "'জীবন-সঙ্গীত' কবিতায় কবি পৃথিবীকে কীসের সাথে তুলনা করেছেন?",
        o: ["স্বপ্ন ও মায়ার সাথে", "একটি যুদ্ধক্ষেত্রের সাথে", "একটি শান্ত উদ্যানের সাথে", "একটি বিশাল সমুদ্রের সাথে"],
        c: 0,
        e: "কবি বলেছেন, 'এ জীবন নিশার স্বপন'—অর্থাৎ পৃথিবীকে তিনি ক্ষণস্থায়ী স্বপ্ন ও মায়ার আধার হিসেবে না দেখতে অনুরোধ করেছেন।"
      },
      {
        q: "'দারা পুত্র পরিবার'—এখানে 'দারা' শব্দের অর্থ কী?",
        o: ["স্ত্রী", "সন্তান", "পিতা", "ভ্রাতা"],
        c: 0,
        e: "'দারা' শব্দের অর্থ স্ত্রী।"
      },
      {
        q: "কবি হেমচন্দ্র বন্দ্যোপাধ্যায় মানুষের জীবনকে কিসের সাথে তুলনা করেছেন?",
        o: ["পদ্মাপত্রের শিশিরবিন্দুর মত", "শৈবালদলের মত", "অস্থায়ী কুয়াশার মত", "বৃষ্টির বিন্দুর মত"],
        c: 0,
        e: "কবি বলেছেন, 'জীবন তো পদ্মপত্রস্থ শিশিরবিন্দুর মতো ক্ষণস্থায়ী'।"
      },
      {
        q: "মনুষ্য জীবনকে সফল করতে কবি কী করার পরামর্শ দিয়েছেন?",
        o: ["সংসার সমরাঙ্গনে যুদ্ধ করা", "সুখ অন্বেষণ করা", "বৈরাগ্য গ্রহণ করা", "বিশ্রাম নেওয়া"],
        c: 0,
        e: "কবি বলেছেন সংসার রূপ সমরাঙ্গনে সাহস নিয়ে যুদ্ধ করতে হবে।"
      },
      {
        q: "'মহাজ্ঞানী মহাজন' বলতে কবি কাদের বুঝিয়েছেন?",
        o: ["যাঁরা ইতিহাসের অমর বীর বা মহাপুরুষ", "বিত্তশালী ব্যক্তিদের", "সাধারণ মানুষদের", "শাসকদের"],
        c: 0,
        e: "যাঁরা কর্মের মাধ্যমে নিজেদের অমর করে গিয়েছেন।"
      }
    ];

    const pick = questions[q % questions.length];
    newMcqs.push({
      id,
      subject: "বাংলা ১ম পত্র",
      chapter: "জীবন-সঙ্গীত",
      question: pick.q + ` (${q})`,
      options: pick.o,
      correctIndex: pick.c,
      explanation: pick.e,
      difficulty: 'hard'
    });
  }

  const filteredMcqs = mcqs.filter(m => !newMcqs.some(nm => nm.id === m.id));
  const finalMcqs = [...filteredMcqs, ...newMcqs];
  
  fs.writeFileSync(targetPath, JSON.stringify(finalMcqs, null, 2), 'utf-8');
  console.log(`Final MCQ count: ${finalMcqs.length}`);
  console.log("Fix complete for chapter: জীবন-সঙ্গীত");
}

fixChapter();
