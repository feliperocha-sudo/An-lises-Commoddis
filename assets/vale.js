'use strict';
// Seção da Vale. Dados em dados/vale.js, gerados a partir dos Excel do projeto.
const D = window.DADOS;
const R = D.regra, H = D.hoje, V = D.vale, T = D.teste;
const ANO_INI = 2006, ANO_FIM = +D.data_precos.slice(-4);
const estado = { de: ANO_INI, ate: ANO_FIM, indicador: D.indicadores[0].nome, indTipo: 'Trimestral', ativo: 'Minério', sensTipo: 'Anual' };
const DATA_LEITURA = `Leitura escrita em 06/11/2026, com preços de 05/11/2026. Os números vêm dos dados; a interpretação não muda sozinha.`;
const fmtFaixa = () => `US$ ${fmtN(R.piso, 1)}–${fmtN(R.teto, 1)}`;

// ------------------------------------------------------------------ período: um só para todos os gráficos; cada aba usa os anos que tem de dados
const anoDoRotulo = (p) => (/^\d{4}/.test(p) ? +p.slice(0, 4) : 2000 + +p.slice(-2));   // "2024", "2024-06", "1T24" e "UDM 3T26"
const periodoDe = (anoMin) => ({ de: Math.max(estado.de, anoMin), ate: Math.max(estado.ate, anoMin) });
const noPeriodo = (per, rotulo) => { const a = anoDoRotulo(rotulo); return a >= per.de && a <= per.ate; };
const passoEixo = (n) => (n > 150 ? 4 : n > 60 ? 2 : 1);
function trocarPeriodo(de, ate) { estado.de = de; estado.ate = ate; feitas = {}; mostrar(abaAtual); }
function filtroPeriodo(anoMin) {
  const per = periodoDe(anoMin), anos = Array.from({ length: ANO_FIM - anoMin + 1 }, (_, i) => anoMin + i);
  const sel = (rotulo, atual, aoTrocar) => {
    const s = el('select', { 'aria-label': `${rotulo}: ano`, style: 'min-width:96px' }, ...anos.map((a) => el('option', { value: a, selected: a === atual, text: a })));
    s.onchange = () => aoTrocar(+s.value);
    return el('label', { class: 'filtro' }, rotulo, s);
  };
  const atalhos = [[`${anoMin}-${ANO_FIM}`, 'Tudo'], ...[2010, 2016, 2020].filter((a) => a > anoMin).map((a) => [`${a}-${ANO_FIM}`, `Desde ${a}`])];
  return [sel('De', per.de, (v) => trocarPeriodo(v, Math.max(v, per.ate))), sel('Até', per.ate, (v) => trocarPeriodo(Math.min(per.de, v), v)),
    el('div', { class: 'filtro' }, 'Atalhos', segmentoEmpresa(`${per.de}-${per.ate}`, (v) => { const [d, a] = v.split('-').map(Number); trocarPeriodo(d === anoMin ? ANO_INI : d, a); }, atalhos))];
}

