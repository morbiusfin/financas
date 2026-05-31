/* ===== Finanças 2026 — App ===== */
let DATA = loadData();
let curMonth = (new Date().getFullYear() === DATA.year) ? new Date().getMonth() : 4;
let curTab = "resumo";
let charts = {};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- Engine de cálculo (replica as fórmulas da planilha) ---------- */
const sumMonth = (lines, m) => lines.reduce((s, l) => s + (Number(l.vals[m]) || 0), 0);
const receitaMes = (m) => sumMonth(DATA.receitas, m);
const fixasMes   = (m) => sumMonth(DATA.fixas, m);
const cartaoMes  = (m) => sumMonth(DATA.cartao, m);
const diariaMes  = (m) => DATA.diaria.filter(d => d.mes === m).reduce((s, d) => s + (Number(d.valor) || 0), 0);
const despesaMes = (m) => fixasMes(m) + cartaoMes(m) + diariaMes(m);          // DESPESA TOTAL
const resultadoMes = (m) => receitaMes(m) - despesaMes(m);                    // Receita - Despesa
function acumulado(m) {                                                       // saldo corrente
  let acc = Number(DATA.saldoInicial) || 0;
  for (let i = 0; i <= m; i++) acc += resultadoMes(i);
  return acc;
}

/* ---------- Render: barra de meses ---------- */
function renderMonthBar() {
  const bar = $("#monthBar");
  bar.innerHTML = MESES_CURTO.map((mc, i) =>
    `<button class="month-chip ${i === curMonth ? "active" : ""}" data-m="${i}">${mc}</button>`
  ).join("");
  $$(".month-chip", bar).forEach(b => b.onclick = () => { curMonth = +b.dataset.m; render(); });
  // centraliza o mês ativo
  const active = $(".month-chip.active", bar);
  if (active) active.scrollIntoView({ inline: "center", block: "nearest" });
}

/* ---------- Render principal ---------- */
function render() {
  renderMonthBar();
  $("#screenTitle").textContent = ({
    resumo: "Resumo", receitas: "Receitas", fixas: "Despesas Fixas",
    cartao: "Cartão Mercado Pago", diaria: "Débitos Dia a Dia"
  })[curTab];
  $("#fab").classList.toggle("hidden", curTab === "resumo");
  const view = $("#view");
  if (curTab === "resumo") view.innerHTML = "", renderResumo(view);
  else renderLista(view);
}

/* ---------- Tela RESUMO ---------- */
function renderResumo(view) {
  const rec = receitaMes(curMonth), desp = despesaMes(curMonth);
  const res = rec - desp, acc = acumulado(curMonth);
  view.innerHTML = `
    <div class="kpi-grid">
      <div class="kpi"><div class="label">Receitas</div><div class="value pos">${brl(rec)}</div></div>
      <div class="kpi"><div class="label">Despesas</div><div class="value neg">${brl(desp)}</div></div>
      <div class="kpi big"><div class="label">Resultado do mês</div>
        <div class="value ${res >= 0 ? "pos" : "neg"}">${brl(res)}</div></div>
      <div class="kpi big"><div class="label">Saldo acumulado</div>
        <div class="value ${acc >= 0 ? "pos" : "neg"}">${brl(acc)}</div></div>
    </div>

    <div class="section-card"><h3>Composição das despesas — ${MESES[curMonth]}</h3>
      <div class="chart-wrap"><canvas id="doughChart" height="180"></canvas></div>
      <div id="catList"></div></div>

    <div class="section-card"><h3>Receitas x Despesas (ano)</h3>
      <div class="chart-wrap"><canvas id="barChart" height="200"></canvas></div></div>

    <div class="section-card"><h3>Saldo acumulado (ano)</h3>
      <div class="chart-wrap"><canvas id="lineChart" height="180"></canvas></div></div>
  `;
  renderCatList();
  renderCharts();
}

