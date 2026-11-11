'use strict';
// Seção da Vale. Dados em dados/vale.js, gerados a partir dos Excel do projeto.
const D = window.DADOS;
const R = D.regra, H = D.hoje, V = D.vale, T = D.teste;
const ANO_INI = 2006, ANO_FIM = +D.data_precos.slice(-4);
const estado = { de: ANO_INI, ate: ANO_FIM, indicador: D.indicadores[0].nome, indTipo: 'Trimestral', ativo: 'Minério', sensTipo: 'Anual' };
const E = D.estudo;   // estudo estatístico do ciclo do minério (relatório "Análise de Ciclo - Vale"): números fixos, com dados até E.data, lidos dos resultados do estudo
const DATA_LEITURA = `Leitura escrita em 10/11/2026, com dados até ${E.data}. Os números vêm dos dados; a interpretação não muda sozinha.`;
const grupoRegua = (ini) => E.regua.find((x) => x.nome.startsWith(ini)) || {};
// a faixa do estudo em que o minério do dia está: é o que liga os números fixos do estudo ao preço do dia
const faixaDoDia = () => [...E.faixas].reverse().find((f) => H.minerio >= f.de) || E.faixas[0];

// >>> TEXTOS FIXOS DO ESTUDO (a trava do gerar_vale.py lê este bloco)
// Frases que não mudam com os preços: descrevem o estudo, com dados até E.data. Por isso não podem falar do dia de quem lê, porque o selo e os preços
// mudam a cada atualização. Frase que depende do preço do dia é montada fora deste bloco, com os dados do dia. Nunca falar em sair da ação: CARA é "não alocar".
// Os números citados por extenso aqui são conferidos no gerar_vale.py (fixo()): se o estudo for refeito e eles mudarem, o gerador para até o texto ser revisto.
const TXT = {
  sobre: [
    `Esta aba traz o estudo estatístico do ciclo do minério feito para o relatório "Análise de Ciclo - Vale", com dados até ${E.data}. Os gráficos e as tabelas do estudo são fixos: só mudam quando o estudo for refeito. O veredito, os preços e os cenários da ação são refeitos a cada atualização.`,
    `As compras do estudo são mensais, no último pregão de cada mês, de ${E.ano_ini} a ${E.ano_fim}, com a VALE3 em dólar e com proventos. O minério está em dólar nominal, sem correção pela inflação. Como a história tem poucos ciclos, cada resultado foi comparado com o que apareceria por acaso num preço sem memória.`,
    [`CARA: minério de US$ ${fmtN(R.corte, 0)} ou mais. Indica não alocar.`,
      'BARATA: minério abaixo do preço médio de 10 anos e ação 30% ou mais abaixo do pico de 24 meses, em dólar. Indica oportunidade de alocação.',
      'NEUTRA: os outros casos.',
      'Compra típica: todas as compras do período, sem olhar o minério nem o preço. É a base de comparação.']],
  faixas: `Retorno mediano da VALE3 em dólar, com proventos, e, entre parênteses, a parte das compras que ganhou. Compras mensais de ${E.ano_ini} a ${E.ano_fim}.`,
  faixasNota: 'Quanto mais baixo o minério na compra, maior foi o retorno da ação nos anos seguintes. A relação pode ter vindo em parte do acaso: o teste do estudo indica de 4% a 17% de chance de coincidência, conforme o prazo e o período. O resultado aponta na direção certa, mas com poucos ciclos ele não é uma garantia.',
  epocas: 'A mediana de uma faixa pode esconder resultados opostos. A tabela separa as compras feitas até o fundo do ciclo longo do minério, em dezembro de 2015, das feitas depois. Retorno mediano em 2 anos, em dólar, com proventos.',
  queda: `A queda de 30% da ação só ajudou quando o minério já estava baixo; com o minério de US$ 100 a ${fmtN(R.corte, 0)}, a ação muito caída foi mau sinal. Desde ${E.ano_ini}, a VALE3 passou ${fmtPct(E.lixo_meses, 0, false)} dos meses 30% ou mais abaixo do pico: sozinha, essa condição não distingue os bons momentos.`,
  chances: `Chance de o preço médio de algum mês chegar ao nível indicado, a partir de ${fmtUS(E.ref.minerio)}, o preço de ${E.data}. Oscilação baixa: a dos 2 anos anteriores ao estudo. Oscilação da história: a de 2006 a 2026.`,
  chancesNota: `Nos dois regimes, voltar ao preço médio era mais provável do que cair a US$ 80, mas a queda não era rara. Se a calma continuasse, 8 em cada 10 caminhos ficariam entre ${fmtUS(E.faixa12.calma[0], 0)} e ${fmtUS(E.faixa12.calma[1], 0)} em 12 meses; com a oscilação da história, entre ${fmtUS(E.faixa12.hist[0], 0)} e ${fmtUS(E.faixa12.hist[1], 0)}.`,
  regua: 'Retorno mediano da VALE3 em dólar, com proventos, e parte das compras que ganhou, com a régua de cada época: em cada mês, o preço médio é o dos 10 anos anteriores, só com o que se sabia naquele dia.',
  contas: `Retorno mediano da VALE3 em 2 anos, em dólar, com proventos, das compras tomadas como parecidas com a de ${E.data}. O resultado muda com a definição: a tabela traz as cinco contas possíveis e o limite de cada uma.`,
  cenarioFoto: `O gráfico é a foto de ${E.data}, com a ação e o dólar daquele dia. A tabela acima refaz a mesma conta a cada atualização. As faixas são mais largas do que as publicadas antes: a faixa de 6% a 14% de alta, para o minério a US$ 102,1, media a incerteza da inclinação da relação, e não a do preço da ação.`,
  fig: {
    ciclo: ['Preço mensal do minério de ferro desde 2006, com os picos, os fundos e as fases de baixa marcados',
      'O minério só tem ciclo de mercado desde meados dos anos 2000: até 2004, o preço era fixado uma vez por ano, em contrato entre mineradoras e siderúrgicas. Por trás do ciclo de cerca de 3 anos há um movimento mais longo, de cerca de 7 anos de um fundo ao outro. São só dois ciclos longos, o que não permite projetar datas.'],
    fases: ['Duração em meses e variação do preço em cada fase de alta e de baixa do minério desde 2008',
      'A fase do ciclo, sozinha, não indica fundo: a literatura sobre commodities mostra que o tempo já passado numa baixa não ajuda a prever o fim dela. O ciclo perdeu força nos últimos anos: os picos vêm caindo, e os fundos ficam perto de US$ 90.'],
    nivel: [`Posição do preço do minério de ${E.data} contra os últimos 5 e 10 anos, contra todo o período desde 2006 e contra outros metais`,
      'O preço era baixo contra o passado recente e ficava um pouco abaixo do meio contra o passado longo. A diferença vem do período de 2015 a 2018, quando o minério ficou quase sempre abaixo de US$ 80. Contra os outros metais, a queda é própria do minério, ligada ao aço da China e à oferta nova.'],
    custo: ['Preço médio do minério em cada ano contra o custo total da Vale por tonelada, com a sobra de cada ano',
      'A medida que mais mudou foi a do custo: o custo total da Vale por tonelada entregue, o break-even de caixa, subiu, e a sobra do preço sobre o custo encolheu. O custo dos produtores mais caros do mundo dá a mesma leitura: o Goldman Sachs estimou, em setembro de 2026, que os 10% mais caros da oferta têm custo de cerca de US$ 95 por tonelada, o que costuma segurar as quedas enquanto o frete seguir caro.'],
    faixas_minerio: ['Variação mediana do minério 24 meses depois, por faixa de preço de partida',
      'O histórico do próprio minério confirma que o nível importa. O resultado pede cuidado: um preço sem memória também mostraria parte desse padrão numa amostra de 20 anos. Há sinal de volta à média, mas ele não é forte.'],
    tempo_volta: ['Meses que o minério levou para voltar ao preço médio em cada entrada na faixa de 3% a 20% abaixo dele',
      'O minério costuma voltar rápido ao preço médio quando o desvio é pequeno, mas voltar não garantiu ganho depois. O que separou as entradas de 2012 a 2014 das de 2018 a 2020 foi a oferta, que sobrava em 2014 e faltava em 2019, depois do acidente de Brumadinho.'],
    cenarios_minerio: ['Faixas de preço do minério em 6, 12 e 24 meses nas simulações, com a oscilação baixa e com a da história',
      'A simulação não é previsão: mostra o tamanho da incerteza. A história não garante a continuidade da calma: depois dos anos mais calmos, a oscilação costumou voltar no ano seguinte.'],
    sazonalidade: ['Variação média do minério em cada mês do ano, de 2010 a 2026',
      'Há um efeito de calendário a favor na virada do ano: de 2010 a 2026, dezembro e janeiro foram os meses mais fortes, embora o efeito tenha sido pequeno nas duas últimas viradas.'],
    aco_china: ['Produção anual de aço bruto da China de 2005 a 2026',
      `A demanda vem do aço da China, e ela encolhe. A oferta cresce ao mesmo tempo: a mina de Simandou, na Guiné, fez o primeiro embarque em dezembro de 2025. O custo é o que segura o preço. Na leitura do relatório, o quadro lembra 2014 na direção, e não no tamanho: em 2014 o minério valia mais de US$ 120 e caiu até US$ 39, e em ${E.data} ele já estava no custo dos produtores mais caros.`],
    minerio_vale: ['Variação da VALE3 para cada 1% do minério em cada prazo e parte de cada fator na variação mensal da ação',
      'O minério é o fator que mais pesa na VALE3, e pesa mais quanto maior o prazo. A outra parte vem de fora do minério: dólar, bolsas emergentes, cobre, acidentes, proventos e decisões da empresa. A ligação enfraqueceu nos últimos 3 anos, com o minério quase parado e o cobre ganhando espaço no resultado da Vale.'],
    desde_pico: ['Variação em dólar da VALE3, de outras mineradoras, do minério, do cobre, das bolsas e do dólar desde o pico de abril de 2026',
      'Na leitura do relatório, a queda da ação desde o pico de abril de 2026 devolveu um prêmio sobre o minério e não criou uma margem de proteção: se o minério cair, a ação tende a acompanhar.'],
    cenarios_acao: [`Faixa de preço da VALE3 em 12 meses para cada nível de minério, com os preços de ${E.data}`],
    regua: ['Retorno mediano em 2 anos das compras em CARA, NEUTRA e BARATA, com a CARA dividida em duas épocas e a BARATA dividida pelo nível do minério',
      'O estudo confirma a parte mais importante da régua, que é a CARA, embora o tamanho da perda venha de 2011 a 2013. A BARATA só rendeu com o minério baixo em dólares: de 2012 a 2014, o preço médio de 10 anos estava perto de US$ 130, inflado pela alta de 2008 a 2011, e minério a US$ 100 ou a US$ 128 contava como barato.'],
  },
  // leitura datada: só aparece quando o veredito do dia é BARATA e o minério do dia está na faixa para a qual ela foi escrita
  leituraBarata: `Leitura de 10/11/2026 para a BARATA com o minério de US$ ${E.minerio_baixo} a 100: oportunidade moderada de alocação. O minério perto do custo dos produtores mais caros, estimado em US$ 90 a 95, limita a queda; o aço da China em retração e a oferta nova da Guiné limitam a alta. O preço é bom, mas não é o melhor que a história já ofereceu: as compras que mais renderam vieram com o minério abaixo de US$ ${E.minerio_baixo}.`,
  erros: [
    'Poucos ciclos: a série tem dois ciclos longos e seis curtos. Os testes contra o acaso dão de 0,4% a 17% de chance de coincidência, conforme a medida. É sinal, e não prova.',
    'Referência que se move: o custo que segura o preço subiu com o frete. Se o frete baratear, esse piso desce, e o minério pode cair sem que os produtores mais caros saiam do mercado. O preço médio de 10 anos também se move: de 2012 a 2014 ele estava perto de US$ 130.',
    'Oferta e demanda: uma expansão mais rápida de Simandou ou uma queda maior do aço da China repetiriam 2014 em escala menor. Estímulo chinês ou acidentes na oferta fariam o contrário.',
    'Troca da referência do minério: as cotações de 2026 estão na base de 61% de ferro, cerca de US$ 2,6 por tonelada abaixo da base de 62% usada até 2025. O estudo usa a série como publicada.',
    'Empresa: acidentes como os de Mariana e Brumadinho derrubam a ação sem relação com o minério. A regra do minério não vê crise da própria empresa.',
    'Fontes de mercado: os dados de oferta, estoques e projeções vêm de fontes públicas, nas datas indicadas, e mudam a cada mês.'],
  base61: 'As cotações de 2026 estão na referência de 61% de ferro, cerca de US$ 2,6 por tonelada abaixo da de 62% usada até 2025.',
  metodo: [
    `Estudo de ciclo (aba própria, dados até ${E.data}): preço mensal do minério do Banco Mundial desde 1960 e contrato futuro de Singapura, diário, desde outubro de 2010; VALE3 com proventos, dólar do Banco Central, custos e resultados da Vale, cobre, bolsas e outras mineradoras.`,
    'Ciclo: datação de picos e fundos de Bry e Boschan (1971), na versão de Harding e Pagan (2002). Um pico é o maior preço numa janela de 5 meses para cada lado, com fase mínima de 6 meses e ciclo mínimo de 15.',
    'Volta à média: modelo autorregressivo do logaritmo do preço, com correção de viés, teste de raiz unitária e razão de variâncias.',
    'Teste contra o acaso: simulação de preços sem memória, com reamostragem em blocos das variações históricas, para medir o que apareceria por coincidência na mesma amostra.',
    'Cenários do minério: 40 mil caminhos mensais em cada regime de oscilação, sem tendência, e com volta lenta à média como alternativa.',
    'Minério e ação: regressões com erros de Newey e West (1987) e divisão do poder de explicação entre os fatores. Os cenários da ação usam os erros que de fato ocorreram na relação de 12 meses.',
    `Régua no estudo: compras no último pregão de cada mês, de ${E.ano_ini} a ${E.ano_fim}, com o preço médio de cada época e sem usar dados posteriores.`],
};
// <<< FIM DOS TEXTOS FIXOS DO ESTUDO
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
    el('div', { class: 'cartao' }, cabecalho('Onde o minério está na régua', `A regra olha o contrato de minério de ferro no dia dos preços (${D.data_precos}), em dólar nominal. Corte de CARA, que indica não alocar: ${fmtUS(R.corte, 0)}, escolhido pelo analista depois do teste.`), reguaMinerio())));
  const dif = R.corte / H.minerio - 1;
  p.append(el('div', { class: 'grade-tiles' },
    H.minerio >= R.corte ? tile('Para sair de CARA', `Minério < ${fmtUS(R.corte, 0)}`, `${fmtPct(dif, 1)} do minério de hoje.`)
      : tile('Para virar CARA (não alocar)', `Minério ≥ ${fmtUS(R.corte, 0)}`, `${fmtPct(dif, 1)} do minério de hoje.`),
    V.ver === 'BARATA' ? tile('Para deixar de ser BARATA', `VALE3 > ${fmtRS(V.preco_lixo_rs)}`, `${fmtUS(V.preco_lixo)} com o dólar de hoje; ${fmtPct(V.falta_lixo, 1)} do preço de hoje, ou minério de ${fmtUS(R.piso, 1)} ou mais (${fmtPct(R.piso / H.minerio - 1, 1)}).`)
      : H.minerio < R.piso ? tile('Para virar BARATA', `VALE3 ≤ ${fmtRS(V.preco_lixo_rs)}`, `${fmtUS(V.preco_lixo)} com o dólar de hoje; ${fmtPct(V.falta_lixo, 1)} do preço de hoje, com o minério abaixo de ${fmtUS(R.piso, 1)}.`)
      : tile('Para virar BARATA', `Minério < ${fmtUS(R.piso, 1)}`, `${fmtPct(R.piso / H.minerio - 1, 1)} do minério de hoje, e a ação no "lixo": até ${fmtRS(V.preco_lixo_rs)} com o dólar de hoje.`),
    tile('Minério contra o preço médio', fmtPct(H.minerio / R.piso - 1, 1), `Contra o piso de ${fmtUS(R.piso, 1)}; ${fmtPct(V.meses_minerio_maior, 0, false)} dos meses desde 2006 tiveram minério mais alto que hoje`)));

  // A conclusão vem do Excel "Caro ou barato", já com os números do estudo e com a faixa em que o minério do dia está: a página e o Excel dizem a mesma coisa.
  const con = D.caro.conclusao, achar = (ini) => con.find((t) => t.startsWith(ini));
  const fx = faixaDoDia(), cara13 = grupoRegua('CARA em 2011'), cara20 = grupoRegua('CARA em 2020'), dolarPico = V.cotacao_desde_pico;
  p.append(el('div', { class: 'linha dupla' },
    caixaLer('Conclusão', [
      achar('Veredito:'), achar('No estudo de'), achar('Dentro da faixa'), achar('Ação no lixo'),
      ...(V.ver === 'BARATA' && fx.de === E.minerio_baixo ? [TXT.leituraBarata] : []),
      achar('Deixa de ser') || achar('Vira '), achar('Riscos'),
      `O veredito e os preços mudam sozinhos a cada atualização. Os números do estudo têm dados até ${E.data} e só mudam quando ele for refeito. A aba "Estudo de ciclo" traz os gráficos e as tabelas.`].filter(Boolean), null, false),
    caixaLer('Onde a análise pode errar', [[
      ...TXT.erros.slice(0, 4),
      `Câmbio: a análise é em dólar. Desde o pico de ${dataTxt(V.pico_data)}, a cotação do dólar ${dolarPico >= 0 ? 'subiu' : 'caiu'} ${fmtPct(Math.abs(dolarPico), 1, false)}, e o veredito pode mudar sem a ação se mexer na bolsa.`,
      `Corte escolhido com a história: o corte de ${fmtUS(R.corte, 0)} foi escolhido depois de olhar todo o período e é uma referência de fase alta do ciclo, não um número exato. No estudo, a perda da CARA vem sobretudo de 2011 a 2013 (mediana de ${fmtPct(cara13.r2, 1)} em 2 anos); de 2020 a 2024 ela foi menor (${fmtPct(cara20.r2, 1)}). Vale revisar o corte se os custos mudarem de patamar: o break-even de caixa está em ${fmtUS(D.margem.niveis.find((x) => x.chave === 'break_even').custo, 1)} (${D.margem.tri}).`,
      ...TXT.erros.slice(4)]], DATA_LEITURA, false)));

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
  const cara = grupoRegua('CARA (não alocar)'), cara20 = grupoRegua('CARA em 2020');
  p.append(el('div', { class: 'metodo' },
    caixaLer('A regra do veredito', [[
      `CARA: minério de ${fmtUS(R.corte, 0)} ou mais. Indica não alocar. O corte foi escolhido pelo analista depois do teste. No estudo, ${fmtPct(1 - cara.g2, 1, false)} das ${fmtInt(cara.n)} compras de ${E.ano_ini} a ${E.ano_fim} feitas nesse nível ou acima perderam em 2 anos, com mediana de ${fmtPct(cara.r2, 1)}; nas ${fmtInt(cara20.n)} compras de 2020 a 2024, ${fmtPct(1 - cara20.g2, 1, false)} perderam, com mediana de ${fmtPct(cara20.r2, 1)}.`,
      `BARATA: minério abaixo de ${fmtUS(R.piso, 1)} e a ação 30% ou mais abaixo do pico de 24 meses, em dólar.`, 'NEUTRA: qualquer outro caso.',
      'Tudo em dólar: a VALE3 é o preço na bolsa ÷ cotação PTAX do mesmo dia.',
      `Preço médio de ${fmtFaixa()}: as medianas dos meses dos últimos 10 e 20 anos, recalculadas a cada atualização.`,
      'Minério em dólar nominal, sem correção pela inflação. EBITDA, margem e múltiplos ficam só como informação.']], null, false),
    caixaLer('Dados', [[
      'VALE3 e contrato de minério de ferro (VALE3.SA e TIO=F): Yahoo Finance. O preço com proventos é o ajustado do Yahoo.', 'Minério antes de 11/2010: Pink Sheet do Banco Mundial.', 'Cotação do dólar (PTAX): Banco Central, só para converter a VALE3.',
      'Indicadores, custos e sensibilidade: relatório de indicadores históricos da Vale e cálculos da AUVP.']], null, false),
    caixaLer('Como o estudo e o teste do corte foram feitos', [TXT.metodo, [
      'Teste do corte de CARA (05/11/2026): compras no último pregão de cada mês, desde 2006; retorno em 12 e 24 meses (252 e 504 pregões), em dólar, com proventos.',
      'Janelas independentes: contagem de períodos que não se sobrepõem, para não superestimar a evidência.',
      'Recortes do teste do corte: repete a conta sem 2010–13 e só desde 2014, para ver se o resultado depende de um período.']], null, false),
    caixaLer('Cuidados na leitura', [[
      'Na Pink Sheet, até 2005 o valor é o preço anual de contrato (Carajás, em centavos por unidade de ferro); de 2006 a 11/2008, preço à vista de 63,5% de ferro; desde 12/2008, 62%. Por isso o teste das compras começa em 2006.',
      'O contrato do Yahoo liquida pela média do mês: no começo do mês ele dá um salto, e o último dia do mês fica perto da média mensal.', 'O Yahoo só traz proventos da VALE3 desde 04/2008: as compras de 2006–08 estão um pouco subestimadas.',
      'O filtro De/Até muda os gráficos e as contas ao lado deles. As tabelas de crises e de sensibilidade e o teste do corte seguem com a história inteira.',
      TXT.base61, 'Poucos episódios independentes: os intervalos de confiança são largos.', 'Relação estatística não é causa. Não é recomendação de investimento.']], null, false)));
  p.append(el('h2', { class: 'secao', text: 'A emenda das duas fontes de minério' }));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Média mensal do contrato do Yahoo contra a Pink Sheet', 'Nos meses em que as duas existem. É o que autoriza usar a Pink Sheet para completar a janela de 20 anos.'),
    tabelaOrdenavel([{ campo: 'de', rotulo: 'De' }, { campo: 'ate', rotulo: 'Até' }, { campo: 'meses', rotulo: 'Meses', num: true, fmt: fmtInt }, { campo: 'dif', rotulo: 'Diferença média', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'abs', rotulo: 'Diferença absoluta média', num: true, fmt: (v) => fmtPct(v, 1, false) },
      { campo: 'max', rotulo: 'Maior diferença', num: true, fmt: (v) => fmtPct(v, 1, false) }, { campo: 'cor', rotulo: 'Correlação dos níveis', num: true, fmt: (v) => fmtN(v, 3) }, { campo: 'cor_var', rotulo: 'Correlação das variações', num: true, fmt: (v) => fmtN(v, 3) }], D.caro.emenda, { livre: true })));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Os pontos testados para CARA', `Teste do corte, de 05/11/2026, com compras desde 2006: por isso os números diferem dos do estudo, que usa compras de ${E.ano_ini} a ${E.ano_fim}. Tudo o que ficou em cada ponto ou acima: retorno mediano em 24 meses, em dólar e com proventos, e parcela das compras que perderam. O ponto de ${fmtUS(R.media_2004, 1)} é a média dos meses desde 2004, testada antes.`),
    tabelaOrdenavel([{ campo: 'ponto', rotulo: 'Ponto', num: true, fmt: (v) => fmtUS(v, Number.isInteger(v) ? 0 : 1) }, { campo: 'pct', rotulo: 'Meses em CARA', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'janelas', rotulo: 'Janelas', num: true, fmt: fmtInt },
      { campo: 'r24', rotulo: 'Retorno: tudo', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'r24_sem', rotulo: 'Retorno: sem 2010–13', num: true, fmt: (v) => fmtPct(v, 1) }, { campo: 'r24_d14', rotulo: 'Retorno: desde 2014', num: true, fmt: (v) => fmtPct(v, 1) },
      { campo: 'perdeu', rotulo: 'Perderam: tudo', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'perdeu_sem', rotulo: 'Perderam: sem 2010–13', num: true, fmt: (v) => fmtPct(v, 0, false) }, { campo: 'perdeu_d14', rotulo: 'Perderam: desde 2014', num: true, fmt: (v) => fmtPct(v, 0, false) }], D.caro.pontos, { livre: true, destaque: (l) => l.ponto === R.corte })));
  p.append(el('h2', { class: 'secao', text: 'Roteiro para repetir a análise' }));
  p.append(el('div', { class: 'cartao solto' }, tabelaOrdenavel([{ campo: 'passo', rotulo: 'Passo' }, { campo: 'pergunta', rotulo: 'Pergunta' }, { campo: 'como', rotulo: 'Como medir' }, { campo: 'regra', rotulo: 'Regra de leitura' }], D.caro.roteiro, { livre: true })));
}

