/* ===== Finanças 2026 — Dados e Armazenamento =====
   Modelo espelha a planilha "Finanças 2026 | Oficial":
   - receitas (Ativa/Extra)        -> status: recebido | programado | vazio
   - fixas (Despesas Fixas)        -> status: pago | programado | vazio
   - cartao (Mercado Pago crédito) -> status: pago | programado | vazio
   - diaria (Débitos Dia a Dia)    -> lançamentos por dia
   Cada linha mensal guarda 12 valores (Jan..Dez) e 12 status.
*/

const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho",
               "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const MESES_CURTO = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

let _uid = 1;
const uid = () => "id" + (Date.now().toString(36)) + (_uid++);

// helpers de seed
function v12(val, only) {
  // only = índice (ou array de índices) onde aplica; senão todos os meses
  const a = Array(12).fill(0);
  if (only === undefined) return a.fill(val);
  (Array.isArray(only) ? only : [only]).forEach(i => a[i] = val);
  return a;
}
// status padrão: pago/recebido até maio (idx 4) onde há valor; futuro = programado
function st12(valArr, paidLabel) {
  return valArr.map((v, i) => v > 0 ? (i <= 4 ? paidLabel : "programado") : "vazio");
}
const R = (vals) => ({ vals, sts: st12(vals, "recebido") });
const P = (vals) => ({ vals, sts: st12(vals, "pago") });

// Dados de EXEMPLO (genéricos). Nenhuma informação pessoal aqui.
// Use ⚙️ → Importar para carregar seu backup, ou edite/exclua à vontade.
function buildSeed() {
  const cur = new Date().getMonth(); // mês atual como exemplo
  const receitas = [
    mkLine("Salário", "Ativa", 5, R(v12(5000))),
    mkLine("Renda extra", "Extra", null, R(v12(500, cur))),
  ];

  const fixas = [
    mkLine("Aluguel", "", 5, P(v12(1500))),
    mkLine("Energia", "", 10, P(v12(200))),
    mkLine("Internet", "", 15, P(v12(100))),
  ];

  const cartao = [
    mkLine("Streaming", "", null, P(v12(50))),
    mkLine("Compra parcelada (3x)", "", null, P(v12(150, [cur, cur + 1, cur + 2].filter(m => m < 12)))),
  ];

  const diaria = [
    dl("Mercado", cur, 180.00),
    dl("Transporte", cur, 35.00),
  ];

  return { year: 2026, saldoInicial: 0, receitas, fixas, cartao, diaria };
}

function mkLine(desc, tipo, dia, rec) {
  return { id: uid(), desc, tipo: tipo || "", dia: dia ?? null, vals: rec.vals, sts: rec.sts };
}
function dl(desc, mes, valor) { return { id: uid(), desc, mes, dia: null, valor }; }

/* ===== Persistência (localStorage) ===== */
const STORE_KEY = "financas2026.v1";

function loadData() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn("Falha ao ler dados, usando seed.", e); }
  const seed = buildSeed();
  saveData(seed);
  return seed;
}
function saveData(d) { localStorage.setItem(STORE_KEY, JSON.stringify(d)); }
function resetData() { const s = buildSeed(); saveData(s); return s; }
