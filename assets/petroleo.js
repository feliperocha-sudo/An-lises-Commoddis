'use strict';
// Seção do Petróleo. Dados em dados/petroleo.js, gerados por gerar_site.py a partir dos Excel do projeto.
const D = window.DADOS;
const R = D.regra, H = D.hoje, V = D.vereditos;
const estado = { placar: 'Petrobras', periodoBrent: '2000', fator: 'Petrobras', correl: '2019', serie: 'Bomba: gasolina (semanal)', evEmpresa: 'Ambas', evCategoria: '', res: 'Petrobras', resDesde: '2016', premio: 'Petrobras', altaAtivo: 'PETR4' };
if (!D.inflacao.series.includes(estado.serie)) estado.serie = D.inflacao.series[0];
const DATA_LEITURA = `Leitura escrita em 05/11/2026, com preços de 04/11/2026. Os números vêm dos dados; a interpretação não muda sozinha.`;
const fmtFaixa = () => `US$ ${fmtN(R.piso, 1)}–${fmtN(R.teto, 1)}`;
const titularMes = (l) => mesTxt(l) + (l === D.brent.parcial ? ' (parcial)' : '');


// ------------------------------------------------------------------ Veredito
function reguaBrent() {
  const lo = 45, hi = 135, pos = (v) => Math.min(100, Math.max(0, (v - lo) / (hi - lo) * 100));
  const zona = (de, ate, cor, t) => el('div', { class: 'regua-zona', style: `width:${pos(ate) - pos(de)}%;background:var(${cor})`, text: t || '' });
  const reg = el('div', { class: 'regua', role: 'img', 'aria-label': `Brent futuro de ${fmtUS(H.brent)} na régua: abaixo de ${fmtUS(R.piso, 1)} commodity barata; até ${fmtUS(R.teto, 1)} na média; até ${fmtUS(R.corte, 0)} neutra; a partir daí cara.` },
    zona(lo, R.piso, '--zona-barata', 'Commodity barata'), zona(R.piso, R.teto, '--zona-media'), zona(R.teto, R.corte, '--zona-neutra', 'NEUTRA'), zona(R.corte, hi, '--zona-cara', 'CARA'),
    el('div', { class: 'regua-marca cima', style: `left:${pos(H.brent)}%` }, el('span', { text: `Futuro ${fmtUS(H.brent)}` })),
    el('div', { class: 'regua-marca sec baixo', style: `left:${pos(H.spot)}%` }, el('span', { text: `À vista ${fmtUS(H.spot)} (${H.spot_data})` })),
    el('div', { class: 'regua-corte', style: `left:${pos((R.piso + R.teto) / 2)}%`, text: `Preço médio ${fmtFaixa()}` }),
    el('div', { class: 'regua-corte', style: `left:${pos(R.corte)}%`, text: `Corte ${fmtUS(R.corte, 0)}` }));
  return reg;
}
function cartaoVeredito(e) {
  const v = V[e], C = cores();
  return el('div', { class: 'veredito' },
    el('div', { class: 'veredito-topo' },
      el('div', { class: 'veredito-nome' }, el('span', { class: 'ponto', style: 'background:' + corEmpresa(e, C) }), `${e} (${v.ticker})`), selo(v.ver)),
    el('div', { class: 'veredito-preco', text: fmtRS(v.preco) }),
    el('ul', {},
      el('li', {}, el('span', { text: 'Queda desde o pico de 24 meses' }), el('strong', { text: fmtPct(v.queda_pico) })),
      el('li', {}, el('span', { text: 'Preço de "lixo" (30% abaixo do pico)' }), el('strong', { text: `${fmtRS(v.preco_lixo)} (${fmtPct(v.falta_lixo)})` })),
      el('li', {}, el('span', { text: 'Alta em 12 meses, com proventos' }), el('strong', { text: fmtPct(v.alta12) })),
      el('li', {}, el('span', { text: `Retorno além dos fatores em 12 meses (até ${v.descol_mes})` }), el('strong', { text: fmtPct(v.descol, 1) }))));
}
function renderVeredito() {
  const p = document.getElementById('p-veredito'); p.replaceChildren();
  p.append(el('div', { class: 'vereditos' }, cartaoVeredito('Petrobras'), cartaoVeredito('Prio')));
  const dif = (a) => a / H.brent - 1;
  p.append(el('div', { class: 'cartao solto' },
    cabecalho('Onde o Brent está na régua', `A regra olha o Brent futuro do dia dos preços (${D.data_precos}), em dólar nominal. O à vista é publicado com atraso e está acima do futuro.`), reguaBrent()));
  p.append(el('div', { class: 'grade-tiles' },
    H.brent >= R.corte ? tile('Para sair de CARA', `Brent < ${fmtUS(R.corte, 0)}`, `${fmtPct(dif(R.corte), 1)} do futuro de hoje. As duas viram NEUTRAS.`)
      : tile('Para virar CARA', `Brent ≥ ${fmtUS(R.corte, 0)}`, `${fmtPct(dif(R.corte), 1)} do futuro de hoje.`),
    tile('Para virar BARATA', `Brent < ${fmtUS(R.piso, 1)}`, `${fmtPct(dif(R.piso), 1)} do futuro de hoje, e a ação no "lixo": PETR4 até ${fmtRS(V.Petrobras.preco_lixo)}, PRIO3 até ${fmtRS(V.Prio.preco_lixo)}.`),
    tile('Dólar (PTAX)', fmtRS(H.ptax, 4), `Brent em reais: ${fmtRS(H.brent_rs, 0)} por barril`),
    tile('Brent acima do preço médio', fmtPct(H.brent / R.teto - 1), `Contra o teto de ${fmtUS(R.teto, 1)}, a mediana dos meses dos últimos 20 anos`)));

  const fx = (s) => D.caro.faixas.find((f) => f.empresa === 'Petrobras' && f.situacao === s) || {};
  const pl = D.premio.pl_brent.find((x) => x.empresa === 'Petrobras' && x.situacao === 'P/L abaixo da mediana e Brent de 90+') || {};
  const lx = D.caro.lixo.find((x) => x.empresa === 'Petrobras' && x.situacao === '30 a 50% abaixo do pico') || {};
  const cortes = D.regra_teste.melhor_corte, ct = (c) => (cortes.find((x) => x.corte === c) || {}).freq;
  const fxPrio = D.caro.faixas.filter((f) => f.empresa === 'Prio');
  p.append(el('div', { class: 'linha dupla' },
    caixaLer('Conclusão', [D.caro.conclusao.slice(1, 3).join(' '), D.caro.conclusao[D.caro.conclusao.length - 2], D.caro.conclusao[D.caro.conclusao.length - 1],
      'Este texto sai das regras do Excel "Caro ou barato" e muda sozinho com os preços.'], null, false),
    caixaLer('Onde a regra é mais fraca', [[
      `O corte de ${fmtUS(R.corte, 0)} não está bem identificado: ao reamostrar a história, o melhor corte caiu em US$ 100 em ${fmtPct(ct(100), 0, false)} das vezes, em US$ 60 em ${fmtPct(ct(60), 0, false)} e em US$ 90 em só ${fmtPct(ct(90), 0, false)}.`,
      `O resultado ruim de comprar com Brent alto vem quase todo de 2008–2014. Em 2022 foi o contrário, por causa dos dividendos.`,
      `P/L baixo com Brent de US$ 90 ou mais não mostrou armadilha de perda na PETR4: ${fmtPct(pl.retorno_24m)} em 24 meses, mas só ${fmtPct(pl.so_preco_24m)} de preço, em ${fmtInt(pl.trimestres)} trimestres.`,
      `"No lixo" sozinho não basta: na PETR4, comprar de 30% a 50% abaixo do pico deu ${fmtPct(lx.r24)} em 24 meses. O que separa é o Brent.`,
      `Na PRIO3 nenhuma faixa de Brent teve retorno mediano negativo (de ${fmtPct(Math.min(...fxPrio.map((f) => f.r24)))} a ${fmtPct(Math.max(...fxPrio.map((f) => f.r24)))}), numa fase em que a produção só cresceu. As faixas altas têm um episódio só.`]], DATA_LEITURA, false)));

  p.append(el('h2', { class: 'secao', text: 'Placar: cada lente da análise' }));
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Empresa', segmentoEmpresa(estado.placar, (v) => { estado.placar = v; renderVeredito(); }))));
  const ls = D.caro.placar.filter((l) => l.empresa === estado.placar);
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'lente', rotulo: 'Lente' }, { campo: 'indicador', rotulo: 'Indicador' }, { campo: 'hoje', rotulo: 'Hoje' },
    { campo: 'ref', rotulo: 'Referência' }, { campo: 'leitura', rotulo: 'Leitura (regra fixa)' }], ls, { livre: true, destaque: (l) => l.lente === 'VEREDITO' })));
}

