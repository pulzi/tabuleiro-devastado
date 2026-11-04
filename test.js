#!/usr/bin/env node
/*
 * Testes do Tabuleiro Devastado (sem dependências). Rode com:  node test.js
 * Confere o banco de perguntas, as contas de juros, o sorteio das perguntas,
 * o dinheiro, a loja, o sorteio dos blocos, os pontos e o jogo salvo.
 */
'use strict';

const Core = require('./app.js');
const { CONFIG } = Core;

let checks = 0;
let failures = 0;

function check(cond, msg, extra) {
  checks++;
  if (cond) return;
  failures++;
  if (failures <= 40) console.error('FALHOU: ' + msg + (extra !== undefined ? '\n   ' + JSON.stringify(extra) : ''));
}

const near = (a, b) => Math.abs(a - b) < 1e-9;
const LEVELS = CONFIG.levels.map((l) => l.id);
const THEMES = ['fraterna', 'moradia', 'qualidade', 'desigualdade', 'solidariedade'];

// Roda fn com a chance de juros trocada (0 = nunca, 1 = sempre).
function withJurosChance(p, fn) {
  const old = CONFIG.juros.chance;
  CONFIG.juros.chance = p;
  try { return fn(); } finally { CONFIG.juros.chance = old; }
}

/* ---------- 1. Banco de perguntas ---------- */

const problems = Core.checkBank(Core.RAW_BANK);
check(problems.length === 0, 'perguntas.js tem problemas', problems);
check(Core.BANK.length === Core.RAW_BANK.length, 'alguma pergunta ficou de fora do jogo');

THEMES.forEach((theme) => LEVELS.forEach((lv) => {
  const n = Core.BANK.filter((q) => q.theme === theme && q.level === lv).length;
  check(n >= 4, 'poucas perguntas em ' + theme + '/' + lv, n);
}));

// Tamanho das alternativas: parecido, e a certa nunca é a mais comprida nem a mais curta.
const lengthProblems = Core.checkLengths(Core.RAW_BANK);
check(lengthProblems.length === 0, 'perguntas.js: tamanho das alternativas', lengthProblems);

let shownShortest = 0;
let shownTotal = 0;
Core.BANK.forEach((q) => {
  const lv = Core.levelById(q.level);
  check(q.timeMs === 30000, q.id + ': pergunta do banco deve ter 30 s');
  check(q.options === lv.options, q.id + ': número de alternativas do nível');
  check(q.wrong.indexOf(q.answer) < 0, q.id + ': a certa está nas erradas');

  // Regra independente do app: todas parecidas e a certa com uma errada maior e outra menor (ou igual).
  const all = [q.answer].concat(q.wrong).map((s) => s.length);
  const max = Math.max(...all);
  const min = Math.min(...all);
  check(min >= max * 0.85 || max - min <= 5, q.id + ': tamanhos muito diferentes', all);
  check(q.wrong.some((w) => w.length > q.answer.length), q.id + ': a certa é a mais comprida', all);
  check(q.wrong.some((w) => w.length <= q.answer.length), q.id + ': a certa é a mais curta', all);

  for (let n = 0; n < 60; n++) {
    const o = Core.buildOptions(q);
    check(o.options.length === lv.options, q.id + ': alternativas na tela', o.options.length);
    check(new Set(o.options).size === o.options.length, q.id + ': alternativas repetidas');
    check(o.options[o.correct] === q.answer, q.id + ': índice da certa');
    check(o.options.filter((t) => t === q.answer).length === 1, q.id + ': certa aparece uma vez só');
    // Na tela, a certa nunca é a mais comprida (sempre aparece uma errada maior).
    const others = o.options.filter((t, k) => k !== o.correct);
    check(others.some((t) => t.length > q.answer.length), q.id + ': na tela, a certa ficou sendo a mais comprida', o.options);
    shownTotal++;
    if (others.every((t) => t.length > q.answer.length)) shownShortest++;
  }
});
const shortShare = shownShortest / shownTotal;
check(shortShare < 0.5, 'a certa não pode virar quase sempre a mais curta', shortShare);