// ------------------------------------------------------------------ Estudo de ciclo: os gráficos e as tabelas do estudo do minério (fixos, com dados até E.data) e os cenários da ação (refeitos com os preços do dia)
function figuraEstudo(arq, alt, textos) {
  return el('figure', { class: 'cartao solto estudo-fig' },
    el('img', { src: `assets/estudo_vale/${arq}.webp`, alt, loading: 'lazy', style: 'display:block;width:100%;height:auto;border-radius:8px;background:#fff;margin-bottom:10px' }),   // estilo aqui também: o estilo.css pode vir do cache
    ...textos.map((t) => el('p', { class: 'cartao-sub', text: t })));
}
// A ação em 12 meses para cada nível de minério, pela relação medida no estudo e com os preços do dia. Com os preços da data do estudo, dá a tabela do relatório (conferido no gerar_vale.py).
function cenariosAcao() {
  const r = E.reg12, niveis = [...new Set([70, 80, H.minerio, 95, R.piso, 115, R.corte])].sort((a, b) => a - b);
  return niveis.map((m) => {
    const c = r.a + r.b * Math.log(m / H.minerio), q = r.q.map((e) => V.preco_rs * Math.exp(c + e));
    return { minerio: m, parado: m === H.minerio, var_min: m / H.minerio - 1, centro: q[2], var_acao: q[2] / V.preco_rs - 1, m_de: q[1], m_ate: q[3], o_de: q[0], o_ate: q[4] };
  });
}
function renderEstudo() {
  const p = document.getElementById('p-estudo'); p.replaceChildren();
  const fx = faixaDoDia(), F = TXT.fig;
  const ret = (r, g, d = 1) => (r == null ? '—' : `${fmtPct(r, d)} (${fmtPct(g, 0, false)})`);
  const nota = (t) => el('p', { class: 'cartao-sub', style: 'margin-top:10px', text: t });
  const faixaChance = (de, ate) => { const a = Math.round(de * 100), b = Math.round(ate * 100); return b === 0 ? '0%' : a === 0 ? `até ${b}%` : a === b ? `${a}%` : `${a}% a ${b}%`; };
  p.append(caixaLer('O estudo do relatório', TXT.sobre, null));

  p.append(el('h2', { class: 'secao', text: 'O ciclo do minério' }));
  p.append(figuraEstudo('ciclo', F.ciclo[0], F.ciclo.slice(1)));
  p.append(figuraEstudo('fases', F.fases[0], F.fases.slice(1)));

  p.append(el('h2', { class: 'secao', text: 'O nível do preço' }));
  p.append(figuraEstudo('nivel', F.nivel[0], F.nivel.slice(1)));
  p.append(figuraEstudo('custo', F.custo[0], F.custo.slice(1)));
  p.append(figuraEstudo('faixas_minerio', F.faixas_minerio[0], F.faixas_minerio.slice(1)));

  p.append(el('h2', { class: 'secao', text: 'O tempo de volta ao preço médio' }));
  p.append(figuraEstudo('tempo_volta', F.tempo_volta[0], F.tempo_volta.slice(1)));
  p.append(figuraEstudo('cenarios_minerio', F.cenarios_minerio[0], F.cenarios_minerio.slice(1)));
  const CH = ['piso_calma', 'piso_hist', 'c80_calma', 'c80_hist', 'c130_calma', 'c130_hist'];
  const chances = E.chances.map((c) => { const o = { prazo: c.prazo }; for (const k of CH) { o[k] = c[k][0]; o[k + '_ate'] = c[k][1]; } return o; });
  const colChance = (k, rotulo) => ({ campo: k, rotulo, num: true, fmt: (v, l) => faixaChance(v, l[k + '_ate']) });
  p.append(el('div', { class: 'cartao solto' }, cabecalho('Chances para o minério em cada prazo', TXT.chances),
    tabelaOrdenavel([{ campo: 'prazo', rotulo: 'Prazo', num: true, fmt: (v) => `${v} meses` },
      colChance('piso_calma', `Voltar a ${fmtUS(E.ref.piso, 1)}, oscilação baixa`), colChance('piso_hist', `Voltar a ${fmtUS(E.ref.piso, 1)}, oscilação da história`),
      colChance('c80_calma', 'Cair a US$ 80, oscilação baixa'), colChance('c80_hist', 'Cair a US$ 80, oscilação da história'),
      colChance('c130_calma', `Chegar a ${fmtUS(R.corte, 0)}, oscilação baixa`), colChance('c130_hist', `Chegar a ${fmtUS(R.corte, 0)}, oscilação da história`)], chances, { livre: true }),
    nota(TXT.chancesNota)));
  p.append(figuraEstudo('sazonalidade', F.sazonalidade[0], F.sazonalidade.slice(1)));

  p.append(el('h2', { class: 'secao', text: 'O que move o minério' }));
  p.append(figuraEstudo('aco_china', F.aco_china[0], F.aco_china.slice(1)));

  p.append(el('h2', { class: 'secao', text: 'Quanto o minério puxa a Vale' }));
  p.append(figuraEstudo('minerio_vale', F.minerio_vale[0], F.minerio_vale.slice(1)));
  p.append(figuraEstudo('desde_pico', F.desde_pico[0], F.desde_pico.slice(1)));

  p.append(el('h2', { class: 'secao', text: 'A ação por nível de minério' }));
  const cen = cenariosAcao(), par = cen.find((x) => x.parado);
  p.append(el('div', { class: 'cartao solto' }, cabecalho('A VALE3 em 12 meses, por nível de minério',
    `Preço da ação em reais, com proventos e com o dólar parado em R$ ${fmtN(V.ptax, 2)}, a partir da ação a ${fmtRS(V.preco_rs)} e do minério a ${fmtUS(H.minerio)} (preços de ${D.data_precos}). Relação medida no estudo: em 12 meses, a ação anda ${fmtN(E.reg12.b, 2)}% para cada 1% do minério, com erro típico de ${fmtPct(E.reg12.sd, 0, false)}. As faixas usam os erros que de fato ocorreram na história.`),
    tabelaOrdenavel([{ campo: 'minerio', rotulo: 'Minério em 12 meses', num: true, fmt: (v, l) => (l.parado ? `parado em ${fmtUS(v)}` : fmtUS(v, Number.isInteger(v) ? 0 : 1)) },
      { campo: 'var_min', rotulo: 'Variação do minério', num: true, fmt: (v, l) => (l.parado ? '—' : fmtPct(v, 0)) },
      { campo: 'centro', rotulo: 'Centro da estimativa', num: true, fmt: (v, l) => `${fmtRS(v, 0)} (${fmtPct(l.var_acao, 0)})` },
      { campo: 'm_de', rotulo: 'Metade dos casos', num: true, fmt: (v, l) => `${fmtRS(v, 0)} a ${fmtRS(l.m_ate, 0)}` },
      { campo: 'o_de', rotulo: '8 em cada 10 casos', num: true, fmt: (v, l) => `${fmtRS(v, 0)} a ${fmtRS(l.o_ate, 0)}` }], cen, { livre: true, destaque: (l) => l.parado }),
    nota(`Acertar o minério resolve só metade da conta: com o minério parado, a ação ficou entre ${fmtRS(par.m_de, 0)} e ${fmtRS(par.m_ate, 0)} em metade dos casos da história. O nível de US$ 95 é a projeção do Banco Mundial para 2027, feita em outubro de 2026.`)));
  p.append(figuraEstudo('cenarios_acao', F.cenarios_acao[0], [TXT.cenarioFoto]));

  const linhasF = [...E.faixas.map((f) => ({ ...f, doDia: f === fx })), { nome: 'Todas as compras', ...E.todas }];
  p.append(el('div', { class: 'cartao solto' }, cabecalho('A VALE3 por faixa de minério na compra', `${TXT.faixas} A linha destacada é a faixa em que o minério está no dia dos preços (${fmtUS(H.minerio)} em ${D.data_precos}).`),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Minério na compra', fmt: (v, l) => v + (l.doDia ? ' (faixa do dia)' : '') },
      { campo: 'n2', rotulo: 'Compras com resultado em 2 anos', num: true, fmt: fmtInt },
      { campo: 'r1', rotulo: 'Em 1 ano', num: true, fmt: (v, l) => ret(v, l.g1) }, { campo: 'r2', rotulo: 'Em 2 anos', num: true, fmt: (v, l) => ret(v, l.g2) },
      { campo: 'r5', rotulo: 'Em 5 anos', num: true, fmt: (v, l) => ret(v, l.g5) }], linhasF, { livre: true, destaque: (l) => l.doDia }),
    nota(TXT.faixasNota)));
  const epocas = E.faixas.flatMap((f) => f.epocas.map((e) => ({ faixa: f.nome, epoca: e.antes ? 'Até o fundo de 12/2015' : 'Depois do fundo de 12/2015', anos: e.anos, n: e.n, r2: e.r2, g2: e.g2, doDia: f === fx })));
  const quedas = E.faixas.map((f) => ({ faixa: f.nome, ln: f.lixo.n, lr: f.lixo.r2, lg: f.lixo.g2, dn: f.demais.n, dr: f.demais.r2, dg: f.demais.g2, doDia: f === fx }));
  p.append(el('div', { class: 'linha dupla', style: 'margin-bottom:16px' },
    el('div', { class: 'cartao' }, cabecalho('As duas épocas dentro de cada faixa', TXT.epocas),
      tabelaOrdenavel([{ campo: 'faixa', rotulo: 'Minério na compra' }, { campo: 'epoca', rotulo: 'Época' }, { campo: 'anos', rotulo: 'Anos das compras' }, { campo: 'n', rotulo: 'Compras', num: true, fmt: fmtInt },
        { campo: 'r2', rotulo: 'Em 2 anos', num: true, fmt: (v, l) => ret(v, l.g2) }], epocas, { livre: true, destaque: (l) => l.doDia })),
    el('div', { class: 'cartao' }, cabecalho('A queda de 30% da ação em cada faixa', TXT.queda),
      tabelaOrdenavel([{ campo: 'faixa', rotulo: 'Minério na compra' }, { campo: 'ln', rotulo: 'Ação 30% ou mais abaixo do pico: compras', num: true, fmt: fmtInt }, { campo: 'lr', rotulo: 'Em 2 anos', num: true, fmt: (v, l) => ret(v, l.lg) },
        { campo: 'dn', rotulo: 'Demais compras', num: true, fmt: fmtInt }, { campo: 'dr', rotulo: 'Em 2 anos', num: true, fmt: (v, l) => ret(v, l.dg) }], quedas, { livre: true, destaque: (l) => l.doDia }))));

  p.append(el('h2', { class: 'secao', text: 'A régua da casa à luz do estudo' }));
  p.append(figuraEstudo('regua', F.regua[0], F.regua.slice(1)));
  p.append(el('div', { class: 'cartao solto' }, cabecalho('A régua em números', TXT.regua),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Situação' }, { campo: 'n', rotulo: 'Compras', num: true, fmt: fmtInt }, { campo: 'r2', rotulo: 'Em 2 anos', num: true, fmt: (v, l) => ret(v, l.g2) },
      { campo: 'r5', rotulo: 'Em 5 anos', num: true, fmt: (v, l) => ret(v, l.g5) }], E.regua, { livre: true })));
  p.append(el('div', { class: 'cartao solto' }, cabecalho(`O nível de ${E.data} em cinco contas`, TXT.contas),
    tabelaOrdenavel([{ campo: 'nome', rotulo: 'Compras tomadas como parecidas' }, { campo: 'n', rotulo: 'Compras', num: true, fmt: fmtInt }, { campo: 'r2', rotulo: 'Em 2 anos', num: true, fmt: (v) => fmtPct(v, 1) },
      { campo: 'g2', rotulo: 'Ganharam', num: true, fmt: (v) => fmtPct(v, 1, false) }, { campo: 'limite', rotulo: 'Limite da conta' }], E.contas, { livre: true })));
}