// ------------------------------------------------------------------ Veredito
function reguaMinerio() {
  const lo = 40, hi = 180, pos = (v) => Math.min(100, Math.max(0, (v - lo) / (hi - lo) * 100));
  const zona = (de, ate, cor, t) => el('div', { class: 'regua-zona', style: `width:${pos(ate) - pos(de)}%;background:var(${cor})`, text: t || '' });
  return el('div', { class: 'regua', role: 'img', 'aria-label': `Minério de ${fmtUS(H.minerio)} na régua: abaixo de ${fmtUS(R.piso, 1)} BARATA, se a ação estiver no lixo; até ${fmtUS(R.teto, 1)} na média; até ${fmtUS(R.corte, 0)} neutra; de ${fmtUS(R.corte, 0)} para cima, CARA.` },
    zona(lo, R.piso, '--zona-barata', 'BARATA'), zona(R.piso, R.teto, '--zona-media'), zona(R.teto, R.corte, '--zona-neutra', 'NEUTRA'), zona(R.corte, hi, '--zona-cara', 'CARA'),
    el('div', { class: 'regua-marca cima', style: `left:${pos(H.minerio)}%` }, el('span', { text: `Hoje ${fmtUS(H.minerio)}` })),
    el('div', { class: 'regua-corte', style: `left:${pos((R.piso + R.teto) / 2)}%`, text: `Preço médio ${fmtFaixa()}` }),
    el('div', { class: 'regua-corte', style: `left:${pos(R.corte)}%`, text: `Corte ${fmtUS(R.corte, 0)}` }));
}
function cartaoVeredito() {
  return el('div', { class: 'veredito' },
    el('div', { class: 'veredito-topo' },
      el('div', { class: 'veredito-nome' }, el('span', { class: 'ponto', style: 'background:' + cores().petrobras }), 'Vale (VALE3)'), selo(V.ver)),
    el('div', { class: 'veredito-preco', text: fmtRS(V.preco_rs) }),   // a cotação da ação em reais, como na B3 (pedido do analista, 06/11); a análise segue em dólar
    el('p', { class: 'cartao-sub', style: 'margin:-4px 0 8px', text: `${fmtUS(V.preco)} com o dólar do dia (R$ ${fmtN(V.ptax, 2)}). Pico, "lixo" e retornos são medidos em dólar.` }),
    el('ul', {},
      el('li', {}, el('span', { text: 'Queda desde o pico de 24 meses, em dólar' }), el('strong', { text: fmtPct(V.queda_pico, 1) })),
      el('li', {}, el('span', { text: 'Preço de "lixo" (30% abaixo do pico)' }), el('strong', { text: `${fmtRS(V.preco_lixo_rs)} (${fmtPct(V.falta_lixo, 1)})` })),
      el('li', {}, el('span', { text: 'Alta em 12 meses, em dólar, com proventos' }), el('strong', { text: fmtPct(V.alta12) })),
      el('li', {}, el('span', { text: 'Distância da média de 200 pregões' }), el('strong', { text: fmtPct(V.acima200) }))));
}
function renderVeredito() {
  const p = document.getElementById('p-veredito'); p.replaceChildren();
  p.append(el('div', { class: 'linha dupla', style: 'margin-bottom:16px' }, cartaoVeredito(),
    el('div', { class: 'cartao' }, cabecalho('Onde o minério está na régua', `A regra olha o minério de 62% de ferro no dia dos preços (${D.data_precos}), em dólar nominal. Corte de CARA: ${fmtUS(R.corte, 0)}, escolhido pelo analista depois do teste.`), reguaMinerio())));
  const dif = R.corte / H.minerio - 1;
  p.append(el('div', { class: 'grade-tiles' },
    H.minerio >= R.corte ? tile('Para sair de CARA', `Minério < ${fmtUS(R.corte, 0)}`, `${fmtPct(dif, 1)} do minério de hoje.`)
      : tile('Para virar CARA', `Minério ≥ ${fmtUS(R.corte, 0)}`, `${fmtPct(dif, 1)} do minério de hoje.`),
    V.ver === 'BARATA' ? tile('Para deixar de ser BARATA', `VALE3 > ${fmtRS(V.preco_lixo_rs)}`, `${fmtUS(V.preco_lixo)} com o dólar de hoje; ${fmtPct(V.falta_lixo, 1)} do preço de hoje, ou minério de ${fmtUS(R.piso, 1)} ou mais (${fmtPct(R.piso / H.minerio - 1, 1)}).`)
      : H.minerio < R.piso ? tile('Para virar BARATA', `VALE3 ≤ ${fmtRS(V.preco_lixo_rs)}`, `${fmtUS(V.preco_lixo)} com o dólar de hoje; ${fmtPct(V.falta_lixo, 1)} do preço de hoje, com o minério abaixo de ${fmtUS(R.piso, 1)}.`)
      : tile('Para virar BARATA', `Minério < ${fmtUS(R.piso, 1)}`, `${fmtPct(R.piso / H.minerio - 1, 1)} do minério de hoje, e a ação no "lixo": até ${fmtRS(V.preco_lixo_rs)} com o dólar de hoje.`),
    tile('Minério contra o preço médio', fmtPct(H.minerio / R.piso - 1, 1), `Contra o piso de ${fmtUS(R.piso, 1)}; ${fmtPct(V.meses_minerio_maior, 0, false)} dos meses desde 2006 tiveram minério mais alto que hoje`)));

  const par = (n) => T.parecido.find((x) => x.situacao === n) || {};
  const pc = D.caro.pontos.find((x) => x.ponto === R.corte) || {}, zona = (f) => T.zonas.find((z) => z.faixa === f) || {};
  const freq = T.melhor_corte.filter((x) => x.corte >= 90 && x.corte <= 110).reduce((s, x) => s + x.freq, 0);
  const ruim14 = T.meses_parecidos.filter((x) => x.mes.startsWith('2014')), bom19 = T.meses_parecidos.filter((x) => x.mes >= '2019' && x.mes < '2021');
  const G = T.ganhos_corte, N = T.perdas_neutra, faixaG = G.length ? `de ${fmtPct(Math.min(...G.map((x) => x.r24)))} a ${fmtPct(Math.max(...G.map((x) => x.r24)))}` : '—';
  const con = D.caro.conclusao;
  p.append(el('div', { class: 'linha dupla' },
    caixaLer('Conclusão', [con[1], con[5], con[con.length - 2], con[con.length - 1], 'Este texto sai das regras do Excel "Caro ou barato - VALE3" e muda sozinho com os preços.'], null, false),
    caixaLer('Onde a regra é mais fraca', [[
      `O corte de ${fmtUS(R.corte, 0)} foi escolhido olhando esta mesma história e é uma região, não um número exato: os dados apontam de US$ 125 a 140. Ao reamostrar a história, a maior virada do retorno fica antes, perto do preço médio: entre US$ 90 e 110 em ${fmtPct(freq, 0, false)} das vezes.`,
      (() => { const zr = (rec) => (T.zonas_recortes || []).find((z) => z.recorte === rec && z.faixa === 'teto ao corte') || {};   // revisão de 06/11: a perda da faixa neutra vem de 2010–13
        return `A faixa neutra (do teto ao corte) só perdeu por causa das compras de 2010–13: na história toda, ${fmtPct(zona('teto ao corte').r24)} em 24 meses (${fmtPct(zona('teto ao corte').ganhou, 0, false)} ganharam); sem 2010–13, ${fmtPct(zr('sem 2010–13').r24)} (${fmtPct(zr('sem 2010–13').ganhou, 0, false)}); desde 2014, ${fmtPct(zr('desde 2014').r24)} (${fmtPct(zr('desde 2014').ganhou, 0, false)}).`; })(),
      `A perda forte vem das compras de 2010–13. Sem elas, de ${fmtUS(R.corte, 0)} para cima a mediana em 24 meses fica em ${fmtPct(pc.r24_sem, 1)}; desde 2014, em ${fmtPct(pc.r24_d14, 1)}, com só ${fmtInt(pc.n_d14)} meses de compra. Ainda assim, ${fmtPct(pc.perdeu_sem, 0, false)} e ${fmtPct(pc.perdeu_d14, 0, false)} das compras perderam.`,
      `São poucos episódios: ${fmtInt(pc.janelas)} janelas independentes de ${fmtUS(R.corte, 0)} para cima. E há exceções: desde 2020, ${fmtInt(G.length)} compras nessa faixa ganharam (${faixaG}), com ajuda dos dividendos.`,
      `A faixa neutra também teve perdas sem aviso: comprar de 12/2022 a 03/2023, com minério de ${fmtUS(N.ore_min, 0)} a ${N.ore_max.toFixed(0)}, deu de ${fmtPct(N.r_min)} a ${fmtPct(N.r_max)} em 24 meses.`,
      `O corte é um número fixo em dólar nominal: vale revisar quando os custos mudarem de patamar. O break-even de caixa está em ${fmtUS(D.margem.niveis.find((x) => x.chave === 'break_even').custo, 1)} (${D.margem.tri}).`,
      `${V.ver === 'BARATA' ? 'O veredito de hoje está na faixa mais fraca da regra. ' : ''}BARATA é forte com o minério abaixo de US$ 80 (${fmtPct(par('minério abaixo de US$ 80, ação no lixo').r24)}, mas só ${fmtInt(par('minério abaixo de US$ 80, ação no lixo').janelas)} janelas independentes). De US$ 80 ao piso, com a ação no lixo, foi ${fmtPct(par('minério de US$ 80 ao piso, ação no lixo').r24)}. Em meses parecidos com hoje, os de 2014 deram de ${fmtPct(Math.min(...ruim14.map((x) => x.r24)))} a ${fmtPct(Math.max(...ruim14.map((x) => x.r24)))}, porque o minério seguiu caindo; os de 2019–20, de ${fmtPct(Math.min(...bom19.map((x) => x.r24)))} a ${fmtPct(Math.max(...bom19.map((x) => x.r24)))}.`,
      `Em dólar, parte da queda vem do câmbio: desde o pico de ${dataTxt(V.pico_data)}, a cotação do dólar subiu ${fmtPct(V.cotacao_desde_pico, 1, false)}. O veredito pode mudar sem a ação se mexer na bolsa.`,
      `Crise da própria empresa a regra não vê: em Brumadinho a ação caiu com o minério subindo.`]], DATA_LEITURA, false)));

  p.append(el('h2', { class: 'secao', text: 'Placar: cada lente da análise' }));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'lente', rotulo: 'Lente' }, { campo: 'indicador', rotulo: 'Indicador' }, { campo: 'hoje', rotulo: 'Hoje' },
    { campo: 'ref', rotulo: 'Referência' }, { campo: 'leitura', rotulo: 'Leitura (regra fixa)' }], D.caro.placar, { livre: true, destaque: (l) => l.lente === 'VEREDITO' })));
}

