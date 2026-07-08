# Finanças 2026 📊

App de controle financeiro pessoal (PWA) — feito a partir da planilha **"Finanças 2026 | Oficial"**.

Funciona no iPhone como aplicativo: abra o link no Safari → **Compartilhar** → **Adicionar à Tela de Início**. Roda em tela cheia, com ícone, e funciona offline.

## Telas
- **Resumo** — receitas, despesas, resultado do mês, saldo acumulado, gráficos (composição, receitas×despesas, evolução).
- **Receitas** — salários e rendas extras, com status Recebido/Programado.
- **Fixas** — despesas fixas (aluguel, carro, contas…).
- **Cartão** — fatura do Mercado Pago e compras (inclui parceladas).
- **Débito** — gastos do dia a dia.

## Lógica (igual à planilha)
- `Despesa Total = Fixas + Cartão + Débito`
- `Resultado do mês = Receitas − Despesa Total`
- `Saldo acumulado = saldo inicial + Σ resultados`

## Dados
Ficam salvos **no próprio aparelho** (localStorage). Use ⚙️ → **Exportar backup** para guardar um `.json`, e **Importar** para restaurar.

## Stack
HTML + CSS + JavaScript puro, sem build. Gráficos via Chart.js. Hospedado no GitHub Pages.
