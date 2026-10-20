# PRD — "Adivinha Palavra" (Jogo Casual de Adivinhação de Palavras)

> Versão: 3.1 | Data: 2026-10-20 | Atualizado em: 2026-10-20
> Personalização aplicada: Web apenas (HTML único por protótipo), mecânica híbrida, apenas pt-BR,
> gratuito **sem monetização**, sem meta-progressão, público **familiar/escolar**, sem servidor no MVP.

---

## 1. Visão Geral

### 1.1 Objetivo
Jogo casual **gratuito, sem anúncios e sem monetização** de adivinhação de palavras, com experiência
consistente em **Web (PWA simples, arquivos HTML únicos por protótipo)**. Mecânica **híbrida**:
feedback de estado (cor + textura + glifo) como base + **poderes limitados por partida** (Revelar e
Eliminar, 1 uso cada). Sem meta-progressão: apenas estatísticas e sequências locais.

**Identidade visual própria é requisito de produto, não estética.** O produto deve se afastar
visualmente do Wordle (nome, paleta, grade, glifos e resultado final próprios) para evitar risco
legal de "look and feel".

### 1.2 Público-alvo
Famílias, estudantes e adultos casuais em contexto de jogo casual compartilhado; falantes de pt-BR;
sessões de 1–3 minutos; sem onboarding pesado.

O **conteúdo é familiar**: o dicionário de tentativas não contém termos ofensivos, mesmo que existam
no português coloquial. Vale para as duas listas de palavras e para o texto da interface.

### 1.3 Stack e arquitetura (MVP)
Arquitetura frontend-only, sem backend, sem servidor:

```
root/
  docs/plans/              # PRD e addendos
  testando as IA's/
    prototypes/
      01-serena.html       # Calma visual, tipografia e ritmo
      02-noturno.html      # Contraste máximo, texturas, navegação 100% teclado
      03-eletrico.html     # Direção "elétrica": lâmpada, energia, confete
      dicionario.js        # Fonte única: ~14.575 tentativas + 1.670 respostas (PT-BR, 5 letras)
```

- **Compartilhado:** `dicionario.js` (fonte única de tentativas válidas e respostas sorteáveis).
- **Específico por protótipo:** HTML + CSS + JS inline, cada um com direção de arte própria.
- **Nenhum backend:** palavra-alvo é sorteada localmente (§5.1). Nenhuma conta, nenhuma sincronia
  entre dispositivos, nenhum leaderboard remoto.

---

## 2. Escopo

**MVP (v1.0) incluído:** jogo de 5 letras, 6 tentativas, palavra-alvo sorteada localmente,
poderes Revelar e Eliminar (1 uso cada por partida), tentativa inválida não consome tentativa,
compartilhamento sem spoiler, temas claro/escuro, alto contraste, modo daltonismo,
preferências locais (localStorage), funcional offline.

**Fora do MVP:** login/sync de contas, backend, leaderboard diário (requer servidor),
categorias de palavras, conquistas, monetização (decidido: **não haverá**), multiplayer em tempo
real, app mobile nativo (versão web é a primeira entrega), palavra do dia autoritativa por
servidor.

---

## 3. Mecânica Principal (Híbrida)

### 3.1 Base (estilo Wordle)
- **6 tentativas** para adivinhar a palavra-alvo de **5 letras**.
- Feedback por letra: `correct` (correta posição), `present` (presente, posição errada),
  `absent` (ausente).
- Tentativa inválida (tamanho errado ou não dicionarizada) → shake + toast, **não** avança e
  **não** consome tentativa.

### 3.2 Poderes (1 uso cada por partida, sem economia)
1. **Revelar** — revela a letra correta na próxima posição ainda não descoberta da linha atual.
2. **Eliminar** — desabilita até 2 letras do teclado que não existem na palavra-alvo.
Regras: não contam como tentativa; indisponíveis no Modo Difícil; reiniciam a cada partida.

### 3.3 Vidas
Não há vidas separadas: **as 6 tentativas são as vidas**.