// ------------------------------------------------------------------ Minério no ciclo: contas simples rodam na página
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
function estatSerie(v) {
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
function renderMinerio() {
  const p = document.getElementById('p-minerio'); p.replaceChildren();
  const C = cores(), per = periodoDe(ANO_INI), todos = D.minerio.mensal.filter((x) => noPeriodo(per, x.m));
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(ANO_INI)));
  const E = estatSerie(todos.map((x) => x.v)), z = (H.minerio - E.media) / E.dp;
  p.append(el('div', { class: 'grade-tiles' },
    tile('Minério hoje', fmtUS(H.minerio), `Percentil ${fmtN(E.pct(H.minerio) * 100, 0)}% dos meses do período`),
    tile('Média dos meses', fmtUS(E.media, 1), `Mediana ${fmtUS(E.mediana, 1)}; ${fmtInt(E.n)} meses completos`),
    tile('Distância da média', `${fmtSinal(z, 2)} desvios`, `1 desvio = ${fmtUS(E.dp, 1)}`),
    tile('Volta à média?', fmtN(E.tAdf, 2), `Teste ADF(1): ${E.sig}. Valor crítico a 5%: −2,87`),
    tile('Meia-vida do desvio', E.meiaVida ? `${fmtN(E.meiaVida, 0)} meses` : '—', 'Tempo para o desvio cair à metade, pelo modelo mais simples')));
  const lab = todos.map((x) => x.m), n = lab.length, temHoje = lab[n - 1] === D.minerio.ultimo_mes;
  const g1 = cartaoGrafico('g-minerio', 'Minério de ferro em dólar nominal', `Média do mês, sem correção por inflação. Linhas: corte de CARA em ${fmtUS(R.corte, 0)} e preço médio de ${fmtFaixa()}.`, 360);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g1));
  desenhar(g1, { type: 'line', data: { labels: lab, datasets: [
      serie('Minério', todos.map((x) => x.v), C.brent, { semRotulo: true }),
      ...(temHoje ? [serie(`Hoje (${fmtUS(H.minerio)})`, todos.map((x, i) => (i === n - 1 ? H.minerio : null)), C.texto, { showLine: false, pointRadius: 5, pointHoverRadius: 6, pointBorderWidth: 2, semRotulo: true, semTabela: true })] : []),
      referencia(`Corte de CARA (${fmtUS(R.corte, 0)})`, R.corte, n, C.cara, [6, 4]),
      referencia(`Teto do preço médio (${fmtUS(R.teto, 1)})`, R.teto, n, C.s[0], []),
      referencia(`Piso do preço médio (${fmtUS(R.piso, 1)})`, R.piso, n, C.s[0], [2, 3])] },
    options: opcoesLinha(lab, (v) => 'US$ ' + fmtN(v, 0), { zero: true, passo: passoEixo(n) }) },
    (v) => fmtUS(v), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lab.map(mesTxt) });

  const qs = D.quedas.filter((x) => noPeriodo(per, x.m)), lq = qs.map((x) => x.m), nq = lq.length;
  const g3 = cartaoGrafico('g-lixo', 'A VALE3 contra o pico de 24 meses', 'Último pregão de cada mês, preço ajustado por proventos. "No lixo" é estar 30% ou mais abaixo do pico.', 300);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g3));
  desenhar(g3, { type: 'line', data: { labels: lq, datasets: [serie('Distância do pico', qs.map((x) => x.q), C.petrobras, { semRotulo: true }),
      referencia('Lixo (−30%)', -0.3, nq, C.brent, [6, 4])] },
    options: opcoesLinha(lq, (v) => fmtPct(v, 0), { passo: passoEixo(nq) }) }, (v) => fmtPct(v, 1), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lq.map(mesTxt) });

  const mdata = (v) => (v ? mesAnoDeData(v) : 'não voltou');
  p.append(el('div', { class: 'linha dupla', style: 'margin-bottom:16px' },
    el('div', { class: 'cartao' }, cabecalho('Mariana e Brumadinho', 'Queda do último pregão antes do acidente até o fundo dos 12 meses seguintes. Retorno depois, com proventos.'),
      tabelaOrdenavel([{ campo: 'nome', rotulo: 'Acidente' }, { campo: 'data', rotulo: 'Data', fmt: dataTxt }, { campo: 'm_antes', rotulo: 'Minério antes', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'dia1', rotulo: '1º pregão', num: true, fmt: (v) => fmtPct(v, 1) },
        { campo: 'queda', rotulo: 'Até o fundo', num: true, fmt: (v) => fmtPct(v) }, { campo: 'm_fundo', rotulo: 'Minério no fundo', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'pregoes', rotulo: 'Pregões até voltar', num: true, fmt: fmtInt }, { campo: 'r24_fundo', rotulo: '24 meses do fundo', num: true, fmt: (v) => fmtPct(v) }], D.caro.acidentes, { livre: true }),
      el('p', { class: 'cartao-sub', style: 'margin-top:10px', text: 'Em Mariana o minério já estava baixo. Em Brumadinho a oferta menor fez o minério subir enquanto a ação caía: crise da empresa, que a regra do minério não vê.' })),
    el('div', { class: 'cartao' }, cabecalho('Fundos da VALE3 com queda de 35% ou mais', 'Um fundo por pico: o menor preço em 6 meses para cada lado; preço ajustado por proventos. Na hora, só se sabe quando a queda passa de 35%; o fundo só se conhece 6 meses depois.'),
      tabelaOrdenavel([{ campo: 'pico', rotulo: 'Pico', fmt: mesAnoDeData }, { campo: 'fundo', rotulo: 'Fundo', fmt: mesAnoDeData }, { campo: 'conf', rotulo: 'Fundo confirmado' }, { campo: 'queda', rotulo: 'Queda', num: true, fmt: (v) => fmtPct(v) },
        { campo: 'm_fundo', rotulo: 'Minério no fundo', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'cruzou', rotulo: 'Passou de −35% em', fmt: mesAnoDeData },
        { campo: 'r24_cruz', rotulo: '24 meses de quando passou de −35%', num: true, fmt: (v) => (v == null ? 'ainda sem 24 meses' : fmtPct(v)) },
        { campo: 'r24', rotulo: '24 meses do fundo (só se sabe depois)', num: true, fmt: (v) => (v == null ? '—' : fmtPct(v)) }], D.caro.crises, { livre: true }))));
  p.append(el('div', { class: 'linha dupla', style: 'margin-bottom:16px' },
    el('div', { class: 'cartao' }, cabecalho('As vezes em que o minério passou do corte', 'Na média do mês, desde 2006, até voltar abaixo do corte. Retorno da VALE3 no período, com proventos.'),
      tabelaOrdenavel([{ campo: 'inicio', rotulo: 'Passou do corte', fmt: mesAnoDeData }, { campo: 'maximo', rotulo: 'Máximo mensal', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'volta', rotulo: 'Voltou em', fmt: mdata }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'vale3', rotulo: 'VALE3', num: true, fmt: (v) => fmtPct(v) }], D.caro.episodios, { livre: true })),
    el('div', { class: 'cartao' }, cabecalho('Como o preço médio foi calculado', 'Piso e teto são as medianas dos meses dos últimos 10 e 20 anos, recalculadas a cada atualização. O corte de CARA é um número fixo.'),
      tabelaOrdenavel([{ campo: 'desde', rotulo: 'Janela', fmt: (v) => (/^\d/.test(v) ? 'Desde ' + v : v) }, { campo: 'media', rotulo: 'Média dos meses', num: true, fmt: (v) => fmtUS(v) }, { campo: 'mediana', rotulo: 'Mediana dos meses', num: true, fmt: (v) => fmtUS(v) }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt },
        { campo: 'abaixo', rotulo: 'Abaixo do piso', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'acima', rotulo: 'No corte ou acima', num: true, fmt: (v) => fmtPct(v, 0, false) }], D.caro.ciclo, { livre: true }))));
}

