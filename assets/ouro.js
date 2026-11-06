'use strict';
// Seção do Ouro. Dados em dados/ouro.js, gerados a partir dos Excel e dos CSV do projeto.
const D = window.DADOS;
const R = D.regra, H = D.hoje, RT = D.retrato, T = D.teste;
const ANO_INI = 2000, ANO_FIM = +D.data_precos.slice(-4);
const estado = { de: ANO_INI, ate: ANO_FIM, escala: 'log' };
const DATA_LEITURA = `Leitura escrita em 06/11/2026, com preços de 05/11/2026. Os números vêm dos dados; a interpretação não muda sozinha.`;
const seloOuro = (v) => el('span', { class: 'selo selo-' + { NEUTRO: 'NEUTRA', BARATO: 'BARATA' }[v], text: v });   // no ouro não há CARO (decisão do analista, 06/11/2026)
const corOuro = (C) => C.prio;
// como fmtPct, sem mostrar "−0%" quando o valor arredonda para zero
const fmtR = (v, d = 0, sinal = true) => (v != null && Math.abs(v) * 100 < 0.5 / 10 ** d ? fmtN(0, d) + '%' : fmtPct(v, d, sinal));

// ------------------------------------------------------------------ período: um só para todos os gráficos; cada aba usa os anos que tem de dados
const anoDoRotulo = (p) => +String(p).slice(0, 4);
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
const ULTIMO_MES = D.mensal[D.mensal.length - 1].m;
// gráfico mensal de uma série só, com linhas de referência: [rótulo, valor, cor, tracejado]
function graficoMensal(id, titulo, sub, altura, pts, campo, cor, refs, fmtEixo, fmt, o = {}) {
  const g = cartaoGrafico(id, titulo, sub, altura), lab = pts.map((x) => x.m), n = lab.length;
  return { g, desenhar: () => desenhar(g, { type: 'line', data: { labels: lab, datasets: [serie(titulo, pts.map((x) => x[campo]), cor, { semRotulo: true }), ...refs.map(([r, v, c, t]) => referencia(r, v, n, c, t))] },
    options: opcoesLinha(lab, fmtEixo, { legenda: refs.length > 0, passo: passoEixo(n), ...o }) }, fmt, { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lab.map(mesTxt) }) };
}
function maiorQueda(v) { let pico = -Infinity, q = 0; for (const x of v) { if (x > pico) pico = x; q = Math.min(q, x / pico - 1); } return q; }