### 3.4 Modo Difícil (Hard Mode)
Obriga reutilização de todas as dicas reveladas (seção 4.3); poderes desabilitados.

---

## 4. Feedback e Algoritmos

### 4.1 Avaliação (letras repetidas)
Algoritmo em 2 passos (Wordle correto):
1. Marca todas as posições corretas e consome a ocorrência do contador.
2. Só depois marca "presentes", usando o que sobrou no contador.

Exemplo: `MENTE` / `TERMO` → `present`, `correct`, `absent`, `present`, `absent` (o "E" verde
consome a única ocorrência de E, então o segundo E fica ausente).

### 4.2 Teclado (monotônico)
`correct` > `present` > `absent`; nunca regride.

### 4.3 Validação Hard Mode
Toda letra `correct` deve permanecer na mesma posição; toda `present` deve aparecer na tentativa.
Caso contrário, rejeitar com mensagem específica.

---

## 5. Conteúdo e Dicionário (pt-BR)

Fonte única de verdade: `dicionario.js`.

```json
{ "version": "1.0.0", "locale": "pt-BR", "solutions": ["TERMO", ...], "accepted": ["TERMO", ..., "MENTE"] }
```

- Sem acentos, MAIÚSCULAS; `Ç`→`C`; `solutions ⊆ accepted`; tamanho 5 letras.
- **Conteúdo familiar:** nomes próprios, termos ofensivos e formas não portuguesas
  (K, W, Y) ficam fora das duas listas. Curadoria revisada a cada versão.

### 5.1 Escolha da palavra-alvo (v3.1)
A palavra-alvo é **sorteada no cliente**, sem servidor:

- sorteio **uniforme** entre as soluções (`solutions`);
- **não repete** a palavra da partida anterior — quem pede "reiniciar" espera outra palavra;
- a solução sorteada é **sempre** uma entrada de `accepted` (invariante: resposta fora do
  dicionário de tentativas tornaria a partida impossível de vencer);
- funciona **100% offline**, sem rede e sem estado de servidor;
- o pool de soluções é **estrito** (palavras comuns, sem flexão, sem nome próprio); o dicionário
  de tentativas é **largo** (~14.575 palavras), para nunca recusar uma palavra digitada de propósito.

O modo diário autoritativo no servidor saiu do MVP: exige backend e cliente não conhece o alvo
até o fim. Fica no roadmap (§18).

---

## 6. Modos

| Modo | Tentativas | Tamanho | Poderes | Leaderboard | Stats |
|---|---|---|---|---|---|
| Prática (único modo) | 6 | 5 | Sim | Não (local) | Sim + streak |

---

## 7. Interface

**Telas:** Home; Jogo (grade + teclado + 2 poderes); Resultado (modal com tempo, compartilhar);
Configurações; Ajuda.

**Mobile-first:** grade centralizada ≤350px, células quadradas, gap 5px; teclas ≥44px (≥48px no
protótipo acessível, com layout de 6 colunas abaixo de 640px); poderes como botões com ícone+label,
acessíveis por Tab+Enter — **sem atalhos de letra** (R/E colidiriam com a digitação de tentativas).

**Codificação de estado (regra transversal de todos os protótipos):** o estado de cada célula
**NUNCA** é comunicado só por cor. Sempre em trio redundante — **cor + textura (hachura/pontilhado)
+ glifo (✓ ~ ✕)** — para funcionar com daltonismo, alto contraste e impressão.

### 7.1 Identidade visual (regra transversal, v3.1)
Além da regra de estado, o produto se afasta do Wordle em:

- **paleta** — sem o trio verde/âmbar/cinza clássico; as três direções de arte entregadas
  (Serena, Noturno, Elétrico) têm paletas próprias;
- **grade e resultado** — layout, tipografia e composição do resultado próprios; o botão de
  enviar não ocupa a posição do Wordle;
- **glifos** — conjunto de símbolos próprio, consistente entre célula, teclado e texto
  compartilhado;
- **nome** — "Adivinha Palavra" e as variantes de direção de arte, nunca "Wordle".