// ------------------------------------------------------------------ Margem por tonelada
function renderMargem() {
  const p = document.getElementById('p-margem'); p.replaceChildren();
  const C = cores(), M = D.margem, nivel = (c) => M.niveis.find((x) => x.chave === c);
  p.append(el('div', { class: 'aviso', text: 'Só informação: EBITDA, margem e custos não entram no veredito. Com a commodity alta, a margem também vem inflada.' }));
  p.append(el('div', { class: 'grade-tiles' },
    tile('Minério hoje', fmtUS(H.minerio), `Índice 62% de ${D.data_precos}`),
    tile('Custo caixa C1', fmtUS(nivel('c1').custo, 1), `${M.tri}. Custo de produzir, sem compras de terceiros`),
    tile('Custo all-in', fmtUS(nivel('all_in').custo, 1), `${M.tri}. Custo total de finos e pelotas, com frete e despesas`),
    tile('Break-even de caixa', fmtUS(nivel('break_even').custo, 1), `${M.tri}. O all-in mais o investimento de manutenção`),
    tile('Sobra sobre o break-even', fmtUS(nivel('break_even').sobra, 1), `Folga de ${fmtPct(nivel('break_even').folga, 0, false)} do minério de hoje sobre esse custo`)));
  const anoMin = anoDoRotulo(D.custos[0].tri), per = periodoDe(anoMin), cs = D.custos.filter((x) => noPeriodo(per, x.tri)), lab = cs.map((x) => x.tri);
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(anoMin)));
  const g1 = cartaoGrafico('g-custos', 'Minério contra os custos da Vale', 'Dólares por tonelada, por trimestre. O índice é o preço de referência de 62%, não o preço que a Vale recebeu.', 340);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g1));
  desenhar(g1, { type: 'line', data: { labels: lab, datasets: [
      serie('Índice 62%', cs.map((x) => x.indice_62), C.brent, { rotuloFinal: 'Índice' }), serie('Break-even de caixa', cs.map((x) => x.break_even), C.s[1], { rotuloFinal: 'Break-even' }),
      serie('Custo all-in', cs.map((x) => x.all_in), C.s[0], { rotuloFinal: 'All-in' }), serie('Custo caixa C1', cs.map((x) => x.c1), C.s[3], { rotuloFinal: 'C1' })] },
    options: opcoesLinha(lab, (v) => 'US$ ' + fmtN(v, 0), { zero: true, rotulosFinais: true, padDir: 78, eixoX: eixoAnos(lab, C) }) }, (v) => fmtUS(v, 1), { mira: true, rotuloX: 'Trimestre' });

  const degraus = [['Custo caixa C1', nivel('c1').custo], ['Custo all-in', nivel('all_in').custo], ['Break-even de caixa', nivel('break_even').custo], ['Minério hoje', H.minerio]];
  const g2 = cartaoGrafico('g-escada', `Escada de custos (${M.tri}) e o minério de hoje`, 'Dólares por tonelada. Cada degrau inclui o anterior.', 240);
  const tab = el('div', { class: 'cartao' }, cabecalho('Quanto sobra e a chance de ficar abaixo', `Chance de o minério estar abaixo de cada custo daqui a 12 meses, supondo preço lognormal, sem tendência, com volatilidade anual de ${fmtPct(M.vol, 1, false)}.`),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Custo' }, { campo: 'custo', rotulo: 'US$/t', num: true, fmt: (v) => fmtN(v, 1) }, { campo: 'sobra', rotulo: 'Sobra (US$/t)', num: true, fmt: (v) => fmtN(v, 1) }, { campo: 'folga', rotulo: 'Folga', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'chance', rotulo: 'Chance em 12 meses', num: true, fmt: (v) => fmtPct(v, 1, false) }], M.niveis, { livre: true }),
    el('p', { class: 'cartao-sub', style: 'margin-top:10px', text: 'A conta é uma aproximação: a volatilidade vem da média mensal desde 2010 e o custo fica parado no último trimestre.' }));
  p.append(el('div', { class: 'linha dupla' }, g2, tab));
  const opBarras = opcoesBarrasH(C, (v) => 'US$ ' + fmtN(v, 0));
  Object.assign(opBarras.scales.x.ticks, { maxRotation: 0, maxTicksLimit: 6 });
  desenhar(g2, { type: 'bar', data: { labels: degraus.map((x) => x[0]), datasets: [{ label: 'US$ por tonelada', data: degraus.map((x) => x[1]), backgroundColor: degraus.map((x, i) => (i === 3 ? C.brent : C.s[0])) }] },
    options: opBarras }, (v, ds, i) => fmtUS(v, i === 3 ? 2 : 1), { rotuloX: 'Degrau' });
}