// ------------------------------------------------------------------ Veredito
function reguaTermometro() {
  const zona = (de, ate, cor, t) => el('div', { class: 'regua-zona', style: `width:${ate - de}%;background:var(${cor})`, text: t });
  return el('div', { class: 'regua', role: 'img', 'aria-label': `Termômetro em ${fmtN(H.termo, 0)}: até ${R.corte_b} barato, se o preço tiver força; acima disso, neutro; de ${R.aviso} para cima, neutro com aviso de esticado.` },
    zona(0, R.corte_b, '--zona-barata', 'BARATO'), zona(R.corte_b, R.aviso, '--zona-neutra', 'NEUTRO'), zona(R.aviso, 100, '--zona-media', 'NEUTRO'),
    el('div', { class: 'regua-marca cima', style: `left:${H.termo}%` }, el('span', { text: `Hoje ${fmtN(H.termo, 0)}` })),
    el('div', { class: 'regua-corte', style: `left:${R.corte_b}%`, text: fmtInt(R.corte_b) }),
    el('div', { class: 'regua-corte', style: `left:${R.aviso}%`, text: `${fmtInt(R.aviso)}: esticado` }));
}
function renderVeredito() {
  const p = document.getElementById('p-veredito'); p.replaceChildren();
  const C = cores();
  p.append(el('div', { class: 'linha dupla', style: 'margin-bottom:16px' },
    el('div', { class: 'veredito' },
      el('div', { class: 'veredito-topo' }, el('div', { class: 'veredito-nome' }, el('span', { class: 'ponto', style: 'background:' + corOuro(C) }), 'Ouro (US$ por onça)'), seloOuro(D.ver)),
      el('div', { class: 'veredito-preco', text: fmtUS(H.ouro) }),
      el('ul', {},
        el('li', {}, el('span', { text: 'Termômetro (0 a 100)' }), el('strong', { text: fmtN(H.termo, 0) })),
        el('li', {}, el('span', { text: `Distância do recorde (${fmtUS(RT.recorde, 0)}, ${dataTxt(RT.data_recorde)})` }), el('strong', { text: fmtR(RT.queda_recorde, 1) })),
        el('li', {}, el('span', { text: `Contra a média de 12 meses (${fmtUS(H.media12, 0)})` }), el('strong', { text: fmtR(RT.dist12, 1) })),
        el('li', {}, el('span', { text: `Aviso de esticado (termômetro ${fmtInt(R.aviso)} ou mais)` }), el('strong', { text: H.esticado ? 'sim' : 'não' })),
        el('li', {}, el('span', { text: 'Alta em 12 meses' }), el('strong', { text: fmtR(RT.alta12) })))),
    el('div', { class: 'cartao' }, cabecalho('Onde o ouro está na régua', `Média de três comparações: contra a bolsa, contra o petróleo e contra a própria tendência. BARATO também exige o preço acima da média de 12 meses. Não há CARO: de ${fmtInt(R.aviso)} para cima, o ouro segue NEUTRO, com aviso de esticado.`), reguaTermometro())));
  p.append(el('div', { class: 'grade-tiles' },
    H.esticado ? tile('Para sair do aviso de esticado', `Ouro < ${fmtUS(H.preco_aviso, 0)}`, `${fmtR(H.preco_aviso / H.ouro - 1, 1)} do preço de hoje, com a bolsa e o Brent de hoje.`)
      : tile('Aviso de esticado', `Ouro ≥ ${fmtUS(H.preco_aviso, 0)}`, `${fmtR(H.preco_aviso / H.ouro - 1, 1)} do preço de hoje, com a bolsa e o Brent de hoje. É aviso: o veredito segue NEUTRO.`),
    tile('Para virar BARATO', `Ouro ≤ ${fmtUS(H.preco_barato, 0)}`, `${fmtR(H.preco_barato / H.ouro - 1, 1)} do preço de hoje, e com o preço de volta acima da média de 12 meses.`),
    tile('Força do preço', H.forca ? 'Com força' : 'Perdendo força', `${fmtUS(H.ouro, 0)} contra a média de 12 meses de ${fmtUS(H.media12, 0)}`, true),
    tile('Alta em 36 meses', fmtR(RT.alta36), `Distância da média de 200 pregões: ${fmtR(RT.acima200)}`)));

  const rg = (v) => T.regra.find((x) => x.v === v) || {};
  const pt = (k) => T.pontos.find((x) => x.ponto === k) || {};
  const fz = (s) => T.forca.find((x) => x.situacao.startsWith(s)) || {};
  const qd = (s) => T.queda.find((x) => x.situacao.startsWith(s)) || {};
  const bt = (s) => T.baratas.find((x) => x.situacao === s) || {};
  const pc = pt(R.aviso), caro = rg('NEUTRO, esticado'), neutro = rg('NEUTRO, sem aviso'), asf = T.alto_sem_forca;
  const top = [...T.melhor_corte].sort((a, b) => b.freq - a.freq).slice(0, 3).map((x) => `${fmtInt(x.corte)} (${fmtR(x.freq, 0, false)})`).join(', ');
  const con = D.caro.conclusao;
  p.append(el('div', { class: 'linha dupla' },
    caixaLer('Conclusão', [con[1], con[5], con[6], con[7], 'Este texto sai das regras do Excel "Caro ou barato - Ouro" e muda sozinho com os preços.'], null, false),
    caixaLer('Onde a regra é mais fraca', [[
      `O aviso de esticado não prevê queda. Com o termômetro de ${fmtInt(R.aviso)} ou mais, as compras deram ${fmtR(caro.r24)} em 24 meses (${fmtR(caro.perdeu, 0, false)} perderam), contra ${fmtR(neutro.r24)} no NEUTRO sem aviso. A diferença só aparece em 36 meses: ${fmtR(caro.r36)} contra ${fmtR(neutro.r36)}.`,
      `O aviso depende de um episódio: sem as compras de 2011–12, ${pc.perdeu_sem === 0 ? `nenhuma das ${fmtInt(pc.meses_sem)} restantes perdeu` : `${fmtR(pc.perdeu_sem, 0, false)} das ${fmtInt(pc.meses_sem)} restantes perderam`} em 24 meses. São só ${fmtInt(pc.janelas)} janelas independentes.`,
      `O ponto do aviso não está bem identificado. Ao reamostrar a história, o melhor corte ficou espalhado: ${top}. Em 75, o retorno em 36 meses foi ${fmtR(pt(75).r36)}; em 85, ${fmtR(pt(85).r36)}; em 90, ${fmtR(pt(90).r36)}.`,
      `O que mais separa é a força do preço: acima da média de 12 meses, ${fmtR(fz('acima').r24)} em 24 meses e ${fmtR(fz('acima').perdeu, 0, false)} de perdas; abaixo, ${fmtR(fz('abaixo').r24)} e ${fmtR(fz('abaixo').perdeu, 0, false)}.`,
      `Queda grande não é sinal de compra no ouro: até 10% abaixo do pico de 24 meses deu ${fmtR(qd('até 10%').r24)}; de 20% a 30% abaixo, ${fmtR(qd('20 a 30%').r24)}. Com o termômetro até ${fmtInt(R.corte_b)} e o preço ainda abaixo da média de 12 meses, ${fmtR(bt('até 50 e abaixo da média de 12 meses').r24)} e ${fmtR(bt('até 50 e abaixo da média de 12 meses').perdeu, 0, false)} de perdas.`,
      asf.meses ? `Termômetro de 70 ou mais com o preço abaixo da média de 12 meses é raro: só ${fmtInt(asf.meses)} meses com resultado conhecido (${fmtR(asf.r24)} em 24 meses), além de ${fmtInt(asf.agora)} meses recentes ainda sem resultado.`
        : `Termômetro de 70 ou mais com o preço abaixo da média de 12 meses não tem nenhum resultado conhecido: são ${fmtInt(asf.agora)} meses recentes.`,
      `A régua ouro ÷ Brent também muda com o petróleo e usa o último Brent à vista publicado (${H.brent_data}). As faixas foram escolhidas olhando esta mesma história, e o termômetro só existe desde 2005.`]], DATA_LEITURA, false)));
  p.append(el('h2', { class: 'secao', text: 'Placar: cada lente da análise' }));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'lente', rotulo: 'Lente' }, { campo: 'indicador', rotulo: 'Indicador' }, { campo: 'hoje', rotulo: 'Hoje' },
    { campo: 'ref', rotulo: 'Referência' }, { campo: 'leitura', rotulo: 'Leitura' }], D.caro.placar, { livre: true, destaque: (l) => l.lente === 'VEREDITO' })));
}

