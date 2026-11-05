'use strict';
// Peças comuns a todas as páginas: formatos pt-BR, DOM, tabelas, tema e gráficos (Chart.js).
// Sem bibliotecas além do Chart.js. Sem internet os gráficos não carregam, mas as tabelas aparecem.
const TEM_CHART = typeof window.Chart !== 'undefined';
const raiz = document.documentElement;
const css = (v) => getComputedStyle(raiz).getPropertyValue(v).trim();
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// ------------------------------------------------------------------ formatos (sinal de menos tipográfico)
const _nf = {};
function fmtN(x, d = 1) {
  if (x == null || Number.isNaN(x)) return '—';
  if (!_nf[d]) _nf[d] = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
  return _nf[d].format(x).replace('-', '−');
}
const fmtInt = (x) => fmtN(x, 0);
const fmtSinal = (x, d = 1) => (x == null || Number.isNaN(x)) ? '—' : (x > 0 ? '+' : '') + fmtN(x, d);
const fmtPct = (x, d = 0, sinal = true) => (x == null || Number.isNaN(x)) ? '—' : (sinal && x > 0 ? '+' : '') + fmtN(x * 100, d) + '%';
const fmtUS = (x, d = 2) => (x == null || Number.isNaN(x)) ? '—' : 'US$ ' + fmtN(x, d);
const fmtRS = (x, d = 2) => (x == null || Number.isNaN(x)) ? '—' : 'R$ ' + fmtN(x, d);
const fmtX = (x, d = 1) => (x == null || Number.isNaN(x)) ? '—' : fmtN(x, d) + 'x';
const fmtP = (p) => (p == null || Number.isNaN(p)) ? '—' : (p < 0.001 ? '< 0,001' : fmtN(p, 3));
const mesTxt = (ym) => MESES[+ym.slice(5, 7) - 1] + '/' + ym.slice(0, 4);
const dataTxt = (ymd) => (ymd ? ymd.slice(8, 10) + '/' + ymd.slice(5, 7) + '/' + ymd.slice(0, 4) : '—');
const mesAnoDeData = (ymd) => (ymd ? ymd.slice(5, 7) + '/' + ymd.slice(0, 4) : '—');

// ------------------------------------------------------------------ DOM (textos sempre por textContent)
function el(tag, attrs, ...filhos) {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'text') e.textContent = v; else if (k === 'style') e.style.cssText = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const f of filhos) if (f != null && f !== false) e.append(f instanceof Node ? f : document.createTextNode(String(f)));
  return e;
}
const tile = (rot, val, nota, pequeno = false) => el('div', { class: 'tile' },
  el('div', { class: 'tile-rot', text: rot }), el('div', { class: 'tile-val' + (pequeno ? ' pequeno' : ''), text: val }),
  nota ? el('div', { class: 'tile-nota', text: nota }) : null);
const cabecalho = (t, s) => el('div', { class: 'cartao-topo' }, el('div', {}, el('h3', { text: t }), s ? el('p', { class: 'cartao-sub', text: s }) : null));
// pars: texto vira parágrafo; lista vira <ul>. dataEscrita marca a interpretação que não muda sozinha com os dados.
function caixaLer(titulo, pars, dataEscrita, solto = true) {
  const filhos = pars.map((t) => (Array.isArray(t) ? el('ul', {}, ...t.map((i) => el('li', { text: i }))) : el('p', { text: t })));
  return el('div', { class: 'ler' + (solto ? ' solto' : '') }, titulo ? el('h3', { text: titulo }) : null, ...filhos,
    dataEscrita ? el('p', { class: 'data-escrita', text: dataEscrita }) : null);
}
function selo(v, pequeno = false) { return el('span', { class: 'selo selo-' + v + (pequeno ? ' pequeno' : ''), text: v }); }