// ------------------------------------------------------------------ Indicadores
function fmtInd(v, u, longo = true) {
  if (v == null) return '—';
  if (u === '%') return fmtPct(v, 1, false);
  if (u === 'x') return fmtX(v, 2);
  return longo ? `US$ ${fmtN(v, 0)} mi` : fmtN(v, 0);
}
function varInd(i) {
  if (i.valor == null || i.valor_ant == null) return '—';
  if (i.unidade === '%') return `${fmtSinal((i.valor - i.valor_ant) * 100, 1)} p.p.`;
  if (i.unidade === 'x') return `${fmtSinal(i.valor - i.valor_ant, 2)}x`;
  return i.valor_ant > 0 ? fmtPct(i.valor / i.valor_ant - 1) : '—';
}
function renderIndicadores() {
  const p = document.getElementById('p-indicadores'); p.replaceChildren();
  const C = cores(), I = D.indicadores, atual = I[0].tri_atual;
  p.append(el('div', { class: 'aviso', text: 'Só informação: o veredito sai do ciclo do minério, não destes números. Com o minério alto eles parecem ótimos, e esse é o ponto da regra.' }));
  p.append(el('div', { class: 'cartao solto' }, cabecalho(`Os 12 indicadores no ${atual}`, 'Contra o mesmo trimestre do ano anterior. Valores da Vale em dólares. "Últimos 12 meses" são os indicadores que somam ou comparam o ano inteiro.'),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Indicador' }, { campo: 'base', rotulo: 'Base' }, { campo: 'valor', rotulo: atual, num: true, fmt: (v, l) => fmtInd(v, l.unidade) }, { campo: 'valor_ant', rotulo: I[0].tri_ant, num: true, fmt: (v, l) => fmtInd(v, l.unidade) }, { campo: 'nome', rotulo: 'Variação', num: true, fmt: (v, l) => varInd(l) }], I, { livre: true })));
  const ind = I.find((x) => x.nome === estado.indicador) || I[0];
  const sel = el('select', { 'aria-label': 'Indicador' }, ...I.map((x) => el('option', { value: x.nome, selected: x.nome === ind.nome, text: x.nome })));
  sel.onchange = () => { estado.indicador = sel.value; renderIndicadores(); };
  const serieInd = estado.indTipo === 'Anual' ? ind.anual : ind.trimestral, anoMin = anoDoRotulo(serieInd[0].p), per = periodoDe(anoMin);
  p.append(el('div', { class: 'filtros' }, el('label', { class: 'filtro' }, 'Indicador', sel),
    el('div', { class: 'filtro' }, 'Frequência', segmentoEmpresa(estado.indTipo, (v) => { estado.indTipo = v; renderIndicadores(); }, [['Trimestral', 'Trimestres'], ['Anual', 'Anos']])), ...filtroPeriodo(anoMin)));
  const pts = serieInd.filter((x) => noPeriodo(per, x.p)), lab = pts.map((x) => x.p);
  const g = cartaoGrafico('g-ind', ind.nome, `${ind.unidade === 'US$ mi' ? 'US$ milhões' : ind.unidade === 'x' ? 'Vezes' : 'Percentual'}. ${estado.indTipo === 'Anual' ? 'Anos completos e os últimos 12 meses.' : ind.base === 'Últimos 12 meses' ? 'Cada trimestre traz os 12 meses até ele.' : 'Valor de cada trimestre.'}`, 320);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g));
  desenhar(g, { type: 'bar', data: { labels: lab, datasets: [{ label: ind.nome, data: pts.map((x) => x.v), backgroundColor: C.petrobras }] },
    options: opcoesColunas(C, (v) => fmtInd(v, ind.unidade, false), { rotulos: lab.length <= 12 }) }, (v) => fmtInd(v, ind.unidade, false), { rotuloX: 'Período' });
}