// ------------------------------------------------------------------ Termômetro
function renderTermometro() {
  const p = document.getElementById('p-termometro'); p.replaceChildren();
  const C = cores(), com = D.mensal.filter((x) => x.t != null), anoMin = anoDoRotulo(com[0].m), per = periodoDe(anoMin), pts = com.filter((x) => noPeriodo(per, x.m));
  const [rs, rb, rt] = D.caro.reguas;
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(anoMin)));
  p.append(el('div', { class: 'grade-tiles' },
    tile('Termômetro hoje', fmtN(H.termo, 0), `Média dos três percentis. Esticado de ${fmtInt(R.aviso)} para cima`),
    tile('S&P 500 ÷ ouro', fmtN(rs.hoje, 2), `Percentil de caro ${fmtN(rs.pct * 100, 0)}. Na mediana (${fmtN(rs.mediana, 2)}), o ouro valeria perto de ${fmtUS(rs.preco, 0)}`),
    tile('Ouro ÷ Brent', `${fmtN(rb.hoje, 1)} barris`, `Percentil ${fmtN(rb.pct * 100, 0)}. Na mediana (${fmtN(rb.mediana, 1)}), o ouro valeria perto de ${fmtUS(rb.preco, 0)}`),
    tile('Contra a tendência', fmtR(H.ouro / H.reta - 1), `Percentil ${fmtN(rt.pct * 100, 0)}. A reta passa hoje por ${fmtUS(rt.preco, 0)}`)));
  const lab = pts.map((x) => x.m), n = lab.length, temHoje = lab[n - 1] === ULTIMO_MES;
  const g1 = cartaoGrafico('g-termo', 'Termômetro do ouro', 'De 0 a 100, mês a mês, com cada régua medida só com o passado até aquele mês.', 320);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g1));
  desenhar(g1, { type: 'line', data: { labels: lab, datasets: [serie('Termômetro', pts.map((x) => x.t), corOuro(C), { semRotulo: true }),
      ...(temHoje ? [serie(`Hoje (${fmtN(H.termo, 0)})`, pts.map((x, i) => (i === n - 1 ? H.termo : null)), C.texto, { showLine: false, pointRadius: 5, pointHoverRadius: 6, pointBorderWidth: 2, semRotulo: true, semTabela: true })] : []),
      referencia(`Aviso de esticado (${fmtInt(R.aviso)})`, R.aviso, n, C.brent, [6, 4]), referencia(`Limite de BARATO (${fmtInt(R.corte_b)})`, R.corte_b, n, C.barata, [6, 4])] },
    options: opcoesLinha(lab, (v) => fmtN(v, 0), { min: 0, max: 100, passo: passoEixo(n) }) }, (v) => fmtN(v, 1), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lab.map(mesTxt) });
  const tp = D.mensal.filter((x) => noPeriodo(per, x.m));
  const a = graficoMensal('g-sp', 'S&P 500 ÷ ouro', 'Onças de ouro para comprar o índice. Quanto menor, mais caro o ouro contra a bolsa.', 240, tp, 'sp', corOuro(C), [[`Mediana (${fmtN(rs.mediana, 2)})`, rs.mediana, C.brent, [6, 4]]], (v) => fmtN(v, 1), (v) => fmtN(v, 2));
  const b = graficoMensal('g-ob', 'Ouro ÷ Brent', 'Barris de petróleo por onça. Quanto maior, mais caro o ouro contra o petróleo.', 240, tp, 'ob', corOuro(C), [[`Mediana (${fmtN(rb.mediana, 1)})`, rb.mediana, C.brent, [6, 4]]], (v) => fmtN(v, 0), (v) => fmtN(v, 1));
  const c = graficoMensal('g-tend', 'Distância da tendência', 'Ouro contra a reta de hoje, ajustada desde 2000. Acima de zero, mais caro que a tendência.', 240, tp, 'dt', corOuro(C), [['Na tendência', 0, C.brent, [6, 4]]], (v) => fmtR(v, 0), (v) => fmtR(v, 1));
  p.append(el('div', { class: 'linha', style: 'margin-bottom:16px' }, a.g, b.g, c.g)); a.desenhar(); b.desenhar(); c.desenhar();
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Quando o termômetro ficou esticado ou barato', 'Meses a até 3 de distância contam como o mesmo episódio. O retorno depois de cada um está no Excel.'),
    tabelaOrdenavel([{ campo: 'v', rotulo: 'Situação' }, { campo: 'inicio', rotulo: 'Início', fmt: mesTxt }, { campo: 'fim', rotulo: 'Fim', fmt: mesTxt }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'termo', rotulo: 'Termômetro mediano', num: true, fmt: (v) => fmtN(v, 0) }, { campo: 'ouro', rotulo: 'Ouro mediano', num: true, fmt: (v) => fmtUS(v, 0) }], D.caro.episodios, { livre: true })));

  // teste com pesos pela correlação: fica no fim, em cinza, e não entra no veredito (pedido do analista, 06/11/2026)
  const PW = D.pesos, pw = PW ? PW.serie.filter((x) => noPeriodo(per, x.m)) : [];
  if (pw.length) {
    const lab3 = pw.map((x) => x.m), n3 = lab3.length;
    const pesosHoje = PW.hoje.reguas.map((r) => `${r.nome.split(' (')[0].toLowerCase()} ${fmtPct(r.peso, 0, false)}`).join(', ');
    const g4 = cartaoGrafico('g-pesos', 'Teste: termômetro com pesos pela correlação',
      `Não entra no veredito. Cada régua pesa conforme a nota alta dela veio seguida de retorno menor nos 24 meses seguintes, só com os retornos já conhecidos em cada mês; além das três réguas, entram juro e dólar e o crescimento de 5 anos. A primeira leitura sai em ${mesTxt(PW.serie[0].m)}.`, 220);
    p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none;margin-top:16px' }, g4));
    desenhar(g4, { type: 'line', data: { labels: lab3, datasets: [
        serie('Termômetro (o do veredito)', pw.map((x) => x.t), corOuro(C), { semRotulo: true }),
        serie('Com pesos pela correlação (teste)', pw.map((x) => x.tp), C.texto3, { semRotulo: true, borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0 }),
        referencia(`Aviso de esticado (${fmtInt(R.aviso)})`, R.aviso, n3, C.brent, [6, 4]), referencia(`Limite de BARATO (${fmtInt(R.corte_b)})`, R.corte_b, n3, C.barata, [6, 4])] },
      options: opcoesLinha(lab3, (v) => fmtN(v, 0), { min: 0, max: 100, passo: passoEixo(n3) }) }, (v) => fmtN(v, 1), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lab3.map(mesTxt) });
    g4.append(el('p', { class: 'cartao-sub', style: 'margin-top:10px', text:
      `Hoje: ${fmtN(PW.hoje.tp, 0)} (o do veredito, ${fmtN(H.termo, 0)}). Pesos de hoje: ${pesosHoje}. Por que não é o oficial: ${PW.petroleo_desde ? `de ${mesTxt(PW.petroleo_desde)} em diante, o petróleo levou quase todo o peso; ` : ''}`
      + `com pesos, o termômetro ficou em 85 ou mais em ${fmtPct(PW.esticado_p, 0, false)} dos meses (o do veredito, ${fmtPct(PW.esticado_a, 0, false)}) e o BARATO apareceu em ${fmtInt(PW.barato_p)} meses (o do veredito, ${fmtInt(PW.barato_a)}). `
      + `A correlação com o retorno dos 24 meses seguintes foi de ${fmtN(PW.corr_p, 2)} (o do veredito, ${fmtN(PW.corr_a, 2)}): no ouro, as réguas de preço "alto" funcionaram mais como sinal de força do que de caro.` }));
  }
}

