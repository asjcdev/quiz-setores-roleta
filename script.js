'use strict';

// util de seleção rápida
const $ = (sel) => document.querySelector(sel);

// --- LÓGICA DO JOGO PRINCIPAL (TREINO) ---
const treino = {
  vermelhos: [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36],
  pretos: [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35],
  setores: {
    Voisins: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25],
    Orphelins: [1, 20, 14, 31, 9, 17, 34, 6],
    Tier: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
  },
  sequenciaRoleta: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
  coresBrasil: { Voisins: "verde-brasil", Tier: "amarelo-brasil", Orphelins: "azul-brasil" },
  modoAtual: "",
  numerosCorretos: [],
  numeroSorteado: 0,
};

function mostrarPopup(mensagem, tipo) {
  const popupOverlay = $("#popup-overlay");
  const popupContent = $("#popup-content");
  popupContent.textContent = mensagem;
  popupContent.classList.remove("acertou", "errou");
  popupContent.classList.add(tipo);
  popupOverlay.style.display = "flex";
  setTimeout(() => { popupOverlay.style.display = "none"; }, 1500);
}

function escolherSetorAleatorio() {
  const keys = Object.keys(treino.setores);
  return keys[Math.floor(Math.random() * keys.length)];
}

function iniciarModoSetores() {
  treino.modoAtual = "setores";
  const setorAleatorio = escolherSetorAleatorio();
  treino.numerosCorretos = treino.setores[setorAleatorio];
  $("#pergunta").textContent = `Clique nos números ${setorAleatorio}`;
  $("#painel-setores").style.display = "flex";
  $("#vizinhos-display-container").style.display = "none";
  $("#numeros-grid").style.display = "grid";
  $("#botoes-niveis").style.display = "none";
  reiniciarJogo(treino.numerosCorretos.length, true);
}

function iniciarModoVizinhos() {
  treino.modoAtual = "selecionar_nivel_vizinhos";
  $("#pergunta").textContent = "Selecione o nível de dificuldade";
  $("#painel-setores").style.display = "none";
  $("#vizinhos-display-container").style.display = "none";
  $("#numeros-grid").style.display = "none";
  $("#botoes-niveis").style.display = "flex";
}

function iniciarVizinhosPorNivel(nivel) {
  treino.modoAtual = "vizinhos";
  const grid = $("#numeros-grid");
  grid.dataset.currentLevel = nivel;

  $("#pergunta").textContent = `Preencha ${nivel} vizinho${nivel > 1 ? "s" : ""} de cada lado`;
  $("#botoes-niveis").style.display = "none";
  $("#vizinhos-display-container").style.display = "flex";
  grid.style.display = "grid";

  treino.numeroSorteado = Math.floor(Math.random() * 37);
  const indiceSorteado = treino.sequenciaRoleta.indexOf(treino.numeroSorteado);

  const vizinhosEsquerda = [];
  const vizinhosDireita = [];
  for (let i = 1; i <= nivel; i++) {
    const indice = (indiceSorteado - i + treino.sequenciaRoleta.length) % treino.sequenciaRoleta.length;
    vizinhosEsquerda.push(treino.sequenciaRoleta[indice]);
  }
  for (let i = 1; i <= nivel; i++) {
    const indice = (indiceSorteado + i) % treino.sequenciaRoleta.length;
    vizinhosDireita.push(treino.sequenciaRoleta[indice]);
  }
  treino.numerosCorretos = [...vizinhosEsquerda, ...vizinhosDireita];

  const vizinhosDisplay = $("#vizinhos-display-container");
  vizinhosDisplay.innerHTML = "";
  vizinhosEsquerda.reverse().forEach((vizinhoNum) => {
    const slot = document.createElement("div");
    slot.classList.add("vizinho-slot");
    slot.dataset.numero = vizinhoNum;
    vizinhosDisplay.appendChild(slot);
  });
  const numeroCentral = document.createElement("div");
  numeroCentral.classList.add("vizinho-slot", "cheio");
  numeroCentral.textContent = `(${treino.numeroSorteado})`;
  if (treino.vermelhos.includes(treino.numeroSorteado)) numeroCentral.style.backgroundColor = "#c00000";
  else if (treino.pretos.includes(treino.numeroSorteado)) numeroCentral.style.backgroundColor = "#000000";
  else if (treino.numeroSorteado === 0) numeroCentral.style.backgroundColor = "#007f00";
  vizinhosDisplay.appendChild(numeroCentral);
  vizinhosDireita.forEach((vizinhoNum) => {
    const slot = document.createElement("div");
    slot.classList.add("vizinho-slot");
    slot.dataset.numero = vizinhoNum;
    vizinhosDisplay.appendChild(slot);
  });

  reiniciarJogo(treino.numerosCorretos.length, true);
}

function destacarSetor(setor) {
  const numeros = document.querySelectorAll(".numero");
  const botoesFiltro = document.querySelectorAll(".botao-setor-filtro");
  botoesFiltro.forEach((btn) => btn.classList.remove("selecionado"));

  if (setor === "reset") {
    numeros.forEach((btn) => {
      btn.classList.remove("verde-brasil", "amarelo-brasil", "azul-brasil");
      const n = parseInt(btn.textContent, 10);
      if (treino.vermelhos.includes(n)) btn.classList.add("vermelho");
      else if (treino.pretos.includes(n)) btn.classList.add("preto");
      else if (n === 0) btn.classList.add("verde");
    });
    $("#btnReset")?.classList.add("selecionado");
    return;
  }

  document.getElementById(`btn${setor}`)?.classList.add("selecionado");

  numeros.forEach((btn) => {
    btn.classList.remove("verde-brasil", "amarelo-brasil", "azul-brasil");
    const n = parseInt(btn.textContent, 10);
    if (treino.vermelhos.includes(n)) btn.classList.add("vermelho");
    else if (treino.pretos.includes(n)) btn.classList.add("preto");
    else if (n === 0) btn.classList.add("verde");
  });

  const cor = treino.coresBrasil[setor];
  numeros.forEach((btn) => {
    const num = parseInt(btn.textContent, 10);
    if (treino.setores[setor].includes(num)) btn.classList.add(cor);
  });
}

function reiniciarJogo(totalNecessario, habilitarCliques) {
  $("#resultado").textContent = "";
  gerarGrid(habilitarCliques);
  if (treino.modoAtual === "setores") {
    $("#contador").textContent = `Selecionados: 0/${totalNecessario}`;
  }
}