// ------------------------------------------------------------------ Mercado
function correlacao(x, y) {
  const n = x.length, mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
  let a = 0, b = 0, c = 0;
  for (let i = 0; i < n; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; }
  return a / Math.sqrt(b * c);
}
function eixoDiario(labels, C) {   // marca o ano na primeira linha de cada ano; em períodos curtos, o trimestre ou o semestre
  const anos = +labels[labels.length - 1].slice(0, 4) - +labels[0].slice(0, 4), curto = anos <= 3, passo = anos > 8 ? 2 : 1, meses = anos <= 1 ? ['01', '04', '07', '10'] : ['01', '07'], marca = {};
  labels.forEach((l, i) => {
    if (i === 0) return;
    const ant = labels[i - 1];
    if (curto && l.slice(0, 7) !== ant.slice(0, 7) && meses.includes(l.slice(5, 7))) marca[i] = mesTxt(l);
    else if (!curto && l.slice(0, 4) !== ant.slice(0, 4) && +l.slice(0, 4) % passo === 0) marca[i] = l.slice(0, 4);
  });
  return { grid: { display: false }, border: { color: C.base }, ticks: { autoSkip: false, maxRotation: 0, color: C.texto3, callback: (v, i) => marca[i] || null } };
}
function renderMercado() {
  const p = document.getElementById('p-mercado'); p.replaceChildren();
  const C = cores(), todas = D.mercado, anoMin = anoDoRotulo(todas[0][0]), per = periodoDe(anoMin);
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(anoMin)));
  const ls = todas.filter((x) => noPeriodo(per, x[0])), b = ls[0], u = ls[ls.length - 1];
  const nomes = ['VALE3', 'Minério'], fmts = [(v) => fmtUS(v), (v) => fmtUS(v)];
  p.append(el('div', { class: 'grade-tiles' }, ...nomes.map((n, i) => tile(n, fmts[i](u[i + 1]), `${fmtPct(u[i + 1] / b[i + 1] - 1)} no período${n === 'VALE3' ? ', sem proventos' : ''}`))));
  // períodos longos: um pregão a cada 5, para o gráfico ficar leve e a tabela, legível
  const fino = ls.length > 1500 ? ls.filter((x, i) => i % 5 === 0 || i === ls.length - 1) : ls, lab = fino.map((x) => x[0]);
  const g = cartaoGrafico('g-mercado', 'VALE3 e minério no mesmo eixo', `Base 100 em ${dataTxt(b[0])}. Os dois em dólar; a VALE3 sem proventos.`, 360);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g));
  const cor = [C.petrobras, C.brent];
  desenhar(g, { type: 'line', data: { labels: lab, datasets: nomes.map((n, i) => serie(n, fino.map((x) => (100 * x[i + 1]) / b[i + 1]), cor[i], { borderWidth: 2 })) },
    options: opcoesLinha(lab, (v) => fmtN(v, 0), { eixoX: eixoDiario(lab, C), rotulosFinais: true, padDir: 64 }) }, (v) => fmtN(v, 1), { mira: true, titulo: dataTxt, rotuloX: 'Dia', rotulos: lab.map(dataTxt) });

  // correlação dos retornos mensais do período, no fim de cada mês
  const fim = ls.filter((x, i) => i === ls.length - 1 || x[0].slice(0, 7) !== ls[i + 1][0].slice(0, 7));
  const ret = (j) => fim.slice(1).map((x, i) => Math.log(x[j] / fim[i][j]));
  const pares = [['VALE3 e minério, em dólar', 1, 2]].map(([nome, a, c]) => ({ nome, r: correlacao(ret(a), ret(c)), meses: fim.length - 1 }));
  const segA = segmentoEmpresa(estado.ativo, (v) => { estado.ativo = v; renderMercado(); }, [['Minério', 'Minério'], ['VALE3', 'VALE3 em dólar']]);
  const segT = segmentoEmpresa(estado.sensTipo, (v) => { estado.sensTipo = v; renderMercado(); }, [['Anual', 'Anos'], ['Trimestral', 'Trimestres']]);
  const sens = D.sensib.filter((x) => x.ativo === estado.ativo && x.tipo === estado.sensTipo);
  p.append(el('div', { class: 'linha dupla' },
    el('div', { class: 'cartao' }, cabecalho('Quanto andam juntos', 'Correlação dos retornos mensais no período escolhido. 1 = sempre juntos; 0 = sem relação; −1 = sempre opostos.'),
      tabelaOrdenavel([{ campo: 'nome', rotulo: 'Par' }, { campo: 'r', rotulo: 'Correlação', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }], pares, { livre: true })),
    caixaLer('Como ler a sensibilidade', [`Abaixo, quanto cada indicador da Vale se move com o ativo escolhido. Com ${fmtInt(sens[0].n)} períodos ${estado.sensTipo === 'Anual' ? 'anuais' : 'trimestrais ou menos'}, os intervalos de confiança são largos: "sim" na última coluna quer dizer só que o intervalo não inclui o zero.`, 'Correlação do nível compara os valores; correlação das variações compara as mudanças de um período para outro, que é a medida mais segura. Elasticidade: quanto o indicador varia, em %, para cada 1% do ativo.'], null, false)));
  p.append(el('h2', { class: 'secao', text: 'Sensibilidade dos 12 indicadores' }));
  p.append(el('div', { class: 'filtros' }, el('div', { class: 'filtro' }, 'Ativo', segA), el('div', { class: 'filtro' }, 'Frequência', segT)));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'ind', rotulo: 'Indicador' }, { campo: 'n', rotulo: 'Períodos', num: true, fmt: fmtInt }, { campo: 'nivel', rotulo: 'Correlação do nível', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'var', rotulo: 'Correlação das variações', num: true, fmt: (v) => fmtN(v, 2) },
    { campo: 'ic_b', rotulo: 'IC 95% inferior', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'ic_a', rotulo: 'IC 95% superior', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'elast', rotulo: 'Elasticidade', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'sig', rotulo: 'Intervalo sem zero', fmt: (v) => (v ? 'sim' : 'não') }], sens, { livre: true })));
}