// O verificador pega erros comuns de quem edita o perguntas.js.
const bad = Core.checkBank([
  { id: 'x1', tema: 'fraterna', nivel: 'dificil', pergunta: 'P?', certa: 'A', erradas: ['B', 'C'], explicacao: 'E' },
  { id: 'x1', tema: 'fraterna', nivel: 'facil', pergunta: 'P?', certa: 'A', erradas: ['B', 'C'], explicacao: 'E' },
  { id: 'x2', tema: 'futebol', nivel: 'facil', pergunta: 'P?', certa: 'A', erradas: ['B', 'C'], explicacao: 'E' },
  { id: 'x3', tema: 'fraterna', nivel: 'facil', pergunta: 'P?', certa: 'A', erradas: ['a', 'C'], explicacao: 'E' },
  { id: 'x4', tema: 'fraterna', nivel: 'medio', pergunta: '', certa: 'A', erradas: ['B', 'C', 'D'] }
]);
['x1: o nível Difícil precisa', 'x1: id repetido', 'x2: tema desconhecido', 'x3: alternativas repetidas', 'x4: falta "pergunta"', 'x4: falta "explicacao"']
  .forEach((txt) => check(bad.some((p) => p.indexOf(txt) >= 0), 'checkBank deveria acusar: ' + txt, bad));

// O verificador de tamanho pega a certa mais comprida, a mais curta e tamanhos muito diferentes.
const badLen = Core.checkLengths([
  { id: 'L1', certa: 'Uma resposta certa bem comprida.', erradas: ['Uma errada curtinha.', 'Outra errada curta.'] },
  { id: 'L2', certa: 'Certa curta.', erradas: ['Errada maior que a certa.', 'Outra errada maior ainda.'] },
  { id: 'L3', certa: 'Uma alternativa de tamanho médio.', erradas: ['Curta.', 'Uma errada bem mais comprida que todas as outras.'] },
  { id: 'L4', certa: 'Tamanho bem parecido aqui.', erradas: ['Tamanho bem parecido ali!', 'Tamanho bem parecido acolá.'] }
]);
['L1: a certa (32 letras) é a mais comprida', 'L2: a certa (12 letras) é a mais curta', 'L3: alternativas com tamanhos muito diferentes']
  .forEach((txt) => check(badLen.some((p) => p.indexOf(txt) >= 0), 'checkLengths deveria acusar: ' + txt, badLen));
check(!badLen.some((p) => p.indexOf('L4') >= 0), 'checkLengths não deveria acusar alternativas parecidas', badLen);

// buildOptions troca uma errada sorteada se nenhuma for maior que a certa.
const fake = { answer: 'Certa de tamanho 22 ..', wrong: ['Curta 1', 'Curta 2', 'Curta 3', 'Errada maior que a certa'], options: 3 };
for (let n = 0; n < 200; n++) {
  const o = Core.buildOptions(fake);
  check(o.options.indexOf('Errada maior que a certa') >= 0, 'buildOptions deveria mostrar a errada maior', o.options);
}

/* ---------- 2. Contas de juros ---------- */

const Jf = (C, i, t) => (C * i * t) / 100; // fórmula independente do app
const money = (x) => Core.fmtMoney(x);
const kindsSeen = {};

