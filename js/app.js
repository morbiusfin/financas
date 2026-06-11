/* ===== Finanças 2026 — App (v2) ===== */
let DATA = { year: 2026, saldoInicial: 0, receitas: [], fixas: [], cartao: [], diaria: [], metas: {} };
window.CRYPTO_KEY = null;
const APP_VERSION = "3.11.2";
const VERSION_NOTES = "🔔 \"Próximas contas\" agora mostra só as que estão PERTO de vencer (na janela de aviso ou 5 dias) + atrasadas — não a lista do mês todo";
let history = [];
let redoStack = [];
let lastSnap = JSON.stringify(DATA);
const HISTORY_MAX = 50;
let curMonth = (new Date().getFullYear() === DATA.year) ? new Date().getMonth() : 4;
let annual = false;
let curTab = "resumo";
let resumoView = "resumo";   // "resumo" | "graficos" (toggle no topo do Resumo)
let gSelMonth = 0;           // mês (0-11) selecionado nos gráficos interativos
let charts = {};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const REAL_TODAY = new Date();
const isMesAtual = () => DATA.year === REAL_TODAY.getFullYear() && curMonth === REAL_TODAY.getMonth();

/* ---------- Horizonte dinâmico (multi-ano) ----------
   Os meses são índices ABSOLUTOS a partir de Jan/2026 (0=Jan/26, 12=Jan/27…).
   Se uma parcela/recorrência passa de Dez/26, os arrays vals/sts crescem e
   TUDO (gráficos, cálculos, simulador, barra de meses) acompanha. */
function horizonLen() {
  let n = 12;
  [DATA.receitas, DATA.fixas, DATA.cartao].forEach(arr => (arr || []).forEach(l => {
    if (l.vals && l.vals.length > n) n = l.vals.length;
  }));
  (DATA.diaria || []).forEach(d => { if ((d.mes || 0) + 1 > n) n = (d.mes || 0) + 1; });
  return Math.ceil(n / 12) * 12;            // sempre anos completos: 12, 24, 36…
}
const yearOf  = (i) => DATA.year + Math.floor(i / 12);
const curYear = () => Math.floor(curMonth / 12);                 // índice do ano em exibição (0=2026)
// quantos anos o seletor oferece: os que têm dados + 1 à frente (mín. 3) — pra dar pra planejar
function yearsCount() { return Math.max(Math.ceil(horizonLen() / 12) + 1, 3); }
const mLong   = (i) => MESES[((i % 12) + 12) % 12] + (i >= 12 ? " " + yearOf(i) : "");
const mLabel  = (i) => MESES_CURTO[((i % 12) + 12) % 12] + (i >= 12 ? "/" + String(yearOf(i)).slice(2) : "");
const diasNoMesAbs = (i) => new Date(yearOf(i), (i % 12) + 1, 0).getDate();
// garante que vals/sts da linha cubram pelo menos `len` meses (preenche com 0/"vazio")
function ensureLen(line, len) {
  if (!Array.isArray(line.vals)) line.vals = [];
  if (!Array.isArray(line.sts)) line.sts = [];
  while (line.vals.length < len) line.vals.push(0);
  while (line.sts.length < len) line.sts.push("vazio");
}
// rótulo curto de valor pra dentro do gráfico: ≥1000 vira "R$ 1,2k"; abaixo, valor cheio
function fmtBar(v) {
  const neg = v < 0, a = Math.abs(v);
  if (a >= 1000) { const k = a / 1000, s = (k >= 10 ? Math.round(k) : Math.round(k * 10) / 10); return (neg ? "-" : "") + String(s).replace(".", ",") + "k"; }
  return (neg ? "-" : "") + Math.round(a);
}

/* Plugin Chart.js: escreve o valor (R$1,2k) em cada barra/ponto, centralizado e
   com fonte que cabe na barra. Fica DESLIGADO por padrão; cada gráfico liga com
   plugins:{ valueLabels:{ on:true } }. Não afeta a rosca (que não liga). */
const ValueLabels = {
  id: "valueLabels",
  afterDatasetsDraw(chart, _a, opts) {
    if (!opts || opts.on !== true) return;          // só desenha onde o gráfico pediu (não na rosca)
    const ctx = chart.ctx, isLine = chart.config.type === "line";
    const ink = (getComputedStyle(document.documentElement).getPropertyValue("--ink") || "#11201a").trim();
    const fam = Chart.defaults.font.family || "sans-serif";
    // 1) coleta candidatos (valor de cada barra/ponto), com fonte que cabe na barra
    const cand = [];
    chart.data.datasets.forEach((ds, di) => {
      if (ds._sim || ds._trend) return;                      // não rotula linha do simulador nem a de tendência
      const meta = chart.getDatasetMeta(di);
      if (!meta || meta.hidden) return;
      (meta.data || []).forEach((el, i) => {
        const raw = ds.data[i];
        if (raw == null || raw === 0) return;
        const txt = fmtBar(raw);
        let fs = 11;
        if (!isLine && el.width) fs = Math.max(8, Math.min(11.5, (el.width * 1.6) / (txt.length * 0.6)));
        const neg = raw < 0;
        const y = isLine ? el.y - 8 : (neg ? el.y + fs + 5 : el.y - 5);
        cand.push({ x: el.x, y, txt, fs, w: txt.length * fs * 0.6 });
      });
    });
    // 2) desenha da esquerda p/ direita, pulando o que sobreporia o vizinho (fica limpo de 7 a 24+ meses)
    cand.sort((a, b) => a.x - b.x);
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "alphabetic"; ctx.fillStyle = ink;
    let lastRight = -Infinity;
    cand.forEach(c => {
      if (c.x - c.w / 2 < lastRight + 3) return;            // sobreporia → pula
      ctx.font = "800 " + c.fs.toFixed(1) + "px " + fam;
      ctx.fillText(c.txt, c.x, c.y);
      lastRight = c.x + c.w / 2;
    });
    ctx.restore();
  }
};
if (typeof Chart !== "undefined") Chart.register(ValueLabels);

/* ---------- Engine (regras da planilha) ---------- */
const sumMonth = (lines, m) => lines.reduce((s, l) => s + (Number(l.vals[m]) || 0), 0);
const sumStatus = (lines, m, sts) => lines.reduce((s, l) => s + ((sts.includes(l.sts[m]) ? Number(l.vals[m]) : 0) || 0), 0);
const receitaMes = (m) => sumMonth(DATA.receitas, m);
const fixasMes   = (m) => sumMonth(DATA.fixas, m);
const cartaoMes  = (m) => sumMonth(DATA.cartao, m);
const diariaMes  = (m) => DATA.diaria.filter(d => d.mes === m).reduce((s, d) => s + (Number(d.valor) || 0), 0);
const despesaMes = (m) => fixasMes(m) + cartaoMes(m) + diariaMes(m);

// Previsto x Realizado
const recebido  = (m) => sumStatus(DATA.receitas, m, ["recebido"]);
const aReceber  = (m) => sumStatus(DATA.receitas, m, ["programado"]);
const pago      = (m) => sumStatus(DATA.fixas, m, ["pago"]) + sumStatus(DATA.cartao, m, ["pago"]) + diariaMes(m);
const aPagar    = (m) => sumStatus(DATA.fixas, m, ["programado"]) + sumStatus(DATA.cartao, m, ["programado"]);

// Fluxo de caixa: saldo inicial (mês ant.) -> disponível -> sobra
function sobraMes(m) {
  let acc = Number(DATA.saldoInicial) || 0;
  for (let i = 0; i <= m; i++) acc += receitaMes(i) - despesaMes(i);
  return acc;
}
const saldoInicialMes = (m) => m === 0 ? (Number(DATA.saldoInicial) || 0) : sobraMes(m - 1);
const disponivelMes = (m) => saldoInicialMes(m) + receitaMes(m);

// Receita por tipo
const receitaTipo = (m, tipo) => DATA.receitas.filter(r => r.tipo === tipo).reduce((s, r) => s + (Number(r.vals[m]) || 0), 0);

// ===== Vencimentos (lógica IGUAL ao Apps Script "Notifica") =====
// janela: do dia (vencimento - aviso) ATÉ o vencimento (inclusive). Depois: vencida.
function vencimentos(m) {
  const hojeDia = REAL_TODAY.getDate();
  return DATA.fixas
    .filter(l => l.dia && l.vals[m] > 0)
    .map(l => {
      const venc = l.dia, aviso = l.aviso || 0, val = l.vals[m], st = l.sts[m];
      const pago = st === "pago";
      let daysLeft = null, naJanela = false, vencida = false;
      if (isMesAtual()) {
        daysLeft = venc - hojeDia;
        naJanela = !pago && daysLeft >= 0 && daysLeft <= aviso;     // dentro do alerta
        vencida = !pago && daysLeft < 0;
      }
      return { id: l.id, desc: l.desc, venc, aviso, val, pago, daysLeft, naJanela, vencida };
    })
    .sort((a, b) => a.venc - b.venc);
}
const contasAlerta = (m) => vencimentos(m).filter(v => v.naJanela || (isMesAtual() && !v.pago && v.daysLeft >= 0));
// SÓ as contas PERTO de vencer: dentro da janela de aviso da conta (ou 5 dias, se não tiver aviso) + atrasadas
function contasPerto(m) {
  if (!isMesAtual()) return [];
  return vencimentos(m).filter(v => {
    if (v.pago) return false;
    if (v.vencida) return true;                                   // atrasada = urgente, sempre mostra
    const win = (v.aviso && v.aviso > 0) ? v.aviso : 5;
    return v.daysLeft >= 0 && v.daysLeft <= win;
  });
}

/* ---------- Selo de vencimento: cor/efeito por proximidade ----------
   Quanto mais perto, mais "quente" (vermelho de atenção). 1 dia = "Amanhã" (amarelo). */
function vencBadge(daysLeft) {
  if (daysLeft == null) return { cls: "", txt: "" };
  if (daysLeft < 0)  return { cls: "atras", txt: `atrasada ${-daysLeft}d` };
  if (daysLeft === 0) return { cls: "d0", txt: "vence hoje" };
  if (daysLeft === 1) return { cls: "d1", txt: "Amanhã" };
  if (daysLeft <= 3)  return { cls: "d3", txt: `em ${daysLeft}d` };
  if (daysLeft <= 7)  return { cls: "d7", txt: `em ${daysLeft}d` };
  return { cls: "dlong", txt: `em ${daysLeft}d` };
}
const vencBadgeHTML = (daysLeft) => { const b = vencBadge(daysLeft); return b.txt ? `<span class="venc-badge ${b.cls}">${b.txt}</span>` : ""; };

/* ---------- Notificação local (replica o aviso do Apps Script) ---------- */
function checkAndNotify() {
  if (!isMesAtual()) return;
  const alertas = contasPerto(curMonth);
  if (!alertas.length) return;
  // 1) AVISO DENTRO DO APP — pop-up no MEIO da tela com botão OK (sem instalar/permissão)
  setTimeout(() => showBillAlert(alertas), 500);
  // 2) NOTIFICAÇÃO DO SISTEMA — só onde o navegador deixa (PC/Android, ou PWA instalado no iPhone)
  if (("Notification" in window) && Notification.permission === "granted") {
    const linhas = alertas.map(v => `• ${v.desc} — ${brl(v.val)} (${v.daysLeft === 0 ? "vence hoje" : "vence em " + v.daysLeft + "d"})`).join("\n");
    try {
      new Notification("💸 Contas a pagar", { body: linhas, icon: "icons/icon-192.png", tag: "vencimentos" });
    } catch (e) {}
  }
}
// Pop-up CENTRALIZADO de contas a vencer (com botão OK)
function showBillAlert(alertas) {
  const modal = $("#alertModal"); if (!modal) return;
  const total = alertas.reduce((s, v) => s + (Number(v.val) || 0), 0);
  $("#alertTitle").textContent = `${alertas.length} conta(s) a vencer`;
  $("#alertBody").innerHTML = alertas.map(v =>
    `<div class="alert-line"><div><div class="al-desc">${esc(v.desc)}</div><div class="al-sub">dia ${v.venc} ${vencBadgeHTML(v.daysLeft)}</div></div><span class="al-val">${brl(v.val)}</span></div>`
  ).join("") + `<div class="alert-total"><span>Total a pagar</span><b>${brl(total)}</b></div>`;
  modal.classList.remove("hidden", "closing");
  $("#alertOk").onclick = closeBillAlert;
  $("#alertVer").onclick = () => { closeBillAlert(); focarVencimentos(); };
}
// fecha o pop-up com animação de saída (esvaece + encolhe)
function closeBillAlert() {
  const m = $("#alertModal"); if (!m) return;
  m.classList.add("closing");
  setTimeout(() => { m.classList.add("hidden"); m.classList.remove("closing"); }, 280);
}
function pedirNotificacao() {
  if (!("Notification" in window)) {
    // iPhone no Safari sem instalar cai aqui — Apple bloqueia notificação de site não instalado.
    toast("Seu navegador não permite notificação do sistema aqui. O aviso DENTRO do app continua funcionando ao abrir.");
    checkAndNotify();
    return;
  }
  Notification.requestPermission().then(p => {
    toast(p === "granted" ? "Notificações ativadas ✅" : "Sem permissão — mas o aviso no app continua ao abrir");
    if (p === "granted") checkAndNotify();
    render();
  });
}

/* ---------- Barra de meses ---------- */
function renderMonthBar() {
  const bar = $("#monthBar");
  const base = curYear() * 12;                       // só os 12 meses do ANO selecionado
  let html = "";
  for (let i = 0; i < 12; i++) {
    const abs = base + i;
    html += `<button class="month-chip ${!annual && abs === curMonth ? "active" : ""}" data-m="${abs}">${MESES_CURTO[i]}</button>`;
  }
  bar.innerHTML = html + `<button class="month-chip ano ${annual ? "active" : ""}" data-m="ano">Ano</button>`;
  $$(".month-chip", bar).forEach(b => b.onclick = () => {
    if (b.dataset.m === "ano") { annual = true; }
    else { annual = false; curMonth = +b.dataset.m; }
    render();
  });
  const active = $(".month-chip.active", bar);
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
  renderYearSelect();
}
// Seletor de ANO (validação de dados / dropdown). Ao trocar, muda o app inteiro pro ano escolhido.
function renderYearSelect() {
  const sel = $("#yearSelect"); if (!sel) return;
  const n = yearsCount();
  sel.innerHTML = Array.from({ length: n }, (_, y) => `<option value="${y}" ${y === curYear() ? "selected" : ""}>${DATA.year + y}</option>`).join("");
  sel.onchange = () => {
    const y = Math.max(0, Math.min(yearsCount() - 1, parseInt(sel.value) || 0));
    curMonth = y * 12 + (((curMonth % 12) + 12) % 12);   // mantém o mês, troca o ano
    suppressNextAnim = true; window.scrollTo(0, 0); render();
  };
}

