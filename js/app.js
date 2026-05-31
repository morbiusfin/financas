/* ===== Finanças 2026 — App (v2) ===== */
let DATA = { year: 2026, saldoInicial: 0, receitas: [], fixas: [], cartao: [], diaria: [], metas: {} };
window.CRYPTO_KEY = null;
const APP_VERSION = "2.6.0";
const VERSION_NOTES = "🔗 ativar sincronização por 1 link · ⚡ sync instantânea celular ↔ web (ao abrir e a cada poucos segundos) · 🔒 PIN + criptografia";
let history = [];
let lastSnap = JSON.stringify(DATA);
const HISTORY_MAX = 50;
let curMonth = (new Date().getFullYear() === DATA.year) ? new Date().getMonth() : 4;
let annual = false;
let curTab = "resumo";
let charts = {};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const REAL_TODAY = new Date();
const isMesAtual = () => DATA.year === REAL_TODAY.getFullYear() && curMonth === REAL_TODAY.getMonth();

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

/* ---------- Notificação local (replica o aviso do Apps Script) ---------- */
function checkAndNotify() {
  if (!isMesAtual()) return;
  const alertas = vencimentos(curMonth).filter(v => v.naJanela);
  if (!alertas.length) return;
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const linhas = alertas.map(v => `• ${v.desc} — ${brl(v.val)} (${v.daysLeft === 0 ? "vence hoje" : "vence em " + v.daysLeft + "d"})`).join("\n");
  try {
    new Notification("💸 Contas a pagar", { body: linhas, icon: "icons/icon-192.png", tag: "vencimentos" });
  } catch (e) {}
}
function pedirNotificacao() {
  if (!("Notification" in window)) { toast("Este dispositivo não suporta notificações"); return; }
  Notification.requestPermission().then(p => {
    toast(p === "granted" ? "Notificações ativadas ✅" : "Permissão negada");
    if (p === "granted") checkAndNotify();
    render();
  });
}

/* ---------- Barra de meses ---------- */
function renderMonthBar() {
  const bar = $("#monthBar");
  bar.innerHTML = MESES_CURTO.map((mc, i) =>
    `<button class="month-chip ${!annual && i === curMonth ? "active" : ""}" data-m="${i}">${mc}</button>`
  ).join("") + `<button class="month-chip ano ${annual ? "active" : ""}" data-m="ano">Ano</button>`;
  $$(".month-chip", bar).forEach(b => b.onclick = () => {
    if (b.dataset.m === "ano") { annual = true; }
    else { annual = false; curMonth = +b.dataset.m; }
    render();
  });
  const active = $(".month-chip.active", bar);
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
}

/* ---------- Render principal ---------- */
function render() {
  renderMonthBar();
  const ub = $("#btnUndo"); if (ub) { ub.disabled = !history.length; ub.style.opacity = history.length ? "1" : ".35"; }
  $("#screenTitle").textContent = annual && curTab === "resumo" ? "Resumo do ano" : ({
    resumo: "Resumo", receitas: "Receitas", fixas: "Despesas Fixas",
    cartao: "Cartão Mercado Pago", diaria: "Débitos Dia a Dia"
  })[curTab];
  $("#fab").classList.toggle("hidden", curTab === "resumo");
  const view = $("#view");
  view.innerHTML = "";
  if (curTab === "resumo") return annual ? renderAnual(view) : renderResumo(view);
  renderLista(view);
}

