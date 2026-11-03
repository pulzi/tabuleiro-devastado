#!/usr/bin/env node
/*
 * Testes do sorteador (sem dependências). Rode com:  node test.js
 * Gera centenas de perguntas de cada nível e confere as contas, as casas decimais,
 * a decisão do nível 3, o não empate das lojas no nível 4(c) e as justificativas.
 */
'use strict';

const Core = require('./app.js');
const { CONFIG } = Core;

const PER_BLOCK = 400; // perguntas por nível e por bloco
let checks = 0;
let failures = 0;

function check(cond, msg, extra) {
  checks++;
  if (cond) return;
  failures++;
  if (failures <= 40) console.error('FALHOU: ' + msg + (extra ? '\n   ' + JSON.stringify(extra) : ''));
}

const near = (a, b) => Math.abs(a - b) < 1e-9;
const J = (C, ratePct, t) => (C * ratePct * t) / 100; // fórmula independente do app
const prices = CONFIG.blocks.map((b) => b.price);
const isMultipleOfHalf = (x) => near(x * 2, Math.round(x * 2));
let notHalfCount = 0;

function answerText(field) {
  if (field.kind === 'choice' || field.kind === 'justification') return field.answer;
  return Core.fmtNumber(field.answer, 2); // com vírgula, como no Brasil
}

function correctAnswers(q) {
  const a = {};
  q.fields.forEach((f) => { a[f.id] = answerText(f); });
  return a;
}

function fieldById(q, id) { return q.fields.filter((f) => f.id === id)[0]; }

// Regras comuns a todas as perguntas.
function checkCommon(q, label) {
  check(Core.validateQuestion(q), label + ': validateQuestion', q.key);
  check(prices.includes(q.data.C), label + ': C fora dos preços', q.data);

  const numbers = Object.values(q.data).concat(q.fields.filter((f) => typeof f.answer === 'number').map((f) => f.answer));
  numbers.forEach((n) => {
    check(Core.hasMax2Decimals(n), label + ': mais de 2 casas decimais', { key: q.key, n });
    if (!isMultipleOfHalf(n)) notHalfCount++;
  });

  ['i', 'j', 'iA', 'iB'].forEach((k) => {
    if (k in q.data) check(CONFIG.rates.includes(q.data[k]), label + ': taxa fora do conjunto', q.data);
  });
  ['t', 'tA', 'tB'].forEach((k) => {
    if (k in q.data) check(CONFIG.times.includes(q.data[k]), label + ': tempo fora do conjunto', q.data);
  });

  // Roletas: valor sorteado faz parte da roleta e bate com os dados.
  q.wheelGroups.forEach((g) => g.wheels.forEach((w) => {
    check(w.values.includes(w.value), label + ': valor fora da roleta', w);
    check(w.value === q.data[w.key], label + ': roleta diferente dos dados', { key: w.key, w: w.value, d: q.data[w.key] });
  }));

  // Dados mostrados batem com os dados da pergunta; valor desconhecido não aparece.
  q.givens.forEach((g) => {
    if (g.unknown) check(g.value === null && g.text === '?', label + ': incógnita vazou', g);
    else check(g.value === q.data[g.key], label + ': dado mostrado diferente', g);
  });

  check(typeof q.story === 'string' && q.story.length > 40, label + ': enunciado vazio');
  check(Array.isArray(q.steps) && q.steps.length >= 2, label + ': resolução vazia');

  // Justificativas: 3 frases distintas, só uma certa, e o gabarito aponta para ela.
  const just = q.fields.filter((f) => f.kind === 'justification')[0];
  const hasDecision = q.fields.some((f) => f.kind === 'choice');
  check(!!just === hasDecision, label + ': justificativa só onde há decisão');
  if (just) {
    const texts = just.options.map((o) => o.text);
    check(just.options.length === 3, label + ': justificativa sem 3 frases');
    check(new Set(texts).size === 3, label + ': justificativas repetidas', texts);
    check(just.options.filter((o) => o.correct).length === 1, label + ': justificativa sem exatamente 1 certa');
    check(just.options.find((o) => o.correct).value === just.answer, label + ': gabarito da justificativa');
    check(new Set(just.options.map((o) => o.value)).size === 3, label + ': valores das opções repetidos');
  }

  // Correção: gabarito aceito; cada campo errado sozinho reprova; tempo esgotado reprova.
  const ok = Core.gradeAnswers(q, correctAnswers(q), false);
  check(ok.correct, label + ': gabarito não foi aceito', { key: q.key, fields: ok.fields });
  check(!Core.gradeAnswers(q, correctAnswers(q), true).correct, label + ': tempo esgotado deveria reprovar');
  q.fields.forEach((f) => {
    const answers = correctAnswers(q);
    if (f.kind === 'choice' || f.kind === 'justification') {
      answers[f.id] = f.options.find((o) => o.value !== f.answer).value;
    } else {
      answers[f.id] = Core.fmtNumber(f.answer + 0.5, 2);
    }
    const res = Core.gradeAnswers(q, answers, false);
    check(!res.correct, label + ': erro no campo ' + f.id + ' não reprovou');
    check(res.fields.filter((r) => !r.ok).map((r) => r.id).join() === f.id, label + ': campo errado não indicado', f.id);
  });
}

