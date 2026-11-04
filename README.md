# Tabuleiro Devastado

Site para usar junto com o jogo de tabuleiro **Tabuleiro Devastado** (tema: Cidade fraterna). Um celular só controla a partida inteira, passando de mão em mão:

- **dinheiro** de cada jogador (todo mundo começa com R$ 100,00);
- **loja** de blocos verdes na primeira vez de cada jogador (até 2 blocos);
- **perguntas** com alternativas e ampulheta (30 s; contas de juros: 1 minuto);
- **sorteio** do bloco para quem acerta, com a compra e a casa onde ele foi colocado;
- **placar** ao vivo e **contagem dos pontos** no fim.

## Como funciona a partida

1. **Novo jogo:** coloque os nomes (de 1 a 8 jogadores). Cada um começa com R$ 100,00.
2. **Placar:** mostra de quem é a vez, o dinheiro, os blocos e os pontos de todos. Toque em **Começar a vez**.
3. **Dificuldade:** o jogador escolhe quanto quer arriscar.

   | Dificuldade | Alternativas | Ganha se acertar |
   | --- | --- | --- |
   | Fácil | 3 | R$ 20,00 |
   | Médio | 4 | R$ 50,00 |
   | Difícil | 5 | R$ 70,00 |

4. **Loja (só na primeira vez de cada jogador, ou seja, na 1ª rodada):** dá para comprar **até 2 blocos**, se o dinheiro der. Para cada bloco, o jogador coloca no tabuleiro e toca na cor da casa.
5. **Pergunta:** 30 segundos. Em cerca de **10%** das vezes cai uma **conta de juros simples**, com **4 alternativas** e **1 minuto**.
   - **Errou ou o tempo acabou:** a vez acaba. **Não há multa.**
   - **Acertou:** ganha o prêmio da dificuldade e gira a **roleta**, que sorteia um dos três blocos. Se tiver dinheiro, compra e coloca no tabuleiro; se não tiver (ou não quiser), a vez acaba.
6. **Finalizar jogo:** o botão do placar conta os pontos de todos e mostra a classificação.

### Blocos e pontos

| Bloco | Preço | Bolinhas | Casa azul | Casa vermelha |
| --- | --- | --- | --- | --- |
| 2×2 | R$ 20 | 4 | 4 pontos | 8 pontos |
| 3×2 | R$ 50 | 6 | 6 pontos | 12 pontos |
| 4×2 | R$ 70 | 8 | 8 pontos | 16 pontos |

- **Casas azuis:** moradias de baixa renda (falta energia, saneamento, higiene…).
- **Casas vermelhas:** comunidades de favela. **Os pontos dobram.**

Errou algum toque? No placar, cada jogador tem um **Corrigir** para ajustar o dinheiro, trocar a cor da casa de um bloco ou remover um bloco.

O jogo fica salvo no celular: se a página recarregar, nada se perde (e o tempo da pergunta continua correndo). Depois de aberto uma vez, o site funciona sem internet.

## Perguntas

Ficam no arquivo **`perguntas.js`**: 75 perguntas, 5 por tema e por dificuldade. Os temas são Cidade fraterna, Moradias populares, Casas de qualidade, Desigualdade social e Solidariedade. Cada pergunta tem uma explicação, mostrada depois da resposta.

Para acrescentar uma pergunta, copie um bloco e troque o texto:

```js
{
  id: 'so-m6', tema: 'solidariedade', nivel: 'medio',
  pergunta: 'Texto da pergunta?',
  certa: 'A alternativa certa.',
  erradas: ['Errada 1.', 'Errada 2.', 'Errada 3.'],
  explicacao: 'Por que a certa está certa.'
},
```

- `id` não pode repetir.
- `tema`: `fraterna`, `moradia`, `qualidade`, `desigualdade` ou `solidariedade`.
- `nivel`: `facil`, `medio` ou `dificil`.
- `erradas`: pelo menos 2 (fácil), 3 (médio) ou 4 (difícil). Se tiver mais, o site sorteia quais aparecem.

**Tamanho das alternativas** (para o tamanho não entregar a resposta):

- todas com tamanho parecido: a menor com pelo menos 85% da maior, ou no máximo 5 letras de diferença;
- a certa **nunca** pode ser a mais comprida: escreva pelo menos uma errada maior que ela (o site garante que essa errada maior sempre aparece na tela);
- a certa também não pode ser a mais curta: pelo menos uma errada do mesmo tamanho ou menor.

O `node test.js` confere essas regras e diz qual pergunta precisa de ajuste (por exemplo: "Pergunta so-m6: a certa (58 letras) é a mais comprida; escreva uma errada maior").

As perguntas não se repetem até acabar o estoque daquela dificuldade.

As **contas de juros simples** não ficam no `perguntas.js`: o `app.js` gera as contas na hora, usando o preço dos blocos.

| Dificuldade | Conta de juros |
| --- | --- |
| Fácil | Juros de 1 mês (10% ou 20%) |
| Médio | J = C × i × t |
| Difícil | Total a pagar (M = C + J) ou descobrir a taxa |

As alternativas erradas imitam erros comuns (esquecer o tempo, confundir juros com total, errar a vírgula) e têm quase o mesmo número de caracteres da certa, que nunca é a mais comprida.

## Onde mudar os valores

Tudo fica no começo do `app.js`, no objeto `CONFIG`:

| O quê | Onde |
| --- | --- |
| Dinheiro inicial | `CONFIG.startMoney` |
| Máximo de blocos na loja | `CONFIG.shopMaxBlocks` |
| Preço e tamanho dos blocos | `CONFIG.blocks` |
| Pontos em dobro na casa vermelha | `CONFIG.houses.red.multiplier` |
| Prêmio e alternativas de cada dificuldade | `CONFIG.levels` |
| Tempo das perguntas | `CONFIG.questionMs` (30000 = 30 s) |
| Chance, tempo e alternativas das contas de juros | `CONFIG.juros` (`chance: 0.10` = 10%) |

Depois de mudar algo:

1. Rode `node test.js` para conferir as regras e as perguntas.
2. Troque a versão em `sw.js` (ex.: `tabuleiro-devastado-v4` → `v5`) para os celulares buscarem a versão nova. A atualização aparece a partir da segunda vez que o site for aberto.

## Publicar no GitHub Pages

1. No repositório, abra **Settings > Pages**.
2. Em *Build and deployment*, escolha **Deploy from a branch**, a branch **main** e a pasta **/(root)**. Clique em **Save**.
3. Em um ou dois minutos o site estará em `https://SEU-USUARIO.github.io/tabuleiro-devastado/`.

Todos os caminhos são relativos, então funciona em qualquer nome de repositório. Para o QR Code, use qualquer gerador gratuito apontando para essa URL.

## Testar no computador

O site precisa ser aberto por um servidor (não com duplo clique no arquivo). Na pasta do projeto:

```bash
python3 -m http.server 8000
```

Depois abra `http://localhost:8000`. Para rodar os testes automáticos (Node, sem dependências):

```bash
node test.js
```

## Arquivos

- `index.html`: as telas (novo jogo, placar, dificuldade, loja, pergunta, resultado e sorteio, fim de jogo).
- `style.css`: visual mobile-first, modo escuro e "reduzir movimento".
- `app.js`: regras do jogo (dinheiro, loja, prêmios, pontos), contas de juros, ampulheta e roleta.
- `perguntas.js`: banco de perguntas.
- `sw.js` e `manifest.webmanifest`: uso offline e instalação na tela inicial.
- `icon.svg`, `icon-192.png`, `icon-512.png`: ícones.
- `test.js`: testes das regras e das perguntas.
