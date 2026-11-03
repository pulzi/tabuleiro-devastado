/*
 * Tabuleiro Devastado – Sorteador de Contas
 *
 * Só juros simples:
 *   J = C × i × t     M = C + J     i = J ÷ (C × t)     t = J ÷ (C × i)
 *
 * Este arquivo tem duas partes:
 *   1. Núcleo (sem tela): valores do jogo, sorteio das perguntas e correção.
 *      O test.js usa esta parte no Node.
 *   2. Interface: telas, roleta e cronômetro. Só roda no navegador.
 */
(function () {
  'use strict';

  /* ==========================================================
   * 1. NÚCLEO
   * ======================================================== */

  // Valores do jogo. Para mudar preços, taxas, tempos ou o cronômetro, edite aqui
  // e rode "node test.js" para conferir que as contas continuam com até 2 casas.
  const CONFIG = {
    // Blocos verdes: o preço do bloco é o capital C da conta.
    blocks: [
      { id: '2x2', cols: 2, rows: 2, price: 20 },
      { id: '3x2', cols: 3, rows: 2, price: 50 },
      { id: '4x2', cols: 4, rows: 2, price: 70 }
    ],
    rates: [5, 10, 15, 20], // taxas i e j, em % ao mês
    times: [1, 2, 3, 4],    // tempo t, em meses
    // Tempo para responder no modo "Automático": cada coisa que a pergunta pede soma tempo.
    // Com os valores abaixo: nível 1 = 30 s, nível 2 = 45 s, nível 3 = 60 s,
    // nível 4 = 45 s (descobrir taxa ou tempo) ou 90 s (comparar duas lojas).
    autoTime: {
      readMs: 15000,           // ler o enunciado e os valores sorteados
      perField: {
        money: 15000,          // cada valor em reais: juros, rendimento ou total
        percent: 30000,        // descobrir a taxa (conta "ao contrário")
        months: 30000,         // descobrir o tempo (conta "ao contrário")
        choice: 5000,          // decisão: à vista/parcelado, Loja A/B
        justification: 10000   // ler e escolher a justificativa
      }
    },
    timeChoices: [20, 30, 45, 60, 90, 120], // tempos fixos (em segundos) que dá para escolher na engrenagem
    warningMs: 10000,       // últimos segundos em vermelho
    tolerance: 0.01,        // diferença aceita na resposta
    spinMs: 2200,           // duração do giro da roleta
    spinStaggerMs: 250,     // cada roleta seguinte para um pouco depois
    reducedSpinMs: 600      // giro curto para quem pediu menos animação
  };

  const LEVELS = [
    { id: 1, name: 'Juros', desc: 'Com C, i e t, calcular os juros (J = C × i × t).' },
    { id: 2, name: 'Montante', desc: 'Calcular os juros e o total a pagar (M = C + J).' },
    { id: 3, name: 'Compensa parcelar?', desc: 'Comparar os juros da loja com o rendimento do dinheiro guardado.' },
    { id: 4, name: 'Descobrir e comparar', desc: 'Descobrir a taxa ou o tempo, ou comparar duas lojas.' }
  ];

  const SUBTYPES = { a: 'Descobrir a taxa', b: 'Descobrir o tempo', c: 'Comparar duas lojas' };

  // Justificativas do nível 3: uma certa e algumas erradas (mas plausíveis).
  const JUSTIFICATIONS_3 = {
    parcelado: {
      correct: 'O rendimento é maior que os juros cobrados.',
      wrong: [
        'Parcelar é sempre melhor.',
        'O capital é grande demais.',
        'Os juros cobrados são maiores que o rendimento.',
        'O tempo é curto, então os juros não importam.'
      ]
    },
    vista: {
      correct: 'Os juros cobrados são maiores que o rendimento.',
      wrong: [
        'Pagar à vista é sempre melhor.',
        'O capital é pequeno demais.',
        'O rendimento é maior que os juros cobrados.',
        'O tempo é longo, então é melhor pagar logo.'
      ]
    }
  };

  /* ---------- Sorteio ---------- */

  const globalObj = typeof globalThis !== 'undefined' ? globalThis : typeof self !== 'undefined' ? self : {};
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

  function shuffle(list) {
    const a = list.slice();
    for (let k = a.length - 1; k > 0; k--) {
      const r = randInt(k + 1);
      const tmp = a[k]; a[k] = a[r]; a[r] = tmp;
    }
    return a;
  }

  /* ---------- Números ---------- */

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
  // 50 → "50"; 2.5 → "2,50"
  function fmtPlain(x) { return Number.isInteger(x) ? fmtNumber(x, 0) : fmtNumber(x, 2); }
  function fmtMoney(x) { return 'R$ ' + fmtNumber(x, 2); }
  function fmtRateDec(p) { return fmtNumber(p / 100, 2); } // 10 → "0,10"
  function fmtRate(p) { return fmtPlain(p) + '% ao mês'; }
  function fmtMonths(t) { return fmtPlain(t) + (t === 1 ? ' mês' : ' meses'); }

  // Lê "12,50", "12.5", "R$ 12,50", "15%", "3 meses"... Devolve null se não houver número.
  function parseNumber(raw) {
    if (raw === null || raw === undefined) return null;
    let s = String(raw).replace(/[^\d.,-]/g, '');
    if (!/\d/.test(s)) return null;
    const lastComma = s.lastIndexOf(',');
    const lastDot = s.lastIndexOf('.');
    if (lastComma >= 0 && lastDot >= 0) {
      // Os dois aparecem: o último é a vírgula decimal ("1.234,50" ou "1,234.50").
      s = lastComma > lastDot ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    } else if (lastComma >= 0) {
      s = s.replace(',', '.');
    }
    const n = Number(s);
    return isFinite(n) ? n : null;
  }

  /* ---------- Peças das perguntas ---------- */

  function blockText(block) { return 'o bloco ' + block.id + ' (' + fmtMoney(block.price) + ')'; }

  function given(key, label, value, text) { return { key: key, label: label, value: value, text: text }; }
  function unknown(key, label) { return { key: key, label: label, value: null, text: '?', unknown: true }; }
  function capital(block) { return given('C', 'Capital (C)', block.price, fmtMoney(block.price) + ' (bloco ' + block.id + ')'); }

  // Uma roleta. "secret" = gira, mas o valor fica escondido (é o que o jogador vai descobrir).
  function wheel(key, label, kind, value, secret) {
    return {
      key: key, label: label, kind: kind, symbol: key.charAt(0), value: value, secret: !!secret,
      values: kind === 'rate' ? CONFIG.rates : CONFIG.times
    };
  }

  function numField(id, kind, label, answer) { return { id: id, kind: kind, label: label, answer: answer }; }

  // label: nome curto (usado no resultado); prompt: pergunta mostrada acima das opções.
  function choiceField(id, label, prompt, options, answer) {
    return { id: id, kind: 'choice', label: label, prompt: prompt, options: options, answer: answer };
  }

  // 1 frase certa + 2 erradas sorteadas, em ordem aleatória.
  function justificationField(correctText, wrongPool) {
    const wrong = shuffle(wrongPool).slice(0, 2);
    const options = shuffle([{ text: correctText, correct: true }].concat(
      wrong.map(function (text) { return { text: text, correct: false }; })
    ));
    options.forEach(function (o, k) { o.value = 'j' + k; });
    const answer = options.filter(function (o) { return o.correct; })[0].value;
    return {
      id: 'just', kind: 'justification', label: 'Justificativa', prompt: 'Justificativa: por que essa decisão?',
      options: options, answer: answer
    };
  }

  function substitution(symbol, C, rate, t, result) {
    return symbol + ' = ' + fmtPlain(C) + ' × ' + fmtRateDec(rate) + ' × ' + t + ' = ' + fmtNumber(result, 2);
  }

  /* ---------- Níveis 1 e 2: juros e montante ---------- */

  function buildInterest(block, withTotal) {
    const level = withTotal ? 2 : 1;
    const C = block.price;
    const i = pick(CONFIG.rates);
    const t = pick(CONFIG.times);
    const J = interest(C, i, t);
    const M = round2(C + J);

    const fields = [numField('J', 'money', 'Juros (J)', J)];
    const steps = [
      { text: 'Fórmula dos juros simples:', math: 'J = C × i × t' },
      { text: 'Taxa em número decimal:', math: i + '% = ' + fmtRateDec(i) },
      { text: 'Substituindo os valores:', math: substitution('J', C, i, t, J) }
    ];
    if (withTotal) {
      fields.push(numField('M', 'money', 'Total a pagar (M)', M));
      steps.push({ text: 'Total a pagar (montante):', math: 'M = C + J = ' + fmtPlain(C) + ' + ' + fmtNumber(J, 2) + ' = ' + fmtNumber(M, 2) });
      steps.push({ text: 'Resposta:', math: 'Juros ' + fmtMoney(J) + ' e total ' + fmtMoney(M) });
    } else {
      steps.push({ text: 'Resposta:', math: 'Juros ' + fmtMoney(J) });
    }

    return {
      level: level, sub: null, block: block,
      key: [level, C, i, t].join('|'),
      data: withTotal ? { C: C, i: i, t: t, J: J, M: M } : { C: C, i: i, t: t, J: J },
      wheelGroups: [{ title: 'Roleta da loja', wheels: [wheel('i', 'Taxa (i)', 'rate', i), wheel('t', 'Tempo (t)', 'time', t)] }],
      givens: [capital(block), given('i', 'Taxa (i)', i, fmtRate(i)), given('t', 'Tempo (t)', t, fmtMonths(t))],
      story: 'Você quer limpar uma área do tabuleiro e comprar ' + blockText(block) + '. A loja deixa pagar daqui a ' +
        fmtMonths(t) + ', com juros simples de ' + i + '% ao mês. ' +
        (withTotal ? 'Quanto você vai pagar de juros? E quanto vai pagar no total?' : 'Quanto você vai pagar de juros?'),
      formulas: withTotal ? ['J = C × i × t', 'M = C + J'] : ['J = C × i × t'],
      fields: fields,
      steps: steps
    };
  }

  /* ---------- Nível 3: compensa parcelar? ---------- */

  function buildInstallments(block) {
    const C = block.price;
    let i, j;
    // Todos os pares com j ≠ i têm a mesma chance, então metade das vezes j > i (parcelar compensa).
    do { i = pick(CONFIG.rates); j = pick(CONFIG.rates); } while (i === j);
    const t = pick(CONFIG.times);
    const Jp = interest(C, i, t); // juros pagos à loja
    const R = interest(C, j, t);  // rendimento do dinheiro guardado
    const decision = R > Jp ? 'parcelado' : 'vista';
    const just = JUSTIFICATIONS_3[decision];

    return {
      level: 3, sub: null, block: block,
      key: [3, C, i, j, t].join('|'),
      data: { C: C, i: i, j: j, t: t, Jp: Jp, R: R },
      wheelGroups: [
        { title: 'Roleta da loja', wheels: [wheel('i', 'Taxa (i)', 'rate', i), wheel('t', 'Tempo (t)', 'time', t)] },
        { title: 'Segunda roleta: rendimento', wheels: [wheel('j', 'Rendimento (j)', 'rate', j)] }
      ],
      givens: [
        capital(block),
        given('i', 'Juros da loja (i)', i, fmtRate(i)),
        given('t', 'Tempo (t)', t, fmtMonths(t)),
        given('j', 'Rendimento (j)', j, fmtRate(j))
      ],
      story: 'Você quer comprar ' + blockText(block) + '. Pode pagar à vista agora ou pagar tudo daqui a ' + fmtMonths(t) +
        ', com juros simples de ' + i + '% ao mês. Se não pagar agora, o seu dinheiro fica guardado rendendo ' + j +
        '% ao mês (juros simples) pelos mesmos ' + fmtMonths(t) + '. Compensa parcelar?',
      formulas: ['Juros pagos = C × i × t', 'Rendimento = C × j × t', 'Parcelar compensa se o rendimento for maior que os juros.'],
      fields: [
        numField('Jp', 'money', 'Juros pagos à loja', Jp),
        numField('R', 'money', 'Rendimento do dinheiro guardado', R),
        choiceField('dec', 'Decisão', 'Decisão: compensa parcelar?', [
          { value: 'vista', text: 'À vista' },
          { value: 'parcelado', text: 'Parcelado' }
        ], decision),
        justificationField(just.correct, just.wrong)
      ],
      steps: [
        { text: 'Juros pagos à loja:', math: 'J = C × i × t = ' + fmtPlain(C) + ' × ' + fmtRateDec(i) + ' × ' + t + ' = ' + fmtNumber(Jp, 2) },
        { text: 'Rendimento do dinheiro guardado:', math: 'R = C × j × t = ' + fmtPlain(C) + ' × ' + fmtRateDec(j) + ' × ' + t + ' = ' + fmtNumber(R, 2) },
        {
          text: 'Comparando:',
          math: decision === 'parcelado'
            ? fmtMoney(R) + ' (rendimento) > ' + fmtMoney(Jp) + ' (juros)'
            : fmtMoney(Jp) + ' (juros) > ' + fmtMoney(R) + ' (rendimento)'
        },
        {
          text: decision === 'parcelado'
            ? 'Decisão: Parcelado. O dinheiro guardado rende mais do que os juros cobrados.'
            : 'Decisão: À vista. Os juros cobrados custam mais do que o dinheiro rende.'
        },
        { text: 'Justificativa certa:', math: just.correct }
      ]
    };
  }

  /* ---------- Nível 4: descobrir e comparar ---------- */

  function buildFindRate(block) {
    const C = block.price;
    const i = pick(CONFIG.rates);
    const t = pick(CONFIG.times);
    const J = interest(C, i, t);
    return {
      level: 4, sub: 'a', block: block,
      key: ['4a', C, i, t].join('|'),
      data: { C: C, t: t, J: J, i: i },
      wheelGroups: [{ title: 'Roleta (a taxa é secreta!)', wheels: [wheel('i', 'Taxa (i)', 'rate', i, true), wheel('t', 'Tempo (t)', 'time', t)] }],
      givens: [capital(block), given('t', 'Tempo (t)', t, fmtMonths(t)), given('J', 'Juros pagos (J)', J, fmtMoney(J)), unknown('i', 'Taxa (i)')],
      story: 'Você comprou ' + blockText(block) + ' para pagar daqui a ' + fmtMonths(t) + ' e pagou ' + fmtMoney(J) +
        ' de juros simples. Qual foi a taxa de juros ao mês?',
      formulas: ['J = C × i × t', 'i = J ÷ (C × t)', 'Depois passe para %: 0,10 = 10%'],
      fields: [numField('i', 'percent', 'Taxa de juros (i)', i)],
      steps: [
        { text: 'Isolando a taxa em J = C × i × t:', math: 'i = J ÷ (C × t)' },
        {
          text: 'Substituindo os valores:',
          math: 'i = ' + fmtNumber(J, 2) + ' ÷ (' + fmtPlain(C) + ' × ' + t + ') = ' + fmtNumber(J, 2) + ' ÷ ' + fmtPlain(C * t) + ' = ' + fmtRateDec(i)
        },
        { text: 'Em porcentagem:', math: fmtRateDec(i) + ' = ' + i + '% ao mês' }
      ]
    };
  }

  function buildFindTime(block) {
    const C = block.price;
    const i = pick(CONFIG.rates);
    const t = pick(CONFIG.times);
    const J = interest(C, i, t);
    const Ci = round2(C * i / 100);
    return {
      level: 4, sub: 'b', block: block,
      key: ['4b', C, i, t].join('|'),
      data: { C: C, i: i, J: J, Ci: Ci, t: t },
      wheelGroups: [{ title: 'Roleta (o tempo é secreto!)', wheels: [wheel('i', 'Taxa (i)', 'rate', i), wheel('t', 'Tempo (t)', 'time', t, true)] }],
      givens: [capital(block), given('i', 'Taxa (i)', i, fmtRate(i)), given('J', 'Juros pagos (J)', J, fmtMoney(J)), unknown('t', 'Tempo (t)')],
      story: 'Você comprou ' + blockText(block) + ' com juros simples de ' + i + '% ao mês e pagou ' + fmtMoney(J) +
        ' de juros. Por quantos meses foi o parcelamento?',
      formulas: ['J = C × i × t', 't = J ÷ (C × i)'],
      fields: [numField('t', 'months', 'Tempo (t)', t)],
      steps: [
        { text: 'Isolando o tempo em J = C × i × t:', math: 't = J ÷ (C × i)' },
        { text: 'Primeiro, C × i:', math: fmtPlain(C) + ' × ' + fmtRateDec(i) + ' = ' + fmtNumber(Ci, 2) },
        { text: 'Depois, divida os juros:', math: 't = ' + fmtNumber(J, 2) + ' ÷ ' + fmtNumber(Ci, 2) + ' = ' + t },
        { text: 'Resposta:', math: 't = ' + fmtMonths(t) }
      ]
    };
  }

  function buildCompareStores(block) {
    const C = block.price;
    let iA, tA, iB, tB;
    do {
      iA = pick(CONFIG.rates); tA = pick(CONFIG.times);
      iB = pick(CONFIG.rates); tB = pick(CONFIG.times);
    } while (iA * tA === iB * tB); // mesmo i × t daria o mesmo total: nunca empatar
    const JA = interest(C, iA, tA), MA = round2(C + JA);
    const JB = interest(C, iB, tB), MB = round2(C + JB);
    const win = MA < MB ? 'A' : 'B';
    const lose = win === 'A' ? 'B' : 'A';
    const rate = { A: iA, B: iB };
    const time = { A: tA, B: tB };
    const total = { A: MA, B: MB };

    // Erradas: falsas nesta pergunta (não só "em geral").
    const wrong = [
      'Na Loja ' + lose + ', os juros e o total a pagar são menores.',
      'As duas lojas cobram o mesmo total.',
      'O bloco tem um preço diferente em cada loja.'
    ];
    if (rate[lose] < rate[win]) wrong.push('A Loja ' + lose + ' tem a menor taxa, então sempre sai mais barata.');
    if (time[lose] < time[win]) wrong.push('A Loja ' + lose + ' tem o menor prazo, então sempre sai mais barata.');
    const correct = 'Na Loja ' + win + ', os juros e o total a pagar são menores.';

    return {
      level: 4, sub: 'c', block: block,
      key: ['4c', C, iA, tA, iB, tB].join('|'),
      data: { C: C, iA: iA, tA: tA, iB: iB, tB: tB, JA: JA, MA: MA, JB: JB, MB: MB },
      wheelGroups: [
        { title: 'Loja A', wheels: [wheel('iA', 'Taxa (i)', 'rate', iA), wheel('tA', 'Tempo (t)', 'time', tA)] },
        { title: 'Loja B', wheels: [wheel('iB', 'Taxa (i)', 'rate', iB), wheel('tB', 'Tempo (t)', 'time', tB)] }
      ],
      givens: [
        capital(block),
        given('iA', 'Loja A: taxa', iA, fmtRate(iA)),
        given('tA', 'Loja A: tempo', tA, fmtMonths(tA)),
        given('iB', 'Loja B: taxa', iB, fmtRate(iB)),
        given('tB', 'Loja B: tempo', tB, fmtMonths(tB))
      ],
      story: 'Duas lojas vendem ' + blockText(block) + ' para pagar depois, com juros simples. Loja A: ' + iA +
        '% ao mês por ' + fmtMonths(tA) + '. Loja B: ' + iB + '% ao mês por ' + fmtMonths(tB) +
        '. Calcule os juros e o total de cada loja. Qual cobra menos no total?',
      formulas: ['J = C × i × t', 'M = C + J', 'Compare os totais (M) das duas lojas.'],
      fields: [
        numField('JA', 'money', 'Juros na Loja A', JA),
        numField('MA', 'money', 'Total na Loja A', MA),
        numField('JB', 'money', 'Juros na Loja B', JB),
        numField('MB', 'money', 'Total na Loja B', MB),
        choiceField('dec', 'Loja mais barata', 'Qual loja cobra menos no total?', [
          { value: 'A', text: 'Loja A' },
          { value: 'B', text: 'Loja B' }
        ], win),
        justificationField(correct, wrong)
      ],
      steps: [
        { text: 'Fórmulas:', math: 'J = C × i × t   e   M = C + J' },
        { text: 'Loja A, juros:', math: substitution('J', C, iA, tA, JA) },
        { text: 'Loja A, total:', math: 'M = ' + fmtPlain(C) + ' + ' + fmtNumber(JA, 2) + ' = ' + fmtNumber(MA, 2) },
        { text: 'Loja B, juros:', math: substitution('J', C, iB, tB, JB) },
        { text: 'Loja B, total:', math: 'M = ' + fmtPlain(C) + ' + ' + fmtNumber(JB, 2) + ' = ' + fmtNumber(MB, 2) },
        { text: 'Comparando os totais:', math: fmtMoney(total[win]) + ' (Loja ' + win + ') < ' + fmtMoney(total[lose]) + ' (Loja ' + lose + ')' },
        { text: 'Decisão: a Loja ' + win + ' cobra menos no total.' },
        { text: 'Justificativa certa:', math: correct }
      ]
    };
  }

  function buildLevel4(block, sub) {
    sub = sub || pick(['a', 'b', 'c']);
    if (sub === 'a') return buildFindRate(block);
    if (sub === 'b') return buildFindTime(block);
    return buildCompareStores(block);
  }

  const BUILDERS = {
    1: function (block) { return buildInterest(block, false); },
    2: function (block) { return buildInterest(block, true); },
    3: buildInstallments,
    4: function (block) { return buildLevel4(block); }
  };

  /* ---------- Gerador ---------- */

  function findBlock(id) {
    const block = CONFIG.blocks.filter(function (b) { return b.id === id; })[0];
    if (!block) throw new Error('Bloco desconhecido: ' + id);
    return block;
  }

  // Monta uma pergunta de um nível (e subtipo, no nível 4) específico. Usado nos testes.
  function buildQuestion(level, blockId, sub) {
    const block = findBlock(blockId);
    return level === 4 ? buildLevel4(block, sub) : BUILDERS[level](block);
  }

  // Confere as regras da pergunta: até 2 casas decimais, i ≠ j, lojas sem empate,
  // justificativas distintas com exatamente uma certa.
  function validateQuestion(q) {
    const numbers = [];
    Object.keys(q.data).forEach(function (k) { numbers.push(q.data[k]); });
    q.fields.forEach(function (f) { if (typeof f.answer === 'number') numbers.push(f.answer); });
    if (!numbers.every(hasMax2Decimals)) return false;

    if (q.level === 3 && q.data.i === q.data.j) return false;
    if (q.level === 4 && q.sub === 'c' && q.data.MA === q.data.MB) return false;

    const okWheels = q.wheelGroups.every(function (g) {
      return g.wheels.every(function (w) { return w.values.indexOf(w.value) >= 0; });
    });
    if (!okWheels) return false;

    return q.fields.every(function (f) {
      if (f.kind !== 'justification') return true;
      const texts = f.options.map(function (o) { return o.text; });
      const unique = texts.filter(function (t, k) { return texts.indexOf(t) === k; });
      const correct = f.options.filter(function (o) { return o.correct; });
      return f.options.length === 3 && unique.length === 3 && correct.length === 1 && correct[0].value === f.answer;
    });
  }

  // opts: { levels: [1, 2, ...], blockId: '3x2', lastKey: chave da pergunta anterior }
  function generateQuestion(opts) {
    const wanted = (opts && opts.levels) || [];
    const levels = LEVELS.map(function (l) { return l.id; }).filter(function (id) { return wanted.indexOf(id) >= 0; });
    if (!levels.length) throw new Error('Escolha pelo menos um nível.');
    const block = findBlock(opts.blockId);
    const level = pick(levels); // todos os níveis marcados têm a mesma chance

    let q = null;
    for (let attempt = 0; attempt < 200; attempt++) {
      q = BUILDERS[level](block);
      if (validateQuestion(q) && q.key !== opts.lastKey) return q;
    }
    if (typeof console !== 'undefined') console.warn('Sorteador: nenhuma pergunta válida; confira os valores em CONFIG.');
    return q;
  }

  /* ---------- Correção ---------- */

  function readNumber(field, raw) {
    let n = parseNumber(raw);
    // Na taxa, aceita também a forma decimal: 0,15 = 15%.
    if (n !== null && field.kind === 'percent' && n > 0 && n < 1) n = n * 100;
    return n;
  }

  function fmtFieldValue(field, value) {
    if (field.kind === 'money') return fmtMoney(value);
    if (field.kind === 'percent') return fmtPlain(round2(value)) + '% ao mês';
    if (field.kind === 'months') return fmtMonths(round2(value));
    const opt = field.options.filter(function (o) { return o.value === value; })[0];
    return opt ? opt.text : '';
  }

  // answers: { idDoCampo: texto digitado ou valor escolhido }
  function gradeAnswers(q, answers, timedOut) {
    answers = answers || {};
    const fields = q.fields.map(function (f) {
      const raw = answers[f.id];
      let ok, givenText;
      if (f.kind === 'choice' || f.kind === 'justification') {
        ok = raw === f.answer;
        givenText = raw ? fmtFieldValue(f, raw) : '';
      } else {
        const n = readNumber(f, raw);
        ok = n !== null && Math.abs(n - f.answer) <= CONFIG.tolerance + 1e-9;
        givenText = n === null ? '' : fmtFieldValue(f, n);
      }
      return { id: f.id, label: f.label, ok: ok, given: givenText, expected: fmtFieldValue(f, f.answer) };
    });
    return {
      correct: !timedOut && fields.every(function (r) { return r.ok; }),
      timedOut: !!timedOut,
      fields: fields
    };
  }

  /* ---------- Tempo para responder ---------- */

  // 'auto' ou um dos tempos fixos de CONFIG.timeChoices (em segundos). Qualquer outra coisa vira 'auto'.
  function normalizeTimeChoice(choice) {
    const s = Number(choice);
    return choice !== 'auto' && CONFIG.timeChoices.indexOf(s) >= 0 ? s : 'auto';
  }

  // Tempo (em ms) para responder a pergunta q.
  //   choice = 'auto': depende do nível e do que a pergunta pede (CONFIG.autoTime);
  //   choice = 45:     45 segundos, qualquer que seja a pergunta.
  function answerTimeMs(q, choice) {
    const fixed = normalizeTimeChoice(choice);
    if (fixed !== 'auto') return fixed * 1000;
    const t = CONFIG.autoTime;
    return q.fields.reduce(function (ms, f) { return ms + (t.perField[f.kind] || 0); }, t.readMs);
  }

  // Menor e maior tempo automático de um nível (o nível 4 tem subtipos com tempos diferentes).
  function autoTimeRange(level) {
    const block = CONFIG.blocks[0];
    const questions = level === 4
      ? Object.keys(SUBTYPES).map(function (sub) { return buildLevel4(block, sub); })
      : [BUILDERS[level](block)];
    const ms = questions.map(function (q) { return answerTimeMs(q, 'auto'); });
    return { min: Math.min.apply(null, ms), max: Math.max.apply(null, ms) };
  }

  const Core = {
    CONFIG: CONFIG, LEVELS: LEVELS, SUBTYPES: SUBTYPES,
    generateQuestion: generateQuestion, buildQuestion: buildQuestion, validateQuestion: validateQuestion,
    gradeAnswers: gradeAnswers, parseNumber: parseNumber, readNumber: readNumber,
    answerTimeMs: answerTimeMs, autoTimeRange: autoTimeRange, normalizeTimeChoice: normalizeTimeChoice,
    interest: interest, hasMax2Decimals: hasMax2Decimals,
    fmtNumber: fmtNumber, fmtPlain: fmtPlain, fmtMoney: fmtMoney, fmtRateDec: fmtRateDec, fmtMonths: fmtMonths
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = Core;
  if (typeof document === 'undefined') return; // Node: só o núcleo.

  /* ==========================================================
   * 2. INTERFACE
   * ======================================================== */

  const STORAGE_KEY = 'tabuleiro-devastado:config';
  const TAU = Math.PI * 2;
  const WHEEL_COLORS = [
    { bg: '#1a6b39', fg: '#ffffff' },
    { bg: '#f2b705', fg: '#1b1400' },
    { bg: '#0b5f86', fg: '#ffffff' },
    { bg: '#e8e2cf', fg: '#16201a' }
  ];
  const SECRET_COLORS = [{ bg: '#4b5563', fg: '#ffffff' }, { bg: '#6b7280', fg: '#ffffff' }];
  const AFFIX = {
    money: { prefix: 'R$', unit: 'em reais' },
    percent: { suffix: '%', unit: 'em % ao mês' },
    months: { suffix: 'meses', unit: 'em meses' }
  };

  const state = {
    config: { levels: [1, 2], showFormulas: false, time: 'auto' },
    screen: null,
    setupMode: 'start',
    settingsReturn: 'turn',
    blockId: null,
    question: null,
    limitMs: 0,
    lastKey: null,
    wheels: [],
    spinToken: null,
    timer: null,
    finished: true
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

  function reducedMotion() {
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  function announce(text) {
    const live = $('#sr-live');
    live.textContent = '';
    setTimeout(function () { live.textContent = text; }, 50);
  }

  // 45000 → "45 s"
  function fmtSeconds(ms) { return Math.round(ms / 1000) + ' s'; }

  function timeSummary(choice) {
    return choice === 'auto' ? 'automático (pelo nível)' : fmtSeconds(choice * 1000) + ' em toda pergunta';
  }

  /* ---------- Preferências (localStorage é opcional) ---------- */

  function loadConfig() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && Array.isArray(saved.levels)) {
        const levels = saved.levels.map(Number).filter(function (id) {
          return LEVELS.some(function (l) { return l.id === id; });
        });
        if (levels.length) state.config.levels = levels;
        state.config.showFormulas = saved.showFormulas === true;
        state.config.time = normalizeTimeChoice(saved.time);
      }
    } catch (e) { /* sem localStorage: usa o padrão */ }
  }

  function saveConfig() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config)); } catch (e) { /* tudo bem */ }
  }

  /* ---------- Telas ---------- */

  function showScreen(name) {
    state.screen = name;
    $$('.screen').forEach(function (s) { s.hidden = s.id !== 'screen-' + name; });
    $('#btn-settings').hidden = !(name === 'turn' || name === 'result');
    window.scrollTo(0, 0);
    const heading = $('#screen-' + name + ' [data-focus]');
    if (heading) {
      try { heading.focus({ preventScroll: true }); } catch (e) { heading.focus(); }
    }
  }

  function setBadge(slot, q) {
    const lv = LEVELS.filter(function (l) { return l.id === q.level; })[0];
    const box = $(slot);
    box.innerHTML = '';
    box.appendChild(h('span', { class: 'level-badge lv-' + q.level }, [
      h('strong', { text: 'Nível ' + q.level }),
      h('span', { text: lv.name + (q.sub ? ' · ' + SUBTYPES[q.sub] : '') })
    ]));
  }

  function renderChips(list, givens) {
    list.innerHTML = '';
    givens.forEach(function (g) {
      list.appendChild(h('li', {
        class: 'chip' + (g.unknown ? ' is-unknown' : ''),
        'data-key': g.key,
        'data-value': g.value === null ? '' : g.value
      }, [
        h('span', { class: 'chip-label', text: g.label }),
        h('span', { class: 'chip-value', text: g.text })
      ]));
    });
  }

  /* ---------- 1. Tela inicial / configurações ---------- */

  function openSetup(mode) {
    state.setupMode = mode;
    renderSetup();
    showScreen('setup');
  }

  function renderSetup() {
    const list = $('#levels-list');
    list.innerHTML = '';
    LEVELS.forEach(function (lv) {
      const id = 'lv-' + lv.id;
      const input = h('input', { type: 'checkbox', id: id, name: 'level', value: lv.id });
      input.checked = state.config.levels.indexOf(lv.id) >= 0;
      input.addEventListener('change', updateSetup);
      list.appendChild(h('label', { class: 'check-card', for: id }, [
        input,
        h('span', { class: 'check-body' }, [
          h('strong', { text: 'Nível ' + lv.id + ' – ' + lv.name }),
          h('span', { class: 'check-desc', text: lv.desc })
        ])
      ]));
    });
    renderTimeChoices();
    $('#opt-formulas').checked = state.config.showFormulas;
    $('#setup-title').textContent = state.setupMode === 'edit' ? 'Configurações' : 'Como jogar';
    $('#setup-intro').hidden = state.setupMode === 'edit';
    $('#btn-start').textContent = state.setupMode === 'edit' ? 'Salvar e voltar' : 'Começar';
    updateSetup();
  }

  // Escolha do tempo da rodada: "Automático" (pelo nível) ou um tempo fixo para todas as perguntas.
  function renderTimeChoices() {
    const box = $('#time-list');
    box.innerHTML = '';
    const current = String(state.config.time);
    function radio(value, extraClass) {
      const input = h('input', { type: 'radio', id: 'time-' + value, name: 'time', value: value, class: extraClass });
      input.checked = current === String(value);
      input.addEventListener('change', updateSetup);
      return input;
    }

    const perLevel = LEVELS.map(function (lv) {
      const r = autoTimeRange(lv.id);
      const text = r.min === r.max ? fmtSeconds(r.min) : Math.round(r.min / 1000) + ' a ' + fmtSeconds(r.max);
      return ('Nível ' + lv.id + ': ' + text).replace(/ /g, ' '); // não quebra no meio do item
    });
    box.appendChild(h('label', { class: 'check-card', for: 'time-auto' }, [
      radio('auto'),
      h('span', { class: 'check-body' }, [
        h('strong', { text: 'Automático (pelo nível)' }),
        h('span', { class: 'check-desc', text: 'Quanto mais a pergunta pede, mais tempo.' }),
        h('span', { class: 'check-desc', text: perLevel.join(' · ') })
      ])
    ]));

    box.appendChild(h('p', { class: 'time-or', text: 'Ou o mesmo tempo para todas as perguntas:' }));
    const grid = h('div', { class: 'time-grid' });
    CONFIG.timeChoices.forEach(function (sec) {
      grid.appendChild(h('label', { class: 'time-option', for: 'time-' + sec }, [
        radio(sec, 'visually-hidden'),
        h('span', { text: fmtSeconds(sec * 1000) })
      ]));
    });
    box.appendChild(grid);
  }

  function selectedTime() {
    const el = $('#time-list input:checked');
    return normalizeTimeChoice(el ? el.value : 'auto');
  }

  function selectedLevels() {
    return $$('#levels-list input:checked').map(function (el) { return Number(el.value); });
  }

  function updateSetup() {
    const none = selectedLevels().length === 0;
    $('#levels-error').hidden = !none;
    $('#btn-start').disabled = none;
    $$('#screen-setup .check-card').forEach(function (card) {
      card.classList.toggle('is-checked', card.querySelector('input').checked);
    });
    $$('#time-list .time-option').forEach(function (opt) {
      opt.classList.toggle('is-selected', opt.querySelector('input').checked);
    });
  }

  function onStart() {
    const levels = selectedLevels();
    if (!levels.length) return;
    state.config = { levels: levels, showFormulas: $('#opt-formulas').checked, time: selectedTime() };
    saveConfig();
    if (state.setupMode === 'edit' && state.settingsReturn === 'result') showScreen('result');
    else openTurn(false);
  }

  function openSettings() {
    state.settingsReturn = state.screen === 'result' ? 'result' : 'turn';
    openSetup('edit');
  }

  /* ---------- 2. Tela do turno ---------- */

  function openTurn(reset) {
    if (reset) state.blockId = null;
    renderTurn();
    showScreen('turn');
  }

  function renderTurn() {
    const list = $('#blocks');
    list.innerHTML = '';
    CONFIG.blocks.forEach(function (b) {
      const input = h('input', { type: 'radio', name: 'block', value: b.id, class: 'visually-hidden' });
      input.checked = state.blockId === b.id;
      input.addEventListener('change', function () { state.blockId = b.id; syncBlocks(); });
      const art = h('span', { class: 'block-art', 'aria-hidden': 'true' });
      art.style.setProperty('--cols', b.cols);
      art.style.setProperty('--rows', b.rows);
      for (let k = 0; k < b.cols * b.rows; k++) art.appendChild(h('i'));
      list.appendChild(h('label', { class: 'block-card', 'data-block': b.id }, [
        input,
        art,
        h('span', { class: 'block-info' }, [
          h('strong', { text: 'Bloco ' + b.id }),
          h('span', { class: 'block-price', text: fmtMoney(b.price) })
        ])
      ]));
    });
    $('#levels-summary').textContent = state.config.levels.map(function (id) { return 'Nível ' + id; }).join(', ');
    $('#time-summary').textContent = timeSummary(state.config.time);
    syncBlocks();
  }

  function syncBlocks() {
    $$('.block-card').forEach(function (card) {
      card.classList.toggle('is-selected', card.getAttribute('data-block') === state.blockId);
    });
    $('#btn-spin').disabled = !state.blockId;
  }

  /* ---------- 3. Roleta ---------- */

  function onSpin() {
    if (!state.blockId || state.screen !== 'turn') return;
    const q = generateQuestion({ levels: state.config.levels, blockId: state.blockId, lastKey: state.lastKey });
    state.question = q;
    state.limitMs = answerTimeMs(q, state.config.time);
    state.lastKey = q.key;
    showScreen('spin');
    runSpin(q);
  }

  function runSpin(q) {
    setBadge('#spin-badge', q);
    $('#spin-title').textContent = 'Girando a roleta…';
    $('#drawn').hidden = true;
    $('#btn-show-question').hidden = true;
    $('#btn-show-question').textContent = 'Ver a pergunta (' + fmtSeconds(state.limitMs) + ')';

    const box = $('#wheels');
    box.innerHTML = '';
    state.wheels = [];
    q.wheelGroups.forEach(function (group) {
      const row = h('div', { class: 'wheel-row' });
      group.wheels.forEach(function (spec) {
        const w = createWheel(spec);
        row.appendChild(w.el);
        state.wheels.push(w);
      });
      box.appendChild(h('section', { class: 'wheel-group' }, [h('h2', { text: group.title }), row]));
    });

    const reduced = reducedMotion();
    const base = reduced ? CONFIG.reducedSpinMs : CONFIG.spinMs;
    const stagger = reduced ? 80 : CONFIG.spinStaggerMs;
    const token = {};
    state.spinToken = token;

    Promise.all(state.wheels.map(function (w, k) { return w.spin(base + k * stagger); })).then(function () {
      if (state.spinToken !== token) return;
      $('#spin-title').textContent = 'Pronto! Veja os valores';
      renderChips($('#drawn-list'), q.givens);
      $('#drawn').hidden = false;
      const btn = $('#btn-show-question');
      btn.hidden = false;
      btn.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'end' });
      announce('Valores sorteados: ' + q.givens.map(function (g) { return g.label + ' ' + g.text; }).join('; '));
    });
  }

  function createWheel(spec) {
    const canvas = h('canvas', { role: 'img', 'aria-label': 'Roleta ' + spec.label + ': girando' });
    const result = h('span', { class: 'wheel-result', text: '…' });
    const fig = h('figure', { class: 'wheel' + (spec.secret ? ' is-secret' : '') }, [
      canvas,
      h('figcaption', null, [h('span', { class: 'wheel-label', text: spec.label }), result])
    ]);
    const ctx = canvas.getContext('2d');
    const n = spec.values.length;
    const seg = TAU / n;
    let angle = randInt(360) * Math.PI / 180;
    let landed = -1;
    let size = 0;
    let rimColor = '#16201a';

    function valueText(v) {
      if (spec.secret) return '?';
      return spec.kind === 'rate' ? v + '%' : String(v);
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      const px = Math.round((fig.clientWidth || 150) * dpr);
      if (px !== size) { size = px; canvas.width = px; canvas.height = px; }
      rimColor = getComputedStyle(document.documentElement).getPropertyValue('--text').trim() || rimColor;
    }

    function draw() {
      if (!size) resize();
      const s = size;
      const cx = s / 2;
      const cy = s * 0.53;
      const r = s * 0.43;
      ctx.clearRect(0, 0, s, s);
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      for (let k = 0; k < n; k++) {
        const a0 = angle + k * seg;
        const col = spec.secret ? SECRET_COLORS[k % SECRET_COLORS.length] : WHEEL_COLORS[k % WHEEL_COLORS.length];
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, a0, a0 + seg);
        ctx.closePath();
        ctx.fillStyle = col.bg;
        ctx.fill();
        ctx.lineWidth = Math.max(1, s * 0.012);
        ctx.strokeStyle = '#ffffff';
        ctx.stroke();

        const mid = a0 + seg / 2;
        const label = valueText(spec.values[k]);
        ctx.fillStyle = col.fg;
        ctx.font = '800 ' + Math.round(r * (label.length > 2 ? 0.27 : 0.36)) + 'px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
        ctx.fillText(label, cx + Math.cos(mid) * r * 0.62, cy + Math.sin(mid) * r * 0.62);
      }

      // Depois de parar, escurece os setores que não saíram.
      if (landed >= 0 && !spec.secret) {
        for (let k = 0; k < n; k++) {
          if (k === landed) continue;
          const a0 = angle + k * seg;
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, r, a0, a0 + seg);
          ctx.closePath();
          ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
          ctx.fill();
        }
      }

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, TAU);
      ctx.lineWidth = s * 0.02;
      ctx.strokeStyle = rimColor;
      ctx.stroke();

      // Miolo com a letra da variável.
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.22, 0, TAU);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      ctx.lineWidth = s * 0.015;
      ctx.strokeStyle = '#16201a';
      ctx.stroke();
      ctx.fillStyle = '#16201a';
      ctx.font = 'italic 800 ' + Math.round(r * 0.26) + 'px Georgia, "Times New Roman", serif';
      ctx.fillText(spec.symbol, cx, cy + s * 0.005);

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

    function spin(duration) {
      resize();
      const k = spec.values.indexOf(spec.value);
      // Para com o ponteiro dentro do setor sorteado, não sempre no meio dele.
      const offset = (randInt(1000) / 1000 - 0.5) * seg * 0.6;
      const target = -Math.PI / 2 - (k + 0.5) * seg + offset;
      let delta = (target - angle) % TAU;
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
          draw();
          const shown = spec.secret ? '?' : spec.kind === 'rate' ? fmtRate(spec.value) : fmtMonths(spec.value);
          result.textContent = spec.secret ? 'secreta' : shown;
          canvas.setAttribute('aria-label', 'Roleta ' + spec.label + ': ' + (spec.secret ? 'valor secreto' : 'saiu ' + shown));
          resolve();
        }
        function frame(now) {
          if (done) return;
          const p = Math.min(1, Math.max(0, (now - t0) / duration));
          angle = start + delta * (1 - Math.pow(1 - p, 3));
          draw();
          if (p < 1) requestAnimationFrame(frame);
          else finish();
        }
        requestAnimationFrame(frame);
        // Garante o fim mesmo se a animação for pausada (aba em segundo plano).
        setTimeout(finish, duration + 500);
      });
    }

    return { el: fig, spin: spin, redraw: function () { resize(); draw(); } };
  }

  /* ---------- 4. Pergunta ---------- */

  function openQuestion() {
    const q = state.question;
    if (!q || state.screen !== 'spin') return;
    state.finished = false;
    setBadge('#q-badge', q);
    $('#q-story').textContent = q.story;
    renderChips($('#q-givens'), q.givens);

    const formulas = $('#q-formulas');
    formulas.hidden = !state.config.showFormulas;
    const flist = $('#q-formulas-list');
    flist.innerHTML = '';
    q.formulas.forEach(function (f) { flist.appendChild(h('li', { text: f })); });

    const box = $('#q-fields');
    box.innerHTML = '';
    q.fields.forEach(function (f) {
      box.appendChild(f.kind === 'choice' || f.kind === 'justification' ? renderChoiceField(f) : renderNumberField(f));
    });
    $('#q-error').hidden = true;
    showScreen('question');
    startTimer(state.limitMs);
    announce('Você tem ' + Math.round(state.limitMs / 1000) + ' segundos para responder.');
  }

  function renderNumberField(f) {
    const id = 'f-' + f.id;
    const aff = AFFIX[f.kind];
    const input = h('input', {
      id: id, type: 'text', inputmode: 'decimal', autocomplete: 'off', autocorrect: 'off',
      autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'next'
    });
    const wrap = h('div', { class: 'field', 'data-field': f.id }, [
      h('label', { for: id }, [f.label, h('span', { class: 'visually-hidden', text: ', ' + aff.unit })]),
      h('div', { class: 'input-wrap' }, [
        aff.prefix ? h('span', { class: 'affix', 'aria-hidden': 'true', text: aff.prefix }) : null,
        input,
        aff.suffix ? h('span', { class: 'affix', 'aria-hidden': 'true', text: aff.suffix }) : null
      ])
    ]);
    input.addEventListener('input', function () { wrap.classList.remove('is-invalid'); });
    input.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      const inputs = $$('#q-fields input[type="text"]');
      const next = inputs[inputs.indexOf(input) + 1];
      if (next) next.focus(); else input.blur();
    });
    return wrap;
  }

  function renderChoiceField(f) {
    const options = h('div', { class: 'options' + (f.kind === 'choice' ? ' options-2' : '') });
    const fs = h('fieldset', { class: 'field', 'data-field': f.id }, [h('legend', { text: f.prompt || f.label }), options]);
    f.options.forEach(function (o) {
      const input = h('input', { type: 'radio', name: 'f-' + f.id, value: o.value });
      input.addEventListener('change', function () {
        fs.classList.remove('is-invalid');
        $$('.option', options).forEach(function (el) {
          el.classList.toggle('is-selected', el.querySelector('input').checked);
        });
      });
      options.appendChild(h('label', { class: 'option' }, [input, h('span', { text: o.text })]));
    });
    return fs;
  }

  function collectAnswers(q) {
    const answers = {};
    q.fields.forEach(function (f) {
      if (f.kind === 'choice' || f.kind === 'justification') {
        const checked = document.querySelector('input[name="f-' + f.id + '"]:checked');
        answers[f.id] = checked ? checked.value : '';
      } else {
        const input = document.getElementById('f-' + f.id);
        answers[f.id] = input ? input.value : '';
      }
    });
    return answers;
  }

  function onConfirm() {
    if (state.finished) return;
    const q = state.question;
    const answers = collectAnswers(q);
    const missing = q.fields.filter(function (f) {
      const v = answers[f.id];
      return f.kind === 'choice' || f.kind === 'justification' ? !v : parseNumber(v) === null;
    });
    if (missing.length) {
      missing.forEach(function (f) { $('#q-fields [data-field="' + f.id + '"]').classList.add('is-invalid'); });
      const err = $('#q-error');
      err.textContent = 'Preencha todos os campos (só números nos valores) antes de confirmar.';
      err.hidden = false;
      const first = $('#q-fields [data-field="' + missing[0].id + '"]');
      const target = first.querySelector('input');
      first.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'center' });
      if (target && target.type === 'text') target.focus({ preventScroll: true });
      return;
    }
    finish(false, answers);
  }

  function finish(timedOut, answers) {
    if (state.finished) return;
    state.finished = true;
    stopTimer();
    const q = state.question;
    renderResult(q, gradeAnswers(q, answers || collectAnswers(q), timedOut));
    showScreen('result');
  }

  /* ---------- Cronômetro (mede com Date.now, não conta ticks) ---------- */

  function startTimer(limitMs) {
    stopTimer();
    $('#timer').classList.remove('is-warning');
    state.timer = { start: Date.now(), limit: limitMs, warned: false, id: setInterval(tick, 100) };
    tick();
  }

  function stopTimer() {
    if (state.timer) clearInterval(state.timer.id);
    state.timer = null;
  }

  function tick() {
    const timer = state.timer;
    if (!timer) return;
    const remaining = Math.max(0, timer.limit - (Date.now() - timer.start));
    $('#timer-fill').style.transform = 'scaleX(' + (remaining / timer.limit).toFixed(4) + ')';
    $('#timer-text').textContent = Math.ceil(remaining / 1000) + ' s';
    if (remaining <= CONFIG.warningMs) {
      $('#timer').classList.add('is-warning');
      if (!timer.warned) {
        timer.warned = true;
        announce('Faltam ' + Math.ceil(remaining / 1000) + ' segundos');
      }
    }
    if (remaining <= 0) {
      vibrate();
      finish(true);
    }
  }

  // Vibra ao zerar, se o aparelho deixar (o navegador exige que a pessoa já tenha tocado na página).
  function vibrate() {
    try {
      const touched = !navigator.userActivation || navigator.userActivation.hasBeenActive;
      if (navigator.vibrate && touched) navigator.vibrate([250, 120, 250]);
    } catch (e) { /* sem vibração */ }
  }

  /* ---------- 5. Resultado ---------- */

  function renderResult(q, result) {
    $('#result-banner').className = 'banner ' + (result.correct ? 'is-ok' : 'is-fail');
    $('#result-icon').textContent = result.correct ? '✓' : '✗';
    $('#result-kicker').textContent = result.timedOut ? 'O tempo acabou!' : result.correct ? 'Tudo certo' : 'Tem resposta errada';
    $('#result-title').textContent = result.correct ? 'Acertou! Pode comprar o bloco' : 'Não deu dessa vez. Você não compra agora';
    $('#result-sub').textContent = result.correct
      ? 'Compre o bloco ' + q.block.id + ' (' + fmtMoney(q.block.price) + ') e encaixe na área do mesmo tamanho.'
      : 'Sem multa e sem perder a vez: é só não comprar nesta rodada.';
    setBadge('#result-badge', q);

    const wrong = result.fields.filter(function (r) { return !r.ok; });
    const summary = $('#result-summary');
    summary.hidden = wrong.length === 0;
    const names = wrong.map(function (r) { return r.label; });
    const joined = names.length > 1 ? names.slice(0, -1).join(', ') + ' e ' + names[names.length - 1] : names[0];
    summary.textContent = wrong.length > 1 && wrong.length === result.fields.length
      ? 'Nenhum campo ficou certo.'
      : (wrong.length > 1 ? 'Campos com erro: ' : 'Campo com erro: ') + joined + '.';

    const list = $('#result-fields');
    list.innerHTML = '';
    result.fields.forEach(function (r) {
      list.appendChild(h('li', { class: 'answer ' + (r.ok ? 'is-ok' : 'is-bad') }, [
        h('span', { class: 'answer-mark', 'aria-hidden': 'true', text: r.ok ? '✓' : '✗' }),
        h('div', { class: 'answer-body' }, [
          h('strong', { text: r.label }),
          h('span', { class: 'answer-tag', text: r.ok ? 'certo' : 'errado' }),
          h('span', { class: 'answer-line', text: 'Sua resposta: ' + (r.given || 'em branco') }),
          r.ok ? null : h('span', { class: 'answer-line answer-expected', text: 'Resposta certa: ' + r.expected })
        ])
      ]));
    });

    const steps = $('#result-steps');
    steps.innerHTML = '';
    q.steps.forEach(function (s) {
      steps.appendChild(h('li', null, [
        s.text ? h('span', { class: 'step-text', text: s.text }) : null,
        s.math ? h('span', { class: 'math', text: s.math }) : null
      ]));
    });
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
    loadConfig();
    $('#btn-start').addEventListener('click', onStart);
    $('#opt-formulas').addEventListener('change', updateSetup);
    $('#btn-settings').addEventListener('click', openSettings);
    $('#btn-change-levels').addEventListener('click', openSettings);
    $('#btn-spin').addEventListener('click', onSpin);
    $('#btn-show-question').addEventListener('click', openQuestion);
    $('#btn-confirm').addEventListener('click', onConfirm);
    $('#btn-next').addEventListener('click', function () { openTurn(true); });
    document.addEventListener('visibilitychange', tick);
    window.addEventListener('resize', function () {
      state.wheels.forEach(function (w) { w.redraw(); });
    });
    openSetup('start');
    registerServiceWorker();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