// ------------------------------------------------------------------ Ouro no ciclo
function renderCiclo() {
  const p = document.getElementById('p-ciclo'); p.replaceChildren();
  const C = cores(), per = periodoDe(ANO_INI), pts = D.mensal.filter((x) => noPeriodo(per, x.m)), lab = pts.map((x) => x.m), n = lab.length;
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(ANO_INI), el('div', { class: 'filtro' }, 'Escala do gráfico', segmentoEmpresa(estado.escala, (v) => { estado.escala = v; renderCiclo(); }, [['log', 'Logarítmica'], ['normal', 'Normal']]))));
  const v0 = pts[0].o, v1 = pts[n - 1].o, anos = Math.max(n - 1, 1) / 12;
  p.append(el('div', { class: 'grade-tiles' },
    tile('Ouro no fim do período', fmtUS(v1, 0), `Recorde: ${fmtUS(RT.recorde, 0)} em ${dataTxt(RT.data_recorde)}`),
    tile('Variação no período', fmtR(v1 / v0 - 1), `De ${fmtUS(v0, 0)} em ${mesTxt(lab[0])}`),
    tile('Ao ano', fmtR((v1 / v0) ** (1 / anos) - 1, 1), `${fmtN(anos, 1)} anos, em dólar nominal`),
    tile('Maior queda no período', fmtR(maiorQueda(pts.map((x) => x.o))), 'Fim de mês contra o pico anterior do período')));
  const g1 = cartaoGrafico('g-ouro', 'Ouro, média de 12 meses e tendência', `Fim de cada mês, em dólar nominal. ${estado.escala === 'log' ? 'Na escala logarítmica, a mesma distância vertical é a mesma variação em %, e a reta de tendência fica reta.' : 'Na escala normal, as altas recentes parecem maiores do que as antigas.'}`, 380);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g1));
  desenhar(g1, { type: 'line', data: { labels: lab, datasets: [serie('Ouro', pts.map((x) => x.o), corOuro(C), { semRotulo: true }), serie('Média de 12 meses', pts.map((x) => x.m12), C.s[0], { borderWidth: 1.5, semRotulo: true }), serie('Reta de tendência de hoje', pts.map((x) => x.r), C.brent, { borderWidth: 1.5, borderDash: [6, 4], semRotulo: true })] },
    options: opcoesLinha(lab, (v) => 'US$ ' + fmtN(v, 0), { log: estado.escala === 'log', passo: passoEixo(n) }) }, (v) => fmtUS(v, 0), { mira: true, titulo: mesTxt, rotuloX: 'Mês', rotulos: lab.map(mesTxt) });
  const q = graficoMensal('g-queda', 'O ouro contra o pico de 24 meses', 'Fim de cada mês. No ouro, comprar depois de queda grande rendeu menos do que comprar perto do topo.', 280, pts, 'q', corOuro(C), [['20% abaixo do pico', -0.2, C.brent, [6, 4]]], (v) => fmtR(v, 0), (v) => fmtR(v, 1));
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, q.g)); q.desenhar();
  p.append(el('div', { class: 'cartao solto' }, cabecalho('As quedas de 15% ou mais', 'Fechamento diário, do recorde até o fundo e até voltar ao recorde anterior. O ouro quase sempre sobe, mas já ficou quase 9 anos abaixo do pico.'),
    tabelaOrdenavel([{ campo: 'pico', rotulo: 'Pico', fmt: dataTxt }, { campo: 'preco_pico', rotulo: 'Preço no pico', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'fundo', rotulo: 'Fundo', fmt: dataTxt }, { campo: 'preco_fundo', rotulo: 'Preço no fundo', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'queda', rotulo: 'Queda', num: true, fmt: (v) => fmtR(v) },
      { campo: 'voltou', rotulo: 'Voltou ao recorde', fmt: (v) => (v ? dataTxt(v) : 'não voltou') }, { campo: 'anos', rotulo: 'Anos até voltar', num: true, fmt: (v) => (v == null ? '—' : fmtN(v, 1)) }], D.caro.quedas, { livre: true })));
}