/* ---------- Render principal ---------- */
let suppressNextAnim = false;       // pula as animações de ENTRADA no próximo render (ex.: ao pagar, pra não "piscar")
function render() {
  const maxM = yearsCount() * 12 - 1; if (curMonth > maxM) curMonth = maxM; if (curMonth < 0) curMonth = 0;
  const noAnim = suppressNextAnim; suppressNextAnim = false;
  renderMonthBar();
  const ub = $("#btnUndo"); if (ub) { ub.disabled = !history.length; ub.style.opacity = history.length ? "1" : ".35"; }
  const rb = $("#btnRedo"); if (rb) { rb.disabled = !redoStack.length; rb.style.opacity = redoStack.length ? "1" : ".35"; }
  $("#screenTitle").textContent = annual && curTab === "resumo" ? "Resumo " + (DATA.year + curYear()) : ({
    resumo: "Resumo", receitas: "Receitas", fixas: "Despesas Fixas",
    cartao: "Cartão Mercado Pago", diaria: "Débitos Dia a Dia"
  })[curTab];
  $("#fab").classList.toggle("hidden", curTab === "resumo");
  const view = $("#view");
  view.classList.toggle("no-anim", noAnim);
  view.innerHTML = "";
  if (curTab === "resumo") { if (annual) renderAnual(view); else renderResumo(view); }
  else renderLista(view);
  if (noAnim) requestAnimationFrame(() => requestAnimationFrame(() => { const v = $("#view"); if (v) v.classList.remove("no-anim"); }));
}

/* ---------- Inteligência local (insights + saúde) — NADA sai do aparelho ---------- */
const _pct = (a, b) => (b ? Math.round(a / b * 100) : 0);

// Pontuação de saúde financeira (0–100), baseada na taxa de poupança + orçamento + sobra.
function healthScore(m) {
  const rec = receitaMes(m), desp = despesaMes(m), sobra = disponivelMes(m) - desp;
  let score = 50;
  if (rec > 0) score = 50 + Math.round((rec - desp) / rec * 130);   // poupar 38% ≈ 100; gastar tudo = 50; estourar ≈ baixo
  if (sobra > 0) score += 6; else score -= 10;
  const metas = DATA.metas || {};
  [["fixas", fixasMes(m)], ["cartao", cartaoMes(m)], ["diaria", diariaMes(m)]]
    .forEach(([k, v]) => { if ((metas[k] || 0) > 0 && v > metas[k]) score -= 8; });
  return Math.max(0, Math.min(100, score));
}
function healthMeta(s) {
  if (s >= 75) return { c: "#1db954", t: "Ótima", e: "💪" };
  if (s >= 55) return { c: "#3fae6b", t: "Boa", e: "🙂" };
  if (s >= 35) return { c: "#f5a623", t: "Atenção", e: "⚠️" };
  return { c: "#e5484d", t: "Crítica", e: "🆘" };
}
function renderHealth(m) {
  const rec = receitaMes(m), desp = despesaMes(m);
  const s = healthScore(m), meta = healthMeta(s);
  const taxa = rec > 0 ? Math.round((rec - desp) / rec * 100) : 0;
  const len = Math.PI * 74, off = len * (1 - s / 100);
  return `<div class="section-card health fade-in"><h3>Saúde financeira — ${mLong(m)}</h3>
    <div class="health-body">
      <svg class="gauge" viewBox="0 0 180 110" width="170">
        <path d="M16 96 A 74 74 0 0 1 164 96" fill="none" stroke="var(--line)" stroke-width="14" stroke-linecap="round"/>
        <path id="gArc" class="g-arc" d="M16 96 A 74 74 0 0 1 164 96" fill="none" stroke="${meta.c}" stroke-width="14" stroke-linecap="round"
          stroke-dasharray="${len.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" data-off="${off.toFixed(1)}"/>
        <text id="gaugeNum" x="90" y="84" text-anchor="middle" class="gauge-num" data-amt="${s}">${s}</text>
        <text x="90" y="103" text-anchor="middle" class="gauge-of">de 100</text>
      </svg>
      <div class="health-meta">
        <div class="health-emoji">${meta.e}</div>
        <div class="health-t" style="color:${meta.c}">${meta.t}</div>
        <div class="health-sub">${taxa >= 0 ? "guardou <b>" + taxa + "%</b> do que recebeu" : "<b>" + Math.abs(taxa) + "%</b> no vermelho"}</div>
      </div>
    </div></div>`;
}

// Insights espertos (até 4), calculados localmente.
function computeInsights(m) {
  const out = [];
  const rec = receitaMes(m), desp = despesaMes(m), disp = disponivelMes(m), sobra = disp - desp;
  if (rec > 0) {
    const taxa = Math.round((rec - desp) / rec * 100);
    out.push(taxa >= 0
      ? { ic: "🟢", tone: "good", text: `Você guardou <b>${taxa}%</b> do que recebeu em ${mLong(m)}.` }
      : { ic: "🔴", tone: "bad", text: `Gastou <b>${Math.abs(taxa)}%</b> a mais do que recebeu em ${mLong(m)}.` });
  }
  // 🚨 Cuidado: sobra do mês negativa
  if (sobra < 0) out.push({ ic: "🚨", tone: "bad", text: `Cuidado: a sobra de ${mLong(m)} está <b>negativa (${brl(sobra)})</b>. Segure os gastos não essenciais.` });
  // 💰 Onde economizar: maior despesa do mês entre Fixas e Cartão — pulando o que está marcado como "necessário"
  let topFix = null;
  const scanEco = (arr) => (arr || []).forEach(l => { if (l.nec) return; const v = Number(l.vals[m]) || 0; if (v > 0 && (!topFix || v > topFix.val)) topFix = { desc: l.desc, val: v }; });
  scanEco(DATA.fixas); scanEco(DATA.cartao);
  if (topFix && topFix.val > 0)
    out.push({ ic: "💰", tone: "info", text: `Pra economizar: <b>${esc(topFix.desc)}</b> custa ${brl(topFix.val)}/mês (~${brl(topFix.val * 12)}/ano). Revisar ou cancelar é seu maior corte.` });
  if (isMesAtual()) {
    const hoje = REAL_TODAY.getDate(), diasNoMes = diasNoMesAbs(m);
    const gastoAteAgora = pago(m);
    if (hoje >= 3 && gastoAteAgora > 0) {
      const proj = gastoAteAgora / hoje * diasNoMes, projSobra = disp - proj;
      out.push({ ic: "📈", tone: projSobra >= 0 ? "good" : "warn",
        text: `No ritmo atual, fecha o mês gastando ~<b>${brl(proj)}</b> e sobrando ~<b>${brl(projSobra)}</b>.` });
    }
  }
  if (m > 0) {
    const ant = despesaMes(m - 1);
    if (ant > 0 && desp > 0) {
      const d = Math.round((desp - ant) / ant * 100);
      if (Math.abs(d) >= 5) out.push({ ic: d > 0 ? "⬆️" : "⬇️", tone: d > 0 ? "warn" : "good",
        text: `Despesas ${d > 0 ? "subiram" : "caíram"} <b>${Math.abs(d)}%</b> vs ${mLong(m - 1)} (${brl(ant)} → ${brl(desp)}).` });
    }
  }
  const cats = [{ n: "Cartão", v: cartaoMes(m) }, { n: "Despesas Fixas", v: fixasMes(m) }, { n: "Dia a dia", v: diariaMes(m) }].sort((a, b) => b.v - a.v);
  if (cats[0].v > 0 && desp > 0)
    out.push({ ic: "🥇", tone: "info", text: `Maior gasto: <b>${cats[0].n}</b> — ${brl(cats[0].v)} (${_pct(cats[0].v, desp)}% do total).` });
  const metas = DATA.metas || {}, estouro = [];
  [["fixas", fixasMes(m), "Fixas"], ["cartao", cartaoMes(m), "Cartão"], ["diaria", diariaMes(m), "Dia a dia"]]
    .forEach(([k, v, n]) => { if ((metas[k] || 0) > 0 && v > metas[k]) estouro.push(n); });
  if (estouro.length) out.push({ ic: "⚠️", tone: "bad", text: `Orçamento estourado em <b>${estouro.join(", ")}</b>.` });
  if (m >= 3) {
    const med = (cartaoMes(m - 1) + cartaoMes(m - 2) + cartaoMes(m - 3)) / 3, atual = cartaoMes(m);
    if (med > 0 && atual > med * 1.3)
      out.push({ ic: "👀", tone: "warn", text: `Cartão <b>${_pct(atual - med, med)}%</b> acima da média dos últimos 3 meses.` });
  }
  return out.slice(0, 6);
}
function renderInsights(m) {
  const ins = computeInsights(m);
  if (!ins.length) return "";
  return `<div class="section-card fade-in"><h3>💡 Insights</h3><div class="insights">${
    ins.map(i => `<div class="insight ${i.tone}"><span class="ic">${i.ic}</span><span>${i.text}</span></div>`).join("")
  }</div></div>`;
}

/* ---------- Tema (claro / escuro / automático) ---------- */
const THEME_KEY = "financas2026.theme";
const curTheme = () => localStorage.getItem(THEME_KEY) || "auto";
function applyTheme() {
  const t = curTheme(), h = document.documentElement;
  h.classList.remove("theme-dark", "theme-light");
  if (t === "dark") h.classList.add("theme-dark");
  else if (t === "light") h.classList.add("theme-light");
}
const themeLabel = () => ({ auto: "Automático", dark: "Escuro", light: "Claro" })[curTheme()];
function cycleTheme() {
  const order = ["auto", "light", "dark"];
  localStorage.setItem(THEME_KEY, order[(order.indexOf(curTheme()) + 1) % 3]);
  applyTheme(); render(); renderNotifBtn();
  toast("Tema: " + themeLabel());
}

/* ---------- RESUMO (mês) ---------- */
function renderResumo(view) {
  const m = curMonth;
  const toggle = viewToggleHTML();
  if (resumoView === "graficos") {
    view.innerHTML = toggle + `<div id="gfxHost"></div>`;
    bindViewToggle();
    renderGraficos($("#gfxHost"));
    return;
  }
  const rec = receitaMes(m), desp = despesaMes(m);
  const sIni = saldoInicialMes(m), disp = disponivelMes(m), sobra = disp - desp;
  const alertas = contasPerto(m);

  view.innerHTML = toggle + `
    ${alertas.length ? `<div class="alert-banner" id="goVenc">🔔 <b>${alertas.length}</b> conta(s) a vencer — toque para ver</div>` : ""}

    ${alertas.length ? `<div class="section-card fade-in" id="vencCard"><h3>📌 Próximas contas</h3><div id="vencList"></div></div>` : ""}

    ${renderHealth(m)}

    <div class="flow-card fade-in">
      <div class="flow-row"><span>Saldo inicial <i>(sobrou do mês anterior)</i></span><b>${brl(sIni)}</b></div>
      <div class="flow-row plus"><span>+ Receitas</span><b class="pos">${brl(rec)}</b></div>
      <div class="flow-row eq"><span>= Disponível</span><b>${brl(disp)}</b></div>
      <div class="flow-row minus"><span>− Despesas</span><b class="neg">${brl(desp)}</b></div>
      <div class="flow-row total"><span>= Sobra do mês</span><b id="sobraVal" class="countup ${sobra >= 0 ? "pos" : "neg"}" data-amt="${sobra}">${brl(sobra)}</b></div>
    </div>

    ${renderInsights(m)}

    <div class="section-card sim-card"><h3>🧪 Vale a pena comprar? <button type="button" id="simClear" class="sim-clear">↺ limpar</button></h3>
      <div class="sim-body">
        <div class="field-row">
          <label class="field" style="margin:0;flex:2"><span>Quero gastar (R$)</span>
            <input id="simInput" type="number" step="0.01" inputmode="decimal" placeholder="0,00" /></label>
          <label class="field" style="margin:0;flex:1"><span>Parcelas</span>
            <input id="simN" type="number" min="1" max="48" inputmode="numeric" value="1" /></label>
        </div>
        <div id="simVerdict" class="sim-verdict hint">Digite um valor (e nº de parcelas) — eu simulo mês a mês e digo se/quando vale a pena, antes de lançar.</div>
        <div id="simChartWrap" class="sim-chart hidden"><canvas id="simChart" height="150"></canvas></div>
      </div>
    </div>

    <div class="section-card"><h3>Previsto × Realizado — ${mLong(m)}</h3>
      ${barPrevReal("Receitas", recebido(m), aReceber(m), "recebido", "a receber")}
      ${barPrevReal("Despesas", pago(m), aPagar(m), "pago", "a pagar")}
    </div>

    <div class="section-card"><h3>Composição das despesas</h3>
      <div class="chart-wrap"><canvas id="doughChart" height="170"></canvas></div>
      <div id="catList"></div></div>

    ${renderMetas(m)}

    <div class="section-card"><h3>Receitas × Despesas (ano)</h3>
      <div class="chart-wrap"><canvas id="barChart" height="190"></canvas></div></div>

    <div class="section-card"><h3>Projeção do saldo (ano) <i class="h3-sub">— realizado + provisão dos próximos meses</i></h3>
      <div class="chart-wrap"><canvas id="lineChart" height="180"></canvas></div></div>
  `;
  if (alertas.length) renderVencList();
  renderCatList(m);
  bindSimulador(m);
  renderCharts();
  animateResumo();
  bindViewToggle();
  const gv = $("#goVenc"); if (gv) gv.onclick = () => focarVencimentos();
}

// Rola até os vencimentos E pisca um destaque em volta (mostra qual focar).
function focarVencimentos() {
  scrollToEl("#vencCard");
  const card = $("#vencCard"); if (!card) return;
  const rows = $$(".list-row", card);
  card.classList.remove("focus-pulse"); void card.offsetWidth; card.classList.add("focus-pulse");
  rows.forEach((r, i) => { r.classList.remove("focus-row"); void r.offsetWidth; r.style.animationDelay = (i * 0.14) + "s"; r.classList.add("focus-row"); });
  setTimeout(() => { card.classList.remove("focus-pulse"); rows.forEach(r => { r.classList.remove("focus-row"); r.style.animationDelay = ""; }); }, 4800);
}

/* ---------- Simulador "vale a pena comprar?" (à vista ou parcelado) ---------- */
let simBuy = 0, simN = 1;
function bindSimulador(m) {
  const inp = $("#simInput"), inpN = $("#simN"); if (!inp) return;
  if (charts.sim) { try { charts.sim.destroy(); } catch (e) {} charts.sim = null; }   // canvas foi recriado no render
  inp.value = simBuy ? simBuy : "";
  if (inpN) inpN.value = simN || 1;
  const upd = () => { simBuy = parseFloat(inp.value) || 0; simN = Math.max(1, parseInt(inpN && inpN.value) || 1); updateSim(m); };
  inp.oninput = upd; if (inpN) inpN.oninput = upd;
  const clr = $("#simClear");
  if (clr) clr.onclick = () => { simBuy = 0; simN = 1; inp.value = ""; if (inpN) inpN.value = "1"; updateSim(m); inp.focus(); };
  updateSim(m);
}
function updateSim(m) { updateSimVerdict(m); updateSimOverlay(); updateSimChart(m); }