// ------------------------------------------------------------------ Brent no ciclo: contas simples rodam na página
function mqo(y, X) {  // mínimos quadrados: devolve coeficientes e erros-padrão (erros clássicos, como no teste ADF)
  const n = y.length, k = X[0].length, A = Array.from({ length: k }, () => Array(k * 2).fill(0));
  for (let i = 0; i < k; i++) { for (let j = 0; j < k; j++) for (let t = 0; t < n; t++) A[i][j] += X[t][i] * X[t][j]; A[i][k + i] = 1; }
  for (let i = 0; i < k; i++) { let m = i; for (let r = i + 1; r < k; r++) if (Math.abs(A[r][i]) > Math.abs(A[m][i])) m = r; [A[i], A[m]] = [A[m], A[i]];
    const d = A[i][i]; for (let j = 0; j < 2 * k; j++) A[i][j] /= d; for (let r = 0; r < k; r++) if (r !== i) { const f = A[r][i]; for (let j = 0; j < 2 * k; j++) A[r][j] -= f * A[i][j]; } }
  const inv = A.map((l) => l.slice(k)), xy = Array(k).fill(0);
  for (let i = 0; i < k; i++) for (let t = 0; t < n; t++) xy[i] += X[t][i] * y[t];
  const b = inv.map((l) => l.reduce((s, v, j) => s + v * xy[j], 0));
  let sq = 0; for (let t = 0; t < n; t++) { let e = y[t]; for (let i = 0; i < k; i++) e -= b[i] * X[t][i]; sq += e * e; }
  const s2 = sq / (n - k);
  return { b, ep: inv.map((l, i) => Math.sqrt(s2 * l[i])) };
}
function estatBrent(v) {
  const n = v.length, media = v.reduce((a, x) => a + x, 0) / n, dp = Math.sqrt(v.reduce((a, x) => a + (x - media) ** 2, 0) / (n - 1));
  const ordenado = [...v].sort((a, b) => a - b), mediana = n % 2 ? ordenado[(n - 1) / 2] : (ordenado[n / 2 - 1] + ordenado[n / 2]) / 2;
  const dy = v.slice(1).map((x, i) => x - v[i]);
  const ar = mqo(dy, v.slice(0, -1).map((x) => [1, x]));
  const adf = mqo(dy.slice(1), v.slice(1, -1).map((x, i) => [1, x, dy[i]]));
  const tAdf = adf.b[1] / adf.ep[1];
  return { n, media, dp, mediana, meiaVida: ar.b[1] < 0 ? -Math.log(2) / Math.log(1 + ar.b[1]) : null, tAdf,
    sig: tAdf < -3.44 ? 'significativo a 1%' : tAdf < -2.87 ? 'significativo a 5%' : tAdf < -2.57 ? 'significativo só a 10%' : 'não significativo',
    pct: (x) => v.filter((u) => u <= x).length / n };
}
function renderBrent() {
  const p = document.getElementById('p-brent'); p.replaceChildren();
  const C = cores(), ini = estado.periodoBrent, todos = D.brent.mensal.filter((x) => x.m >= ini + '-01');
  const op = [['1987', 'Desde 1987'], ['2000', 'Desde 2000'], ['2010', 'Desde 2010'], ['2016', 'Desde 2016'], ['2020', 'Desde 2020']];
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Período dos gráficos e das contas', segmentoEmpresa(estado.periodoBrent, (v) => { estado.periodoBrent = v; renderBrent(); }, op))));
  const completos = todos.filter((x) => x.m !== D.brent.parcial).map((x) => x.b);
  const E = estatBrent(completos), z = (H.brent - E.media) / E.dp;
  p.append(el('div', { class: 'grade-tiles' },
    tile('Brent futuro hoje', fmtUS(H.brent), `Percentil ${fmtN(E.pct(H.brent) * 100, 0)}% dos meses do período`),
    tile('Média dos meses', fmtUS(E.media, 1), `Mediana ${fmtUS(E.mediana, 1)}; ${fmtInt(E.n)} meses completos`),
    tile('Distância da média', `${fmtSinal(z, 2)} desvios`, `1 desvio = ${fmtUS(E.dp, 1)}`),
    tile('Volta à média?', fmtN(E.tAdf, 2), `Teste ADF(1): ${E.sig}. Valor crítico a 5%: −2,87`),
    tile('Meia-vida do desvio', E.meiaVida ? `${fmtN(E.meiaVida, 0)} meses` : '—', 'Tempo para o desvio cair à metade, pelo modelo mais simples')));
  const lab = todos.map((x) => x.m), n = lab.length;
  const g1 = cartaoGrafico('g-brent', 'Brent mensal em dólar nominal', `Média do mês do preço à vista, sem correção por inflação. Linhas: preço médio de ${fmtFaixa()} e corte de CARA em ${fmtUS(R.corte, 0)}.`, 360);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g1));
  desenhar(g1, { type: 'line', data: { labels: lab, datasets: [
      serie('Brent', todos.map((x) => x.b), C.brent, { semRotulo: true }),
      serie(`Futuro de hoje (${fmtUS(H.brent)})`, todos.map((x, i) => (i === n - 1 ? H.brent : null)), C.texto, { showLine: false, pointRadius: 5, pointHoverRadius: 6, pointBorderWidth: 2, semRotulo: true, semTabela: true }),
      referencia(`Corte de CARA (${fmtUS(R.corte, 0)})`, R.corte, n, C.cara, [6, 4]),
      referencia(`Teto do preço médio (${fmtUS(R.teto, 1)})`, R.teto, n, C.s[0], []),
      referencia(`Piso do preço médio (${fmtUS(R.piso, 1)})`, R.piso, n, C.s[0], [2, 3])] },
    options: opcoesLinha(lab, (v) => 'US$ ' + fmtN(v, 0), { zero: true, passo: n > 200 ? 5 : n > 100 ? 2 : 1 }) },
    (v) => fmtUS(v), { mira: true, titulo: titularMes, rotuloX: 'Mês', rotulos: lab.map(titularMes) });

  const bReais = D.inflacao.mensal.filter((x) => x.m >= (ini === '1987' ? '2000' : ini) + '-01'), lr = bReais.map((x) => x.m);
  const d10 = D.caro.dolar.find((x) => x.janela === 'últimos 10 anos') || {};
  const g2 = cartaoGrafico('g-brent-rs', 'Brent em reais, por barril', 'Brent à vista × dólar, média do mês, sem correção por inflação. A receita em reais sobe tanto com o petróleo quanto com o dólar.', 300);
  const tabD = el('div', { class: 'cartao' }, cabecalho('Dólar e Brent em reais hoje', `Hoje: dólar ${fmtRS(H.ptax, 2)} e Brent de ${fmtRS(H.brent_rs, 0)} por barril.`),
    tabelaOrdenavel([{ campo: 'janela', rotulo: 'Janela' }, { campo: 'media', rotulo: 'Dólar médio', num: true, fmt: (v) => fmtRS(v) }, { campo: 'pct', rotulo: 'Percentil do dólar', num: true, fmt: (v) => fmtPct(v, 0, false) },
      { campo: 'br_media', rotulo: 'Brent em R$ médio', num: true, fmt: (v) => fmtRS(v, 0) }, { campo: 'br_pct', rotulo: 'Percentil do Brent em R$', num: true, fmt: (v) => fmtPct(v, 0, false) }], D.caro.dolar, { livre: true }),
    el('p', { class: 'cartao-sub', style: 'margin-top:10px', text: `Com ${fmtPct(d10.br_pct, 0, false)} dos meses de 10 anos abaixo do Brent em reais de hoje, o lucro em reais também está alto, não só o em dólar.` }));
  p.append(el('div', { class: 'linha dupla' }, g2, tabD));
  desenhar(g2, { type: 'line', data: { labels: lr, datasets: [serie('Brent em reais', bReais.map((x) => x.rs), C.brent)] },
    options: opcoesLinha(lr, (v) => 'R$ ' + fmtN(v, 0), { legenda: false, zero: true, passo: lr.length > 150 ? 5 : 2 }) }, (v) => fmtRS(v, 0), { mira: true, titulo: titularMes, rotuloX: 'Mês', rotulos: lr.map(titularMes) });

  const mdata = (v) => (v ? mesAnoDeData(v) : 'não voltou');
  p.append(el('div', { class: 'linha dupla' },
    el('div', { class: 'cartao' }, cabecalho('As vezes em que o Brent passou de US$ 100', 'Até voltar abaixo do teto do preço médio, na média do mês. Retorno das ações no período, com proventos.'),
      tabelaOrdenavel([{ campo: 'inicio', rotulo: 'Passou de 100', fmt: mesAnoDeData }, { campo: 'maximo', rotulo: 'Máximo mensal', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'volta', rotulo: 'Voltou em', fmt: mdata },
        { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'petr4', rotulo: 'PETR4', num: true, fmt: (v) => fmtPct(v) }, { campo: 'prio3', rotulo: 'PRIO3', num: true, fmt: (v) => fmtPct(v) }], D.caro.ep100, { livre: true })),
    el('div', { class: 'cartao' }, cabecalho('Depois de um Brent alto, o que aconteceu com ele', `"Até o teto" = chance de estar em ${fmtUS(R.teto, 1)} ou menos no horizonte. A volta costuma vir, mas até o preço médio é menos frequente.`),
      tabelaOrdenavel([{ campo: 'situacao', rotulo: 'Situação' }, { campo: 'h', rotulo: 'Meses à frente', num: true, fmt: fmtInt }, { campo: 'janelas', rotulo: 'Janelas', num: true, fmt: fmtInt }, { campo: 'var', rotulo: 'Variação mediana', num: true, fmt: (v) => fmtPct(v) },
        { campo: 'baixo', rotulo: 'Mais baixo', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'ate90', rotulo: 'Até US$ 90', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'teto', rotulo: 'Até o teto', num: true, fmt: (v) => fmtPct(v, 0, false) }], D.mundo.premissa, { livre: true }))));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Como o preço médio foi calculado', 'Mediana dos meses de cada janela. O teto e o piso do preço médio são as medianas dos últimos 20 e 10 anos, recalculadas a cada atualização.'),
    tabelaOrdenavel([{ campo: 'desde', rotulo: 'Janela', fmt: (v) => (/^\d/.test(v) ? 'Desde ' + v : v) }, { campo: 'media', rotulo: 'Média dos meses', num: true, fmt: (v) => fmtUS(v) }, { campo: 'mediana', rotulo: 'Mediana dos meses', num: true, fmt: (v) => fmtUS(v) }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt },
      { campo: 'abaixo', rotulo: 'Abaixo do piso', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'acima', rotulo: 'Acima do teto', num: true, fmt: (v) => fmtPct(v, 0, false) }], D.caro.ciclo, { livre: true })));
}

