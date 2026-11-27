/* =====================================================================
   DADOS EDITÁVEIS: troque aqui e a página toda se atualiza.
   Tudo que estiver entre [COLCHETES] precisa ser preenchido antes de publicar.
   ===================================================================== */
const CONFIG = {
  /* Link do grupo do WhatsApp: todos os botões levam para ele, menos o da seção do valor. */
  linkGrupo: 'https://chat.whatsapp.com/J3gs56NgzSqK2GQkw09Z9s?s=cl&p=i&mlu=4&ilr=4&iam=2',
  linkMatricula: 'https://script.google.com/macros/s/AKfycbxgiasctq3Oh_xgySZvMTWe5_PsK639J1LW0L-Saj3h3viDIr4I2dctkKlDgc1qiE6q/exec?pagina=matricula', // só o botão da seção do valor
  aulas: 6,
  horasPorAula: 5,
  formasPagamento: 'Pix ou dinheiro, à vista, ou cartão de crédito em até 12x (com juros).',
  preco: 494.90,            // à vista, no Pix ou no dinheiro
  parcelas: 12,
  valorParcela: 49.49,      // no cartão de crédito, com juros
  aVista: 'À vista, no Pix ou em dinheiro',
  parcelamento: 'Ou no cartão de crédito em até 12x (com juros)',
  fimLote: '2026-12-06T23:59:59-03:00', // fim do 1º lote: depois disso os avisos do lote somem (confira o preço!)
  local: 'O local ainda será definido',
  horarios: 'os horários serão combinados no grupo da turma',
  inicioAulas: 'As aulas serão iniciadas em dezembro', // troque pela data exata quando for definida
  fimInscricoes: '2026-12-14T23:59:59-03:00', // depois disso o aviso de inscrições abertas some sozinho
  prova: '2027-02-28T08:00:00-03:00', // prazo real do contador (horário de Brasília)
  vagasTurma: null           // número REAL de vagas na sala, ex.: 30. Deixe null se não houver.
};

/* ===================================================================== */

document.documentElement.classList.add('js');

/* Link do grupo em todos os botões (data-cta), menos o da seção do valor, que leva à matrícula. */
const linkGrupo = CONFIG.linkGrupo;
document.querySelectorAll('[data-cta]').forEach((a) => { a.href = a.dataset.cta === 'preco' ? CONFIG.linkMatricula : linkGrupo; });

const vagas = Number.isInteger(CONFIG.vagasTurma) && CONFIG.vagasTurma > 0 ? CONFIG.vagasTurma : null;
const [precoInteiro, precoCentavos] = CONFIG.preco.toFixed(2).split('.');
const brl = (v) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const [parcelaInteiro, parcelaCentavos] = CONFIG.valorParcela.toFixed(2).split('.');
const totalCartao = brl(Math.round(CONFIG.parcelas * CONFIG.valorParcela * 100) / 100);
const textos = {
  parcelasVezes: `${CONFIG.parcelas}x de`,
  parcelaInteiro,
  parcelaCentavos: ',' + parcelaCentavos,
  parcelamentoCurto: `${CONFIG.parcelas}x de R$\u00a0${brl(CONFIG.valorParcela)}`,
  totalCartao: `No cartão de crédito, total de R$\u00a0${totalCartao} (com juros)`,
  totalCurto: `total de R$\u00a0${totalCartao}, com juros`,
  preco: `R$ ${precoInteiro},${precoCentavos}`,
  precoInteiro,
  precoCentavos: ',' + precoCentavos,
  aVista: CONFIG.aVista,
  parcelamento: CONFIG.parcelamento,
  fimLote: new Date(CONFIG.fimLote).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
  formasPagamento: CONFIG.formasPagamento,
  local: CONFIG.local,
  horarios: CONFIG.horarios,
  inicio: CONFIG.inicioAulas,
  vagasCurto: vagas ? `${vagas} vagas na turma` : 'Vagas limitadas à capacidade da sala',
  vagasLongo: vagas ? `${vagas} vagas na turma` : 'Vagas limitadas à capacidade da sala'
};
document.querySelectorAll('[data-texto]').forEach((el) => {
  const v = textos[el.dataset.texto];
  if (v !== undefined) el.textContent = v;
});

/* Aviso de inscrições do concurso: some depois do último dia. */
if (Date.now() > new Date(CONFIG.fimInscricoes).getTime()) document.getElementById('avisoInscricoes')?.remove();

/* Avisos do 1º lote: somem depois do último dia. */
if (Date.now() > new Date(CONFIG.fimLote).getTime()) document.querySelectorAll('[data-lote]').forEach((el) => el.remove());