function gerarGrid(habilitarCliques) {
  const container = $("#numeros-grid");
  container.innerHTML = "";

  const zero = document.createElement("div");
  zero.textContent = "0";
  zero.className = "numero verde zero";
  if (habilitarCliques) zero.onclick = () => validarSelecao(zero, 0);
  container.append(document.createElement("div"), zero, document.createElement("div"));

  for (let i = 1; i <= 36; i++) {
    const btn = document.createElement("div");
    btn.classList.add("numero");
    if (treino.vermelhos.includes(i)) btn.classList.add("vermelho");
    else if (treino.pretos.includes(i)) btn.classList.add("preto");
    btn.textContent = i;
    if (habilitarCliques) btn.onclick = () => validarSelecao(btn, i);
    container.appendChild(btn);
  }
}

function validarSelecao(btn, num) {
  if (btn.classList.contains("selecionado") || btn.classList.contains("usado")) return;

  if (treino.modoAtual === "vizinhos") {
    const indexDoVizinho = treino.numerosCorretos.indexOf(num);
    if (indexDoVizinho !== -1) {
      btn.classList.add("correto", "usado");
      treino.numerosCorretos.splice(indexDoVizinho, 1);
      const slotCorreto = document.querySelector(`.vizinho-slot[data-numero="${num}"]`);
      if (slotCorreto) {
        slotCorreto.textContent = num;
        slotCorreto.classList.add("cheio");
        const corDoNumero = treino.vermelhos.includes(num) ? "#c00000" : treino.pretos.includes(num) ? "#000000" : "#007f00";
        slotCorreto.style.backgroundColor = corDoNumero;
      }
      if (treino.numerosCorretos.length === 0) {
        mostrarPopup("ACERTOU", "acertou");
        setTimeout(() => {
          const nivelAtual = $("#numeros-grid").dataset.currentLevel;
          iniciarVizinhosPorNivel(nivelAtual);
        }, 2500);
      }
    } else {
      btn.classList.add("errado");
      mostrarPopup("ERROU", "errou");
      setTimeout(() => {
        const nivelAtual = $("#numeros-grid").dataset.currentLevel;
        iniciarVizinhosPorNivel(nivelAtual);
      }, 1500);
    }
  } else if (treino.modoAtual === "setores") {
    btn.classList.add("selecionado");
    if (!treino.numerosCorretos.includes(num)) {
      btn.classList.add("errado");
      mostrarPopup("ERROU", "errou");
      setTimeout(iniciarModoSetores, 1500);
      return;
    }
    btn.classList.add("correto");
    const totalClicados = document.querySelectorAll(".numero.selecionado").length;
    const totalCorretos = $("#contador").textContent.split("/")[1];
    $("#contador").textContent = `Selecionados: ${totalClicados}/${totalCorretos}`;
    if (totalClicados >= parseInt(totalCorretos, 10)) {
      mostrarPopup("ACERTOU", "acertou");
      setTimeout(iniciarModoSetores, 2500);
    }
  }
}

// --- LÓGICA DO QUIZ (ISOLADA) ---
const quiz = {
  roleta: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
  setores: {
    Voisins: [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25],
    Orphelins: [1, 20, 14, 31, 9, 17, 34, 6],
    Tier: [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33],
  },
  nivel: 1,
  neighborCount: 1,
  perguntas: [],
  current: 0,
  tentativas: 1,
  acertos: 0,
  iniciado: false,
  embaralhar: (array) => array.sort(() => Math.random() - 0.5),
  getSetor: function (num) {
    for (let key in this.setores) {
      if (this.setores[key].includes(num)) return key;
    }
    return "Desconhecido";
  },
  getVizinhos: function (num, n) {
    const idx = this.roleta.indexOf(num);
    const viz = [];
    for (let i = -n; i <= n; i++) {
      if (i !== 0) {
        const pos = (idx + i + this.roleta.length) % this.roleta.length;
        viz.push(this.roleta[pos]);
      }
    }
    return viz;
  },
  setNeighbors: function (n) {
    this.neighborCount = n;
    this.iniciarNivel(1);
  },
  iniciarNivel: function (n) {
    this.nivel = n;
    this.current = 0;
    this.acertos = 0;
    $("#feedback").textContent = "";
    $("#vizinhos-input").value = "";
    $("#input-area").style.display = "none";
    const novos = this.roleta.map((num) => ({
      num,
      sector: this.getSetor(num),
      vizinhos: this.getVizinhos(num, this.neighborCount),
    }));
    this.perguntas = this.embaralhar(novos);
    this.atualizarStatus();
    this.showQuestion();
  },
  atualizarStatus: function () {
    $("#status").textContent = `Nível ${this.nivel} | Tentativa ${this.tentativas} | Progresso: ${this.acertos}/37`;
  },
  showQuestion: function () {
    const q = this.perguntas[this.current];
    const question = $("#question");
    const options = $("#options");
    const inputArea = $("#input-area");
    const feedback = $("#feedback");
    feedback.textContent = "";
    inputArea.style.display = "none";
    $("#vizinhos-input").value = "";
    if (this.nivel === 1) {
      question.textContent = `Número ${q.num} pertence a qual setor?`;
      options.innerHTML = "";
      ["Voisins", "Tier", "Orphelins"].forEach((opt) => {
        const btn = document.createElement("button");
        btn.textContent = opt;
        btn.onclick = () => this.checkSectorAnswer(opt);
        options.appendChild(btn);
      });
    } else {
      question.textContent = `Digite os vizinhos do número ${q.num}`;
      options.innerHTML = "";
      inputArea.style.display = "block";
    }
  },
  checkSectorAnswer: function (answer) {
    const q = this.perguntas[this.current];
    const feedback = $("#feedback");
    if (answer === q.sector) {
      this.acertos++;
      feedback.innerHTML = `<span class='correct'>Correto!</span>`;
      this.proximaPergunta();
    } else {
      feedback.innerHTML = `<span class='wrong'>Errado! Era ${q.sector}. Reiniciando nível...</span>`;
      this.tentativas++;
      setTimeout(() => this.iniciarNivel(1), 2000);
    }
  },
  checkTypedVizinhos: function () {
    const q = this.perguntas[this.current];
    const input = $("#vizinhos-input").value;
    const resposta = input
      .split(",")
      .map((n) => parseInt(n.trim(), 10))
      .filter((n) => !isNaN(n));
    const corretos = q.vizinhos.slice().sort((a, b) => a - b);
    const user = resposta.slice().sort((a, b) => a - b);
    const feedback = $("#feedback");
    const iguais = JSON.stringify(user) === JSON.stringify(corretos);
    if (iguais) {
      this.acertos++;
      feedback.innerHTML = `<span class='correct'>Correto!</span>`;
      this.proximaPergunta();
    } else {
      feedback.innerHTML = `<span class='wrong'>Errado! Corretos: ${corretos.join(", ")}. Reiniciando nível...</span>`;
      this.tentativas++;
      setTimeout(() => this.iniciarNivel(2), 3000);
    }
  },
  proximaPergunta: function () {
    this.current++;
    this.atualizarStatus();
    if (this.acertos >= 37) {
      if (this.nivel === 1) {
        $("#feedback").innerHTML = `<span class='correct'>Parabéns! Você completou o Nível 1! Vamos para o Nível 2.</span>`;
        setTimeout(() => this.iniciarNivel(2), 3000);
      } else {
        $("#feedback").innerHTML = `<span class='correct'>Você concluiu o Nível 2! 👏 Em breve desbloquearemos o próximo nível visual!</span>`;
      }
    } else {
      this.showQuestion();
    }
  },
  init: function () {
    if (this.iniciado) return;
    document.querySelectorAll(".btn-vizinho-quiz").forEach((button) => {
      button.addEventListener("click", (e) => {
        this.setNeighbors(parseInt(e.target.dataset.n, 10));
      });
    });
    $("#btn-verificar-vizinhos").addEventListener("click", () => this.checkTypedVizinhos());
    $("#btn-proxima").addEventListener("click", () => this.proximaPergunta());
    this.iniciarNivel(1);
    this.iniciado = true;
  },
};