LEVELS.forEach((lv) => {
  for (let n = 0; n < 1500; n++) {
    const q = Core.buildJuros(lv);
    const d = q.data;
    const label = 'juros ' + lv + ' ' + q.id;
    kindsSeen[lv + d.kind] = (kindsSeen[lv + d.kind] || 0) + 1;
    check(q.theme === 'juros' && q.level === lv, label + ': tema/nível');
    check(q.timeMs === 60000, label + ': juros deve ter 60 s');
    check(q.options === 4, label + ': juros deve ter 4 alternativas');
    check(q.wrong.length === 3, label + ': juros precisa de 3 erradas', q.wrong);
    check(CONFIG.blocks.some((b) => b.price === d.C), label + ': capital fora dos preços dos blocos');
    check(near(d.J, Jf(d.C, d.i, d.t)), label + ': J errado');
    check(Core.hasMax2Decimals(d.J) && Core.hasMax2Decimals(d.M), label + ': mais de 2 casas', d);
    if (lv === 'facil') check(d.t === 1 && d.kind === 'J', label + ': fácil = juros de 1 mês');
    if (lv === 'medio') check(d.kind === 'J' && d.t > 1, label + ': médio = J com mais de 1 mês');
    if (lv === 'dificil') check(d.kind === 'M' || d.kind === 'i', label + ': difícil = montante ou taxa');
    const want = d.kind === 'J' ? money(Jf(d.C, d.i, d.t)) : d.kind === 'M' ? money(d.C + Jf(d.C, d.i, d.t)) : d.i + '% ao mês';
    check(q.answer === want, label + ': resposta certa', { got: q.answer, want });
    check(new Set([q.answer].concat(q.wrong)).size === 4, label + ': alternativas repetidas', [q.answer].concat(q.wrong));
    check(q.wrong.every((w) => !/R\$ 0,00|R\$ -|^0%|^-/.test(w)), label + ': errada zerada ou negativa', q.wrong);
    if (d.kind === 'i') check(q.text.indexOf(d.i + '%') < 0, label + ': o enunciado entrega a taxa');
    check(q.why.indexOf(q.answer.replace(' ao mês', '')) >= 0, label + ': explicação sem a resposta', q.why);
    const o = Core.buildOptions(q);
    check(o.options.length === 4 && o.options[o.correct] === q.answer, label + ': alternativas na tela');
    // Tamanho: valores errados com quase o mesmo número de caracteres e a certa nunca a mais comprida.
    check(q.wrong.every((w) => Math.abs(w.length - q.answer.length) <= 2), label + ': tamanhos muito diferentes', [q.answer].concat(q.wrong));
    check(q.wrong.some((w) => w.length >= q.answer.length), label + ': a certa é a mais comprida', [q.answer].concat(q.wrong));
  }
});
check(kindsSeen.dificilM > 300 && kindsSeen.dificili > 300, 'difícil deveria sortear montante e taxa', kindsSeen);

/* ---------- 3. Sorteio das perguntas ---------- */

// Chance dos juros perto de 10%.
let jurosCount = 0;
const N = 20000;
const g0 = Core.createGame(['A']);
for (let n = 0; n < N; n++) {
  const q = Core.pickQuestion(g0, LEVELS[n % 3]);
  if (q.theme === 'juros') jurosCount++;
  else check(q.level === LEVELS[n % 3], 'pergunta de outro nível', q.id);
}
const share = jurosCount / N;
check(share > 0.085 && share < 0.115, 'juros deveriam cair em ~10% das vezes', share);

// Sem repetir até acabar o estoque do nível; depois recomeça sem repetir a última.
withJurosChance(0, () => {
  LEVELS.forEach((lv) => {
    const g = Core.createGame(['A']);
    const pool = Core.BANK.filter((q) => q.level === lv).length;
    const seen = new Set();
    for (let n = 0; n < pool; n++) seen.add(Core.pickQuestion(g, lv).id);
    check(seen.size === pool, 'repetiu pergunta antes de acabar o estoque (' + lv + ')', { seen: seen.size, pool });
    const last = g.lastQuestionId;
    const next = Core.pickQuestion(g, lv);
    check(next.id !== last, 'repetiu a última pergunta ao recomeçar (' + lv + ')');
    // Temas do nível aparecem todos.
    const themes = new Set();
    for (let n = 0; n < 200; n++) themes.add(Core.pickQuestion(g, lv).theme);
    check(themes.size === THEMES.length, 'faltou tema no sorteio (' + lv + ')', [...themes]);
  });
});
withJurosChance(1, () => check(Core.pickQuestion(Core.createGame(['A']), 'medio').theme === 'juros', 'chance 1 deveria dar juros'));

/* ---------- 4. Pontos ---------- */

const pts = { '2x2': 4, '3x2': 6, '4x2': 8 };
Object.keys(pts).forEach((id) => {
  check(Core.studs(id) === pts[id], 'bolinhas do ' + id);
  check(Core.blockPoints(id, 'blue') === pts[id], 'pontos do ' + id + ' na casa azul');
  check(Core.blockPoints(id, 'red') === pts[id] * 2, 'pontos do ' + id + ' na casa vermelha (dobro)');
});
check(Core.blockPoints('2x2', 'roxa') === 0 && Core.blockPoints('9x9', 'red') === 0, 'casa ou bloco inválido vale 0');
check(Core.blockById('3x2').price === 50 && Core.blockById('2x2').price === 20 && Core.blockById('4x2').price === 70, 'preços dos blocos');
check(Core.levelById('facil').reward === 20 && Core.levelById('medio').reward === 50 && Core.levelById('dificil').reward === 70, 'prêmios da dificuldade');
check(Core.levelById('facil').options === 3 && Core.levelById('medio').options === 4 && Core.levelById('dificil').options === 5, 'alternativas da dificuldade');

