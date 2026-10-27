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
const sourceRecords = dataFiles.flatMap((file) => JSON.parse(fs.readFileSync(file, 'utf8')));
const groups = new Map(subjects.map(([, subject, chapters]) => [
  subject,
  new Map(chapters.map((chapter) => [chapter, []])),
]));
const seenQuestions = new Set();
const unknownChapters = new Set();

const questionKey = (question) => question.normalize('NFC').trim().replace(/\s+/g, ' ');
for (const item of sourceRecords) {
  const chapter = aliases.get(item.chapter) ?? item.chapter;
  const chapterRows = groups.get(item.subject)?.get(chapter);
  if (!chapterRows) {
    unknownChapters.add(`${item.subject} | ${item.chapter}`);
    continue;
  }
  const normalized = questionKey(item.question);
  if (seenQuestions.has(normalized)) continue;
  seenQuestions.add(normalized);
  chapterRows.push({ ...item, chapter });
}
if (unknownChapters.size) throw new Error(`Unrecognized chapters: ${[...unknownChapters].join('; ')}`);

const shuffledOptions = (answer, distractors, seed) => {
  const values = [...new Set([String(answer), ...distractors.map(String)])];
  if (values.length < 4) throw new Error(`Not enough unique answer options for ${answer}`);
  const selected = values.slice(0, 4);
  for (let i = selected.length - 1; i > 0; i -= 1) {
    const swap = (seed * 17 + i * 11) % (i + 1);
    [selected[i], selected[swap]] = [selected[swap], selected[i]];
  }
  return { options: selected, correctIndex: selected.indexOf(String(answer)) };
};
const mcq = (question, answer, distractors, explanation, seed) => ({
  question,
  ...shuffledOptions(answer, distractors, seed),
  explanation,
  difficulty: seed % 3 === 0 ? 'hard' : 'medium',
});
const fraction = (numerator, denominator) => {
  const gcd = (a, b) => b === 0 ? Math.abs(a) : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  return `${numerator / divisor}/${denominator / divisor}`;
};
const superscript = (value) => String(value).replace(/[0-9-]/g, (digit) => ({
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
}[digit]));

const generateHigherMathSets = (index) => {
  const value = Math.floor(index / 5) + 2;
  const type = index % 5;
  if (type === 0) {
    const x = value + 1;
    const a = value % 7 + 2;
    const b = value % 5 + 1;
    const answer = a * x * x + b * x + 3;
    return mcq(
      `f(x) = ${a}x² + ${b}x + 3 হলে f(${x})-এর মান কত?`,
      answer,
      [answer + 2, answer - 2, a * x + b + 3],
      `f(${x}) = ${a}×${x}² + ${b}×${x} + 3 = ${answer}।`,
      index,
    );
  }
  if (type === 1) {
    const a = value % 9 + 2;
    const b = value + 3;
    const answer = `(x - ${b})/${a}`;
    return mcq(
      `f(x) = ${a}x + ${b} এক-এক ফাংশন হলে f⁻¹(x) কোনটি?`,
      answer,
      [`(x + ${b})/${a}`, `${a}x - ${b}`, `(x - ${a})/${b}`],
      `y = ${a}x + ${b} থেকে x = (y - ${b})/${a}; তাই f⁻¹(x) = ${answer}।`,
      index,
    );
  }
  if (type === 2) {
    const a = value % 8 + 2;
    const b = value + 1;
    const x = value + 2;
    const inner = x - 2;
    const answer = a * inner + b;
    return mcq(
      `f(x) = ${a}x + ${b} এবং g(x) = x - 2 হলে (f ∘ g)(${x}) কত?`,
      answer,
      [answer + a, answer - a, a * x + b],
      `g(${x}) = ${inner}; সুতরাং f(g(${x})) = ${a}×${inner} + ${b} = ${answer}।`,
      index,
    );
  }
  if (type === 3) {
    const n = value + 6;
    const answer = Math.floor(n / 2);
    return mcq(
      `A = {1, 2, …, ${n}} এবং B = {2, 4, 6, …, ${n}} হলে |A ∩ B| কত?`,
      answer,
      [answer - 1, answer + 1, n],
      `A ∩ B-তে ${n} পর্যন্ত জোড় স্বাভাবিক সংখ্যাগুলো আছে; সংখ্যা ${answer}টি।`,
      index,
    );
  }
  const answer = `ℝ \\ {-${value}, ${value}}`;
  return mcq(
    `f(x) = 1/(x² - ${value * value}) ফাংশনের বাস্তব ডোমেইন কোনটি?`,
    answer,
    [`ℝ \\ {${value}}`, `ℝ \\ {-${value}}`, `ℝ`],
    `হর শূন্য হলে x² - ${value * value} = 0, অর্থাৎ x = ±${value}; তাই এ দুটি মান বাদ যাবে।`,
    index,
  );
};

