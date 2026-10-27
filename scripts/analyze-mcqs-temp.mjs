import fs from 'node:fs';

const source = fs.readFileSync('src/data/subjects.ts', 'utf8');
const readArray = (name) => {
  const match = source.match(new RegExp(`export const ${name} = \\[([\\s\\S]*?)\\];`));
  if (!match) throw new Error(`Missing chapter list: ${name}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
};
const readInline = (id) => {
  const start = source.indexOf(`id: '${id}'`);
  if (start < 0) throw new Error(`Missing subject: ${id}`);
  const end = source.indexOf('\n  },', start);
  const block = source.slice(start, end < 0 ? undefined : end);
  const match = block.match(/chapters: \[([\s\S]*?)\n    \]/);
  if (!match) throw new Error(`Missing inline chapter list: ${id}`);
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1]);
};

const subjects = [
  ['bangla1', 'বাংলা ১ম পত্র', [...readArray('BANGLA_1ST_GODDO'), ...readArray('BANGLA_1ST_PODDO')]],
  ['bangla2', 'বাংলা ২য় পত্র', readInline('bangla-2nd')],
  ['math', 'সাধারণ গণিত', readArray('GENERAL_MATH_CHAPTERS')],
  ['phy', 'পদার্থবিজ্ঞান', readArray('PHYSICS_CHAPTERS')],
  ['chem', 'রসায়ন', readArray('CHEMISTRY_CHAPTERS')],
  ['bio', 'জীববিজ্ঞান', readArray('BIOLOGY_CHAPTERS')],
  ['hmath', 'উচ্চতর গণিত', readArray('HIGHER_MATH_CHAPTERS')],
  ['bgs', 'বাংলাদেশ ও বিশ্বপরিচয়', readInline('bgs')],
  ['islam', 'ইসলাম ও নৈতিক শিক্ষা', readInline('islam')],
];
const aliases = new Map([
  ['ক্ষেত্রফল', 'ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য'],
  ['বীজগাণিতিক অনুপাত ও সমানুপাত', 'বীজগণিতীয় অনুপাত ও সমানুপাত'],
  ['দৃঢ়তা ও চলন', 'দৃঢ়তা প্রদান ও চলন'],
  ['জীববিজ্ঞান পরিচিতি', 'জীবন পাঠ'],
]);
const dataFiles = ['src/data/mcqs.json', 'src/data/mcqs_batch_50.json'];
const data = dataFiles.flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
const recordsBySubject = new Map(subjects.map(([, subject, chapters]) => [
  subject,
  new Map(chapters.map((chapter) => [chapter, 0])),
]));
const seenQuestions = new Set();
const duplicateBySubject = new Map();
const unknownChapters = new Set();
let uniqueCount = 0;

for (const item of data) {
  const chapter = aliases.get(item.chapter) ?? item.chapter;
  const chapterCounts = recordsBySubject.get(item.subject);
  if (!chapterCounts?.has(chapter)) {
    unknownChapters.add(`${item.subject} | ${item.chapter}`);
    continue;
  }
  const question = item.question.normalize('NFC').trim().replace(/\s+/g, ' ');
  if (seenQuestions.has(question)) {
    duplicateBySubject.set(item.subject, (duplicateBySubject.get(item.subject) ?? 0) + 1);
    continue;
  }
  seenQuestions.add(question);
  uniqueCount += 1;
  chapterCounts.set(chapter, chapterCounts.get(chapter) + 1);
}

const missing = [];
for (const [code, subject, chapters] of subjects) {
  for (const chapter of chapters) {
    const count = recordsBySubject.get(subject).get(chapter);
    if (count < 200) missing.push({ code, subject, chapter, count, missing: 200 - count });
    if (count > 200) throw new Error(`Too many MCQs in ${subject} | ${chapter}: ${count}`);
  }
}
console.log(JSON.stringify({
  officialChapters: subjects.reduce((sum, [, , chapters]) => sum + chapters.length, 0),
  sourceRecords: data.length,
  uniqueQuestions: uniqueCount,
  duplicates: data.length - uniqueCount,
  missingCount: missing.reduce((sum, item) => sum + item.missing, 0),
  missing,
  duplicateBySubject: Object.fromEntries(duplicateBySubject),
  unknownChapters: [...unknownChapters],
}, null, 2));