function renderCatList() {
  const cats = [
    { name: "Despesas Fixas", val: fixasMes(curMonth), color: "#0b3d2e" },
    { name: "Cartão Mercado Pago", val: cartaoMes(curMonth), color: "#1db954" },
    { name: "Débitos Dia a Dia", val: diariaMes(curMonth), color: "#f5a623" },
  ].filter(c => c.val > 0);
  const el = $("#catList");
  if (!cats.length) { el.innerHTML = `<div class="empty">Sem despesas neste mês.</div>`; return; }
  el.innerHTML = cats.map(c =>
    `<div class="cat-line"><span class="dot" style="background:${c.color}"></span>
     <span class="cname">${c.name}</span><span class="cval">${brl(c.val)}</span></div>`
  ).join("");
}

function renderCharts() {
  if (typeof Chart === "undefined") return; // CDN ainda carregando
  Object.values(charts).forEach(c => c && c.destroy());
  const rec = MESES.map((_, i) => receitaMes(i));
  const desp = MESES.map((_, i) => despesaMes(i));
  const acc = MESES.map((_, i) => acumulado(i));

  const dough = $("#doughChart");
  if (dough) {
    const comp = [fixasMes(curMonth), cartaoMes(curMonth), diariaMes(curMonth)];
    const totalC = comp.reduce((a, b) => a + b, 0);
    charts.dough = new Chart(dough, {
      type: "doughnut",
      data: { labels: ["Despesas Fixas", "Cartão Mercado Pago", "Débitos Dia a Dia"],
        datasets: [{ data: totalC ? comp : [1, 0, 0], backgroundColor: ["#0b3d2e", "#1db954", "#f5a623"], borderWidth: 0 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: { legend: { position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
          tooltip: { callbacks: { label: (c) => `${c.label}: ${brl(c.raw)} (${totalC ? (c.raw / totalC * 100).toFixed(1) : 0}%)` } } } }
    });
  }

  charts.bar = new Chart($("#barChart"), {
    type: "bar",
    data: { labels: MESES_CURTO, datasets: [
      { label: "Receitas", data: rec, backgroundColor: "#1db954", borderRadius: 4 },
      { label: "Despesas", data: desp, backgroundColor: "#e5484d", borderRadius: 4 },
    ]},
    options: chartOpts(true)
  });
  charts.line = new Chart($("#lineChart"), {
    type: "line",
    data: { labels: MESES_CURTO, datasets: [
      { label: "Acumulado", data: acc, borderColor: "#0b3d2e", backgroundColor: "rgba(11,61,46,.1)",
        fill: true, tension: .35, pointRadius: 3 },
    ]},
    options: chartOpts(false)
  });
}
function chartOpts(legend) {
  return {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: legend, position: "bottom", labels: { boxWidth: 12, font: { size: 11 } } },
      tooltip: { callbacks: { label: (c) => `${c.dataset.label}: ${brl(c.raw)}` } } },
    scales: { y: { ticks: { callback: (v) => "R$" + (v / 1000).toFixed(0) + "k", font: { size: 10 } } },
      x: { ticks: { font: { size: 10 } } } }
  };
}

/* ---------- Telas de LISTA (receitas/fixas/cartao/diaria) ---------- */
function renderLista(view) {
  if (curTab === "diaria") return renderDiaria(view);
  const lines = DATA[curTab];
  const total = sumMonth(lines, curMonth);
  const rows = lines
    .map((l, idx) => ({ l, idx }))
    .filter(x => x.l.vals[curMonth] > 0 || x.l.sts[curMonth] !== "vazio")
    .sort((a, b) => b.l.vals[curMonth] - a.l.vals[curMonth]);

  view.innerHTML = `
    <div class="list-header">
      <span class="lbl">${rows.length} lançamento(s) em ${MESES[curMonth]}</span>
      <span class="total">${brl(total)}</span>
    </div>
    <div class="list">${
      rows.length ? rows.map(({ l, idx }) => lineRow(l, idx)).join("")
                  : `<div class="empty">Nada lançado neste mês.<br>Toque em + para adicionar.</div>`
    }</div>`;
  $$(".list-row", view).forEach(r => r.onclick = () => openEntryModal(curTab, +r.dataset.idx));
}

function lineRow(l, idx) {
  const val = l.vals[curMonth], st = l.sts[curMonth] || "vazio";
  const sub = [l.tipo, l.dia ? "dia " + l.dia : ""].filter(Boolean).join(" • ");
  return `<div class="list-row" data-idx="${idx}">
    <div class="desc"><div class="name">${esc(l.desc || "—")}</div>
      ${sub ? `<div class="sub">${sub}</div>` : ""}</div>
    <span class="badge ${st}">${st}</span>
    <span class="amount">${brl(val)}</span>
  </div>`;
}

function renderDiaria(view) {
  const rows = DATA.diaria.map((d, idx) => ({ d, idx })).filter(x => x.d.mes === curMonth);
  const total = rows.reduce((s, x) => s + (Number(x.d.valor) || 0), 0);
  view.innerHTML = `
    <div class="list-header">
      <span class="lbl">${rows.length} compra(s) em ${MESES[curMonth]}</span>
      <span class="total">${brl(total)}</span>
    </div>
    <div class="list">${
      rows.length ? rows.map(({ d, idx }) =>
        `<div class="list-row" data-idx="${idx}">
          <div class="desc"><div class="name">${esc(d.desc || "—")}</div>
          ${d.dia ? `<div class="sub">dia ${d.dia}</div>` : ""}</div>
          <span class="amount">${brl(d.valor)}</span></div>`).join("")
      : `<div class="empty">Nenhuma compra no débito neste mês.<br>Toque em + para adicionar.</div>`
    }</div>`;
  $$(".list-row", view).forEach(r => r.onclick = () => openDiariaModal(+r.dataset.idx));
}

/* ---------- MODAL: lançamento mensal ---------- */
function openEntryModal(tab, idx) {
  const isNew = idx == null;
  const l = isNew ? null : DATA[tab][idx];
  const isReceita = tab === "receitas";
  const statusOpts = isReceita
    ? [["recebido", "Recebido"], ["programado", "Programado"], ["vazio", "—"]]
    : [["pago", "Pago"], ["programado", "Programado"], ["vazio", "—"]];

  $("#modalTitle").textContent = (isNew ? "Novo " : "Editar ") +
    ({ receitas: "receita", fixas: "despesa fixa", cartao: "item do cartão" })[tab];

  $("#entryForm").innerHTML = `
    <label class="field"><span>Descrição</span>
      <input id="f_desc" type="text" value="${isNew ? "" : esc(l.desc)}" required placeholder="Ex.: Netflix" /></label>
    ${isReceita ? `<label class="field"><span>Tipo de renda</span>
      <select id="f_tipo"><option value="Ativa">Ativa</option><option value="Extra">Extra</option></select></label>` : ""}
    <div class="field-row">
      <label class="field"><span>Valor (${MESES[curMonth]})</span>
        <input id="f_val" type="number" step="0.01" inputmode="decimal" value="${isNew ? "" : (l.vals[curMonth] || "")}" placeholder="0,00" /></label>
      <label class="field"><span>Dia</span>
        <input id="f_dia" type="number" min="1" max="31" value="${isNew || !l.dia ? "" : l.dia}" placeholder="--" /></label>
    </div>
    <label class="field"><span>Situação</span>
      <select id="f_st">${statusOpts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <label class="field" style="display:flex;align-items:center;gap:10px;flex-direction:row;">
      <input id="f_all" type="checkbox" style="width:auto" />
      <span style="margin:0">Aplicar este valor a todos os meses (recorrente)</span></label>
  `;
  if (!isNew) {
    if (isReceita) $("#f_tipo").value = l.tipo || "Ativa";
    $("#f_st").value = l.sts[curMonth] || "vazio";
  } else {
    $("#f_st").value = isReceita ? "recebido" : "pago";
  }

  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir este lançamento (todos os meses)?")) { DATA[tab].splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };

  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const desc = $("#f_desc").value.trim();
    const val = parseFloat($("#f_val").value) || 0;
    const dia = parseInt($("#f_dia").value) || null;
    const st = $("#f_st").value;
    const all = $("#f_all").checked;
    let line = isNew ? { id: uid(), desc, tipo: "", dia, vals: Array(12).fill(0), sts: Array(12).fill("vazio") } : l;
    line.desc = desc; line.dia = dia;
    if (isReceita) line.tipo = $("#f_tipo").value;
    if (all) { line.vals = Array(12).fill(val); line.sts = Array(12).fill(val > 0 ? st : "vazio"); }
    else { line.vals[curMonth] = val; line.sts[curMonth] = val > 0 ? st : "vazio"; }
    if (isNew) DATA[tab].push(line);
    persist(); closeModal(); toast(isNew ? "Adicionado" : "Salvo");
  };
  showModal("#modal");
}

