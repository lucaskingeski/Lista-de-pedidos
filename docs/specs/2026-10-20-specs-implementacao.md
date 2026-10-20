# SPECS — Implementação dos Protótipos "Adivinha Palavra"

> Versão: 1.0 | Data: 2026-10-20 | Base: PRD v3.1 (`docs/plans/2026-10-13-adivinha-palavra.md`)
> Escopo: 3 protótipos HTML únicos (01-serena, 02-noturno, 03-eletrico) + `dicionario.js` compartilhado

---

## 1. Visão Geral da Implementação

Cada protótipo é um **arquivo HTML único** contendo HTML5 semântico, CSS inline (`<style>`) e JavaScript inline (`<script>`). Não há build, nem bundler, nem dependências externas. Todos rodam offline totalmente.

A única dependência entre arquivos é `dicionario.js`, carregado via `<script src="dicionario.js">` antes do `<script>` inline de cada protótipo. Se `dicionario.js` não estiver presente, o protótipo cai numa **lista mínima de fallback** de 14 palavras e continua jogável.

---

## 2. Estrutura de Arquivos

```
testando as IA's/prototypes/
├── dicionario.js            # Fonte única de tentativas válidas + respostas sorteáveis
├── 01-serena.html           # Calma visual, tipografia e ritmo
├── 02-noturno.html          # Contraste máximo, texturas, navegação 100% teclado
└── 03-eletrico.html         # Direção "elétrica": lâmpada, energia, confete
```

### 2.1 `dicionario.js` — Fonte Única

Exporta três globais:

| Global | Tipo | Conteúdo |
|---|---|---|
| `DICIONARIO_PALAVRAS` | `Array<string>` | Todas as ~14.575 tentativas válidas, ordenadas, normalizadas A-Z |
| `DICIONARIO_RESPOSTAS` | `Array<string>` | Subconjunto de ~1.670 palavras comuns, ordenadas, sempre contido em `DICIONARIO_PALAVRAS` |
| `DICIONARIO_PT5` | `Set<string>` | Índice de busca O(1) sobre `DICIONARIO_PALAVRAS` |

**Invariante crítica:** todo item de `DICIONARIO_RESPOSTAS` deve estar em `DICIONARIO_PALAVRAS`. Verificada em build (`tools/gerar-dicionario.js` lança erro se quebrar).

#### Regeneração
```
node tools/gerar-dicionario.js
```
Fontes baixadas para `tools/.cache/` (ignoradas pelo git via `tools/.gitignore`).

---

## 3. Detalhamento por Protótipo

### 3.1 01-serena.html — "Serena"

**Direção de arte:** calma visual, tipografia serifada, ritmo suave, paleta off-white + verde-musgo + âmbar.

**Fluxo de uso:**
1. Abre → modal "Como jogar" (explica regras, fechado após 1ª tentativa ou clique em "Feito").
2. Jogador digita via teclado virtual ou físico.
3. Envio com Enter → valida → avalia → atualiza células e teclado.
4. Vitória/derrota → modal de resultado com palavra revelada, tempo, compartilhamento.
5. Botão "Reiniciar" → confirmação (duplo toque) → novo alvo sorteado.

**Estados da célula:** empty → filled → correct/present/absent.
**Poderes:** Revelar (próxima posição não descoberta), Eliminar (até 2 letras ausentes do teclado).

**Ficheiros de estado:** `state` (current, locked, history, row, status, powers, startedAt, finishedAt).

### 3.2 02-noturno.html — "Noturno Acessível"

**Direção de arte:** contraste máximo, textura + padrão + glifo (nunca só cor), navegação 100% teclado, leitura de tela sem depender de cor.

**Especificações de acessibilidade:**
- Foco sempre visível (`:focus-visible` com outline + halo), ordem DOM = ordem visual.
- `aria-live="polite"` para turnos, `aria-live="assertive"` para erros.
- Cada estado de célula/tecla tem cor + textura + glifo.
- Botões de poder com `aria-label` único e descritivo único.
- Preferências salvas em `localStorage` (chave `ap02:a11y`).
- Teclado físico 100% funcional sem mouse: letras, Enter, Backspace, Escape.

