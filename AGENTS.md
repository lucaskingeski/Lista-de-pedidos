# AGENTS.md

Instruções para agentes de IA que trabalham neste repositório.

## Contexto do repositório

Repositório de estudos em JavaScript/Node.js: projetos Express, MongoDB, Mongoose,
Firebase e uma pasta de protótipos de jogo de palavras (`testando as IA's/prototypes`).
Cada subprojeto é independente e tem o próprio `package.json`; nada é compartilhado
entre eles além deste arquivo de instruções.

## PRDs

> Os PRDs devem ser _sempre_ criados na raiz do projeto atual, seguindo o formato
> `docs/plans/{{YYYY-MM-DD}}-{{descrição}}.md`. caso isso ja esteja feito, me informe, se não estiver, faça

Na prática, isso significa:

- O caminho é **relativo à raiz do repositório** (`C:/Users/Lucas/Desktop/escola/web`),
  nunca relativo ao subdiretório em que o agente estiver trabalhando.
- O arquivo vai em `docs/plans/`, com o nome no formato
  `AAAA-MM-DD-descricao-em-kebab-case.md` — ex.: `docs/plans/2026-10-20-prototipos-jogo-de-palavras.md`.
- `{{YYYY-MM-DD}}` é a **data em que o PRD foi criado**, não a data do trabalho
  descrito dentro dele.
- `{{descrição}}` é um slug curto e legível, sem acentos, espaços ou caracteres
  especiais.
- Nenhum PRD é criado fora de `docs/plans/`, e nenhum PRD é salvo com o nome
  genérico `PRD.md` na raiz.
- A pasta `docs/plans/` é criada junto com o arquivo, caso ainda não exista.

Antes de escrever um PRD, verifique se já existe um documento equivalente em
`docs/plans/`; se existir, prefira **atualizá-lo** a criar um duplicado.

### PRDs existentes

| Documento | Escopo |
|---|---|
| `docs/plans/2026-10-13-adivinha-palavra.md` | **PRD principal (v3.0, autoritativo).** Produto completo: web + mobile, backend, leaderboard, modos, contratos e roadmap. As citações `PRD §x` no código dos protótipos apontam para cá. |
| `docs/plans/2026-10-20-addendo-prototipos-web.md` | **Addendo dos protótipos web.** O que os três HTMLs realmente implementam e em que pontos divergem do PRD principal (alvo sorteado localmente, sem backend, sem leaderboard, dicionário compartilhado). |

Regra de precedência: quando os dois divergirem, **vale o PRD principal**; as
divergências do protótipo estão listadas na seção 2 do addendo.

## Convenções de trabalho

- **Codificação e quebras de linha:** todos os arquivos de texto em UTF-8 **sem BOM**
  e com quebras de linha **LF** (`\n`). O Windows não deve introduzir CRLF.
- **Não quebrar o que já funciona:** as alterações devem ser verificadas com o
  servidor/projeto realmente rodando, não apenas por leitura de código.
- **Favor do explícito:** prefira nomes descritivos e funções pequenas a truques
  compactos; o código é lido por pessoas e por agentes.
- **Documentar o porquê, não o óbvio:** comentários explicam decisões e
  restrições, não repõem o que a linha já diz.
- **Sem credenciais** no repositório — variáveis de ambiente para segredos.

## Convenções específicas dos protótipos (`testando as IA's/prototypes`)

- `dicionario.js` é a **fonte única** do dicionário de tentativas
  (~14,5 mil palavras PT-BR de 5 letras) e do pool de palavras-alvo
  (`DICIONARIO_RESPOSTAS`). Ele **precisa** ficar na mesma pasta dos HTMLs:
  os protótipos o carregam com `<script src="dicionario.js">` e caem numa
  lista mínima de fallback se o arquivo estiver ausente.
- **Não reintroduza listas de palavras inline** nos HTMLs — isso duplicaria
  ~14 mil palavras em cada arquivo.
- Os três protótipos são arquivos **autocontidos de uma página cada**
  (CSS + JS inline), exceto pelo `dicionario.js` compartilhado.
- Ao mexer no dicionário, regere o `dicionario.js` pelo gerador
  (`tools/gerar-dicionario.js`) em vez de editar a lista à mão: ela é um
  artefato de build, e a invariante crítica é que **toda palavra de
  `DICIONARIO_RESPOSTAS` precisa estar em `DICIONARIO_PT5`** — caso contrário
  a partida fica impossível de vencer.