### 7.2 Compartilhamento sem spoiler
```
Adivinha Palavra 4/6
✓✓✕✕✕
~✕✕✓✕
✕~✓~✕
✓✓✓✓✓
```
(O conjunto de símbolos segue a paleta em vigor — nunca inclui o alvo, nunca inclui apelido.)

**Animações:** digitação 100ms; revelação escalonada 80ms/letra; shake 400ms; respeitar
`prefers-reduced-motion`; som opcional.

---

## 8. Acessibilidade

Teclado (desktop) + toque (mobile); `aria-live="polite"`; células com `aria-label`
(posição+estado); alto contraste (bordas + hachura); daltonismo (paleta própria); fonte
escalável; ícones com aria-label/texto.

### 8.1 Critérios de aceitação de acessibilidade (auditoria de produto)
1. Cada um dos 3 botões de poder tem nome acessível único ("Revelar", "Eliminar", "Reiniciar");
   descrição anunciada uma única vez (NVDA/VoiceOver).
2. Em todas as combinações tema × alto contraste × texto, cada estado de célula e de tecla é
   distinguível sem distinguir cor (glifo presente com razão de contraste ≥ 4,5:1 sobre o fundo
   real da célula).
3. Razão de contraste da letra de qualquer célula: ≥ 4,5:1 no tema padrão e ≥ 7:1 em alto
   contraste.
4. Ao vencer ou perder (com e sem movimento reduzido), o veredito é a última mensagem da região
   `role="status"` e o foco vai para o título do resultado; erros são anunciados por
   `role="alert"` sem mover o foco.
5. Fluxo 100% teclado validado: digitar palavra → Enter → Revelar → Eliminar → Reiniciar, com
   `document.activeElement` sempre definido e estável após cada ação e após redimensionar a janela.
6. Células vazias não são expostas ao leitor de tela (ou usam `role="grid"/"gridcell"` com rótulo
   apenas nas preenchidas).

---

## 9. Persistência (Local)

Chaves: `ap:settings` (apenas preferências de UI). `localStorage` com fallback para memória quando
bloqueado (modo privado).

```json
// ap:settings
{ "theme":"dark", "highContrast":false, "reduceMotion":false, "tex":true }
```

Nenhum dado de partida, estatística ou palavra-alvo é persistido entre sessões (decisão de produto:
sem backend, sem meta-progressão).

---

## 10. Backend e Leaderboard (fora do MVP)

Não há backend no MVP. As rotas abaixo são descritas para referência futura, caso o produto evolua:

| Método | Rota | Descrição |
|---|---|---|
| GET | `/daily?date=YYYY-MM-DD` | Metadados da partida (sem o alvo). |
| POST | `/daily/guess` | Valida tentativa server-side; retorna feedback. |
| GET | `/leaderboard?date&limit` | Ranking (posição, tentativas, tempo, alias, isSelf). |

**Identidade (sem login):** `sessionId` anônimo (UUID por instalação) + `alias`.

---

## 11. Arquitetura de Software (frontend-only)

```
testando as IA's/prototypes/
├── dicionario.js            # fonte única do dicionário (gerado via tools/gerar-dicionario.js)
├── 01-serena.html           # CSS + JS inline
├── 02-noturno.html          # CSS + JS inline
└── 03-eletrico.html         # CSS + JS inline
```

Princípios: cada protótipo é autocontido, sem dependências externas, funciona totalmente offline,
carrega o dicionário compartilhado via `<script src="dicionario.js">` e cai numa lista mínima de
fallback se o arquivo estiver ausente.

---

## 12. Contratos (JavaScript)

```ts
type LetterState = "empty"|"filled"|"correct"|"present"|"absent";
type Power = "reveal"|"eliminate";

interface GameState {
  mode: "practice";
  target: string;
  wordLength: number;
  maxGuesses: number;
  guesses: string[];
  feedback: LetterState[][];
  currentGuess: string;
  powersUsed: Record<Power, boolean>;
  status: "playing"|"won"|"lost";
  startedAt: number;
  finishedAt: number | null;
}

function evaluate(guess: string, target: string): LetterState[];
function isValidGuess(guess: string, accepted: Set<string>, length: number): boolean;
function usePower(state: GameState, power: Power): GameState;
```