const generateHigherMathAlgebra = (index) => {
  const value = Math.floor(index / 5) + 2;
  const type = index % 5;
  if (type === 0) {
    const offset = value % 6 + 2;
    const left = value - offset;
    const leftFactor = left < 0 ? `(x - ${Math.abs(left)})` : `(x + ${left})`;
    const rightFactor = `(x + ${value + offset})`;
    const answer = `${leftFactor}${rightFactor}`;
    return mcq(
      `(x + ${value})² - ${offset * offset} রাশিটির উৎপাদক কোনটি?`,
      answer,
      [`${leftFactor}²`, `(x + ${value})(x + ${offset})`, `(x + ${value})(x + ${value + offset})`],
      `বর্গের অন্তর সূত্রে (x + ${value})² - ${offset}² = (x + ${value} - ${offset})(x + ${value} + ${offset})।`,
      index,
    );
  }
  if (type === 1) {
    const a = value + 1;
    const b = value + 4;
    const answer = a + b;
    return mcq(
      `(x + ${a})(x + ${b}) বিস্তৃত করলে x-এর সহগ কত?`,
      answer,
      [a * b, a + b + 1, b - a],
      `গুণ করে পাই x² + (${a} + ${b})x + ${a * b}; x-এর সহগ ${answer}।`,
      index,
    );
  }
  if (type === 2) {
    const a = value + 3;
    const b = value + 5;
    const c = value + 2;
    const answer = `x${superscript(a + b - c)}`;
    return mcq(
      `(x${superscript(a)} × x${superscript(b)})/x${superscript(c)} সরল করলে কী হয়?`,
      answer,
      [`x${superscript(a + b + c)}`, `x${superscript(a * b - c)}`, `x${superscript(c)}`],
      `একই ভিত্তির ঘাতের ক্ষেত্রে ${a} + ${b} - ${c} = ${a + b - c}; তাই রাশিটি ${answer}।`,
      index,
    );
  }
  if (type === 3) {
    const x = value + 2;
    const a = value + 1;
    const b = value + 3;
    const answer = x * x + a * x + b;
    return mcq(
      `P(x) = x² + ${a}x + ${b} হলে P(${x}) কত?`,
      answer,
      [answer + x, answer - a, x * x + b],
      `P(${x}) = ${x}² + ${a}×${x} + ${b} = ${answer}।`,
      index,
    );
  }
  const answer = `(x - ${value})²`;
  return mcq(
    `x² - ${2 * value}x + ${value * value} রাশিটির উৎপাদক আকার কোনটি?`,
    answer,
    [`(x + ${value})²`, `(x - ${value})(x + ${value})`, `(x - ${2 * value})²`],
    `পূর্ণবর্গের সূত্রে x² - ${2 * value}x + ${value * value} = (x - ${value})²।`,
    index,
  );
};