/* ---------- MODAL: débito dia a dia ---------- */
function openDiariaModal(idx) {
  const isNew = idx == null;
  const d = isNew ? null : DATA.diaria[idx];
  $("#modalTitle").textContent = (isNew ? "Nova " : "Editar ") + "compra no débito";
  $("#entryForm").innerHTML = `
    <label class="field"><span>Descrição</span>
      <input id="f_desc" type="text" value="${isNew ? "" : esc(d.desc)}" required placeholder="Ex.: Mercado" /></label>
    <div class="field-row">
      <label class="field"><span>Valor</span>
        <input id="f_val" type="number" step="0.01" inputmode="decimal" value="${isNew ? "" : d.valor}" placeholder="0,00" required /></label>
      <label class="field"><span>Dia</span>
        <input id="f_dia" type="number" min="1" max="31" value="${isNew || !d.dia ? "" : d.dia}" placeholder="--" /></label>
    </div>
    <p class="hint">Mês: ${MESES[curMonth]}</p>`;
  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir esta compra?")) { DATA.diaria.splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const desc = $("#f_desc").value.trim();
    const valor = parseFloat($("#f_val").value) || 0;
    const dia = parseInt($("#f_dia").value) || null;
    if (isNew) DATA.diaria.push({ id: uid(), desc, mes: curMonth, dia, valor });
    else { d.desc = desc; d.valor = valor; d.dia = dia; }
    persist(); closeModal(); toast(isNew ? "Adicionado" : "Salvo");
  };
  showModal("#modal");
}