// ------------------------------------------------------------------ O que move o ouro (só informação: contas na página)
function correlacao(x, y) {
  const n = x.length, mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
  let a = 0, b = 0, c = 0;
  for (let i = 0; i < n; i++) { a += (x[i] - mx) * (y[i] - my); b += (x[i] - mx) ** 2; c += (y[i] - my) ** 2; }
  return a / Math.sqrt(b * c);
}
const FATORES = [{ c: 'j', nome: 'Juro real de 10 anos dos EUA', dif: true }, { c: 'd', nome: 'Dólar contra outras moedas (DXY)' }, { c: 's', nome: 'S&P 500' }, { c: 'b', nome: 'Brent' }, { c: 'v', nome: 'Medo na bolsa (VIX)', dif: true }, { c: 'c', nome: 'Posição dos fundos no ouro (CFTC)', dif: true }];
function renderMove() {
  const p = document.getElementById('p-move'); p.replaceChildren();
  const C = cores(), per = periodoDe(ANO_INI), pts = D.fatores.filter((x) => noPeriodo(per, x.m));
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(ANO_INI)));
  p.append(el('div', { class: 'aviso', text: 'Só informação: estes dados ajudam a explicar o movimento do ouro, mas não entram no veredito.' }));
  const linhas = FATORES.map((f) => {
    const ox = [], fy = [];
    for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i]; if (a[f.c] == null || b[f.c] == null) continue; ox.push(Math.log(b.o / a.o)); fy.push(f.dif ? b[f.c] - a[f.c] : Math.log(b[f.c] / a[f.c])); }
    const n = ox.length, r = n > 3 ? correlacao(ox, fy) : null, t = r == null ? 0 : Math.abs(r) * Math.sqrt((n - 2) / (1 - r * r));
    return { nome: f.nome, r, meses: n, leitura: r == null ? 'sem dados no período' : t < 2 ? 'sem relação clara' : r > 0 ? 'andam juntos' : 'andam ao contrário' };
  });
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Quanto cada fator anda com o ouro', 'Correlação das variações de cada mês, no período escolhido. 1 = sempre juntos; 0 = sem relação; −1 = sempre opostos. "Sem relação clara" quer dizer que o valor não se separa do zero com esse número de meses.'),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Fator' }, { campo: 'r', rotulo: 'Correlação', num: true, fmt: (v) => fmtN(v, 2) }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'leitura', rotulo: 'Leitura' }], linhas, { livre: true })));
  const com = (c) => pts.filter((x) => x[c] != null);
  const a = graficoMensal('g-juro', 'Juro real de 10 anos dos EUA', 'Título do Tesouro americano protegido da inflação (TIPS), % ao ano. Depois de 2022, o ouro subiu mesmo com o juro real alto.', 240, com('j'), 'j', C.s[0], [], (v) => fmtN(v, 1) + '%', (v) => fmtN(v, 2) + '%');
  const b = graficoMensal('g-dxy', 'Dólar contra outras moedas (DXY)', 'Índice do dólar. Dólar mais forte costuma pesar sobre o ouro.', 240, com('d'), 'd', C.s[0], [], (v) => fmtN(v, 0), (v) => fmtN(v, 1));
  const c = graficoMensal('g-cot', 'Posição dos fundos no ouro', 'Compras menos vendas dos fundos em contratos futuros, em % dos contratos em aberto (CFTC).', 240, com('c'), 'c', C.s[0], [], (v) => fmtN(v, 0) + '%', (v) => fmtN(v, 1) + '%');
  p.append(el('div', { class: 'linha' }, a.g, b.g, c.g)); a.desenhar(); b.desenhar(); c.desenhar();
}

