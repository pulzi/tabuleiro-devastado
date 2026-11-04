/*
 * Tabuleiro Devastado – placar, perguntas e blocos
 *
 * Este arquivo tem duas partes:
 *   1. Núcleo (sem tela): regras do jogo, dinheiro, blocos, pontos e sorteio das perguntas.
 *      O test.js usa esta parte no Node.
 *   2. Interface: telas, ampulheta e roleta. Só roda no navegador.
 *
 * As perguntas ficam em perguntas.js. As contas de juros simples são geradas aqui (buildJuros).
 */
(function () {
  'use strict';

  const globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : {};
  const isNode = typeof module !== 'undefined' && module.exports && typeof require === 'function';
  const RAW_BANK = isNode ? require('./perguntas.js') : (globalObj.PERGUNTAS_TABULEIRO || []);

  /* ==========================================================
   * 1. NÚCLEO
   * ======================================================== */

  // Valores do jogo. Depois de mudar algo aqui, rode "node test.js".
  const CONFIG = {
    startMoney: 100,          // dinheiro de cada jogador no começo
    shopMaxBlocks: 2,         // quantos blocos dá para comprar na loja (só na 1ª vez de cada jogador)
    // Blocos verdes. Pontos = bolinhas = colunas × linhas.
    blocks: [
      { id: '2x2', cols: 2, rows: 2, price: 20 },
      { id: '3x2', cols: 3, rows: 2, price: 50 },
      { id: '4x2', cols: 4, rows: 2, price: 70 }
    ],
    houses: {
      blue: { name: 'Casa azul', desc: 'Moradia de baixa renda', multiplier: 1 },
      red: { name: 'Casa vermelha', desc: 'Comunidade de favela', multiplier: 2 } // pontos dobram
    },
    // Dificuldade escolhida na vez: número de alternativas e prêmio se acertar.
    levels: [
      { id: 'facil', name: 'Fácil', desc: 'Pergunta mais simples', options: 3, reward: 20 },
      { id: 'medio', name: 'Médio', desc: 'Pergunta média', options: 4, reward: 50 },
      { id: 'dificil', name: 'Difícil', desc: 'Pergunta difícil', options: 5, reward: 70 }
    ],
    questionMs: 30000,        // tempo das perguntas do banco
    juros: {
      chance: 0.10,           // chance de cair uma conta de juros em vez de uma pergunta do banco
      options: 4,             // alternativas da conta de juros (em qualquer dificuldade)
      timeMs: 60000,          // tempo da conta de juros
      rates: [5, 10, 15, 20], // taxas (% ao mês) do médio e do difícil
      easyRates: [10, 20],    // taxas do fácil (sempre 1 mês)
      times: [2, 3, 4]        // meses do médio e do difícil
    },
    warningMs: 10000,         // últimos segundos da ampulheta em vermelho
    maxPlayers: 8,
    maxNameLength: 20,
    spinMs: 2600,             // duração da roleta do bloco
    reducedSpinMs: 500        // roleta curta para quem pediu menos animação
  };

  const THEMES = {
    fraterna: 'Cidade fraterna',
    moradia: 'Moradias populares',
    qualidade: 'Casas de qualidade',
    desigualdade: 'Desigualdade social',
    solidariedade: 'Solidariedade',
    juros: 'Juros simples'
  };

  const GAME_VERSION = 1;

  /* ---------- Sorteio ---------- */

  const cryptoObj = globalObj.crypto && typeof globalObj.crypto.getRandomValues === 'function' ? globalObj.crypto : null;

  // Inteiro aleatório de 0 a n - 1, sem viés.
  function randInt(n) {
    if (cryptoObj) {
      const buf = new Uint32Array(1);
      const limit = Math.floor(0x100000000 / n) * n;
      do { cryptoObj.getRandomValues(buf); } while (buf[0] >= limit);
      return buf[0] % n;
    }
    return Math.floor(Math.random() * n);
  }

  function pick(list) { return list[randInt(list.length)]; }

  function chance(p) { return randInt(1000000) < Math.round(p * 1000000); }

  function shuffle(list) {
    const a = list.slice();
    for (let k = a.length - 1; k > 0; k--) {
      const r = randInt(k + 1);
      const tmp = a[k]; a[k] = a[r]; a[r] = tmp;
    }
    return a;
  }

  /* ---------- Números e textos ---------- */

  function round2(x) { return Math.round(x * 100) / 100; }

  function hasMax2Decimals(x) {
    return typeof x === 'number' && isFinite(x) && Math.abs(x * 100 - Math.round(x * 100)) < 1e-6;
  }

  // Juros simples em reais: C × (p / 100) × t.
  function interest(C, ratePct, t) { return round2(C * ratePct * t / 100); }

  // 1234.5 → "1.234,50"
  function fmtNumber(x, decimals) {
    const parts = Math.abs(x).toFixed(decimals).split('.');
    const int = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return (x < 0 ? '-' : '') + int + (parts[1] ? ',' + parts[1] : '');
  }
  function fmtPlain(x) { return Number.isInteger(x) ? fmtNumber(x, 0) : fmtNumber(x, 2); } // 50 → "50"; 2.5 → "2,50"
  function fmtMoney(x) { return 'R$ ' + fmtNumber(x, 2); }
  function fmtRateDec(p) { return fmtNumber(p / 100, 2); } // 10 → "0,10"
  function fmtMonths(t) { return fmtPlain(t) + (t === 1 ? ' mês' : ' meses'); }
  function fmtPoints(n) { return n + (n === 1 ? ' ponto' : ' pontos'); }
  function fmtBlocks(n) { return n + (n === 1 ? ' bloco' : ' blocos'); }

  /* ---------- Blocos, casas e pontos ---------- */

  function blockById(id) { return CONFIG.blocks.filter(function (b) { return b.id === id; })[0] || null; }
  function levelById(id) { return CONFIG.levels.filter(function (l) { return l.id === id; })[0] || null; }
  function blockName(id) { return String(id).replace('x', '×'); } // "3x2" → "3×2"
  function studs(id) { const b = blockById(id); return b ? b.cols * b.rows : 0; }

  // Pontos de um bloco: bolinhas × 1 (casa azul) ou × 2 (casa vermelha).
  function blockPoints(id, house) {
    const h = CONFIG.houses[house];
    return h ? studs(id) * h.multiplier : 0;
  }

  function playerScore(player) {
    const s = { blue: { blocks: 0, points: 0 }, red: { blocks: 0, points: 0 }, total: 0 };
    player.blocks.forEach(function (b) {
      const pts = blockPoints(b.type, b.house);
      s[b.house].blocks++;
      s[b.house].points += pts;
      s.total += pts;
    });
    return s;
  }

  // Classificação: mais pontos primeiro; empate divide a posição.
  function ranking(game) {
    const rows = game.players.map(function (p, k) { return { index: k, player: p, score: playerScore(p) }; });
    rows.sort(function (a, b) { return b.score.total - a.score.total || a.index - b.index; });
    rows.forEach(function (r) {
      r.position = 1 + rows.filter(function (o) { return o.score.total > r.score.total; }).length;
    });
    return rows;
  }

  /* ---------- Banco de perguntas ---------- */

  // Confere o banco (perguntas.js). Devolve a lista de problemas; vazia = tudo certo.
  function checkBank(raw) {
    const problems = [];
    const ids = {};
    (Array.isArray(raw) ? raw : []).forEach(function (q, k) {
      const where = 'Pergunta ' + (q && q.id ? q.id : '#' + (k + 1));
      if (!q || typeof q !== 'object') { problems.push(where + ': não é um bloco { ... }'); return; }
      if (typeof q.id !== 'string' || !q.id.trim()) problems.push(where + ': falta o id');
      else if (ids[q.id]) problems.push(where + ': id repetido');
      ids[q.id] = true;
      if (!THEMES[q.tema] || q.tema === 'juros') problems.push(where + ': tema desconhecido (' + q.tema + ')');
      const lv = levelById(q.nivel);
      if (!lv) problems.push(where + ': nível desconhecido (' + q.nivel + ')');
      ['pergunta', 'certa', 'explicacao'].forEach(function (key) {
        if (typeof q[key] !== 'string' || !q[key].trim()) problems.push(where + ': falta "' + key + '"');
      });
      if (!Array.isArray(q.erradas)) { problems.push(where + ': "erradas" precisa ser uma lista [ ... ]'); return; }
      if (q.erradas.some(function (s) { return typeof s !== 'string' || !s.trim(); })) problems.push(where + ': alternativa errada vazia');
      if (lv && q.erradas.length < lv.options - 1) problems.push(where + ': o nível ' + lv.name + ' precisa de pelo menos ' + (lv.options - 1) + ' erradas');
      const all = [q.certa].concat(q.erradas).map(function (s) { return String(s).trim().toLowerCase(); });
      if (all.filter(function (s, i) { return all.indexOf(s) === i; }).length !== all.length) problems.push(where + ': alternativas repetidas');
    });
    return problems;
  }

  // Tamanho das alternativas (para o tamanho não dar pista da resposta):
  //   1. todas parecidas: a menor tem pelo menos 85% da maior, ou a diferença é de até 5 letras;
  //   2. a certa nunca é a mais comprida: pelo menos uma errada é maior que ela;
  //   3. a certa também não é a mais curta: pelo menos uma errada é do mesmo tamanho ou menor.
  const LENGTH_RULE = { minRatio: 0.85, maxDiff: 5 };

  function textLength(s) { return String(s).trim().length; }

  function checkLengths(raw) {
    const problems = [];
    (Array.isArray(raw) ? raw : []).forEach(function (q, k) {
      if (!q || typeof q.certa !== 'string' || !Array.isArray(q.erradas) || !q.erradas.length) return;
      const where = 'Pergunta ' + (q.id || '#' + (k + 1));
      const right = textLength(q.certa);
      const wrong = q.erradas.map(textLength);
      const all = [right].concat(wrong);
      const max = Math.max.apply(null, all);
      const min = Math.min.apply(null, all);
      if (min < max * LENGTH_RULE.minRatio && max - min > LENGTH_RULE.maxDiff) {
        problems.push(where + ': alternativas com tamanhos muito diferentes (de ' + min + ' a ' + max + ' letras)');
      }
      if (!wrong.some(function (n) { return n > right; })) {
        problems.push(where + ': a certa (' + right + ' letras) é a mais comprida; escreva uma errada maior');
      }
      if (!wrong.some(function (n) { return n <= right; })) {
        problems.push(where + ': a certa (' + right + ' letras) é a mais curta; escreva uma errada menor');
      }
    });
    return problems;
  }

  function normalizeQuestion(raw) {
    const lv = levelById(raw.nivel);
    return {
      id: raw.id, theme: raw.tema, level: raw.nivel,
      text: raw.pergunta.trim(), answer: raw.certa.trim(),
      wrong: raw.erradas.map(function (s) { return s.trim(); }),
      why: raw.explicacao.trim(), formula: null,
      timeMs: CONFIG.questionMs, options: lv.options
    };
  }

  // Só entram perguntas sem problema (uma pergunta mal escrita não derruba o jogo).
  const BANK = (function () {
    const seen = {};
    const list = (Array.isArray(RAW_BANK) ? RAW_BANK : []).filter(function (q) {
      if (checkBank([q]).length || seen[q.id]) return false;
      seen[q.id] = true;
      return true;
    }).map(normalizeQuestion);
    const problems = checkBank(RAW_BANK).concat(checkLengths(RAW_BANK));
    if (problems.length && typeof console !== 'undefined') console.warn('perguntas.js:\n' + problems.join('\n'));
    return list;
  })();

  /* ---------- Contas de juros simples (geradas na hora) ---------- */

  // Fácil: juros de 1 mês. Médio: J = C × i × t. Difícil: total (M = C + J) ou descobrir a taxa.
  // As erradas imitam erros comuns: esquecer o tempo, confundir juros com total, errar a vírgula.
  function buildJuros(levelId, kindWanted) {
    const lv = levelById(levelId) || CONFIG.levels[0];
    const cfg = CONFIG.juros;
    const block = pick(CONFIG.blocks);
    const C = block.price;
    let i, t, kind;
    if (lv.id === 'facil') { i = pick(cfg.easyRates); t = 1; kind = 'J'; }
    else if (lv.id === 'medio') { i = pick(cfg.rates); t = pick(cfg.times); kind = 'J'; }
    else { i = pick(cfg.rates); t = pick(cfg.times); kind = kindWanted || pick(['M', 'i']); }
    const J = interest(C, i, t);
    const M = round2(C + J);

    const buy = 'Você comprou o bloco ' + blockName(block.id) + ' (' + fmtMoney(C) + ') para pagar daqui a ' + fmtMonths(t);
    const calcJ = 'J = C × i × t = ' + fmtPlain(C) + ' × ' + fmtRateDec(i) + ' × ' + t + ' = ' + fmtNumber(J, 2);
    let text, answer, fmt, why, formula, candidates;

    if (kind === 'J') {
      text = buy + ', com juros simples de ' + i + '% ao mês. Quanto você vai pagar de juros?';
      answer = J;
      fmt = fmtMoney;
      candidates = [C + J, C * i / 100, J * 10, J * 2, C - J, J + 5, J + 10, J * 3, J + 1, J + 2];
      why = calcJ + '. Os juros são ' + fmtMoney(J) + '.';
      formula = 'J = C × i × t  ·  ' + i + '% = ' + fmtRateDec(i);
    } else if (kind === 'M') {
      text = buy + ', com juros simples de ' + i + '% ao mês. Quanto você vai pagar no total (montante)?';
      answer = M;
      fmt = fmtMoney;
      candidates = [J, C + C * i / 100, C + J * 10, C - J, C + 2 * J, M + 5, M + 10, M + 20, M - 5, M + 1];
      why = calcJ + '. Total: M = C + J = ' + fmtPlain(C) + ' + ' + fmtNumber(J, 2) + ' = ' + fmtMoney(M) + '.';
      formula = 'J = C × i × t  ·  M = C + J  ·  ' + i + '% = ' + fmtRateDec(i);
    } else {
      text = buy + ' e pagou ' + fmtMoney(J) + ' de juros simples. Qual foi a taxa de juros ao mês?';
      answer = i;
      fmt = function (v) { return fmtPlain(v) + '% ao mês'; };
      candidates = [i * t, i + 5, i - 5, i * 2, i + 10, 25, 30, 40];
      why = 'i = J ÷ (C × t) = ' + fmtNumber(J, 2) + ' ÷ (' + fmtPlain(C) + ' × ' + t + ') = ' + fmtNumber(J, 2) + ' ÷ ' +
        fmtPlain(C * t) + ' = ' + fmtRateDec(i) + ' = ' + i + '% ao mês.';
      formula = 'J = C × i × t  →  i = J ÷ (C × t)';
    }

    const answerText = fmt(answer);
    const len = answerText.length;
    const seen = {};
    seen[answerText] = true;
    const valid = [];
    candidates.forEach(function (v) {
      v = round2(v);
      const s = fmt(v);
      // Erradas com quase o mesmo número de caracteres da certa (no máximo 2 a mais ou a menos).
      if (v > 0 && !seen[s] && Math.abs(s.length - len) <= 2) { seen[s] = true; valid.push(s); }
    });
    // Sorteia 3 entre os 5 erros mais prováveis (não fica sempre igual).
    const wrong = shuffle(valid.slice(0, 5)).slice(0, cfg.options - 1);
    // A certa nunca pode ser a mais comprida: garante uma errada do mesmo tamanho ou maior.
    if (!wrong.some(function (s) { return s.length >= len; })) {
      const longer = valid.filter(function (s) { return s.length >= len; });
      if (longer.length) wrong[randInt(wrong.length)] = pick(longer);
    }

    return {
      id: ['juros', kind, C, i, t].join('-'), theme: 'juros', level: lv.id,
      text: text, answer: answerText, wrong: wrong, why: why, formula: formula,
      timeMs: cfg.timeMs, options: cfg.options,
      data: { kind: kind, C: C, i: i, t: t, J: J, M: M }
    };
  }

  // Alternativas embaralhadas: a certa + (n - 1) erradas sorteadas.
  // Se nenhuma errada sorteada for maior que a certa, troca uma por outra que seja (a certa nunca é a mais comprida).
  function buildOptions(q) {
    const n = Math.min(q.options, q.wrong.length + 1);
    const len = q.answer.length;
    const wrong = shuffle(q.wrong).slice(0, n - 1);
    if (wrong.length && !wrong.some(function (s) { return s.length > len; })) {
      let pool = q.wrong.filter(function (s) { return s.length > len; });
      if (!pool.length && !wrong.some(function (s) { return s.length === len; })) {
        pool = q.wrong.filter(function (s) { return s.length === len; });
      }
      if (pool.length) wrong[randInt(wrong.length)] = pick(pool);
    }
    const list = shuffle([q.answer].concat(wrong));
    return { options: list, correct: list.indexOf(q.answer) };
  }

  // Sorteia a pergunta da vez. As do banco não se repetem até acabar o estoque do nível.
  function pickQuestion(game, levelId) {
    const pool = BANK.filter(function (q) { return q.level === levelId; });
    if (!pool.length || chance(CONFIG.juros.chance)) return buildJuros(levelId);
    if (!Array.isArray(game.used)) game.used = [];
    let fresh = pool.filter(function (q) { return game.used.indexOf(q.id) < 0; });
    if (!fresh.length) {
      // Acabou o estoque deste nível: libera de novo (sem repetir a última pergunta).
      game.used = game.used.filter(function (id) { return !pool.some(function (q) { return q.id === id; }); });
      fresh = pool.filter(function (q) { return q.id !== game.lastQuestionId; });
      if (!fresh.length) fresh = pool;
    }
    const q = pick(fresh);
    game.used.push(q.id);
    game.lastQuestionId = q.id;
    return q;
  }

  /* ---------- Partida ---------- */

  function createGame(names) {
    const clean = (Array.isArray(names) ? names : []).slice(0, CONFIG.maxPlayers).map(function (n) {
      return String(n === null || n === undefined ? '' : n).replace(/\s+/g, ' ').trim().slice(0, CONFIG.maxNameLength);
    });
    if (!clean.length) throw new Error('Coloque pelo menos um jogador.');
    return {
      v: GAME_VERSION,
      players: clean.map(function (name, k) {
        return { name: name || 'Jogador ' + (k + 1), money: CONFIG.startMoney, blocks: [], shopDone: false, right: 0, wrong: 0 };
      }),
      current: 0,
      round: 1,
      turn: null,
      used: [],
      lastQuestionId: null,
      nextBlockId: 1,
      finished: false
    };
  }

  function startTurn(game) {
    if (game.finished || game.turn) return false;
    game.turn = {
      player: game.current, phase: 'level', level: null, question: null, startedAt: 0,
      chosen: null, timedOut: false, correct: null, reward: 0, moneyAfter: 0,
      drawn: null, offer: null, boughtId: null
    };
    return true;
  }

  // Volta ao placar (só antes de sair da tela de dificuldade).
  function cancelTurn(game) {
    if (!game.turn || game.turn.phase !== 'level') return false;
    game.turn = null;
    return true;
  }

  function chooseLevel(game, levelId) {
    const t = game.turn;
    if (!t || t.phase !== 'level' || !levelById(levelId)) return false;
    t.level = levelId;
    return true;
  }

  // Depois da dificuldade: loja (só na 1ª vez do jogador) ou direto a pergunta.
  function confirmLevel(game, now) {
    const t = game.turn;
    if (!t || t.phase !== 'level' || !t.level) return false;
    if (!game.players[t.player].shopDone) t.phase = 'shop';
    else startQuestion(game, now);
    return true;
  }

  function shopBlocks(player) { return player.blocks.filter(function (b) { return b.from === 'loja'; }); }
  function shopLeft(player) { return Math.max(0, CONFIG.shopMaxBlocks - shopBlocks(player).length); }

  // Por que não dá para comprar o bloco agora: 'limite', 'dinheiro', 'invalido' ou null (dá).
  function buyProblem(game, blockId) {
    const t = game.turn;
    const b = blockById(blockId);
    if (!t || !b) return 'invalido';
    const p = game.players[t.player];
    if (t.phase === 'shop') {
      if (shopLeft(p) <= 0) return 'limite';
    } else if (t.phase === 'result') {
      if (!t.correct || t.drawn !== blockId || t.offer) return 'invalido';
    } else {
      return 'invalido';
    }
    return p.money < b.price ? 'dinheiro' : null;
  }

  // Compra o bloco e registra em qual casa ele foi colocado ('blue' ou 'red').
  function buyBlock(game, blockId, house) {
    if (!CONFIG.houses[house]) return { ok: false, reason: 'invalido' };
    const problem = buyProblem(game, blockId);
    if (problem) return { ok: false, reason: problem };
    const t = game.turn;
    const p = game.players[t.player];
    p.money = round2(p.money - blockById(blockId).price);
    const block = { id: game.nextBlockId++, type: blockId, house: house, from: t.phase === 'shop' ? 'loja' : 'sorteio', round: game.round };
    p.blocks.push(block);
    if (t.phase === 'result') { t.offer = 'bought'; t.boughtId = block.id; }
    return { ok: true, block: block };
  }

  // Desfaz uma compra da loja (devolve o dinheiro). Só enquanto a loja está aberta.
  function undoShopBuy(game, blockId) {
    const t = game.turn;
    if (!t || t.phase !== 'shop') return false;
    const p = game.players[t.player];
    const k = p.blocks.findIndex(function (b) { return b.id === blockId && b.from === 'loja'; });
    if (k < 0) return false;
    p.money = round2(p.money + blockById(p.blocks[k].type).price);
    p.blocks.splice(k, 1);
    return true;
  }

  function leaveShop(game, now) {
    const t = game.turn;
    if (!t || t.phase !== 'shop') return false;
    game.players[t.player].shopDone = true;
    startQuestion(game, now);
    return true;
  }

  function startQuestion(game, now) {
    const t = game.turn;
    const q = pickQuestion(game, t.level);
    const o = buildOptions(q);
    t.question = {
      id: q.id, theme: q.theme, text: q.text, options: o.options, correct: o.correct,
      why: q.why, formula: q.formula || null, timeMs: q.timeMs
    };
    t.phase = 'question';
    t.startedAt = now;
  }

  function timeLeft(game, now) {
    const t = game.turn;
    if (!t || t.phase !== 'question') return 0;
    return Math.max(0, t.question.timeMs - (now - t.startedAt));
  }

  // index: alternativa escolhida, ou null quando o tempo acabou. Acertou = ganha o prêmio. Errou = sem multa.
  function answerQuestion(game, index, now) {
    const t = game.turn;
    if (!t || t.phase !== 'question') return false;
    const valid = typeof index === 'number' && index >= 0 && index < t.question.options.length;
    const timedOut = !valid || timeLeft(game, now) <= 0;
    const p = game.players[t.player];
    t.chosen = timedOut ? null : index;
    t.timedOut = timedOut;
    t.correct = !timedOut && index === t.question.correct;
    if (t.correct) {
      t.reward = levelById(t.level).reward;
      p.money = round2(p.money + t.reward);
      p.right++;
    } else {
      t.reward = 0;
      p.wrong++;
    }
    t.moneyAfter = p.money;
    t.phase = 'result';
    return true;
  }

  // Sorteia um dos três blocos (só depois de acertar, uma vez por vez).
  function drawBlock(game) {
    const t = game.turn;
    if (!t || t.phase !== 'result' || !t.correct) return null;
    if (!t.drawn) {
      t.drawn = pick(CONFIG.blocks).id;
      if (game.players[t.player].money < blockById(t.drawn).price) t.offer = 'cant';
    }
    return t.drawn;
  }

  function declineDrawn(game) {
    const t = game.turn;
    if (!t || t.phase !== 'result' || !t.drawn || t.offer) return false;
    t.offer = 'declined';
    return true;
  }

  // A vez só acaba depois da resposta e, se acertou, depois de resolver o bloco sorteado.
  function turnCanEnd(game) {
    const t = game.turn;
    return !!t && t.phase === 'result' && (!t.correct || !!t.offer);
  }

  function endTurn(game) {
    if (!turnCanEnd(game)) return false;
    game.turn = null;
    game.current = (game.current + 1) % game.players.length;
    if (game.current === 0) game.round++;
    return true;
  }

  function finishGame(game) {
    if (game.turn) return false;
    game.finished = true;
    return true;
  }

  function reopenGame(game) { game.finished = false; }

  /* ---------- Correções (botão "Corrigir" do placar) ---------- */

  function adjustMoney(game, k, delta) {
    const p = game.players[k];
    if (!p) return false;
    p.money = Math.max(0, round2(p.money + delta));
    return true;
  }

  function findBlock(game, k, blockId) {
    const p = game.players[k];
    return p ? p.blocks.filter(function (b) { return b.id === blockId; })[0] || null : null;
  }

  function toggleHouse(game, k, blockId) {
    const b = findBlock(game, k, blockId);
    if (!b) return false;
    b.house = b.house === 'red' ? 'blue' : 'red';
    return true;
  }

  function removeBlock(game, k, blockId) {
    const p = game.players[k];
    const b = findBlock(game, k, blockId);
    if (!b) return false;
    p.blocks.splice(p.blocks.indexOf(b), 1);
    return true;
  }

  /* ---------- Jogo salvo no celular ---------- */

  // Confere um jogo salvo. Devolve o jogo (consertando detalhes) ou null se estiver estragado.
  function sanitizeGame(g) {
    try {
      if (!g || typeof g !== 'object' || g.v !== GAME_VERSION) return null;
      if (!Array.isArray(g.players) || !g.players.length || g.players.length > CONFIG.maxPlayers) return null;
      const playersOk = g.players.every(function (p) {
        return p && typeof p.name === 'string' && typeof p.money === 'number' && isFinite(p.money) && p.money >= 0 &&
          Array.isArray(p.blocks) && p.blocks.every(function (b) {
            return b && typeof b.id === 'number' && blockById(b.type) && CONFIG.houses[b.house];
          });
      });
      if (!playersOk) return null;
      if (!Number.isInteger(g.current) || g.current < 0 || g.current >= g.players.length) return null;
      if (!Number.isInteger(g.round) || g.round < 1) return null;

      g.players.forEach(function (p) {
        p.shopDone = !!p.shopDone;
        p.right = Number.isInteger(p.right) && p.right > 0 ? p.right : 0;
        p.wrong = Number.isInteger(p.wrong) && p.wrong > 0 ? p.wrong : 0;
      });
      if (!Array.isArray(g.used)) g.used = [];
      const maxId = g.players.reduce(function (m, p) {
        return p.blocks.reduce(function (mm, b) { return Math.max(mm, b.id); }, m);
      }, 0);
      if (!Number.isInteger(g.nextBlockId) || g.nextBlockId <= maxId) g.nextBlockId = maxId + 1;
      g.finished = !!g.finished;

      const t = g.turn;
      if (t !== null && t !== undefined) {
        const phases = ['level', 'shop', 'question', 'result'];
        const q = t && t.question;
        const questionOk = q && typeof q.text === 'string' && Array.isArray(q.options) && q.options.length >= 2 &&
          Number.isInteger(q.correct) && q.correct >= 0 && q.correct < q.options.length && q.timeMs > 0;
        if (typeof t !== 'object' || phases.indexOf(t.phase) < 0 || t.player !== g.current) g.turn = null;
        else if (t.phase !== 'level' && !levelById(t.level)) g.turn = null;
        else if ((t.phase === 'question' || t.phase === 'result') && !questionOk) g.turn = null;
        else if (t.drawn && !blockById(t.drawn)) t.drawn = null;
      } else {
        g.turn = null;
      }
      if (g.finished) g.turn = null;
      return g;
    } catch (e) {
      return null;
    }
  }

  const Core = {
    CONFIG: CONFIG, THEMES: THEMES, BANK: BANK, RAW_BANK: RAW_BANK,
    checkBank: checkBank, checkLengths: checkLengths, LENGTH_RULE: LENGTH_RULE, buildJuros: buildJuros, buildOptions: buildOptions, pickQuestion: pickQuestion,
    createGame: createGame, startTurn: startTurn, cancelTurn: cancelTurn, chooseLevel: chooseLevel,
    confirmLevel: confirmLevel, shopLeft: shopLeft, buyProblem: buyProblem, buyBlock: buyBlock,
    undoShopBuy: undoShopBuy, leaveShop: leaveShop, timeLeft: timeLeft, answerQuestion: answerQuestion,
    drawBlock: drawBlock, declineDrawn: declineDrawn, turnCanEnd: turnCanEnd, endTurn: endTurn,
    finishGame: finishGame, reopenGame: reopenGame, adjustMoney: adjustMoney, toggleHouse: toggleHouse,
    removeBlock: removeBlock, sanitizeGame: sanitizeGame,
    blockById: blockById, levelById: levelById, blockName: blockName, studs: studs, blockPoints: blockPoints,
    playerScore: playerScore, ranking: ranking, interest: interest, hasMax2Decimals: hasMax2Decimals,
    fmtNumber: fmtNumber, fmtMoney: fmtMoney, fmtRateDec: fmtRateDec, fmtMonths: fmtMonths
  };

  if (isNode) module.exports = Core;
  if (typeof document === 'undefined') return; // Node: só o núcleo.

  /* ==========================================================
   * 2. INTERFACE
   * ======================================================== */

  const GAME_KEY = 'tabuleiro-devastado:jogo';
  const NAMES_KEY = 'tabuleiro-devastado:nomes';
  const OLD_KEYS = ['tabuleiro-devastado:config']; // da versão antiga (sorteador de contas)
  const LETTERS = 'ABCDE';
  const TAU = Math.PI * 2;
  const WHEEL_COLORS = [
    { bg: '#1a6b39', fg: '#ffffff' },
    { bg: '#f2b705', fg: '#1b1400' },
    { bg: '#0b5f86', fg: '#ffffff' }
  ];

  const state = {
    game: null,
    setup: false,         // tela de novo jogo aberta por cima de um jogo em andamento
    setupNames: ['', ''],
    screen: null,
    selected: null,       // alternativa marcada na pergunta
    placing: null,        // bloco esperando a escolha da casa (azul ou vermelha)
    fixOpen: {},          // painéis "Corrigir" abertos no placar
    confirmFinish: false,
    timerId: null,
    warned: false,
    wheel: null,          // { key, api, landed }
    spinning: false
  };

  const $ = function (sel) { return document.querySelector(sel); };
  const $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  // Cria um elemento: h('p', { class: 'x', text: 'oi' }, [filhos])
  function h(tag, attrs, children) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        const v = attrs[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined) return;
      el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return el;
  }

  function button(text, cls, key, onClick, extra) {
    const b = h('button', Object.assign({ type: 'button', class: cls, 'data-key': key, text: text }, extra || {}));
    b.addEventListener('click', onClick);
    return b;
  }

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function announce(text) {
    const live = $('#sr-live');
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 50);
  }

  function blockArt(block) {
    const art = h('span', { class: 'block-art', 'aria-hidden': 'true' });
    art.style.setProperty('--cols', block.cols);
    art.style.setProperty('--rows', block.rows);
    for (let k = 0; k < block.cols * block.rows; k++) art.appendChild(h('i'));
    return art;
  }

  function houseIcon() {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '30');
    svg.setAttribute('height', '30');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('class', 'house-icon');
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', 'M12 2.5 1.5 11.2l1.4 1.6L4 11.9V21h6.2v-5.6h3.6V21H20v-9.1l1.1.9 1.4-1.6z');
    path.setAttribute('fill', 'currentColor');
    svg.appendChild(path);
    return svg;
  }

  function joinNames(list) {
    return list.length > 1 ? list.slice(0, -1).join(', ') + ' e ' + list[list.length - 1] : list[0] || '';
  }

  /* ---------- Guardar no celular (se o navegador deixar) ---------- */

  function saveGame() {
    try {
      if (state.game) window.localStorage.setItem(GAME_KEY, JSON.stringify(state.game));
      else window.localStorage.removeItem(GAME_KEY);
    } catch (e) { /* sem localStorage: o jogo só não sobrevive a recarregar a página */ }
  }

  function loadGame() {
    try { return sanitizeGame(JSON.parse(window.localStorage.getItem(GAME_KEY) || 'null')); } catch (e) { return null; }
  }

  function saveNames(names) {
    try { window.localStorage.setItem(NAMES_KEY, JSON.stringify(names)); } catch (e) { /* tudo bem */ }
  }

  function loadNames() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(NAMES_KEY) || 'null');
      if (Array.isArray(saved) && saved.length && saved.length <= CONFIG.maxPlayers) {
        return saved.map(function (n) { return typeof n === 'string' ? n.slice(0, CONFIG.maxNameLength) : ''; });
      }
    } catch (e) { /* usa o padrão */ }
    return ['', ''];
  }

  function cleanOldKeys() {
    try { OLD_KEYS.forEach(function (k) { window.localStorage.removeItem(k); }); } catch (e) { /* tudo bem */ }
  }

  /* ---------- Desenho das telas ---------- */

  // Salva o jogo e redesenha. focusKey: data-key do elemento que deve receber o foco.
  function commit(focusKey) {
    saveGame();
    render(focusKey);
  }

  function render(focusKey) {
    stopTimer();
    const g = state.game;
    let name;
    if (!g || state.setup) name = renderSetup();
    else if (g.finished) name = renderFinal();
    else if (!g.turn) name = renderHub();
    else if (g.turn.phase === 'level') name = renderLevel();
    else if (g.turn.phase === 'shop') name = renderShop();
    else if (g.turn.phase === 'question') name = renderQuestion();
    else name = renderResult();
    renderBrand();
    showScreen(name, focusKey);
    if (name === 'question') startTimer();
    if (name === 'result' && state.wheel) state.wheel.api.redraw();
  }

  function renderBrand() {
    const g = state.game;
    let sub = 'Cidade fraterna';
    if (g && !state.setup) {
      sub = g.finished ? 'Fim de jogo' : 'Rodada ' + g.round + ' · ' + g.players.length + (g.players.length === 1 ? ' jogador' : ' jogadores');
    }
    $('#brand-sub').textContent = sub;
  }

  function showScreen(name, focusKey) {
    const changed = state.screen !== name;
    state.screen = name;
    $$('.screen').forEach(function (s) { s.hidden = s.id !== 'screen-' + name; });
    const target = focusKey ? document.querySelector('#screen-' + name + ' [data-key="' + focusKey + '"]') : null;
    if (changed) window.scrollTo(0, 0);
    const el = target || (changed ? $('#screen-' + name + ' [data-focus]') : null);
    if (el) {
      try { el.focus({ preventScroll: !target }); } catch (e) { el.focus(); }
    }
  }

  /* ---------- Tela 0a: novo jogo ---------- */

  function renderSetup() {
    const list = $('#players-list');
    list.innerHTML = '';
    const n = state.setupNames.length;
    state.setupNames.forEach(function (name, k) {
      const id = 'pn-' + k;
      const input = h('input', {
        id: id, type: 'text', placeholder: 'Jogador ' + (k + 1), maxlength: CONFIG.maxNameLength,
        autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false',
        enterkeyhint: k === n - 1 ? 'done' : 'next', 'data-key': 'name-' + k
      });
      input.value = name;
      input.addEventListener('input', function () { state.setupNames[k] = input.value; });
      input.addEventListener('keydown', function (e) {
        if (e.key !== 'Enter') return;
        e.preventDefault();
        const next = $('#pn-' + (k + 1));
        if (next) next.focus(); else input.blur();
      });
      const remove = button('×', 'icon-btn-sm', 'rm-' + k, function () {
        state.setupNames.splice(k, 1);
        render(state.setupNames.length > k ? 'name-' + k : 'add-player');
      }, { 'aria-label': 'Tirar o jogador ' + (k + 1) });
      remove.disabled = n <= 1;
      list.appendChild(h('div', { class: 'player-row' }, [
        h('span', { class: 'player-num', 'aria-hidden': 'true', text: String(k + 1) }),
        h('label', { class: 'visually-hidden', for: id, text: 'Nome do jogador ' + (k + 1) }),
        input,
        remove
      ]));
    });
    $('#btn-add-player').disabled = n >= CONFIG.maxPlayers;
    $('#btn-add-player').textContent = n >= CONFIG.maxPlayers ? 'Máximo de ' + CONFIG.maxPlayers + ' jogadores' : '+ Adicionar jogador';

    const g = state.game;
    const warn = $('#setup-warning');
    warn.hidden = !g;
    if (g) warn.textContent = 'Começar um jogo novo apaga o jogo atual' + (g.finished ? '.' : ' (rodada ' + g.round + ').');
    $('#btn-back-game').hidden = !g;
    return 'setup';
  }

  function onAddPlayer() {
    if (state.setupNames.length >= CONFIG.maxPlayers) return;
    state.setupNames.push('');
    render('name-' + (state.setupNames.length - 1));
  }

  function onStartGame() {
    $$('#players-list input').forEach(function (input, k) { state.setupNames[k] = input.value; });
    const names = state.setupNames.slice();
    newGame(names);
  }

  function newGame(names) {
    state.game = createGame(names);
    state.setupNames = state.game.players.map(function (p, k) { return names[k] && names[k].trim() ? p.name : ''; });
    saveNames(state.setupNames);
    resetUi();
    commit();
    announce('Jogo começou. Vez de ' + state.game.players[0].name + '.');
  }

  function resetUi() {
    state.setup = false;
    state.selected = null;
    state.placing = null;
    state.fixOpen = {};
    state.confirmFinish = false;
    state.wheel = null;
    state.spinning = false;
  }

  /* ---------- Tela 0b: placar e início da vez ---------- */

  function renderHub() {
    const g = state.game;
    const p = g.players[g.current];
    const many = g.players.length > 1;
    $('#hub-round').textContent = 'Rodada ' + g.round + (many ? ' · jogador ' + (g.current + 1) + ' de ' + g.players.length : '');
    $('#hub-title').textContent = many ? 'Vez de ' + p.name : 'Sua vez, ' + p.name;
    $('#hub-hint').textContent = p.shopDone
      ? 'Escolha a dificuldade e responda a pergunta. Acertou? Ganha dinheiro e sorteia um bloco.'
      : 'Primeira vez: depois de escolher a dificuldade, a loja abre e você pode comprar até 2 blocos.';
    $('#btn-start-turn').textContent = 'Começar a vez de ' + p.name;

    const list = $('#scoreboard');
    list.innerHTML = '';
    g.players.forEach(function (pl, k) { list.appendChild(playerCard(pl, k, k === g.current)); });

    $('#btn-finish').hidden = state.confirmFinish;
    $('#finish-confirm').hidden = !state.confirmFinish;
    return 'hub';
  }

  function playerCard(p, k, isCurrent) {
    const score = playerScore(p);
    const blocks = h('ul', { class: 'mini-blocks', 'aria-label': 'Blocos de ' + p.name });
    p.blocks.forEach(function (b) {
      blocks.appendChild(h('li', { class: 'mini-block is-' + b.house }, [
        h('span', { class: 'visually-hidden', text: CONFIG.houses[b.house].name + ': ' }),
        blockName(b.type) + ' · ' + fmtPoints(blockPoints(b.type, b.house))
      ]));
    });

    const card = h('li', { class: 'player-card' + (isCurrent ? ' is-current' : '') }, [
      h('div', { class: 'pc-head' }, [
        h('strong', { class: 'pc-name', text: p.name }),
        isCurrent ? h('span', { class: 'pc-tag', text: 'Na vez' }) : null
      ]),
      h('div', { class: 'pc-stats' }, [
        stat('Dinheiro', fmtMoney(p.money)),
        stat('Blocos', String(p.blocks.length)),
        stat('Pontos', String(score.total), 'is-points')
      ]),
      p.blocks.length ? blocks : h('p', { class: 'pc-empty', text: 'Nenhum bloco no tabuleiro ainda.' }),
      p.shopDone ? null : h('p', { class: 'pc-note', text: 'Ainda vai passar pela loja.' }),
      fixPanel(p, k)
    ]);
    return card;
  }

  function stat(label, value, extra) {
    return h('div', { class: 'stat ' + (extra || '') }, [
      h('span', { class: 'stat-label', text: label }),
      h('span', { class: 'stat-value', text: value })
    ]);
  }

  // Painel para consertar engano: dinheiro e blocos de cada jogador.
  function fixPanel(p, k) {
    const details = h('details', { class: 'fix' });
    details.open = !!state.fixOpen[k];
    details.addEventListener('toggle', function () { state.fixOpen[k] = details.open; });
    details.appendChild(h('summary', { 'data-key': 'fix-' + k, text: 'Corrigir' }));

    const money = h('div', { class: 'fix-money' }, [h('span', { class: 'fix-label', text: 'Dinheiro: ' + fmtMoney(p.money) })]);
    const row = h('div', { class: 'btn-row' });
    [-10, -1, 1, 10].forEach(function (d) {
      const label = (d > 0 ? '+' : '−') + Math.abs(d);
      row.appendChild(button(label, 'btn btn-small', 'fix-' + k + '-m' + d, function () {
        adjustMoney(state.game, k, d);
        commit('fix-' + k + '-m' + d);
      }, { 'aria-label': (d > 0 ? 'Somar ' : 'Tirar ') + fmtMoney(Math.abs(d)) + ' de ' + p.name }));
    });
    money.appendChild(row);
    details.appendChild(money);

    if (p.blocks.length) {
      const ul = h('ul', { class: 'fix-blocks' });
      p.blocks.forEach(function (b) {
        const other = b.house === 'red' ? 'azul' : 'vermelha';
        ul.appendChild(h('li', null, [
          h('span', { text: blockName(b.type) + ' na ' + CONFIG.houses[b.house].name.toLowerCase() }),
          h('span', { class: 'btn-row' }, [
            button('Mudar para ' + other, 'btn btn-small', 'fix-' + k + '-s' + b.id, function () {
              toggleHouse(state.game, k, b.id);
              commit('fix-' + k + '-s' + b.id);
            }),
            button('Remover', 'btn btn-small btn-danger', 'fix-' + k + '-r' + b.id, function () {
              removeBlock(state.game, k, b.id);
              commit('fix-' + k);
            })
          ])
        ]));
      });
      details.appendChild(ul);
      details.appendChild(h('p', { class: 'fix-hint', text: 'Remover não devolve o dinheiro; se precisar, ajuste o dinheiro acima.' }));
    }
    return details;
  }

  function onStartTurn() {
    if (!startTurn(state.game)) return;
    state.selected = null;
    state.placing = null;
    commit();
  }

  /* ---------- Tela 1: dificuldade ---------- */

  function renderLevel() {
    const g = state.game;
    const t = g.turn;
    const p = g.players[t.player];
    $('#level-player').textContent = 'Vez de ' + p.name + ' · ' + fmtMoney(p.money);
    const list = $('#level-list');
    list.innerHTML = '';
    CONFIG.levels.forEach(function (lv) {
      const input = h('input', { type: 'radio', name: 'level', id: 'level-' + lv.id, value: lv.id, class: 'visually-hidden', 'data-key': 'level-' + lv.id });
      input.checked = t.level === lv.id;
      input.addEventListener('change', function () {
        chooseLevel(state.game, lv.id);
        saveGame();
        syncLevel();
      });
      list.appendChild(h('label', { class: 'level-card lv-' + lv.id, for: 'level-' + lv.id, 'data-level': lv.id }, [
        input,
        h('span', { class: 'level-main' }, [
          h('strong', { class: 'level-name', text: lv.name }),
          h('span', { class: 'level-desc', text: lv.desc + ' · ' + lv.options + ' alternativas' })
        ]),
        h('span', { class: 'level-reward' }, [h('span', { class: 'level-reward-label', text: 'Ganha' }), fmtMoney(lv.reward)])
      ]));
    });
    $('#btn-level-go').textContent = p.shopDone ? 'Ver a pergunta' : 'Ir para a loja de blocos';
    syncLevel();
    return 'level';
  }

  function syncLevel() {
    const t = state.game.turn;
    $$('.level-card').forEach(function (card) { card.classList.toggle('is-selected', card.getAttribute('data-level') === t.level); });
    $('#btn-level-go').disabled = !t.level;
  }

  function onLevelGo() {
    if (!confirmLevel(state.game, Date.now())) return;
    state.selected = null;
    commit();
  }

  /* ---------- Tela 2: loja ---------- */

  function renderShop() {
    const g = state.game;
    const t = g.turn;
    const p = g.players[t.player];
    const left = shopLeft(p);
    $('#shop-player').textContent = 'Vez de ' + p.name;
    $('#shop-money').textContent = fmtMoney(p.money);
    $('#shop-count').textContent = (CONFIG.shopMaxBlocks - left) + ' de ' + CONFIG.shopMaxBlocks;

    const listBox = $('#shop-blocks');
    const pickerBox = $('#shop-picker');
    listBox.hidden = !!state.placing;
    pickerBox.hidden = !state.placing;
    if (state.placing) {
      const b = blockById(state.placing);
      renderPicker(pickerBox, b.id,
        'Custa ' + fmtMoney(b.price) + '. Depois da compra, você fica com ' + fmtMoney(round2(p.money - b.price)) + '.',
        function (house) {
          const res = buyBlock(state.game, b.id, house);
          state.placing = null;
          if (res.ok) announce('Comprou o bloco ' + blockName(b.id) + ' para a ' + CONFIG.houses[house].name.toLowerCase() + '.');
          commit(buyProblem(state.game, b.id) ? 'shop-go' : 'buy-' + b.id);
        },
        function () { state.placing = null; render('buy-' + b.id); });
    } else {
      pickerBox.innerHTML = '';
      listBox.innerHTML = '';
      CONFIG.blocks.forEach(function (b) {
        const problem = buyProblem(g, b.id);
        const reason = problem === 'limite' ? 'Você já comprou ' + CONFIG.shopMaxBlocks + ' blocos.'
          : problem === 'dinheiro' ? 'Faltam ' + fmtMoney(round2(b.price - p.money)) + '.' : '';
        const buy = button('Comprar', 'btn btn-primary btn-buy', 'buy-' + b.id, function () {
          state.placing = b.id;
          render('picker-title');
        }, { 'aria-label': 'Comprar o bloco ' + blockName(b.id) + ' por ' + fmtMoney(b.price) });
        buy.disabled = !!problem;
        listBox.appendChild(h('li', { class: 'shop-card' + (problem ? ' is-off' : '') }, [
          blockArt(b),
          h('span', { class: 'shop-info' }, [
            h('strong', { text: 'Bloco ' + blockName(b.id) }),
            h('span', { class: 'shop-price', text: fmtMoney(b.price) }),
            h('span', { class: 'shop-pts', text: studs(b.id) + ' bolinhas: ' + fmtPoints(blockPoints(b.id, 'blue')) + ' (' + blockPoints(b.id, 'red') + ' na casa vermelha)' }),
            reason ? h('span', { class: 'shop-why', text: reason }) : null
          ]),
          buy
        ]));
      });
    }

    const bought = p.blocks.filter(function (b) { return b.from === 'loja'; });
    $('#shop-bought-box').hidden = !bought.length || !!state.placing;
    const ul = $('#shop-bought');
    ul.innerHTML = '';
    bought.forEach(function (b) {
      ul.appendChild(h('li', { class: 'bought is-' + b.house }, [
        h('span', { text: 'Bloco ' + blockName(b.type) + ' · ' + CONFIG.houses[b.house].name + ' · ' + fmtPoints(blockPoints(b.type, b.house)) }),
        button('Desfazer', 'btn btn-small', 'undo-' + b.id, function () {
          undoShopBuy(state.game, b.id);
          commit('buy-' + b.type);
        }, { 'aria-label': 'Desfazer a compra do bloco ' + blockName(b.type) + ' (devolve ' + fmtMoney(blockById(b.type).price) + ')' })
      ]));
    });

    const go = $('#btn-shop-go');
    go.hidden = !!state.placing;
    go.textContent = bought.length ? 'Pronto! Ver a pergunta' : 'Não comprar e ver a pergunta';
    return 'shop';
  }

  // Escolha da casa onde o bloco foi colocado: azul (baixa renda) ou vermelha (favela, pontos dobram).
  function renderPicker(box, blockId, note, onPick, onCancel) {
    box.innerHTML = '';
    box.appendChild(h('h2', { class: 'picker-title', tabindex: '-1', 'data-key': 'picker-title', text: 'Onde você vai colocar o bloco ' + blockName(blockId) + '?' }));
    box.appendChild(h('p', { class: 'picker-note', text: 'Coloque o bloco no tabuleiro, em cima de uma casa, e toque na cor dela. ' + note }));
    const grid = h('div', { class: 'picker-grid' });
    ['blue', 'red'].forEach(function (house) {
      const info = CONFIG.houses[house];
      const pts = blockPoints(blockId, house);
      const btn = h('button', { type: 'button', class: 'house-btn house-' + house, 'data-key': 'house-' + house }, [
        houseIcon(),
        h('span', { class: 'house-name', text: info.name }),
        h('span', { class: 'house-desc', text: info.desc }),
        h('span', { class: 'house-pts', text: '+' + fmtPoints(pts) + (info.multiplier > 1 ? ' (dobro!)' : '') })
      ]);
      btn.addEventListener('click', function () { onPick(house); });
      grid.appendChild(btn);
    });
    box.appendChild(grid);
    box.appendChild(button('Voltar', 'btn btn-secondary btn-wide', 'picker-cancel', onCancel));
  }

  function onShopGo() {
    if (!leaveShop(state.game, Date.now())) return;
    state.selected = null;
    state.placing = null;
    commit();
  }

  /* ---------- Tela 3: pergunta ---------- */

  function renderQuestion() {
    const g = state.game;
    const t = g.turn;
    const q = t.question;
    const lv = levelById(t.level);
    const badges = $('#q-badges');
    badges.innerHTML = '';
    badges.appendChild(h('span', { class: 'badge theme-' + q.theme, text: THEMES[q.theme] || 'Pergunta' }));
    badges.appendChild(h('span', { class: 'badge lv-' + lv.id, text: lv.name + ' · ' + fmtMoney(lv.reward) }));
    $('#q-player').textContent = 'Vez de ' + g.players[t.player].name;
    $('#q-title').textContent = q.text;
    const formula = $('#q-formula');
    formula.hidden = !q.formula;
    formula.textContent = q.formula || '';

    const box = $('#q-options');
    box.innerHTML = '';
    q.options.forEach(function (text, k) {
      const input = h('input', { type: 'radio', name: 'answer', id: 'opt-' + k, value: k, class: 'visually-hidden', 'data-key': 'opt-' + k });
      input.checked = state.selected === k;
      input.addEventListener('change', function () {
        state.selected = k;
        $('#q-error').hidden = true;
        syncOptions();
      });
      box.appendChild(h('label', { class: 'option', for: 'opt-' + k, 'data-index': k }, [
        input,
        h('span', { class: 'option-letter', 'aria-hidden': 'true', text: LETTERS[k] }),
        h('span', { class: 'option-text' }, [h('span', { class: 'visually-hidden', text: 'Alternativa ' + LETTERS[k] + ': ' }), text])
      ]));
    });
    $('#q-error').hidden = true;
    syncOptions();
    return 'question';
  }

  function syncOptions() {
    $$('#q-options .option').forEach(function (el) {
      el.classList.toggle('is-selected', Number(el.getAttribute('data-index')) === state.selected);
    });
  }

  function onAnswer() {
    const g = state.game;
    if (!g || !g.turn || g.turn.phase !== 'question') return;
    if (state.selected === null) {
      $('#q-error').hidden = false;
      return;
    }
    answerQuestion(g, state.selected, Date.now());
    afterAnswer();
  }

  function afterAnswer() {
    const t = state.game.turn;
    state.selected = null;
    state.placing = null;
    state.wheel = null;
    commit();
    announce(t.correct ? 'Acertou! Ganhou ' + fmtMoney(t.reward) + '.' : t.timedOut ? 'O tempo acabou.' : 'Resposta errada.');
  }

  /* ---------- Ampulheta (mede com Date.now, não conta ticks) ---------- */

  function startTimer() {
    stopTimer();
    state.warned = false;
    $('#timer').classList.remove('is-warning');
    state.timerId = setInterval(tick, 100);
    tick();
  }

  function stopTimer() {
    if (state.timerId) clearInterval(state.timerId);
    state.timerId = null;
  }

  function tick() {
    const g = state.game;
    if (!g || !g.turn || g.turn.phase !== 'question' || state.screen !== 'question') { stopTimer(); return; }
    const total = g.turn.question.timeMs;
    const left = timeLeft(g, Date.now());
    const frac = left / total;
    $('#timer-fill').style.transform = 'scaleX(' + frac.toFixed(4) + ')';
    $('#timer-text').textContent = Math.ceil(left / 1000) + ' s';
    setHourglass(frac);
    if (left <= CONFIG.warningMs) {
      $('#timer').classList.add('is-warning');
      if (!state.warned) {
        state.warned = true;
        announce('Faltam ' + Math.ceil(left / 1000) + ' segundos');
      }
    }
    if (left <= 0) {
      stopTimer();
      vibrate();
      answerQuestion(g, null, Date.now());
      afterAnswer();
    }
  }

  // Areia: em cima diminui, embaixo aumenta.
  function setHourglass(frac) {
    const f = Math.max(0, Math.min(1, frac));
    const topY = 9 + (1 - f) * 19;      // superfície da areia de cima (9 = cheia, 28 = vazia)
    const botH = (1 - f) * 18;          // altura da areia de baixo
    const top = $('#hg-top');
    const bot = $('#hg-bot');
    top.setAttribute('y', topY.toFixed(2));
    top.setAttribute('height', (28 - topY).toFixed(2));
    bot.setAttribute('y', (51 - botH).toFixed(2));
    bot.setAttribute('height', botH.toFixed(2));
    const stream = $('#hg-stream');
    stream.setAttribute('y2', (51 - botH).toFixed(2));
    stream.style.opacity = f > 0 && f < 1 ? '1' : '0';
  }

  // Vibra ao zerar, se o aparelho deixar.
  function vibrate() {
    try {
      const touched = !navigator.userActivation || navigator.userActivation.hasBeenActive;
      if (navigator.vibrate && touched) navigator.vibrate([250, 120, 250]);
    } catch (e) { /* sem vibração */ }
  }

  /* ---------- Resultado e sorteio do bloco ---------- */

  function renderResult() {
    const g = state.game;
    const t = g.turn;
    const q = t.question;
    const p = g.players[t.player];
    const lv = levelById(t.level);

    $('#result-banner').className = 'banner ' + (t.correct ? 'is-ok' : 'is-fail');
    $('#result-icon').textContent = t.correct ? '✓' : t.timedOut ? '⌛' : '✗';
    $('#result-kicker').textContent = t.correct ? 'Resposta certa!' : t.timedOut ? 'O tempo acabou!' : 'Resposta errada';
    $('#result-title').textContent = t.correct ? 'Acertou, ' + p.name + '!' : 'Não foi dessa vez, ' + p.name;
    $('#result-sub').textContent = t.correct
      ? 'Você ganhou ' + fmtMoney(t.reward) + ' (' + lv.name + '). Agora tem ' + fmtMoney(t.moneyAfter) + '.'
      : 'A sua vez acaba aqui. Sem multa: você continua com ' + fmtMoney(p.money) + '.';

    const explain = $('#result-explain');
    explain.innerHTML = '';
    if (!t.correct && t.chosen !== null) {
      explain.appendChild(h('p', { class: 'explain-line is-bad' }, [h('strong', { text: 'Você marcou: ' }), LETTERS[t.chosen] + ') ' + q.options[t.chosen]]));
    }
    explain.appendChild(h('p', { class: 'explain-line is-ok' }, [h('strong', { text: 'Resposta certa: ' }), LETTERS[q.correct] + ') ' + q.options[q.correct]]));
    explain.appendChild(h('p', { class: 'explain-why' }, [h('strong', { text: 'Por quê? ' }), q.why]));

    renderDraw();

    const end = $('#btn-end-turn');
    end.hidden = !turnCanEnd(g) || state.spinning;
    const next = g.players[(t.player + 1) % g.players.length];
    end.textContent = g.players.length > 1 ? 'Encerrar a vez · próximo: ' + next.name : 'Encerrar a vez';
    return 'result';
  }

  function turnKey(g) { return g.round + '-' + g.turn.player + '-' + g.turn.startedAt; }

  function renderDraw() {
    const g = state.game;
    const t = g.turn;
    const box = $('#draw-box');
    box.hidden = !t.correct;
    if (!t.correct) { state.wheel = null; return; }

    const key = turnKey(g);
    if (!state.wheel || state.wheel.key !== key) state.wheel = { key: key, api: createWheel(), landed: false };
    const holder = $('#draw-wheel');
    if (holder.firstChild !== state.wheel.api.el) {
      holder.innerHTML = '';
      holder.appendChild(state.wheel.api.el);
    }
    if (t.drawn && !state.spinning && !state.wheel.landed) {
      state.wheel.api.land(t.drawn);
      state.wheel.landed = true;
    }

    $('#draw-intro').textContent = t.drawn
      ? (state.spinning ? 'Girando…' : '')
      : 'Gire a roleta para sortear um dos três blocos. Se tiver dinheiro, você pode comprar o bloco que sair.';
    $('#draw-intro').hidden = !!t.drawn && !state.spinning;
    $('#btn-draw').hidden = !!t.drawn;

    const offer = $('#offer');
    offer.hidden = !t.drawn || state.spinning;
    if (!offer.hidden) renderOffer(offer);
  }

  function onDraw() {
    const g = state.game;
    const t = g.turn;
    if (!t || t.drawn || state.spinning) return;
    const value = drawBlock(g);
    if (!value) return;
    saveGame();
    state.spinning = true;
    render('draw-title');
    const w = state.wheel;
    const reduced = reducedMotion();
    w.api.spin(value, reduced ? CONFIG.reducedSpinMs : CONFIG.spinMs).then(function () {
      w.landed = true;
      state.spinning = false;
      if (state.game && state.game.turn === t) {
        render('offer-title');
        const b = blockById(value);
        announce('Saiu o bloco ' + blockName(value) + ', que custa ' + fmtMoney(b.price) + '.');
      }
    });
  }

  function renderOffer(box) {
    const g = state.game;
    const t = g.turn;
    const p = g.players[t.player];
    const b = blockById(t.drawn);
    box.innerHTML = '';
    box.appendChild(h('div', { class: 'offer-card' }, [
      blockArt(b),
      h('span', { class: 'offer-info' }, [
        h('strong', { class: 'offer-title', tabindex: '-1', 'data-key': 'offer-title', text: 'Saiu o bloco ' + blockName(b.id) + '!' }),
        h('span', { text: fmtMoney(b.price) + ' · ' + studs(b.id) + ' bolinhas' })
      ])
    ]));

    if (!t.offer && state.placing) {
      const pickBox = h('div', { class: 'picker-box' });
      renderPicker(pickBox, b.id,
        'Custa ' + fmtMoney(b.price) + '. Depois da compra, você fica com ' + fmtMoney(round2(p.money - b.price)) + '.',
        function (house) {
          const res = buyBlock(state.game, b.id, house);
          state.placing = null;
          if (res.ok) announce('Bloco colocado na ' + CONFIG.houses[house].name.toLowerCase() + ': mais ' + fmtPoints(blockPoints(b.id, house)) + '.');
          commit('end-turn');
        },
        function () { state.placing = null; render('offer-buy'); });
      box.appendChild(pickBox);
      return;
    }

    if (!t.offer) {
      box.appendChild(h('p', { class: 'offer-text', text: 'Você tem ' + fmtMoney(p.money) + '. Quer comprar este bloco e colocar no tabuleiro?' }));
      box.appendChild(h('div', { class: 'offer-actions' }, [
        button('Comprar por ' + fmtMoney(b.price), 'btn btn-primary btn-big', 'offer-buy', function () {
          state.placing = b.id;
          render('picker-title');
        }),
        button('Não comprar', 'btn btn-secondary btn-wide', 'offer-skip', function () {
          declineDrawn(state.game);
          commit('end-turn');
        })
      ]));
      return;
    }

    let text = '';
    let cls = 'offer-result';
    if (t.offer === 'cant') {
      text = 'Você tem ' + fmtMoney(p.money) + ' e o bloco custa ' + fmtMoney(b.price) + '. Faltam ' +
        fmtMoney(round2(b.price - p.money)) + ', então não dá para comprar agora. O dinheiro fica guardado para a próxima!';
      cls += ' is-warn';
    } else if (t.offer === 'declined') {
      text = 'Você preferiu não comprar. O dinheiro fica guardado: ' + fmtMoney(p.money) + '.';
    } else {
      const bought = p.blocks.filter(function (x) { return x.id === t.boughtId; })[0];
      const house = bought ? bought.house : 'blue';
      text = 'Bloco ' + blockName(b.id) + ' colocado na ' + CONFIG.houses[house].name.toLowerCase() + ': +' +
        fmtPoints(blockPoints(b.id, house)) + '! Agora você tem ' + fmtMoney(p.money) + '.';
      cls += ' is-ok';
    }
    box.appendChild(h('p', { class: cls, text: text }));
  }

  function onEndTurn() {
    if (!endTurn(state.game)) return;
    state.selected = null;
    state.placing = null;
    state.wheel = null;
    state.confirmFinish = false;
    commit();
    announce('Vez de ' + state.game.players[state.game.current].name + '.');
  }

  // Roleta dos blocos (canvas).
  function createWheel() {
    const values = CONFIG.blocks.map(function (b) { return b.id; });
    const canvas = h('canvas', { role: 'img', 'aria-label': 'Roleta dos blocos' });
    const fig = h('figure', { class: 'wheel' }, [canvas]);
    const ctx = canvas.getContext('2d');
    const n = values.length;
    const seg = TAU / n;
    let angle = randInt(360) * Math.PI / 180;
    let landed = -1;
    let size = 0;
    let rimColor = '#16201a';

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const px = Math.round((fig.clientWidth || 220) * dpr);
      if (px !== size) { size = px; canvas.width = px; canvas.height = px; }
      rimColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || rimColor;
    }

    function sector(k, cx, cy, r) {
      const a0 = angle + k * seg;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, a0, a0 + seg);
      ctx.closePath();
      return a0;
    }

    function draw() {
      if (!ctx) return;
      if (!size) resize();
      const s = size;
      const cx = s / 2;
      const cy = s * 0.53;
      const r = s * 0.43;
      ctx.clearRect(0, 0, s, s);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let k = 0; k < n; k++) {
        const col = WHEEL_COLORS[k % WHEEL_COLORS.length];
        const a0 = sector(k, cx, cy, r);
        ctx.fillStyle = col.bg;
        ctx.fill();
        ctx.lineWidth = Math.max(1, s * 0.012);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();
        const mid = a0 + seg / 2;
        const tx = cx + Math.cos(mid) * r * 0.6;
        const ty = cy + Math.sin(mid) * r * 0.6;
        const b = blockById(values[k]);
        ctx.fillStyle = col.fg;
        ctx.font = '900 ' + Math.round(r * 0.26) + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(blockName(b.id), tx, ty - r * 0.08);
        ctx.font = '700 ' + Math.round(r * 0.14) + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.fillText('R$ ' + b.price, tx, ty + r * 0.15);
      }

      // Depois de parar, escurece os setores que não saíram.
      if (landed >= 0) {
        for (let k = 0; k < n; k++) {
          if (k === landed) continue;
          sector(k, cx, cy, r);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.lineWidth = s * 0.02;
      ctx.strokeStyle = rimColor;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.16, 0, TAU);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = s * 0.015;
      ctx.strokeStyle = '#16201a';
      ctx.stroke();

      // Ponteiro fixo no alto.
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.07, s * 0.015);
      ctx.lineTo(cx + s * 0.07, s * 0.015);
      ctx.lineTo(cx, s * 0.17);
      ctx.closePath();
      ctx.fillStyle = '#d7263d';
      ctx.fill();
      ctx.lineWidth = s * 0.012;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();
    }

    function target(k, offset) { return -Math.PI / 2 - (k + 0.5) * seg + offset; }

    function setLabel(value) {
      canvas.setAttribute('aria-label', 'Roleta dos blocos: saiu o bloco ' + blockName(value));
    }

    function land(value) {
      const k = values.indexOf(value);
      angle = target(k, 0);
      landed = k;
      setLabel(value);
      resize();
      draw();
    }

    function spin(value, duration) {
      resize();
      landed = -1;
      canvas.setAttribute('aria-label', 'Roleta dos blocos: girando');
      const k = values.indexOf(value);
      const offset = (randInt(1000) / 1000 - 0.5) * seg * 0.6; // não para sempre no meio do setor
      let delta = (target(k, offset) - angle) % TAU;
      if (delta < 0) delta += TAU;
      delta += (duration < 1000 ? 1 : 4) * TAU;
      const start = angle;
      return new Promise(function (resolve) {
        let done = false;
        const t0 = performance.now();
        function finish() {
          if (done) return;
          done = true;
          angle = start + delta;
          landed = k;
          setLabel(value);
          draw();
          resolve();
        }
        function frame(now) {
          if (done) return;
          const p = Math.min(1, Math.max(0, (now - t0) / duration));
          angle = start + delta * (1 - Math.pow(1 - p, 3));
          draw();
          if (p < 1) requestAnimationFrame(frame); else finish();
        }
        requestAnimationFrame(frame);
        setTimeout(finish, duration + 500); // garante o fim com a aba em segundo plano
      });
    }

    return { el: fig, spin: spin, land: land, redraw: function () { resize(); draw(); } };
  }

  /* ---------- Fim de jogo ---------- */

  function renderFinal() {
    const g = state.game;
    const rows = ranking(g);
    const top = rows.filter(function (r) { return r.position === 1; });
    const best = top[0].score.total;
    let title;
    if (g.players.length === 1) title = top[0].player.name + ' fez ' + fmtPoints(best) + '!';
    else if (best === 0) title = 'Ninguém fez pontos desta vez';
    else if (top.length === 1) title = top[0].player.name + ' venceu com ' + fmtPoints(best) + '!';
    else title = 'Empate entre ' + joinNames(top.map(function (r) { return r.player.name; })) + ', com ' + fmtPoints(best) + '!';
    $('#final-title').textContent = title;
    $('#final-sub').textContent = 'Pontos contados pelas bolinhas dos blocos verdes, em dobro nas casas vermelhas.';

    const list = $('#ranking');
    list.innerHTML = '';
    rows.forEach(function (r) {
      const s = r.score;
      const asked = r.player.right + r.player.wrong;
      list.appendChild(h('li', { class: 'rank-card' + (r.position === 1 && best > 0 ? ' is-winner' : '') }, [
        h('span', { class: 'rank-pos', text: r.position + 'º' }),
        h('div', { class: 'rank-body' }, [
          h('div', { class: 'rank-head' }, [
            h('strong', { class: 'rank-name', text: r.player.name }),
            h('span', { class: 'rank-total', text: fmtPoints(s.total) })
          ]),
          h('ul', { class: 'rank-detail' }, [
            h('li', { class: 'is-blue', text: 'Azuis: ' + fmtBlocks(s.blue.blocks) + ' · ' + fmtPoints(s.blue.points) }),
            h('li', { class: 'is-red', text: 'Vermelhas: ' + fmtBlocks(s.red.blocks) + ' · ' + fmtPoints(s.red.points) + (s.red.blocks ? ' (dobro)' : '') }),
            h('li', { text: 'Sobrou: ' + fmtMoney(r.player.money) }),
            h('li', { text: 'Acertos: ' + r.player.right + ' de ' + asked })
          ])
        ])
      ]));
    });
    return 'final';
  }

  /* ---------- Início ---------- */

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    const local = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    if (location.protocol !== 'https:' && !local) return;
    window.addEventListener('load', function () {
      try {
        navigator.serviceWorker.register('sw.js').catch(function () { /* segue sem modo offline */ });
      } catch (e) { /* navegador bloqueou: segue sem modo offline */ }
    });
  }

  function init() {
    cleanOldKeys();
    state.game = loadGame();
    state.setupNames = state.game
      ? state.game.players.map(function (p) { return p.name; })
      : loadNames();

    $('#btn-add-player').addEventListener('click', onAddPlayer);
    $('#btn-start-game').addEventListener('click', onStartGame);
    $('#btn-back-game').addEventListener('click', function () { state.setup = false; render(); });
    $('#btn-start-turn').addEventListener('click', onStartTurn);
    $('#btn-finish').addEventListener('click', function () { state.confirmFinish = true; render('finish-yes'); });
    $('#btn-finish-no').addEventListener('click', function () { state.confirmFinish = false; render('finish'); });
    $('#btn-finish-yes').addEventListener('click', function () {
      state.confirmFinish = false;
      if (finishGame(state.game)) commit();
    });
    $('#btn-new-game').addEventListener('click', function () {
      state.setup = true;
      state.setupNames = state.game.players.map(function (p) { return p.name; });
      render();
    });
    $('#btn-level-go').addEventListener('click', onLevelGo);
    $('#btn-level-back').addEventListener('click', function () { if (cancelTurn(state.game)) commit(); });
    $('#btn-shop-go').addEventListener('click', onShopGo);
    $('#btn-answer').addEventListener('click', onAnswer);
    $('#btn-draw').addEventListener('click', onDraw);
    $('#btn-end-turn').addEventListener('click', onEndTurn);
    $('#btn-again').addEventListener('click', function () { newGame(state.game.players.map(function (p) { return p.name; })); });
    $('#btn-final-new').addEventListener('click', function () {
      state.setup = true;
      state.setupNames = state.game.players.map(function (p) { return p.name; });
      render();
    });
    $('#btn-reopen').addEventListener('click', function () { reopenGame(state.game); commit(); });

    document.addEventListener('visibilitychange', tick);
    window.addEventListener('resize', function () { if (state.wheel && state.screen === 'result') state.wheel.api.redraw(); });
    render();
    registerServiceWorker();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