function tabelaOrdenavel(colunas, linhas, opc = {}) {
  const caixa = el('div', { class: 'rolagem' + (opc.alta ? ' alta' : '') + (opc.livre ? ' livre' : '') });
  let campo = null, dir = 1;
  const montar = () => {
    const cab = el('tr');
    for (const c of colunas) {
      const b = el('button', { type: 'button', class: 'ord', text: c.rotulo + (campo === c.campo ? (dir > 0 ? ' ▲' : ' ▼') : '') });
      b.onclick = () => { if (campo === c.campo) dir = -dir; else { campo = c.campo; dir = c.num ? -1 : 1; } montar(); };
      cab.append(el('th', { scope: 'col', class: c.num ? 'num' : null }, b));
    }
    const ls = [...linhas];
    if (campo) ls.sort((a, b) => { const x = a[campo], y = b[campo]; if (x == null) return 1; if (y == null) return -1;
      return (typeof x === 'string' ? x.localeCompare(y, 'pt-BR') : x - y) * dir; });
    const corpo = el('tbody');
    for (const l of ls) corpo.append(el('tr', { class: opc.destaque && opc.destaque(l) ? 'destaque' : null }, ...colunas.map((c) => el('td', { class: c.num ? 'num' : null,
      text: c.fmt ? c.fmt(l[c.campo], l) : (l[c.campo] ?? '—') }))));
    caixa.replaceChildren(el('table', { class: 'tabela' }, el('thead', {}, cab), corpo));
  };
  montar();
  return caixa;
}
function segmentoEmpresa(atual, aoTrocar, opcoes = [['Petrobras', 'Petrobras (PETR4)'], ['Prio', 'Prio (PRIO3)']]) {
  const seg = el('div', { class: 'segmento', role: 'group', 'aria-label': 'Empresa' });
  for (const [v, t] of opcoes) {
    const b = el('button', { type: 'button', 'aria-pressed': v === atual ? 'true' : 'false', text: t });
    b.onclick = () => aoTrocar(v);
    seg.append(b);
  }
  return seg;
}

// ------------------------------------------------------------------ cores (lidas do CSS a cada desenho: seguem o tema)
function cores() {
  return { petrobras: css('--petrobras'), prio: css('--prio'), s: [css('--s1'), css('--s2'), css('--s3'), css('--s4')],
           brent: css('--brent'), ref: css('--ref'), media: css('--texto-3'), residuo: css('--residuo'), texto: css('--texto'),
           texto2: css('--texto-2'), texto3: css('--texto-3'), grade: css('--grade'), base: css('--base'), superficie: css('--superficie'),
           cara: css('--cara'), barata: css('--barata') };
}
const corEmpresa = (e, C) => (e === 'Petrobras' ? C.petrobras : C.prio);

