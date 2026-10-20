# Addendo — Protótipos web "Adivinha Palavra"

> **Documento derivado.** O PRD autoritativo do produto é
> `docs/plans/2026-10-13-adivinha-palavra.md` (v3.0). Este addendo descreve
> **apenas o que os três protótipos web da pasta `testando as IA's/prototypes/`
> realmente implementam** — um recorte offline, de página única, sem backend.
> Quando este documento e o PRD principal divergirem, **vale o PRD principal**;
> as divergências estão listadas na seção 2.

| Campo | Valor |
|---|---|
| Data de criação | 2026-10-20 |
| Status | Implementado (protótipos 01, 02 e 03) |
| PRD de origem | `docs/plans/2026-10-13-adivinha-palavra.md` (v3.0) |
| Área | `testando as IA's/prototypes/` |
| Artefatos | `01-serena.html`, `02-noturno.html`, `03-eletrico.html`, `dicionario.js` |

As referências `PRD §x` nos comentários do código apontam para o **PRD
principal** (v3.0) e não para este addendo.

---

## 1. Objetivo

Prototipar três variações do mesmo jogo de adivinhação de palavras (Termo/Wordle),
cada uma com uma direção de arte e um foco de acessibilidade distintos:

| Protótipo | Nome | Foco |
|---|---|---|
| 01 | Serena | calma visual, tipografia e ritmo |
| 02 | Noturno Acessível | contraste máximo, textura, navegação 100% por teclado |
| 03 | Elétrico | direção de arte "energia", animação, cronômetro |

## 2. Escopo e divergências em relação ao PRD principal

Os protótipos implementam o **núcleo jogável** do PRD principal (§3, §4, §7, §8,
§9), em HTML único, sem build e sem servidor.

**Implementado aqui:** 6 tentativas, 5 letras, feedback de 2 passos, teclado
monotônico, poderes Revelar/Eliminar (1 uso cada), tentativa inválida que não
avança, compartilhamento sem spoiler, acessibilidade, preferências em
`localStorage`.

**Deliberadamente fora dos protótipos** (existem no PRD principal, mas exigem
servidor, app ou produto completo):

| Item | PRD principal | Situação no protótipo |
|---|---|---|
| Palavra do Dia autoritativa no servidor | §5 | substituída por sorteio local (§5 deste) |
| Leaderboard diário | §10 | ausente |
| Backend, anti-trapaça, identidade anônima | §10 | ausente |
| PWA + app mobile (React Native) | §1.3, §11 | ausente — é HTML de uma página |
| Prática com 4–7 letras, Normal/Difícil | §6 | ausente — apenas 5 letras |
| Hard Mode | §4.3 | ausente |
| Estatísticas, streak, `ap:stats` | §9 | ausente — só preferências |
| Alvo fixo `TERMO` nos protótipos | — | **substituído**: agora é sorteado (§5) |

---

## 3. Regras de jogo

- A palavra-alvo tem **5 letras**; a tentativa também.
- Há **6 tentativas** por partida.
- A partida termina ao acertar a palavra ou ao esgotar as tentativas.

### 3.1 Tentativa inválida não custa

Palavra fora do dicionário **não avança a partida e não consume tentativa**: a
grade treme e um aviso explica o motivo. O jogador pode corrigir e reenviar
sem penalidade — errar a digitação não pode custar a partida.

## 4. Feedback

### 4.1 Algoritmo de 2 passos

O feedback usa o algoritmo clássico do Wordle, em dois passos, para resolver
letras repetidas:

1. marca todas as posições corretas e consome a ocorrência do contador;
2. só depois marca "presente", usando o que sobrou no contador.

Exemplo: `MENTE` contra `TERMO` → `presente, correta, ausente, presente, ausente`
(o "E" verde consome a única ocorrência de E, então o segundo E fica ausente).

### 4.2 Teclado monotônico

O estado de cada tecla **nunca regride**: ausente → presente → correta. A
régua é o estado da letra na *palavra-alvo*, e uma letra só é "ausente" quando
já se provou que ela não está no alvo.

## 5. Dicionário e palavra-alvo

### 5.1 Dicionário

Fonte única de verdade: `dicionario.js`, carregado pelos três protótipos com
`<script src="dicionario.js"></script>`.

| Lista | Tamanho | Papel |
|---|---|---|
| `DICIONARIO_PT5` (Set) | ~14,5 mil | validar tentativas — **largo de propósito** |
| `DICIONARIO_RESPOSTAS` (Array) | ~1,7 mil | pool de palavras-alvo — **estreito** |

Regras:

- Toda palavra é normalizada: minúsculas, sem acento, apenas `A-Z`. Como o
  teclado do jogo não tem acento, `SERIE` e `SÉRIE` são a mesma entrada.