const generatePhysics = (chapter, index) => {
  const value = Math.floor(index / 5) + 2;
  const type = index % 5;
  let answer;
  let question;
  let distractors;
  let explanation;

  if (chapter === 'গতি') {
    if (type === 0) {
      answer = 3 * value;
      question = `একটি বস্তুর আদিবেগ ${value} m/s, ত্বরণ 2 m/s² এবং সময় ${value} s হলে শেষ বেগ কত?`;
      distractors = [answer + 5, answer - 3, answer + 7];
      explanation = `v = u + at = ${value} + 2×${value} = ${answer} m/s।`;
    } else if (type === 1) {
      answer = value * value + 2 * value;
      question = `আদিবেগ 2 m/s ও ত্বরণ 2 m/s² হলে ${value} s-এ অতিক্রান্ত দূরত্ব কত?`;
      distractors = [answer + value, answer - value, answer + 2 * value];
      explanation = `s = ut + ½at² = 2×${value} + ${value}² = ${answer} m।`;
    } else if (type === 2) {
      answer = 2;
      question = `বেগ ${value} m/s থেকে ${3 * value} m/s হতে ${value} s লাগলে ত্বরণ কত?`;
      distractors = [1, 3, 4];
      explanation = `a = (v - u)/t = (${3 * value} - ${value})/${value} = 2 m/s²।`;
    } else if (type === 3) {
      answer = 3 * value;
      question = `একটি বস্তু ${3 * value * value} m পথ ${value} s-এ অতিক্রম করলে গড় দ্রুতি কত?`;
      distractors = [answer + 4, answer - 2, answer + 7];
      explanation = `গড় দ্রুতি = দূরত্ব/সময় = ${3 * value * value}/${value} = ${answer} m/s।`;
    } else {
      answer = 5 * value * value;
      question = `স্থির অবস্থা থেকে একটি বস্তু ${value} s মুক্তভাবে পড়লে (g = 10 m/s²) কত দূরত্ব অতিক্রম করবে?`;
      distractors = [answer + 10, answer - 5, 10 * value * value];
      explanation = `s = ½gt² = ½×10×${value}² = ${answer} m।`;
    }
  } else if (chapter === 'বল') {
    if (type === 0) {
      answer = 2 * value * value;
      question = `${value} kg ভরের বস্তুকে ${2 * value} m/s² ত্বরণ দিতে কত বল প্রয়োজন?`;
      distractors = [answer + value, answer - value, value * value];
      explanation = `নিউটনের দ্বিতীয় সূত্রে F = ma = ${value}×${2 * value} = ${answer} N।`;
    } else if (type === 1) {
      answer = 10 * value;
      question = `${value} kg ভরের বস্তুর ওজন কত? (g = 10 m/s²)`;
      distractors = [answer + 10, answer - 10, value];
      explanation = `ওজন W = mg = ${value}×10 = ${answer} N।`;
    } else if (type === 2) {
      answer = value * (value + 3);
      question = `${value} kg ভরের বস্তু ${value + 3} m/s বেগে চললে তার ভরবেগ কত?`;
      distractors = [answer + value, answer - value, value + value + 3];
      explanation = `ভরবেগ p = mv = ${value}×${value + 3} = ${answer} kg·m/s।`;
    } else if (type === 3) {
      answer = 3 * value * value;
      question = `${3 * value} N বল ${value} s ধরে ক্রিয়া করলে ঘাত কত?`;
      distractors = [answer + 3, answer - value, 3 * value];
      explanation = `ঘাত J = FΔt = ${3 * value}×${value} = ${answer} N·s।`;
    } else {
      answer = value;
      question = `একটি ${2 * value} kg বস্তুর ভরবেগ ${2 * value * value} kg·m/s হলে বেগ কত?`;
      distractors = [answer + 2, answer - 2, 2 * value * value];
      explanation = `v = p/m = ${2 * value * value}/${2 * value} = ${answer} m/s।`;
    }
  } else if (chapter === 'কাজ ক্ষমতা ও শক্তি') {
    if (type === 0) {
      answer = 2 * value * value;
      question = `${value} N বলের দিকে ${2 * value} m সরালে সম্পন্ন কাজ কত?`;
      distractors = [answer + value, answer - value, value * value];
      explanation = `W = Fs = ${value}×${2 * value} = ${answer} J।`;
    } else if (type === 1) {
      answer = 6;
      question = `${6 * value} J কাজ ${value} s-এ সম্পন্ন হলে ক্ষমতা কত?`;
      distractors = [8, 4, 12];
      explanation = `P = W/t = ${6 * value}/${value} = 6 W।`;
    } else if (type === 2) {
      answer = value * value * value;
      question = `${2 * value} kg ভরের বস্তু ${value} m/s বেগে চললে গতিশক্তি কত?`;
      distractors = [answer + value, answer - value, answer + 2 * value];
      explanation = `Eₖ = ½mv² = ½×${2 * value}×${value}² = ${answer} J।`;
    } else if (type === 3) {
      answer = 10 * value * value;
      question = `${value} kg ভরের বস্তুকে ${value} m উঁচুতে তুললে (g = 10 m/s²) বিভবশক্তি কত?`;
      distractors = [answer + 10, answer - 10, 10 * value];
      explanation = `Eₚ = mgh = ${value}×10×${value} = ${answer} J।`;
    } else {
      answer = '75%';
      question = `কোনো যন্ত্র ${3 * value} J কার্যকর কাজের জন্য ${4 * value} J শক্তি গ্রহণ করলে দক্ষতা কত?`;
      distractors = ['25%', '60%', '80%'];
      explanation = `দক্ষতা = (কার্যকর কাজ/গৃহীত শক্তি)×100% = (${3 * value}/${4 * value})×100% = 75%।`;
    }
  } else if (chapter === 'পদার্থের অবস্থা ও চাপ') {
    if (type === 0) {
      answer = 4;
      question = `${12 * value} N বল ${3 * value} m² ক্ষেত্রফলে লম্বভাবে ক্রিয়া করলে চাপ কত?`;
      distractors = [3, 9, 4 * value];
      explanation = `P = F/A = ${12 * value}/${3 * value} = 4 Pa।`;
    } else if (type === 1) {
      answer = 10000 * value;
      question = `ঘনত্ব 1000 kg/m³ তরলে ${value} m গভীরতায় চাপ কত? (g = 10 m/s²)`;
      distractors = [answer + 10000, answer - 10000, 1000 * value];
      explanation = `P = ρgh = 1000×10×${value} = ${answer} Pa।`;
    } else if (type === 2) {
      answer = 3;
      question = `${6 * value} kg ভরের পদার্থের আয়তন ${2 * value} m³ হলে ঘনত্ব কত?`;
      distractors = [2, 4, 3 * value];
      explanation = `ρ = m/V = ${6 * value}/${2 * value} = 3 kg/m³।`;
    } else if (type === 3) {
      answer = 16 * value;
      question = `একটি জলবাহী যন্ত্রে ছোট পিস্টনের ক্ষেত্রফল ${value} cm² ও বল ${4 * value} N। বড় পিস্টনের ক্ষেত্রফল ছোটটির 4 গুণ হলে উৎপন্ন বল কত?`;
      distractors = [answer + value, answer - value, 4 * value];
      explanation = `চাপ সমান থাকায় বড় পিস্টনে বল = ${4 * value}×4 = ${answer} N।`;
    } else {
      answer = 20 * value;
      question = `${2 * value} kg তরল স্থানচ্যুত হলে উত্থাপন বল কত? (g = 10 m/s²)`;
      distractors = [answer + 10, answer - 10, 2 * value];
      explanation = `আর্কিমিডিসের সূত্রে উত্থাপন বল = স্থানচ্যুত তরলের ওজন = ${2 * value}×10 = ${answer} N।`;
    }
  } else if (chapter === 'চল তড়িৎ') {
    if (type === 0) {
      answer = 4;
      question = `${12 * value} V বিভব পার্থক্য এবং ${3 * value} Ω রোধ হলে প্রবাহ কত?`;
      distractors = [3, 6, 4 * value];
      explanation = `ওহমের সূত্রে I = V/R = ${12 * value}/${3 * value} = 4 A।`;
    } else if (type === 1) {
      answer = 6 * value;
      question = `${2 * value} A প্রবাহ 3 Ω রোধে চালালে বিভব পার্থক্য কত?`;
      distractors = [answer + 3, answer - 3, 2 * value + 3];
      explanation = `V = IR = ${2 * value}×3 = ${answer} V।`;
    } else if (type === 2) {
      answer = 3 * value;
      question = `শ্রেণি সংযোগে ${value} Ω ও ${2 * value} Ω রোধ যুক্ত করলে তুল্য রোধ কত?`;
      distractors = [2 * value, answer + value, value];
      explanation = `শ্রেণি সংযোগে তুল্য রোধ = ${value} + ${2 * value} = ${answer} Ω।`;
    } else if (type === 3) {
      answer = 8 * value;
      question = `${4 * value} V বিভব পার্থক্যে 2 A প্রবাহ চললে বৈদ্যুতিক ক্ষমতা কত?`;
      distractors = [answer + 4, answer - 4, 2 * value];
      explanation = `P = VI = ${4 * value}×2 = ${answer} W।`;
    } else {
      answer = 3 * value * value;
      question = `${3 * value} A প্রবাহ ${value} s চললে কত আধান প্রবাহিত হয়?`;
      distractors = [answer + value, answer - value, 3 * value];
      explanation = `Q = It = ${3 * value}×${value} = ${answer} C।`;
    }
  } else {
    throw new Error(`No physics question generator for ${chapter}`);
  }
  return mcq(question, answer, distractors, explanation, index);
};

