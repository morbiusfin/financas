/* ===== Finanças 2026 — Dados e Armazenamento (v2) =====
   Modelo espelha a planilha "Finanças 2026 | Oficial":
   - receitas: tipo Ativa/Extra, dia, status recebido|programado|vazio
   - fixas:    vencimento (dia) + aviso (dias antes), meta (orçamento), status pago|programado|vazio
   - cartao:   parcela (atual/total), cartão (final), status pago|programado|vazio
   - diaria:   débitos dia a dia, com categoria
   - metas:    orçamento mensal por categoria
   Regras (fluxo de caixa):
   - Saldo inicial do mês = Sobra do mês anterior
   - Disponível = Saldo inicial + Receitas do mês
   - Sobra = Disponível − Despesa Total ; Despesa Total = Fixas + Cartão + Débito
*/

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_CURTO = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

let _uid = 1;
const uid = () => "id" + (Date.now().toString(36)) + (_uid++);

function v12(val, only) {
  const a = Array(12).fill(0);
  if (only === undefined) return a.fill(val);
  (Array.isArray(only) ? only : [only]).forEach(i => { if (i >= 0 && i < 12) a[i] = val; });
  return a;
}
function st12(valArr, paidLabel, paidUntil = 4) {
  return valArr.map((v, i) => v > 0 ? (i <= paidUntil ? paidLabel : "programado") : "vazio");
}
const R = (vals, paidUntil) => ({ vals, sts: st12(vals, "recebido", paidUntil) });
const P = (vals, paidUntil) => ({ vals, sts: st12(vals, "pago", paidUntil) });

/* ===== Seed de EXEMPLO (genérico, sem dados pessoais) =====
   Demonstra os recursos: vencimentos, parcelas, metas, Ativa/Extra. */
function buildSeed() {
  const cur = new Date().getFullYear() === 2026 ? new Date().getMonth() : 4;
  const hoje = new Date().getDate();
  const dProx = Math.min(31, hoje + 2), dHoje = Math.min(31, Math.max(1, hoje));
  // status "programado" (a vencer) no mês atual — para demonstrar o aviso de vencimento
  const PROG = (val) => { const v = v12(val, cur); return { vals: v, sts: v.map(x => x > 0 ? "programado" : "vazio") }; };
  const receitas = [
    rec("Salário", "Ativa", 5, R(v12(5000), cur)),
    rec("Vale benefícios", "Ativa", 20, R(v12(800), cur)),
    rec("Freela", "Extra", 25, R(v12(1200, cur), cur)),
  ];

  const fixas = [
    fix("Aluguel", 7, 3, 1500, P(v12(1500), cur)),
    fix("Energia", 10, 3, 250, P(v12(220), cur)),
    fix("Água", 12, 3, 120, P(v12(95), cur)),
    fix("Internet", 15, 2, 100, P(v12(100), cur)),
    fix("Celular", 20, 2, 60, P(v12(60), cur)),
    fix("Academia", 5, 2, 90, P(v12(90), cur)),
    fix("Fatura cartão (exemplo)", dHoje, 2, null, PROG(350)),
    fix("Seguro (exemplo)", dProx, 3, null, PROG(140)),
  ];

  const cartao = [
    crt("Streaming", "7034", null, null, P(v12(55), cur)),
    crt("Mercado (cartão)", "7034", null, null, P(v12(420), cur)),
    crt("Notebook", "1950", 3, 10, P(v12(250, [cur, cur + 1, cur + 2, cur + 3]), cur)),
    crt("Farmácia", "1950", null, null, P(v12(85, cur), cur)),
  ];

  const diaria = [
    dl("Mercado", cur, 8, 180.0, "Alimentação"),
    dl("Uber", cur, 9, 35.0, "Transporte"),
    dl("Padaria", cur, 10, 22.5, "Alimentação"),
    dl("Cafeteria", cur, 11, 18.0, "Lazer"),
  ];

  const metas = { fixas: 2200, cartao: 900, diaria: 500 };

  const cartoes = [
    { id: uid(), nome: "Mercado Pago", fechamento: 29, vencimento: 7 },
    { id: uid(), nome: "Nubank", fechamento: 3, vencimento: 10 },
  ];

  return { year: 2026, saldoInicial: 0, receitas, fixas, cartao, diaria, metas, cartoes };
}

function rec(desc, tipo, dia, r)            { return { id: uid(), desc, tipo, dia: dia ?? null, vals: r.vals, sts: r.sts }; }
function fix(desc, dia, aviso, meta, r)     { return { id: uid(), desc, dia: dia ?? null, aviso: aviso ?? null, meta: meta ?? null, vals: r.vals, sts: r.sts }; }
function crt(desc, cartao, pa, pt, r)       { return { id: uid(), desc, cartao: cartao || "", parcAtual: pa ?? null, parcTotal: pt ?? null, vals: r.vals, sts: r.sts }; }
function dl(desc, mes, dia, valor, cat)     { return { id: uid(), desc, mes, dia: dia ?? null, valor, categoria: cat || "Geral" }; }

/* ===== Persistência ===== */
const STORE_KEY = "financas2026.v2";

function migrate(d) {
  // garante campos novos em dados antigos
  d.metas = d.metas || { fixas: 0, cartao: 0, diaria: 0 };
  d.cartoes = d.cartoes || [];   // cartões cadastrados: { id, nome, fechamento, vencimento }
  (d.fixas || []).forEach(l => { if (l.aviso === undefined) l.aviso = null; if (l.meta === undefined) l.meta = null; if (l.nec === undefined) l.nec = false; });
  (d.cartao || []).forEach(l => { if (l.cartao === undefined) l.cartao = ""; if (l.parcAtual === undefined) l.parcAtual = null; if (l.parcTotal === undefined) l.parcTotal = null; if (l.nec === undefined) l.nec = false; });
  (d.diaria || []).forEach(l => { if (l.categoria === undefined) l.categoria = "Geral"; });
  (d.receitas || []).forEach(l => { if (l.tipo === undefined) l.tipo = "Ativa"; });
  return d;
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem("financas2026.v1");
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { console.warn("Falha ao ler dados, usando seed.", e); }
  const seed = buildSeed();
  saveData(seed);
  return seed;
}
/* Perfil ativo: "real" (STORE_KEY, pode ser cifrado) ou "test" (store SEPARADO, fictício, nunca cifrado).
   O teste NUNCA grava em STORE_KEY → impossível o teste apagar/sobrescrever os dados reais. */
const TEST_STORE_KEY = "financas2026.demo";
function profileKey() { return (localStorage.getItem("financas2026.profile") === "test") ? TEST_STORE_KEY : STORE_KEY; }
function saveData(d) {
  const key = profileKey(), isReal = (key === STORE_KEY);
  if (isReal && window.CRYPTO_KEY && window.encryptEnvelope) {
    // grava criptografado (AES-GCM). Sem o PIN, ilegível. (só nos dados REAIS)
    window.encryptEnvelope(window.CRYPTO_KEY, d).then(env => localStorage.setItem(key, JSON.stringify(env))).catch(() => {});
  } else {
    localStorage.setItem(key, JSON.stringify(d));
  }
}
function resetData() { const s = buildSeed(); saveData(s); return s; }
/* "Começar do zero" — estado vazio (NÃO mexe no resetData, que recria o exemplo) */
function emptyData() {
  const d = { year: 2026, saldoInicial: 0, receitas: [], fixas: [], cartao: [], diaria: [], metas: { fixas: 0, cartao: 0, diaria: 0 }, cartoes: [] };
  saveData(d); return d;
}