- Curadoria: dicionário oficial de correção do português, léxico
  multi-dicionários, listas de palavras de Termo em PT-BR, e **flexões geradas**
  a partir dos lemas (os dicionários guardam só o lema; `CASAS`, `OPINA` e
  `ESTÃO` são derivados).
- Exclusões: nomes próprios, termos ofensivos, e formas não portuguesas
  (letras K, W e Y; mais de três consoantes seguidas; três letras iguais).
- A lista é **deliberadamente permissiva**: o custo de recusar uma palavra que o
  jogador digitou de propósito é maior que o de aceitar termo obsoleto.
- **Invariante crítica:** toda palavra de `DICIONARIO_RESPOSTAS` está em
  `DICIONARIO_PT5`. Sem isso a partida seria impossível de vencer.
- Fallback: se `dicionario.js` não estiver ao lado do HTML, o protótipo cai
  numa lista mínima de 14 palavras e continua jogável.

### 5.2 Palavra-alvo sorteada

No PRD principal (§5) a palavra do dia é autoritativa no servidor. Como os
protótipos não têm backend, o alvo é **sorteado localmente**:

- sorteado de `DICIONARIO_RESPOSTAS` no início da partida e **a cada
  reinício** — nunca é fixo;
- sorteio uniforme, **sem repetir a palavra da partida anterior**: quem pede
  "reiniciar" espera outra palavra, não a mesma;
- a partida não é persistida; só as preferências (§8). Reiniciar nunca
  conflita com estado salvo;
- o objetivo do sorteio é uma palavra comum, sem forma flexionada e sem nome
  próprio: são palavras que o jogador reconhece e consegue deduzir.

## 6. Compartilhar sem spoiler

O texto de compartilhamento mostra o **grade de feedback** (cores ou emojis),
nunca a palavra. Formatos:

- **01 / 02:** emoji por letra, com o contador de tentativas e, no 02, o índice
  do dia (`Adivinha Palavra #<dia> 3/6`).
- **03:** texto por linha com os mesmos símbolos, mais o tempo decorrido; em
  derrota mostra `X/6 (não veio hoje)`.

## 7. Acessibilidade

- **02 (Noturno):** contraste máximo, cada estado tem cor **+** textura **+**
  glifo — a cor nunca é o único meio de comunicação. Navegação 100% por
  teclado, com foco gerenciado e avisos em `aria-live`.
- **03:** modo de alto contraste alternável, com símbolos próprios para cada
  estado; `prefers-reduced-motion` é lido em JS porque o confete não pode ser
  apenas escondido — ele não deve ser gerado.
- **Todos:** rótulos com `aria-label` em células e teclas, região `aria-live`
  para anúncios de turno, e os poderes acessíveis por Tab+Enter (atalhos de
  letra foram descartados: "R" e "E" são letras do dicionário).

## 8. Preferências persistidas

Preferências locais em `localStorage`, aplicadas sem recarregar a página, com
tolerância a storage bloqueado (modo privado) — nesse caso o jogo segue em
memória.

| Protótipo | Chave | Preferências |
|---|---|---|
| 01 | `ap:settings` | alto contraste, daltonismo, movimento reduzido |
| 02 | `ap02:a11y` | tema, alto contraste, textura, rótulos detalhados |
| 03 | `ap:proto-hc` | alto contraste |

## 9. Estrutura de arquivos

```
testando as IA's/prototypes/
├── dicionario.js      # fonte única do dicionário (gerado; ver tools/gerar-dicionario.js)
├── 01-serena.html     # CSS + JS inline
├── 02-noturno.html    # CSS + JS inline
└── 03-eletrico.html   # CSS + JS inline
```

Cada HTML é autocontido, exceto pelo `dicionario.js` compartilhado.

## 10. Separação domínio / UI

A lógica de domínio (dicionário, avaliação, estado da partida) fica isolada da
renderização. Em 01 o bloco é explicitamente rotulado como "DOMÍNIO — 100%
puro, separado da UI"; o mesmo vale para os outros dois, que mantêm o
`evaluate()` como função pura, sem tocar no DOM.

## 11. Critérios de aceite

1. `dicionario.js` carrega nos três protótipos e o tamanho de
   `DICIONARIO_PT5` é o esperado.
2. Palavra válida (inclusive flexionada, ex. `CASAS`) é aceita; palavra
   inexistente é recusada **sem** consumir tentativa (§3.1).
3. A palavra-alvo muda a cada reinício, nunca repete a anterior, e é sempre
   uma entrada de `DICIONARIO_RESPOSTAS` **e** de `DICIONARIO_PT5` (§5.2).
4. Sem erros nem avisos no console durante o carregamento e o jogo.
5. Sem `dicionario.js` ao lado, o protótipo continua jogável com o fallback.

## 12. Decisões e riscos