function checkLevel(q, level) {
  const d = q.data;
  const label = 'nível ' + level + (q.sub ? q.sub : '') + ' ' + q.key;
  check(q.level === level, label + ': nível errado');
  checkCommon(q, label);

  if (level === 1 || level === 2) {
    check(near(fieldById(q, 'J').answer, J(d.C, d.i, d.t)), label + ': J errado');
    if (level === 2) check(near(fieldById(q, 'M').answer, d.C + J(d.C, d.i, d.t)), label + ': M errado');
    else check(q.fields.length === 1, label + ': nível 1 deve ter só o campo J');
    check(q.steps.some((s) => s.math && s.math.indexOf(Core.fmtNumber(J(d.C, d.i, d.t), 2)) >= 0), label + ': resolução sem o valor de J');
  }

  if (level === 3) {
    const pago = J(d.C, d.i, d.t);
    const ganho = J(d.C, d.j, d.t);
    check(d.i !== d.j, label + ': j igual a i');
    check(near(fieldById(q, 'Jp').answer, pago), label + ': juros pagos errado');
    check(near(fieldById(q, 'R').answer, ganho), label + ': rendimento errado');
    const dec = fieldById(q, 'dec').answer;
    check(dec === (ganho > pago ? 'parcelado' : 'vista'), label + ': decisão inconsistente', { pago, ganho, dec });
    const certa = fieldById(q, 'just').options.find((o) => o.correct).text;
    check(dec === 'parcelado' ? /rendimento é maior/.test(certa) : /juros cobrados são maiores/.test(certa), label + ': justificativa certa não combina', certa);
  }

  if (level === 4 && q.sub === 'a') {
    const i = (d.J / (d.C * d.t)) * 100;
    check(near(fieldById(q, 'i').answer, i), label + ': taxa errada');
    check(CONFIG.rates.some((r) => near(r, i)), label + ': taxa fora do conjunto');
    check(q.story.indexOf(fieldById(q, 'i').answer + '%') < 0, label + ': enunciado entrega a taxa');
    check(q.wheelGroups[0].wheels.find((w) => w.key === 'i').secret, label + ': roleta da taxa deveria ser secreta');
  }

  if (level === 4 && q.sub === 'b') {
    const t = d.J / ((d.C * d.i) / 100);
    check(near(fieldById(q, 't').answer, t), label + ': tempo errado');
    check(CONFIG.times.some((x) => near(x, t)), label + ': tempo fora do conjunto');
    check(q.story.indexOf(Core.fmtMonths(fieldById(q, 't').answer)) < 0, label + ': enunciado entrega o tempo');
    check(q.wheelGroups[0].wheels.find((w) => w.key === 't').secret, label + ': roleta do tempo deveria ser secreta');
  }

  if (level === 4 && q.sub === 'c') {
    const JA = J(d.C, d.iA, d.tA), MA = d.C + JA;
    const JB = J(d.C, d.iB, d.tB), MB = d.C + JB;
    check(!near(MA, MB), label + ': lojas empatadas');
    check(near(fieldById(q, 'JA').answer, JA) && near(fieldById(q, 'MA').answer, MA), label + ': Loja A errada');
    check(near(fieldById(q, 'JB').answer, JB) && near(fieldById(q, 'MB').answer, MB), label + ': Loja B errada');
    const win = MA < MB ? 'A' : 'B';
    check(fieldById(q, 'dec').answer === win, label + ': loja mais barata errada');
    const certa = fieldById(q, 'just').options.find((o) => o.correct).text;
    check(certa.indexOf('Loja ' + win) >= 0, label + ': justificativa certa cita a loja errada', certa);
  }
}