---

## 13. Algoritmos Auxiliares
- **Revelar:** preenche a próxima posição não descoberta da linha atual com a letra correta;
  consome o poder.
- **Eliminar:** marca até 2 letras ausentes como `absent` no teclado; consome o poder.
- **Normalização:** uppercase, remover acentos, `Ç`→`C`, ignorar não-alfabéticos.

---

## 14. Telemetria e KPIs (apenas locais)

Eventos: `game_started`, `guess_submitted`, `power_used`, `game_won`, `game_lost`, `share_clicked`.
KPIs locais (apenas no dispositivo): taxa de vitória, distribuição de tentativas, uso de poderes.

---

## 15. Erros e Estados Especiais

Offline → funciona 100% (não há backend). Storage indisponível → memória + aviso. Partida não
concluída ao fechar aba → não é recuperada (decisão: sem persistência de jogo).

---

## 16. Requisitos Não Funcionais

Web: TTI ≤3s, bundle ≤200KB gz, Chrome/Safari/Firefox/Edge (2 últimas), iOS Safari ≥15, Android
≥90. SEO/OG. Testes: domínio ≥90% unit; E2E do fluxo crítico (Playwright web).

---

## 17. Critérios de Aceitação (MVP)

1. Partida completa em web (5 letras, 6 tentativas).
2. Feedback correto com letras repetidas (testes).
3. Tentativa inválida não avança, não consome tentativa e faz shake.
4. Hard Mode bloqueia tentativas que ignoram dicas.
5. Poderes: 1 uso cada, desativados no Difícil.
6. Compartilhamento sem spoiler (não inclui a palavra).
7. Palavra-alvo muda a cada reinício e não repete a anterior.
8. Todo o conteúdo (dicionário + interface) é familiar (sem termos ofensivos).
9. Identidade visual própria (não cópia do Wordle).
10. Alto contraste e daltonismo funcionam (critérios de acessibilidade §8.1).
11. Funciona totalmente offline.
12. `dicionario.js` carrega nos três protótipos; fallback funciona se ausente.

---

## 18. Roadmap

- **v1.1:** login opcional + sync de stats (requer backend).
- **v1.2:** categorias de palavras; 3º poder.
- **v1.3:** conquistas/recordes leves (sem níveis).
- **v1.4:** i18n (en/es) + dicionários localizados.
- **v1.5:** PWA com push de nova palavra diária.
- **v1.6:** desafios semanais com ranking separado.

---

## 19. Decisões Tomadas (v3.1)

| # | Decisão | Justificativa |
|---|---------|---------------|
| 1 | Público: familiar/escolar (não adulto casual 18–45) | Conteúdo sem termos ofensivos; tom escolar |
| 2 | Sem monetização (não pretende monetizar) | Decisão de produto; remove pressão por leaderboard/ads |
| 3 | Identidade visual própria e forte | Risco legal: NYT processa cópias do Wordle por nome, layout e paleta de cores |
| 4 | Palavra-alvo sorteada no cliente a cada reinício | Sem servidor no MVP; funciona 100% offline |
| 5 | Conteúdo familiar (sem ofensivas nas listas) | Público-alvo definido na decisão 1 |

**Decisões ainda em aberto:** filtragem/moderação de alias (se houver leaderboard futuro), tier
gratuito do backend, teclado do sistema vs virtual no mobile, notificações push.

---

*Fim do documento.*

> **Documentos relacionados**
> - Addendo de implementação dos protótipos web: `docs/plans/2026-10-20-addendo-prototipos-web.md`
> - Especificação técnica de implementação: `docs/specs/2026-10-20-specs-implementacao.md`
> - Onde este PRD mora: `docs/plans/2026-10-13-adivinha-palavra.md`