// ------------------------------------------------------------------ Prêmio e cenários
function renderPremio() {
  const p = document.getElementById('p-premio'); p.replaceChildren();
  const C = cores(), P = D.premio;
  const e4 = (e) => P.elo4.find((x) => x.empresa === e) || {}, e2 = (e) => P.elo2.find((x) => x.empresa === e) || {};
  const impl = (e, b) => P.implicito.find((x) => x.empresa === e && x.base === b) || {};
  const faixaPrem = (e) => { const x = e4(e); return `${fmtN(Math.min(x.premio_pct_R_mensal, x.premio_pct_R_12m) * 100, 0)}% a ${fmtN(Math.max(x.premio_pct_R_mensal, x.premio_pct_R_12m) * 100, 0)}%`; };
  const faixaPreco = (e) => { const x = e4(e); return `${fmtRS(Math.min(x.preco_brent_teto_beta_mensal, x.preco_brent_teto_beta_12m))} a ${fmtRS(Math.max(x.preco_brent_teto_beta_mensal, x.preco_brent_teto_beta_12m))}`; };
  p.append(caixaLer('A pergunta desta parte', [
    `Quanto do preço de hoje é efeito do Brent acima do normal? Com o Brent de ${fmtUS(H.brent)}, o lucro de um ano fica inflado (${fmtPct(e2('Petrobras').lucro_inflado, 0, false)} na Petrobras e ${fmtPct(e2('Prio').lucro_inflado, 0, false)} na Prio, contra o Brent no teto do preço médio), e parte disso está no preço das ações.`,
    `Cara contra o normal não quer dizer sobrevalorizada: o prêmio no preço fica perto do valor presente do caixa temporário que a alta do Brent traz.`]));
  const bloco = (e) => { const x = e4(e), y = e2(e), v = V[e], iP = impl(e, 'P/L');
    return el('div', { class: 'veredito' },
      el('div', { class: 'veredito-topo' }, el('div', { class: 'veredito-nome' }, el('span', { class: 'ponto', style: 'background:' + corEmpresa(e, C) }), `${e} (${v.ticker})`)),
      el('div', { class: 'veredito-preco', text: faixaPrem(e) }), el('p', { class: 'cartao-sub', text: 'Prêmio do Brent no preço, pelos betas mensal e de 12 meses' }),
      el('ul', {},
        el('li', {}, el('span', { text: `Preço com o Brent em ${fmtUS(R.teto, 1)} (hoje ${fmtRS(v.preco)})` }), el('strong', { text: faixaPreco(e) })),
        el('li', {}, el('span', { text: 'P/L no Brent de hoje → no teto do preço médio' }), el('strong', { text: `${fmtX(y.pl_brent_hoje)} → ${fmtX(y.pl_brent_teto)}` })),
        el('li', {}, el('span', { text: 'Prêmio em dinheiro × valor presente da alta temporária' }), el('strong', { text: `US$ ${fmtN(Math.min(x.premio_US_bi_mensal, x.premio_US_bi_12m), 1)}–${fmtN(Math.max(x.premio_US_bi_mensal, x.premio_US_bi_12m), 1)} bi × ${fmtN(x.vp_alta_temporaria_US_bi, 1)} bi` })),
        el('li', {}, el('span', { text: 'Brent que o preço de hoje embute (pelo P/L)' }), el('strong', { text: `${fmtUS(iP.brent_implicito, 0)} (IC ${fmtN(Math.max(iP.ic_baixo, 0), 0)}–${fmtN(iP.ic_alto, 0)})` })))); };
  p.append(el('div', { class: 'vereditos' }, bloco('Petrobras'), bloco('Prio')));
  const pr = P.pl_brent;
  p.append(el('div', { class: 'linha dupla' },
    el('div', { class: 'cartao' }, cabecalho('Elo 1: o resultado por barril segue o Brent?', 'Regressão por trimestre (Petrobras desde 2017, Prio desde 2019). Elasticidade = quanto o resultado por barril muda, em %, para cada 1% no Brent.'),
      tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'medida', rotulo: 'Medida', fmt: (v) => v.replace('fco', 'caixa') }, { campo: 'inclinacao', rotulo: 'US$ por US$ de Brent', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 't_nw', rotulo: 't', num: true, fmt: (v) => fmtN(v, 1) }, { campo: 'elasticidade', rotulo: 'Elasticidade', num: true, fmt: (v) => fmtN(v, 1) + '×' }, { campo: 'a_brent_teto', rotulo: 'No teto', num: true, fmt: (v) => fmtUS(v, 1) }, { campo: 'a_brent_hoje', rotulo: 'Hoje', num: true, fmt: (v) => fmtUS(v, 1) }], P.elo1, { livre: true })),
    el('div', { class: 'cartao' }, cabecalho('Elo 3: preço e Brent andam juntos no longo prazo?', 'Teste de Engle-Granger. Se o resíduo não for estacionário, não dá para afirmar uma relação de longo prazo estável.'),
      tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'modelo', rotulo: 'Modelo' }, { campo: 'beta_longo_prazo', rotulo: 'Beta', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 't_adf_residuo', rotulo: 't', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'critico_5pct', rotulo: 'Crítico 5%', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'cointegra_5pct', rotulo: 'Cointegra?', fmt: (v) => (v ? 'sim' : 'não') }], P.elo3, { livre: true }),
      el('p', { class: 'cartao-sub', style: 'margin-top:10px', text: 'Nenhum modelo cointegra a 5%: o prêmio é uma estimativa pelo beta, não uma distância até um equilíbrio provado.' }))));
  const hs = P.historico.filter((x) => x.empresa === estado.premio), lab = hs.map((x) => x.p);
  const g = cartaoGrafico('g-pl', `${V[estado.premio].ticker}: P/L de 12 meses × P/L com o Brent normal`, 'O P/L "normal" refaz o lucro com o Brent no teto do preço médio, para tirar o efeito do ciclo. Trimestres com P/L acima de 40x (lucro perto de zero) ficam vazios.', 300);
  const seg = segmentoEmpresa(estado.premio, (v) => { estado.premio = v; renderPremio(); });
  const tabPL = el('div', { class: 'cartao' }, cabecalho('Depois de um Brent alto, o lucro cai?', 'Variação do lucro e do caixa nos 4 trimestres seguintes, por faixa de Brent no trimestre (mediana).'),
    tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'faixa', rotulo: 'Faixa' }, { campo: 'trimestres', rotulo: 'Trimestres', num: true, fmt: fmtInt }, { campo: 'lucro_4tri_depois', rotulo: 'Lucro depois', num: true, fmt: (v) => fmtPct(v) }, { campo: 'lucro_caiu', rotulo: 'Lucro caiu', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'caixa_4tri_depois', rotulo: 'Caixa depois', num: true, fmt: (v) => fmtPct(v) }], P.lucro_depois, { livre: true }));
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Empresa do gráfico', seg)));
  p.append(el('div', { class: 'linha dupla' }, g, tabPL));
  const semOutlier = (v) => (v == null || v > 40 || v < 0 ? null : v);
  desenhar(g, { type: 'line', data: { labels: lab, datasets: [serie('P/L de 12 meses', hs.map((x) => semOutlier(x.pl)), C.s[0], { rotuloFinal: 'P/L 12m' }), serie('P/L com o Brent normal', hs.map((x) => semOutlier(x.pl_normal)), C.s[1], { rotuloFinal: 'P/L normal' })] },
    options: opcoesLinha(lab, (v) => fmtX(v, 0), { rotulosFinais: true, padDir: 74, eixoX: eixoAnos(lab, C) }) }, (v) => fmtX(v), { mira: true, rotuloX: 'Trimestre' });

  p.append(el('h2', { class: 'secao', text: 'Se o Brent cair: comparação com o mundo' }));
  const ordem = ['PETR4', 'PRIO3', 'Cesta integradas', 'Cesta produtoras', 'Cesta estatais e emergentes', 'Cesta mundo', 'Energia global (ETF IXC)', 'S&P 500 (ETF SPY)'];
  const rs = ordem.map((a) => D.mundo.resumo.find((x) => x.ativo === a)).filter(Boolean);
  const gm = cartaoGrafico('g-mundo', 'Quanto cada ativo anda para cada 1% no Brent', 'Beta do retorno mensal em dólar, desde 2015. Cestas = média de petroleiras de cada grupo.', 320);
  const cor = (a) => (a === 'PETR4' ? C.petrobras : a === 'PRIO3' ? C.prio : C.residuo);
  const cenSel = D.mundo.cenario.filter((x) => Math.abs(x.brent - R.teto) < 0.06 && ordem.includes(x.ativo)).sort((a, b) => ordem.indexOf(a.ativo) - ordem.indexOf(b.ativo));
  const tabC = el('div', { class: 'cartao' }, cabecalho(`Cenário: Brent de ${fmtUS(H.brent)} até ${fmtUS(R.teto, 1)}`, 'Efeito só do Brent, em dólar, pelos betas mensal e de 12 meses, e os limites do intervalo de 95%. Não inclui dividendos, dólar nem notícias das empresas.'),
    tabelaOrdenavel([{ campo: 'ativo', rotulo: 'Ativo' }, { campo: 'ef_m', rotulo: 'Beta mensal', num: true, fmt: (v) => fmtPct(v) }, { campo: 'ef_12', rotulo: 'Beta de 12 meses', num: true, fmt: (v) => fmtPct(v) }, { campo: 'ef_ruim', rotulo: 'Limite pior', num: true, fmt: (v) => fmtPct(v) }, { campo: 'ef_bom', rotulo: 'Limite melhor', num: true, fmt: (v) => fmtPct(v) }], cenSel, { livre: true, destaque: (l) => l.ativo === 'PETR4' || l.ativo === 'PRIO3' }));
  p.append(el('div', { class: 'linha dupla' }, gm, tabC));
  desenhar(gm, { type: 'bar', data: { labels: rs.map((x) => x.ativo), datasets: [{ label: 'Beta ao Brent', data: rs.map((x) => x.beta), backgroundColor: rs.map((x) => cor(x.ativo)), borderColor: rs.map((x) => cor(x.ativo)), corChave: rs.map((x) => cor(x.ativo)), maxBarThickness: 22 }] }, options: opcoesBarrasH(C, (v) => fmtN(v, 1)) }, (v) => fmtN(v, 2), { rotuloX: 'Ativo' });
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Chance de cair em 12 meses', 'Fechar 12 meses abaixo do preço de compra: num mês qualquer, com Brent de US$ 100 ou mais, e com Brent de US$ 90 ou mais que caiu 25% ou mais. A PRIO3 tem só 3 meses nesse último caso.'),
    tabelaOrdenavel([{ campo: 'ativo', rotulo: 'Ativo' }, { campo: 'c_q', rotulo: 'Mês qualquer', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'c_100', rotulo: 'Brent 100+', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'm_100', rotulo: 'Mediana', num: true, fmt: (v) => fmtPct(v) }, { campo: 'c_ep', rotulo: 'Brent 90+ e caiu 25%+', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'm_ep', rotulo: 'Mediana', num: true, fmt: (v) => fmtPct(v) }, { campo: 'n_ep', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'alta12', rotulo: 'Alta em 12 meses', num: true, fmt: (v) => fmtPct(v) }], D.mundo.resumo, { livre: true })));
  p.append(caixaLer('Conclusão da comparação', [D.mundo.conclusao.slice(1, 4), D.mundo.conclusao[6], D.mundo.conclusao[8], D.mundo.conclusao[9]].flatMap((x) => (Array.isArray(x) ? x : [x])).concat(['Este texto sai das regras do Excel "Brent e petroleiras do mundo" e muda sozinho com os preços.'])));

  p.append(el('h2', { class: 'secao', text: 'Numa queda, qual cai menos?' }));
  const qd = (l) => l.janela === 'desde 2015';
  p.append(el('div', { class: 'linha dupla' },
    el('div', { class: 'cartao' }, cabecalho('Nos dias de queda do Brent', 'Retorno médio de cada ação no dia. "PETR4 melhor" = % dos dias em que a PETR4 caiu menos; p = teste da diferença.'),
      tabelaOrdenavel([{ campo: 'situacao', rotulo: 'Situação' }, { campo: 'casos', rotulo: 'Dias', num: true, fmt: fmtInt }, { campo: 'p', rotulo: 'PETR4', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'r', rotulo: 'PRIO3', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'melhor', rotulo: 'PETR4 melhor', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'pv', rotulo: 'p', num: true, fmt: fmtP }], D.queda.dias.filter(qd), { livre: true })),
    el('div', { class: 'cartao' }, cabecalho('Na queda de 3 meses e depois dela', 'Em meses a diferença some; a recuperação depois da queda foi maior na PRIO3, numa fase de produção crescente.'),
      tabelaOrdenavel([{ campo: 'situacao', rotulo: 'Situação' }, { campo: 'janela', rotulo: 'Janela' }, { campo: 'casos', rotulo: 'Casos', num: true, fmt: fmtInt }, { campo: 'p', rotulo: 'PETR4', num: true, fmt: (v) => fmtPct(v) }, { campo: 'r', rotulo: 'PRIO3', num: true, fmt: (v) => fmtPct(v) }, { campo: 'pv', rotulo: 'p', num: true, fmt: fmtP }], D.queda.tres, { livre: true }))));

  p.append(el('h2', { class: 'secao', text: 'A alta das duas em números' }));
  const ativo = estado.altaAtivo;
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Ação', segmentoEmpresa(ativo, (v) => { estado.altaAtivo = v; renderPremio(); }, [['PETR4', 'PETR4'], ['PRIO3', 'PRIO3']]))));
  const fmtAlta = (v, l) => { if (v == null) return '—'; if (/^Preço/.test(l.medida)) return fmtRS(v); if (/^Meses positivos/.test(l.medida)) return fmtInt(v); return fmtPct(v, 1); };
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'medida', rotulo: 'Medida' }, { campo: 'valor', rotulo: 'Hoje', num: true, fmt: fmtAlta }, { campo: 'comp', rotulo: 'Comparação' }, { campo: 'z', rotulo: 'z', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'pct', rotulo: 'Percentil', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'p', rotulo: 'p', num: true, fmt: fmtP }], D.alta.filter((x) => x.ativo === ativo), { livre: true })));

  p.append(el('h2', { class: 'secao', text: 'As fases de Brent alto da Petrobras' }));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('O que separa uma fase da outra', 'Brent de US$ 90 ou mais. Bomba ÷ paridade abaixo de zero = combustível segurado. O que separa 2022 de 2010–14 é dividendo, investimento e dívida, não o combustível. O alto DY só existe em uma fase.'),
    tabelaOrdenavel([{ campo: 'inicio', rotulo: 'Início', fmt: mesTxt }, { campo: 'fim', rotulo: 'Fim', fmt: mesTxt }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'brent', rotulo: 'Brent', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'bomba_x_paridade_12m', rotulo: 'Bomba ÷ paridade', num: true, fmt: (v) => fmtPct(v) }, { campo: 'dy_12m', rotulo: 'DY', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'div_liq_ebitda', rotulo: 'Dívida ÷ EBITDA', num: true, fmt: (v) => fmtX(v) }, { campo: 'capex_sobre_caixa', rotulo: 'Capex ÷ caixa', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'retorno_24m', rotulo: 'Retorno 24m', num: true, fmt: (v) => fmtPct(v) }, { campo: 'so_preco_24m', rotulo: 'Só preço', num: true, fmt: (v) => fmtPct(v) }], P.fases, { livre: true })));
}