/* ---------- 1. Centenas de perguntas por nível e bloco ---------- */

const levelCounts = {};
let parcelado = 0, total3 = 0;
const subCounts = { a: 0, b: 0, c: 0 };

for (const level of [1, 2, 3, 4]) {
  for (const block of CONFIG.blocks) {
    let lastKey = null;
    for (let n = 0; n < PER_BLOCK; n++) {
      const q = Core.generateQuestion({ levels: [level], blockId: block.id, lastKey });
      check(q.key !== lastKey, 'pergunta repetida duas vezes seguidas', q.key);
      check(q.block.id === block.id, 'bloco errado');
      lastKey = q.key;
      checkLevel(q, level);
      levelCounts[level] = (levelCounts[level] || 0) + 1;
      if (level === 3) { total3++; if (fieldById(q, 'dec').answer === 'parcelado') parcelado++; }
      if (level === 4) subCounts[q.sub]++;
    }
  }
}

// Subtipos do nível 4 forçados, para garantir cobertura.
for (const sub of ['a', 'b', 'c']) {
  for (const block of CONFIG.blocks) {
    for (let n = 0; n < 200; n++) checkLevel(Core.buildQuestion(4, block.id, sub), 4);
  }
}

const share3 = parcelado / total3;
check(share3 > 0.42 && share3 < 0.58, 'nível 3: parcelado deveria compensar cerca de metade das vezes', share3);
const n4 = subCounts.a + subCounts.b + subCounts.c;
['a', 'b', 'c'].forEach((s) => check(subCounts[s] / n4 > 0.25 && subCounts[s] / n4 < 0.42, 'nível 4: subtipo ' + s + ' fora de 1/3', subCounts));

/* ---------- 2. Todas as combinações possíveis têm até 2 casas ---------- */

for (const C of prices) for (const i of CONFIG.rates) for (const t of CONFIG.times) {
  const j = Core.interest(C, i, t);
  check(near(j, J(C, i, t)), 'interest() diferente da fórmula', { C, i, t });
  check(Core.hasMax2Decimals(j) && Core.hasMax2Decimals(C + j), 'combinação com mais de 2 casas', { C, i, t });
  check(Core.hasMax2Decimals((C * i) / 100), 'C × i com mais de 2 casas', { C, i });
}

/* ---------- 3. Sorteio entre níveis marcados ---------- */

const mix = { 1: 0, 3: 0 };
let lastKey = null;
for (let n = 0; n < 3000; n++) {
  const q = Core.generateQuestion({ levels: [1, 3], blockId: '3x2', lastKey });
  check(q.level === 1 || q.level === 3, 'sorteou nível não marcado', q.level);
  check(q.key !== lastKey, 'pergunta repetida (níveis misturados)', q.key);
  lastKey = q.key;
  mix[q.level]++;
}
check(Math.abs(mix[1] / 3000 - 0.5) < 0.06, 'níveis marcados deveriam ter a mesma chance', mix);

