# Tabuleiro Devastado – Sorteador de Contas

Site para usar junto com o jogo de tabuleiro **Tabuleiro Devastado** (7º ano). Os alunos abrem no celular pelo QR Code; o site:

1. sorteia uma conta de **juros simples** (J = C × i × t, M = C + J, i = J ÷ (C × t), t = J ÷ (C × i));
2. gira uma roleta para a taxa e o tempo;
3. marca o **tempo para responder**, que depende do nível e do que a pergunta pede (ou um tempo fixo escolhido);
4. confere a resposta e mostra a resolução passo a passo.

## Tempo para responder

Na tela inicial (e na engrenagem ⚙) há o grupo **Tempo para responder**:

- **Automático (pelo nível)** — o padrão. Cada coisa que a pergunta pede soma tempo:

  | Pergunta | O que pede | Tempo |
  | --- | --- | --- |
  | Nível 1 – Juros | J | 30 s |
  | Nível 2 – Montante | J e M | 45 s |
  | Nível 3 – Compensa parcelar? | 2 valores, decisão e justificativa | 60 s |
  | Nível 4 – Descobrir a taxa ou o tempo | i ou t (conta "ao contrário") | 45 s |
  | Nível 4 – Comparar duas lojas | 4 valores, decisão e justificativa | 90 s |

- **Tempo fixo** — 20, 30, 45, 60, 90 ou 120 segundos, igual para todas as perguntas.

A escolha fica salva no celular e aparece na tela do turno ("Tempo: …"). O botão "Ver a pergunta" já mostra quantos segundos o jogador terá.

Acertou tudo? O jogador pode comprar o bloco verde. Errou ou o tempo acabou? Só não compra nessa vez (sem multa e sem perder a vez). O site **não** controla dinheiro, placar nem tabuleiro.

Os níveis (1 a 4) e o tempo são escolhidos na tela inicial e podem ser trocados a qualquer momento pela engrenagem ⚙. Depois de aberto uma vez, o site funciona sem internet.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub (ex.: `tabuleiro-devastado`) e envie estes arquivos:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/tabuleiro-devastado.git
   git push -u origin main
   ```
2. No repositório, abra **Settings > Pages**.
3. Em *Build and deployment*, escolha **Deploy from a branch**, depois a branch **main** e a pasta **/(root)**. Clique em **Save**.
4. Em um ou dois minutos o site estará em `https://SEU-USUARIO.github.io/tabuleiro-devastado/`.

Todos os caminhos são relativos, então funciona em qualquer nome de repositório.

## QR Code

Use **qualquer gerador de QR Code gratuito** e aponte para a URL publicada (a do passo 4). Imprima e cole no tabuleiro ou na caixa do jogo.

## Onde mudar os valores

Tudo fica no começo do `app.js`, no objeto `CONFIG`:

| O quê | Onde |
| --- | --- |
| Preços dos blocos (capital C) | `CONFIG.blocks` → `price` |
| Taxas i e j (% ao mês) | `CONFIG.rates` |
| Tempos t (meses) | `CONFIG.times` |
| Tempo automático: leitura do enunciado | `CONFIG.autoTime.readMs` (15000 = 15 s) |
| Tempo automático: quanto soma cada coisa pedida | `CONFIG.autoTime.perField` (`money` = valor em reais, `percent` = descobrir a taxa, `months` = descobrir o tempo, `choice` = decisão, `justification` = justificativa) |
| Tempos fixos que dá para escolher | `CONFIG.timeChoices` (em segundos) |
| Aviso dos últimos segundos | `CONFIG.warningMs` |
| Tolerância da resposta | `CONFIG.tolerance` (0,01) |
| Duração da roleta | `CONFIG.spinMs`, `CONFIG.spinStaggerMs`, `CONFIG.reducedSpinMs` |

- Nomes e descrições dos níveis: `LEVELS`.
- Frases de justificativa do nível 3: `JUSTIFICATIONS_3`; do nível 4 (lojas): dentro de `buildCompareStores`.

Depois de mudar algo:

1. Rode `node test.js` para conferir que as contas continuam com no máximo 2 casas decimais.
2. Troque a versão em `sw.js` (ex.: `tabuleiro-devastado-v2` → `v3`) para os celulares buscarem a versão nova. A atualização aparece a partir da segunda vez que o site for aberto.

## Testar no computador

O site precisa ser aberto por um servidor (não com duplo clique no arquivo). Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`. Sem Python, com Node instalado:

```bash
npx http-server -p 8000
```

Para rodar os testes automáticos (Node, sem dependências):

```bash
node test.js
```

## Arquivos

- `index.html`: as cinco telas (início, turno, roleta, pergunta, resultado).
- `style.css`: visual mobile-first, modo escuro e "reduzir movimento".
- `app.js`: sorteio das perguntas, correção, tempo para responder (`answerTimeMs`), roleta e cronômetro.
- `sw.js` e `manifest.webmanifest`: uso offline e instalação na tela inicial.
- `icon.svg`, `icon-192.png`, `icon-512.png`: ícones.
- `test.js`: testes do gerador de perguntas.