// ------------------------------------------------------------------ Chart.js: padrões, tooltip, mira, rótulos
const META = new WeakMap();   // formato e título de cada gráfico, guardados pelo canvas ANTES de criar (ele já desenha ao nascer)
const meta = (chart) => META.get(chart.canvas) || {};
let legendaOriginal = null;
function aplicarPadroes() {
  if (!TEM_CHART) return;
  const C = cores(), D = Chart.defaults;
  D.font.family = 'system-ui, -apple-system, "Segoe UI", sans-serif'; D.font.size = 12; D.color = C.texto3; D.borderColor = C.grade;
  D.animation = false; D.maintainAspectRatio = false; D.responsive = true;
  Object.assign(D.elements.line, { borderWidth: 2, borderCapStyle: 'round', borderJoinStyle: 'round', tension: 0 });
  Object.assign(D.elements.point, { radius: 0, hoverRadius: 5, hitRadius: 12, hoverBorderWidth: 2 });
  Object.assign(D.elements.bar, { borderRadius: 4, borderSkipped: 'start' });
  D.plugins.tooltip.enabled = false; D.plugins.tooltip.external = tooltipExterno;
  D.plugins.legend.position = 'top'; D.plugins.legend.align = 'start';
  if (!legendaOriginal) legendaOriginal = D.plugins.legend.labels.generateLabels;
  Object.assign(D.plugins.legend.labels, { usePointStyle: true, boxWidth: 18, boxHeight: 8, padding: 14, color: C.texto2,
    filter: (it, data) => !data.datasets[it.datasetIndex].semLegenda,
    generateLabels: (chart) => legendaOriginal(chart).map((it) => {
      const ds = chart.data.datasets[it.datasetIndex], tipo = ds.type || chart.config.type;
      if (tipo === 'line' && ds.showLine !== false) Object.assign(it, { pointStyle: 'line', strokeStyle: ds.borderColor, lineWidth: 3, lineDash: ds.borderDash || [] });
      else if (tipo === 'line' || tipo === 'scatter') Object.assign(it, { pointStyle: 'circle', fillStyle: ds.pointBackgroundColor, strokeStyle: ds.pointBackgroundColor, lineWidth: 0 });
      else Object.assign(it, { pointStyle: 'rect', fillStyle: ds.backgroundColor, strokeStyle: ds.backgroundColor, lineWidth: 0 });
      if (ds.rotuloLegenda) it.text = ds.rotuloLegenda;
      it.fontColor = cores().texto2;
      return it;
    }) });
}
function tooltipExterno(context) {
  const { chart, tooltip } = context;
  const area = chart.canvas.parentNode;
  let tt = area.querySelector('.tt');
  if (!tt) { tt = el('div', { class: 'tt' }); area.append(tt); }
  if (tooltip.opacity === 0 || !tooltip.dataPoints || !tooltip.dataPoints.length) { tt.style.opacity = '0'; return; }
  const m = meta(chart), fmt = m.fmt || ((v) => fmtN(v, 2));
  const tit = tooltip.title && tooltip.title.length ? tooltip.title[0] : '';
  tt.replaceChildren(el('div', { class: 'tt-titulo', text: m.titulo ? m.titulo(tit, tooltip.dataPoints[0].dataIndex, tooltip.dataPoints[0]) : tit }));
  for (const dp of tooltip.dataPoints) {
    const ds = dp.dataset, tipo = ds.type || chart.config.type;
    const cor = ds.corChave || (tipo === 'line' ? ds.borderColor : ds.backgroundColor);
    const v = ds.data[dp.dataIndex];
    if (v == null) continue;
    tt.append(el('div', { class: 'tt-linha' }, el('span', { class: 'tt-chave', style: 'background:' + (Array.isArray(cor) ? cor[dp.dataIndex] : cor) }),
      el('strong', { text: fmt(v, ds, dp.dataIndex) }), el('span', { class: 'tt-nome', text: ds.label })));
  }
  tt.style.opacity = '1';
  const w = tt.offsetWidth, h = tt.offsetHeight, W = area.clientWidth, H = area.clientHeight;
  let x = tooltip.caretX + 16; if (x + w > W) x = tooltip.caretX - w - 16; if (x < 0) x = 0;
  let y = tooltip.caretY - h / 2; if (y < 0) y = 0; if (y + h > H) y = Math.max(0, H - h);
  tt.style.left = x + 'px'; tt.style.top = y + 'px';
}
const mira = { id: 'mira', afterDraw(chart) {           // linha vertical que acompanha o mouse nos gráficos de linha
  if (!meta(chart).mira) return;
  const ativos = chart.tooltip && chart.tooltip.getActiveElements ? chart.tooltip.getActiveElements() : [];
  if (!ativos.length) return;
  const x = ativos[0].element.x, a = chart.chartArea, ctx = chart.ctx;
  ctx.save(); ctx.strokeStyle = cores().texto3; ctx.globalAlpha = 0.5; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x, a.top); ctx.lineTo(x, a.bottom); ctx.stroke(); ctx.restore();
} };
const rotulosFinais = { id: 'rotulosFinais', afterDatasetsDraw(chart, _a, o) {   // nome no fim da linha (some se colidir)
  if (!o || !o.ativo) return;
  const itens = [];
  chart.data.datasets.forEach((ds, i) => {
    const m = chart.getDatasetMeta(i);
    if (m.hidden || ds.semRotulo) return;
    for (let j = ds.data.length - 1; j >= 0; j--) {
      const v = ds.data[j];
      if (v != null && !Number.isNaN(v) && m.data[j]) { itens.push({ x: m.data[j].x, y: m.data[j].y, t: ds.rotuloFinal || ds.label, cor: ds.borderColor }); break; }
    }
  });
  if (!itens.length) return;
  const ord = [...itens].sort((a, b) => a.y - b.y);
  for (let k = 1; k < ord.length; k++) if (ord[k].y - ord[k - 1].y < 14) return;
  const C = cores(), ctx = chart.ctx;
  ctx.save(); ctx.font = '12px system-ui, -apple-system, "Segoe UI", sans-serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
  for (const it of itens) {
    ctx.beginPath(); ctx.arc(it.x, it.y, 4, 0, Math.PI * 2); ctx.fillStyle = it.cor; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = C.superficie; ctx.stroke();
    ctx.fillStyle = C.texto2; ctx.fillText(it.t, it.x + 8, it.y);
  }
  ctx.restore();
} };
const rotulosBarras = { id: 'rotulosBarras', afterDatasetsDraw(chart, _a, o) {   // valor na ponta da barra
  if (!o || !o.ativo) return;
  const ctx = chart.ctx, fmt = meta(chart).fmt || ((v) => fmtN(v, 2)), horiz = chart.options.indexAxis === 'y';
  ctx.save(); ctx.font = '11px system-ui, -apple-system, "Segoe UI", sans-serif'; ctx.fillStyle = cores().texto2;
  chart.data.datasets.forEach((ds, i) => {
    const m = chart.getDatasetMeta(i);
    if (m.hidden || (ds.type && ds.type !== 'bar')) return;
    m.data.forEach((b, j) => {
      const v = ds.data[j];
      if (v == null || Number.isNaN(v)) return;
      const t = fmt(v, ds, j);
      if (horiz) { ctx.textBaseline = 'middle'; ctx.textAlign = v < 0 ? 'right' : 'left'; ctx.fillText(t, b.x + (v < 0 ? -5 : 5), b.y); }
      else { ctx.textAlign = 'center'; ctx.textBaseline = v < 0 ? 'top' : 'bottom'; ctx.fillText(t, b.x, b.y + (v < 0 ? 4 : -4)); }
    });
  });
  ctx.restore();
} };