// horizonte do simulador: cobre o que já existe E o alcance das parcelas simuladas
const simHorizon = (start, n) => Math.max(horizonLen(), start + n);
// saldo simulado mês a mês: subtrai as parcelas já pagas até cada mês (começando em `start`)
function simBalForStart(total, n, start) {
  const parcela = total / Math.max(1, n), H = simHorizon(start, n), out = [];
  for (let k = 0; k < H; k++) { const pagas = Math.max(0, Math.min(n, k - start + 1)); out.push(sobraMes(k) - parcela * pagas); }
  return out;
}
const simBalArray = () => simBalForStart(simBuy, simN, curMonth);
function minFrom(arr, from) { let mn = Infinity, idx = from; for (let k = from; k < arr.length; k++) if (arr[k] < mn) { mn = arr[k]; idx = k; } return { mn, idx }; }
// menor mês a partir do qual a compra (no mesmo parcelamento) cabe sem ficar negativo (busca até ~3 anos à frente)
function earliestFeasibleMonth(total, n) { const lim = curMonth + 36; for (let s = curMonth; s < lim; s++) if (minFrom(simBalForStart(total, n, s), s).mn >= 0) return s; return null; }
// menor nº de parcelas que cabe JÁ neste mês com folga (>=10% da receita)
function suggestParcelas(total) { const rec = receitaMes(curMonth) || 1; for (let n = 1; n <= 48; n++) if (minFrom(simBalForStart(total, n, curMonth), curMonth).mn >= rec * 0.1) return n; return null; }

function verdictData() {
  if (!simBuy || simBuy <= 0) return null;
  const m = curMonth, total = simBuy, n = simN, parcela = total / n, rec = receitaMes(m) || 1, comfort = rec * 0.1;
  const bal = simBalForStart(total, n, m), { mn, idx } = minFrom(bal, m);
  const comoPaga = n > 1 ? `${n}× de <b>${brl(parcela)}</b>` : "à vista";
  let cls, icon, head, extra = "";
  if (mn < 0) {
    cls = "bad"; icon = "⛔";
    head = `Agora não cabe (${comoPaga}). No pior mês (<b>${mLong(idx)}</b>) faltaria <b>${brl(mn)}</b>.`;
    const e = earliestFeasibleMonth(total, n), sug = suggestParcelas(total), parts = [];
    if (e !== null && e > m) parts.push(`📅 Dá pra comprar a partir de <b>${mLong(e)}</b> (no mesmo parcelamento).`);
    if (sug !== null) parts.push(`💳 Ou parcele em <b>${sug}×</b> de ${brl(total / sug)} pra caber já em ${mLong(m)} sem se afogar.`);
    if (!parts.length) parts.push(`Essa compra não cabe nem parcelando bastante — considere reduzir o valor.`);
    extra = parts.join("<br>");
  } else if (mn < comfort) {
    cls = "warn"; icon = "🟡";
    head = `Dá pra comprar (${comoPaga}), mas aperta: no pior mês (<b>${mLong(idx)}</b>) sobra só <b>${brl(mn)}</b>.`;
    const sug = suggestParcelas(total);
    if (sug !== null && sug > n) extra = `💳 Pra ficar tranquilo, parcele em <b>${sug}×</b> de ${brl(total / sug)}.`;
  } else {
    cls = "good"; icon = "✅";
    head = `Pode comprar! (${comoPaga}) No pior mês (<b>${mLong(idx)}</b>) ainda sobra <b>${brl(mn)}</b>.`;
  }
  return { cls, icon, head, extra };
}
function renderVerdictInto(el) {
  if (!el) return;
  const v = verdictData();
  if (!v) { el.className = "sim-verdict hint"; el.innerHTML = "Digite um valor (e nº de parcelas) — eu simulo mês a mês e digo se/quando vale a pena, antes de lançar."; return; }
  el.className = "sim-verdict " + v.cls;
  el.innerHTML = `<span class="sim-ic">${v.icon}</span><span>${v.head}${v.extra ? `<span class="sim-extra">${v.extra}</span>` : ""}</span>`;
}
function updateSimVerdict(m) { renderVerdictInto($("#simVerdict")); }
// linha tracejada na projeção (acompanha simultaneamente)
function updateSimOverlay() {
  if (!charts.line) return;
  const ds = charts.line.data.datasets, i = ds.findIndex(d => d._sim); if (i >= 0) ds.splice(i, 1);
  if (simBuy > 0) {
    const base = curYear() * 12, arr = simBalArray();   // arr é indexado por mês ABSOLUTO
    const data = Array.from({ length: 12 }, (_, i) => { const a = base + i; return arr[a] != null ? arr[a] : sobraMes(a); });
    ds.push({ _sim: true, label: simN > 1 ? `Se comprar (${simN}×)` : "Se eu comprar", data,
      borderColor: "#f5a623", borderWidth: 2, borderDash: [5, 4], backgroundColor: "transparent", fill: false, tension: .38, pointRadius: 0 });
  }
  try { charts.line.update(); } catch (e) {}
}
// gráfico de barras: sobra de cada mês COM a compra (verde=bem, amarelo=aperta, vermelho=mal)
function updateSimChart(m) {
  const wrap = $("#simChartWrap"), cv = $("#simChart"); if (!wrap || !cv) return;
  if (!simBuy || simBuy <= 0) { wrap.classList.add("hidden"); if (charts.sim) { try { charts.sim.destroy(); } catch (e) {} charts.sim = null; } return; }
  wrap.classList.remove("hidden");
  const rec = receitaMes(m) || 1, comfort = rec * 0.1;
  const bal = simBalForStart(simBuy, simN, m), H = bal.length, labels = [], data = [], colors = [];
  for (let k = m; k < H; k++) { labels.push(mLabel(k)); data.push(Math.round(bal[k])); colors.push(bal[k] < 0 ? "#e5484d" : bal[k] < comfort ? "#f5a623" : "#15c266"); }
  if (charts.sim) { charts.sim.data.labels = labels; charts.sim.data.datasets[0].data = data; charts.sim.data.datasets[0].backgroundColor = colors; charts.sim.update(); return; }
  applyChartTheme();
  charts.sim = new Chart(cv, { type: "bar",
    data: { labels, datasets: [{ data, backgroundColor: colors, borderRadius: 5 }] },
    options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 18, bottom: 4 } },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => "Sobra: " + brl(c.raw) } }, valueLabels: { on: true } },
      scales: { y: { display: false, grace: "18%" }, x: { grid: { display: false }, ticks: { font: { size: 10 }, autoSkip: true, maxRotation: 0 } } } } });
}

/* ---------- Animações de entrada (count-up + medidor) ---------- */
function animateResumo() {
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const gn = $("#gaugeNum"); if (gn) animateNumber(gn, parseFloat(gn.dataset.amt) || 0, v => String(Math.round(v)), 750);
  const sv = $("#sobraVal"); if (sv) animateNumber(sv, parseFloat(sv.dataset.amt) || 0, v => brl(v), 750);
  const ga = $("#gArc");
  if (ga && ga.dataset.off != null) {
    const len = Math.PI * 74; ga.style.strokeDashoffset = len;
    requestAnimationFrame(() => requestAnimationFrame(() => { ga.style.strokeDashoffset = ga.dataset.off; }));
  }
}
function animateNumber(el, to, fmt, dur) {
  if (el._raf) cancelAnimationFrame(el._raf);
  const start = performance.now();
  const step = (now) => {
    const p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 3);
    el.textContent = fmt(to * e);
    if (p < 1) el._raf = requestAnimationFrame(step); else { el.textContent = fmt(to); el._raf = null; }
  };
  el._raf = requestAnimationFrame(step);
}

// Rola até um elemento descontando a altura do cabeçalho fixo (não joga "longe demais").
function scrollToEl(sel) {
  const el = $(sel); if (!el) return;
  const head = $(".app-header"), off = (head ? head.offsetHeight : 0) + 12;
  const y = el.getBoundingClientRect().top + window.scrollY - off;
  window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
}

function barPrevReal(label, real, prev, lblReal, lblPrev) {
  const tot = real + prev, pct = tot ? Math.round(real / tot * 100) : 0;
  return `<div class="pr-block">
    <div class="pr-head"><span>${label}</span><span>${brl(real)} <i>de ${brl(tot)}</i></span></div>
    <div class="pr-bar"><div class="pr-fill" style="width:${pct}%"></div></div>
    <div class="pr-legend"><span>✅ ${lblReal}: ${brl(real)}</span><span>⏳ ${lblPrev}: ${brl(prev)}</span></div>
  </div>`;
}

function renderVencList() {
  const el = $("#vencList"); if (!el) return;
  const vs = contasPerto(curMonth);
  el.innerHTML = vs.map(v =>
    `<div class="list-row">
      <div class="desc"><div class="name">${esc(v.desc)}</div><div class="sub">dia ${v.venc} ${vencBadgeHTML(v.daysLeft)}</div></div>
      <span class="amount">${brl(v.val)}</span>
      <button class="mini-btn" data-pay="${v.id}">Pagar</button>
    </div>`
  ).join("");
  // Pagar: a linha esvaece e a lista encolhe (≤ ~0,7s) antes de salvar
  $$("[data-pay]", el).forEach(b => b.onclick = () => {
    const id = b.dataset.pay, row = b.closest(".list-row");
    const pagar = () => { const l = DATA.fixas.find(x => x.id === id); if (l) { l.sts[curMonth] = "pago"; suppressNextAnim = true; persist(); toast("Pago ✅"); } };
    if (row && !(window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches)) {
      row.classList.add("paying"); setTimeout(pagar, 620);
    } else pagar();
  });
}

function renderCatList(m) {
  const cats = [
    { name: "Despesas Fixas", val: fixasMes(m), color: "#0b3d2e" },
    { name: "Cartão Mercado Pago", val: cartaoMes(m), color: "#1db954" },
    { name: "Débitos Dia a Dia", val: diariaMes(m), color: "#f5a623" },
  ].filter(c => c.val > 0);
  const el = $("#catList"); if (!el) return;
  if (!cats.length) { el.innerHTML = `<div class="empty">Sem despesas neste mês.</div>`; return; }
  const tot = cats.reduce((s, c) => s + c.val, 0);
  el.innerHTML = cats.map(c =>
    `<div class="cat-line"><span class="dot" style="background:${c.color}"></span>
     <span class="cname">${c.name}</span><span class="cval">${brl(c.val)} <i>(${Math.round(c.val / tot * 100)}%)</i></span></div>`
  ).join("");
}

function renderMetas(m) {
  const metas = DATA.metas || {};
  const itens = [
    { k: "fixas", name: "Despesas Fixas", val: fixasMes(m) },
    { k: "cartao", name: "Cartão", val: cartaoMes(m) },
    { k: "diaria", name: "Dia a Dia", val: diariaMes(m) },
  ].filter(i => (metas[i.k] || 0) > 0);
  if (!itens.length) return "";
  return `<div class="section-card"><h3>Orçamento do mês (META)</h3>${itens.map(i => {
    const meta = metas[i.k], pct = Math.min(100, Math.round(i.val / meta * 100)), over = i.val > meta;
    return `<div class="pr-block">
      <div class="pr-head"><span>${i.name}</span><span class="${over ? "neg" : ""}">${brl(i.val)} <i>/ ${brl(meta)}</i></span></div>
      <div class="pr-bar"><div class="pr-fill ${over ? "over" : ""}" style="width:${pct}%"></div></div>
    </div>`;
  }).join("")}</div>`;
}

