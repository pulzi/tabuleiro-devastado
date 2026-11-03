# Tabuleiro Devastado – Sorteador de Contas

Site para usar junto com o jogo de tabuleiro **Tabuleiro Devastado** (7º ano). Os alunos abrem no celular pelo QR Code; o site:

1. sorteia uma conta de **juros simples** (J = C × i × t, M = C + J, i = J ÷ (C × t), t = J ÷ (C × i));
2. gira uma roleta para a taxa e o tempo;
3. dá **30 segundos** para responder;
4. confere a resposta e mostra a resolução passo a passo.

Acertou tudo? O jogador pode comprar o bloco verde. Errou ou o tempo acabou? Só não compra nessa vez (sem multa e sem perder a vez). O site **não** controla dinheiro, placar nem tabuleiro.

Os níveis (1 a 4) são escolhidos na tela inicial e podem ser trocados a qualquer momento pela engrenagem ⚙. Depois de aberto uma vez, o site funciona sem internet.

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
| Tempo para responder | `CONFIG.timeLimitMs` (30000 = 30 s) |
| Aviso dos últimos segundos | `CONFIG.warningMs` |
| Tolerância da resposta | `CONFIG.tolerance` (0,01) |
| Duração da roleta | `CONFIG.spinMs`, `CONFIG.spinStaggerMs`, `CONFIG.reducedSpinMs` |

- Nomes e descrições dos níveis: `LEVELS`.
- Frases de justificativa do nível 3: `JUSTIFICATIONS_3`; do nível 4 (lojas): dentro de `buildCompareStores`.

Depois de mudar algo:

1. Rode `node test.js` para conferir que as contas continuam com no máximo 2 casas decimais.
2. Troque a versão em `sw.js` (`tabuleiro-devastado-v1` → `v2`) para os celulares buscarem a versão nova. A atualização aparece a partir da segunda vez que o site for aberto.

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
- `app.js`: sorteio das perguntas, correção, roleta e cronômetro.
- `sw.js` e `manifest.webmanifest`: uso offline e instalação na tela inicial.
- `icon.svg`, `icon-192.png`, `icon-512.png`: ícones.
- `test.js`: testes do gerador de perguntas.