// ==================================================================
// === CÓDIGO DO PROJETO RACETRACK (AGORA DENTRO DE UM OBJETO) ===
// ==================================================================
const racetrackGame = {
  iniciado: false,
  neighborCount: 1,
  balance: 100,
  totalBet: 0,
  bets: {},
  betHistory: [],
  selectedChipValue: 1,
  isSpinning: false,
  wheelOrder: [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26],
  specialBets: { "VOISINS": [0, 2, 3, 4, 7, 12, 15, 18, 19, 21, 22, 25, 26, 28, 29, 32, 35], "ZERO": [0, 3, 12, 15, 26, 32, 35], "TIER": [5, 8, 10, 11, 13, 16, 23, 24, 27, 30, 33, 36], "ORPH.": [1, 6, 9, 14, 17, 20, 31, 34] },
  CHIP_COLORS: { 1: '#8a8f96', 5: '#c00000', 10: '#1f5aa6', 25: '#1b8f43', 50: '#ff8c00', 100: '#222222' },
  PAYOUT_STRAIGHT: 35,
  CLEAR_AFTER_PAYOUT: true,
  audioCtx: null,
  selectedVoice: null,
  dom: {},
  numberElements: {},
  numberFormatter: new Intl.NumberFormat('pt-BR'),
  countdownId: null, countdownTotal: 15, countdownEndsAt: 0, lastWhole: null,
  training: null, neighborRestore: null,
  ballPath: null, ballLen: 0, ball: null, currentBallDist: 0,
  numberToDist: {}, numberStops: [], stopsReady: false,
  clackState: null,

  init: function() {
    if (this.iniciado) return;

    this.dom.neighborCountEl = document.getElementById('neighbor-count');
    this.dom.balanceEl = document.getElementById('balance');
    this.dom.totalBetEl = document.getElementById('total-bet');
    this.dom.addNeighborBtn = document.getElementById('add-neighbor');
    this.dom.removeNeighborBtn = document.getElementById('remove-neighbor');
    this.dom.balanceButtons = document.querySelectorAll('.balance-selector button');
    this.dom.undoBtn = document.getElementById('undo-button');
    this.dom.doubleBtn = document.getElementById('double-button');
    this.dom.playBtn = document.getElementById('play-button');
    this.dom.svgEl = document.getElementById("racetrack-svg");
    this.dom.chipTrigger = document.getElementById('chip-trigger');
    this.dom.chipFan = document.getElementById('chip-fan');
    this.dom.chipFanBackdrop = document.getElementById('chip-fan-backdrop');
    this.dom.clockHand = document.getElementById('clock-hand');
    this.dom.clockText = document.getElementById('timer-text');

    this.drawSVG();
    this.buildBallInfrastructure();
    this.updateDisplays();
    if (this.dom.clockText) this.dom.clockText.textContent = "15";

    this.dom.addNeighborBtn.addEventListener('click', () => { if (this.isSpinning) return; if (this.neighborCount < 9) { this.neighborCount++; this.updateDisplays(); } });
    this.dom.removeNeighborBtn.addEventListener('click', () => { if (this.isSpinning) return; if (this.neighborCount > 0) { this.neighborCount--; this.updateDisplays(); } });
    this.dom.balanceButtons.forEach(btn => btn.addEventListener('click', () => { if (this.isSpinning) return; this.balance = parseFloat(btn.dataset.balance); this.bets = {}; this.totalBet = 0; this.betHistory = []; this.updateDisplays(); this.drawChips(); }));
    this.dom.undoBtn.addEventListener('click', () => { if (this.isSpinning) return; if (this.betHistory.length > 0) { const lastTotal = this.totalBet; this.bets = this.betHistory.pop(); this.totalBet = this.sumBetsObject(this.bets); this.balance += (lastTotal - this.totalBet); this.updateDisplays(); this.drawChips(); } });
    this.dom.doubleBtn.addEventListener('click', () => { if (this.isSpinning) return; if (this.totalBet === 0 || this.totalBet > this.balance) return; this.saveState(); this.balance -= this.totalBet; for (const n in this.bets) { this.bets[n] *= 2; } this.totalBet *= 2; this.updateDisplays(); this.drawChips(); });
    if (this.dom.playBtn) { this.dom.playBtn.addEventListener('click', () => { if (!this.isSpinning && !this.countdownId) this.startTrainingRound(15); }); }
    this.dom.chipTrigger.addEventListener('click', () => { if (this.dom.chipFan.hidden) this.openChipFan(); else this.closeChipFan(); });
    this.dom.chipFanBackdrop.addEventListener('click', () => this.closeChipFan());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') this.closeChipFan(); });
    document.addEventListener('keydown', e => { if (e.code === 'Space' || e.key.toLowerCase() === 'p') { e.preventDefault(); if (!this.isSpinning && !this.countdownId) this.startTrainingRound(15); } });

    this.iniciado = true;
  },

  colorByTotal(total) {
    if (total >= 100) return this.CHIP_COLORS[100];
    if (total >= 50) return this.CHIP_COLORS[50];
    if (total >= 25) return this.CHIP_COLORS[25];
    if (total >= 10) return this.CHIP_COLORS[10];
    if (total >= 5) return this.CHIP_COLORS[5];
    return this.CHIP_COLORS[1];
  },
  colorName(n) {
    const map = { red: 'vermelho', black: 'preto', green: 'verde' };
    const numColors = { 0: "green", 1: "red", 2: "black", 3: "red", 4: "black", 5: "red", 6: "black", 7: "red", 8: "black", 9: "red", 10: "black", 11: "black", 12: "red", 13: "black", 14: "red", 15: "black", 16: "red", 17: "black", 18: "red", 19: "red", 20: "black", 21: "red", 22: "black", 23: "red", 24: "black", 25: "red", 26: "black", 27: "red", 28: "black", 29: "black", 30: "red", 31: "black", 32: "red", 33: "black", 34: "red", 35: "black", 36: "red" };
    return map[numColors[n]] || 'desconhecido';
  },
  ensureAudio() {
    if (!this.audioCtx) this.audioCtx = new(window.AudioContext || window.webkitAudioContext)();
    if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
  },
  beep(freq = 950, dur = 0.06, vol = 0.12) {
    if (!this.audioCtx) return;
    const t0 = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    osc.frequency.setValueAtTime(freq, t0);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(gain).connect(this.audioCtx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  },
  waitForVoices(timeout = 1500) {
    return new Promise(resolve => {
      const synth = window.speechSynthesis;
      if (!synth) return resolve(false);
      const have = synth.getVoices();
      if (have && have.length) return resolve(true);
      let done = false;
      const finish = () => { if (!done) { done = true; resolve(true); } };
      const id = setTimeout(finish, timeout);
      synth.onvoiceschanged = () => { clearTimeout(id); finish(); };
    });
  },
  choosePTVoice(preferFemale = true, preferredNames = ['Google português do Brasil', 'Google português', 'Microsoft Maria', 'Microsoft Francisca', 'Camila', 'Bia']) {
    const synth = window.speechSynthesis;
    const voices = synth?.getVoices?.() || [];
    const ptBR = voices.filter(v => (v.lang || '').toLowerCase() === 'pt-br');
    const ptAny = voices.filter(v => (v.lang || '').toLowerCase().startsWith('pt'));
    for (const name of preferredNames) {
      const v = ptBR.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (v) return v;
    }
    for (const name of preferredNames) {
      const v = ptAny.find(v => v.name.toLowerCase().includes(name.toLowerCase()));
      if (v) return v;
    }
    if (preferFemale) {
      const fem = [...ptBR, ...ptAny].find(v => /female|mulher|maria|ana|bia|bruna|camila/i.test(v.name));
      if (fem) return fem;
    }
    if (ptBR[0]) return ptBR[0];
    if (ptAny[0]) return ptAny[0];
    return null;
  },
  async speakPTAsync(text) {
    try {
      const synth = window.speechSynthesis;
      if (!synth) return;
      await this.waitForVoices(1800);
      if (!this.selectedVoice) this.selectedVoice = this.choosePTVoice(true);
      synth.cancel();
      const u = new SpeechSynthesisUtterance(String(text));
      u.lang = (this.selectedVoice && this.selectedVoice.lang) ? this.selectedVoice.lang : 'pt-BR';
      if (this.selectedVoice) u.voice = this.selectedVoice;
      u.rate = 1.0;
      u.pitch = 1.0;
      await new Promise(res => { u.onend = res; u.onerror = res; synth.speak(u); });
    } catch (e) {}
  },
  speakPT(text) { void this.speakPTAsync(text); },
  updateDisplays() {
    this.dom.neighborCountEl.textContent = this.neighborCount;
    this.dom.balanceEl.textContent = `R$ ${this.numberFormatter.format(this.balance)}`;
    this.dom.totalBetEl.textContent = `R$ ${this.numberFormatter.format(this.totalBet)}`;
  },
  saveState() { this.betHistory.push(JSON.parse(JSON.stringify(this.bets))); },
  sumBetsObject(obj) { return Object.values(obj).reduce((s, v) => s + v, 0); },
  placeBet(number, amount) {
    if (this.balance < amount || this.isSpinning) return false;
    this.bets[number] = (this.bets[number] || 0) + amount;
    this.balance -= amount; this.totalBet += amount; return true;
  },
  settleRound(winning) {
    const stake = this.bets[winning] || 0;
    const credit = stake * (this.PAYOUT_STRAIGHT + 1);
    if (credit > 0) this.balance += credit;
    if (this.CLEAR_AFTER_PAYOUT) { this.bets = {}; this.totalBet = 0; }
    this.updateDisplays();
    this.drawChips();
    return credit;
  },
  drawChips() {
    let chipLayer = document.getElementById('chip-layer');
    if (chipLayer) chipLayer.remove();
    chipLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
    chipLayer.setAttribute('id', 'chip-layer'); this.dom.svgEl.appendChild(chipLayer);
    for (const number in this.bets) {
      const amount = this.bets[number]; if (amount <= 0) continue;
      const groupEl = this.numberElements[number]; if (!groupEl) continue;
      const textEl = groupEl.querySelector('text'); if (!textEl) continue;
      const cx = parseFloat(textEl.getAttribute('x')); const cy = parseFloat(textEl.getAttribute('y'));
      const color = this.colorByTotal(amount);
      const disc = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      disc.setAttribute('cx', cx); disc.setAttribute('cy', cy); disc.setAttribute('r', 15); disc.setAttribute('fill', color); disc.setAttribute('stroke', '#fff'); disc.setAttribute('stroke-width', '2'); disc.style.filter = 'drop-shadow(0 2px 5px rgba(0,0,0,.5))'; disc.style.pointerEvents = 'none';
      const dots = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      dots.setAttribute('cx', cx); dots.setAttribute('cy', cy); dots.setAttribute('r', 13); dots.setAttribute('fill', 'none'); dots.setAttribute('stroke', '#fff'); dots.setAttribute('stroke-width', '2'); dots.setAttribute('stroke-linecap', 'round'); dots.setAttribute('stroke-dasharray', '1.1 7'); dots.setAttribute('opacity', '0.9'); dots.style.pointerEvents = 'none';
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute('x', cx); label.setAttribute('y', cy + 0.6); label.setAttribute('class', 'chip-label'); label.setAttribute('fill', '#fff'); label.setAttribute('text-anchor', 'middle'); label.setAttribute('dominant-baseline', 'middle'); label.textContent = amount.toLocaleString('pt-BR'); label.style.pointerEvents = 'none';
      chipLayer.appendChild(disc); chipLayer.appendChild(dots); chipLayer.appendChild(label);
    }
  },
  updateClock() {
    const msLeft = this.countdownEndsAt - performance.now();
    const secLeft = Math.max(0, msLeft / 1000);
    const whole = Math.floor(secLeft);
    if (this.dom.clockText) this.dom.clockText.textContent = String(whole);
    if (this.dom.clockHand) {
      const angle = 360 * (secLeft / this.countdownTotal);
      this.dom.clockHand.style.transform = `rotate(${angle}deg)`;
    }
    if (this.lastWhole === null || whole < this.lastWhole) {
      if (this.audioCtx) this.beep(whole <= 3 ? 1400 : 900, 0.06, 0.12);
      this.lastWhole = whole;
    }
    if (msLeft <= 0) {
      clearInterval(this.countdownId); this.countdownId = null; this.lastWhole = null;
      this.handleCountdownFinished();
    }
  },
  startCountdown(seconds = 15) {
    this.countdownTotal = seconds; this.countdownEndsAt = performance.now() + seconds * 1000;
    if (this.countdownId) clearInterval(this.countdownId);
    this.updateClock(); this.countdownId = setInterval(() => this.updateClock(), 100);
  },
  stopCountdown() { if (this.countdownId) { clearInterval(this.countdownId); this.countdownId = null; } this.lastWhole = null; },
  async handleCountdownFinished() {
    if (this.training && this.training.active) {
      this.evaluateTrainingAndStore();
      await this.speakPTAsync('Tempo esgotado.');
      this.training.active = false;
      this.iniciarRoletaNaPista();
    }
  },
  neighborsOf(n) {
    const idx = this.wheelOrder.indexOf(n);
    const L = this.wheelOrder[(idx - 1 + this.wheelOrder.length) % this.wheelOrder.length];
    const R = this.wheelOrder[(idx + 1) % this.wheelOrder.length];
    return [L, n, R];
  },
  pickRandomDistinct(count, excludeSet = new Set()) {
    const out = [];
    while (out.length < count) {
      const n = Math.floor(Math.random() * 37);
      if (excludeSet.has(n)) continue;
      if (!out.includes(n)) out.push(n);
    }
    return out;
  },
  startTrainingRound(seconds = 15) {
    this.ensureAudio();
    this.neighborRestore = this.neighborCount;
    if (this.neighborCount !== 1) { this.neighborCount = 1; this.updateDisplays(); }
    const qNeighbor = 3 + Math.floor(Math.random() * 3);
    const targetsNeighbor = this.pickRandomDistinct(qNeighbor);
    const excl = new Set(targetsNeighbor);
    const qSeco = Math.random() < 0.6 ? 1 : (Math.random() < 0.5 ? 2 : 0);
    const targetsSeco = qSeco ? this.pickRandomDistinct(qSeco, excl) : [];
    this.training = { targetsNeighbor, targetsSeco, active: true, missed: [] };
    const vizStr = targetsNeighbor.join(', ');
    let frase = `Marque com um vizinho: ${vizStr}.`;
    if (targetsSeco.length === 1) { frase += ` E seco: ${targetsSeco[0]}.`; }
    else if (targetsSeco.length === 2) { frase += ` E secos: ${targetsSeco[0]} e ${targetsSeco[1]}.`; }
    this.speakPT(frase);
    if (this.dom.clockText) this.dom.clockText.textContent = String(seconds);
    this.startCountdown(seconds);
  },
  evaluateTrainingAndStore() {
    if (!this.training) return [];
    const missed = [];
    for (const n of this.training.targetsNeighbor) {
      const [L, N, R] = this.neighborsOf(n);
      const allBet = (this.bets[L] || 0) > 0 && (this.bets[N] || 0) > 0 && (this.bets[R] || 0) > 0;
      if (!allBet) missed.push(n);
    }
    for (const n of this.training.targetsSeco) { if ((this.bets[n] || 0) <= 0) missed.push(n); }
    this.training.missed = missed;
    return missed;
  },
  onNumberClick(numberStr) {
    if (this.isSpinning) return;
    this.saveState(); const number = parseInt(numberStr, 10); let placed = false;
    if (this.neighborCount > 0) {
      const idx = this.wheelOrder.indexOf(number);
      for (let i = -this.neighborCount; i <= this.neighborCount; i++) {
        const ni = (idx + i + this.wheelOrder.length) % this.wheelOrder.length; const nn = this.wheelOrder[ni];
        if (this.placeBet(nn, this.selectedChipValue)) placed = true;
      }
    } else { if (this.placeBet(number, this.selectedChipValue)) placed = true; }
    if (placed) { this.updateDisplays(); this.drawChips(); } else { this.betHistory.pop(); }
  },
  onSectorClick(sectorName) {
    if (this.isSpinning) return;
    this.saveState(); const arr = this.specialBets[sectorName]; if (!arr) return;
    let placed = false; arr.forEach(n => { if (this.placeBet(n, this.selectedChipValue)) placed = true; });
    if (placed) { this.updateDisplays(); this.drawChips(); } else { this.betHistory.pop(); }
  },
  chipSVGMarkup(v) { return `<svg class="chip-svg" width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><circle cx="15" cy="15" r="15" fill="currentColor" stroke="#fff" stroke-width="2" style="filter: drop-shadow(0 2px 5px rgba(0,0,0,.5))"/><circle cx="15" cy="15" r="13" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-dasharray="1.1 7" opacity="0.9"/><text x="15" y="15.6" fill="#fff" text-anchor="middle" dominant-baseline="middle">${v}</text></svg>`; },
  buildChipFan() {
    this.dom.chipFan.innerHTML = ''; const arcDeg = 160, startDeg = 100, radius = 60, FAN_DENOMS = [1, 5, 10, 25, 50, 100], STAGGER = 40;
    FAN_DENOMS.forEach((v, i) => {
      const t = FAN_DENOMS.length === 1 ? 0 : i / (FAN_DENOMS.length - 1);
      const angle = (startDeg + t * arcDeg) * Math.PI / 180;
      const x = Math.cos(angle) * radius, y = Math.sin(angle) * radius;
      const chip = document.createElement('div');
      chip.className = 'chip-static'; chip.dataset.denom = String(v); chip.dataset.index = String(i); chip.setAttribute('aria-label', `Ficha ${v}`);
      chip.innerHTML = this.chipSVGMarkup(v);
      chip.style.setProperty('--tx', `${x}px`); chip.style.setProperty('--ty', `${y}px`); chip.style.transitionDelay = `${i*STAGGER}ms`;
      chip.addEventListener('click', (e) => { e.stopPropagation(); this.selectedChipValue = v; this.closeChipFan(); this.highlightTriggerMini(v); });
      this.dom.chipFan.appendChild(chip);
    });
    Array.from(this.dom.chipFan.children).forEach(el => el.classList.toggle('chip-active', parseInt(el.dataset.denom, 10) === this.selectedChipValue));
  },
  openChipFan() {
    const trgRect = this.dom.chipTrigger.getBoundingClientRect(), parentRect = document.querySelector('.right-controls').getBoundingClientRect();
    const fanW = 220, fanH = 220, centerX = (trgRect.left - parentRect.left) - fanW / 2 - 4, centerY = (trgRect.top - parentRect.top) + trgRect.height / 2 + 4;
    this.dom.chipFan.style.left = `${centerX}px`; this.dom.chipFan.style.top = `${centerY - fanH/2}px`;
    this.buildChipFan(); this.dom.chipFan.hidden = false; this.dom.chipFanBackdrop.hidden = false;
    requestAnimationFrame(() => this.dom.chipFan.classList.add('open')); this.dom.chipTrigger.setAttribute('aria-expanded', 'true');
  },
  closeChipFan() {
    const chips = Array.from(this.dom.chipFan.children), last = chips.length - 1, STAGGER = 40;
    chips.forEach(el => { const idx = parseInt(el.dataset.index, 10) || 0; el.style.transitionDelay = `${(last-idx)*STAGGER}ms`; });
    this.dom.chipFan.classList.remove('open'); const totalDelay = (last * STAGGER) + 220;
    setTimeout(() => { this.dom.chipFan.hidden = true; this.dom.chipFanBackdrop.hidden = true; chips.forEach((el, i) => el.style.transitionDelay = `${i*STAGGER}ms`); }, totalDelay);
    this.dom.chipTrigger.setAttribute('aria-expanded', 'false');
  },
  highlightTriggerMini(v) { this.dom.chipTrigger.querySelectorAll('.chip-static').forEach(el => el.classList.toggle('chip-active', parseInt(el.dataset.denom, 10) === v)); },
  drawSVG() {
    const config = { width: 280, height: 400, endCaps: { rx: 140, ry: 100 }, arcWidth: 70, topArcData: [{ number: "30", color: "red" }, { number: "8", color: "black" }, { number: "23", color: "red" }, { number: "10", color: "black" }, { number: "5", color: "red" }, { number: "24", color: "black" }], bottomArcData: [{ number: "32", color: "red" }, { number: "0", color: "green" }, { number: "26", color: "black" }, { number: "3", color: "red" }, { number: "35", color: "black" }], columns: { width: 70, leftColumnX: 25, rightColumnX: 235, left: [11, 36, 13, 27, 6, 34, 17, 25, 2, 21, 4, 19, 15], right: [16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12] }, sectors: [{ name: "TIER", y: 120 }, { name: "ORPH.", y: 250 }, { name: "VOISINS", y: 370 }, { name: "ZERO", y: 480 }], numberColors: { 0: "green", 1: "red", 2: "black", 3: "red", 4: "black", 5: "red", 6: "black", 7: "red", 8: "black", 9: "red", 10: "black", 11: "black", 12: "red", 13: "black", 14: "red", 15: "black", 16: "red", 17: "black", 18: "red", 19: "red", 20: "black", 21: "red", 22: "black", 23: "red", 24: "black", 25: "red", 26: "black", 27: "red", 28: "black", 29: "black", 30: "red", 31: "black", 32: "red", 33: "black", 34: "red", 35: "black", 36: "red" } };
    const offsetX = 25, offsetY = 25;
    const viewboxWidth = config.width + 50, viewboxHeight = config.height + config.endCaps.ry * 2 + 50;
    this.dom.svgEl.setAttribute("viewBox", `0 0 ${viewboxWidth} ${viewboxHeight}`);
    const { rx, ry } = config.endCaps, w = config.width, h = config.height;
    const d_bg = `M ${offsetX}, ${offsetY + ry} A ${rx},${ry} 0 0 1 ${offsetX + w},${offsetY + ry} L ${offsetX + w}, ${offsetY + h + ry} A ${rx},${ry} 0 0 1 ${offsetX},${offsetY + h + ry} Z`;
    const bg = document.createElementNS("http://www.w3.org/2000/svg", "path"); bg.setAttribute("d", d_bg); bg.setAttribute("class", "racetrack-bg"); this.dom.svgEl.appendChild(bg);
    const generateArc = (arcData, isTop) => {
      const num = arcData.length, slice = 180 / num;
      const center = { x: offsetX + config.endCaps.rx, y: offsetY + config.endCaps.ry + (isTop ? 0 : config.height) };
      const outer = { rx: config.endCaps.rx, ry: config.endCaps.ry };
      const inner = { rx: config.endCaps.rx - config.arcWidth, ry: config.endCaps.ry - config.arcWidth };
      arcData.forEach((btn, i) => {
        const start = i * slice, end = (i + 1) * slice;
        const get = (ang, r) => { const rad = ((ang + (isTop ? -180 : 0)) * Math.PI) / 180; return { x: center.x + r.rx * Math.cos(rad), y: center.y + r.ry * Math.sin(rad) }; };
        const p1 = get(start, inner), p2 = get(start, outer), p3 = get(end, outer), p4 = get(end, inner);
        const d = isTop ? `M ${p2.x} ${p2.y} A ${outer.rx} ${outer.ry} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${inner.rx} ${inner.ry} 0 0 0 ${p1.x} ${p1.y} Z` : `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} A ${outer.rx} ${outer.ry} 0 0 1 ${p3.x} ${p3.y} L ${p4.x} ${p4.y} A ${inner.rx} ${inner.ry} 0 0 0 ${p1.x} ${p1.y} Z`;
        const mid = { rx: (inner.rx + outer.rx) / 2, ry: (inner.ry + outer.ry) / 2 }; const tp = get(start + slice / 2, mid);
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", `bet-group bet-${btn.color}`);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("class", "bet-cell"); path.setAttribute("d", d);
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); t.setAttribute("x", tp.x); t.setAttribute("y", tp.y); t.textContent = btn.number;
        g.appendChild(path); g.appendChild(t); this.dom.svgEl.appendChild(g); this.numberElements[btn.number] = g; g.addEventListener('click', () => this.onNumberClick(btn.number));
      });
    };
    generateArc(config.topArcData, true);
    generateArc(config.bottomArcData.slice().reverse(), false);
    const { width, leftColumnX, rightColumnX, left, right } = config.columns;
    const topY = offsetY + config.endCaps.ry, bottomY = topY + config.height, colHeight = bottomY - topY;
    const drawCol = (numbers, startX) => {
      const cellH = colHeight / numbers.length;
      numbers.forEach((num, i) => {
        const y1 = topY + i * cellH, y2 = y1 + cellH;
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g"); g.setAttribute("class", `bet-group bet-${config.numberColors[num]||"black"}`);
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path"); path.setAttribute("d", `M ${startX} ${y1} L ${startX+width} ${y1} L ${startX+width} ${y2} L ${startX} ${y2} Z`); path.setAttribute("class", "bet-cell");
        const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); t.setAttribute("x", startX + width / 2); t.setAttribute("y", y1 + cellH / 2); t.textContent = num;
        g.appendChild(path); g.appendChild(t); this.dom.svgEl.appendChild(g); this.numberElements[num] = g; g.addEventListener('click', () => this.onNumberClick(String(num)));
      });
    };
    drawCol(left, leftColumnX); drawCol(right, rightColumnX);
    const centerX = offsetX + config.endCaps.rx;
    config.sectors.forEach(sector => { const t = document.createElementNS("http://www.w3.org/2000/svg", "text"); t.setAttribute("class", "sector-name"); t.setAttribute("x", centerX); t.setAttribute("y", offsetY + config.endCaps.ry + sector.y - 90); t.textContent = sector.name; this.dom.svgEl.appendChild(t); t.addEventListener('click', () => this.onSectorClick(sector.name)); });
    const colH = config.height, leftH = colH / left.length, rightH = colH / right.length;
    const i27 = left.indexOf(27), i33 = right.indexOf(33); const p27 = { x: leftColumnX + width, y: topY + (i27 + 1) * leftH }, p33 = { x: rightColumnX, y: topY + (i33 + 1) * rightH };
    const l1 = document.createElementNS("http://www.w3.org/2000/svg", "path"); l1.setAttribute("d", `M ${p33.x} ${p33.y} L ${p27.x} ${p27.y}`); l1.setAttribute("class", "custom-line"); this.dom.svgEl.appendChild(l1);
    const i17 = left.indexOf(17), y_17 = topY + (i17 + 1) * leftH;
    const l2 = document.createElementNS("http://www.w3.org/2000/svg", "path"); l2.setAttribute("d", `M ${leftColumnX+width} ${y_17} L ${rightColumnX} ${y_17}`); l2.setAttribute("class", "custom-line"); this.dom.svgEl.appendChild(l2);
    const i19 = left.indexOf(19), i28 = right.indexOf(28); const s_curve = { x: leftColumnX + width, y: topY + (i19 + .5) * leftH }, e_curve = { x: rightColumnX, y: topY + (i28 + .5) * rightH }, c_curve = { x: (s_curve.x + e_curve.x) / 2, y: s_curve.y - 40 };
    const curve = document.createElementNS("http://www.w3.org/2000/svg", "path"); curve.setAttribute("d", `M ${s_curve.x} ${s_curve.y} Q ${c_curve.x} ${c_curve.y} ${e_curve.x} ${e_curve.y}`); curve.setAttribute("class", "custom-line"); this.dom.svgEl.appendChild(curve);
  },
  buildBallInfrastructure() {
    const config = { width: 280, height: 400, endCaps: { rx: 140, ry: 100 }, arcWidth: 70 }; const offsetX = 25, offsetY = 25, BALL_MID_OFFSET = 12;
    const rxMid = config.endCaps.rx - config.arcWidth / 2; const ryMid = config.endCaps.ry - config.arcWidth / 2;
    const w = config.width, h = config.height;
    const yTop = offsetY + ryMid + BALL_MID_OFFSET; const yBottom = offsetY + h + ryMid + BALL_MID_OFFSET;
    const d = `M ${offsetX} ${yTop} A ${rxMid} ${ryMid} 0 0 1 ${offsetX + w} ${yTop} L ${offsetX + w} ${yBottom} A ${rxMid} ${ryMid} 0 0 1 ${offsetX} ${yBottom} Z`;
    if (this.ballPath) this.ballPath.remove(); if (this.ball) this.ball.remove();
    this.ballPath = document.createElementNS("http://www.w3.org/2000/svg", "path"); this.ballPath.setAttribute('id', 'ball-path'); this.ballPath.setAttribute('d', d); this.ballPath.setAttribute('fill', 'none'); this.dom.svgEl.appendChild(this.ballPath);
    this.ballLen = this.ballPath.getTotalLength();
    this.ball = document.createElementNS("http://www.w3.org/2000/svg", "circle"); this.ball.setAttribute('id', 'racetrack-ball'); this.ball.setAttribute('r', 6); this.ball.setAttribute('fill', '#fff'); this.ball.setAttribute('stroke', '#000'); this.ball.setAttribute('stroke-width', '1.5');
    const p0 = this.ballPath.getPointAtLength(0); this.ball.setAttribute('cx', p0.x); this.ball.setAttribute('cy', p0.y); this.dom.svgEl.appendChild(this.ball);
    this.numberStops = [];
    for (const num in this.numberElements) {
      const g = this.numberElements[num]; const cell = g.querySelector('.bet-cell'); const bb = cell ? cell.getBBox() : null; let x, y;
      if (bb) { x = bb.x + bb.width / 2; y = bb.y + bb.height / 2; } else { const t = g.querySelector('text'); if (!t) continue; x = parseFloat(t.getAttribute('x')); y = parseFloat(t.getAttribute('y')); }
      const dist = this.nearestDistOnPath(x, y); const key = parseInt(num, 10); this.numberToDist[key] = dist; this.numberStops.push({ num: key, dist });
    }
    this.stopsReady = true;
  },
  setBallAt(dist) {
    this.currentBallDist = ((dist % this.ballLen) + this.ballLen) % this.ballLen;
    const p = this.ballPath.getPointAtLength(this.currentBallDist);
    this.ball.setAttribute('cx', p.x); this.ball.setAttribute('cy', p.y);
  },
  nearestDistOnPath(x, y) {
    let step = this.ballLen / 240; let bestS = 0, bestD = Infinity;
    for (let s = 0; s <= this.ballLen; s += step) { const p = this.ballPath.getPointAtLength(s); const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < bestD) { bestD = d; bestS = s; } }
    for (let pass = 0; pass < 2; pass++) { const span = step * 6; const start = Math.max(0, bestS - span); const end = Math.min(this.ballLen, bestS + span); step = step / 6; for (let s = start; s <= end; s += step) { const p = this.ballPath.getPointAtLength(s); const d = (p.x - x) * (p.x - x) + (p.y - y) * (p.y - y); if (d < bestD) { bestD = d; bestS = s; } } }
    return bestS;
  },
  nearestNumberForDist(dist) {
    let bestNum = null, bestDelta = Infinity;
    for (const { num, dist: d } of this.numberStops) { const raw = Math.abs(d - dist); const delta = Math.min(raw, this.ballLen - raw); if (delta < bestDelta) { bestDelta = delta; bestNum = num; } }
    return bestNum;
  },
  playClack() {
    if (!this.audioCtx) return;
    const t0 = this.audioCtx.currentTime;
    const osc = this.audioCtx.createOscillator(); const gain = this.audioCtx.createGain(); const bp = this.audioCtx.createBiquadFilter();
    osc.type = 'square'; osc.frequency.setValueAtTime(1800, t0); bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 8;
    gain.gain.setValueAtTime(0.0001, t0); gain.gain.exponentialRampToValueAtTime(0.18, t0 + 0.004); gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.06);
    osc.connect(bp).connect(gain).connect(this.audioCtx.destination); osc.start(t0); osc.stop(t0 + 0.08);
  },
  startSpinClacks(durationMs = 5600) {
    if (!this.audioCtx) return;
    const tStart = performance.now();
    this.clackState = { tStart, durationMs, last: tStart, raf: 0 };
    const fast = 40, slow = 220;
    const loop = (now) => {
      if (!this.clackState) return;
      const t = Math.min(1, (now - this.clackState.tStart) / this.clackState.durationMs);
      const interval = fast + t * (slow - fast);
      if (now - this.clackState.last >= interval) { this.playClack(); this.clackState.last = now; }
      if (t < 1) { this.clackState.raf = requestAnimationFrame(loop); } else { this.stopSpinClacks(); }
    };
    this.clackState.raf = requestAnimationFrame(loop);
  },
  stopSpinClacks() { if (!this.clackState) return; cancelAnimationFrame(this.clackState.raf); this.clackState = null; },
  easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); },
  iniciarRoletaNaPista() {
    this.ensureAudio(); this.isSpinning = true; document.body.classList.add('spinning'); if (this.dom.playBtn) this.dom.playBtn.classList.add('disabled');
    if (!this.stopsReady) this.buildBallInfrastructure();
    const sorteado = this.wheelOrder[Math.floor(Math.random() * this.wheelOrder.length)];
    const alvoDist = this.numberToDist[sorteado];
    const SPIN_TURNS_MIN = 22;   // antes 7
const SPIN_TURNS_MAX = 30;   // antes 12
const SPIN_DURATION_MS = 10000; // antes 5600 (clacks seguem esse tempo)

    const voltas = SPIN_TURNS_MIN + Math.random() * (SPIN_TURNS_MAX - SPIN_TURNS_MIN);
    const deltaForward = (typeof alvoDist === 'number') ? (alvoDist - this.currentBallDist + this.ballLen) % this.ballLen : Math.random() * this.ballLen;
    const travelDist = voltas * this.ballLen + deltaForward;
    const startDist = this.currentBallDist;
    const t0 = performance.now(), dur = SPIN_DURATION_MS;
    this.startSpinClacks(dur);
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur);
      const eased = this.easeOutCubic(t);
      this.setBallAt(startDist + eased * travelDist);
      if (t < 1) { requestAnimationFrame(step); }
      else {
        this.stopSpinClacks();
        const landed = this.nearestNumberForDist(this.currentBallDist) ?? sorteado;
        const snap = this.numberToDist[landed];
        if (typeof snap === 'number') this.setBallAt(snap);
        this.isSpinning = false;
        document.body.classList.remove('spinning');
        if (this.dom.playBtn) this.dom.playBtn.classList.remove('disabled');
        this.mostrarResultado(landed, this.colorName(landed));
      }
    };
    requestAnimationFrame(step);
  },
  async mostrarResultado(winning, cor) {
    const g = this.numberElements[winning];
    if (g) { g.classList.add('winner-flash'); setTimeout(() => g.classList.remove('winner-flash'), 2400); }
    const credit = this.settleRound(winning);
    if (credit > 0) {
      const valor = this.numberFormatter.format(credit);
      await this.speakPTAsync(`Saiu ${winning}, ${cor}. Você ganhou R$ ${valor}.`);
    } else {
      await this.speakPTAsync(`Saiu ${winning}, ${cor}. Você não ganhou.`);
    }
    if (this.training && Array.isArray(this.training.missed) && this.training.missed.length) {
      const lista = this.training.missed.join(', ');
      await this.speakPTAsync(`Você deixou de marcar: ${lista}.`);
      this.training.missed = [];
    }
    if (this.neighborRestore !== null) {
      this.neighborCount = this.neighborRestore;
      this.neighborRestore = null;
      this.updateDisplays();
    }
  },
};