const generateVector = (index) => {
  const value = Math.floor(index / 5) + 2;
  const type = index % 5;
  if (type === 0) {
    const square = value * value + (value + 1) * (value + 1);
    return mcq(
      `a⃗ = ${value}î + ${value + 1}ĵ হলে |a⃗| কত?`,
      `√${square}`,
      [`${2 * value + 1}`, `√${square + 1}`, `√${square - 1}`],
      `|a⃗| = √(${value}² + ${value + 1}²) = √${square}।`,
      index,
    );
  }
  if (type === 1) {
    const answer = 5 * value;
    return mcq(
      `a⃗ = ${value}î + 2ĵ এবং b⃗ = 3î + ${value}ĵ হলে a⃗·b⃗ কত?`,
      answer,
      [answer + 3, answer - 3, answer + 7],
      `a⃗·b⃗ = ${value}×3 + 2×${value} = ${answer}।`,
      index,
    );
  }
  if (type === 2) {
    const answer = `(${value - 2})î + ${3 * value}ĵ`;
    return mcq(
      `a⃗ = ${value}î + ${2 * value}ĵ এবং b⃗ = -2î + ${value}ĵ হলে a⃗ + b⃗ কত?`,
      answer,
      [`${value + 1}î + ${3 * value + 1}ĵ`, `${value - 2}î + ${value + 1}ĵ`, `${2 * value + 1}î + ${3 * value + 2}ĵ`],
      `উপাংশ যোগ করলে a⃗ + b⃗ = (${value}-2)î + (${2 * value}+${value})ĵ = ${answer}।`,
      index,
    );
  }
  if (type === 3) {
    const a = 3 * value;
    const b = 4 * value;
    return mcq(
      `a⃗ = ${a}î + ${b}ĵ হলে a⃗-এর দিকের একক ভেক্টর কোনটি?`,
      '3/5 î + 4/5 ĵ',
      ['4/5 î + 3/5 ĵ', '3/4 î + 4/3 ĵ', '3î + 4ĵ'],
      `|a⃗| = 5${value}; তাই একক ভেক্টর = a⃗/|a⃗| = 3/5 î + 4/5 ĵ।`,
      index,
    );
  }
  const answer = 3 * value;
  return mcq(
    `a⃗ = ${value}î + ĵ এবং b⃗ = 2î + ${value}ĵ হলে a⃗·b⃗-এর মান কত?`,
    answer,
    [answer + 2, answer - 2, answer + 4],
    `a⃗·b⃗ = ${value}×2 + 1×${value} = ${3 * value};`,
    index,
  );
};