// ------------------------------------------------------------------ O que move as ações
const leituraZ = (z) => (z >= 2 ? 'muito acima do normal' : z >= 1 ? 'acima do normal' : z <= -2 ? 'muito abaixo do normal' : z <= -1 ? 'abaixo do normal' : 'dentro do normal');
const FAMILIA_COR = (C) => ({ 'Petróleo e setor': C.s[0], 'Dólar': C.s[1], 'Juros e risco': C.s[2], 'Inflação': C.s[3] });
function correlacao(x, y) {
  const n = x.length, mx = x.reduce((a, v) => a + v, 0) / n, my = y.reduce((a, v) => a + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return { r: sxy / Math.sqrt(sxx * syy), beta: sxy / sxx, n };
}
function renderFatores() {
  const p = document.getElementById('p-fatores'); p.replaceChildren();
  const C = cores(), emp = estado.fator, F = D.fatores[emp], cor = corEmpresa(emp, C), tk = V[emp].ticker, A = F.ajuste, Dz = F.desc;
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Empresa', segmentoEmpresa(emp, (v) => { estado.fator = v; renderFatores(); }))));
  p.append(el('div', { class: 'grade-tiles' },
    tile(`Quanto os fatores explicam da ${tk}`, fmtN(A.r2 * 100, 0) + '%', `Retorno mensal em dólar, com dividendos. ${A.meses} meses (${A.ini} a ${A.fim}), ${A.nfat} fatores.`),
    tile('Só com o Brent', fmtN(A.r2_brent * 100, 0) + '%', 'R² de uma regressão só com o petróleo'),
    tile('Erro típico num mês', fmtN(A.erro, 1) + '%', 'Quanto a ação costuma se afastar do previsto'),
    tile('Retorno além dos fatores, 12 meses', fmtPct(Dz.ultimo, 1), `Até ${Dz.mes}: ${leituraZ(Dz.z)} (z ${fmtSinal(Dz.z, 2)})`)));
  const sel = F.coef.filter((c) => c.sel).sort((a, b) => b.peso - a.peso);
  const g1 = cartaoGrafico('g-peso', `De onde vem o R² de ${fmtN(A.r2 * 100, 0)}%`, 'Parte do R² que vem de cada fator (decomposição de Shapley); a soma das barras é o R².', 280);
  const tab = el('div', { class: 'cartao' }, cabecalho('Os 10 fatores candidatos e os que ficaram', 'Saem um a um até todos terem p < 0,10 (erro-padrão robusto). "Efeito" = mudança aproximada na ação, com os outros fatores parados.'),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Fator' }, { campo: 'sel', rotulo: 'Situação', fmt: (v) => (v ? 'no modelo' : 'saiu') }, { campo: 'leitura', rotulo: 'Efeito na ação', fmt: (v) => v || '—' }, { campo: 'peso', rotulo: 'Peso no R²', num: true, fmt: (v) => (v == null ? '—' : fmtN(v * 100, 1) + '%') }, { campo: 'p', rotulo: 'p (robusto)', num: true, fmt: fmtP }, { campo: 'beta', rotulo: 'Beta', num: true, fmt: (v) => fmtN(v, 3) }], F.coef));
  p.append(el('div', { class: 'linha dupla' }, g1, tab));
  desenhar(g1, { type: 'bar', data: { labels: sel.map((c) => c.nome), datasets: [{ label: 'Peso no R²', data: sel.map((c) => c.peso), backgroundColor: cor, borderColor: cor, maxBarThickness: 24 }] }, options: opcoesBarrasH(C, (v) => fmtN(v * 100, 0) + '%') }, (v) => fmtN(v * 100, 1) + '%', { rotuloX: 'Fator' });

  const M = F.mensal, lm = M.map((x) => x.m), n = lm.length;
  const g2 = cartaoGrafico('g-descol', 'Descolamento: retorno além dos fatores em 12 meses', 'Soma dos resíduos dos últimos 12 meses. Acima de +1 desvio: subiu mais que os fatores explicam; abaixo de −1: ficou para trás.');
  const g3 = cartaoGrafico('g-ret12', `Retorno em 12 meses: ${tk} × previsto pelos fatores`, 'Em dólar, com dividendos. A distância entre as linhas é o descolamento.');
  const g4 = cartaoGrafico('g-contrib', 'O que explicou cada mês (últimos 24 meses)', 'Barras: efeito de cada grupo de fatores acima ou abaixo do normal dele; cinza = fora dos fatores. Ponto = retorno do mês acima ou abaixo da média.');
  p.append(el('div', { class: 'linha' }, g2, g3, g4));
  desenhar(g2, { type: 'line', data: { labels: lm, datasets: [serie('Descolamento em 12 meses', M.map((x) => x.res12), cor, { rotuloFinal: 'Descolamento' }), referencia('Média', Dz.media, n, C.media, []),
      referencia('+1 desvio padrão', Dz.media + Dz.dp, n, C.ref, [6, 4], { rotuloLegenda: '±1 desvio padrão' }), referencia('−1 desvio padrão', Dz.media - Dz.dp, n, C.ref, [6, 4], { semLegenda: true })] },
    options: opcoesLinha(lm, (v) => fmtN(v * 100, 0) + '%', { rotulosFinais: true, padDir: 96, passo: 2 }) }, (v) => fmtPct(v, 1), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lm.map(mesTxt) });
  desenhar(g3, { type: 'line', data: { labels: lm, datasets: [serie(`${tk} em 12 meses`, M.map((x) => x.ret12 ?? null), cor, { rotuloFinal: tk }), serie('Previsto pelos fatores', M.map((x) => x.aju12 ?? null), C.brent, { borderDash: [6, 4], rotuloFinal: 'Previsto' })] },
    options: opcoesLinha(lm, (v) => fmtN(v * 100, 0) + '%', { rotulosFinais: true, padDir: 66, passo: 2 }) }, (v) => fmtPct(v, 1), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lm.map(mesTxt) });
  const K = F.contrib, lk = K.map((x) => x.m), FC = FAMILIA_COR(C);
  const barras = (label, data, corB) => ({ label, data, backgroundColor: corB, borderColor: C.superficie, borderWidth: 2, borderRadius: 0, stack: 'barras', maxBarThickness: 24 });
  const dsK = F.familias.map((f) => barras(f, K.map((x) => x[f]), FC[f] || C.texto2));
  dsK.push(barras('Fora dos fatores', K.map((x) => x.residuo), C.residuo));
  dsK.push({ type: 'line', label: 'Retorno do mês', data: K.map((x) => x.excesso), showLine: false, pointRadius: 4, pointHoverRadius: 6, pointBackgroundColor: C.texto, pointBorderColor: C.superficie, pointBorderWidth: 2, borderColor: C.texto, corChave: C.texto, stack: 'pontos', order: -1 });
  desenhar(g4, { type: 'bar', data: { labels: lk, datasets: dsK }, options: { interaction: { mode: 'index', axis: 'x', intersect: false }, plugins: { legend: { display: true } },
      scales: { x: { stacked: true, grid: { display: false }, border: { color: C.base }, ticks: { color: C.texto3, maxRotation: 0, autoSkip: true, maxTicksLimit: 6 } }, y: { stacked: true, grid: { color: C.grade }, border: { display: false }, ticks: { color: C.texto3, callback: (v) => fmtN(v * 100, 0) + '%' } } } } },
    (v) => fmtPct(v, 1), { rotuloX: 'Mês' });

  // sensibilidade ao Brent no tempo: beta mede o tamanho, R² mede quanto depende
  p.append(el('h2', { class: 'secao', text: 'A relação com o Brent muda com o tempo' }));
  const fp = D.fatores.Petrobras.mensal, fr = D.fatores.Prio.mensal, mp = {}, mr = {};
  fp.forEach((x) => { mp[x.m] = x; }); fr.forEach((x) => { mr[x.m] = x; });
  const lb = [...new Set([...fp.map((x) => x.m), ...fr.map((x) => x.m)])].sort().filter((m) => (mp[m] && mp[m].beta36 != null) || (mr[m] && mr[m].beta36 != null));
  const g5 = cartaoGrafico('g-beta', 'Beta do Brent em janelas de 36 meses: o tamanho da reação', 'Quanto a ação anda, em %, para cada 1% no Brent. O platô de 2020–23 é efeito de março de 2020, que fica 36 meses na janela.');
  const g6 = cartaoGrafico('g-r2', 'R² do Brent em janelas de 36 meses: quanto a ação depende dele', 'Parte do sobe e desce mensal explicada só pelo Brent. Beta e R² contam histórias diferentes: um beta menor pode vir com uma dependência maior.');
  p.append(el('div', { class: 'linha' }, g5, g6));
  const liga = (campo, fmt) => ({ type: 'line', data: { labels: lb, datasets: [serie('PETR4', lb.map((m) => (mp[m] ? mp[m][campo] : null)), C.petrobras, { rotuloFinal: 'PETR4' }), serie('PRIO3', lb.map((m) => (mr[m] ? mr[m][campo] : null)), C.prio, { rotuloFinal: 'PRIO3' })] },
    options: opcoesLinha(lb, fmt, { rotulosFinais: true, padDir: 56, passo: 2 }) });
  desenhar(g5, liga('beta36', (v) => fmtN(v, 1)), (v) => fmtN(v, 2), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lb.map(mesTxt) });
  desenhar(g6, liga('r236', (v) => fmtN(v * 100, 0) + '%'), (v) => fmtPct(v, 0, false), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lb.map(mesTxt) });

  // preço × Brent e correlação no período escolhido (conta na página)
  const ini = estado.correl, ab = D.acoes_brent.filter((x) => x.m >= ini + '-01');
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Período do gráfico e das correlações', segmentoEmpresa(ini, (v) => { estado.correl = v; renderFatores(); }, [['2011', 'Desde 2011'], ['2015', 'Desde 2015'], ['2019', 'Desde 2019'], ['2022', 'Desde 2022']]))));
  const pares = (k) => ab.filter((x) => x.rb != null && x[k] != null);
  const cP = correlacao(pares('rp').map((x) => x.rb), pares('rp').map((x) => x.rp)), cR = correlacao(pares('rr').map((x) => x.rb), pares('rr').map((x) => x.rr));
  const base = (k) => { const pr = ab.find((x) => x[k] != null); return ab.map((x) => (x[k] != null && pr ? 100 * x[k] / pr[k] : null)); };
  const lab2 = ab.map((x) => x.m);
  const g7 = cartaoGrafico('g-base100', `Ações em dólar × Brent, base 100 em ${mesTxt(lab2[0])}`, 'Fim de cada mês, sem dividendos, em um eixo só e em escala logarítmica (a mesma distância vale a mesma variação em %). Meses incompletos ficam de fora.', 320);
  const tabC = el('div', { class: 'cartao' }, cabecalho('Correlação dos retornos mensais com o Brent', `De ${mesTxt(lab2[0])} a ${mesTxt(lab2[lab2.length - 1])}, em dólar e com dividendos. Calculado na página, para o período escolhido.`),
    tabelaOrdenavel([{ campo: 'a', rotulo: 'Ação' }, { campo: 'r', rotulo: 'Correlação', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'r2', rotulo: 'R²', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'beta', rotulo: 'Beta', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'n', rotulo: 'Meses', num: true, fmt: fmtInt }],
      [{ a: 'PETR4', r: cP.r, r2: cP.r * cP.r, beta: cP.beta, n: cP.n }, { a: 'PRIO3', r: cR.r, r2: cR.r * cR.r, beta: cR.beta, n: cR.n }], { livre: true }),
    el('p', { class: 'cartao-sub', style: 'margin-top:10px', text: 'Março de 2020 puxa muito esses números: em 2019–26, sem março a maio de 2020, a correlação cai de cerca de 0,70 para cerca de 0,50 nas duas.' }));
  p.append(el('div', { class: 'linha dupla' }, g7, tabC));
  desenhar(g7, { type: 'line', data: { labels: lab2, datasets: [serie('Brent', base('b'), C.brent, { rotuloFinal: 'Brent' }), serie('PETR4', base('pu'), C.petrobras, { rotuloFinal: 'PETR4' }), serie('PRIO3', base('ru'), C.prio, { rotuloFinal: 'PRIO3' })] },
    options: opcoesLinha(lab2, (v) => fmtN(v, 0), { rotulosFinais: true, padDir: 56, log: true, passo: lab2.length > 100 ? 2 : 1 }) }, (v) => fmtN(v, 0), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lab2.map(mesTxt) });

  const oo = (m) => F.oos.find((o) => o.modelo === m) || {};
  const of = oo('Modelo de fatores'), ob = oo('Só Brent'), Q = F.quebra, rb = (v) => F.robustez.find((r) => r.variante === v) || {};
  const semCovid = rb('sem mar/2020'), comEmbi = rb('EMBI+ no lugar da NTN-B (até jul/2024)');
  const ls = [
    ['Teste fora da amostra (treino até 2022, teste 2023–2026): U de Theil, abaixo de 1 é melhor que prever retorno zero', `${fmtN(of.u, 2)}; só com o Brent: ${fmtN(ob.u, 2)}`],
    ['Acerto da direção do mês, fora da amostra', `${fmtN(of.acerto * 100, 0)}%; só com o Brent: ${fmtN(ob.acerto * 100, 0)}%`],
    ['Fatores escolhidos só com os dados do treino', of.fatores || '—'],
    ['Quebra na relação com o Brent (teste sup-F)', Q.p < 0.05 ? `Sim (p ${fmtP(Q.p)}): depois de ${Q.mes}, o beta do Brent passou de ${fmtN(Q.beta_antes, 2)} para ${fmtN(Q.beta_depois, 2)}` : `Não detectada (p ${fmtP(Q.p)})`],
    ['Sem mar/2020 (covid)', `R² ${fmtN(semCovid.r2, 2)} (${semCovid.meses} meses): ${semCovid.mesmos_sinais ? 'todos os fatores com o mesmo sinal' : 'algum fator mudou de sinal'}`],
    ['Com o EMBI+ no lugar da NTN-B (até jul/2024)', `R² ${fmtN(comEmbi.r2, 2)} (${comEmbi.meses} meses): ${comEmbi.mesmos_sinais ? 'os fatores em comum mantêm o sinal' : 'algum fator mudou de sinal'}`],
    ['Resíduos', `autocorrelação p ${fmtP(A.lb)} (Ljung-Box) e caudas pesadas p ${fmtP(A.jb)} (Jarque-Bera): por isso o erro-padrão robusto`]];
  p.append(el('div', { class: 'linha dupla' },
    el('div', { class: 'cartao' }, cabecalho('O modelo se sustenta?', 'Testes que o modelo precisa passar antes de ser usado'), el('table', { class: 'tabela chave-valor' }, el('tbody', {}, ...ls.map(([k, v]) => el('tr', {}, el('th', { scope: 'row', text: k }), el('td', { text: v })))))),
    caixaLer('Como ler', [`O modelo separa o retorno mensal da ${tk} em duas partes: o que vem dos fatores (Brent, dólar, juros, petroleiras dos EUA) e o resto, o que a ação fez por conta própria.`,
      'O dólar como fator é em parte mecânico: o retorno da ação é medido em dólar, então uma alta do dólar reduz esse retorno por conta própria.',
      'Descolamento = soma dos resíduos de 12 meses. Entre −1 e +1 desvio padrão é o normal da própria história. Não é preço-alvo.',
      'Relação estatística não é causa: os resultados mudam com a janela e com o regime de preços.'], null, false)));
}