// --- LÓGICA DE CONTROLE GERAL E NAVEGAÇÃO ---
function mudarModo(modo) {
  $("#modo-treino").style.display = "none";
  $("#modo-quiz").style.display = "none";
  $("#modo-racetrack").style.display = "none";
  document.querySelectorAll("#botoes-modo button").forEach((btn) => btn.classList.remove("ativo"));

  if (modo === "setores") {
    $("#modo-treino").style.display = "block";
    $("#btnSetores").classList.add("ativo");
    iniciarModoSetores();
  } else if (modo === "vizinhos") {
    $("#modo-treino").style.display = "block";
    $("#btnVizinhos").classList.add("ativo");
    iniciarModoVizinhos();
  } else if (modo === "quiz") {
    $("#modo-quiz").style.display = "block";
    $("#btnQuiz").classList.add("ativo");
    quiz.init();
  } else if (modo === "racetrack") {
    $("#modo-racetrack").style.display = "flex";
    $("#btnRacetrack").classList.add("ativo");
    racetrackGame.init();
  }
}


function mudarModo(modo) {
  document.getElementById("modo-treino").style.display = "none";
  document.getElementById("modo-quiz").style.display = "none";
  document.getElementById("modo-racetrack").style.display = "none";
  document.querySelectorAll("#botoes-modo button").forEach((btn) => btn.classList.remove("ativo"));

  if (modo === "setores") {
    document.getElementById("modo-treino").style.display = "block";
    document.getElementById("btnSetores").classList.add("ativo");
    iniciarModoSetores();
  } else if (modo === "vizinhos") {
    document.getElementById("modo-treino").style.display = "block";
    document.getElementById("btnVizinhos").classList.add("ativo");
    iniciarModoVizinhos();
  } else if (modo === "quiz") {
    document.getElementById("modo-quiz").style.display = "block";
    document.getElementById("btnQuiz").classList.add("ativo");
    quiz.init();
  } else if (modo === "racetrack") {
    document.getElementById("modo-racetrack").style.display = "flex";
    document.getElementById("btnRacetrack").classList.add("ativo");
    racetrackGame.init();
  }

  // 🔒 liga/desliga o bloqueio de rolagem só no racetrack
  document.body.classList.toggle('no-scroll', modo === 'racetrack');
}

// Expor para os onclick que ficaram no HTML
window.mudarModo = mudarModo;
window.destacarSetor = destacarSetor;
window.iniciarVizinhosPorNivel = iniciarVizinhosPorNivel;

// Liga os botões do topo e entra no modo inicial
document.addEventListener("DOMContentLoaded", () => {
  $("#btnSetores")?.addEventListener("click", () => mudarModo("setores"));
  $("#btnVizinhos")?.addEventListener("click", () => mudarModo("vizinhos"));
  $("#btnQuiz")?.addEventListener("click", () => mudarModo("quiz"));
  $("#btnRacetrack")?.addEventListener("click", () => mudarModo("racetrack"));
  mudarModo("setores");
});
document.addEventListener("DOMContentLoaded", () => {
  // já existia:
  mudarModo("setores");

  // 🔥 pré-aquecer o racetrack (só desenha uma vez; fica oculto)
  requestIdleCallback?.(() => racetrackGame.init()) || setTimeout(() => racetrackGame.init(), 0);
});
