'use strict';
/* ============================================================================
   tools/gerar-dicionario.js
   Gera "testando as IA's/prototypes/dicionario.js" a partir de fontes publicas.

   Uso (a partir da raiz do repositorio):
       node tools/gerar-dicionario.js

   As fontes sao baixadas uma vez para tools/.cache/ e reaproveitadas depois.
   Nao ha dependencia externa: apenas Node 18+ (fetch) e a rede.

   Invariante critica: toda palavra de RESPOSTAS precisa estar em PALAVRAS.
   Sem isso a partida fica impossivel de vencer, porque o jogador nao consegue
   digitar a palavra-alvo como tentativa.
   ========================================================================== */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const RAIZ = path.resolve(__dirname, '..');
const CACHE = path.join(__dirname, '.cache');
const SAIDA = path.join(RAIZ, "testando as IA's", 'prototypes', 'dicionario.js');
const LF = String.fromCharCode(10);

/* ------------------------------------------------------------------ fontes */
const FONTES = [
  ['lo_pt_BR.dic', 'https://raw.githubusercontent.com/LibreOffice/dictionaries/master/pt_BR/pt_BR.dic'],
  ['lexico.txt', 'https://raw.githubusercontent.com/fserb/pt-br/master/lexico'],
  ['verbos.txt', 'https://raw.githubusercontent.com/fserb/pt-br/master/listas/verbos'],
  ['negativas.txt', 'https://raw.githubusercontent.com/fserb/pt-br/master/listas/negativas'],
  ['dadoware.txt', 'https://raw.githubusercontent.com/thoughtworks/dadoware/master/7776palavras-2e.txt'],
  ['termo.txt', 'https://raw.githubusercontent.com/Legazim/termo-dicionario/main/termo.txt'],
  ['pt_br_full.txt', 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt_br/pt_br_full.txt'],
  ['pt_br_50k.txt', 'https://raw.githubusercontent.com/hermitdave/FrequencyWords/master/content/2018/pt_br/pt_br_50k.txt']
];

async function garantirFontes() {
  fs.mkdirSync(CACHE, { recursive: true });
  for (const [nome, url] of FONTES) {
    const destino = path.join(CACHE, nome);
    if (fs.existsSync(destino) && fs.statSync(destino).size > 0) {
      console.log('  cache  ' + nome);
      continue;
    }
    console.log('  baixando ' + nome + ' ...');
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('falha ao baixar ' + nome + ': HTTP ' + resp.status);
    fs.writeFileSync(destino, Buffer.from(await resp.arrayBuffer()));
  }
}

/* ------------------------------------------------------------ normalizacao */
const norm = (w) => w.normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
const is5 = (w) => /^[A-Z]{5}$/.test(w);
const readL = (f) => fs.readFileSync(path.join(CACHE, f), 'utf8').split(LF);
const textoOk = (t) => t && !/[^A-Za-zÀ-ÿ-]/.test(t) && !t.includes('-');

const VOG = new Set(['A', 'E', 'I', 'O', 'U']);
const CONS = 'BCDFGHJLMNPQRSTVWXZ';
function ortograficoOk(w) {
  if (/[KWY]/.test(w)) return false;            // fora do alfabeto oficial de 26
  if (![...w].some((c) => VOG.has(c))) return false;
  if (/(.)\1\1/.test(w)) return false;
  let run = 0;
  /* Ate TRES consoantes seguidas: EXTRA (xtr), ENTRE (ntr) e OMBRO (mbr) sao
     palavras comuns e legitimas; um limite de duas as rejeitava. */
  for (const c of w) { if (CONS.includes(c)) { run++; if (run > 3) return false; } else run = 0; }
  return true;
}
const add5 = (set, w) => { if (is5(w) && ortograficoOk(w)) { set.add(w); return true; } return false; };

/* ------------------------------------------------------------------ coleta */
function coletar() {
  const D5 = new Set(), X5 = new Set(), C = new Set(), TERMO = new Set(), N = new Set();
  const SO_PROPRIO = new Set(), lemas = new Set(), verbos = new Set();

  for (const raw of readL('lo_pt_BR.dic')) {
    const t = raw.split('/')[0].trim();
    if (!textoOk(t)) continue;
    const x = norm(t);
    if (x.length > 9 || !ortograficoOk(x)) continue;
    if (/^[a-zà-ÿ]/.test(t)) { lemas.add(x); if (is5(x)) D5.add(x); }  // nome comum
    else if (is5(x)) SO_PROPRIO.add(x);                                   // nome proprio
  }
  for (const w of D5) SO_PROPRIO.delete(w);   // existe em minuscula: nao e so nome

  for (const raw of readL('lexico.txt')) {
    const t = raw.trim();
    if (!textoOk(t)) continue;
    const x = norm(t);
    if (x.length > 9 || !ortograficoOk(x)) continue;
    lemas.add(x);
    if (is5(x)) X5.add(x);
  }
  for (const raw of readL('verbos.txt')) {
    const t = raw.trim();
    if (!textoOk(t)) continue;
    const x = norm(t);
    if (x.length >= 3 && x.length <= 14 && ortograficoOk(x)) verbos.add(x);
  }
  for (const [f, set] of [['dadoware.txt', C], ['termo.txt', TERMO], ['negativas.txt', N]]) {
    for (const raw of readL(f)) { const t = raw.trim(); if (textoOk(t)) add5(set, norm(t)); }
  }
  return { D5, X5, C, TERMO, N, SO_PROPRIO, lemas, verbos };
}

/* --------------------------------------------------------------- flexoes */
function plurais(w) {
  const u = w[w.length - 1];
  if (w.endsWith('AO')) return [w.slice(0, -2) + 'AES'];
  if (u === 'M') return [w.slice(0, -1) + 'NS'];
  if (u === 'L') return [w.slice(0, -1) + 'IS'];
  if (u === 'R' || u === 'Z') return [w + 'ES'];
  if (VOG.has(u) || u === 'N') return [w + 'S'];
  return [];
}
function conjugacoes(v) {
  const t = v.slice(-2);
  if (!['AR', 'ER', 'IR'].includes(t)) return [];
  const g = v.slice(0, -2);
  const f = [];
  if (t === 'AR') f.push(g + 'O', g + 'AS', g + 'A', g + 'AMOS', g + 'AIS', g + 'AM', g + 'EI', g + 'ASTE', g + 'OU', g + 'ASTES', g + 'ARAM');
  else f.push(g + 'O', g + 'ES', g + 'E', g + 'EMOS', g + 'EIS', g + 'EM', g + 'I', g + 'ISTE', g + 'IU', g + 'ISTES', g + 'IRAM');
  f.push(v + 'EI', v + 'AS', v + 'A', v + 'AMOS', v + 'AIS', v + 'AO');   // futuro
  f.push(g + 'E', g + 'ES', g + 'EMOS', g + 'EM');                       // subjuntivo
  f.push(g + 'NDO');
  if (VOG.has(g[g.length - 1])) f.push(g + 'HNDO');
  return f;
}

/* ------------------------------------------------------------ serializacao */
const CAB = { A: 'a', B: 'b', C: 'c', D: 'd', E: 'e', F: 'f', G: 'g', H: 'h', I: 'i', J: 'j', K: 'k', L: 'l', M: 'm', N: 'n', O: 'o', P: 'p', Q: 'q', R: 'r', S: 's', T: 't', U: 'u', V: 'v', W: 'w', X: 'x', Y: 'y', Z: 'z' };
function serializar(palavras, indent) {
  const porLetra = {};
  for (const w of palavras) (porLetra[w[0]] ||= []).push(w);
  const blocos = [];
  for (const ini of Object.keys(porLetra).sort()) {
    blocos.push('/* ' + CAB[ini] + ' */');
    const w = porLetra[ini];
    for (let i = 0; i < w.length; i += 10) {
      blocos.push(w.slice(i, i + 10).map((x) => '"' + x + '"').join(', ') + ',');
    }
  }
  blocos[blocos.length - 1] = blocos[blocos.length - 1].replace(/,$/, '');
  return blocos.map((b) => indent + b).join(LF);
}

/* ------------------------------------------------------------------- main */
(async () => {
  console.log('1) fontes');
  await garantirFontes();

  console.log('2) curadoria');
  const { D5, X5, C, TERMO, N, SO_PROPRIO, lemas, verbos } = coletar();

  const geradas = new Set();
  for (const l of lemas) for (const p of plurais(l)) add5(geradas, p);
  for (const v of verbos) for (const f of conjugacoes(v)) add5(geradas, f);

  const out = new Set();
  for (const w of D5) if (!SO_PROPRIO.has(w)) out.add(w);
  for (const w of X5) if (!SO_PROPRIO.has(w)) out.add(w);
  for (const w of C) out.add(w);
  for (const w of geradas) if (!SO_PROPRIO.has(w)) out.add(w);
  for (const w of TERMO) if (!SO_PROPRIO.has(w)) out.add(w);

  /* palavras da versao de 14 itens: mantidas por compatibilidade */
  const LEGADO = ['CRANE', 'STARE', 'ADIEU', 'RAISE', 'SLATE', 'TERMO', 'MENTE',
    'PEDRA', 'NUVEM', 'FLORE', 'BARCO', 'CASAS', 'TROCA', 'NOTAS'];
  for (const w of LEGADO) out.add(w);
  for (const w of [...out]) if (N.has(w)) out.delete(w);

  /* pool de respostas: comum, sem nome proprio, sempre contido em `out` */
  const ANGLICISMOS = new Set(['DRIVE', 'STAFF', 'STOCK', 'THREE', 'LOBBY', 'TCHAN',
    'GUISA', 'GIBAO', 'LAIVO', 'ANGLO', 'QUARK', 'HERTZ']);
  const RESPOSTAS = [];
  for (const w of C) {
    if (N.has(w) || ANGLICISMOS.has(w)) continue;
    if (SO_PROPRIO.has(w) && !D5.has(w)) continue;
    if (!out.has(w)) continue;
    RESPOSTAS.push(w);
  }
  RESPOSTAS.sort();
  const fora = RESPOSTAS.filter((w) => !out.has(w));
  if (fora.length) throw new Error('INVARIANTE quebrada: resposta fora do dicionario: ' + fora.join(' '));

  const PALAVRAS = [...out].sort();
  console.log('   tentativas validas: ' + PALAVRAS.length);
  console.log('   respostas sorteaveis: ' + RESPOSTAS.length);

  console.log('3) escrevendo ' + path.relative(RAIZ, SAIDA));
  const cabecalho = fs.readFileSync(path.join(__dirname, 'header-dicionario.txt'), 'utf8')
    .replace('__TOTAL__', PALAVRAS.length.toLocaleString('pt-BR'))
    .replace(/\n$/, '');
  const corpo = [
    '(function (global) {',
    "  'use strict';",
    '',
    '  /* Lista já normalizada: A-Z, sem acento, sem duplicatas, em ordem alfabética. */',
    '  var PALAVRAS = Object.freeze([',
    serializar(PALAVRAS, '    '),
    '  ]);',
    '',
    '  /* Pool de palavras-alvo: palavra comum, sem nome próprio e contida em PALAVRAS. */',
    '  var RESPOSTAS = Object.freeze([',
    serializar(RESPOSTAS, '    '),
    '  ]);',
    '',
    '  /* Índice de busca O(1) para validar a tentativa no momento do envio. */',
    '  var INDICE = new Set(PALAVRAS);',
    '',
    '  global.DICIONARIO_PALAVRAS = PALAVRAS;',
    '  global.DICIONARIO_RESPOSTAS = RESPOSTAS;',
    '  global.DICIONARIO_PT5 = INDICE;',
    '',
    '  /* Permite carregar este arquivo também como módulo CommonJS (testes, build). */',
    "  if (typeof module !== 'undefined' && module.exports) {",
    '    module.exports = { palavras: PALAVRAS, respostas: RESPOSTAS, indice: INDICE };',
    '  }',
    "})(typeof window !== 'undefined' ? window : globalThis);",
    ''
  ].join(LF);
  fs.writeFileSync(SAIDA, cabecalho + LF + corpo, 'utf8');
  console.log('   ok (' + (fs.statSync(SAIDA).size / 1024).toFixed(1) + ' KB)');
})().catch((e) => { console.error('ERRO: ' + e.message); process.exit(1); });