/* ---------- RESUMO ANUAL ---------- */
function renderAnual(view) {
  const yi0 = curYear() * 12, yi1 = yi0 + 12, ano = DATA.year + curYear();
  const range = (fn) => { let s = 0; for (let i = yi0; i < yi1; i++) s += fn(i); return s; };
  const totRec = range(receitaMes), totDesp = range(despesaMes), sobraAno = totRec - totDesp;
  const cat = { fixas: range(fixasMes), cartao: range(cartaoMes), diaria: range(diariaMes) };
  // maiores despesas fixas SÓ do ano selecionado
  const linhasAno = DATA.fixas.map(l => ({ desc: l.desc, tot: (l.vals || []).slice(yi0, yi1).reduce((s, v) => s + (Number(v) || 0), 0) }))
    .filter(x => x.tot > 0).sort((a, b) => b.tot - a.tot).slice(0, 8);

  view.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="label">Receitas (${ano})</div><div class="value pos">${brl(totRec)}</div></div>
      <div class="kpi"><div class="label">Despesas (${ano})</div><div class="value neg">${brl(totDesp)}</div></div>
      <div class="kpi big"><div class="label">Sobra em ${ano}</div><div class="value ${sobraAno >= 0 ? "pos" : "neg"}">${brl(sobraAno)}</div></div>
    </div>
    <div class="section-card"><h3>Despesas por categoria (${ano})</h3>
      <div class="cat-line"><span class="dot" style="background:#0b3d2e"></span><span class="cname">Despesas Fixas</span><span class="cval">${brl(cat.fixas)}</span></div>
      <div class="cat-line"><span class="dot" style="background:#1db954"></span><span class="cname">Cartão Mercado Pago</span><span class="cval">${brl(cat.cartao)}</span></div>
      <div class="cat-line"><span class="dot" style="background:#f5a623"></span><span class="cname">Débitos Dia a Dia</span><span class="cval">${brl(cat.diaria)}</span></div>
    </div>
    <div class="section-card"><h3>Sobra por mês (${ano})</h3>
      <div class="chart-wrap"><canvas id="sobraChart" height="190"></canvas></div></div>
    <div class="section-card"><h3>Maiores despesas fixas (${ano})</h3>
      ${linhasAno.map(x => `<div class="cat-line"><span class="cname">${esc(x.desc)}</span><span class="cval">${brl(x.tot)}</span></div>`).join("") || `<div class="empty">Sem dados.</div>`}
    </div>`;
  renderSobraChart();
}

/* ---------- Charts ---------- */
function applyChartTheme() {
  if (typeof Chart === "undefined") return;
  const css = getComputedStyle(document.documentElement);
  Chart.defaults.color = (css.getPropertyValue("--muted") || "#74807b").trim();
  Chart.defaults.borderColor = (css.getPropertyValue("--line") || "#e6e9e8").trim();
  Chart.defaults.font.family = "Manrope, -apple-system, BlinkMacSystemFont, sans-serif";
}
function renderCharts() {
  if (typeof Chart === "undefined") return;
  applyChartTheme();
  ["dough", "bar", "line"].forEach(k => { if (charts[k]) charts[k].destroy(); });
  const m = curMonth;
  const dough = $("#doughChart");
  if (dough) {
    const comp = [fixasMes(m), cartaoMes(m), diariaMes(m)];
    const tc = comp.reduce((a, b) => a + b, 0);
    charts.dough = new Chart(dough, { type: "doughnut",
      data: { labels: ["Despesas Fixas", "Cartão Mercado Pago", "Débitos Dia a Dia"],
        datasets: [{ data: tc ? comp : [1, 0, 0], backgroundColor: ["#0b3d2e", "#15c266", "#f5a623"],
          borderWidth: 0, borderRadius: tc ? 14 : 0, spacing: tc ? 3 : 0, hoverOffset: 7 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "72%", layout: { padding: 6 },
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11 }, padding: 14 } },
          tooltip: { callbacks: { label: c => `${c.label}: ${brl(c.raw)} (${tc ? (c.raw / tc * 100).toFixed(1) : 0}%)` } } } } });
  }
  const base = curYear() * 12;                       // gráficos do ANO selecionado (12 meses)
  const labelsH = Array.from({ length: 12 }, (_, i) => MESES_CURTO[i]);
  const bc = $("#barChart");
  if (bc) charts.bar = new Chart(bc, { type: "bar",
    data: { labels: labelsH, datasets: [
      { label: "Receitas", data: labelsH.map((_, i) => receitaMes(base + i)), backgroundColor: "#1db954", borderRadius: 4 },
      { label: "Despesas", data: labelsH.map((_, i) => despesaMes(base + i)), backgroundColor: "#e5484d", borderRadius: 4 }] },
    options: chartOpts(true) });
  const lc = $("#lineChart");
  if (lc) {
    const bal = labelsH.map((_, i) => sobraMes(base + i));
    const nowAbs = (DATA.year === REAL_TODAY.getFullYear()) ? REAL_TODAY.getMonth() : -1;
    const nowM = nowAbs - base;                        // posição do "agora" dentro do ano exibido (fora = -1 ou 12)
    const ctx = lc.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 200);
    grad.addColorStop(0, "rgba(21,194,102,.30)");
    grad.addColorStop(1, "rgba(21,194,102,.02)");
    charts.line = new Chart(lc, { type: "line",
      data: { labels: labelsH, datasets: [{
        label: "Saldo projetado", data: bal,
        borderColor: "#15c266", borderWidth: 2.6, backgroundColor: grad, fill: true, tension: .38,
        pointRadius: bal.map((_, i) => i === nowM ? 5 : 3),
        pointBackgroundColor: bal.map((_, i) => i > nowM ? "rgba(21,194,102,.15)" : "#15c266"),
        pointBorderColor: "#15c266", pointBorderWidth: 2,
        segment: {
          borderDash: c => c.p0DataIndex >= nowM ? [6, 5] : undefined,
          borderColor: c => c.p0DataIndex >= nowM ? "#7fc6a3" : "#15c266"
        }
      }] },
      options: { ...chartOpts(false),
        plugins: { legend: { display: false }, valueLabels: { on: true },
          tooltip: { callbacks: {
            title: items => mLong(base + items[0].dataIndex) + (items[0].dataIndex > nowM ? " (projeção)" : ""),
            label: c => `Saldo: ${brl(c.raw)}`,
            afterLabel: c => { const i = base + c.dataIndex; const arr = [`No mês: ${brl(receitaMes(i) - despesaMes(i))}`]; if (c.dataIndex > nowM) arr.push("⏳ provisão"); return arr; }
          } } } } });
  }
  if (simBuy > 0) updateSimOverlay();
  startResumoAnim();
}
/* Animação contínua suave (gira o donut devagar) — pausa fora do Resumo / app oculto / reduced-motion. */
let _animRAF = null, _animLast = 0, _doughRot = 0;
function startResumoAnim() {
  stopResumoAnim();
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const loop = (ts) => {
    _animRAF = requestAnimationFrame(loop);
    if (document.hidden || curTab !== "resumo" || annual || !charts.dough) return;
    if (ts - _animLast < 70) return;                 // ~14 fps, leve
    _animLast = ts;
    _doughRot = (_doughRot + 0.45) % 360;
    try { charts.dough.options.rotation = _doughRot; charts.dough.update("none"); } catch (e) {}
  };
  _animRAF = requestAnimationFrame(loop);
}
function stopResumoAnim() { if (_animRAF) { cancelAnimationFrame(_animRAF); _animRAF = null; } }
function renderSobraChart() {
  if (typeof Chart === "undefined") return;
  applyChartTheme();
  if (charts.sobra) charts.sobra.destroy();
  const yi0 = curYear() * 12, yi1 = yi0 + 12;
  const labelsH = [], data = [];
  for (let i = yi0; i < yi1; i++) { labelsH.push(MESES_CURTO[i % 12]); data.push(receitaMes(i) - despesaMes(i)); }
  charts.sobra = new Chart($("#sobraChart"), { type: "bar",
    data: { labels: labelsH, datasets: [{ data, backgroundColor: data.map(v => v >= 0 ? "#1d6fe5" : "#e5484d"), borderRadius: 4 }] },
    options: { ...chartOpts(false), plugins: { legend: { display: false }, valueLabels: { on: true }, tooltip: { callbacks: { label: c => brl(c.raw) } } } } });
}
function chartOpts(legend) {
  return { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 20, bottom: 4 } },
    plugins: { legend: { display: legend, position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: c => `${c.dataset.label || ""}: ${brl(c.raw)}` } },
      valueLabels: { on: true } },
    scales: { y: { display: false, grace: "16%" }, x: { grid: { display: false }, ticks: { font: { size: 10 }, autoSkip: true, maxRotation: 0 } } } };
}

/* ===================== GRÁFICOS (aba interativa do Resumo) ===================== */
function viewToggleHTML() {
  return `<div class="view-toggle">
    <button type="button" class="vt-btn ${resumoView === "resumo" ? "active" : ""}" data-rv="resumo">📋 Resumo</button>
    <button type="button" class="vt-btn ${resumoView === "graficos" ? "active" : ""}" data-rv="graficos">📊 Gráficos</button>
  </div>`;
}
function bindViewToggle() {
  $$(".vt-btn").forEach(b => b.onclick = () => { if (resumoView === b.dataset.rv) return; resumoView = b.dataset.rv; suppressNextAnim = true; window.scrollTo(0, 0); render(); });
}

// regressão linear (mínimos quadrados) + R² → linha de tendência estatística
function linReg(ys) {
  const n = ys.length; if (n < 2) return { slope: 0, intercept: ys[0] || 0, r2: 0, at: () => ys[0] || 0 };
  let sx = 0, sy = 0, sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sx += i; sy += ys[i]; sxy += i * ys[i]; sxx += i * i; syy += ys[i] * ys[i]; }
  const d = n * sxx - sx * sx, slope = d ? (n * sxy - sx * sy) / d : 0, intercept = (sy - slope * sx) / n;
  const den = Math.sqrt((n * sxx - sx * sx) * (n * syy - sy * sy)), r = den ? (n * sxy - sx * sy) / den : 0;
  return { slope, intercept, r2: r * r, at: (x) => intercept + slope * x };
}
const trendForca = (r2) => r2 >= 0.6 ? "forte" : r2 >= 0.3 ? "moderada" : "fraca";
const serieRec = () => { const b = curYear() * 12; return Array.from({ length: 12 }, (_, i) => receitaMes(b + i)); };
const serieDesp = () => { const b = curYear() * 12; return Array.from({ length: 12 }, (_, i) => despesaMes(b + i)); };
const serieSaldo = () => { const b = curYear() * 12; return Array.from({ length: 12 }, (_, i) => sobraMes(b + i)); };

function renderGraficos(host) {
  stopResumoAnim();
  gSelMonth = ((curMonth % 12) + 12) % 12;
  const ano = DATA.year + curYear();
  host.innerHTML = `
    <div class="section-card g-card fade-in">
      <h3>💰 Saldo acumulado por mês — ${ano}</h3>
      <p class="hint" style="text-align:left;margin:-2px 0 8px">Simule uma compra aqui que a linha aparece <b>em cima do gráfico</b> — fica preciso se dá pra comprar.</p>
      <div class="g-sim">
        <div class="field-row">
          <label class="field" style="margin:0;flex:2"><span>🧪 Quero gastar (R$)</span><input id="gSimInput" type="number" step="0.01" inputmode="decimal" placeholder="0,00" /></label>
          <label class="field" style="margin:0;flex:1"><span>Parcelas</span><input id="gSimN" type="number" min="1" max="48" value="1" /></label>
          <button type="button" id="gSimClear" class="sim-clear" style="align-self:flex-end;margin-bottom:14px">↺</button>
        </div>
        <div id="gSimVerdict" class="sim-verdict hint">Digite um valor pra simular em cima do gráfico.</div>
      </div>
      <div class="chart-wrap"><canvas id="gSaldo" height="210"></canvas></div>
      <div class="g-detail" id="detSaldo"></div>
      <div class="g-insights" id="insSaldo"></div>
    </div>
    <div class="section-card g-card fade-in">
      <h3>📉 Despesas por mês — ${ano}</h3>
      <p class="hint" style="text-align:left;margin:-2px 0 8px">Toque numa barra pra ver as despesas daquele mês.</p>
      <div class="chart-wrap"><canvas id="gDesp" height="210"></canvas></div>
      <div class="g-detail" id="detDesp"></div>
      <div class="g-insights" id="insDesp"></div>
    </div>
    <div class="section-card g-card fade-in">
      <h3>📈 Receitas por mês — ${ano}</h3>
      <p class="hint" style="text-align:left;margin:-2px 0 8px">Toque numa barra pra ver as receitas daquele mês.</p>
      <div class="chart-wrap"><canvas id="gRec" height="210"></canvas></div>
      <div class="g-detail" id="detRec"></div>
      <div class="g-insights" id="insRec"></div>
    </div>`;
  renderGCharts();
  bindGSim();
  const il = $("#insSaldo"); if (il) il.innerHTML = insightsSaldo();
  const id2 = $("#insDesp"); if (id2) id2.innerHTML = insightsDespesas();
  const ir = $("#insRec"); if (ir) ir.innerHTML = insightsReceitas();
  drillSaldo(gSelMonth); drillDesp(gSelMonth); drillRec(gSelMonth);
}

function renderGCharts() {
  if (typeof Chart === "undefined") return;
  applyChartTheme();
  ["gSaldo", "gDesp", "gRec", "dough", "bar", "line", "sim", "sobra"].forEach(k => { if (charts[k]) { try { charts[k].destroy(); } catch (e) {} charts[k] = null; } });
  const labels = Array.from({ length: 12 }, (_, i) => MESES_CURTO[i]);
  charts.gDesp = makeBarTrend("gDesp", labels, serieDesp(), "#e5484d", drillDesp);
  charts.gRec = makeBarTrend("gRec", labels, serieRec(), "#1db954", drillRec);
  charts.gSaldo = makeSaldoChart(labels);
}
function barColors(color, n) { return Array.from({ length: n }, (_, i) => i === gSelMonth ? color : color + "85"); }
function makeBarTrend(id, labels, data, color, onIdx) {
  const reg = linReg(data), trend = data.map((_, i) => reg.at(i));
  return new Chart($("#" + id), {
    type: "bar",
    data: { labels, datasets: [
      { label: "valor", data, backgroundColor: barColors(color, 12), borderRadius: 5, order: 2 },
      { _trend: true, type: "line", label: "tendência", data: trend, borderColor: "#cfd8d3", borderWidth: 2, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0, order: 1 }
    ] },
    options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 18, bottom: 4 } },
      onClick: (e, els) => { if (els && els.length) onIdx(els[0].index); },
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => (c.dataset.label === "tendência" ? "tendência: " : "") + brl(c.raw) } }, valueLabels: { on: true } },
      scales: { y: { display: false, grace: "18%" }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } }
  });
}
function makeSaldoChart(labels) {
  const b = curYear() * 12, bal = serieSaldo(), reg = linReg(bal), trend = bal.map((_, i) => reg.at(i));
  const ds = [
    { label: "saldo", data: bal, borderColor: "#15c266", borderWidth: 2.6, backgroundColor: "transparent", fill: false, tension: .35,
      pointRadius: bal.map((_, i) => i === gSelMonth ? 6 : 3), pointBackgroundColor: "#15c266", order: 2 },
    { _trend: true, label: "tendência", data: trend, borderColor: "#cfd8d3", borderWidth: 2, borderDash: [5, 4], pointRadius: 0, fill: false, tension: 0, order: 1 }
  ];
  if (simBuy > 0) {
    const arr = simBalArray();
    ds.push({ _sim: true, label: simN > 1 ? `com a compra (${simN}×)` : "com a compra",
      data: Array.from({ length: 12 }, (_, i) => { const a = b + i; return arr[a] != null ? arr[a] : sobraMes(a); }),
      borderColor: "#f5a623", borderWidth: 2.4, borderDash: [6, 4], pointRadius: 0, fill: false, tension: .35, order: 0 });
  }
  return new Chart($("#gSaldo"), { type: "line", data: { labels, datasets: ds },
    options: { responsive: true, maintainAspectRatio: false, layout: { padding: { top: 18, bottom: 4 } },
      onClick: (e, els) => { if (els && els.length) drillSaldo(els[0].index); },
      plugins: { legend: { display: true, position: "bottom", labels: { boxWidth: 12, font: { size: 10 }, filter: i => i.text !== "tendência" || true } },
        tooltip: { callbacks: { label: c => `${c.dataset.label}: ${brl(c.raw)}` } }, valueLabels: { on: true } },
      scales: { y: { display: false, grace: "16%" }, x: { grid: { display: false }, ticks: { font: { size: 10 } } } } } });
}
function bindGSim() {
  const inp = $("#gSimInput"), inpN = $("#gSimN"); if (!inp) return;
  inp.value = simBuy ? simBuy : ""; if (inpN) inpN.value = simN || 1;
  const upd = () => { simBuy = parseFloat(inp.value) || 0; simN = Math.max(1, parseInt(inpN && inpN.value) || 1); updateGSim(); };
  inp.oninput = upd; if (inpN) inpN.oninput = upd;
  const clr = $("#gSimClear"); if (clr) clr.onclick = () => { simBuy = 0; simN = 1; inp.value = ""; if (inpN) inpN.value = "1"; updateGSim(); inp.focus(); };
  updateGSim();
}
function updateGSim() {
  renderVerdictInto($("#gSimVerdict"));
  if (charts.gSaldo) { try { charts.gSaldo.destroy(); } catch (e) {} charts.gSaldo = null; }
  charts.gSaldo = makeSaldoChart(Array.from({ length: 12 }, (_, i) => MESES_CURTO[i]));
}

// drill-down: clicar no mês mostra os lançamentos daquele mês, ordenados, com animação
function detHTML(title, items, tot, color, sub) {
  if (!items.length) return `<div class="det-head">${esc(title)}</div><div class="g-empty">Nada lançado neste mês.</div>`;
  const max = Math.max.apply(null, items.map(i => i.val).concat([1]));
  return `<div class="det-head">${esc(title)} <b>${brl(tot)}</b></div>` + items.map((it, i) => `
    <div class="det-row" style="animation-delay:${(i * 0.045).toFixed(2)}s">
      <span class="det-rank">${i + 1}</span>
      <div class="det-main"><div class="det-name">${esc(it.desc || "—")}${it.nec ? ` <span class="det-nec">✓</span>` : ""}</div>
        <div class="det-bar"><div class="det-fill" style="width:${Math.round(it.val / max * 100)}%;background:${color}"></div></div></div>
      <div class="det-val">${brl(it.val)}<span class="det-cat">${esc(it.cat)}</span></div>
    </div>`).join("") + (sub || "");
}
function animDetail(id) { const el = $(id); if (!el) return; el.classList.remove("drill-in"); void el.offsetWidth; el.classList.add("drill-in"); }
function highlightBar(id, color) { const c = charts[id]; if (!c) return; c.data.datasets[0].backgroundColor = barColors(color, 12); try { c.update("none"); } catch (e) {} }
function drillDesp(i) {
  gSelMonth = i; const m = curYear() * 12 + i, el = $("#detDesp"); if (!el) return;
  const items = [];
  (DATA.fixas || []).forEach(l => { const v = Number(l.vals[m]) || 0; if (v > 0) items.push({ desc: l.desc, val: v, cat: "Fixa", nec: l.nec }); });
  (DATA.cartao || []).forEach(l => { const v = Number(l.vals[m]) || 0; if (v > 0) items.push({ desc: l.desc, val: v, cat: "Cartão", nec: l.nec }); });
  (DATA.diaria || []).filter(d => d.mes === m).forEach(d => items.push({ desc: d.desc, val: Number(d.valor) || 0, cat: d.categoria || "Débito" }));
  items.sort((a, b) => b.val - a.val);
  el.innerHTML = detHTML(`Despesas de ${mLong(m)}`, items, items.reduce((s, x) => s + x.val, 0), "#e5484d");
  highlightBar("gDesp", "#e5484d"); animDetail("#detDesp");
}
function drillRec(i) {
  gSelMonth = i; const m = curYear() * 12 + i, el = $("#detRec"); if (!el) return;
  const items = (DATA.receitas || []).map(l => ({ desc: l.desc, val: Number(l.vals[m]) || 0, cat: l.tipo || "Ativa" })).filter(x => x.val > 0).sort((a, b) => b.val - a.val);
  el.innerHTML = detHTML(`Receitas de ${mLong(m)}`, items, items.reduce((s, x) => s + x.val, 0), "#1db954");
  highlightBar("gRec", "#1db954"); animDetail("#detRec");
}
function drillSaldo(i) {
  gSelMonth = i; const m = curYear() * 12 + i, el = $("#detSaldo"); if (!el) return;
  const r = receitaMes(m), d = despesaMes(m), liq = r - d, acc = sobraMes(m);
  el.innerHTML = `<div class="det-head">${mLong(m)}</div>
    <div class="det-kpis">
      <div class="dk"><span>Receitas</span><b class="pos">${brl(r)}</b></div>
      <div class="dk"><span>Despesas</span><b class="neg">${brl(d)}</b></div>
      <div class="dk"><span>Sobrou no mês</span><b class="${liq >= 0 ? "pos" : "neg"}">${brl(liq)}</b></div>
      <div class="dk big"><span>Saldo acumulado</span><b class="${acc >= 0 ? "pos" : "neg"}">${brl(acc)}</b></div>
    </div>`;
  if (charts.gSaldo) { try { charts.gSaldo.data.datasets[0].pointRadius = serieSaldo().map((_, k) => k === i ? 6 : 3); charts.gSaldo.update("none"); } catch (e) {} }
  animDetail("#detSaldo");
}

// insights automáticos (estatística) — "tipo IA"
function insTable(title, rows, narr) {
  return `<div class="ins-card">
    <div class="ins-title">🤖 ${title}</div>
    <table class="ins-tbl"><tbody>${rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join("")}</tbody></table>
    <div class="ins-narr">${narr}</div></div>`;
}
function insightsDespesas() {
  const d = serieDesp(), reg = linReg(d), media = d.reduce((a, x) => a + x, 0) / 12;
  const maxI = d.indexOf(Math.max.apply(null, d)), minI = d.indexOf(Math.min.apply(null, d));
  const std = Math.sqrt(d.reduce((a, x) => a + (x - media) ** 2, 0) / 12);
  const forte = reg.r2 >= 0.2 && Math.abs(reg.slope) >= 1, dir = !forte ? "estável" : reg.slope > 0 ? "alta" : "queda", forca = trendForca(reg.r2);
  const proj = Math.max(0, reg.at(12));
  const rows = [
    ["Média por mês", brl(media)],
    ["Tendência", `${dir}${forte ? " (~" + brl(Math.abs(reg.slope)) + "/mês)" : ""}`],
    ["Confiança", `${(reg.r2 * 100).toFixed(0)}% (${forca})`],
    ["Mês de pico", `${MESES_CURTO[maxI]} · ${brl(d[maxI])}`],
    ["Mês mais leve", `${MESES_CURTO[minI]} · ${brl(d[minI])}`],
    ["Projeção próx. mês", brl(proj)],
  ];
  const narr = `Suas despesas estão em <b>${dir}</b> (tendência ${forca}). ` +
    (dir === "alta" ? `Atenção: o ritmo de gastos cresce ~${brl(Math.abs(reg.slope))}/mês — segure pra não comprometer o saldo.`
      : dir === "queda" ? `Bom: você vem cortando ~${brl(Math.abs(reg.slope))}/mês. Continue assim. 👏`
      : `Gastos controlados, sem grande variação (desvio ${brl(std)}).`) +
    ` Projeção pro próximo mês: ~<b>${brl(proj)}</b>.`;
  return insTable("Análise de despesas", rows, narr);
}
function insightsReceitas() {
  const r = serieRec(), reg = linReg(r), media = r.reduce((a, x) => a + x, 0) / 12;
  const maxI = r.indexOf(Math.max.apply(null, r)), minI = r.indexOf(Math.min.apply(null, r));
  const forte = reg.r2 >= 0.2 && Math.abs(reg.slope) >= 1, dir = !forte ? "estável" : reg.slope > 0 ? "alta" : "queda", forca = trendForca(reg.r2);
  const proj = Math.max(0, reg.at(12)), zero = r.filter(v => v <= 0).length;
  const rows = [
    ["Média por mês", brl(media)],
    ["Tendência", `${dir}${forte ? " (~" + brl(Math.abs(reg.slope)) + "/mês)" : ""}`],
    ["Confiança", `${(reg.r2 * 100).toFixed(0)}% (${forca})`],
    ["Melhor mês", `${MESES_CURTO[maxI]} · ${brl(r[maxI])}`],
    ["Meses sem receita", `${zero}`],
    ["Projeção próx. mês", brl(proj)],
  ];
  const narr = `Suas receitas estão em <b>${dir}</b> (tendência ${forca}). ` +
    (dir === "alta" ? `Ótimo: a renda vem crescendo ~${brl(Math.abs(reg.slope))}/mês. 🚀`
      : dir === "queda" ? `Atenção: a renda vem caindo ~${brl(Math.abs(reg.slope))}/mês — vale buscar fontes extras.`
      : `Renda estável em torno de ${brl(media)}/mês.`) +
    ` Projeção pro próximo mês: ~<b>${brl(proj)}</b>.`;
  return insTable("Análise de receitas", rows, narr);
}
function insightsSaldo() {
  const b = curYear() * 12;
  const liq = Array.from({ length: 12 }, (_, i) => receitaMes(b + i) - despesaMes(b + i));
  const bal = serieSaldo(), reg = linReg(liq), media = liq.reduce((a, x) => a + x, 0) / 12;
  const poup = liq.reduce((a, x) => a + x, 0), totRec = serieRec().reduce((a, x) => a + x, 0);
  const taxa = totRec > 0 ? Math.round(poup / totRec * 100) : 0;
  const minI = bal.indexOf(Math.min.apply(null, bal)), neg = bal.filter(v => v < 0).length, fim = bal[11];
  const nota = taxa >= 20 ? "💪 Excelente" : taxa >= 10 ? "🙂 Boa" : taxa >= 0 ? "⚠️ Apertada" : "🆘 Crítica";
  const rows = [
    ["Saúde", nota],
    ["Sobra média/mês", brl(media)],
    ["Guardado no ano", `${brl(poup)} (${taxa}%)`],
    ["Saldo no fim do ano", brl(fim)],
    ["Pior mês (saldo)", `${MESES_CURTO[minI]} · ${brl(bal[minI])}`],
    ["Meses no vermelho", `${neg}`],
  ];
  const narr = `<b>${nota}</b> — você guarda em média <b>${brl(media)}/mês</b> (${taxa}% da renda). ` +
    (neg > 0 ? `⚠️ <b>${neg}</b> mês(es) ficam no vermelho — o pior é ${MESES_CURTO[minI]} (${brl(bal[minI])}).`
      : `Nenhum mês fica no vermelho. 👏`) +
    ` No ritmo atual, fecha o ano com ~<b>${brl(fim)}</b>.` +
    (reg.slope < -5 ? ` A tendência é de <b>piora</b> — segure os gastos.` : reg.slope > 5 ? ` A tendência é de <b>melhora</b> — continue!` : ``);
  return insTable("Como você está indo", rows, narr);
}

/* ---------- LISTAS ---------- */
function renderLista(view) {
  if (curTab === "diaria") return renderDiaria(view);
  if (curTab === "receitas") return renderReceitas(view);
  const lines = DATA[curTab];
  const total = sumMonth(lines, curMonth);
  const rows = lines.map((l, idx) => ({ l, idx }))
    .filter(x => x.l.vals[curMonth] > 0 || (x.l.sts[curMonth] || "vazio") !== "vazio")
    .sort((a, b) => b.l.vals[curMonth] - a.l.vals[curMonth]);
  view.innerHTML = `
    ${curTab === "cartao" ? renderCardsSection() : ""}
    <div class="list-header"><span class="lbl">${rows.length} lançamento(s) em ${mLong(curMonth)}</span><span class="total">${brl(total)}</span></div>
    <div class="list">${rows.length ? rows.map(({ l, idx }) => lineRow(l, idx)).join("") : empty()}</div>`;
  bindRows(view);
  if (curTab === "cartao") bindCardsSection(view);
}

function renderReceitas(view) {
  const m = curMonth;
  const groups = [["Ativa", "Renda recorrente"], ["Extra", "Renda extra"]];
  let html = `<div class="list-header"><span class="lbl">Recebido ${brl(recebido(m))} · a receber ${brl(aReceber(m))}</span><span class="total">${brl(receitaMes(m))}</span></div>`;
  groups.forEach(([tipo, titulo]) => {
    const rows = DATA.receitas.map((l, idx) => ({ l, idx }))
      .filter(x => x.l.tipo === tipo && (x.l.vals[m] > 0 || (x.l.sts[m] || "vazio") !== "vazio"))
      .sort((a, b) => b.l.vals[m] - a.l.vals[m]);
    if (!rows.length) return;
    const sub = DATA.receitas.filter(l => l.tipo === tipo).reduce((s, l) => s + (Number(l.vals[m]) || 0), 0);
    html += `<div class="group-head">${titulo} <span>${brl(sub)}</span></div><div class="list">${rows.map(({ l, idx }) => lineRow(l, idx)).join("")}</div>`;
  });
  view.innerHTML = html;
  bindRows(view);
}

function lineRow(l, idx) {
  const m = curMonth, val = l.vals[m], st = l.sts[m] || "vazio";
  const bits = [];
  if (l.dia) bits.push("dia " + l.dia);
  if (curTab === "cartao" && l.parcAtual && l.parcTotal) bits.push(`parcela ${l.parcAtual}/${l.parcTotal}`);
  if (curTab === "cartao" && l.cartao) bits.push("•" + l.cartao);
  const sub = bits.join(" · ");
  return `<div class="list-row" data-idx="${idx}">
    <div class="desc"><div class="name">${esc(l.desc || "—")}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>
    <span class="badge ${st}" data-toggle="${idx}">${st}</span>
    <div class="amt-wrap"><span class="amount">${brl(val)}</span>${l.nec ? `<span class="nec-flag" title="Necessário — não posso deixar de pagar">✓</span>` : ""}</div></div>`;
}

function renderDiaria(view) {
  const m = curMonth;
  const rows = DATA.diaria.map((d, idx) => ({ d, idx })).filter(x => x.d.mes === m);
  const total = rows.reduce((s, x) => s + (Number(x.d.valor) || 0), 0);
  // agrupa por categoria
  const cats = {};
  rows.forEach(({ d, idx }) => { (cats[d.categoria || "Geral"] = cats[d.categoria || "Geral"] || []).push({ d, idx }); });
  let html = `<div class="list-header"><span class="lbl">${rows.length} compra(s) em ${mLong(m)}</span><span class="total">${brl(total)}</span></div>`;
  if (!rows.length) html += `<div class="list">${empty("Nenhuma compra no débito.")}</div>`;
  Object.keys(cats).sort().forEach(cat => {
    const sub = cats[cat].reduce((s, x) => s + (Number(x.d.valor) || 0), 0);
    html += `<div class="group-head">${esc(cat)} <span>${brl(sub)}</span></div><div class="list">${cats[cat].map(({ d, idx }) =>
      `<div class="list-row" data-didx="${idx}"><div class="desc"><div class="name">${esc(d.desc || "—")}</div>${d.dia ? `<div class="sub">dia ${d.dia}</div>` : ""}</div><span class="amount">${brl(d.valor)}</span></div>`).join("")}</div>`;
  });
  view.innerHTML = html;
  $$("[data-didx]", view).forEach(r => r.onclick = () => openDiariaModal(+r.dataset.didx));
}

function bindRows(view) {
  $$(".list-row", view).forEach(r => {
    if (!r.dataset.idx) return;
    r.onclick = (e) => {
      if (e.target.dataset.toggle !== undefined) { toggleStatus(curTab, +e.target.dataset.toggle); e.stopPropagation(); return; }
      openEntryModal(curTab, +r.dataset.idx);
    };
  });
}
function toggleStatus(tab, idx) {
  const l = DATA[tab][idx], m = curMonth;
  const done = tab === "receitas" ? "recebido" : "pago";
  if (l.vals[m] <= 0) return;
  l.sts[m] = l.sts[m] === done ? "programado" : done;
  persist(); toast(l.sts[m] === done ? "✅ " + done : "⏳ programado");
}

const empty = (msg) => `<div class="empty">${msg || "Nada lançado neste mês."}<br>Toque em + para adicionar.</div>`;

/* ---------- Cartões cadastrados (fechamento/vencimento) ---------- */
function renderCardsSection() {
  const cs = DATA.cartoes || [];
  const itens = cs.map((c, i) => `<div class="card-line" data-cidx="${i}">
      <div class="card-ic">💳</div>
      <div class="desc"><div class="name">${esc(c.nome || "Cartão")}</div>
        <div class="sub">fecha dia <b>${c.fechamento || "—"}</b> · vence dia <b>${c.vencimento || "—"}</b></div></div>
      <span class="card-edit">editar ›</span></div>`).join("");
  return `<div class="section-card fade-in"><h3>💳 Meus cartões</h3>
    ${cs.length ? `<div class="card-list">${itens}</div>`
      : `<div class="empty" style="padding:20px 18px">Nenhum cartão cadastrado.<br>Cadastre com o dia do <b>fechamento</b> e do <b>vencimento</b> para lançar compras sem erro.</div>`}
    <div class="card-add"><button class="btn ghost" id="btnAddCard">＋ Cadastrar cartão</button></div></div>`;
}
function bindCardsSection(view) {
  const add = $("#btnAddCard", view); if (add) add.onclick = () => openCardModal(null);
  $$("[data-cidx]", view).forEach(r => r.onclick = () => openCardModal(+r.dataset.cidx));
}
function openCardModal(idx) {
  const isNew = idx == null, c = isNew ? null : DATA.cartoes[idx];
  $("#modalTitle").textContent = isNew ? "Cadastrar cartão" : "Editar cartão";
  $("#entryForm").innerHTML = `
    <label class="field"><span>Nome do cartão</span><input id="c_nome" type="text" value="${isNew ? "" : esc(c.nome || "")}" placeholder="Ex.: Mercado Pago" required /></label>
    <div class="field-row">
      <label class="field"><span>Fecha a fatura (dia)</span><input id="c_fech" type="number" min="1" max="31" inputmode="numeric" value="${isNew || !c.fechamento ? "" : c.fechamento}" placeholder="ex.: 29" /></label>
      <label class="field"><span>Vence / paga (dia)</span><input id="c_venc" type="number" min="1" max="31" inputmode="numeric" value="${isNew || !c.vencimento ? "" : c.vencimento}" placeholder="ex.: 7" /></label>
    </div>
    <p class="hint" style="text-align:left">Compras feitas <b>até o dia do fechamento</b> entram na fatura do mês; depois disso, vão para o mês seguinte.</p>`;
  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { DATA.cartoes.splice(idx, 1); persist(); closeModal(); toast("Cartão removido"); };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const o = { nome: $("#c_nome").value.trim() || "Cartão", fechamento: parseInt($("#c_fech").value) || null, vencimento: parseInt($("#c_venc").value) || null };
    if (isNew) DATA.cartoes.push({ id: uid(), ...o }); else Object.assign(c, o);
    persist(); closeModal(); toast(isNew ? "Cartão cadastrado ✓" : "Cartão salvo ✓");
  };
  showModal("#modal");
}

/* ---------- Compra no cartão: parcelas caem no mês certo pela data de fechamento ---------- */
function parcelaStartMonth(purchaseMonth, purchaseDay, fechamento) {
  if (!fechamento || !purchaseDay) return purchaseMonth;
  return purchaseDay <= fechamento ? purchaseMonth : purchaseMonth + 1;
}
function openCartaoModal() {
  const cs = DATA.cartoes || [];
  $("#modalTitle").textContent = "Nova compra no cartão";
  const cardOpts = cs.map(c => `<option value="${c.id}">${esc(c.nome)} (fecha ${c.fechamento || "?"})</option>`).join("");
  $("#entryForm").innerHTML = `
    ${cs.length ? "" : `<p class="hint" style="text-align:left;margin-bottom:10px">💡 Cadastre seu cartão (com o dia do fechamento) em <b>Meus cartões</b> para as parcelas caírem no mês certo.</p>`}
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" required placeholder="Ex.: Tênis" /></label>
    <label class="field"><span>Cartão</span><select id="f_card">${cardOpts}<option value="">Outro (sem cadastro)</option></select></label>
    <div class="field-row">
      <label class="field"><span>Valor de cada parcela</span><input id="f_val" type="number" step="0.01" inputmode="decimal" placeholder="0,00" required /></label>
      <label class="field"><span>Nº de parcelas</span><input id="f_n" type="number" min="1" max="48" inputmode="numeric" value="1" /></label>
    </div>
    <label class="field"><span>Dia da compra (em ${mLong(curMonth)})</span><input id="f_dia" type="number" min="1" max="31" inputmode="numeric" placeholder="ex.: 25" /></label>
    <label class="field row-check nec-check"><input id="f_nec" type="checkbox" /><span>🔒 Necessário — não posso deixar de pagar</span></label>
    <div id="f_parc_prev" class="impact"></div>`;
  ["f_val", "f_n", "f_dia", "f_card"].forEach(id => { const el = $("#" + id); if (el) { el.oninput = updateParcelaPreview; el.onchange = updateParcelaPreview; } });
  updateParcelaPreview();
  $("#btnDelete").classList.add("hidden");
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const valor = parseFloat($("#f_val").value) || 0;
    const n = Math.max(1, parseInt($("#f_n").value) || 1);
    const dia = parseInt($("#f_dia").value) || null;
    const card = cs.find(c => c.id === $("#f_card").value) || null;
    const start = parcelaStartMonth(curMonth, dia, card ? card.fechamento : null);
    const paidUntil = (DATA.year === REAL_TODAY.getFullYear()) ? REAL_TODAY.getMonth() : 11;
    const nec = $("#f_nec") ? $("#f_nec").checked : false;
    const last = Math.max(start + n - 1, 11);
    const line = { id: uid(), desc: $("#f_desc").value.trim(), cartao: card ? card.nome : "", parcAtual: 1, parcTotal: n > 1 ? n : null, dia: card ? card.vencimento : dia, nec, vals: Array(12).fill(0), sts: Array(12).fill("vazio") };
    ensureLen(line, last + 1);                                 // estende os meses se a última parcela passa de Dez/26
    for (let k = 0; k < n; k++) { const mo = start + k; if (mo < 0) continue; line.vals[mo] = valor; line.sts[mo] = mo <= paidUntil ? "pago" : "programado"; }
    DATA.cartao.push(line);
    persist(); closeModal();
    const fim = start + n - 1;
    toast(n > 1 ? `Compra lançada ✓ ${n}× (até ${mLong(fim)})` : "Compra lançada ✓");
  };
  showModal("#modal");
}
function updateParcelaPreview() {
  const el = $("#f_parc_prev"); if (!el) return;
  const valor = parseFloat($("#f_val") && $("#f_val").value) || 0;
  const n = Math.max(1, parseInt($("#f_n") && $("#f_n").value) || 1);
  const dia = parseInt($("#f_dia") && $("#f_dia").value) || null;
  const cs = DATA.cartoes || [];
  const card = cs.find(c => c.id === ($("#f_card") && $("#f_card").value)) || null;
  const start = parcelaStartMonth(curMonth, dia, card ? card.fechamento : null);
  const fim = start + n - 1;
  el.className = "impact ok";
  let txt = `<div class="impact-row"><span>${n > 1 ? n + "× de " + brl(valor) : "Compra"}</span><b>${brl(valor * n)}</b></div>`;
  if (card && card.fechamento && dia) {
    const mesmoMes = dia <= card.fechamento;
    txt += `<div class="impact-sub">${mesmoMes
      ? `Compra dia ${dia} entra na fatura de <b>${mLong(curMonth)}</b>`
      : `Compra dia ${dia} (após fechar dia ${card.fechamento}) entra em <b>${mLong(start)}</b>`}`
      + (n > 1 ? ` · parcelas de <b>${mLong(start)}</b> a <b>${mLong(fim)}</b>` : "") + `</div>`;
  } else if (n > 1) {
    txt += `<div class="impact-sub">Parcelas de <b>${mLong(start)}</b> a <b>${mLong(fim)}</b>. Selecione um cartão cadastrado para usar a data de fechamento.</div>`;
  }
  el.innerHTML = txt;
}

/* ---------- MODAIS ---------- */
function openEntryModal(tab, idx) {
  const isNew = idx == null, l = isNew ? null : DATA[tab][idx], isReceita = tab === "receitas";
  const stOpts = isReceita ? [["recebido", "Recebido"], ["programado", "Programado"], ["vazio", "—"]]
                           : [["pago", "Pago"], ["programado", "Programado"], ["vazio", "—"]];
  $("#modalTitle").textContent = (isNew ? "Novo " : "Editar ") + ({ receitas: "receita", fixas: "despesa fixa", cartao: "item do cartão" })[tab];
  let extra = "";
  const necCheck = `<label class="field row-check nec-check"><input id="f_nec" type="checkbox" ${(!isNew && l && l.nec) ? "checked" : ""}/><span>🔒 Necessário — não posso deixar de pagar</span></label>`;
  if (isReceita) extra = `<label class="field"><span>Tipo de renda</span><select id="f_tipo"><option value="Ativa">Ativa (recorrente)</option><option value="Extra">Extra (avulsa)</option></select></label>`;
  else if (tab === "fixas") extra = `<div class="field-row">
      <label class="field"><span>Avisar (dias antes)</span><input id="f_aviso" type="number" min="0" max="15" value="${isNew || !l.aviso ? "" : l.aviso}" placeholder="ex.: 3" /></label>
      <label class="field"><span>Meta/mês (opcional)</span><input id="f_meta" type="number" step="0.01" value="${isNew || !l.meta ? "" : l.meta}" placeholder="R$" /></label></div>` + necCheck;
  else if (tab === "cartao") extra = `<div class="field-row">
      <label class="field"><span>Parcela atual</span><input id="f_pa" type="number" min="1" value="${isNew || !l.parcAtual ? "" : l.parcAtual}" placeholder="--" /></label>
      <label class="field"><span>de (total)</span><input id="f_pt" type="number" min="1" value="${isNew || !l.parcTotal ? "" : l.parcTotal}" placeholder="--" /></label>
      <label class="field"><span>Cartão</span><input id="f_cartao" type="text" value="${isNew || !l.cartao ? "" : esc(l.cartao)}" placeholder="final" /></label></div>` + necCheck;

  $("#entryForm").innerHTML = `
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" value="${isNew ? "" : esc(l.desc)}" required placeholder="Ex.: ${isReceita ? "Salário" : "Aluguel"}" /></label>
    ${extra}
    <div class="field-row">
      <label class="field"><span>Valor (${mLong(curMonth)})</span><input id="f_val" type="number" step="0.01" inputmode="decimal" value="${isNew ? "" : (l.vals[curMonth] || "")}" placeholder="0,00" /></label>
      <label class="field"><span>${tab === "fixas" ? "Vencimento (dia)" : "Dia"}</span><input id="f_dia" type="number" min="1" max="31" value="${isNew || !l.dia ? "" : l.dia}" placeholder="--" /></label>
    </div>
    <label class="field"><span>Situação</span><select id="f_st">${stOpts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <label class="field row-check"><input id="f_all" type="checkbox" /><span>Repetir nos próximos meses</span></label>
    <label class="field" id="f_rep_wrap" style="display:none"><span>Por quantos meses? (a partir de ${mLong(curMonth)} — pode passar de 2026)</span>
      <input id="f_rep" type="number" min="1" max="120" inputmode="numeric" value="12" /></label>`;
  if (!isNew) { if (isReceita) $("#f_tipo").value = l.tipo || "Ativa"; $("#f_st").value = l.sts[curMonth] || "vazio"; }
  else $("#f_st").value = isReceita ? "recebido" : "pago";
  $("#f_all").onchange = () => { $("#f_rep_wrap").style.display = $("#f_all").checked ? "block" : "none"; };

  // Aviso inteligente: mostra a sobra do mês DEPOIS deste lançamento (em tempo real).
  const isExpenseE = tab !== "receitas", oldValE = isNew ? 0 : (Number(l.vals[curMonth]) || 0);
  $("#entryForm").insertAdjacentHTML("beforeend", `<div id="f_impact" class="impact"></div>`);
  const fv = $("#f_val"); if (fv) fv.oninput = () => updateImpact(isExpenseE, oldValE);
  updateImpact(isExpenseE, oldValE);

  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir este lançamento (todos os meses)?")) { DATA[tab].splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const val = parseFloat($("#f_val").value) || 0, st = $("#f_st").value, all = $("#f_all").checked;
    let line = isNew ? { id: uid(), desc: "", vals: Array(12).fill(0), sts: Array(12).fill("vazio") } : l;
    ensureLen(line, curMonth + 1);
    line.desc = $("#f_desc").value.trim();
    line.dia = parseInt($("#f_dia").value) || null;
    if (isReceita) line.tipo = $("#f_tipo").value;
    if (tab === "fixas") { line.aviso = parseInt($("#f_aviso").value) || null; line.meta = parseFloat($("#f_meta").value) || null; }
    if (tab === "cartao") { line.parcAtual = parseInt($("#f_pa").value) || null; line.parcTotal = parseInt($("#f_pt").value) || null; line.cartao = $("#f_cartao").value.trim(); }
    if (tab === "fixas" || tab === "cartao") { const ne = $("#f_nec"); line.nec = ne ? ne.checked : (line.nec || false); }
    if (all) {
      const q = Math.max(1, Math.min(120, parseInt($("#f_rep").value) || 12));
      ensureLen(line, curMonth + q);                            // recorrência pode passar de Dez/26 → estende os meses
      for (let k = 0; k < q; k++) { const mo = curMonth + k; line.vals[mo] = val; line.sts[mo] = val > 0 ? st : "vazio"; }
    } else { line.vals[curMonth] = val; line.sts[curMonth] = val > 0 ? st : "vazio"; }
    if (isNew) DATA[tab].push(line);
    persist(); closeModal();
    const sa = disponivelMes(curMonth) - despesaMes(curMonth);
    if (isExpenseE && val > 0 && sa < 0) toast(`⚠️ ${mLong(curMonth)} ficou no vermelho (${brl(sa)}) · Ctrl+Z desfaz`);
    else toast(isNew ? "Adicionado ✓" : "Salvo ✓");
  };
  showModal("#modal");
}

// Atualiza a linha "sobra do mês após este lançamento" (verde = ok, vermelho = vai faltar).
function updateImpact(isExpense, oldVal) {
  const el = $("#f_impact"); if (!el) return;
  const m = curMonth, cur = disponivelMes(m) - despesaMes(m);
  const novo = parseFloat($("#f_val") && $("#f_val").value) || 0;
  const delta = novo - (oldVal || 0);
  const apos = isExpense ? cur - delta : cur + delta;
  const neg = apos < 0;
  el.className = "impact " + (neg ? "bad" : "ok");
  el.innerHTML = `<div class="impact-row"><span>${isExpense ? "Sobra do mês após este gasto" : "Sobra do mês após"}</span><b>${brl(apos)}</b></div>`
    + (neg ? `<div class="impact-warn">⚠️ Isso deixa <b>${mLong(m)}</b> no vermelho. Você pode salvar, mas reveja o gasto.</div>` : "");
}

function openDiariaModal(idx) {
  const isNew = idx == null, d = isNew ? null : DATA.diaria[idx];
  $("#modalTitle").textContent = (isNew ? "Nova " : "Editar ") + "compra no débito";
  $("#entryForm").innerHTML = `
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" value="${isNew ? "" : esc(d.desc)}" required placeholder="Ex.: Mercado" /></label>
    <label class="field"><span>Categoria</span><input id="f_cat" type="text" list="catList" value="${isNew ? "" : esc(d.categoria || "")}" placeholder="Ex.: Alimentação" />
      <datalist id="catList"><option>Alimentação</option><option>Transporte</option><option>Lazer</option><option>Saúde</option><option>Casa</option><option>Outros</option></datalist></label>
    <div class="field-row">
      <label class="field"><span>Valor</span><input id="f_val" type="number" step="0.01" inputmode="decimal" value="${isNew ? "" : d.valor}" placeholder="0,00" required /></label>
      <label class="field"><span>Dia</span><input id="f_dia" type="number" min="1" max="31" value="${isNew || !d.dia ? "" : d.dia}" placeholder="--" /></label>
    </div><p class="hint">Mês: ${mLong(curMonth)}</p>`;
  const oldValD = isNew ? 0 : (Number(d.valor) || 0);
  $("#entryForm").insertAdjacentHTML("beforeend", `<div id="f_impact" class="impact"></div>`);
  const fvd = $("#f_val"); if (fvd) fvd.oninput = () => updateImpact(true, oldValD);
  updateImpact(true, oldValD);
  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir esta compra?")) { DATA.diaria.splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const val = parseFloat($("#f_val").value) || 0;
    const o = { desc: $("#f_desc").value.trim(), valor: val, dia: parseInt($("#f_dia").value) || null, categoria: $("#f_cat").value.trim() || "Geral" };
    if (isNew) DATA.diaria.push({ id: uid(), mes: curMonth, ...o });
    else Object.assign(d, o);
    persist(); closeModal();
    const sa = disponivelMes(curMonth) - despesaMes(curMonth);
    if (val > 0 && sa < 0) toast(`⚠️ ${mLong(curMonth)} ficou no vermelho (${brl(sa)}) · Ctrl+Z desfaz`);
    else toast(isNew ? "Adicionado ✓" : "Salvo ✓");
  };
  showModal("#modal");
}

/* ---------- Infra ---------- */
function showModal(s) { $(s).classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
function persist() {
  DATA.updatedAt = Date.now();
  history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift();
  redoStack = []; // ação nova invalida o "refazer"
  lastSnap = JSON.stringify(DATA);
  saveData(DATA); render(); pushSync();
}
function undo() {
  if (!history.length) { toast("Nada para desfazer"); return; }
  redoStack.push(lastSnap); if (redoStack.length > HISTORY_MAX) redoStack.shift();
  DATA = JSON.parse(history.pop()); DATA.updatedAt = Date.now();
  lastSnap = JSON.stringify(DATA);
  saveData(DATA); render(); pushSync(); toast("Desfeito ↩︎");
}
function redo() {
  if (!redoStack.length) { toast("Nada para refazer"); return; }
  history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift();
  DATA = JSON.parse(redoStack.pop()); DATA.updatedAt = Date.now();
  lastSnap = JSON.stringify(DATA);
  saveData(DATA); render(); pushSync(); toast("Refeito ↪︎");
}
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
let toastT; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 1800); }

/* ---------- Eventos ---------- */
$$(".tab").forEach(t => t.onclick = () => { $$(".tab").forEach(x => x.classList.remove("active")); t.classList.add("active"); curTab = t.dataset.tab; if (curTab !== "resumo") annual = false; suppressNextAnim = true; window.scrollTo(0, 0); render(); });
$("#fab").onclick = () => curTab === "diaria" ? openDiariaModal(null) : curTab === "cartao" ? openCartaoModal() : openEntryModal(curTab, null);
$("#btnUndo").onclick = undo;
{ const br = $("#btnRefresh"); if (br) br.onclick = syncNow; }
{ const rd = $("#btnRedo"); if (rd) rd.onclick = redo; }
document.addEventListener("keydown", (e) => {
  const t = (e.target.tagName || "");
  if (t === "INPUT" || t === "SELECT" || t === "TEXTAREA") return;
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = (e.key || "").toLowerCase();
  if (k === "z" && e.shiftKey) { e.preventDefault(); redo(); }       // Ctrl+Shift+Z = refazer
  else if (k === "z") { e.preventDefault(); undo(); }                 // Ctrl+Z = desfazer
  else if (k === "y") { e.preventDefault(); redo(); }                 // Ctrl+Y = refazer
});
$("#btnCancel").onclick = closeModal;
$("#modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };
$("#btnSettings").onclick = () => { $("#saldoInicial").value = DATA.saldoInicial || 0; renderNotifBtn(); showModal("#settingsModal"); };
$("#btnCloseSettings").onclick = () => { DATA.saldoInicial = parseFloat($("#saldoInicial").value) || 0; persist(); $("#settingsModal").classList.add("hidden"); };
$("#settingsModal").onclick = (e) => { if (e.target.id === "settingsModal") $("#settingsModal").classList.add("hidden"); };
$("#btnExport").onclick = () => { const b = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `financas-${DATA.year}-backup.json`; a.click(); toast("Backup exportado"); };
$("#btnImport").onclick = () => $("#importFile").click();
$("#importFile").onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { DATA = migrate(JSON.parse(r.result)); persist(); toast("Backup importado"); $("#settingsModal").classList.add("hidden"); } catch { toast("Arquivo inválido"); } }; r.readAsText(f); };
$("#btnReset").onclick = () => { if (confirm("Apagar tudo e voltar aos dados de exemplo?")) { DATA = resetData(); persist(); toast("Restaurado"); $("#settingsModal").classList.add("hidden"); } };

// ===== Web Push (servidor: Cloudflare Worker) =====
const VAPID_PUBLIC = "BC1EnbsN2qolEkoNvMqsAuqjqrPUfNlslzCnoRIOgWvCthh0ytYXzbUrP9iSzNgNswcS9H121de7cCANXGhuSz4";
let PUSH_API = "https://financas-push.kaickjhon.workers.dev"; // Worker de push (Cloudflare) — avisa com app fechado
function urlB64ToU8(b64) { const pad = "=".repeat((4 - b64.length % 4) % 4); const s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(s); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); }
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
async function ativarPush() {
  // iPhone: notificação/push exigem o app instalado na tela de início (regra da Apple)
  if (isIOS() && !isStandalone()) {
    toast("📲 No iPhone, instale primeiro: Compartilhar ⬆️ → Adicionar à Tela de Início. Depois abra pelo ÍCONE e ative aqui.");
    return;
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
    toast("Este navegador não suporta push. No iPhone, abra pelo app instalado na tela de início.");
    return;
  }
  let perm = Notification.permission;
  if (perm === "default") perm = await Notification.requestPermission();
  if (perm === "denied") {
    toast("🔕 Notificações bloqueadas. Ative nos Ajustes (Notificações deste app/site) e tente de novo.");
    return;
  }
  if (perm !== "granted") { toast("Sem permissão de notificação."); return; }
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToU8(VAPID_PUBLIC) });
    localStorage.setItem("financas2026.pushsub", JSON.stringify(sub));
    const bills = DATA.fixas.filter(l => l.dia).map(l => ({ desc: l.desc, dia: l.dia, aviso: l.aviso || 0 }));
    if (PUSH_API) {
      await fetch(PUSH_API + "/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub, bills }) });
      toast("✅ Push ativado — você será avisado mesmo com o app fechado.");
    } else {
      // notificação local já funciona; o aviso com app FECHADO precisa do servidor de push
      toast("✅ Notificações ligadas. (Aviso com app fechado precisa ligar o servidor — falo com você sobre isso.)");
      enviarTeste();
    }
  } catch (e) { toast("Falha ao ativar: " + ((e && e.message) || e)); }
  render();
}

function renderNotifBtn() {
  const wrap = $("#notifWrap"); if (!wrap) return;
  const perm = ("Notification" in window) ? Notification.permission : "unsupported";
  const pushOn = !!localStorage.getItem("financas2026.pushsub");
  wrap.innerHTML =
    `<button class="btn ghost" id="btnTheme">🌗 Tema: ${themeLabel()}</button>`
    + `<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">`
    + (perm === "granted"
      ? `<div class="hint">🔔 Notificações do sistema ativadas.</div><button class="btn ghost" id="btnTest">📲 Enviar notificação de teste</button>`
      : `<button class="btn primary" id="btnNotif">🔔 Ativar notificações</button><p class="hint" style="margin-top:6px">O <b>aviso dentro do app</b> (ao abrir) já funciona sem instalar. A notificação do <b>sistema</b> funciona no PC/Android; no iPhone, só com o app na tela de início.</p>`)
    + `<button class="btn ghost" id="btnPush" style="margin-top:10px">📡 ${pushOn ? "Push ativo — reativar" : "Ativar push no celular (app fechado)"}</button>`
    + `<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">`
    + (window.CRYPTO_KEY
        ? `<button class="btn ghost" id="btnPin">🔓 Remover PIN</button><p class="hint" style="margin-top:6px">🔒 Protegido: seus dados estão criptografados neste aparelho.</p>`
        : `<button class="btn primary" id="btnPin">🔒 Proteger o app com PIN</button><p class="hint" style="margin-top:6px">Exige um PIN pra abrir e criptografa seus valores no aparelho.</p>`)
    + `<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">`
    + (syncCfg()
        ? `<button class="btn primary" id="btnSync">🔄 Baixar da web agora</button><button class="btn ghost" id="btnSyncCfg" style="margin-top:8px">⚙️ Reconfigurar sincronização</button>${syncStatusHTML()}`
        : `<button class="btn primary" id="btnSyncCfg">🔄 Ativar sincronização (celular ↔ web)</button><p class="hint" style="margin-top:6px">⚠️ Sincronização <b>desligada neste aparelho</b> — por isso ele não mostra o que está na web. Toque para ativar.</p>`)
    + `<p class="hint" style="margin-top:8px">Push exige abrir pelo app instalado na tela de início. Versão: <b>v${APP_VERSION}</b></p>`;
  const b = $("#btnNotif"); if (b) b.onclick = pedirNotificacao;
  const tb = $("#btnTest"); if (tb) tb.onclick = enviarTeste;
  const pb = $("#btnPush"); if (pb) pb.onclick = ativarPush;
  const pin = $("#btnPin"); if (pin) pin.onclick = window.CRYPTO_KEY ? removerPin : definirPin;
  const sc = $("#btnSyncCfg"); if (sc) sc.onclick = configurarSync;
  const sn = $("#btnSync"); if (sn) sn.onclick = () => pullSync(true, null, true);
  const th = $("#btnTheme"); if (th) th.onclick = cycleTheme;
}
// Linha de diagnóstico da sincronização (mostra se está realmente puxando)
function syncStatusHTML() {
  const localTs = (DATA && DATA.updatedAt) || 0;
  const fmt = (t) => t ? new Date(t).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—";
  let linha;
  if (lastSyncInfo.when === 0) {
    linha = "Ainda não sincronizou nesta sessão. Toque em <b>Baixar da web agora</b>.";
  } else {
    const ic = lastSyncInfo.ok ? "✅" : "⚠️";
    linha = `${ic} Última sync: <b>${lastSyncInfo.msg}</b> (${fmt(lastSyncInfo.when)})`;
  }
  return `<p class="hint" style="margin-top:8px">${linha}<br>📲 este aparelho: ${fmt(localTs)} · ☁️ web: ${fmt(lastSyncInfo.remoteTs)}</p>`
    + `<p class="hint" style="margin-top:4px">O botão acima <b>baixa o que está na web</b> (a web manda). Ao abrir, ele também puxa sozinho.</p>`;
}
function enviarTeste() {
  if (!("Notification" in window) || Notification.permission !== "granted") { pedirNotificacao(); return; }
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.ready) {
      navigator.serviceWorker.ready.then(reg => reg.showNotification("💸 Finanças — teste", {
        body: "Funcionou! É assim que você será avisado das contas a pagar/receber.", icon: "icons/icon-192.png", badge: "icons/icon-192.png", tag: "teste"
      }));
    } else { new Notification("💸 Finanças — teste", { body: "Funcionou!", icon: "icons/icon-192.png" }); }
    toast("Notificação enviada 📲");
  } catch (e) { toast("Não foi possível enviar"); }
}