/* ---------- 5. Uma partida inteira ---------- */

// Responde certo (ou errado) a pergunta da vez.
function answer(g, right, now) {
  const q = g.turn.question;
  const idx = right ? q.correct : (q.correct + 1) % q.options.length;
  return Core.answerQuestion(g, idx, now === undefined ? g.turn.startedAt + 1000 : now);
}

const g = Core.createGame(['  Ana  ', '', 'Bia']);
check(g.players.length === 3, '3 jogadores');
check(g.players[0].name === 'Ana' && g.players[1].name === 'Jogador 2' && g.players[2].name === 'Bia', 'nomes (vazio vira "Jogador N")', g.players.map((p) => p.name));
check(g.players.every((p) => p.money === 100 && !p.blocks.length && !p.shopDone), 'todos começam com R$ 100 e sem blocos');
check(g.current === 0 && g.round === 1, 'começa na rodada 1 com o jogador 1');

// Ana: 1ª vez → dificuldade → loja → pergunta.
check(!Core.confirmLevel(g, 0), 'sem vez começada não confirma dificuldade');
check(Core.startTurn(g), 'começa a vez');
check(!Core.startTurn(g), 'não começa duas vezes');
check(!Core.confirmLevel(g, 0), 'precisa escolher a dificuldade');
check(!Core.chooseLevel(g, 'impossivel'), 'dificuldade inválida');
check(Core.chooseLevel(g, 'medio'), 'escolhe médio');
check(Core.confirmLevel(g, 1000) && g.turn.phase === 'shop', '1ª vez vai para a loja');
check(Core.buyProblem(g, '4x2') === null, 'pode comprar 4x2 com R$ 100');
let r = Core.buyBlock(g, '4x2', 'blue');
check(r.ok && g.players[0].money === 30, 'compra 4x2 (R$ 70)', g.players[0].money);
check(Core.buyBlock(g, '3x2', 'red').reason === 'dinheiro', 'sem dinheiro para o 3x2');
r = Core.buyBlock(g, '2x2', 'red');
check(r.ok && g.players[0].money === 10, 'compra 2x2 (R$ 20)');
check(Core.buyBlock(g, '2x2', 'blue').reason === 'limite', 'loja: no máximo 2 blocos');
check(Core.buyBlock(g, '2x2', 'roxa').reason === 'invalido', 'casa inválida');
check(Core.undoShopBuy(g, r.block.id) && g.players[0].money === 30 && g.players[0].blocks.length === 1, 'desfazer devolve o dinheiro');
r = Core.buyBlock(g, '2x2', 'red');
check(r.ok && g.players[0].money === 10, 'compra de novo');
check(Core.playerScore(g.players[0]).total === 8 + 8, 'pontos: 4x2 azul (8) + 2x2 vermelha (8)');
check(Core.leaveShop(g, 5000) && g.turn.phase === 'question' && g.players[0].shopDone, 'sai da loja para a pergunta');
check(g.turn.startedAt === 5000, 'tempo começa ao sair da loja');
check(Core.buyBlock(g, '2x2', 'blue').reason === 'invalido', 'não compra durante a pergunta');
check(!Core.undoShopBuy(g, r.block.id), 'não desfaz depois de sair da loja');
check(Core.timeLeft(g, 5000 + 1000) === g.turn.question.timeMs - 1000, 'timeLeft');
check(!Core.turnCanEnd(g), 'não encerra a vez antes de responder');