document.getElementById('ano').textContent = new Date().getFullYear();

/* ===== Contador até a prova (prazo real, nunca reinicia) ===== */
const prazo = new Date(CONFIG.prova).getTime();
const contador = document.getElementById('contador');
function textoContador(agora) {
  const resta = prazo - agora;
  if (resta <= 0) return 'É hoje!';
  const min = Math.ceil(resta / 60000);
  const d = Math.floor(min / 1440);
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;
  const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;
  if (d > 0) return h > 0 ? `${plural(d, 'dia', 'dias')} e ${plural(h, 'hora', 'horas')}` : plural(d, 'dia', 'dias');
  if (h > 0) return m > 0 ? `${plural(h, 'hora', 'horas')} e ${m} min` : plural(h, 'hora', 'horas');
  return `${m} min`;
}
function atualizarContador() {
  contador.textContent = textoContador(Date.now());
  if (Date.now() >= prazo) {
    contador.closest('.barra-topo').innerHTML = '<span>A prova do concurso é <strong>hoje</strong>. Boa prova!</span>';
    return;
  }
  setTimeout(atualizarContador, 60000 - (Date.now() % 60000) + 50);
}
atualizarContador();
window.textoContador = textoContador; // usado nos testes

/* ===== Aparecer ao rolar ===== */
const reduzir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revelaveis = document.querySelectorAll('.revelar, .anima-linha');

/* Cascata: itens irmãos aparecem um depois do outro (no máximo 0,4 s de espera). */
revelaveis.forEach((el) => {
  const irmaos = [...el.parentElement.children].filter((x) => x.classList.contains('revelar'));
  const i = irmaos.indexOf(el);
  if (i > 0) el.style.setProperty('--atraso', `${Math.min(i * 0.08, 0.4)}s`);
});

/* Contagem animada dos números, quando aparecem na tela. */
function contar(el) {
  const fim = Number(el.dataset.contar);
  const formatar = (n) => n.toLocaleString('pt-BR');
  el.style.minWidth = `${formatar(fim).length}ch`;
  if (reduzir) { el.textContent = formatar(fim); return; }
  const duracao = 1200;
  const inicio = performance.now();
  const passo = (agora) => {
    const t = Math.min(1, (agora - inicio) / duracao);
    const suave = 1 - Math.pow(1 - t, 3);
    el.textContent = formatar(Math.round(fim * suave));
    if (t < 1) requestAnimationFrame(passo);
  };
  el.textContent = '0';
  requestAnimationFrame(passo);
}
const contadores = document.querySelectorAll('[data-contar]');
if ('IntersectionObserver' in window && !reduzir) {
  const obsNum = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { contar(e.target); obsNum.unobserve(e.target); } });
  }, { threshold: 0.6 });
  contadores.forEach((el) => obsNum.observe(el));
} else {
  contadores.forEach(contar);
}