// Aviso de nova versão (mesmo link)
function checkVersion() {
  const seen = localStorage.getItem("financas2026.ver");
  if (seen === APP_VERSION) return;
  localStorage.setItem("financas2026.ver", APP_VERSION);
  const b = $("#verBanner");
  if (b) { b.innerHTML = `🎉 Atualizado para <b>v${APP_VERSION}</b> — ${VERSION_NOTES} <span class="ver-x">✕</span>`; b.classList.remove("hidden"); b.onclick = () => b.classList.add("hidden"); }
}

/* ---------- Segurança: PIN + criptografia (AES-256-GCM) ---------- */
const b64 = (u8) => btoa(String.fromCharCode(...new Uint8Array(u8)));
const ub64 = (s) => Uint8Array.from(atob(s), c => c.charCodeAt(0));
window.deriveKey = async function (pin, saltB64) {
  const salt = saltB64 ? ub64(saltB64) : crypto.getRandomValues(new Uint8Array(16));
  const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(pin), "PBKDF2", false, ["deriveKey"]);
  const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt, iterations: 150000, hash: "SHA-256" },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
  return { key, salt: b64(salt) };
};
window.encryptEnvelope = async function (k, obj) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, k.key, new TextEncoder().encode(JSON.stringify(obj)));
  return { enc: true, v: 1, salt: k.salt, iv: b64(iv), ct: b64(ct) };
};
window.decryptEnvelope = async function (k, env) {
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: ub64(env.iv) }, k.key, ub64(env.ct));
  return JSON.parse(new TextDecoder().decode(pt));
};