// ------------------------------------------------------------------ Eventos
function renderEventos() {
  const p = document.getElementById('p-eventos'); p.replaceChildren();
  const C = cores(), E = D.eventos;
  const fe = el('select');
  [['Ambas', 'Petrobras e Prio'], ['Petrobras', 'Petrobras'], ['Prio', 'Prio']].forEach(([v, t]) => fe.append(el('option', { value: v, text: t })));
  fe.value = estado.evEmpresa;
  const cats = [...new Set(E.lista.map((x) => x.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const fc = el('select'); fc.append(el('option', { value: '', text: 'Todas' }));
  cats.forEach((c) => fc.append(el('option', { value: c, text: c })));
  fc.value = estado.evCategoria;
  fe.onchange = () => { estado.evEmpresa = fe.value; renderEventos(); };
  fc.onchange = () => { estado.evCategoria = fc.value; renderEventos(); };
  p.append(el('div', { class: 'filtros' }, el('label', { class: 'filtro' }, 'Empresa', fe), el('label', { class: 'filtro' }, 'Categoria', fc)));
  const ok = (r) => (estado.evEmpresa === 'Ambas' || r.empresa === estado.evEmpresa) && (!estado.evCategoria || r.categoria === estado.evCategoria);
  const res = E.resumo.filter(ok), sem = E.sem_sinal.filter(ok), lis = E.lista.filter(ok);
  const div = E.resumo.find((r) => r.empresa === 'Petrobras' && r.categoria === 'Dividendos') || {};
  const unicos = new Set(E.lista.map((x) => x.data + x.evento)).size, fortes = E.resumo.filter((r) => r.leitura === 'efeito nos dois testes (5%)').length;
  p.append(el('div', { class: 'grade-tiles' },
    tile('Petrobras no mês em que anuncia dividendos', fmtPct(div.ar, 1), `Retorno anormal médio em ${div.meses} meses; p ${fmtP(div.p)} no t clássico e ${fmtP(div.p_bmp)} no BMP`),
    tile('Eventos no estudo', fmtInt(unicos), 'Datas conferidas em fontes primárias'),
    tile('Categorias com efeito nos dois testes', fmtInt(fortes), `de ${E.resumo.filter((r) => r.meses >= 2).length} categorias testáveis (2 meses ou mais)`)));
  const resT = res.filter((r) => r.meses >= 2), catsG = [...new Set(resT.map((r) => r.categoria))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const emps = estado.evEmpresa === 'Ambas' ? ['Petrobras', 'Prio'] : [estado.evEmpresa];
  const g1 = cartaoGrafico('g-ev', 'Retorno anormal médio no mês do evento, no sentido esperado', 'Positivo = a ação reagiu como o esperado, além do que os fatores explicam. Cada mês conta uma vez por categoria.', Math.max(200, 60 + catsG.length * emps.length * 26));
  const tR = el('div', { class: 'cartao' }, cabecalho('Teste por categoria', 'O t clássico usa o erro do modelo; o BMP usa a dispersão dos próprios eventos. Só é efeito quando os dois dão p < 0,05. CAR = mês do evento e os 2 seguintes.'),
    tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'categoria', rotulo: 'Categoria' }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'ar', rotulo: 'Anormal', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'p', rotulo: 'p clássico', num: true, fmt: fmtP }, { campo: 'p_bmp', rotulo: 'p BMP', num: true, fmt: fmtP }, { campo: 'car3', rotulo: 'CAR 3 meses', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'leitura', rotulo: 'Leitura' }], res, { alta: true }));
  p.append(el('div', { class: 'linha dupla' }, g1, tR));
  if (catsG.length) {
    desenhar(g1, { type: 'bar', data: { labels: catsG, datasets: emps.map((e) => ({ label: e, backgroundColor: corEmpresa(e, C), borderColor: corEmpresa(e, C), maxBarThickness: 18, data: catsG.map((c) => { const r = resT.find((x) => x.empresa === e && x.categoria === c); return r ? r.ar : null; }) })) },
      options: opcoesBarrasH(C, (v) => fmtN(v * 100, 0) + '%', { legenda: emps.length > 1, padEsq: 44 }) }, (v) => (v == null ? '—' : fmtPct(v, 1)), { rotuloX: 'Categoria' });
  } else g1.querySelector('.area').replaceChildren(el('p', { class: 'cartao-sub', text: 'Nenhuma categoria testável com este filtro.' }));
  const tS = el('div', { class: 'cartao' }, cabecalho('Sem sinal esperado: o mês foi mais agitado que o normal?', 'Choques do petróleo e de mercado já estão nos fatores. Razão acima de 1 = mês mais volátil que o normal.'),
    tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'categoria', rotulo: 'Categoria' }, { campo: 'motivo', rotulo: 'Por que sem sinal' }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'razao', rotulo: 'Variância ÷ normal', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'p', rotulo: 'p', num: true, fmt: fmtP }], sem));
  const tL = el('div', { class: 'cartao' }, cabecalho('Os eventos, um a um', 'Mês = primeiro pregão que absorve a notícia. O sinal esperado foi definido antes de olhar o preço e não muda pela reação.'),
    tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'data', rotulo: 'Data', fmt: dataTxt }, { campo: 'categoria', rotulo: 'Categoria' }, { campo: 'sinal', rotulo: 'Sinal esperado' }, { campo: 'ar', rotulo: 'Anormal', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'evento', rotulo: 'Evento' }], lis, { alta: true }));
  p.append(el('div', { class: 'linha dupla' }, tS, tL));
}