// ------------------------------------------------------------------ abas e início
let abaAtual = 'veredito', feitas = {};
const RENDER = { veredito: renderVeredito, estudo: renderEstudo, minerio: renderMinerio, margem: renderMargem, indicadores: renderIndicadores, mercado: renderMercado, metodo: renderMetodo };
function mostrar(aba) {
  abaAtual = aba;
  document.querySelectorAll('[role="tab"]').forEach((b) => b.setAttribute('aria-selected', b.dataset.aba === aba ? 'true' : 'false'));
  document.querySelectorAll('.painel').forEach((s) => { s.hidden = s.id !== 'p-' + aba; });
  if (!feitas[aba]) { RENDER[aba](); feitas[aba] = true; }
  try { history.replaceState(null, '', '#' + aba); } catch (e) { /* arquivo aberto em modo restrito: segue sem o endereço */ }
}
document.querySelectorAll('[role="tab"]').forEach((b) => b.addEventListener('click', () => mostrar(b.dataset.aba)));
document.getElementById('meta').textContent = `Preços de ${D.data_precos} · balanços até ${D.margem.tri} · estudo do minério com dados até ${E.data} · gerado em ${D.gerado}`;
if (!TEM_CHART) document.getElementById('aviso-chart').hidden = false;
iniciarTema(() => { feitas = {}; mostrar(abaAtual); });
const abaInicial = (location.hash || '').replace('#', '');
mostrar(Object.prototype.hasOwnProperty.call(RENDER, abaInicial) ? abaInicial : 'veredito');