// ------------------------------------------------------------------ Como foi feito
function renderMetodo() {
  const p = document.getElementById('p-metodo'); p.replaceChildren();
  const pcM = D.caro.pontos.find((x) => x.ponto === R.corte) || {};
  p.append(el('div', { class: 'metodo' },
    caixaLer('A regra do veredito', [[
      `CARA: minério de ${fmtUS(R.corte, 0)} ou mais. O corte foi escolhido pelo analista depois do teste. Nesse nível ou acima, ${fmtPct(pcM.perdeu, 0, false)} das compras perderam em 24 meses; ${fmtPct(pcM.perdeu_sem, 0, false)} sem as compras de 2010–13 e ${fmtPct(pcM.perdeu_d14, 0, false)} desde 2014.`,
      `BARATA: minério abaixo de ${fmtUS(R.piso, 1)} e a ação 30% ou mais abaixo do pico de 24 meses, em dólar.`, 'NEUTRA: qualquer outro caso.',
      'Tudo em dólar: a VALE3 é o preço na bolsa ÷ cotação PTAX do mesmo dia.',
      `Preço médio de ${fmtFaixa()}: as medianas dos meses dos últimos 10 e 20 anos, recalculadas a cada atualização.`,
      'Minério em dólar nominal, sem correção pela inflação. EBITDA, margem e múltiplos ficam só como informação.']], null, false),
    caixaLer('Dados', [[
      'VALE3 e contrato de minério 62% (VALE3.SA e TIO=F): Yahoo Finance. O preço com proventos é o ajustado do Yahoo.', 'Minério antes de 11/2010: Pink Sheet do Banco Mundial.', 'Cotação do dólar (PTAX): Banco Central, só para converter a VALE3.',
      'Indicadores, custos e sensibilidade: relatório de indicadores históricos da Vale e cálculos da AUVP.']], null, false),
    caixaLer('Como os testes foram feitos', [[
      'Compras: último pregão de cada mês, desde 2006; retorno em 12 e 24 meses (252 e 504 pregões), em dólar, com proventos.', 'Janelas independentes: contagem de períodos que não se sobrepõem, para não superestimar a evidência.',
      'Bootstrap por blocos de 24 meses: refaz a história 2.000 vezes para ver quanto a mediana e o melhor corte mudam.', 'Recortes: repete a conta sem 2007–08, sem 2010–13, sem 2021–22, só desde 2014 e sem as janelas que cruzam Mariana ou Brumadinho.']], null, false),
    caixaLer('Cuidados na leitura', [[
      'Na Pink Sheet, até 2005 o valor é o preço anual de contrato (Carajás, em centavos por unidade de ferro); de 2006 a 11/2008, preço à vista de 63,5% de ferro; desde 12/2008, 62%. Por isso o teste das compras começa em 2006.',
      'O contrato do Yahoo liquida pela média do mês: no começo do mês ele dá um salto, e o último dia do mês fica perto da média mensal.', 'O Yahoo só traz proventos da VALE3 desde 04/2008: as compras de 2006–08 estão um pouco subestimadas.',
      'O filtro De/Até muda os gráficos e as contas ao lado deles. As tabelas de crises e de sensibilidade e o teste do corte seguem com a história inteira.',
      'Poucos episódios independentes: os intervalos de confiança são largos.', 'Relação estatística não é causa. Não é recomendação de investimento.']], null, false)));
  p.append(el('h2', { class: 'secao', text: 'A emenda das duas fontes de minério' }));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Média mensal do contrato do Yahoo contra a Pink Sheet', 'Nos meses em que as duas existem. É o que autoriza usar a Pink Sheet para completar a janela de 20 anos.'),
    tabelaOrdenavel([{ campo: 'de', rotulo: 'De' }, { campo: 'ate', rotulo: 'Até' }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'dif', rotulo: 'Diferença média', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'abs', rotulo: 'Diferença absoluta média', num: true, fmt: (v) => fmtPct(v, 1, false) },
      { campo: 'max', rotulo: 'Maior diferença', num: true, fmt: (v) => fmtPct(v, 1, false) }, { campo: 'cor', rotulo: 'Correlação dos níveis', num: true, fmt: (v) => fmtN(v, 3) }, { campo: 'cor_var', rotulo: 'Correlação das variações', num: true, fmt: (v) => fmtN(v, 3) }], D.caro.emenda, { livre: true })));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Os pontos testados para CARA', `Tudo o que ficou em cada ponto ou acima: retorno mediano em 24 meses, em dólar e com proventos, e parcela das compras que perderam. O ponto de ${fmtUS(R.media_2004, 1)} é a média dos meses desde 2004, testada antes.`),
    tabelaOrdenavel([{ campo: 'ponto', rotulo: 'Ponto', num: true, fmt: (v) => fmtUS(v, Number.isInteger(v) ? 0 : 1) }, { campo: 'pct', rotulo: 'Meses em CARA', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'janelas', rotulo: 'Janelas', num: true, fmt: fmtInt },
      { campo: 'r24', rotulo: 'Retorno: tudo', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'r24_sem', rotulo: 'Retorno: sem 2010–13', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'r24_d14', rotulo: 'Retorno: desde 2014', num: true, fmt: (v) => fmtPct(v, 1) },
      { campo: 'perdeu', rotulo: 'Perderam: tudo', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'perdeu_sem', rotulo: 'Perderam: sem 2010–13', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'perdeu_d14', rotulo: 'Perderam: desde 2014', num: true, fmt: (v) => fmtPct(v, 0, false) }], D.caro.pontos, { livre: true, destaque: (l) => l.ponto === R.corte })));
  p.append(el('h2', { class: 'secao', text: 'Roteiro para repetir a análise' }));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'passo', rotulo: 'Passo' }, { campo: 'pergunta', rotulo: 'Pergunta' }, { campo: 'como', rotulo: 'Como medir' }, { campo: 'regra', rotulo: 'Regra de leitura' }], D.caro.roteiro, { livre: true })));
}