// ------------------------------------------------------------------ Mercado
function eixoTempo(labels, C) {   // marcas conforme o tamanho do período: trimestre, semestre ou ano
  const anos = +labels[labels.length - 1].slice(0, 4) - +labels[0].slice(0, 4), meses = anos <= 2 ? ['01', '04', '07', '10'] : ['01', '07'], curto = anos <= 4, passo = anos > 16 ? 4 : anos > 8 ? 2 : 1, marca = {};
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
  const C = cores(), per = periodoDe(ANO_INI), ls = D.mercado.filter((x) => noPeriodo(per, x[0])), b = ls[0], lab = ls.map((x) => x[0]), anos = (new Date(lab[lab.length - 1]) - new Date(lab[0])) / 31557600000;
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(ANO_INI)));
  const nomes = ['Ouro', 'S&P 500, sem dividendos', 'Dólar aplicado no T-bill'], cor = [corOuro(C), C.brent, C.s[0]], rot = ['Ouro', 'S&P 500', 'T-bill'];
  const res = nomes.map((nome, i) => { const v = ls.map((x) => (1000 * x[i + 1]) / b[i + 1]), f = v[v.length - 1]; return { nome, final: f, ano: anos > 0 ? (f / 1000) ** (1 / anos) - 1 : null, queda: maiorQueda(v), v }; });
  const g = cartaoGrafico('g-mercado', 'US$ 1.000 aplicados', `A partir de ${dataTxt(b[0])}, fim de cada semana. O T-bill é o título de 3 meses do Tesouro americano, com o juro reaplicado.`, 360);
  p.append(el('div', { class: 'cartao solto', style: 'padding:0;border:0;background:none' }, g));
  desenhar(g, { type: 'line', data: { labels: lab, datasets: res.map((r, i) => serie(r.nome, r.v, cor[i], { rotuloFinal: rot[i] })) }, options: opcoesLinha(lab, (v) => 'US$ ' + fmtN(v, 0), { eixoX: eixoTempo(lab, C), rotulosFinais: true, padDir: 66 }) }, (v) => fmtUS(v, 0), { mira: true, titulo: dataTxt, rotuloX: 'Semana', rotulos: lab.map(dataTxt) });
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Resultado de cada aplicação no período', 'Em dólar nominal. Maior queda: fim de semana contra o pico anterior do período.'),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Aplicação' }, { campo: 'final', rotulo: 'US$ 1.000 viraram', num: true, fmt: (v) => fmtUS(v, 0) }, { campo: 'ano', rotulo: 'Ao ano', num: true, fmt: (v) => fmtR(v, 1) }, { campo: 'queda', rotulo: 'Maior queda', num: true, fmt: (v) => fmtR(v) }], res, { livre: true })));
}