let threw = false;
try { Core.generateQuestion({ levels: [], blockId: '2x2' }); } catch (e) { threw = true; }
check(threw, 'sem nível marcado deveria dar erro');

/* ---------- 4. Leitura de números (vírgula ou ponto) ---------- */

const parseCases = [
  ['12,50', 12.5], ['12.50', 12.5], ['12,5', 12.5], ['R$ 12,50', 12.5], ['R$12.5', 12.5],
  [' 15 ', 15], ['15%', 15], ['3 meses', 3], ['1.234,50', 1234.5], ['1,234.50', 1234.5],
  ['0,10', 0.1], ['', null], ['   ', null], ['abc', null], ['R$', null], [',', null], [null, null], [undefined, null]
];
parseCases.forEach(([raw, want]) => {
  const got = Core.parseNumber(raw);
  check(want === null ? got === null : near(got, want), 'parseNumber(' + JSON.stringify(raw) + ')', { got, want });
});

/* ---------- 5. Formato brasileiro ---------- */

check(Core.fmtMoney(12.5) === 'R$ 12,50', 'fmtMoney(12.5)', Core.fmtMoney(12.5));
check(Core.fmtMoney(70) === 'R$ 70,00', 'fmtMoney(70)');
check(Core.fmtNumber(1234.5, 2) === '1.234,50', 'fmtNumber milhar');
check(Core.fmtRateDec(5) === '0,05' && Core.fmtRateDec(15) === '0,15', 'fmtRateDec');
check(Core.fmtMonths(1) === '1 mês' && Core.fmtMonths(3) === '3 meses', 'fmtMonths');

/* ---------- 6. Tolerância de 0,01 e formas aceitas ---------- */

const q1 = Core.buildQuestion(1, '3x2');
const jAns = fieldById(q1, 'J').answer;
const grade1 = (txt) => Core.gradeAnswers(q1, { J: txt }, false).correct;
check(grade1(Core.fmtNumber(jAns, 2)), 'aceita com vírgula');
check(grade1(String(jAns)), 'aceita com ponto');
check(grade1('R$ ' + Core.fmtNumber(jAns, 2)), 'aceita com R$');
check(grade1(Core.fmtNumber(jAns + 0.01, 2)), 'aceita diferença de 0,01');
check(grade1(Core.fmtNumber(jAns - 0.01, 2)), 'aceita diferença de -0,01');
check(!grade1(Core.fmtNumber(jAns + 0.02, 2)), 'recusa diferença de 0,02');
check(!grade1(''), 'recusa em branco');

const q4a = Core.buildQuestion(4, '2x2', 'a');
const iAns = fieldById(q4a, 'i').answer;
check(Core.gradeAnswers(q4a, { i: String(iAns) }, false).correct, 'taxa em %');
check(Core.gradeAnswers(q4a, { i: iAns + '%' }, false).correct, 'taxa com o símbolo %');
check(Core.gradeAnswers(q4a, { i: Core.fmtRateDec(iAns) }, false).correct, 'taxa na forma decimal (0,10)');

/* ---------- Resultado ---------- */

console.log('Perguntas geradas por nível:', JSON.stringify(levelCounts));
console.log('Nível 3: parcelado compensa em ' + (share3 * 100).toFixed(1) + '% das perguntas');
console.log('Nível 4: subtipos', JSON.stringify(subCounts));
if (notHalfCount) console.warn('Aviso: ' + notHalfCount + ' valores não são múltiplos de 0,50 (contas mais difíceis de cabeça).');
else console.log('Todos os valores são múltiplos de 0,50.');

if (failures) {
  console.error('\n' + failures + ' de ' + checks + ' verificações falharam.');
  process.exit(1);
}
console.log('\nOK: ' + checks + ' verificações passaram.');