// ------------------------------------------------------------------ Brent × inflação
const REGIMES = ['1. Preço administrado (até set/2016)', '2. Paridade de importação (out/2016–mai/2023)', '3. Nova política (desde jun/2023)', 'Todo o período'];
const CURTO = { [REGIMES[0]]: 'Administrado', [REGIMES[1]]: 'Paridade (PPI)', [REGIMES[2]]: 'Nova política', [REGIMES[3]]: 'Todo o período' };
function renderInflacao() {
  const p = document.getElementById('p-inflacao'); p.replaceChildren();
  const C = cores(), I = D.inflacao, Z = I.resumo;
  p.append(el('div', { class: 'grade-tiles' },
    tile('Brent em reais, à vista', fmtRS(Z.brent_rs, 0), `Média de ${Z.mes} até agora (${Z.pregoes} ${Z.pregoes === 1 ? 'pregão' : 'pregões'}). Pelo futuro de ${D.data_precos}: ${fmtRS(H.brent_rs, 0)}.`),
    tile('Brent em reais desde jan/2000', fmtSinal(Z.brent_acum, 0) + '%', `IPCA no mesmo período: ${fmtSinal(Z.ipca_acum, 0)}%`)));
  const m = I.mensal, lab = m.map((x) => x.m), ult = lab[lab.length - 1], titMes = (l) => mesTxt(l) + (l === ult ? ' (parcial)' : '');
  const g2 = cartaoGrafico('g-base100i', 'Brent em reais × IPCA (jan/2000 = 100)', 'Comparação em um eixo só, sem corrigir o Brent pela inflação.');
  const g3 = cartaoGrafico('g-bomba', `Bomba × Brent em reais, semana a semana (${I.bomba.base} = 100)`, 'Preço médio Brasil (ANP). Na mesma base, dá para ver o posto seguindo o petróleo com atraso.');
  p.append(el('div', { class: 'linha' }, g2, g3));
  desenhar(g2, { type: 'line', data: { labels: lab, datasets: [serie('Brent em R$', m.map((x) => x.b100), C.brent, { rotuloFinal: 'Brent em R$' }), serie('IPCA', m.map((x) => x.i100), C.s[0], { rotuloFinal: 'IPCA' })] },
    options: opcoesLinha(lab, (v) => fmtN(v, 0), { rotulosFinais: true, padDir: 86, zero: true }) }, (v) => fmtN(v, 0), { mira: true, titulo: titMes, rotuloX: 'Mês', rotulos: lab.map(titMes) });
  const b = I.bomba.linhas, lb = b.map((x) => x.d);
  const fmtB = (v, ds, i) => (v == null ? '—' : fmtN(v, 0) + (ds.reais ? ' (' + ds.reais[i] + ')' : ''));
  desenhar(g3, { type: 'line', data: { labels: lb, datasets: [
      serie('Gasolina', b.map((x) => x.gas), C.s[0], { rotuloFinal: 'Gasolina', reais: b.map((x) => 'R$ ' + fmtN(x.gas_rs, 2) + '/l') }),
      serie('Diesel S10', b.map((x) => x.s10), C.s[1], { rotuloFinal: 'Diesel S10', reais: b.map((x) => 'R$ ' + fmtN(x.s10_rs, 2) + '/l') }),
      serie('Brent em R$', b.map((x) => x.brent), C.brent, { rotuloFinal: 'Brent em R$', reais: b.map((x) => 'R$ ' + fmtN(x.brent_rs, 0) + '/barril') })] },
    options: opcoesLinha(lb, (v) => fmtN(v, 0), { rotulosFinais: true, padDir: 84, eixoX: eixoSemanal(lb, C) }) }, fmtB, { mira: true, titulo: (l) => 'Semana até ' + dataTxt(l), rotuloX: 'Semana', rotulos: lb.map(dataTxt) });
  p.append(el('h2', { class: 'secao', text: 'Repasse: quanto da alta do Brent em reais chega aos preços, e em quanto tempo' }));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Todas as séries e regimes de preço', 'Efeito acumulado de uma alta de 10% no Brent em reais: até 6 meses no IPCA, até 12 semanas na bomba. Meses de mudança de imposto entram com dummy. "Não significativo" = repasse total com p acima de 0,10.'),
    tabelaOrdenavel([{ campo: 'serie', rotulo: 'Série' }, { campo: 'regime', rotulo: 'Regime de preço da Petrobras' }, { campo: 'ef10', rotulo: 'Efeito de +10% no Brent', num: true, fmt: (v) => fmtSinal(v, 2) + '%' }, { campo: 'p', rotulo: 'p', num: true, fmt: fmtP }, { campo: 'maior', rotulo: 'Maior efeito' }, { campo: 'metade', rotulo: 'Metade do repasse' }, { campo: 'obs', rotulo: 'Observações', num: true, fmt: fmtInt }], I.repasse_resumo)));
  const sel = el('select');
  I.series.forEach((s) => sel.append(el('option', { value: s, text: s })));
  sel.value = estado.serie;
  p.append(el('div', { class: 'filtros' }, el('label', { class: 'filtro' }, 'Série do gráfico e da leitura abaixo', sel)));
  const g4 = cartaoGrafico('g-repasse', '', '', 320), leitura = el('div', { class: 'ler' });
  p.append(el('div', { class: 'linha dupla' }, g4, leitura));
  const desenharRepasse = () => {
    const ls = I.repasse.filter((r) => r.serie === estado.serie), ks = [...new Set(ls.map((r) => r.k))].sort((a, b) => a - b), labs = ks.map(String);
    const unid = ls.length ? ls[0].unid : 'semanas', um = unid === 'meses' ? 'mês' : 'semana';
    g4.querySelector('h3').textContent = `${estado.serie}: quanto de +10% no Brent em reais já chegou ao preço`;
    g4.querySelector('.cartao-sub').textContent = `Efeito acumulado até cada defasagem (${unid} depois da alta), por regime de preço da Petrobras.`;
    const dss = REGIMES.filter((rg) => ls.some((r) => r.regime === rg)).map((rg) => { const dados = ks.map((k) => { const r = ls.find((x) => x.regime === rg && x.k === k); return r ? r.ef : null; });
      return rg === 'Todo o período' ? serie(rg, dados, C.ref, { borderDash: [6, 4], borderWidth: 1.5, rotuloFinal: CURTO[rg] }) : serie(rg, dados, C.s[REGIMES.indexOf(rg)], { rotuloFinal: CURTO[rg] }); });
    const titulo = (l) => (l === '0' ? (unid === 'meses' ? 'No mesmo mês da alta' : 'Na mesma semana da alta') : `${l} ${l === '1' ? um : unid} depois`);
    desenhar(g4, { type: 'line', data: { labels: labs, datasets: dss }, options: opcoesLinha(labs, (v) => fmtN(v, 1) + '%', { rotulosFinais: true, padDir: 104, zero: true, tituloY: '% acumulado no preço',
        eixoX: { grid: { display: false }, border: { color: C.base }, ticks: { color: C.texto3 }, title: { display: true, text: `${unid} depois da alta do Brent`, color: C.texto3 } } }) },
      (v) => (v == null ? '—' : fmtSinal(v, 2) + '%'), { mira: true, titulo, rotuloX: unid + ' depois', rotulos: labs.map(titulo) });
    const res = I.repasse_resumo.filter((r) => r.serie === estado.serie), lista = el('ul');
    REGIMES.forEach((rg) => { const r = res.find((x) => x.regime === rg); if (!r) return; const q = r.maior === 'não significativo' ? 'repasse não significativo' : `maior efeito ${r.maior}; metade do repasse ${r.metade}`;
      lista.append(el('li', { text: `${CURTO[rg]}: ${fmtSinal(r.ef10, 2)}% no total (p ${fmtP(r.p)}); ${q}.` })); });
    leitura.replaceChildren(el('h3', { text: 'Leitura da série escolhida' }), lista,
      el('p', { text: 'Os três regimes são as fases da política de preços da Petrobras: até set/2016 o governo segurava os preços; de out/2016 a mai/2023 a empresa seguia a paridade de importação; desde jun/2023 ela suaviza os repasses.' }),
      el('p', { text: 'O posto demora porque o reajuste passa pela refinaria, pela distribuidora e pelos estoques do posto, e a Petrobras reajusta em degraus.' }));
  };
  sel.onchange = () => { estado.serie = sel.value; desenharRepasse(); };
  desenharRepasse();
}