// ------------------------------------------------------------------ Bancos centrais
function renderBancos() {
  const p = document.getElementById('p-bancos'); p.replaceChildren();
  const C = cores(), B = D.bancos, per = periodoDe(ANO_INI), pesos = B.peso.filter((x) => noPeriodo(per, x.m)), comp = B.compras.filter((x) => x.a >= per.de && x.a <= per.ate), ult = B.peso[B.peso.length - 1], tonU = B.toneladas[B.toneladas.length - 1];
  p.append(el('div', { class: 'filtros' }, ...filtroPeriodo(ANO_INI)));
  p.append(el('div', { class: 'aviso', text: `Só informação: as 15 maiores economias, com dados do FMI até ${mesTxt(B.fim)}. Quem ainda não informou os últimos meses fica com o último dado. Não entra no veredito.` }));
  const c5 = B.compras.filter((x) => x.a >= ANO_FIM - 4).reduce((s, x) => s + x.t, 0);
  p.append(el('div', { class: 'grade-tiles' },
    tile('Peso do ouro nas reservas', fmtR(ult.p, 1, false), `As 15 economias juntas, em ${mesTxt(ult.m)}`),
    tile('Ouro nas reservas', `${fmtInt(tonU.t)} t`, 'Toneladas das 15 economias'),
    tile(`Compras desde ${ANO_FIM - 4}`, `${fmtSinal(c5, 0)} t`, 'Compras menos vendas das 15 economias; o último ano está incompleto')));
  const g1 = graficoMensal('g-peso', 'Peso do ouro nas reservas', 'Ouro ÷ (ouro + outras reservas). Sobe tanto com compras quanto com a alta do próprio preço.', 280, pesos, 'p', corOuro(C), [], (v) => fmtR(v, 0, false), (v) => fmtR(v, 1, false));
  const g2 = cartaoGrafico('g-compras', 'Compras líquidas de ouro por ano', 'Toneladas, compras menos vendas das 15 economias.', 280);
  p.append(el('div', { class: 'linha dupla', style: 'margin-bottom:16px' }, g1.g, g2)); g1.desenhar();
  const la = comp.map((x) => String(x.a));
  desenhar(g2, { type: 'bar', data: { labels: la, datasets: [{ label: 'Compras líquidas (t)', data: comp.map((x) => x.t), backgroundColor: corOuro(C) }] }, options: opcoesColunas(C, (v) => fmtN(v, 0), { rotulos: la.length <= 12 }) }, (v) => `${fmtInt(v)} t`, { rotuloX: 'Ano' });
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Ouro por país', `Toneladas no fim de 2005 e em ${mesTxt(B.fim)}, com o peso do ouro nas reservas de cada país.`),
    tabelaOrdenavel([{ campo: 'pais', rotulo: 'País' }, { campo: 't_ini', rotulo: 'Toneladas em 2005', num: true, fmt: fmtInt }, { campo: 't_fim', rotulo: 'Toneladas hoje', num: true, fmt: fmtInt }, { campo: 'dif', rotulo: 'Variação (t)', num: true, fmt: (v) => fmtSinal(v, 0) }, { campo: 'peso', rotulo: 'Peso nas reservas', num: true, fmt: (v) => fmtR(v, 1, false) }, { campo: 'ultimo', rotulo: 'Último dado', fmt: mesTxt }], B.paises, { livre: true })));
}