**Ficheiros de estado:** `game` (guesses, feedback, current, revealed, keyState, powers, over), `a11y` (theme, hc, tex).

### 3.3 03-eletrico.html — "Elétrico"

**Direção de arte:** lâmpada CSS (halo, raios com opacidade = carga), barra de energia, cascata de flip 80ms/letra, confete na vitória, cronômetro, alto contraste alternável.

**Métrica unificada:** `--charge` alimenta tanto a lâmpada quanto a barra de energia (mesma variável CSS).

**Estados:** `S` (row, buf, locked, rows, kb, powers, over, won, t0, elapsed, kbTimer, cellTimer).

**Comportamento de animação:** confete não gerado sob `prefers-reduced-motion`; animações Web Animations API (`Element.animate`) devem ser condicionadas por `!REDUCED`.

---

## 4. Detalhamento Técnico por Camada

### 4.1 Camada de Dados (dicionario.js)

- **Normalização:** `normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase()` — remove acentos, resultado A-Z apenas.
- **Validação de tentativa:** `.has(palavra)` O(1) via `Set`.
- **Sorteio de alvo:** `Math.floor(Math.random() * RESPOSTAS.length)` com loop `do...while` para evitar repetição consecutiva (`ultimoAlvo`).
- **FallBack:** se `DICIONARIO_PT5` não existir ou `size < 1000`, usa `FALLBACK` (14 palavras herdadas do template original).

### 4.2 Camada de Lógica (evaluate)

Algoritmo de 2 passos idêntico em todos os 3 protótipos:

```javascript
function evaluate(guess, target) {
  // Passo 1: posições corretas
  // Passo 2: presentes com contador remanescente
  // Retorna array de 'correct'|'present'|'absent'
}
```

### 4.3 Camada de UI

Cada protótipo gerencia:
- `buildBoard()` / `buildGrid()` — cria células 6×5.
- `buildKeyboard()` / `buildKeys()` — cria teclado QWERTY.
- `renderBoard()` / `paintAll()` — atualiza estados das células.
- `renderKeys()` / `paintKeyboard()` — atualiza estados das teclas (monotônico).
- `submit()` / `submitGuess()` — valida, avalia, atualiza estado, verifica vitória/derrota.

---

## 5. Regras de Implementação Obrigatórias

1. **Sem `innerHTML` para injeção de conteúdo do usuário** — evita XSS; usa `textContent`.
2. **Estado da célula nunca só por cor** — sempre cor + textura + glifo (PRD §7).
3. **Teclado monotônico** — estado da tecla nunca regride (PRD §4.2).
4. **Tentativa inválida não avança** — shake + toast, contador inalterado (PRD §3.1).
5. **Sorteio de alvo no reinício** — nunca fixo em `TERMO`; não repete consecutivo (PRD §5.1).
6. **Fallback funcionando** — protótipo roda sem `dicionario.js` com lista de 14 palavras.
7. **Preferências em localStorage** com try/catch (modo privado / storage bloqueado).
8. **Nenhum `console.log` de debug** em produção.
9. **IDs estáveis** para automação de teste E2E (ex: `#board`, `#kb`, `#btnRestart`).

---

## 6. APIs e Contratos

### `window.DICIONARIO_PT5`
- `has(palavra: string): boolean` — valida tentativa.
- Tamanho esperado: > 1000 entradas.

### `window.DICIONARIO_RESPOSTAS`
- Array ordenado de strings — fonte para `sortearAlvo()`.
- Invariante: todo item está em `DICIONARIO_PT5`.

---

## 7. Critérios de Aceitação Técnica