// ------------------------------------------------------------------ abas e início
let abaAtual = 'veredito', feitas = {};
const RENDER = { veredito: renderVeredito, minerio: renderMinerio, margem: renderMargem, indicadores: renderIndicadores, mercado: renderMercado, metodo: renderMetodo };
function mostrar(aba) {
  abaAtual = aba;
  document.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.aba === aba ? 'true' : 'false'));
  document.querySelectorAll('.painel').forEach((s) => { s.hidden = s.id !== 'p-' + aba; });
  if (!feitas[aba]) { RENDER[aba](); feitas[aba] = true; }
  try { history.replaceState(null, '', '#' + aba); } catch (e) { /* arquivo aberto em modo restrito: segue sem o endereço */ }
}
document.querySelectorAll('[role="tab"]').forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.aba)));
document.getElementById('meta').textContent = `Preços de ${D.data_precos} · balanços até ${D.margem.tri} · gerado em ${D.gerado}`;
if (!TEM_CHART) document.getElementById('aviso-chart').hidden = false;
iniciarTema(() => { feitas = {}; mostrar(abaAtual); });
const abaInicial = (location.hash || '').replace('#', '');
mostrar(Object.prototype.hasOwnProperty.call(RENDER, abaInicial) ? abaInicial : 'veredito');