// ------------------------------------------------------------------ Como foi feito
function renderMetodo() {
  const p = document.getElementById('p-metodo'); p.replaceChildren();
  p.append(el('div', { class: 'metodo' },
    caixaLer('A regra do veredito', [[
      'No ouro não há CARO: é reserva de valor e, na história, o termômetro alto não avisou queda.', `BARATO: termômetro até ${fmtInt(R.corte_b)} e preço acima da média dos últimos 12 meses.`, 'NEUTRO: qualquer outro caso, inclusive barato com o preço ainda caindo.',
      `Aviso de esticado: termômetro de ${fmtInt(R.aviso)} ou mais. Comprar ali já significou ficar anos parado; o veredito segue NEUTRO.`,
      'Termômetro: média de três percentis, S&P 500 ÷ ouro (invertido), ouro ÷ Brent e distância da reta de tendência (log), cada um medido só com o passado até o mês.',
      'Sem correção por inflação. Juro real, dólar e bancos centrais ficam só como informação.']], null, false),
    caixaLer('Dados', [[
      'Ouro (GC=F), S&P 500 e dólar (DXY): Yahoo Finance. O ouro é conferido com a Pink Sheet do Banco Mundial.', 'Brent à vista: FRED/EIA. Juro real, T-bill e VIX: FRED.', 'Posição dos fundos: CFTC. Reservas: FMI.']], null, false),
    caixaLer('Como os testes foram feitos', [[
      'Compras: último pregão de cada mês; retorno em 12, 24 e 36 meses (252, 504 e 756 pregões). O ouro não paga proventos.', 'O termômetro pede 60 meses de história, então o teste começa em 08/2005.', 'Janelas independentes: contagem de períodos que não se sobrepõem, para não superestimar a evidência.',
      'Bootstrap por blocos de 24 meses: refaz a história 2.000 vezes para ver quanto a mediana e o melhor corte mudam.', 'Recortes: repete a conta sem 2011–12, sem 2013–15 e só desde 2016.']], null, false),
    caixaLer('Cuidados na leitura', [[
      'O filtro De/Até muda os gráficos e as contas ao lado deles. As tabelas de quedas, episódios e por país, e o teste do corte, seguem com a história inteira.',
      'A linha de tendência dos gráficos é a de hoje. No termômetro, a reta é refeita a cada mês, só com os meses até ali.', 'Poucos episódios independentes: os intervalos de confiança são largos.', 'Relação estatística não é causa. Não é recomendação de investimento.']], null, false)));
  p.append(el('h2', { class: 'secao', text: 'Em que ponto o ouro fica esticado' }));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Os pontos testados para o aviso de esticado', 'Tudo o que ficou em cada ponto ou acima: retorno mediano e parcela das compras que perderam.'),
    tabelaOrdenavel([{ campo: 'ponto', rotulo: 'Ponto', num: true, fmt: fmtInt }, { campo: 'pct', rotulo: 'Meses no ponto ou acima', num: true, fmt: (v) => fmtR(v, 0, false) }, { campo: 'janelas', rotulo: 'Janelas', num: true, fmt: fmtInt }, { campo: 'r12', rotulo: '12 meses', num: true, fmt: (v) => fmtR(v, 1) }, { campo: 'r24', rotulo: '24 meses', num: true, fmt: (v) => fmtR(v, 1) }, { campo: 'r36', rotulo: '36 meses', num: true, fmt: (v) => fmtR(v, 1) },
      { campo: 'perdeu', rotulo: 'Perderam em 24 meses', num: true, fmt: (v) => fmtR(v, 0, false) }, { campo: 'r24_sem', rotulo: '24 meses, sem 2011–12', num: true, fmt: (v) => fmtR(v, 1) }, { campo: 'perdeu_sem', rotulo: 'Perderam, sem 2011–12', num: true, fmt: (v) => fmtR(v, 0, false) }], T.pontos, { livre: true, destaque: (l) => l.ponto === R.aviso })));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('O ouro do Yahoo contra a Pink Sheet', 'Média mensal do GC=F contra a do Banco Mundial, nos meses em que as duas existem.'),
    tabelaOrdenavel([{ campo: 'de', rotulo: 'De', fmt: mesTxt }, { campo: 'ate', rotulo: 'Até', fmt: mesTxt }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'dif', rotulo: 'Diferença média', num: true, fmt: (v) => fmtR(v, 2) }, { campo: 'abs', rotulo: 'Diferença absoluta média', num: true, fmt: (v) => fmtR(v, 2, false) }, { campo: 'max', rotulo: 'Maior diferença', num: true, fmt: (v) => fmtR(v, 2, false) }, { campo: 'cor', rotulo: 'Correlação das variações', num: true, fmt: (v) => fmtN(v, 3) }], D.caro.fontes, { livre: true })));
  p.append(el('h2', { class: 'secao', text: 'Roteiro para repetir a análise' }));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'passo', rotulo: 'Passo' }, { campo: 'pergunta', rotulo: 'Pergunta' }, { campo: 'como', rotulo: 'Como medir' }, { campo: 'regra', rotulo: 'Regra de leitura' }], D.caro.roteiro, { livre: true })));
}

// ------------------------------------------------------------------ abas e início
let abaAtual = 'veredito', feitas = {};
const RENDER = { veredito: renderVeredito, termometro: renderTermometro, ciclo: renderCiclo, move: renderMove, mercado: renderMercado, bancos: renderBancos, metodo: renderMetodo };
function mostrar(aba) {
  abaAtual = aba;
  document.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.aba === aba ? 'true' : 'false'));
  document.querySelectorAll('.painel').forEach((s) => { s.hidden = s.id !== 'p-' + aba; });
  if (!feitas[aba]) { RENDER[aba](); feitas[aba] = true; }
  try { history.replaceState(null, '', '#' + aba); } catch (e) { /* arquivo aberto em modo restrito: segue sem o endereço */ }
}
document.querySelectorAll('[role="tab"]').forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.aba)));
document.getElementById('meta').textContent = `Preços de ${D.data_precos} · gerado em ${D.gerado}`;
if (!TEM_CHART) document.getElementById('aviso-chart').hidden = false;
iniciarTema(() => { feitas = {}; mostrar(abaAtual); });
const abaInicial = (location.hash || '').replace('#', '');
mostrar(Object.prototype.hasOwnProperty.call(RENDER, abaInicial) ? abaInicial : 'veredito');