1. `dicionario.js` carrega nos 3 protótipos; `DICIONARIO_PT5.size > 1000`.
2. Palavra válida (ex: `CASAS`) aceita; palavra inexistente (ex: `ZZZQQ`) rejeitada sem consumir tentativa.
3. Palavra-alvo muda a cada reinício; não repete a anterior.
4. Zero erros/warnings de console durante carregamento e jogo.
5. Protótipos funcionam sem `dicionario.js` (fallback).
6. Fluxo 100% teclado: digitar → Enter → Revelar → Eliminar → Reiniciar.
7. Cada estado de célula/tecla distinguível sem cor (glifo/textura).
8. Contraste da letra da célula ≥ 4,5:1 (padrão) e ≥ 7:1 (alto contraste).
9. Confete não gerado sob `prefers-reduced-motion`.

---

## 8. Dívida Técnica / Backlog (para agentes de QA)

Itens identificados na auditoria de produto (2026-10-20) que **não foram corrigidos** nesta iteração:

**01-serena.html (UX):**
- [ ] Pilha vertical estoura viewport móvel com regras abertas (dimensionar grade pelo espaço restante).
- [ ] Estados `correct`/`present` só por cor em algumas configurações (adicionar glifos/texturas).
- [ ] Resumo compartilhado ignora modo daltonismo/alto contraste (derivar símbolos das settings).
- [ ] Nenhum texto explica os poderes (hint de 1 linha + rótulo "usado").
- [ ] Linha ativa sem destaque/cursor (borda mais forte + cursor na próxima célula vazia).
- [ ] Subtítulo "Uma por dia" contradiz alvo sorteado (alterar copy).
- [ ] Teclado sem recuo QWERTY físico; teclas < 44px (recuar linhas 2/3, redistribuir 3ª linha).

**02-noturno.html (Acessibilidade):**
- [ ] Nome acessível dos botões de poder duplicado/errado (remover `aria-hidden` de `.pw__k`).
- [ ] Glifo `~` branco sobre laranja = 2,05:1 (fixar cor do glifo ou adicionar textura).
- [ ] `describeRow()` sobrescreve anúncio de vitória/derrota (cancelar timeout em `say()`).
- [ ] Redimensionar janela destrói foco (`layoutKeys()` faz `innerHTML=""`) — salvar/restaurar `activeElement`.
- [ ] Comentário de cabeçalho afirma AAA incorretamente (corrigir comentário).
- [ ] Células vazias expostas ao leitor de tela (`aria-hidden` ou `role="grid"`).

**03-eletrico.html (Design Visual):**
- [ ] Derrota deixa lâmpada acesa (zerar `--charge` em `finish(false)`).
- [ ] Teclado contradiz grade em letras repetidas (`res[word.indexOf(ch)]` usa só 1ª ocorrência — agregar por letra com `RANKS`).
- [ ] `Element.animate()` não gatado por `prefers-reduced-motion` (condicionar por `!REDUCED`).
- [ ] 122 `rgba()` + 36 hex fora do `:root`; tokens não utilizados (derivar tokens com alfa, remover mortos).
- [ ] Miolo do jogo usa tríade verde/âmbar/cinza do Wordle (deslocar matizes ou justificar no PRD).
- [ ] Três vocabulários de símbolos (células, compartilhamento, HC) — unificar.
- [ ] Tipografia micro (< 12px) para público escolar (mínimo 12px, tokens `--fs-*`).
- [ ] Cronômetro conta tempo ocioso antes da 1ª palavra (iniciar no 1º palpite).

---

## 9. Cronograma Sugerido (próximas iterações)

| Semana | Foco | Entrega |
|---|---|---|
| 1 | Correções críticas/altas (auditoria) | 3 protótipos sem bugs críticos |
| 2 | Backlog de QA médio/baixo | Conformidade total com PRD §8.1 e §7.1 |
| 3 | Testes E2E (Playwright) + agente de revisão de código | Relatório de conformidade |
| 4 | Deploy/hospedagem estática | Protótipos acessíveis via URL |

---

*Fim do documento.*