| Decisão | Motivo |
|---|---|
| Dicionário largo para tentativas, estreito para respostas | Recusar palavra digitada de propósito custa mais que aceitar termo raro; mas a palavra-alvo precisa ser reconhecível |
| Respostas sempre contidas nas tentativas | Uma resposta fora do dicionário de tentativas deixa a partida sem solução |
| Sem acento nas entradas | O teclado do jogo não tem acento; normalizar no dado evita duas listas |
| K, W e Y excluídas | Não fazem parte do alfabeto oficial de 26 letras do português |
| Até três consoantes seguidas aceitas | `EXTRA` (xtr), `ENTRE` (ntr) e `OMBRO` (mbr) são palavras legítimas |
| Sorteio uniforme, sem repetição consecutiva | Com ~1,7 mil itens, repetir consecutivamente frustraria |
| Termos ofensivos removidos | Os protótipos têm uso familiar/escolar |

## 13. Backlog de QA (auditoria de produto — 2026-10-20)

Itens identificados na auditoria de UX, acessibilidade e design visual que
**não foram corrigidos** nesta iteração. Prioridade: crítico > alto > médio > baixo.

### 01-serena.html (UX)

| Pri. | Item | Local | Correção sugerida |
|------|------|-------|-------------------|
| crítico | Estados `correct`/`present` só por cor em algumas configurações | CSS das células | Adicionar glifos/texturas redundantes e linha de legenda |
| alto | Resumo compartilhado ignora modo daltonismo/alto contraste | Compartilhamento | Derivar símbolos das `settings` |
| alto | Nenhum texto explica os poderes (custo/benefício) | Botões Revelar/Eliminar | Hint de 1 linha + rótulo "usado" após o uso |
| alto | Linha ativa sem destaque/cursor | Linhas do tabuleiro | Borda mais forte na linha ativa + cursor na próxima célula vazia |
| médio | Teclado sem recuo QWERTY físico; teclas < 44px | Linhas 2/3 do teclado | Recuar linhas 2/3, redistribuir 3ª linha para 40px+ |
| médio | Microcopy que promete o que não cumpre (inválida não gasta, etc.) | Toasts | Reescrever avisos ("…sua tentativa não foi gasta") |
| médio | Partida não é persistida (refresh perde tudo) | localStorage | Salvar `ap:practice:current` |

### 02-noturno.html (Acessibilidade)

| Pri. | Item | Local | Correção sugerida |
|------|------|-------|-------------------|
| crítico | Nome acessível dos botões de poder duplicado/errado | `.pw__k` | Remover `aria-hidden` ou usar `aria-label` no botão |
| crítico | Glifo `~` branco sobre laranja = 2,05:1 | `.cell[data-state="present"] .glyph` | Corrigir cor do glifo para ≥ 4,5:1 |
| alto | `describeRow()` sobrescreve anúncio de vitória/derrota | `say()` / `describeRow()` | Cancelar timeout de `describeRow` em `say()` |
| alto | Redimensionar janela destrói foco (`innerHTML=""`) | `layoutKeys()` | Salvar/restaurar `document.activeElement` |
| alto | Comentário de cabeçalho afirma AAA incorretamente | Cabeçalho CSS | Corrigir comentário (texto normal não atinge AAA) |
| médio | Switches com nome acessível duplicado (rótulo + descrição) | 5 switches `role="switch"` | Mover descrição para fora do `<label>` |
| médio | 25 células "Posição N: vazio" expostas ao leitor de tela | `role="img"` nas células | `aria-hidden="true"` em células vazias ou `role="grid"` |
| médio | Foco salta para teclado ao acionar poder | `useReveal`/`useEliminate` | Devolver foco ao botão acionado; anunciar "restam N usos" |

### 03-eletrico.html (Design Visual)

| Pri. | Item | Local | Correção sugerida |
|------|------|-------|-------------------|
| alto | Derrota deixa lâmpada acesa | `finish(false)` | Zerar `--charge` da lâmpada e da barra |
| alto | Teclado contradiz grade em letras repetidas | `setKey` com `indexOf` | Agregar por letra usando `RANKS` (melhor feedback) |
| alto | `Element.animate()` ignora `prefers-reduced-motion` | `reject()` / `useReveal()` | Condicionar por `!REDUCED` |
| médio | 122 `rgba()` + 36 hex fora do `:root` | CSS | Derivar tokens com alfa; remover tokens mortos |
| médio | Miolo do jogo usa tríade verde/âmbar/cinza do Wordle | Paleta principal | Deslocar matizes ou justificar no PRD §3.1 |
| médio | Três vocabulários de símbolos (células/compartilhamento/HC) | Compartilhamento | Unificar glifos em todas as superfícies |
| médio | Tipografia micro (< 12px) para público escolar | CSS tipográfico | Mínimo 12px; tokens `--fs-*` |
| médio | Cronômetro conta tempo ocioso antes da 1ª palavra | `t0` | Iniciar relógio no 1º palpite enviado |