// ------------------------------------------------------------------ Resultados
function renderResultados() {
  const p = document.getElementById('p-resultados'); p.replaceChildren();
  const C = cores(), e = estado.res, tk = V[e].ticker, tudo = D.resultados[e];
  p.append(el('div', { class: 'aviso', text: `Só informação: o veredito não depende destes números. Último trimestre na base: ${D.ultimo_tri[e]}. EBITDA e margem ficam de fora da leitura, pela regra da commodity.` }));
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Empresa', segmentoEmpresa(e, (v) => { estado.res = v; renderResultados(); })),
    el('div', { class: 'filtro' }, 'Desde', segmentoEmpresa(estado.resDesde, (v) => { estado.resDesde = v; renderResultados(); }, [['2011', '2011'], ['2016', '2016'], ['2019', '2019'], ['2022', '2022']]))));
  const ano = (x) => 2000 + +x.p.slice(-2), ls = tudo.filter((x) => ano(x) >= +estado.resDesde), lab = ls.map((x) => x.p), u = tudo[tudo.length - 1];
  const bi = (x) => (x == null ? null : x / 1000), fB = (v) => (v == null ? '—' : 'R$ ' + fmtN(v, 1) + ' bi');
  p.append(el('div', { class: 'grade-tiles' },
    tile('Lucro em 12 meses', fB(bi(u.lucro)), `Até ${u.p}`), tile('Caixa das operações em 12 meses', fB(bi(u.fco)), `Investimento: ${fB(bi(u.capex))}`),
    tile('Dívida líquida', fB(bi(u.divliq)), `Valor de mercado no fim do trimestre: ${fB(bi(u.vm))}`), tile('Produção', `${fmtN(u.prod, 0)} mil boe/d`, `Custo de extração: ${fmtUS(u.lifting)} por barril`)));
  const op = (f) => opcoesLinha(lab, f, { rotulosFinais: true, padDir: 84, eixoX: eixoAnos(lab, C) });
  const g1 = cartaoGrafico('g-res1', `${tk}: receita e lucro em 12 meses`, 'Em R$ bilhões, soma dos últimos 4 trimestres.');
  const g2 = cartaoGrafico('g-res2', `${tk}: caixa, investimento e dividendos em 12 meses`, 'Em R$ bilhões, soma dos últimos 4 trimestres.');
  const g3 = cartaoGrafico('g-res3', `${tk}: dívida líquida`, 'Em R$ bilhões, no fim do trimestre.');
  const g4 = cartaoGrafico('g-res4', `${tk}: por barril`, e === 'Prio' ? 'Em US$. Custo de extração, preço de venda e Brent médio do trimestre.' : 'Em US$. Custo de extração e Brent médio do trimestre.');
  const g5 = cartaoGrafico('g-res5', `${tk}: Brent de equilíbrio estimado`, 'Estimativa própria em 12 meses: Brent médio menos o fluxo de caixa livre por barril. É o Brent em que o caixa livre zeraria.');
  p.append(el('div', { class: 'linha' }, g1, g2, g3));
  p.append(el('div', { class: 'linha' }, g4, g5));
  desenhar(g1, { type: 'line', data: { labels: lab, datasets: [serie('Receita', ls.map((x) => bi(x.receita)), C.s[0], { rotuloFinal: 'Receita' }), serie('Lucro', ls.map((x) => bi(x.lucro)), C.s[1], { rotuloFinal: 'Lucro' })] }, options: op((v) => fmtN(v, 0)) }, fB, { mira: true, rotuloX: 'Trimestre' });
  desenhar(g2, { type: 'line', data: { labels: lab, datasets: [serie('Caixa das operações', ls.map((x) => bi(x.fco)), C.s[0], { rotuloFinal: 'Caixa' }), serie('Investimento', ls.map((x) => bi(x.capex)), C.s[1], { rotuloFinal: 'Investimento' }), serie('Dividendos', ls.map((x) => bi(x.div)), C.s[2], { rotuloFinal: 'Dividendos' })] }, options: op((v) => fmtN(v, 0)) }, fB, { mira: true, rotuloX: 'Trimestre' });
  desenhar(g3, { type: 'line', data: { labels: lab, datasets: [serie('Dívida líquida', ls.map((x) => bi(x.divliq)), corEmpresa(e, C))] }, options: opcoesLinha(lab, (v) => fmtN(v, 0), { legenda: false, zero: true, eixoX: eixoAnos(lab, C) }) }, fB, { mira: true, rotuloX: 'Trimestre' });
  const temPreco = e === 'Prio';   // Petrobras: sem preço de venda, a pedido (não há dado comparável depois do 4T22)
  desenhar(g4, { type: 'line', data: { labels: lab, datasets: [serie('Brent', ls.map((x) => x.brent), C.brent, { rotuloFinal: 'Brent' }), ...(temPreco ? [serie('Preço de venda', ls.map((x) => x.preco), C.s[0], { rotuloFinal: 'Preço' })] : []), serie('Custo de extração', ls.map((x) => x.lifting), C.s[1], { rotuloFinal: 'Custo' })] }, options: op((v) => 'US$ ' + fmtN(v, 0)) }, (v) => fmtUS(v), { mira: true, rotuloX: 'Trimestre' });
  desenhar(g5, { type: 'line', data: { labels: lab, datasets: [serie('Brent médio em 12 meses', ls.map((x) => x.brent12), C.brent, { rotuloFinal: 'Brent' }), serie('Equilíbrio de caixa', ls.map((x) => x.be), C.s[0], { rotuloFinal: 'Caixa' }), serie('Equilíbrio com dividendos', ls.map((x) => x.be_div), C.s[1], { rotuloFinal: 'c/ dividendos' })] }, options: op((v) => 'US$ ' + fmtN(v, 0)) }, (v) => fmtUS(v), { mira: true, rotuloX: 'Trimestre' });
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Break-even divulgado pelas empresas', 'Números oficiais, de documentos diferentes: cada empresa mede de um jeito, então não comparar diretamente com a estimativa acima.'),
    tabelaOrdenavel([{ campo: 'empresa', rotulo: 'Empresa' }, { campo: 'ano', rotulo: 'Divulgado em', fmt: (v) => String(v) }, { campo: 'horizonte', rotulo: 'Horizonte' }, { campo: 'be', rotulo: 'US$ por barril', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'mede', rotulo: 'O que mede' }], D.break_even_oficial)));
}