const generateProbability = (index) => {
  const value = Math.floor(index / 5) + 2;
  const type = index % 5;
  if (type === 0) {
    return mcq(
      `একটি বাক্সে ${value}টি লাল ও ${2 * value}টি নীল বল আছে। দৈবভাবে একটি বল তুললে লাল বল পাওয়ার সম্ভাবনা কত?`,
      '1/3',
      ['1/2', '2/3', '1/4'],
      `মোট বল ${3 * value}টি; লাল বল ${value}টি। সম্ভাবনা = ${value}/${3 * value} = 1/3।`,
      index,
    );
  }
  if (type === 1) {
    const sum = value + 1;
    const favorable = Math.max(0, 6 - Math.abs(7 - sum));
    const answer = `${favorable}/36`;
    return mcq(
      `দুটি সুষম ছক্কা একসঙ্গে নিক্ষেপে যোগফল ${sum} হওয়ার সম্ভাবনা কত?`,
      answer,
      [`${favorable + 1}/36`, `${favorable + 2}/36`, `${favorable + 3}/36`],
      `অনুকূল ফল ${favorable}টি এবং মোট ফল 36টি; সম্ভাবনা = ${answer}।`,
      index,
    );
  }
  if (type === 2) {
    const tosses = value;
    const answer = `1/${2 ** tosses}`;
    return mcq(
      `একটি সুষম মুদ্রা ${tosses} বার নিক্ষেপে প্রতিবারই Head পাওয়ার সম্ভাবনা কত?`,
      answer,
      [`1/${2 ** (tosses - 1)}`, `1/${2 ** (tosses + 1)}`, `${tosses}/${2 ** tosses}`],
      `প্রতিটি নিক্ষেপে Head-এর সম্ভাবনা 1/2; স্বাধীন ${tosses}টি নিক্ষেপে সম্ভাবনা = (1/2)^${tosses} = ${answer}।`,
      index,
    );
  }
  if (type === 3) {
    const red = value + 2;
    const blue = value + 5;
    const answer = fraction(red * (red - 1), (red + blue) * (red + blue - 1));
    return mcq(
      `একটি বাক্সে ${red}টি লাল ও ${blue}টি নীল বল আছে। প্রতিস্থাপন না করে পরপর দুটি বল তুললে দুটিই লাল হওয়ার সম্ভাবনা কত?`,
      answer,
      [fraction(red, red + blue), fraction(red * (red - 1), (red + blue) ** 2), fraction(red * (red + 1), (red + blue) * (red + blue - 1))],
      `সম্ভাবনা = (${red}/${red + blue})×(${red - 1}/${red + blue - 1}) = ${answer}।`,
      index,
    );
  }
  const total = 2 * value + 4;
  const answer = fraction(4, total);
  return mcq(
    `একটি প্যাকেটে 4টি টেক্কা ও ${2 * value}টি অন্য কার্ড আছে। দৈবভাবে একটি কার্ড তুললে টেক্কা পাওয়ার সম্ভাবনা কত?`,
    answer,
    [fraction(4, 2 * value), fraction(1, total), fraction(4, total + 1)],
    `মোট কার্ড ${total}টি; টেক্কা 4টি। সম্ভাবনা = 4/${total} = ${answer}।`,
    index,
  );
};