// ------------------------------------------------------------------ cartão de gráfico + tabela gêmea
const graficos = {};
function cartaoGrafico(id, titulo, sub, altura = 300) {
  return el('div', { class: 'cartao', id },
    el('div', { class: 'cartao-topo' }, el('div', {}, el('h3', { text: titulo }), el('p', { class: 'cartao-sub', text: sub || '' })),
      el('button', { class: 'botao-tabela', type: 'button', text: 'Ver tabela' })),
    el('div', { class: 'area', style: 'height:' + altura + 'px' }, el('canvas', { role: 'img', 'aria-label': titulo })),
    el('div', { class: 'gemea', hidden: true }));
}
function tabelaGemea(cfg, fmt, rotuloX, rotulos) {
  const ds = cfg.data.datasets.filter((d) => !d.semTabela);
  const labs = rotulos || cfg.data.labels;
  const cab = el('tr', {}, el('th', { scope: 'col' }, el('span', { class: 'ord', text: rotuloX || '' })),
    ...ds.map((d) => el('th', { scope: 'col', class: 'num' }, el('span', { class: 'ord', text: d.label }))));
  const corpo = el('tbody');
  labs.forEach((l, i) => corpo.append(el('tr', {}, el('td', { text: l }), ...ds.map((d) => el('td', { class: 'num', text: fmt(d.data[i], d, i) })))));
  return el('div', { class: 'rolagem' }, el('table', { class: 'tabela' }, el('thead', {}, cab), corpo));
}
function desenhar(cartao, cfg, fmt, extra = {}) {
  const id = cartao.id;
  if (graficos[id]) { graficos[id].destroy(); delete graficos[id]; }
  const gemea = cartao.querySelector('.gemea'), botao = cartao.querySelector('.botao-tabela'), area = cartao.querySelector('.area');
  const montar = () => gemea.replaceChildren(tabelaGemea(cfg, fmt, extra.rotuloX, extra.rotulos));
  botao.onclick = () => { const abrir = gemea.hidden; if (abrir) montar(); gemea.hidden = !abrir; botao.textContent = abrir ? 'Ocultar tabela' : 'Ver tabela'; };
  if (!gemea.hidden) montar();
  if (!TEM_CHART) { area.hidden = true; montar(); gemea.hidden = false; botao.hidden = true; return null; }
  const canvas = area.querySelector('canvas');
  META.set(canvas, { fmt, titulo: extra.titulo || null, mira: !!extra.mira });
  const ch = new Chart(canvas, cfg);
  graficos[id] = ch;
  return ch;
}
// séries e eixos
const serie = (label, data, cor, x = {}) => Object.assign({ label, data, borderColor: cor, backgroundColor: cor, pointBackgroundColor: cor,
  pointBorderColor: cores().superficie, spanGaps: false }, x);
const referencia = (label, valor, n, cor, tracejado, x = {}) => serie(label, Array(n).fill(valor), cor,
  Object.assign({ borderWidth: 1.5, borderDash: tracejado, semRotulo: true, pointHoverRadius: 0, semTabela: true }, x));