/* ---------- Infra de UI ---------- */
function showModal(sel) { $(sel).classList.remove("hidden"); }
function closeModal() { $("#modal").classList.add("hidden"); }
function persist() { saveData(DATA); render(); }
function esc(s) { return String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }
let toastT;
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.remove("hidden");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.add("hidden"), 1800);
}

/* ---------- Eventos globais ---------- */
$$(".tab").forEach(t => t.onclick = () => {
  $$(".tab").forEach(x => x.classList.remove("active"));
  t.classList.add("active"); curTab = t.dataset.tab; render();
});
$("#fab").onclick = () => curTab === "diaria" ? openDiariaModal(null) : openEntryModal(curTab, null);
$("#btnCancel").onclick = closeModal;
$("#modal").onclick = (e) => { if (e.target.id === "modal") closeModal(); };

// Configurações
$("#btnSettings").onclick = () => { $("#saldoInicial").value = DATA.saldoInicial || 0; showModal("#settingsModal"); };
$("#btnCloseSettings").onclick = () => {
  DATA.saldoInicial = parseFloat($("#saldoInicial").value) || 0; persist();
  $("#settingsModal").classList.add("hidden");
};
$("#settingsModal").onclick = (e) => { if (e.target.id === "settingsModal") $("#settingsModal").classList.add("hidden"); };
$("#btnExport").onclick = () => {
  const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `financas-${DATA.year}-backup.json`; a.click();
  toast("Backup exportado");
};
$("#btnImport").onclick = () => $("#importFile").click();
$("#importFile").onchange = (e) => {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => { try { DATA = JSON.parse(r.result); persist(); toast("Backup importado"); $("#settingsModal").classList.add("hidden"); }
    catch { toast("Arquivo inválido"); } };
  r.readAsText(file);
};
$("#btnReset").onclick = () => { if (confirm("Apagar tudo e voltar aos dados de exemplo?")) { DATA = resetData(); persist(); toast("Restaurado"); $("#settingsModal").classList.add("hidden"); } };

// Chart.js pode carregar depois do primeiro render
window.addEventListener("load", () => { if (curTab === "resumo") renderCharts(); });

// Service worker (offline)
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

render();