// ------------------------------------------------------------------ Como foi feito
function renderMetodo() {
  const p = document.getElementById('p-metodo'); p.replaceChildren();
  p.append(el('div', { class: 'metodo' },
    caixaLer('A regra do veredito', [[
      `CARA: Brent de ${fmtUS(R.corte, 0)} ou mais. O corte foi testado nos dados e está em R\\testar_regra_brent.R.`,
      `BARATA: Brent abaixo de ${fmtUS(R.piso, 1)} e a ação 30% ou mais abaixo do pico de 24 meses.`, 'NEUTRA: qualquer outro caso.',
      `Preço médio de ${fmtFaixa()}: as medianas dos meses dos últimos 10 e 20 anos, recalculadas a cada atualização.`,
      'Brent em dólar nominal, sem correção pela inflação. EBITDA, margem e múltiplos ficam só como informação.']], null, false),
    caixaLer('Dados', [[
      'Ações e Brent futuro: Yahoo Finance (PETR4, PRIO3, BZ=F), com proventos quando indicado.', 'Brent à vista: FRED/EIA. Dólar PTAX, Selic e IPCA: Banco Central. IPCA por item: IBGE.',
      'Balanços: CVM (ITR e DFP), releases da Petrobras e Guia de Valuation da Prio. Bomba e produção: ANP.', 'Juros: Tesouro Direto e FRED. Risco: Ipeadata (EMBI+). Petroleiras do mundo: Yahoo Finance.',
      'Eventos: datas conferidas em fontes primárias (CVM, fatos relevantes, imprensa).']], null, false),
    caixaLer('Como os testes foram feitos', [[
      'Compras: último pregão de cada mês; retorno em 12 e 24 meses (252 e 504 pregões), com proventos.', 'Janelas independentes: contagem de períodos que não se sobrepõem, para não superestimar a evidência.',
      'Modelo de fatores: retorno mensal em dólar contra 10 candidatos, com eliminação passo a passo e erro-padrão robusto (Newey-West). Teste fora da amostra refeito só com os dados até 2022.',
      'Eventos: retorno anormal = resíduo do modelo; sinal esperado definido antes de olhar o preço.', 'Prêmio: efeito no preço do Brent voltar ao teto do preço médio, pelos betas mensal e de 12 meses.']], null, false),
    caixaLer('Cuidados na leitura', [[
      `As contas de "Brent no ciclo" usam só meses completos; ${D.brent.parcial ? mesTxt(D.brent.parcial) + ' aparece no gráfico como mês parcial.' : 'não há mês parcial agora.'}`,
      'O Brent à vista é publicado com atraso, e o futuro é o preço que decide o veredito. Em contratos perto do vencimento os dois podem ficar bem diferentes.',
      'Poucos episódios independentes: os intervalos de confiança são largos.', 'Os dados do Brent em reais aqui não são corrigidos pelo IPCA; o Power BI ainda tem essa versão corrigida.',
      'Só entram empresas que existem hoje (viés de sobrevivência). Relação estatística não é causa.', 'Não é recomendação de investimento.']], null, false)));
  p.append(el('h2', { class: 'secao', text: 'Roteiro para repetir a análise' }));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'passo', rotulo: 'Passo' }, { campo: 'pergunta', rotulo: 'Pergunta' }, { campo: 'como', rotulo: 'Como medir' }, { campo: 'regra', rotulo: 'Regra de leitura' }], D.caro.roteiro, { livre: true })));
}

// ------------------------------------------------------------------ abas e início
let abaAtual = 'veredito', feitas = {};
const RENDER = { veredito: renderVeredito, brent: renderBrent, premio: renderPremio, fatores: renderFatores, eventos: renderEventos, inflacao: renderInflacao, resultados: renderResultados, metodo: renderMetodo };
function mostrar(aba) {
  abaAtual = aba;
  document.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.aba === aba ? 'true' : 'false'));
  document.querySelectorAll('.painel').forEach((s) => { s.hidden = s.id !== 'p-' + aba; });
  if (!feitas[aba]) { RENDER[aba](); feitas[aba] = true; }
  try { history.replaceState(null, '', '#' + aba); } catch (e) { /* arquivo aberto em modo restrito: segue sem o endereço */ }
}
document.querySelectorAll('[role="tab"]').forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.aba)));
document.getElementById('meta').textContent = `Preços de ${D.data_precos} · balanços até ${D.ultimo_tri.Petrobras} · gerado em ${D.gerado}`;
if (!TEM_CHART) document.getElementById('aviso-chart').hidden = false;
iniciarTema(() => { feitas = {}; mostrar(abaAtual); });
const abaInicial = (location.hash || '').replace('#', '');
mostrar(Object.prototype.hasOwnProperty.call(RENDER, abaInicial) ? abaInicial : 'veredito');