function eixoMensal(labels, passo, C) {
  return { grid: { display: false }, border: { color: C.base }, ticks: { autoSkip: false, maxRotation: 0, color: C.texto3,
    callback: (v, i) => { const l = labels[i]; if (!l || l.slice(5, 7) !== '01') return null; const a = +l.slice(0, 4); return a % passo === 0 ? String(a) : null; } } };
}
function eixoSemanal(labels, C) {
  return { grid: { display: false }, border: { color: C.base }, ticks: { autoSkip: false, maxRotation: 0, color: C.texto3,
    callback: (v, i) => { const l = labels[i]; return l && l.slice(5, 7) === '01' && +l.slice(8, 10) <= 7 ? l.slice(0, 4) : null; } } };
}
function eixoAnos(labels, C) {   // trimestres "1T26": mostra o ano no 1T, com passo para não colidir
  const anos = [...new Set(labels.map((l) => l.slice(-2)))];
  const passo = anos.length > 16 ? 4 : anos.length > 8 ? 2 : 1;
  return { grid: { display: false }, border: { color: C.base }, ticks: { autoSkip: false, maxRotation: 0, color: C.texto3,
    callback: (v, i) => { const l = labels[i]; if (!l || !l.startsWith('1T')) return null; return (+l.slice(-2)) % passo === 0 ? '20' + l.slice(-2) : null; } } };
}
function opcoesLinha(labels, fmtEixo, o = {}) {
  const C = cores();
  const y = { grid: { color: C.grade }, border: { display: false }, beginAtZero: !!o.zero, ticks: { color: C.texto3, callback: (v) => fmtEixo(v) } };
  if (o.tituloY) y.title = { display: true, text: o.tituloY, color: C.texto3 };
  if (o.min != null) y.min = o.min;
  if (o.max != null) y.max = o.max;
  if (o.log) {   // escala logarítmica: só marca 1, 2 e 5 de cada potência de 10
    y.type = 'logarithmic'; y.beginAtZero = false; y.ticks.autoSkip = false;
    y.ticks.callback = (v) => { const m = v / 10 ** Math.floor(Math.log10(v)); return [1, 2, 5].some((k) => Math.abs(m - k) < 1e-9) ? fmtEixo(v) : null; };
  }
  return { interaction: { mode: 'index', intersect: false }, layout: { padding: { right: o.padDir || 8, top: 4 } },
           plugins: { legend: { display: o.legenda !== false }, rotulosFinais: { ativo: !!o.rotulosFinais } },
           scales: { x: o.eixoX || eixoMensal(labels, o.passo || 5, C), y } };
}
function opcoesBarrasH(C, fmtEixo, o = {}) {
  return { indexAxis: 'y', interaction: { mode: 'index', axis: 'y', intersect: false }, layout: { padding: { left: o.padEsq || 0, right: o.padDir || 56 } },
    plugins: { legend: { display: !!o.legenda }, rotulosBarras: { ativo: true } },
    scales: { x: { grace: '14%', grid: { color: C.grade }, border: { display: false }, ticks: { color: C.texto3, callback: (v) => fmtEixo(v) } },
              y: { grid: { display: false }, border: { color: C.base }, ticks: { color: C.texto2 } } } };
}
function opcoesColunas(C, fmtEixo, o = {}) {
  return { interaction: { mode: 'index', axis: 'x', intersect: false }, layout: { padding: { top: 16 } },
    plugins: { legend: { display: !!o.legenda }, rotulosBarras: { ativo: o.rotulos !== false } },
    scales: { x: { grid: { display: false }, border: { color: C.base }, ticks: { color: C.texto2, maxRotation: 0 } },
              y: { grace: '12%', grid: { color: C.grade }, border: { display: false }, ticks: { color: C.texto3, callback: (v) => fmtEixo(v) } } } };
}

// ------------------------------------------------------------------ tema (preferência só de quem está vendo) e menu
function lerTema() {
  const pedido = new URLSearchParams(location.search).get('tema');
  if (pedido === 'dark' || pedido === 'light') return pedido;
  try { return localStorage.getItem('tema') || 'light'; } catch (e) { return 'light'; }
}
function gravarTema(t) { try { localStorage.setItem('tema', t); } catch (e) { /* navegador sem armazenamento: segue sem lembrar */ } }
raiz.dataset.theme = lerTema();
function iniciarTema(aoTrocar) {
  const b = document.getElementById('tema');
  if (!b) return;
  const rotulo = () => { b.textContent = raiz.dataset.theme === 'dark' ? 'Tema claro' : 'Tema escuro'; };
  rotulo();
  b.onclick = () => { raiz.dataset.theme = raiz.dataset.theme === 'dark' ? 'light' : 'dark'; gravarTema(raiz.dataset.theme); rotulo(); aplicarPadroes(); if (aoTrocar) aoTrocar(); };
}
if (TEM_CHART) { Chart.register(mira, rotulosFinais, rotulosBarras); aplicarPadroes(); }
