import fs from 'node:fs';

const file = 'src/data/mcqs.json';
const mcqs = JSON.parse(fs.readFileSync(file, 'utf8'));
const superscript = (value) => String(value).replace(/[0-9-]/g, (digit) => ({
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '-': '⁻',
}[digit]));
let repairedFactorizations = 0;
let repairedExponents = 0;

for (const item of mcqs) {
  if (!item.id.startsWith('hmath_ch02_') || Number(item.id.slice(-3)) <= 50) continue;

  const factorQuestion = item.question.match(/^\(x \+ (\d+)\)² - (\d+) রাশিটির উৎপাদক কোনটি\?$/);
  if (factorQuestion) {
    const center = Number(factorQuestion[1]);
    const square = Number(factorQuestion[2]);
    const offset = Math.sqrt(square);
    if (!Number.isInteger(offset)) throw new Error(`Unexpected factor question: ${item.id}`);
    const left = center - offset;
    const leftFactor = left < 0 ? `x - ${Math.abs(left)}` : `x + ${left}`;
    const answer = `(${leftFactor})(x + ${center + offset})`;
    item.options = item.options.map((option) => option
      .replace(/\(x \+ -(\d+)\)/g, '(x - $1)')
      .replace(/\(x - -(\d+)\)/g, '(x + $1)'));
    item.options[item.correctIndex] = answer;
    repairedFactorizations += 1;
  }

  if (item.question.includes('সরল করলে কী হয়?') && item.question.includes('x^')) {
    item.question = item.question.replace(/x\^(\d+)/g, (_, power) => `x${superscript(power)}`);
    item.options = item.options.map((option) => option.replace(/^x\^(\d+)$/, (_, power) => `x${superscript(power)}`));
    item.explanation = item.explanation.replace(/x\^(\d+)/g, (_, power) => `x${superscript(power)}`);
    repairedExponents += 1;
  }
}

if (repairedFactorizations !== 30 || repairedExponents !== 30) {
  throw new Error(`Unexpected repair counts: factorizations=${repairedFactorizations}, exponents=${repairedExponents}`);
}
fs.writeFileSync(file, JSON.stringify(mcqs, null, 2) + '\n', 'utf8');
console.log(`Repaired ${repairedFactorizations} factorization and ${repairedExponents} exponent MCQs.`);