async function definirPin() {
  const p1 = prompt("Crie um PIN (mínimo 4 dígitos).\n\n⚠️ IMPORTANTE: se esquecer o PIN, os dados deste app NÃO poderão ser recuperados. Guarde um backup (⚙️ → Exportar).");
  if (!p1) return;
  if (p1.length < 4) { toast("PIN muito curto (mín. 4)"); return; }
  if (prompt("Repita o PIN para confirmar") !== p1) { toast("Os PINs não conferem"); return; }
  window.CRYPTO_KEY = await deriveKey(p1);
  saveData(DATA);
  toast("App protegido com PIN 🔒"); renderNotifBtn();
}
function removerPin() {
  if (!window.CRYPTO_KEY) { toast("Não há PIN definido"); return; }
  if (!confirm("Remover o PIN? Os dados ficarão sem criptografia neste aparelho.")) return;
  window.CRYPTO_KEY = null;
  localStorage.setItem(STORE_KEY, JSON.stringify(DATA));
  toast("PIN removido"); renderNotifBtn();
}
function showLock(env) {
  const ls = $("#lockScreen"); ls.classList.remove("hidden");
  const pin = $("#lockPin"), msg = $("#lockMsg");
  pin.value = ""; msg.textContent = ""; setTimeout(() => pin.focus(), 100);
  const submit = async () => {
    if (!pin.value) return;
    msg.textContent = "verificando…";
    try {
      const k = await deriveKey(pin.value, env.salt);
      const obj = await decryptEnvelope(k, env);
      window.CRYPTO_KEY = k; DATA = migrate(obj);
      ls.classList.add("hidden"); startApp();
    } catch (e) { msg.textContent = "PIN incorreto"; pin.value = ""; pin.focus(); }
  };
  $("#lockBtn").onclick = submit;
  pin.onkeydown = (e) => { if (e.key === "Enter") submit(); };
}