// Acerta: ganha R$ 50 (médio) e sorteia um bloco.
check(answer(g, true), 'responde');
check(g.turn.correct && g.turn.reward === 50 && g.players[0].money === 60, 'acertou o médio: +R$ 50', g.players[0].money);
check(g.players[0].right === 1, 'conta o acerto');
check(!Core.turnCanEnd(g), 'precisa resolver o bloco sorteado antes de encerrar');
const drawn = Core.drawBlock(g);
check(['2x2', '3x2', '4x2'].indexOf(drawn) >= 0, 'sorteia um dos três blocos');
check(Core.drawBlock(g) === drawn, 'não sorteia de novo na mesma vez');
if (Core.blockById(drawn).price <= 60) {
  check(g.turn.offer === null, 'com dinheiro, oferece a compra');
  check(Core.buyBlock(g, drawn === '2x2' ? '3x2' : '2x2', 'red').reason === 'invalido', 'só compra o bloco sorteado');
  r = Core.buyBlock(g, drawn, 'red');
  check(r.ok && r.block.from === 'sorteio' && g.turn.offer === 'bought', 'compra o bloco sorteado');
  check(g.players[0].money === 60 - Core.blockById(drawn).price, 'paga o bloco sorteado');
  check(Core.buyBlock(g, drawn, 'red').reason === 'invalido', 'não compra duas vezes');
} else {
  check(g.turn.offer === 'cant', 'sem dinheiro: não oferece');
}
check(Core.turnCanEnd(g) && Core.endTurn(g), 'encerra a vez');
check(g.current === 1 && g.round === 1 && g.turn === null, 'passa para o jogador 2');

// Jogador 2: 1ª vez, não compra nada na loja, erra (sem multa).
Core.startTurn(g);
Core.chooseLevel(g, 'dificil');
Core.confirmLevel(g, 0);
check(g.turn.phase === 'shop', 'jogador 2 também passa pela loja na 1ª vez');
Core.leaveShop(g, 10000);
const opts = g.turn.question.options.length;
check(opts === 5 || (g.turn.question.theme === 'juros' && opts === 4), 'difícil: 5 alternativas (juros: 4)', opts);
answer(g, false);
check(!g.turn.correct && g.players[1].money === 100 && g.players[1].wrong === 1, 'errou: sem multa');
check(Core.drawBlock(g) === null && Core.turnCanEnd(g), 'errou: sem sorteio e a vez pode acabar');
Core.endTurn(g);

// Jogador 3: tempo acaba.
Core.startTurn(g);
Core.chooseLevel(g, 'facil');
Core.confirmLevel(g, 0);
Core.leaveShop(g, 20000);
const limit = g.turn.question.timeMs;
Core.answerQuestion(g, g.turn.question.correct, 20000 + limit + 1);
check(g.turn.timedOut && !g.turn.correct && g.players[2].money === 100, 'resposta depois do tempo não vale (e sem multa)');
Core.endTurn(g);
check(g.current === 0 && g.round === 2, 'volta ao jogador 1 na rodada 2');

// Ana na 2ª vez: sem loja.
Core.startTurn(g);
Core.chooseLevel(g, 'facil');
Core.confirmLevel(g, 30000);
check(g.turn.phase === 'question', 'loja não abre de novo');
const before = g.players[0].money;
answer(g, true);
check(g.players[0].money === before + 20, 'acertou o fácil: +R$ 20');
// Recusa o bloco (ou não tem dinheiro).
Core.drawBlock(g);
if (!g.turn.offer) check(Core.declineDrawn(g) && g.turn.offer === 'declined', 'recusa o bloco');
check(Core.endTurn(g), 'encerra depois de recusar');

// Cancelar só antes de sair da dificuldade.
Core.startTurn(g);
check(Core.cancelTurn(g) && g.turn === null && g.current === 1, 'volta ao placar sem perder a vez');
Core.startTurn(g);
Core.chooseLevel(g, 'facil');
Core.confirmLevel(g, 0);
check(!Core.cancelTurn(g), 'não volta depois da dificuldade');
check(!Core.finishGame(g), 'não finaliza no meio de uma vez');
Core.leaveShop(g, 0);
Core.answerQuestion(g, null, 1);
Core.endTurn(g);

// Correções.
check(Core.adjustMoney(g, 2, -500) && g.players[2].money === 0, 'dinheiro não fica negativo');
check(Core.adjustMoney(g, 2, 10) && g.players[2].money === 10, 'soma dinheiro');
const ana = g.players[0];
const b0 = ana.blocks[0];
const pBefore = Core.playerScore(ana).total;
check(Core.toggleHouse(g, 0, b0.id) && b0.house === 'red', 'muda a casa do bloco');
check(Core.playerScore(ana).total === pBefore + Core.studs(b0.type), 'mudar para vermelha dobra os pontos do bloco');
check(Core.removeBlock(g, 0, b0.id) && ana.blocks.indexOf(b0) < 0, 'remove bloco');
check(!Core.removeBlock(g, 0, 9999) && !Core.toggleHouse(g, 9, 1), 'correção inválida');