const makeNewQuestion = (code, chapter, index) => {
  if (code === 'hmath' && chapter === 'সেট ও ফাংশন') return generateHigherMathSets(index);
  if (code === 'hmath' && chapter === 'বীজগাণিতিক রাশি') return generateHigherMathAlgebra(index);
  if (code === 'hmath' && chapter === 'সমতলে ভেক্টর') return generateVector(index);
  if (code === 'hmath' && chapter === 'সম্ভাবনা') return generateProbability(index);
  if (code === 'phy') return generatePhysics(chapter, index);
  throw new Error(`No question generator for ${code} | ${chapter}`);
};

const gaps = [];
for (const [code, subject, chapters] of subjects) {
  const subjectGroups = groups.get(subject);
  for (const [chapterIndex, chapter] of chapters.entries()) {
    const rows = subjectGroups.get(chapter);
    if (rows.length > 200) rows.length = 200;
    if (rows.length < 200) gaps.push({ code, subject, chapter, chapterIndex, rows });
  }
}
const sourceUniqueQuestions = seenQuestions.size;

for (const gap of gaps) {
  const { code, subject, chapter, chapterIndex, rows } = gap;
  for (let index = 0; rows.length < 200; index += 1) {
    const generated = makeNewQuestion(code, chapter, index);
    const normalized = questionKey(generated.question);
    if (seenQuestions.has(normalized)) {
      throw new Error(`Generated duplicate question: ${generated.question}`);
    }
    seenQuestions.add(normalized);
    rows.push({ ...generated, subject, chapter });
  }
  for (const [index, item] of rows.entries()) {
    item.id = `${code}_ch${String(chapterIndex + 1).padStart(2, '0')}_${String(index + 1).padStart(3, '0')}`;
    item.subject = subject;
    item.chapter = chapter;
    if (!Array.isArray(item.options) || item.options.length !== 4
      || !Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3
      || !item.question || !item.explanation || !['easy', 'medium', 'hard'].includes(item.difficulty)) {
      throw new Error(`Invalid MCQ generated or retained: ${item.id}`);
    }
  }
}
for (const [, subject, chapters] of subjects) {
  for (const [chapterIndex, chapter] of chapters.entries()) {
    const rows = groups.get(subject).get(chapter);
    for (const [index, item] of rows.entries()) {
      item.id = `${subjects.find((entry) => entry[1] === subject)[0]}_ch${String(chapterIndex + 1).padStart(2, '0')}_${String(index + 1).padStart(3, '0')}`;
      item.subject = subject;
      item.chapter = chapter;
    }
  }
}