/* ---------- Sincronização (Google Sheet via Apps Script) ---------- */
const SYNC_CFG_KEY = "financas2026.sync";
const syncCfg = () => { try { return JSON.parse(localStorage.getItem(SYNC_CFG_KEY) || "null"); } catch (e) { return null; } };
// Extrai {url, token} de um texto: aceita o LINK MÁGICO inteiro (#cfg=...) ou só a URL /exec.
function parseCfgFromText(s) {
  if (!s) return null;
  s = ("" + s).trim();
  const m = s.match(/[#&?]cfg=([^&\s]+)/);
  if (m) {
    try {
      const b64 = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
      const cfg = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (cfg && cfg.u && cfg.t) return { url: String(cfg.u).trim(), token: String(cfg.t).trim() };
    } catch (e) {}
  }
  if (/^https?:\/\//.test(s) && /\/exec/.test(s)) return { url: s, token: null };
  return null;
}
// Abre um modal DENTRO do app (não usa prompt(), que o iPhone instalado bloqueia).
function configurarSync() {
  const cur = syncCfg() || {};
  const modal = $("#syncModal"), inp = $("#syncLinkInput"),
    tokField = $("#syncTokenField"), tokInp = $("#syncTokenInput"), msg = $("#syncModalMsg");
  if (!modal) { // fallback bem improvável
    const url = prompt("Cole o link /exec:", cur.url || ""); if (!url) return;
    const token = prompt("Cole o token:", cur.token || ""); if (!token) return;
    localStorage.setItem(SYNC_CFG_KEY, JSON.stringify({ url: url.trim(), token: token.trim() }));
    toast("Sincronização configurada ✓"); renderNotifBtn(); pullSync(true, null, true); startLiveSync(); return;
  }
  inp.value = ""; tokInp.value = cur.token || ""; tokField.style.display = "none"; msg.textContent = "";
  modal.classList.remove("hidden");
  setTimeout(() => { try { inp.focus(); } catch (e) {} }, 60);
  $("#syncCancel").onclick = () => modal.classList.add("hidden");
  $("#syncSave").onclick = () => {
    let cfg = parseCfgFromText(inp.value);
    if (cfg && !cfg.token) {                 // colou só a URL → precisa do token
      tokField.style.display = "";
      if (!tokInp.value.trim()) { msg.textContent = "Cole também o token."; try { tokInp.focus(); } catch (e) {} return; }
      cfg.token = tokInp.value.trim();
    }
    if (!cfg || !cfg.url || !cfg.token) { msg.textContent = "Não reconheci. Cole o LINK MÁGICO inteiro."; return; }
    localStorage.setItem(SYNC_CFG_KEY, JSON.stringify({ url: cfg.url.trim(), token: cfg.token.trim() }));
    modal.classList.add("hidden");
    toast("Sincronização configurada ✓"); renderNotifBtn();
    pullSync(true, null, true); startLiveSync();   // puxa a web na hora
  };
}
let pulling = false;
// status da última sincronização (mostrado em ⚙️ para diagnóstico)
let lastSyncInfo = { when: 0, ok: null, msg: "ainda não sincronizou", remoteTs: 0 };
// force=true → a WEB é a fonte da verdade: adota a nuvem sempre que houver e for diferente
// (usado no botão 🔄 e no puxar-para-atualizar). Sem force = merge por timestamp (boot/auto).
async function pullSync(aviso, onProg, force) {
  const c = syncCfg(); if (!c || pulling) return { ok: false, reason: "sem-config" };
  pulling = true;
  let result = { ok: false, reason: "?" };
  try {
    if (onProg) onProg(25, "Conectando à nuvem…");
    // fetch CORS direto (o Web App "Qualquer pessoa" envia Access-Control-Allow-Origin).
    // &t= e cache:no-store evitam resposta velha de proxy/cache.
    const resp = await fetch(c.url + "?token=" + encodeURIComponent(c.token) + "&t=" + Date.now(), { method: "GET", cache: "no-store" });
    if (onProg) onProg(60, "Baixando dados…");
    const r = await resp.json();
    if (r && r.ok) {
      const remote = r.data;
      const localTs = (DATA && DATA.updatedAt) || 0;
      const remoteTs = (remote && remote.updatedAt) || 0;
      const difere = remote ? (JSON.stringify(remote) !== JSON.stringify(DATA)) : false;
      // adota a nuvem se: (forçado e diferente) OU (auto e a nuvem é mais nova)
      const adota = remote && (force ? difere : remoteTs > localTs);
      if (adota) {
        if (onProg) onProg(85, "Aplicando alterações…");
        history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift(); // dá pra desfazer (Ctrl+Z) se quiser o estado local de volta
        DATA = migrate(remote); if (!DATA.updatedAt) DATA.updatedAt = remoteTs || Date.now();
        saveData(DATA); lastSnap = JSON.stringify(DATA); render();
        result = { ok: true, changed: true };
        if (aviso) toast("Baixado da web ⤓");
      } else if (!remote || (!force && localTs > remoteTs)) {
        // nuvem vazia ou (no modo auto) meu aparelho é mais novo → eu mando pra nuvem
        pushSync(); result = { ok: true, changed: false, pushed: true };
        if (aviso) toast(remote ? "Já estava em dia ✓" : "Enviado pra nuvem ⤴");
      } else { result = { ok: true, changed: false }; if (aviso) toast("Já estava em dia ✓"); }
      lastSyncInfo = { when: Date.now(), ok: true, remoteTs: remoteTs,
        msg: result.changed ? "baixou da web" : (result.pushed ? "enviou o local" : "já estava igual") };
    } else if (r && r.error) {
      result = { ok: false, reason: r.error };
      lastSyncInfo = { when: Date.now(), ok: false, msg: "erro do servidor: " + r.error, remoteTs: 0 };
      if (aviso) toast("Sync: " + r.error);
    }
  } catch (e) {
    result = { ok: false, reason: "rede" };
    lastSyncInfo = { when: Date.now(), ok: false, msg: "falha de rede/CORS ao baixar", remoteTs: 0 };
    if (aviso) toast("Sync (baixar) falhou");
  }
  finally { pulling = false; }
  return result;
}

// Conta itens para o resumo de atualização
function countItems(d) {
  const r = (d.receitas || []).length, f = (d.fixas || []).length, c = (d.cartao || []).length, dd = (d.diaria || []).length;
  return { receitas: r, fixas: f, cartao: c, diaria: dd, total: r + f + c + dd };
}

// Atualização manual SEM barra: gira o ícone 🔄 e dá um toast com o resumo.
let syncing = false;
async function syncNow() {
  if (!syncCfg()) { toast("Ative a sincronização em ⚙️ primeiro"); return; }
  if (syncing) return; syncing = true;
  const btn = $("#btnRefresh"); if (btn) btn.classList.add("spin");
  const before = countItems(DATA);
  let res;
  try { res = await pullSync(false, null, true); } catch (e) { res = { ok: false, reason: "erro" }; }
  const a = countItems(DATA);
  if (!res || !res.ok) toast("⚠️ Não consegui atualizar — veja a internet");
  else if (res.changed) { const d = a.total - before.total; toast(`✅ Atualizado${d !== 0 ? " · " + (d > 0 ? "+" : "") + d + " lançamento(s)" : ""}`); }
  else toast("✅ Tudo em dia");
  setTimeout(() => { if (btn) btn.classList.remove("spin"); syncing = false; }, 700);
}
let pushT;
function pushSync() {
  const c = syncCfg(); if (!c) return;
  if (!DATA.updatedAt) DATA.updatedAt = Date.now();
  clearTimeout(pushT);
  pushT = setTimeout(() => {
    fetch(c.url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: c.token, data: DATA }) }).catch(() => {});
  }, 600);
}