/* Barra de progresso da leitura. */
const progresso = document.getElementById('progresso');
let pedidoProgresso = 0;
function atualizarProgresso() {
  pedidoProgresso = 0;
  const total = document.documentElement.scrollHeight - innerHeight;
  progresso.style.transform = `scaleX(${total > 0 ? Math.min(1, scrollY / total) : 0})`;
}
addEventListener('scroll', () => { if (!pedidoProgresso) pedidoProgresso = requestAnimationFrame(atualizarProgresso); }, { passive: true });
atualizarProgresso();
if (reduzir || !('IntersectionObserver' in window)) {
  revelaveis.forEach((el) => el.classList.add('visivel'));
} else {
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('visivel'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  revelaveis.forEach((el) => obs.observe(el));
}

/* ===== Barra fixa no celular: aparece depois do hero, some na chamada final ===== */
const barra = document.getElementById('barraCelular');
const barraBotao = barra.querySelector('a');
let heroVisivel = true;
let finalVisivel = false;
function atualizarBarra() {
  const mostrar = !heroVisivel && !finalVisivel;
  barra.classList.toggle('visivel', mostrar);
  barra.setAttribute('aria-hidden', String(!mostrar));
  barraBotao.tabIndex = mostrar ? 0 : -1;
}
if ('IntersectionObserver' in window) {
  new IntersectionObserver(([e]) => { heroVisivel = e.isIntersecting; atualizarBarra(); }).observe(document.getElementById('topo'));
  new IntersectionObserver(([e]) => { finalVisivel = e.isIntersecting; atualizarBarra(); }).observe(document.getElementById('final'));
}

/* ===== Quiz: uma pergunta por vez, feedback na hora, funciona só com teclado ===== */
const PERGUNTAS = [
  {
    texto: 'Qual lei regulamenta o exercício profissional da enfermagem?',
    opcoes: ['Lei 8.080/1990', 'Lei 7.498/1986', 'Lei 8.142/1990', 'Lei 6.259/1975'],
    certa: 1,
    explicacao: 'A Lei 8.080 é a Lei Orgânica da Saúde; a 7.498/86 trata do exercício da enfermagem.'
  },
  {
    texto: 'No concurso de Anchieta, quantos pontos valem as 10 questões de Conhecimentos Específicos?',
    opcoes: ['10', '20', '35', '50'],
    certa: 2,
    explicacao: 'Cada questão específica tem peso 3,5. São 35 dos 100 pontos da prova.'
  },
  {
    texto: 'Qual lei trata da participação da comunidade na gestão do SUS?',
    opcoes: ['Lei 7.498/1986', 'Lei 8.080/1990', 'Lei 8.142/1990', 'Decreto 7.508/2011'],
    certa: 2,
    explicacao: 'A Lei 8.142/90 trata da participação da comunidade e das transferências de recursos.'
  }
];
const quiz = document.getElementById('quizCaixa');
let atual = 0;
let acertos = 0;

function mostrarPergunta() {
  const p = PERGUNTAS[atual];
  quiz.innerHTML = `
    <p class="quiz-progresso">Pergunta ${atual + 1} de ${PERGUNTAS.length}</p>
    <p class="quiz-pergunta" id="quizPergunta" tabindex="-1">${p.texto}</p>
    <div class="quiz-opcoes" role="group" aria-labelledby="quizPergunta">
      ${p.opcoes.map((o, i) => `<button type="button" class="quiz-opcao" data-i="${i}"><span class="quiz-letra" aria-hidden="true">${'ABCD'[i]}</span><span>${o}</span></button>`).join('')}
    </div>
    <div class="quiz-feedback hidden" role="status" aria-live="polite"></div>
    <div class="quiz-acoes hidden"><button type="button" class="quiz-proxima">${atual < PERGUNTAS.length - 1 ? 'Próxima pergunta' : 'Ver resultado'}</button></div>`;
  quiz.querySelectorAll('.quiz-opcao').forEach((b) => b.addEventListener('click', () => responder(Number(b.dataset.i))));
  quiz.querySelector('.quiz-proxima').addEventListener('click', proxima);
}

function responder(i) {
  const p = PERGUNTAS[atual];
  const botoes = quiz.querySelectorAll('.quiz-opcao');
  botoes.forEach((b) => { b.disabled = true; });
  botoes[p.certa].classList.add('certa');
  const fb = quiz.querySelector('.quiz-feedback');
  if (i === p.certa) {
    acertos++;
    fb.className = 'quiz-feedback ok';
    fb.textContent = `Isso! ${p.explicacao}`;
  } else {
    botoes[i].classList.add('errada');
    fb.className = 'quiz-feedback erro';
    fb.textContent = `Quase. A certa é a letra ${'ABCD'[p.certa]}. ${p.explicacao}`;
  }
  const acoes = quiz.querySelector('.quiz-acoes');
  acoes.classList.remove('hidden');
  acoes.querySelector('button').focus();
}

function proxima() {
  atual++;
  if (atual < PERGUNTAS.length) {
    mostrarPergunta();
    quiz.querySelector('.quiz-pergunta').focus();
    return;
  }
  /* Frase e botão mudam conforme o número de acertos. */
  const RESULTADOS = {
    3: { frase: 'Mandou bem! Agora imagine isso em todas as disciplinas da prova.', botao: 'Quero chegar na prova sabendo tudo isso' },
    2: { frase: 'Quase lá! Faltou uma, e na prova cada questão específica vale 3,5 pontos. É nesse detalhe que a vaga é decidida, e é ele que a gente treina em sala.', botao: 'Quero garantir os pontos que faltam' },
    outros: { frase: 'Questões assim fazem diferença na classificação. É exatamente isso que a gente treina em sala.', botao: 'Quero chegar na prova sabendo tudo isso' }
  };
  const r = RESULTADOS[acertos] || RESULTADOS.outros;
  quiz.innerHTML = `
    <div class="quiz-resultado">
      <p class="quiz-pergunta" tabindex="-1">Você acertou ${acertos} de ${PERGUNTAS.length}.</p>
      <p>${r.frase}</p>
      <a class="botao botao-grande" data-cta="quiz" href="${linkGrupo}" target="_blank" rel="noopener">${r.botao}</a>
    </div>`;
  quiz.querySelector('.quiz-pergunta').focus();
}
mostrarPergunta();