const result = subjects.flatMap(([, subject, chapters]) => chapters.flatMap((chapter) => groups.get(subject).get(chapter)));
const ids = new Set();
const finalQuestions = new Set();
for (const item of result) {
  const key = questionKey(item.question);
  if (finalQuestions.has(key)) throw new Error(`Duplicate final question: ${item.question}`);
  finalQuestions.add(key);
  if (ids.has(item.id)) throw new Error(`Duplicate final ID: ${item.id}`);
  ids.add(item.id);
  if (!/^[a-z0-9]+_ch\d{2}_\d{3}$/.test(item.id)) throw new Error(`Invalid ID format: ${item.id}`);
  if (!Array.isArray(item.options) || item.options.length !== 4
    || !Number.isInteger(item.correctIndex) || item.correctIndex < 0 || item.correctIndex > 3
    || !item.question || !item.explanation || !['easy', 'medium', 'hard'].includes(item.difficulty)) {
    throw new Error(`Invalid final MCQ: ${item.id}`);
  }
}
const chapterCounts = subjects.flatMap(([, subject, chapters]) => chapters.map((chapter) => ({
  subject,
  chapter,
  count: groups.get(subject).get(chapter).length,
})));
if (result.length !== subjects.reduce((sum, [, , chapters]) => sum + chapters.length * 200, 0)
  || chapterCounts.length !== 189 || chapterCounts.some(({ count }) => count !== 200)) {
  throw new Error('Final chapter or row count validation failed');
}

if (process.argv.includes('--write')) {
  fs.writeFileSync('src/data/mcqs.json', JSON.stringify(result, null, 2) + '\n', 'utf8');
  if (fs.existsSync('src/data/mcqs_batch_50.json')) fs.unlinkSync('src/data/mcqs_batch_50.json');
  console.log(`✅ FINAL DONE: mcqs.json = ${result.length} MCQ (${chapterCounts.length} x 200), 0 duplicate, ONLY ONE FILE`);
} else {
  console.log(JSON.stringify({
    sourceRows: sourceRecords.length,
    finalRows: result.length,
    chapters: chapterCounts.length,
    duplicateQuestionsRemoved: sourceRecords.length - sourceUniqueQuestions,
    gaps: gaps.map(({ code, chapter, rows }) => ({ code, chapter, count: 200 })),
    generatedRows: result.length - sourceUniqueQuestions,
  }, null, 2));
}