/* ---------- 6. Fim de jogo e classificação ---------- */

const f = Core.createGame(['A', 'B', 'C', 'D']);
f.players[0].blocks = [{ id: 1, type: '4x2', house: 'red' }];                                        // 16
f.players[1].blocks = [{ id: 2, type: '3x2', house: 'blue' }, { id: 3, type: '2x2', house: 'red' }, // 6 + 8 = 14
  { id: 4, type: '2x2', house: 'blue' }];                                                           // + 4 = 18
f.players[2].blocks = [{ id: 5, type: '4x2', house: 'blue' }, { id: 6, type: '3x2', house: 'red' }]; // 8 + 12 = 20
f.players[3].blocks = [{ id: 7, type: '3x2', house: 'red' }, { id: 8, type: '2x2', house: 'blue' }]; // 12 + 4 = 16
const s2 = Core.playerScore(f.players[1]);
check(s2.blue.blocks === 2 && s2.blue.points === 10 && s2.red.blocks === 1 && s2.red.points === 8 && s2.total === 18, 'placar por cor', s2);
check(Core.finishGame(f) && f.finished, 'finaliza');
const rank = Core.ranking(f);
check(rank.map((x) => x.player.name).join() === 'C,B,A,D', 'ordem da classificação', rank.map((x) => x.player.name + x.score.total));
check(rank.map((x) => x.position).join() === '1,2,3,3', 'empate divide a posição', rank.map((x) => x.position));
Core.reopenGame(f);
check(!f.finished, 'volta ao jogo');

/* ---------- 7. Jogo salvo ---------- */

const saved = JSON.parse(JSON.stringify(g));
check(Core.sanitizeGame(saved) !== null, 'jogo salvo válido');
const mid = Core.createGame(['A']);
Core.startTurn(mid); Core.chooseLevel(mid, 'medio'); Core.confirmLevel(mid, 0); Core.leaveShop(mid, 123);
const midLoad = Core.sanitizeGame(JSON.parse(JSON.stringify(mid)));
check(midLoad && midLoad.turn && midLoad.turn.phase === 'question' && midLoad.turn.startedAt === 123, 'recarregar no meio da pergunta mantém o tempo');
[null, 'abc', {}, { v: 1 }, { v: 1, players: [] }, Object.assign({}, saved, { v: 99 }),
  Object.assign({}, saved, { current: 7 }), Object.assign({}, saved, { players: [{ name: 'x', money: -5, blocks: [] }] }),
  Object.assign({}, saved, { players: [{ name: 'x', money: 5, blocks: [{ id: 1, type: '9x9', house: 'blue' }] }] })
].forEach((bad, k) => check(Core.sanitizeGame(bad) === null, 'jogo salvo estragado deveria ser recusado #' + k));
const badTurn = JSON.parse(JSON.stringify(mid));
badTurn.turn.question.correct = 99;
check(Core.sanitizeGame(badTurn).turn === null, 'vez estragada é descartada, o jogo continua');

/* ---------- 8. Formato brasileiro ---------- */

check(Core.fmtMoney(12.5) === 'R$ 12,50' && Core.fmtMoney(70) === 'R$ 70,00', 'fmtMoney');
check(Core.fmtMoney(1400) === 'R$ 1.400,00', 'fmtMoney milhar');
check(Core.fmtRateDec(5) === '0,05' && Core.fmtMonths(1) === '1 mês' && Core.fmtMonths(3) === '3 meses', 'fmtRateDec/fmtMonths');

/* ---------- Resultado ---------- */

const per = THEMES.map((t) => t + '=' + Core.BANK.filter((q) => q.theme === t).length).join(' ');
console.log('Perguntas no banco: ' + Core.BANK.length + ' (' + per + ')');
console.log('Juros sorteados: ' + (share * 100).toFixed(1) + '% das perguntas');
console.log('Na tela, a certa é a mais curta em ' + (shortShare * 100).toFixed(0) + '% das vezes e nunca é a mais comprida.');
if (failures) {
  console.error('\n' + failures + ' de ' + checks + ' verificações falharam.');
  process.exit(1);
}
console.log('\nOK: ' + checks + ' verificações passaram.');