/* ---------- RESUMO (mês) ---------- */
function renderResumo(view) {
  const m = curMonth;
  const rec = receitaMes(m), desp = despesaMes(m);
  const sIni = saldoInicialMes(m), disp = disponivelMes(m), sobra = disp - desp;
  const alertas = isMesAtual() ? contasAlerta(m) : [];

  view.innerHTML = `
    ${alertas.length ? `<div class="alert-banner" id="goVenc">🔔 <b>${alertas.length}</b> conta(s) a vencer — toque para ver</div>` : ""}

    <div class="flow-card">
      <div class="flow-row"><span>Saldo inicial <i>(sobrou do mês anterior)</i></span><b>${brl(sIni)}</b></div>
      <div class="flow-row plus"><span>+ Receitas</span><b class="pos">${brl(rec)}</b></div>
      <div class="flow-row eq"><span>= Disponível</span><b>${brl(disp)}</b></div>
      <div class="flow-row minus"><span>− Despesas</span><b class="neg">${brl(desp)}</b></div>
      <div class="flow-row total"><span>= Sobra do mês</span><b class="${sobra >= 0 ? "pos" : "neg"}">${brl(sobra)}</b></div>
    </div>

    <div class="section-card"><h3>Previsto × Realizado — ${MESES[m]}</h3>
      ${barPrevReal("Receitas", recebido(m), aReceber(m), "recebido", "a receber")}
      ${barPrevReal("Despesas", pago(m), aPagar(m), "pago", "a pagar")}
    </div>

    ${alertas.length ? `<div class="section-card" id="vencCard"><h3>Próximas contas</h3><div id="vencList"></div></div>` : ""}

    <div class="section-card"><h3>Composição das despesas</h3>
      <div class="chart-wrap"><canvas id="doughChart" height="170"></canvas></div>
      <div id="catList"></div></div>

    ${renderMetas(m)}

    <div class="section-card"><h3>Receitas × Despesas (ano)</h3>
      <div class="chart-wrap"><canvas id="barChart" height="190"></canvas></div></div>

    <div class="section-card"><h3>Saldo acumulado (ano)</h3>
      <div class="chart-wrap"><canvas id="lineChart" height="170"></canvas></div></div>
  `;
  if (alertas.length) renderVencList();
  renderCatList(m);
  renderCharts();
  const gv = $("#goVenc"); if (gv) gv.onclick = () => $("#vencCard")?.scrollIntoView({ behavior: "smooth", block: "start" });
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
  const vs = contasAlerta(curMonth);
  el.innerHTML = vs.map(v => {
    const tag = v.daysLeft === 0 ? `<span class="venc-badge hoje">vence hoje</span>`
      : v.daysLeft > 0 ? `<span class="venc-badge ${v.daysLeft <= (v.aviso || 2) ? "perto" : ""}">vence em ${v.daysLeft}d</span>`
      : `<span class="venc-badge atras">atrasada ${-v.daysLeft}d</span>`;
    return `<div class="list-row">
      <div class="desc"><div class="name">${esc(v.desc)}</div><div class="sub">dia ${v.venc} ${tag}</div></div>
      <span class="amount">${brl(v.val)}</span>
      <button class="mini-btn" data-pay="${v.id}">Pagar</button>
    </div>`;
  }).join("");
  $$("[data-pay]", el).forEach(b => b.onclick = () => {
    const l = DATA.fixas.find(x => x.id === b.dataset.pay);
    if (l) { l.sts[curMonth] = "pago"; persist(); toast("Marcado como pago ✅"); }
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
  const totRec = MESES.reduce((s, _, i) => s + receitaMes(i), 0);
  const totDesp = MESES.reduce((s, _, i) => s + despesaMes(i), 0);
  const sobraAno = totRec - totDesp;
  const cat = {
    fixas: MESES.reduce((s, _, i) => s + fixasMes(i), 0),
    cartao: MESES.reduce((s, _, i) => s + cartaoMes(i), 0),
    diaria: MESES.reduce((s, _, i) => s + diariaMes(i), 0),
  };
  // top linhas fixas no ano
  const linhasAno = DATA.fixas.map(l => ({ desc: l.desc, tot: l.vals.reduce((s, v) => s + (Number(v) || 0), 0) }))
    .filter(x => x.tot > 0).sort((a, b) => b.tot - a.tot).slice(0, 8);

  view.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="label">Receitas no ano</div><div class="value pos">${brl(totRec)}</div></div>
      <div class="kpi"><div class="label">Despesas no ano</div><div class="value neg">${brl(totDesp)}</div></div>
      <div class="kpi big"><div class="label">Sobra no ano</div><div class="value ${sobraAno >= 0 ? "pos" : "neg"}">${brl(sobraAno)}</div></div>
    </div>
    <div class="section-card"><h3>Despesas por categoria (ano)</h3>
      <div class="cat-line"><span class="dot" style="background:#0b3d2e"></span><span class="cname">Despesas Fixas</span><span class="cval">${brl(cat.fixas)}</span></div>
      <div class="cat-line"><span class="dot" style="background:#1db954"></span><span class="cname">Cartão Mercado Pago</span><span class="cval">${brl(cat.cartao)}</span></div>
      <div class="cat-line"><span class="dot" style="background:#f5a623"></span><span class="cname">Débitos Dia a Dia</span><span class="cval">${brl(cat.diaria)}</span></div>
    </div>
    <div class="section-card"><h3>Sobra por mês</h3>
      <div class="chart-wrap"><canvas id="sobraChart" height="190"></canvas></div></div>
    <div class="section-card"><h3>Maiores despesas fixas (ano)</h3>
      ${linhasAno.map(x => `<div class="cat-line"><span class="cname">${esc(x.desc)}</span><span class="cval">${brl(x.tot)}</span></div>`).join("") || `<div class="empty">Sem dados.</div>`}
    </div>`;
  renderSobraChart();
}

/* ---------- Charts ---------- */
function renderCharts() {
  if (typeof Chart === "undefined") return;
  ["dough", "bar", "line"].forEach(k => { if (charts[k]) charts[k].destroy(); });
  const m = curMonth;
  const dough = $("#doughChart");
  if (dough) {
    const comp = [fixasMes(m), cartaoMes(m), diariaMes(m)];
    const tc = comp.reduce((a, b) => a + b, 0);
    charts.dough = new Chart(dough, { type: "doughnut",
      data: { labels: ["Despesas Fixas", "Cartão Mercado Pago", "Débitos Dia a Dia"],
        datasets: [{ data: tc ? comp : [1, 0, 0], backgroundColor: ["#0b3d2e", "#1db954", "#f5a623"], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: c => `${c.label}: ${brl(c.raw)} (${tc ? (c.raw / tc * 100).toFixed(1) : 0}%)` } } } } });
  }
  const bc = $("#barChart");
  if (bc) charts.bar = new Chart(bc, { type: "bar",
    data: { labels: MESES_CURTO, datasets: [
      { label: "Receitas", data: MESES.map((_, i) => receitaMes(i)), backgroundColor: "#1db954", borderRadius: 4 },
      { label: "Despesas", data: MESES.map((_, i) => despesaMes(i)), backgroundColor: "#e5484d", borderRadius: 4 }] },
    options: chartOpts(true) });
  const lc = $("#lineChart");
  if (lc) charts.line = new Chart(lc, { type: "line",
    data: { labels: MESES_CURTO, datasets: [{ label: "Saldo acumulado", data: MESES.map((_, i) => sobraMes(i)),
      borderColor: "#0b3d2e", backgroundColor: "rgba(11,61,46,.1)", fill: true, tension: .35, pointRadius: 3 }] },
    options: chartOpts(false) });
}
function renderSobraChart() {
  if (typeof Chart === "undefined") return;
  if (charts.sobra) charts.sobra.destroy();
  const data = MESES.map((_, i) => receitaMes(i) - despesaMes(i));
  charts.sobra = new Chart($("#sobraChart"), { type: "bar",
    data: { labels: MESES_CURTO, datasets: [{ data, backgroundColor: data.map(v => v >= 0 ? "#1d6fe5" : "#e5484d"), borderRadius: 4 }] },
    options: { ...chartOpts(false), plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => brl(c.raw) } } } } });
}
function chartOpts(legend) {
  return { responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: legend, position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: c => `${c.dataset.label || ""}: ${brl(c.raw)}` } } },
    scales: { y: { ticks: { callback: v => "R$" + (v / 1000).toFixed(0) + "k", font: { size: 10 } } }, x: { ticks: { font: { size: 10 } } } } };
}

/* ---------- LISTAS ---------- */
function renderLista(view) {
  if (curTab === "diaria") return renderDiaria(view);
  if (curTab === "receitas") return renderReceitas(view);
  const lines = DATA[curTab];
  const total = sumMonth(lines, curMonth);
  const rows = lines.map((l, idx) => ({ l, idx }))
    .filter(x => x.l.vals[curMonth] > 0 || x.l.sts[curMonth] !== "vazio")
    .sort((a, b) => b.l.vals[curMonth] - a.l.vals[curMonth]);
  view.innerHTML = `
    <div class="list-header"><span class="lbl">${rows.length} lançamento(s) em ${MESES[curMonth]}</span><span class="total">${brl(total)}</span></div>
    <div class="list">${rows.length ? rows.map(({ l, idx }) => lineRow(l, idx)).join("") : empty()}</div>`;
  bindRows(view);
}

function renderReceitas(view) {
  const m = curMonth;
  const groups = [["Ativa", "Renda recorrente"], ["Extra", "Renda extra"]];
  let html = `<div class="list-header"><span class="lbl">Recebido ${brl(recebido(m))} · a receber ${brl(aReceber(m))}</span><span class="total">${brl(receitaMes(m))}</span></div>`;
  groups.forEach(([tipo, titulo]) => {
    const rows = DATA.receitas.map((l, idx) => ({ l, idx }))
      .filter(x => x.l.tipo === tipo && (x.l.vals[m] > 0 || x.l.sts[m] !== "vazio"))
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
    <span class="amount">${brl(val)}</span></div>`;
}

function renderDiaria(view) {
  const m = curMonth;
  const rows = DATA.diaria.map((d, idx) => ({ d, idx })).filter(x => x.d.mes === m);
  const total = rows.reduce((s, x) => s + (Number(x.d.valor) || 0), 0);
  // agrupa por categoria
  const cats = {};
  rows.forEach(({ d, idx }) => { (cats[d.categoria || "Geral"] = cats[d.categoria || "Geral"] || []).push({ d, idx }); });
  let html = `<div class="list-header"><span class="lbl">${rows.length} compra(s) em ${MESES[m]}</span><span class="total">${brl(total)}</span></div>`;
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

/* ---------- MODAIS ---------- */
function openEntryModal(tab, idx) {
  const isNew = idx == null, l = isNew ? null : DATA[tab][idx], isReceita = tab === "receitas";
  const stOpts = isReceita ? [["recebido", "Recebido"], ["programado", "Programado"], ["vazio", "—"]]
                           : [["pago", "Pago"], ["programado", "Programado"], ["vazio", "—"]];
  $("#modalTitle").textContent = (isNew ? "Novo " : "Editar ") + ({ receitas: "receita", fixas: "despesa fixa", cartao: "item do cartão" })[tab];
  let extra = "";
  if (isReceita) extra = `<label class="field"><span>Tipo de renda</span><select id="f_tipo"><option value="Ativa">Ativa (recorrente)</option><option value="Extra">Extra (avulsa)</option></select></label>`;
  else if (tab === "fixas") extra = `<div class="field-row">
      <label class="field"><span>Avisar (dias antes)</span><input id="f_aviso" type="number" min="0" max="15" value="${isNew || !l.aviso ? "" : l.aviso}" placeholder="ex.: 3" /></label>
      <label class="field"><span>Meta/mês (opcional)</span><input id="f_meta" type="number" step="0.01" value="${isNew || !l.meta ? "" : l.meta}" placeholder="R$" /></label></div>`;
  else if (tab === "cartao") extra = `<div class="field-row">
      <label class="field"><span>Parcela atual</span><input id="f_pa" type="number" min="1" value="${isNew || !l.parcAtual ? "" : l.parcAtual}" placeholder="--" /></label>
      <label class="field"><span>de (total)</span><input id="f_pt" type="number" min="1" value="${isNew || !l.parcTotal ? "" : l.parcTotal}" placeholder="--" /></label>
      <label class="field"><span>Cartão</span><input id="f_cartao" type="text" value="${isNew || !l.cartao ? "" : esc(l.cartao)}" placeholder="final" /></label></div>`;

  $("#entryForm").innerHTML = `
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" value="${isNew ? "" : esc(l.desc)}" required placeholder="Ex.: ${isReceita ? "Salário" : "Aluguel"}" /></label>
    ${extra}
    <div class="field-row">
      <label class="field"><span>Valor (${MESES[curMonth]})</span><input id="f_val" type="number" step="0.01" inputmode="decimal" value="${isNew ? "" : (l.vals[curMonth] || "")}" placeholder="0,00" /></label>
      <label class="field"><span>${tab === "fixas" ? "Vencimento (dia)" : "Dia"}</span><input id="f_dia" type="number" min="1" max="31" value="${isNew || !l.dia ? "" : l.dia}" placeholder="--" /></label>
    </div>
    <label class="field"><span>Situação</span><select id="f_st">${stOpts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <label class="field row-check"><input id="f_all" type="checkbox" /><span>Aplicar este valor a todos os meses (recorrente)</span></label>`;
  if (!isNew) { if (isReceita) $("#f_tipo").value = l.tipo || "Ativa"; $("#f_st").value = l.sts[curMonth] || "vazio"; }
  else $("#f_st").value = isReceita ? "recebido" : "pago";

  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir este lançamento (todos os meses)?")) { DATA[tab].splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const val = parseFloat($("#f_val").value) || 0, st = $("#f_st").value, all = $("#f_all").checked;
    let line = isNew ? { id: uid(), desc: "", vals: Array(12).fill(0), sts: Array(12).fill("vazio") } : l;
    line.desc = $("#f_desc").value.trim();
    line.dia = parseInt($("#f_dia").value) || null;
    if (isReceita) line.tipo = $("#f_tipo").value;
    if (tab === "fixas") { line.aviso = parseInt($("#f_aviso").value) || null; line.meta = parseFloat($("#f_meta").value) || null; }
    if (tab === "cartao") { line.parcAtual = parseInt($("#f_pa").value) || null; line.parcTotal = parseInt($("#f_pt").value) || null; line.cartao = $("#f_cartao").value.trim(); }
    if (all) { line.vals = Array(12).fill(val); line.sts = Array(12).fill(val > 0 ? st : "vazio"); }
    else { line.vals[curMonth] = val; line.sts[curMonth] = val > 0 ? st : "vazio"; }
    if (isNew) DATA[tab].push(line);
    persist(); closeModal(); toast(isNew ? "Adicionado" : "Salvo");
  };
  showModal("#modal");
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
    </div><p class="hint">Mês: ${MESES[curMonth]}</p>`;
  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir esta compra?")) { DATA.diaria.splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const o = { desc: $("#f_desc").value.trim(), valor: parseFloat($("#f_val").value) || 0, dia: parseInt($("#f_dia").value) || null, categoria: $("#f_cat").value.trim() || "Geral" };
    if (isNew) DATA.diaria.push({ id: uid(), mes: curMonth, ...o });
    else Object.assign(d, o);
    persist(); closeModal(); toast(isNew ? "Adicionado" : "Salvo");
  };
  showModal("#modal");
}

/* ---------- Infra ---------- */
function showModal(s) { $(s).classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
function persist() { DATA.updatedAt = Date.now(); history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift(); lastSnap = JSON.stringify(DATA); saveData(DATA); render(); pushSync(); }
function undo() { if (!history.length) { toast("Nada para desfazer"); return; } lastSnap = history.pop(); DATA = JSON.parse(lastSnap); saveData(DATA); render(); toast("Desfeito ↩︎"); }
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
let toastT; function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 1800); }

/* ---------- Eventos ---------- */
$$(".tab").forEach(t => t.onclick = () => { $$(".tab").forEach(x => x.classList.remove("active")); t.classList.add("active"); curTab = t.dataset.tab; if (curTab !== "resumo") annual = false; render(); });
$("#fab").onclick = () => curTab === "diaria" ? openDiariaModal(null) : openEntryModal(curTab, null);
$("#btnUndo").onclick = undo;
document.addEventListener("keydown", (e) => {
  const t = (e.target.tagName || "");
  if ((e.ctrlKey || e.metaKey) && (e.key === "z" || e.key === "Z") && t !== "INPUT" && t !== "SELECT" && t !== "TEXTAREA") { e.preventDefault(); undo(); }
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
let PUSH_API = ""; // preenchido após publicar o Worker
function urlB64ToU8(b64) { const pad = "=".repeat((4 - b64.length % 4) % 4); const s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/"); const raw = atob(s); return Uint8Array.from([...raw].map(c => c.charCodeAt(0))); }
async function ativarPush() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) { toast("Push não suportado aqui (use o app instalado no iPhone)"); return; }
  const perm = await Notification.requestPermission();
  if (perm !== "granted") { toast("Permissão negada"); return; }
  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToU8(VAPID_PUBLIC) });
    localStorage.setItem("financas2026.pushsub", JSON.stringify(sub));
    const bills = DATA.fixas.filter(l => l.dia).map(l => ({ desc: l.desc, dia: l.dia, aviso: l.aviso || 0 }));
    if (PUSH_API) {
      await fetch(PUSH_API + "/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subscription: sub, bills }) });
      toast("Push ativado no celular ✅");
    } else { toast("Inscrição criada ✅ (servidor em configuração)"); }
  } catch (e) { toast("Falha ao ativar push: " + e.message); }
  render();
}

function renderNotifBtn() {
  const wrap = $("#notifWrap"); if (!wrap) return;
  const perm = ("Notification" in window) ? Notification.permission : "unsupported";
  const pushOn = !!localStorage.getItem("financas2026.pushsub");
  wrap.innerHTML =
    (perm === "granted"
      ? `<div class="hint">🔔 Avisos ao abrir o app ativados.</div><button class="btn ghost" id="btnTest">📲 Enviar notificação de teste</button>`
      : `<button class="btn ghost" id="btnNotif">🔔 Ativar avisos no app</button>`)
    + `<button class="btn ghost" id="btnPush" style="margin-top:10px">📡 ${pushOn ? "Push ativo — reativar" : "Ativar push no celular (app fechado)"}</button>`
    + `<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">`
    + (window.CRYPTO_KEY
        ? `<button class="btn ghost" id="btnPin">🔓 Remover PIN</button><p class="hint" style="margin-top:6px">🔒 Protegido: seus dados estão criptografados neste aparelho.</p>`
        : `<button class="btn primary" id="btnPin">🔒 Proteger o app com PIN</button><p class="hint" style="margin-top:6px">Exige um PIN pra abrir e criptografa seus valores no aparelho.</p>`)
    + `<hr style="border:0;border-top:1px solid var(--line);margin:14px 0">`
    + (syncCfg()
        ? `<button class="btn ghost" id="btnSync">🔄 Sincronizar agora</button><button class="btn ghost" id="btnSyncCfg" style="margin-top:8px">⚙️ Reconfigurar sincronização</button><p class="hint" style="margin-top:6px">⚡ Sincronização instantânea ligada — sobe a cada mudança e baixa ao abrir o app e a cada poucos segundos (celular ↔ web).</p>`
        : `<button class="btn primary" id="btnSyncCfg">🔄 Ativar sincronização (celular ↔ web)</button>`)
    + `<p class="hint" style="margin-top:8px">Push exige abrir pelo app instalado na tela de início. Versão: <b>v${APP_VERSION}</b></p>`;
  const b = $("#btnNotif"); if (b) b.onclick = pedirNotificacao;
  const tb = $("#btnTest"); if (tb) tb.onclick = enviarTeste;
  const pb = $("#btnPush"); if (pb) pb.onclick = ativarPush;
  const pin = $("#btnPin"); if (pin) pin.onclick = window.CRYPTO_KEY ? removerPin : definirPin;
  const sc = $("#btnSyncCfg"); if (sc) sc.onclick = configurarSync;
  const sn = $("#btnSync"); if (sn) sn.onclick = () => pullSync(true);
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
function configurarSync() {
  const cur = syncCfg() || {};
  const url = prompt("Cole o link do Web App de sincronização (termina em /exec):", cur.url || "");
  if (!url) return;
  const token = prompt("Cole o token de sincronização:", cur.token || "");
  if (!token) return;
  localStorage.setItem(SYNC_CFG_KEY, JSON.stringify({ url: url.trim(), token: token.trim() }));
  toast("Sincronização configurada"); renderNotifBtn(); pullSync(true); startLiveSync();
}
let pulling = false;
async function pullSync(aviso) {
  const c = syncCfg(); if (!c || pulling) return;
  pulling = true;
  try {
    // fetch CORS direto (o Web App "Qualquer pessoa" envia Access-Control-Allow-Origin).
    // &t= e cache:no-store evitam resposta velha de proxy/cache.
    const resp = await fetch(c.url + "?token=" + encodeURIComponent(c.token) + "&t=" + Date.now(), { method: "GET", cache: "no-store" });
    const r = await resp.json();
    if (r && r.ok) {
      const remote = r.data;
      const localTs = (DATA && DATA.updatedAt) || 0;
      const remoteTs = (remote && remote.updatedAt) || 0;
      if (remote && remoteTs > localTs) {
        // nuvem tem algo mais novo → adota e mantém histórico de desfazer
        history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift();
        DATA = migrate(remote); saveData(DATA); lastSnap = JSON.stringify(DATA); render();
        if (aviso) toast("Atualizado da nuvem ⤓");
      } else if (!remote || localTs > remoteTs) {
        // nuvem vazia ou mais velha → meu aparelho manda o estado mais novo
        pushSync(); if (aviso) toast(remote ? "Já estava em dia ✓" : "Enviado pra nuvem ⤴");
      } else if (aviso) { toast("Já estava em dia ✓"); }
    } else if (r && r.error) { if (aviso) toast("Sync: " + r.error); }
  } catch (e) { if (aviso) toast("Sync (baixar) falhou"); }
  finally { pulling = false; }
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
  if (syncCfg()) { pullSync(window.__syncFromLink ? true : false); startLiveSync(); }
  if (window.__syncFromLink) { toast("Sincronização ativada ⚡"); window.__syncFromLink = false; }
}
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
    if (armed) { txt.textContent = "atualizando…"; setTimeout(() => location.reload(), 150); }
    else { ptr.style.height = "0"; ptr.style.opacity = "0"; }
  });
})();

boot();