/* ---------- Sync ao vivo: polling + ao abrir/focar/reconectar ---------- */
let liveT = null;
const LIVE_MS = 7000;
function startLiveSync() {
  if (!syncCfg()) { stopLiveSync(); return; }
  stopLiveSync();
  liveT = setInterval(() => { if (document.visibilityState === "visible" && navigator.onLine !== false) pullSync(false); }, LIVE_MS);
}
function stopLiveSync() { if (liveT) { clearInterval(liveT); liveT = null; } }
// Voltou pro app (destrava tela, troca de aba, abre do início) → puxa na hora
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && syncCfg()) pullSync(false); });
window.addEventListener("focus", () => { if (syncCfg()) pullSync(false); });
window.addEventListener("online", () => { if (syncCfg()) pullSync(false); });

/* ---------- Boot ---------- */
function startApp() {
  window.__started = true;
  lastSnap = JSON.stringify(DATA);
  render();
  if (curTab === "resumo" && !annual) renderCharts();
  checkAndNotify(); checkVersion();
  const t0 = Date.now();
  // Mantém o splash visível enquanto sincroniza ao ABRIR (sem barra). Mín. ~1,6s, máx. ~4s.
  const fecharSplash = (min) => { const espera = Math.max(0, min - (Date.now() - t0)); setTimeout(hideSplash, espera); };
  if (syncCfg()) {
    setSplashMsg("Sincronizando suas finanças…");
    startLiveSync();
    const p = pullSync(window.__syncFromLink ? true : false);
    p.then(r => { if (r && !r.ok && r.reason !== "sem-config") setTimeout(() => toast("Não consegui baixar da web — toque 🔄"), 2200); });
    // mostra a animação por no mín. 2s e no máx. ~4,5s (sempre ≤ 5s)
    Promise.race([p, new Promise(res => setTimeout(res, 3800))]).then(() => fecharSplash(2000));
  } else {
    fecharSplash(2000);
  }
  if (window.__syncFromLink) { toast("Sincronização ativada ⚡"); window.__syncFromLink = false; }
}
function setSplashMsg(t) { const el = document.querySelector("#splash .splash-tag"); if (el) el.textContent = t; }
function hideSplash() {
  const sp = document.getElementById("splash");
  if (sp && !sp.classList.contains("gone")) { sp.classList.add("gone"); setTimeout(() => { try { sp.remove(); } catch (e) {} }, 560); }
}
// rede de segurança: nunca deixar o splash preso
window.addEventListener("load", () => setTimeout(hideSplash, 5000));

/* ---------- Fundo: chuva de números/cifras (estilo Matrix, sutil) ---------- */
(function rainFX() {
  const cv = document.getElementById("rain"); if (!cv) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) { cv.style.display = "none"; return; }
  const ctx = cv.getContext("2d");
  const glyphs = "0123456789$€£¥₹₽¢₩₪₫₴₦฿₲₱".split(""); // dígitos + cifras de vários países
  const font = 13, step = 28;                          // colunas BEM espaçadas = textura leve, não poluída
  let W, H, cols, drops, speed;
  function resize() {
    W = cv.width = innerWidth; H = cv.height = innerHeight;
    cols = Math.ceil(W / step);
    // espalha as gotas por TODA a tela desde o 1º frame (sem "faixa subindo/entrando")
    drops = Array(cols).fill(0).map(() => Math.random() * (H / font));
    speed = Array(cols).fill(0).map(() => 0.30 + Math.random() * 0.45);   // quedas lentas e variadas (calmo)
  }
  resize(); addEventListener("resize", resize);
  function palette() {
    const dark = document.documentElement.classList.contains("theme-dark") ||
      (!document.documentElement.classList.contains("theme-light") && matchMedia("(prefers-color-scheme: dark)").matches);
    // bem fraco, quase na cor do fundo; rastro curto (fade mais forte) pra não virar "barra" sólida
    return dark ? { fade: "rgba(9,18,14,0.20)", g: "rgba(95,210,160,0.16)", head: "rgba(160,255,210,0.34)" }
                : { fade: "rgba(238,241,240,0.20)", g: "rgba(20,120,80,0.11)", head: "rgba(15,150,90,0.24)" };
  }
  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    if (t - last < 75) return; last = t;            // ~13fps → queda calma e suave
    const c = palette();
    ctx.fillStyle = c.fade; ctx.fillRect(0, 0, W, H);
    ctx.font = font + "px ui-monospace, monospace";
    for (let i = 0; i < cols; i++) {
      const g = glyphs[(Math.random() * glyphs.length) | 0];
      const y = drops[i] * font;
      ctx.fillStyle = (Math.random() < 0.02) ? c.head : c.g;
      ctx.fillText(g, i * step, y);
      if (y > H && Math.random() > 0.965) drops[i] = Math.random() * -10;
      drops[i] += speed[i];
    }
  }
  requestAnimationFrame(frame);
})();

/* Auto-configura a sincronização a partir de um link (#cfg=base64).
   Lê do fragmento (#) — que NÃO é enviado a servidores — salva e limpa
   o token da barra de endereço/histórico na hora. Uso: abrir 1x o link. */
function applyConfigLink() {
  try {
    const m = (location.hash || "").match(/[#&]cfg=([^&]+)/);
    if (m) {
      const b64 = decodeURIComponent(m[1]).replace(/-/g, "+").replace(/_/g, "/");
      const cfg = JSON.parse(decodeURIComponent(escape(atob(b64))));
      if (cfg && cfg.u && cfg.t) {
        localStorage.setItem(SYNC_CFG_KEY, JSON.stringify({ url: cfg.u, token: cfg.t }));
        window.__syncFromLink = true;
      }
    }
  } catch (e) {}
  // remove o hash (token) da URL para não ficar visível nem no histórico
  if (location.hash) {
    const clean = location.pathname + location.search;
    try {
      if (window.history && typeof window.history.replaceState === "function") window.history.replaceState(null, document.title, clean);
      else location.replace(clean);
    } catch (e) { try { location.hash = ""; } catch (_) {} }
  }
}
async function boot() {
  applyTheme();
  applyConfigLink();
  let raw = localStorage.getItem(STORE_KEY) || localStorage.getItem("financas2026.v1");
  let parsed = null; try { parsed = raw ? JSON.parse(raw) : null; } catch (e) {}
  if (parsed && parsed.enc) { showLock(parsed); return; }   // bloqueado: exige PIN
  DATA = parsed ? migrate(parsed) : buildSeed();
  if (!parsed) saveData(DATA);
  startApp();
}

window.addEventListener("load", () => { if (window.__started && curTab === "resumo" && !annual) renderCharts(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- Puxar para atualizar (pull-to-refresh) ---------- */
(function pullToRefresh() {
  const ptr = $("#ptr"), txt = $("#ptrText"), TH = 70;
  let startY = 0, pulling = false, armed = false;
  const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 0;
  const modalAberto = () => !$("#modal").classList.contains("hidden") || !$("#settingsModal").classList.contains("hidden");
  window.addEventListener("touchstart", (e) => {
    if (atTop() && !modalAberto()) { startY = e.touches[0].clientY; pulling = true; armed = false; }
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (!pulling) return;
    const dy = e.touches[0].clientY - startY;
    if (dy > 0 && atTop()) {
      if (e.cancelable) e.preventDefault();
      const d = Math.min(dy * 0.6, 110);
      ptr.style.height = d + "px"; ptr.style.opacity = Math.min(1, d / TH);
      armed = d >= TH; txt.textContent = armed ? "solte para atualizar ↻" : "↓ puxe para atualizar";
    }
  }, { passive: false });
  window.addEventListener("touchend", () => {
    if (!pulling) return; pulling = false;
    if (armed) { ptr.style.height = "0"; ptr.style.opacity = "0"; if (syncCfg()) syncNow(); else location.reload(); }
    else { ptr.style.height = "0"; ptr.style.opacity = "0"; }
  });
})();

boot();
