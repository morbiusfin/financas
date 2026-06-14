/* ===== Finanças 2026 — App (v2) ===== */
let DATA = { year: 2026, saldoInicial: 0, receitas: [], fixas: [], cartao: [], diaria: [], metas: {} };
window.CRYPTO_KEY = null;
const APP_VERSION = "3.11.82";
const VERSION_NOTES = "🔔 'Contas a vencer' agora respeita o 'avisar X dias antes' de cada conta (não aparece antes da hora) · 💸 quebra das despesas (Fixas/Cartão/Débitos com %) dentro do fluxo, escondendo as zeradas";

/* ===== Changelog — últimas versões (mais recente primeiro) ===== */
const CHANGELOG = [
  {
    version: "3.11.82",
    bullets: [
      "Nova opção no menu: 'Atualizar o app' aparece sempre que houver versão nova — é só tocar pra instalar",
      "Atualização mais confiável: força o app a baixar tudo de novo (limpa o cache e troca a versão), resolvendo quando a atualização 'não subia' no celular",
    ]
  },
  {
    version: "3.11.81",
    bullets: [
      "Tela de código: assim que você digita o código certo, já entra sozinho — não precisa mais tocar em Entrar",
      "Tela de código: ao abrir o teclado, atrás dele agora aparece só o verde (o app não vaza mais por trás)",
      "Perfil: avatares prontos pra escolher (estilo Netflix) + importar a sua foto; quem não escolheu já ganha um avatar bonito por padrão",
      "Perfil: campo de data alinhado, janela com altura limitada (o ✕ pra fechar fica sempre visível)",
    ]
  },
  {
    version: "3.11.80",
    bullets: [
      "Conta conjunta agora é pela NUVEM: os dois celulares usam o mesmo cofre e funciona em qualquer rede (Wi-Fi ou dados) — não precisa mais estar na mesma rede nem com os dois abertos ao mesmo tempo",
      "Parear ficou simples: você compartilha 1 link (ou QR) e seu par entra na conta com um toque",
      "Sincronização à prova de perda: o que cada um lança é mesclado por item — ninguém sobrescreve o lançamento do outro",
      "Apagar de um lado apaga do outro também (sem ressuscitar itens)",
    ]
  },
  {
    version: "3.11.79",
    bullets: [
      "Na aba de débitos agora dá pra segurar o item pra apagar (toque longo → seleção → apagar), igual em Fixas e Cartões",
      "Dá pra apagar vários débitos de uma vez (Selecionar todos) — e o Ctrl+Z desfaz",
      "A aba 'Cartão' virou 'Cartões'",
    ]
  },
  {
    version: "3.11.78",
    bullets: [
      "Toda compra nova já vem com a data de HOJE preenchida (cartão e débito)",
      "Ao salvar uma compra marcada como hoje, ele pergunta 'foi feita hoje mesmo?' — se você clicar Não, volta pro editor pra ajustar a data antes de salvar",
      "A pergunta aparece só uma vez por lançamento (sem ficar repetindo)",
    ]
  },
  {
    version: "3.11.77",
    bullets: [
      "Valores em R$ agora se formatam sozinhos: digite só os números e ele monta 1.234,56 (milhar com ponto, vírgula só pros centavos) — nunca precisa digitar . ou ,",
      "Picker de emojis arrumado: as categorias não se sobrepõem mais e o nome da categoria fica alinhado à esquerda",
      "Notificações de contas a vencer alinhadas à esquerda (nome e detalhe não ficam mais centralizados torto)",
    ]
  },
  {
    version: "3.11.76",
    bullets: [
      "Contas a vencer passou a respeitar o 'avisar X dias antes' de cada conta — se você pôs 2 dias, ela só aparece a 2 dias do vencimento",
      "No fluxo do mês, abaixo de 'Despesas', agora tem a quebra: Fixas, Cartão e Débitos com % — some o que estiver zerado",
    ]
  },
  {
    version: "3.11.75",
    bullets: [
      "Tema claro: a lâmina de vidro do seletor e das abas ficou legível (verde sólido + texto branco em vez de translúcido apagado)",
      "Tema escuro mantém o vidro translúcido; e ao arrastar, a opção sob o vidro fica branca pra ler bem",
    ]
  },
  {
    version: "3.11.74",
    bullets: [
      "A bolinha de 'sincronizando' no cabeçalho parou de aparecer sozinha a cada poucos segundos",
      "Ela agora só aparece quando você sincroniza de propósito (a verificação automática de fundo é silenciosa)",
    ]
  },
  {
    version: "3.11.73",
    bullets: [
      "Seletor Resumo/Gráficos/Insights e a barra de abas com efeito 'lâmina de vidro' (iOS): o indicador desliza entre as opções",
      "Dá pra arrastar de uma opção pra outra e o vidro acompanha o dedo, soltando na mais próxima",
      "Ao soltar, o conteúdo entra com um esmaecer suave — sem piscar",
    ]
  },
  {
    version: "3.11.72",
    bullets: [
      "Novo 'Aviso de vencimento' no menu: defina quantos dias antes quer ser avisado e aplique a TODAS as contas de uma vez",
      "Cada conta fixa continua com seu próprio 'Avisar (dias antes)' na hora de editar",
    ]
  },
  {
    version: "3.11.71",
    bullets: [
      "Conta conjunta: novo guia '📖 Como sincronizar (passo a passo)' explicando exatamente o que cada um faz",
      "Inclui as regras de ouro (os dois com o app aberto, mesma Wi-Fi) e o que fazer se der erro",
      "Acessível no perfil (em Conjunta) e dentro da tela de parear",
    ]
  },
  {
    version: "3.11.70",
    bullets: [
      "Pareamento do casal: novo 'Convidar para instalar' que manda o link do app com o passo a passo (iPhone e Android)",
      "Aviso claro quando a conexão não fecha (ex.: 4G/5G) — orienta tentar no mesmo Wi-Fi e gerar convite novo",
      "Abrir pelo link de convite já entra no pareamento sozinho, sem o tutorial atrapalhar",
      "Campos do perfil (nome, data, tipo de conta) com rótulos alinhados",
    ]
  },
  {
    version: "3.11.69",
    bullets: [
      "Ícone da câmera na foto de perfil agora fica certinho no centro (virou um ícone desenhado, não mais emoji torto)",
      "Menu mais alinhado: cada ícone num quadradinho do mesmo tamanho, em coluna",
      "Ao abrir o menu, os itens entram em cascata e o ícone dá um pop",
    ]
  },
  {
    version: "3.11.68",
    bullets: [
      "Trocar entre Resumo, Gráficos e Insights ficou mais fluido: os blocos entram um a um (em cascata), não todos de uma vez",
      "A animação ficou um pouco mais lenta e suave, na direção da troca (avançar/voltar)",
    ]
  },
  {
    version: "3.11.67",
    bullets: [
      "Novo Tutorial passo a passo no menu (com botão de pular) e Perguntas frequentes (FAQ)",
      "Um “?” pequeno em cada parte do Resumo: toque e veja o que aquilo faz, feche na hora",
      "Foto de perfil: o ícone da câmera ficou maior, com anel e bem centralizado (não corta mais)",
      "Campo 'Aniversário' virou 'Data de nascimento'",
      "Painel de contas a vencer mais bonito: ícones centralizados e animação em cascata",
    ]
  },
  {
    version: "3.11.66",
    bullets: [
      "Novo 'Editar perfil' no menu: foto, nome e tipo de conta (Pessoal ou Conjunta)",
      "Conta Conjunta (casal): pareie os 2 celulares por QR ou código — a conexão é direta entre os aparelhos",
      "O que um lança aparece no outro em tempo real, sem passar pela nuvem",
    ]
  },
  {
    version: "3.11.65",
    bullets: [
      "Ao trocar entre Resumo, Gráficos e Insights, o conteúdo desliza com animação (o seletor fica parado em cima)",
      "Avançar (Resumo→Gráficos→Insights) entra pela direita; voltar entra pela esquerda",
    ]
  },
  {
    version: "3.11.64",
    bullets: [
      "Novo perfil no canto do cabeçalho: toque no avatar pra editar nome, data de aniversário e foto",
      "A foto abre um recorte circular — arraste pra posicionar e use o zoom; dá pra trocar quando quiser",
      "O sino agora abre um painel de notificações (área própria, não atropela a tela)",
      "Depois que você abre as notificações uma vez, o sino para de piscar (volta a avisar só quando surge algo novo)",
    ]
  },
  {
    version: "3.11.63",
    bullets: [
      "Novo sino de alertas no canto do cabeçalho: aparece balançando quando há conta a pagar (atrasada ou perto de vencer)",
      "Mostra a quantidade de contas — vermelho se tem atrasada/vence hoje, âmbar se são só as próximas",
      "Tocar no sino leva direto pra lista de Contas a vencer; quando não há nada a pagar, ele some",
    ]
  },
  {
    version: "3.11.62",
    bullets: [
      "A tela de Novidades passa a mostrar apenas as melhorias desta versão (não a lista de tudo que já mudou)",
    ]
  },
  {
    version: "3.11.61",
    bullets: [
      "Enquanto o app sincroniza com a nuvem, aparece uma bolinha girando no canto do cabeçalho",
      "Assim que termina de carregar, a bolinha some — só aparece em syncs que demoram (não pisca nas verificações rápidas)",
    ]
  },
  {
    version: "3.11.60",
    bullets: [
      "O carregamento da abertura virou um círculo girando (spinner), no lugar da barrinha",
      "O spinner some por completo ANTES de o app ser revelado — não encavala mais com a abertura",
    ]
  },
  {
    version: "3.11.59",
    bullets: [
      "Insights e Leitura do mês agora ficam numa opção no topo do Resumo (📋 Resumo · 📊 Gráficos · 💡 Insights), em azul",
      "O botão 💡 Insights pulsa pra chamar atenção até você abri-lo pela primeira vez",
      "O botão ✨ de 'atualização disponível' pulsa mais forte (anel de luz) pra você não perder",
      "O Resumo ficou mais limpo: os dois blocos saíram do meio e foram pro botão Insights",
    ]
  },
  {
    version: "3.11.58",
    bullets: [
      "Aviso de 'Contas a vencer': ao abrir, trava o fundo na hora — não dá mais pra rolar/puxar a tela por trás dele no celular",
      "Desbloqueio: o anel de progresso e o cadeado somem por completo ANTES de as portas abrirem (os efeitos não vazam mais pra cortina)",
    ]
  },
  {
    version: "3.11.57",
    bullets: [
      "Desbloqueio repaginado: anel de progresso que preenche (pré-carga real, ganha tempo pro app montar)",
      "O cadeado destrava com um estalo e um flash de luz verde, e a tela abre como duas portas",
      "A abertura normal também ganhou uma barrinha de carregamento no splash",
    ]
  },
  {
    version: "3.11.56",
    bullets: [
      "Ao entrar com o código, agora há um pré-carregamento ('Preparando…') — o app monta por trás e só aparece pronto (nada pisca/aparece pela metade)",
      "O aviso de 'Contas a vencer' só abre alguns segundos depois do app já estar na tela (não atropela mais a abertura)",
    ]
  },
  {
    version: "3.11.55",
    bullets: [
      "A faixa no rodapé que sobra em alguns iPhones é da área reservada do iOS quando o app não está em tela cheia",
      "O app agora detecta isso sozinho e mostra o passo a passo pra ativar a tela cheia (recriar o ícone na tela de início)",
      "Atualizar pelo ✨ não resolve esse caso — só recriar o ícone; o app explica como, sem risco (modo teste)",
    ]
  },
  {
    version: "3.11.54",
    bullets: [
      "Rodapé em tela cheia: a barra de baixo voltou a encostar na base e preenche a área do indicador — sem faixa clara/escura sobrando",
      "Funciona em qualquer tamanho de tela (iPhone e Android se adaptam às áreas seguras de cada um)",
      "Mantido o visual moderno: cantos arredondados no topo da barra e a aba ativa em destaque",
    ]
  },
  {
    version: "3.11.53",
    bullets: [
      "Caixinha 'Orçado × Realizado' redimensionável: Orçado e Realizado em duas colunas e o % centralizado abaixo — valores grandes não vazam mais a borda",
    ]
  },
  {
    version: "3.11.52",
    bullets: [
      "Rodapé em tela cheia: a área do indicador do iPhone fica preenchida com a cor do app (sem faixa)",
      "O conteúdo desaparece suavemente sob a barra de baixo (acabamento premium)",
      "Botões do topo (menu, novidades) maiores e mais fáceis de tocar",
    ]
  },
  {
    version: "3.11.51",
    bullets: [
      "Barra de navegação repaginada (inspirada nos apps top tipo 99): agora é flutuante, arredondada e descolada das bordas",
      "A aba em que você está fica destacada numa 'pílula' verde — fica claro onde você está",
      "Toque mais gostoso (a barra reage ao tocar) e tudo na zona de alcance do polegar",
    ]
  },
  {
    version: "3.11.50",
    bullets: [
      "Novo bloco 'Leitura do mês' no topo do Resumo: em linguagem simples, aponta o que mais pede atenção (contas atrasadas, vencimentos, cartão, débito ou receita)",
      "Estatística fácil: quanto você consegue cobrir das despesas e a chance (alta/média/baixa) de fechar o mês no positivo",
      "Sem repetir informação: tirei o insight 'Maior gasto' (já aparece na rosca e na leitura do mês)",
    ]
  },
  {
    version: "3.11.49",
    bullets: [
      "Porcentagens úteis pelo app: quanto cada aba (Fixas/Cartão/Débito) representa da receita do mês",
      "No resumo: % do disponível que virou despesa e % do que entrou que você guardou",
      "Previsto × Realizado e Orçamento (META) mostram o % concluído / usado",
      "Caixinha Orçado × Realizado mostra '% do orçamento' (verde dentro / vermelho estourou)",
      "Receitas mostram o % já recebido",
    ]
  },
  {
    version: "3.11.48",
    bullets: [
      "'Orçado / Realizado' agora é uma caixinha com espaçamento — não fica mais grudado na borda do card",
    ]
  },
  {
    version: "3.11.47",
    bullets: [
      "Simulador mais inteligente e claro: em vez de 'pior mês', diz quanto você ficaria devendo e EM QUE MÊS dá pra comprar (no mesmo parcelamento) ou em quantas vezes cabe já",
      "Texto secundário mais legível no tema claro (menos lavado)",
      "'Orçado / Realizado' alinhado com a margem do card, com um separador",
    ]
  },
  {
    version: "3.11.46",
    bullets: [
      "Faixa no rodapé (área do indicador do iPhone): o fundo do app, a base e um preenchedor passaram a usar exatamente a cor da barra de baixo — a faixa some",
    ]
  },
  {
    version: "3.11.45",
    bullets: [
      "Bug do celular: com uma janela aberta (ex.: Categorias), arrastar pra cima rola a lista — não dispara mais o 'puxar pra atualizar'",
      "Os campos de categoria não causam mais zoom ao tocar (iPhone)",
      "Pente fino nos gestos de toque: o 'puxar pra atualizar' agora respeita qualquer janela/menu aberto",
    ]
  },
  {
    version: "3.11.44",
    bullets: [
      "A tela não pisca mais ao mudar: incluir, editar, excluir e qualquer interação atualizam de forma estática e suave",
      "Os gráficos e o medidor não redesenham 'do zero' a cada ação — só mostram o novo valor",
      "A animação de entrada (cascata) acontece só na abertura do app",
    ]
  },
  {
    version: "3.11.43",
    bullets: [
      "Categorias e orçamento: o título e o ✕ ficam fixos no topo — dá pra fechar a qualquer momento",
      "Corrigido o scroll que travava ao descer (não voltava mais pra cima) em Categorias e no seletor de emoji",
      "Mesma proteção anti-travamento aplicada em todas as janelas",
    ]
  },
  {
    version: "3.11.42",
    bullets: [
      "A faixa no rodapé (área do indicador do iPhone) some: o fundo passou a combinar com a barra de baixo",
      "Na abertura essa faixa fica verde-escura (igual à tela inicial), não mais branca",
      "Barra de baixo com mais respiro — ícones e textos não colam mais na margem",
    ]
  },
  {
    version: "3.11.41",
    bullets: [
      "Seletor de emoji repaginado (estilo WhatsApp): 8 categorias no topo + mais de 1.300 emojis",
      "As categorias cabem na largura e a grade rola pra você escolher",
      "Corrigida a faixa que piscava no rodapé ao abrir o app",
    ]
  },
  {
    version: "3.11.40",
    bullets: [
      "Menu repaginado: os itens entram em sequência (animação suave) e com mais respiro",
      "O título 'Menu' não cola mais no topo (respeita a área do relógio)",
      "Botão do aviso de contas: 'OK, entendi' virou só 'OK'",
      "Passe de revisão: telas e modais conferidos, sem bugs",
    ]
  },
  {
    version: "3.11.39",
    bullets: [
      "Ao entrar com o código: o cadeado abre e a tela se divide no meio (animação)",
      "Tela de código ocupa a tela inteira — sem a faixa no rodapé",
      "Aviso de contas a vencer agora aparece no MEIO da tela (não mais embaixo)",
      "Gráfico de composição só mostra o que tem valor (sem fatia/legenda vazia)",
    ]
  },
  {
    version: "3.11.38",
    bullets: [
      "Categorias com emoji: 18 prontas + crie quantas quiser (menu ☰ → Categorias e orçamento)",
      "Escolha o emoji de cada categoria num seletor com vários grupos",
      "Meta de orçamento por categoria (R$/mês) — o total vira seu orçamento",
      "Novo gráfico Orçamento × Realizado por categoria (verde = dentro, vermelho = estourou)",
      "Escolha a categoria ao lançar em Fixas, Cartão e Débito",
    ]
  },
  {
    version: "3.11.37",
    bullets: [
      "Nova compra no cartão: escolha À vista ou Parcelado — parcelado abre a lista até 60×",
      "Uma data só (calendário, já marcando hoje) no lugar de dia + mês",
      "Cartão aparece pelos últimos 4 dígitos (•••• 1950) em vez de 'fecha 29'",
      "A fatura é calculada pelo fechamento do cartão (compra após o fechamento cai no mês seguinte)",
      "O fundo não rola mais por trás do modal aberto (compra, cartão, configurações)",
      "Segurar um item pra selecionar não pula mais pro topo da página",
      "Abertura sem piscar: tema certo de cara e sem flash na barra de baixo",
    ]
  },
  {
    version: "3.11.36",
    bullets: [
      "Abertura mais limpa: tirei a moeda — agora é só o nome MorbiusFin (com brilho suave)",
      "Splash mais rápido: ~2,2s em vez de 5s (o app abre antes)",
    ]
  },
  {
    version: "3.11.35",
    bullets: [
      "Header mais limpo: ⚙️ Configurações e 🔄 Sincronização saíram daqui (já estão no menu ☰)",
      "↩︎ Desfazer e ↪︎ Refazer só aparecem quando há uma ação pra desfazer/refazer",
      "A barra de meses agora fica fixa no topo ao rolar a página (em qualquer aba)",
      "Frase da abertura: 'suas finanças na palma da mão'",
    ]
  },
  {
    version: "3.11.34",
    bullets: [
      "Tirei aquele risco branco que ficava flutuando ao lado da moeda (o brilho 'escapava')",
      "Brilho da moeda agora é fixo e polido (reflexo no alto), preso ao círculo dela",
      "Acabamento geral mais bonito na abertura",
    ]
  },
  {
    version: "3.11.33",
    bullets: [
      "Moeda da abertura corrigida: estava aparecendo só como um anel oco no iPhone",
      "Agora ela gira como moeda de verdade (levemente inclinada) e mostra o ₿ nas duas faces",
      "O ₿ de trás não fica mais espelhado",
    ]
  },
  {
    version: "3.11.32",
    bullets: [
      "A aba Débito também entra em cascata (consistência com as outras abas)",
      "Painel de contas: fechamento mais ajustado e código limpo",
    ]
  },
  {
    version: "3.11.31",
    bullets: [
      "Os lançamentos agora aparecem 'se montando' — entram em cascata, suave (estilo app de banco)",
      "As caixas (lançamento, configurações, sincronizar) ganharam alça em cima e botão ✕ pra fechar",
      "O aviso de contas a vencer virou um painel que sobe de baixo (meia tela), com ✕ e toque fora pra fechar",
    ]
  },
  {
    version: "3.11.30",
    bullets: [
      "Correção importante: o modo teste mostrava seus dados reais (a nuvem baixava por trás)",
      "Agora o modo teste DESLIGA a sincronização e nasce sempre com dados fictícios limpos",
      "Seus dados reais nunca são baixados, enviados ou alterados no modo teste",
    ]
  },
  {
    version: "3.11.29",
    bullets: [
      "Conta e acesso (no menu ☰): proteja seus dados reais com PIN de 4 dígitos",
      "Backup automático baixado ANTES de ativar a senha",
      "Código 0000 abre o modo TESTE (dados fictícios, separados — nunca apagam os reais)",
      "Selo 'Modo teste' com botão pra voltar aos dados reais",
    ]
  },
  {
    version: "3.11.28",
    bullets: [
      "Menu ☰ no canto superior esquerdo reúne as opções num só lugar",
      "Atalhos: começar do zero, importar/exportar, sincronizar, simular gastos, conta",
      "Cabeçalho e barras mais limpos",
    ]
  },
  {
    version: "3.11.27",
    bullets: [
      "Tela de boas-vindas na 1ª abertura, deixando claro que os números iniciais são exemplo",
      "Escolha: começar do zero (app limpo) ou explorar com os exemplos",
      "Tour rápido de 3 passos (abas, botão +, backup) — pulável",
      "Banner 'dados de exemplo' com atalho pra começar do zero",
    ]
  },
  {
    version: "3.11.26",
    bullets: [
      "Segurança: corrigida injeção (XSS) no campo do cartão",
      "Acessibilidade: zoom de tela liberado (pinça)",
      "Botões do cabeçalho maiores e mais fáceis de tocar",
      "Indicação visível de foco ao navegar pelo teclado",
    ]
  },
  {
    version: "3.11.25",
    bullets: [
      "Modal de novidades no cabeçalho: ícone ✨ com badge pulsante aparece quando há atualização",
      "Substitui o banner grande intrusivo por um acesso discreto e elegante",
      "Changelog completo visível antes de aceitar a atualização",
      "Toast pequeno 'Atualizado para vX' no lugar do banner verde grande",
    ]
  },
  {
    version: "3.11.24",
    bullets: [
      "Barra de menu some completamente enquanto o teclado está aberto",
      "Correção: tabbar não subia mais ao rolar após fechar o teclado",
    ]
  },
  {
    version: "3.11.23",
    bullets: [
      "Seleção múltipla de lançamentos com apagar por mês",
      "Confirmar exclusão em lote via modal (sem prompt() nativo)",
    ]
  },
  {
    version: "3.11.22",
    bullets: [
      "Moeda Bitcoin 3D girando na tela de splash com reflexo e sombra dinâmica",
      "Borda animada de gradiente no card de saldo do Resumo",
    ]
  },
  {
    version: "3.11.21",
    bullets: [
      "Simulador 'vale a pena comprar?' integrado ao Resumo",
      "Impacto do lançamento calculado em tempo real no modal de edição",
    ]
  },
];
let history = [];
let redoStack = [];
let lastSnap = JSON.stringify(DATA);
const HISTORY_MAX = 50;
let curMonth = (new Date().getFullYear() === DATA.year) ? new Date().getMonth() : 4;
let annual = false;
let curTab = "resumo";
let resumoView = "resumo";   // "resumo" | "graficos" | "insights" (toggle no topo do Resumo)
let gSelMonth = 0;           // mês (0-11) selecionado nos gráficos interativos
let charts = {};

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const brl = (n) => (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/* ---------- Máscara de moeda (digita só números → 1.234,56 automático) ----------
   Milhar/milhão/bilhão com ponto; vírgula só pros centavos. Nunca precisa digitar . ou , */
const fmtMoneyBR = (n) => (Number(n) || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function moneyVal(elOrStr) {
  const s = (elOrStr && elOrStr.value !== undefined) ? elOrStr.value : (elOrStr || "");
  const d = String(s).replace(/\D/g, "");
  return d ? parseInt(d, 10) / 100 : 0;
}
function bindMoney(el) {
  if (!el || el._money) return; el._money = true;
  el.type = "text"; el.setAttribute("inputmode", "numeric"); el.setAttribute("autocomplete", "off");
  if (el.value != null && el.value !== "") {            // valor inicial vem cru (ex.: "1234.56") → formata
    const n = parseFloat(String(el.value).replace(",", "."));
    el.value = (!isNaN(n) && n !== 0) ? fmtMoneyBR(n) : "";
  }
  el.addEventListener("input", () => {
    const d = el.value.replace(/\D/g, "");
    el.value = d ? fmtMoneyBR(parseInt(d, 10) / 100) : "";
  });
}
function bindMoneyAll(scope) { $$(".money", scope || document).forEach(bindMoney); }

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
// SÓ as contas PERTO de vencer: respeita o "avisar X dias antes" de CADA conta (ou 7 dias, se não definiu) + atrasadas
function contasPerto(m) {
  if (!isMesAtual()) return [];
  return vencimentos(m).filter(v => {
    if (v.pago) return false;
    if (v.vencida) return true;                                   // atrasada = urgente, sempre mostra
    const janela = (v.aviso && v.aviso > 0) ? v.aviso : 7;        // ← respeita o aviso individual (ex.: 2 dias antes)
    return v.daysLeft >= 0 && v.daysLeft <= janela;
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
// frase curta de proximidade (sem valor)
function proxTxt(daysLeft) {
  if (daysLeft == null) return "";
  if (daysLeft < 0) return "está atrasada";
  if (daysLeft === 0) return "vence hoje";
  if (daysLeft === 1) return "vence amanhã";
  return "vence em " + daysLeft + " dias";
}
// a conta MAIS perto de vencer (atrasada primeiro, depois a de menos dias)
function contaMaisUrgente() {
  const arr = contasPerto(curMonth).slice().sort((a, b) => a.daysLeft - b.daysLeft);
  return arr[0] || null;
}
// guarda o NOME da conta mais próxima num Cache que o Service Worker lê no push diário
function cacheNextBill(nome) {
  if (!("caches" in window)) return;
  try { caches.open("fin-meta").then(c => c.put("/next-bill", new Response(JSON.stringify({ name: nome || "" })))); } catch (e) {}
}
function checkAndNotify() {
  if (!isMesAtual()) return;
  const conta = contaMaisUrgente();
  if (!conta) { cacheNextBill(""); return; }
  cacheNextBill(conta.desc);                                     // p/ o push diário (app fechado)
  // 1) AVISO DENTRO DO APP — pop-up no MEIO da tela, 5s DEPOIS do app abrir (deixa ver a tela primeiro;
  //    não interrompe se você já estiver com algo aberto)
  setTimeout(() => { if (!document.querySelector(".modal:not(.hidden)") && !document.getElementById("splash")) showBillAlert(conta); }, 5000);
  // 2) NOTIFICAÇÃO DO SISTEMA — título = nome do app, corpo = só o nome da conta
  if (("Notification" in window) && Notification.permission === "granted") {
    try { new Notification("MorbiusFin", { body: `${conta.desc} ${proxTxt(conta.daysLeft)}`, icon: "icons/icon-192.png", tag: "vencimentos" }); } catch (e) {}
  }
}
// Pop-up CENTRALIZADO — só a conta mais perto de vencer (nome + proximidade, sem valor)
function showBillAlert(conta) {
  const modal = $("#alertModal"); if (!modal) return;
  $("#alertTitle").textContent = "MorbiusFin";
  $("#alertBody").innerHTML = `<div class="alert-single">
      <div class="al-1st">Conta mais perto de vencer</div>
      <div class="al-desc">${esc(conta.desc)}</div>
      <div class="al-sub">dia ${conta.venc} ${vencBadgeHTML(conta.daysLeft)}</div>
    </div>`;
  try { lockScroll(); } catch (e) {}                       // trava o fundo NA HORA (popup aparece sozinho 5s depois; sem isso o iOS "pula"/rola a tela atrás)
  modal.classList.remove("hidden", "closing");
  modal.classList.add("center");                           // pop-up no MEIO da tela (não mais embaixo)
  $("#alertOk").onclick = closeBillAlert;
  $("#alertVer").onclick = () => { closeBillAlert(); focarVencimentos(); };
  const x = $("#alertClose"); if (x) x.onclick = closeBillAlert;
  modal.onclick = (e) => { if (e.target === modal) closeBillAlert(); };   // toque fora fecha
}
// fecha o pop-up com animação de saída (esvaece + encolhe)
function closeBillAlert() {
  const m = $("#alertModal"); if (!m) return;
  m.classList.add("closing");
  setTimeout(() => { m.classList.add("hidden"); m.classList.remove("closing"); }, 300);
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
let suppressNextAnim = false;       // (legado — mantido p/ não quebrar chamadas antigas; render é estático por padrão)
let forceAnimOnce = false;          // SÓ a 1ª carga (intro) anima; toda inclusão/edição/exclusão/sync/troca = estático e suave (sem piscar)
function render() {
  const maxM = yearsCount() * 12 - 1; if (curMonth > maxM) curMonth = maxM; if (curMonth < 0) curMonth = 0;
  // sai da seleção se mudou de aba ou de mês (a seleção é por aba+mês)
  if (selMode && (curTab !== selTab || curMonth !== selMonth)) { selMode = false; selected = new Set(); selTab = null; selMonth = -1; }
  const noAnim = !forceAnimOnce; forceAnimOnce = false; suppressNextAnim = false;   // estático por padrão → nada "pisca" na mudança
  window.__noAnim = noAnim;           // medidor e gráficos respeitam (sem count-up nem redesenho do zero)
  renderMonthBar();
  const ub = $("#btnUndo"); if (ub) { ub.style.display = history.length ? "" : "none"; }       // ↩︎ só aparece se há o que desfazer
  const rb = $("#btnRedo"); if (rb) { rb.style.display = redoStack.length ? "" : "none"; }      // ↪︎ só aparece se há o que refazer
  updateBell();                                                                                 // 🔔 alertas de contas no header
  $("#screenTitle").textContent = annual && curTab === "resumo" ? "Resumo " + (DATA.year + curYear()) : ({
    resumo: "Resumo", receitas: "Receitas", fixas: "Despesas Fixas",
    cartao: "Cartões", diaria: "Débitos do dia a dia"
  })[curTab];
  $("#fab").classList.toggle("hidden", curTab === "resumo" || selMode);   // sem + durante a seleção
  const view = $("#view");
  view.classList.toggle("no-anim", noAnim);
  // preserva a posição do scroll ao reconstruir a lista (senão entrar em seleção por toque-longo
  // — ou qualquer re-render — pula pro topo, porque innerHTML="" colapsa a altura).
  // Quem QUER ir pro topo (trocar aba/ano/visão) já faz window.scrollTo(0,0) ANTES, então prevY=0.
  // Se um modal travou o scroll (body fixed), o lock é quem manda → não mexe.
  const locked = document.body.classList.contains("scroll-locked");
  const prevY = locked ? null : (window.scrollY || window.pageYOffset || 0);
  view.innerHTML = "";
  if (curTab === "resumo") { if (annual) renderAnual(view); else renderResumo(view); }
  else renderLista(view);
  if (prevY != null && prevY > 0) window.scrollTo(0, prevY);   // restaura onde estava (a altura já está correta, render é síncrono)
  updateBulkBar();   // mostra/esconde a barra flutuante de apagar conforme a seleção
  if (typeof renderSeedBanner === "function") renderSeedBanner();   // banner "dados de exemplo" (modo Explorar)
  if (typeof syncTabGlass === "function") syncTabGlass(true);       // mantém a lâmina de vidro na aba ativa (desliza quando troca)
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
  return `<div class="section-card health fade-in"><h3>Saúde financeira — ${mLong(m)} ${helpQ("health")}</h3>
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

/* ---------- "Leitura do mês": narrativa local (sem IA externa) — prioriza o que pede atenção
   + 1 estatística simples (cobertura e chance de fechar no positivo). NÃO repete os Insights. ---------- */
function monthNarrative(m) {
  const rec = receitaMes(m), desp = despesaMes(m), disp = disponivelMes(m), sobra = disp - desp;
  const fx = fixasMes(m), ca = cartaoMes(m), di = diariaMes(m);
  const alertas = contasPerto(m);
  const atrasadas = alertas.filter(a => (a.daysLeft | 0) < 0);
  const venceHoje = alertas.filter(a => a.daysLeft === 0);
  const na = atrasadas.length, nh = venceHoje.length;
  let icon, atencao;
  if (na) { icon = "⚠️"; atencao = `O que pede atenção agora ${na > 1 ? "são" : "é"} <b>${na} conta${na > 1 ? "s" : ""} atrasada${na > 1 ? "s" : ""}</b> — quite ${na > 1 ? "essas" : "essa"} primeiro pra não virar bola de neve.`; }
  else if (nh) { icon = "🔔"; atencao = `<b>${nh} conta${nh > 1 ? "s" : ""} ${nh > 1 ? "vencem" : "vence"} hoje</b> — confira na lista abaixo pra não perder o prazo.`; }
  else if (sobra < 0) { icon = "🔴"; atencao = `Do jeito atual, <b>${mLong(m)} fecha no vermelho</b>. Vale segurar os gastos que não são essenciais.`; }
  else if (desp <= 0) { icon = "🌱"; atencao = `${mLong(m)} ainda está <b>sem despesas lançadas</b> — comece registrando o que já gastou.`; }
  else {
    const top = [["o cartão", ca], ["os débitos do dia a dia", di], ["as contas fixas", fx]].sort((a, b) => b[1] - a[1])[0];
    if (rec > 0 && sobra >= rec * 0.2) { icon = "✅"; atencao = `Mês sob controle. Quem mais pesa no bolso é <b>${top[0]}</b>, mas ainda sobra um bom tanto.`; }
    else { icon = "👀"; atencao = `Quem mais puxa seus gastos é <b>${top[0]}</b> — é por aí que dá pra economizar mais.`; }
  }
  let stat = "";
  if (desp > 0) {
    const cob = Math.round(disp / desp * 100);
    let chance, cor;
    if (sobra >= desp) { chance = "alta"; cor = "#0f9a4c"; }
    else if (sobra >= 0) { chance = "média"; cor = "#b9760a"; }
    else { chance = "baixa"; cor = "var(--red)"; }
    const mesNome = mLong(m).split(" ")[0];
    const cobTxt = cob >= 100
      ? `Você tem como pagar <b>todas</b> as despesas previstas do mês${sobra > 0 ? ", e ainda sobra" : ""}`
      : `Com o que está disponível, dá pra pagar <b>${cob}%</b> das despesas previstas`;
    stat = `${cobTxt}. Chance de fechar ${mesNome} no positivo: <b style="color:${cor}">${chance}</b>.`;
  }
  return { icon, atencao, stat };
}
function renderNarrative(m) {
  const n = monthNarrative(m);
  return `<div class="section-card ai-card fade-in">
    <div class="ai-badge">✨ Leitura do mês</div>
    <p class="ai-line"><span class="ai-ic">${n.icon}</span><span>${n.atencao}</span></p>
    ${n.stat ? `<p class="ai-stat"><span class="ai-ic">📊</span><span>${n.stat}</span></p>` : ""}
  </div>`;
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

// quebra das despesas do mês: Fixas / Cartão / Débitos, com % do total — esconde o que estiver zerado
function despBreakdownHTML(m, desp) {
  if (!(desp > 0)) return "";
  const parts = [
    { ic: "📌", nome: "Fixas", val: fixasMes(m) },
    { ic: "💳", nome: "Cartão", val: cartaoMes(m) },
    { ic: "🛒", nome: "Débitos", val: diariaMes(m) },
  ].filter(p => p.val > 0).sort((a, b) => b.val - a.val);
  if (!parts.length) return "";
  return `<div class="flow-breakdown">${parts.map(p =>
    `<div class="fb-row"><span class="fb-name">${p.ic} ${p.nome}</span><span class="fb-val">${brl(p.val)} <i>${Math.round(p.val / desp * 100)}%</i></span></div>`
  ).join("")}</div>`;
}
/* ---------- RESUMO (mês) ---------- */
function renderResumo(view) {
  const m = curMonth;
  const toggle = viewToggleHTML();
  const pane = rvPaneClass();
  if (resumoView === "graficos") {
    view.innerHTML = toggle + `<div class="rv-pane${pane}"><div id="gfxHost"></div></div>`;
    bindViewToggle();
    renderGraficos($("#gfxHost"));
    rvStaggerChildren();
    return;
  }
  if (resumoView === "insights") {                 // 💡 Leitura do mês + Insights juntos (opção do topo)
    const ins = renderInsights(m);
    view.innerHTML = toggle + `<div class="rv-pane${pane}">` + renderNarrative(m) + (ins ||
      `<div class="section-card fade-in"><h3>💡 Insights</h3><div class="insights">
        <div class="insight"><span class="ic">🌱</span><span>Lance algumas receitas e despesas do mês pra eu gerar os insights.</span></div>
      </div></div>`) + `</div>`;
    bindViewToggle();
    rvStaggerChildren();
    return;
  }
  const rec = receitaMes(m), desp = despesaMes(m);
  const sIni = saldoInicialMes(m), disp = disponivelMes(m), sobra = disp - desp;
  const alertas = contasPerto(m);

  const totalVenc = alertas.reduce((s, v) => s + (Number(v.val) || 0), 0);
  view.innerHTML = toggle + `<div class="rv-pane${pane}">
    ${alertas.length ? `<div class="section-card venc-card fade-in" id="vencCard">
      <div class="venc-head">
        <span class="venc-bell">🔔</span>
        <div class="venc-htxt"><div class="venc-title">Contas a vencer ${helpQ("venc")}</div>
          <div class="venc-meta">${alertas.length} conta(s) · total <b>${brl(totalVenc)}</b></div></div>
      </div>
      <div id="vencList"></div>
    </div>` : ""}

    ${renderHealth(m)}

    <div class="flow-card fade-in">
      <div class="flow-row"><span>Saldo inicial <i>(sobrou do mês anterior)</i></span><b>${brl(sIni)}</b></div>
      <div class="flow-row plus"><span>+ Receitas</span><b class="pos">${brl(rec)}</b></div>
      <div class="flow-row eq"><span>= Disponível</span><b>${brl(disp)}</b></div>
      <div class="flow-row minus"><span>− Despesas ${disp > 0 ? `<i>(${Math.round(desp / disp * 100)}% do disponível)</i>` : ""}</span><b class="neg">${brl(desp)}</b></div>
      ${despBreakdownHTML(m, desp)}
      <div class="flow-row total"><span>= Sobra do mês ${rec > 0 ? `<i>(guardou ${Math.round((rec - desp) / rec * 100)}% do que entrou no mês)</i>` : ""}</span><b id="sobraVal" class="countup ${sobra >= 0 ? "pos" : "neg"}" data-amt="${sobra}">${brl(sobra)}</b></div>
    </div>

    <div class="section-card"><h3>Previsto × Realizado — ${mLong(m)} ${helpQ("prevreal")}</h3>
      ${barPrevReal("Receitas", recebido(m), aReceber(m), "recebido", "a receber")}
      ${barPrevReal("Despesas", pago(m), aPagar(m), "pago", "a pagar")}
    </div>

    <div class="section-card"><h3>Composição das despesas ${helpQ("comp")}</h3>
      <div class="chart-wrap"><canvas id="doughChart" height="170"></canvas></div>
      <div id="catList"></div></div>

    ${renderMetas(m)}

    <div class="section-card"><h3>Receitas × Despesas (ano)</h3>
      <div class="chart-wrap"><canvas id="barChart" height="190"></canvas></div></div>

    <div class="section-card"><h3>Projeção do saldo (ano) <i class="h3-sub">— realizado + provisão dos próximos meses</i></h3>
      <div class="chart-wrap"><canvas id="lineChart" height="180"></canvas></div></div>
  </div>`;
  if (alertas.length) renderVencList();
  renderCatList(m);
  renderCharts();
  animateResumo();
  bindViewToggle();
  rvStaggerChildren();
  const gv = $("#goVenc"); if (gv) gv.onclick = () => focarVencimentos();
}

// Rola até os vencimentos E pisca um destaque em volta (mostra qual focar).
// 🔔 Sino de notificações no header: balança/pulsa quando há conta a pagar (atrasada ou perto de vencer).
//    Vermelho = tem atrasada/vence hoje; âmbar = só próximas. Some quando não há nada a pagar.
//    Depois que o usuário ABRE as notificações uma vez, para de piscar (.seen) — até surgir algo novo.
const NOTIF_SEEN_KEY = "financas2026.notifSeen";
function notifSignature() { return contasPerto(curMonth).map(a => a.id + ":" + a.daysLeft).join("|"); }
function updateBell() {
  const b = document.getElementById("btnBell"); if (!b) return;
  const alertas = contasPerto(curMonth);
  const n = alertas.length;
  if (!n) { b.classList.add("hidden"); return; }
  const urgente = alertas.some(a => (a.daysLeft | 0) <= 0);   // atrasada ou vence hoje
  b.classList.toggle("warn", !urgente);                       // .warn = só próximas (âmbar)
  const visto = localStorage.getItem(NOTIF_SEEN_KEY) === notifSignature();
  b.classList.toggle("seen", visto);                          // .seen = não pisca mais (mas continua mostrando a contagem)
  const badge = b.querySelector(".bell-badge"); if (badge) badge.textContent = n > 9 ? "9+" : String(n);
  b.title = `${n} conta${n > 1 ? "s" : ""} a pagar`;
  b.classList.remove("hidden");
}
// Tocar no sino → ABRE o painel de notificações (área própria, não atropela o app) e marca como visto
function abrirAlertas() {
  if (DATA.year === REAL_TODAY.getFullYear()) curMonth = REAL_TODAY.getMonth();   // garante o mês atual (onde estão os alertas)
  try { localStorage.setItem(NOTIF_SEEN_KEY, notifSignature()); } catch (e) {}    // viu → para de piscar
  renderNotifPanel();
  const m = $("#notifModal"); if (m) m.classList.remove("hidden");
  updateBell();
}
function closeNotif() { const m = $("#notifModal"); if (m) m.classList.add("hidden"); }
function renderNotifPanel() {
  const body = $("#notifBody"); if (!body) return;
  const al = contasPerto(curMonth).slice().sort((a, b) => a.daysLeft - b.daysLeft);
  $("#notifTitle").textContent = al.length ? "Contas a vencer" : "Notificações";
  const ver = $("#notifVer"); if (ver) ver.style.display = al.length ? "" : "none";
  if (!al.length) { body.innerHTML = `<div class="notif-empty"><div class="ne-ic">🎉</div><p>Tudo em dia!<br><span>Nenhuma conta a pagar agora.</span></p></div>`; return; }
  body.innerHTML = al.map((v, i) => {
    const cls = vencBadge(v.daysLeft).cls;
    const u = (cls === "atras" || cls === "d0") ? "u-red" : (cls === "d1" || cls === "d3") ? "u-amber" : "u-green";
    const ic = cls === "atras" ? "⚠️" : cls === "d0" ? "🔔" : "💸";
    return `<div class="notif-row ${u}" style="--i:${i}">
      <span class="nr-ic">${ic}</span>
      <div class="nr-main"><div class="nr-name">${esc(v.desc)}</div><div class="nr-sub">dia ${v.venc} ${vencBadgeHTML(v.daysLeft)} · ${brl(v.val)}</div></div>
      <button class="vr-pay" data-pay="${v.id}">Pagar</button>
    </div>`;
  }).join("");
  $$("[data-pay]", body).forEach(b => b.onclick = () => {
    const l = DATA.fixas.find(x => x.id === b.dataset.pay);
    if (l) { l.sts[curMonth] = "pago"; suppressNextAnim = true; persist(); toast("Pago ✅"); }   // persist() já re-renderiza + atualiza o sino
    try { localStorage.setItem(NOTIF_SEEN_KEY, notifSignature()); } catch (e) {}   // painel aberto = visto; não volta a piscar
    renderNotifPanel(); updateBell();
    if (!contasPerto(curMonth).length) closeNotif();
  });
}
// "Ver na lista" → fecha o painel e leva pro card de Contas a vencer no Resumo
function verNaLista() {
  closeNotif();
  annual = false; curTab = "resumo"; resumoView = "resumo";
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.tab === "resumo"));
  suppressNextAnim = true; window.scrollTo(0, 0); render();
  setTimeout(focarVencimentos, 80);
}
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
  const comoPaga = n > 1 ? `em <b>${n}× de ${brl(parcela)}</b>` : "<b>à vista</b>";
  const comoMant = n > 1 ? `em ${n}× de ${brl(parcela)}` : "à vista";
  let cls, icon, head, extra = "";
  if (mn < 0) {
    cls = "bad"; icon = "⛔";
    // "mês mais apertado" explicado; déficit como valor POSITIVO ("ficaria devendo")
    head = `Comprando <b>agora</b> ${comoPaga}, em algum mês você <b>ficaria no vermelho</b> em <b>${brl(Math.abs(mn))}</b> — o mês mais apertado seria <b>${mLong(idx)}</b>.`;
    const e = earliestFeasibleMonth(total, n), sug = suggestParcelas(total), parts = [];
    if (e !== null && e > m) parts.push(`📅 <b>Quando dá pra comprar:</b> a partir de <b>${mLong(e)}</b>, ${comoMant} — aí cabe sem ficar no vermelho.`);
    if (sug !== null && sug > n) parts.push(`💳 <b>Pra comprar já em ${mLong(m)}:</b> parcele em <b>${sug}× de ${brl(total / sug)}</b>.`);
    if (!parts.length) parts.push(`Mesmo parcelando bastante não cabe nos próximos 3 anos — o valor é alto demais pro seu fluxo. Vale reduzir.`);
    extra = parts.join("<br>");
  } else if (mn < comfort) {
    cls = "warn"; icon = "🟡";
    head = `<b>Dá pra comprar agora</b> ${comoPaga}, mas fica apertado: depois de pagar, no mês mais apertado (<b>${mLong(idx)}</b>) sobra só <b>${brl(mn)}</b>.`;
    const sug = suggestParcelas(total);
    if (sug !== null && sug > n) extra = `💳 Pra ficar tranquilo, parcele em <b>${sug}× de ${brl(total / sug)}</b>.`;
  } else {
    cls = "good"; icon = "✅";
    head = `<b>Pode comprar agora</b> ${comoPaga}. Depois de pagar, no mês mais apertado (<b>${mLong(idx)}</b>) ainda sobra <b>${brl(mn)}</b>.`;
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
  const gn = $("#gaugeNum"), sv = $("#sobraVal"), ga = $("#gArc");
  const estatico = window.__noAnim || (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches);
  if (estatico) {   // atualização SUAVE e estática: já mostra o valor final, sem count-up nem redesenho
    if (gn) gn.textContent = String(Math.round(parseFloat(gn.dataset.amt) || 0));
    if (sv) sv.textContent = brl(parseFloat(sv.dataset.amt) || 0);
    if (ga && ga.dataset.off != null) ga.style.strokeDashoffset = ga.dataset.off;
    return;
  }
  if (gn) animateNumber(gn, parseFloat(gn.dataset.amt) || 0, v => String(Math.round(v)), 750);
  if (sv) animateNumber(sv, parseFloat(sv.dataset.amt) || 0, v => brl(v), 750);
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
    <div class="pr-head"><span>${label}</span><span>${brl(real)} <i>de ${brl(tot)} · ${pct}%</i></span></div>
    <div class="pr-bar"><div class="pr-fill" style="width:${pct}%"></div></div>
    <div class="pr-legend"><span>✅ ${lblReal}: ${brl(real)} (${pct}%)</span><span>⏳ ${lblPrev}: ${brl(prev)} (${100 - pct}%)</span></div>
  </div>`;
}

function renderVencList() {
  const el = $("#vencList"); if (!el) return;
  const vs = contasPerto(curMonth);
  el.innerHTML = vs.map(v => {
    const cls = vencBadge(v.daysLeft).cls;
    const u = (cls === "atras" || cls === "d0") ? "u-red" : (cls === "d1" || cls === "d3") ? "u-amber" : "u-green";
    return `<div class="venc-row ${u}">
      <div class="vr-main"><div class="vr-name">${esc(v.desc)}</div><div class="vr-sub">dia ${v.venc} ${vencBadgeHTML(v.daysLeft)}</div></div>
      <span class="vr-amt">${brl(v.val)}</span>
      <button class="vr-pay" data-pay="${v.id}">Pagar</button>
    </div>`;
  }).join("");
  // Pagar: a linha esvaece e a lista encolhe (≤ ~0,7s) antes de salvar
  $$("[data-pay]", el).forEach(b => b.onclick = () => {
    const id = b.dataset.pay, row = b.closest(".venc-row");
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
  return `<div class="section-card"><h3>Orçamento do mês (META) ${helpQ("metas")}</h3>${itens.map(i => {
    const meta = metas[i.k], rawPct = Math.round(i.val / meta * 100), pct = Math.min(100, rawPct), over = i.val > meta;
    return `<div class="pr-block">
      <div class="pr-head"><span>${i.name}</span><span class="${over ? "neg" : ""}">${brl(i.val)} <i>/ ${brl(meta)} · ${rawPct}%</i></span></div>
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
  // estático por padrão (sem "piscar"/redesenho do zero); só a 1ª carga anima
  Chart.defaults.animation = window.__noAnim ? false : { duration: 650, easing: "easeOutQuart" };
}
function renderCharts() {
  if (typeof Chart === "undefined") return;
  applyChartTheme();
  ["dough", "bar", "line"].forEach(k => { if (charts[k]) charts[k].destroy(); });
  const m = curMonth;
  const dough = $("#doughChart");
  if (dough) {
    // só entram no gráfico (e na legenda) as fatias COM valor > 0
    const parts = [
      { name: "Despesas Fixas", val: fixasMes(m), color: "#0b3d2e" },
      { name: "Cartão Mercado Pago", val: cartaoMes(m), color: "#15c266" },
      { name: "Débitos Dia a Dia", val: diariaMes(m), color: "#f5a623" },
    ].filter(p => p.val > 0);
    const tc = parts.reduce((s, p) => s + p.val, 0);
    charts.dough = new Chart(dough, { type: "doughnut",
      data: { labels: tc ? parts.map(p => p.name) : ["Sem despesas"],
        datasets: [{ data: tc ? parts.map(p => p.val) : [1], backgroundColor: tc ? parts.map(p => p.color) : ["#2a3a33"],
          borderWidth: 0, borderRadius: tc ? 14 : 0, spacing: tc ? 3 : 0, hoverOffset: 7 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "72%", layout: { padding: 6 },
        plugins: { legend: { display: tc > 0, position: "bottom", labels: { boxWidth: 12, usePointStyle: true, pointStyle: "circle", font: { size: 11 }, padding: 14 } },
          tooltip: { enabled: tc > 0, callbacks: { label: c => `${c.label}: ${brl(c.raw)} (${tc ? (c.raw / tc * 100).toFixed(1) : 0}%)` } } } } });
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
  const insSeen = localStorage.getItem("financas2026.insSeen") === "1";
  const pulse = (!insSeen && resumoView !== "insights") ? " pulse" : "";   // pulsa (azul) até abrir a 1ª vez → "de atenção"
  return `<div class="view-toggle">
    <button type="button" class="vt-btn ${resumoView === "resumo" ? "active" : ""}" data-rv="resumo">📋 Resumo</button>
    <button type="button" class="vt-btn ${resumoView === "graficos" ? "active" : ""}" data-rv="graficos">📊 Gráficos</button>
    <button type="button" class="vt-btn vt-ins${pulse} ${resumoView === "insights" ? "active" : ""}" data-rv="insights">💡 Insights</button>
  </div>`;
}
const RV_ORDER = { resumo: 0, graficos: 1, insights: 2 };
let _rvSlide = null;   // (legado) — a troca agora usa "esmaecer" (fadeView), não cascata

/* ===== "Lâmina de vidro" (iOS): um indicador de vidro desliza entre as opções e acompanha o arraste =====
   Opções têm largura igual (flex:1) → o vidro só translada. Persistente na tabbar (estática) e, no toggle
   (reconstruído a cada render), recriado mas animando da posição anterior → desliza igual. Sem piscar. */
const _glassPrev = {};   // key -> {x, ty, w, h}
function ensureGlass(container) {
  let g = container.querySelector(":scope > .seg-glass");
  if (!g) { g = document.createElement("div"); g.className = "seg-glass noanim"; container.insertBefore(g, container.firstChild); }
  return g;
}
function placeGlassTo(container, el, animate, key) {
  if (!container || !el) return;
  const g = ensureGlass(container);
  const cr = container.getBoundingClientRect(), er = el.getBoundingClientRect();
  if (!er.width) { setTimeout(() => placeGlassTo(container, el, animate, key), 30); return; }   // ainda sem layout → tenta de novo (setTimeout não depende de rAF)
  const t = { x: er.left - cr.left, ty: er.top - cr.top, w: er.width, h: er.height };
  const prev = key ? _glassPrev[key] : null;
  // 1) define o estado FINAL na hora (sempre correto, não depende de rAF) → nunca fica preso
  g.style.width = t.w + "px"; g.style.height = t.h + "px"; g.style.transform = `translate(${t.x}px, ${t.ty}px)`;
  g.classList.toggle("glass-ins", el.classList.contains("vt-ins"));   // azul na opção Insights
  // 2) se mudou de opção, toca o slide de prev→alvo (one-shot via WAAPI — robusto)
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && prev && g.animate && !reduce && (Math.abs(prev.x - t.x) > 1 || Math.abs((prev.w || t.w) - t.w) > 1)) {
    try {
      g.animate(
        [{ transform: `translate(${prev.x}px, ${prev.ty}px)`, width: (prev.w || t.w) + "px" },
         { transform: `translate(${t.x}px, ${t.ty}px)`, width: t.w + "px" }],
        { duration: 440, easing: "cubic-bezier(.34,1.3,.38,1)" }
      );
    } catch (e) {}
  }
  if (key) _glassPrev[key] = t;
}
function bindGlassDrag(container, optSel, commit, key) {
  if (!container || container.dataset.glassBound) return; container.dataset.glassBound = "1";
  const g = ensureGlass(container);
  const opts = () => Array.prototype.slice.call(container.querySelectorAll(optSel));
  const nearest = (x) => { let best = null, bd = Infinity; opts().forEach(o => { const r = o.getBoundingClientRect(); const d = Math.abs(x - (r.left + r.width / 2)); if (d < bd) { bd = d; best = o; } }); return best; };
  let dragging = false, moved = false, w = 0, sx = 0;
  container.addEventListener("pointerdown", (e) => {
    if (!e.target.closest(optSel)) return;
    dragging = true; moved = false; sx = e.clientX;
    const gr = g.getBoundingClientRect(); w = gr.width || (opts()[0] ? opts()[0].getBoundingClientRect().width : 0);
    g.classList.add("dragging");
    try { container.setPointerCapture(e.pointerId); } catch (er) {}
  });
  container.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    if (Math.abs(e.clientX - sx) > 4) moved = true;
    const cr = container.getBoundingClientRect();
    let x = e.clientX - cr.left - w / 2; x = Math.max(0, Math.min(cr.width - w, x));
    const prev = key ? _glassPrev[key] : null, ty = prev ? prev.ty : 0, h = prev ? prev.h : g.getBoundingClientRect().height;
    g.style.transform = `translate(${x}px, ${ty}px)`;
    if (key) _glassPrev[key] = { x: x, ty: ty, w: w, h: h };   // guarda onde o dedo está (p/ o slide de settle sair daqui)
    const n = nearest(e.clientX); opts().forEach(o => o.classList.toggle("glass-near", o === n));
  });
  const end = (e) => {
    if (!dragging) return; dragging = false; g.classList.remove("dragging");
    opts().forEach(o => o.classList.remove("glass-near"));
    if (moved) {
      const blk = (ev) => { ev.stopPropagation(); ev.preventDefault(); };   // mata o clique "fantasma" pós-arraste
      container.addEventListener("click", blk, { capture: true, once: true });
      setTimeout(() => { try { container.removeEventListener("click", blk, { capture: true }); } catch (er) {} }, 80);
      const n = nearest(e.clientX != null ? e.clientX : sx); if (n) commit(n);
    }
  };
  container.addEventListener("pointerup", end);
  container.addEventListener("pointercancel", end);
}
// "esmaecer": traz o conteúdo novo com um fade suave, sem piscar
function fadeView() {
  const v = $("#view"); if (!v || !v.animate) return;
  if (window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  try { v.animate([{ opacity: 0.001 }, { opacity: 1 }], { duration: 300, easing: "cubic-bezier(.2,.7,.2,1)" }); } catch (e) {}
}
function bindViewToggle() {
  const toggle = $(".view-toggle"); if (!toggle) return;
  const commit = (b) => {
    if (b.dataset.rv === "insights") localStorage.setItem("financas2026.insSeen", "1");
    if (resumoView === b.dataset.rv) { placeGlassTo(toggle, b, true, "vt"); return; }   // mesma → só ajeita o vidro
    resumoView = b.dataset.rv; suppressNextAnim = true; window.scrollTo(0, 0); render(); fadeView();   // render reconstrói o toggle → o vidro novo desliza de prev→ativo
  };
  $$(".vt-btn", toggle).forEach(b => b.onclick = () => commit(b));
  bindGlassDrag(toggle, ".vt-btn", commit, "vt");
  placeGlassTo(toggle, toggle.querySelector(".vt-btn.active") || toggle.querySelector(".vt-btn"), true, "vt");
}
// barra de abas (estática): mantém o vidro na aba ativa, deslizando quando troca
function syncTabGlass(animate) {
  const bar = $(".tabbar"); if (!bar) return;
  placeGlassTo(bar, bar.querySelector(".tab.active") || bar.querySelector(".tab"), animate !== false, "tab");
}
function commitTab(t) {
  const bar = $(".tabbar");
  if (curTab === t.dataset.tab && !annual) { placeGlassTo(bar, t, true, "tab"); return; }
  $$(".tab", bar).forEach(x => x.classList.remove("active")); t.classList.add("active");
  curTab = t.dataset.tab; if (curTab !== "resumo") annual = false;
  suppressNextAnim = true; window.scrollTo(0, 0); render(); fadeView();   // render chama syncTabGlass → vidro desliza
}
// classe de cascata pro painel (consome o _rvSlide uma vez)
function rvPaneClass() {
  const c = _rvSlide === "fwd" ? " rv-stg-right" : _rvSlide === "back" ? " rv-stg-left" : "";
  _rvSlide = null;
  return c;
}
// cascata: marca cada bloco do painel com a direção + um índice (atraso) p/ entrarem um a um
function rvStaggerChildren() {
  const p = document.querySelector("#view > .rv-pane"); if (!p) return;
  const dir = p.classList.contains("rv-stg-right") ? "right" : p.classList.contains("rv-stg-left") ? "left" : null;
  if (!dir) return;
  let blocks = Array.prototype.slice.call(p.children);
  if (blocks.length === 1 && blocks[0].id === "gfxHost") blocks = Array.prototype.slice.call(blocks[0].children);  // nos Gráficos, anima os cards de dentro
  blocks.forEach((el, i) => { el.classList.add("rv-stg-item", "dir-" + dir); el.style.setProperty("--i", i); });
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
      <h3>🎯 Orçamento × Realizado — ${mLong(curMonth)}</h3>
      <p class="hint" style="text-align:left;margin:-2px 0 8px">Defina as metas no menu ☰ → <b>Categorias e orçamento</b>. Verde = dentro da meta, vermelho = estourou.</p>
      <div id="orcWrap" class="chart-wrap"></div>
      <div class="g-detail" id="orcResumo"></div>
    </div>
    <div class="section-card g-card fade-in">
      <h3>💰 Saldo acumulado por mês — ${ano}</h3>
      <p class="hint" style="text-align:left;margin:-2px 0 8px">Simule uma compra aqui que a linha aparece <b>em cima do gráfico</b> — fica preciso se dá pra comprar.</p>
      <div class="g-sim">
        <div class="field-row">
          <label class="field" style="margin:0;flex:2"><span>🧪 Quero gastar (R$)</span><input id="gSimInput" class="money" placeholder="0,00" /></label>
          <label class="field" style="margin:0;flex:1"><span>Parcelas</span><select id="gSimN" class="sel">${Array.from({ length: 60 }, (_, i) => `<option value="${i + 1}"${i === 0 ? " selected" : ""}>${i + 1}×</option>`).join("")}</select></label>
          <button type="button" id="gSimClear" class="sim-clear" title="Limpar">↺</button>
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
  renderOrcRealChart(curMonth);
  bindGSim();
  const il = $("#insSaldo"); if (il) il.innerHTML = insightsSaldo();
  const id2 = $("#insDesp"); if (id2) id2.innerHTML = insightsDespesas();
  const ir = $("#insRec"); if (ir) ir.innerHTML = insightsReceitas();
  drillSaldo(gSelMonth); drillDesp(gSelMonth); drillRec(gSelMonth);
}

function renderGCharts() {
  if (typeof Chart === "undefined") return;
  applyChartTheme();
  ["gSaldo", "gDesp", "gRec", "dough", "bar", "line", "sim", "sobra", "orc"].forEach(k => { if (charts[k]) { try { charts[k].destroy(); } catch (e) {} charts[k] = null; } });
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
  bindMoney(inp);
  inp.value = simBuy ? fmtMoneyBR(simBuy) : ""; if (inpN) inpN.value = simN || 1;
  const upd = () => { simBuy = moneyVal(inp); simN = Math.max(1, parseInt(inpN && inpN.value) || 1); updateGSim(); };
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
  const TOP = 5, medal = ["🥇", "🥈", "🥉"];
  const rows = items.map((it, i) => `
    <div class="det-row" style="animation-delay:${(Math.min(i, TOP) * 0.05).toFixed(2)}s">
      <span class="det-rank${i < 3 ? " top" + (i + 1) : ""}">${i < 3 ? medal[i] : i + 1}</span>
      <div class="det-main"><div class="det-name">${esc(it.desc || "—")}${it.nec ? ` <span class="det-nec">✓</span>` : ""}</div>
        <div class="det-bar"><div class="det-fill" style="width:${Math.round(it.val / max * 100)}%;background:${color}"></div></div></div>
      <div class="det-val">${brl(it.val)}<span class="det-cat">${esc(it.cat)}</span></div>
    </div>`).join("");
  const more = items.length - TOP;
  const head = `<div class="det-head">${esc(title)} <b>${brl(tot)}</b></div>`;
  const hint = more > 0 ? `<div class="det-more-hint"><span>🏆 Top ${TOP}</span><em>role para ver +${more}</em></div>` : "";
  const scrollable = items.length > TOP ? " scrollable" : "";
  return head + hint + `<div class="det-scroll-wrap${scrollable}"><div class="det-scroll">${rows}</div></div>` + (sub || "");
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
/* ---------- Ordenação das listas (Data / Valor / A→Z / Necessário) ---------- */
let listSort = { receitas: "valor", fixas: "valor", cartao: "valor", diaria: "valor" };
// ordena um array de { ...itens } usando extratores (val, dia, desc, nec)
function sortRows(arr, mode, get) {
  const byVal = (a, b) => get.val(b) - get.val(a);
  const byDia = (a, b) => ((get.dia(a) || 99) - (get.dia(b) || 99)) || byVal(a, b);
  const byAlpha = (a, b) => String(get.desc(a) || "").localeCompare(String(get.desc(b) || ""), "pt", { sensitivity: "base" });
  const byNec = (a, b) => ((get.nec(b) ? 1 : 0) - (get.nec(a) ? 1 : 0)) || byVal(a, b);
  const f = mode === "data" ? byDia : mode === "alpha" ? byAlpha : mode === "nec" ? byNec : byVal;
  return arr.slice().sort(f);
}
function sortBarHTML(tab) {
  const cur = listSort[tab] || "valor";
  const opts = [["valor", "Maior valor"], ["data", "Data (dia)"], ["alpha", "A → Z"]];
  if (tab === "fixas" || tab === "cartao") opts.push(["nec", "Necessário 1º"]);
  return `<div class="sort-bar"><span class="sort-lbl">↕ Ordenar</span><select id="listSort" class="sort-sel">${
    opts.map(([v, t]) => `<option value="${v}"${v === cur ? " selected" : ""}>${t}</option>`).join("")}</select></div>`;
}
function bindSortBar(view) {
  const s = $("#listSort", view); if (!s) return;
  s.onchange = () => { listSort[curTab] = s.value; suppressNextAnim = true; render(); };
}

/* ===== Seleção múltipla + apagar em massa (com escopo de mês) =====
   Toque longo num item → entra no modo seleção (aparecem os checkboxes azuis).
   "Selecionar todos" no topo (+ dropdown de COMO selecionar). Barra de apagar sobe quando há seleção.
   Apagar: só este mês / deste mês em diante / escolher meses. Vale p/ receitas, fixas e cartão. */
let selMode = false, selected = new Set(), selTab = null, selMonth = -1, selModeAt = 0;
const SEL_TABS = ["receitas", "fixas", "cartao", "diaria"];

// linhas visíveis na aba/mês atuais (espelha o filtro do render)
function visibleRows(tab, m) {
  if (tab === "diaria") return (DATA.diaria || []).map((l, idx) => ({ l, idx })).filter(x => x.l.mes === m);
  return (DATA[tab] || []).map((l, idx) => ({ l, idx }))
    .filter(x => (x.l.vals[m] || 0) > 0 || (x.l.sts[m] || "vazio") !== "vazio");
}
function enterSelMode(idx) {
  if (!SEL_TABS.includes(curTab)) return;
  selMode = true; selTab = curTab; selMonth = curMonth; selected = new Set();
  if (idx != null) selected.add(idx);
  selModeAt = Date.now();
  suppressNextAnim = true; render();
}
function exitSelMode() {
  if (!selMode) return;
  selMode = false; selected = new Set(); selTab = null; selMonth = -1;
  suppressNextAnim = true; render();
}
function toggleSel(idx) {
  if (Date.now() - selModeAt < 400) return;   // ignora o clique que acompanha o toque longo
  if (selected.has(idx)) selected.delete(idx); else selected.add(idx);
  const view = $("#view");
  const box = view && view.querySelector(`.sel-box[data-sel="${idx}"]`);
  const row = box && box.closest(".list-row");
  if (box) box.classList.toggle("on", selected.has(idx));
  if (row) row.classList.toggle("sel-on", selected.has(idx));
  updateSelCount(view);
  updateBulkBar();
}
function updateSelCount(view) {
  if (!view) return;
  const c = view.querySelector(".sel-count"); if (c) c.textContent = selected.size + " selec.";
  const vis = visibleRows(curTab, curMonth);
  const all = vis.length && vis.every(x => selected.has(x.idx));
  const master = view.querySelector("#selAll"); if (master) master.classList.toggle("on", all);
}
function applySelectHow(how) {
  const m = curMonth;
  selected = new Set();
  visibleRows(curTab, m).forEach(x => {
    const st = (x.l.sts && x.l.sts[m]) || "vazio";
    const match = how === "all"
      || (how === "Ativa" && x.l.tipo === "Ativa")
      || (how === "Extra" && x.l.tipo === "Extra")
      || (how === "prog" && st === "programado")
      || (how === "done" && (st === "recebido" || st === "pago"));
    if (match) selected.add(x.idx);
  });
}
function selBarHTML(tab) {
  const vis = visibleRows(tab, curMonth);
  const all = vis.length && vis.every(x => selected.has(x.idx));
  const how = [["all", "Todos"]];
  if (tab !== "diaria") {   // débito é avulso (sem status/recorrência) → só "Todos"
    if (tab === "receitas") how.push(["Ativa", "Só recorrentes"], ["Extra", "Só extras"]);
    how.push(["prog", "Só programados"], ["done", tab === "receitas" ? "Só recebidos" : "Só pagos"]);
  }
  return `<div class="sel-bar">
    <button class="sel-all" id="selAll"><span class="sel-box master${all ? " on" : ""}"></span> Selecionar todos</button>
    <select id="selHow" class="sel-how" title="Como selecionar">${how.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>
    <span class="sel-count">${selected.size} selec.</span>
    <button class="sel-cancel" id="selCancel">Cancelar</button>
  </div>`;
}
function bindSelBar(view) {
  const ca = $("#selCancel", view); if (ca) ca.onclick = exitSelMode;
  const sa = $("#selAll", view); if (sa) sa.onclick = () => {
    const vis = visibleRows(curTab, curMonth);
    const all = vis.length && vis.every(x => selected.has(x.idx));
    if (all) selected = new Set(); else { selected = new Set(); vis.forEach(x => selected.add(x.idx)); }
    suppressNextAnim = true; render();
  };
  const sh = $("#selHow", view); if (sh) sh.onchange = () => { applySelectHow(sh.value); suppressNextAnim = true; render(); };
}

/* barra flutuante de apagar (sobe quando há seleção) */
function bulkBarEl() {
  let b = document.getElementById("bulkBar");
  if (!b) {
    b = document.createElement("div");
    b.id = "bulkBar"; b.className = "bulk-bar hidden";
    b.innerHTML = `<span class="bb-count"></span><button class="bb-del" id="bbDel">🗑️ Apagar</button>`;
    document.body.appendChild(b);
    b.querySelector("#bbDel").onclick = openBulkDelete;
  }
  return b;
}
function updateBulkBar() {
  const b = bulkBarEl(), show = selMode && selected.size > 0;
  if (show) {
    b.querySelector(".bb-count").textContent = `${selected.size} selecionado(s)`;
    b.classList.remove("hidden");
    requestAnimationFrame(() => b.classList.add("show"));
  } else {
    b.classList.remove("show");
    setTimeout(() => { if (!(selMode && selected.size > 0)) b.classList.add("hidden"); }, 280);
  }
}

/* modal de escopo: este mês / deste mês em diante / escolher meses */
function bulkModalEl() {
  let m = document.getElementById("bulkModal");
  if (!m) {
    m = document.createElement("div");
    m.id = "bulkModal"; m.className = "modal center hidden";
    m.innerHTML = `<div class="modal-card bulk-card">
      <h3 class="bm-title">Apagar</h3>
      <p class="bm-sub hint" style="text-align:center;margin:-4px 0 14px"></p>
      <div class="bm-opts">
        <button class="bm-opt" data-scope="this"><b>Só este mês</b><span class="bm-mes"></span></button>
        <button class="bm-opt" data-scope="future"><b>Deste mês em diante</b><span>apaga o mês atual e todos os próximos</span></button>
        <button class="bm-opt" data-scope="pick"><b>Escolher meses…</b><span>marcar mês a mês</span></button>
      </div>
      <div class="bm-pick hidden">
        <div class="bm-pick-grid"></div>
        <button class="bm-pick-go" id="bmPickGo">Apagar meses marcados</button>
      </div>
      <button class="bm-cancel" id="bmCancel">Cancelar</button>
    </div>`;
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m) closeBulkModal(); });
    m.querySelector("#bmCancel").onclick = closeBulkModal;
  }
  return m;
}
function monthGridHTML() {
  const H = horizonLen(); let h = "";
  for (let i = 0; i < H; i++) h += `<label class="mg-cell"><input type="checkbox" value="${i}"${i === curMonth ? " checked" : ""}><span>${mLabel(i)}</span></label>`;
  return h;
}
function openBulkDelete() {
  if (!selMode || !selected.size) return;
  if (selTab === "diaria") return doBulkDeleteDiaria();   // débito é avulso → apaga direto (desfazível)
  const m = bulkModalEl();
  m.querySelector(".bm-title").textContent = `Apagar ${selected.size} item(ns)`;
  m.querySelector(".bm-sub").textContent = `Selecionados em ${mLong(curMonth)}.`;
  m.querySelector(".bm-mes").textContent = mLong(curMonth);
  const pick = m.querySelector(".bm-pick"); pick.classList.add("hidden");
  m.querySelector(".bm-pick-grid").innerHTML = monthGridHTML();
  m.querySelectorAll(".bm-opt").forEach(b => b.onclick = () => {
    const sc = b.dataset.scope;
    if (sc === "this") doBulkDelete([curMonth]);
    else if (sc === "future") { const H = horizonLen(); const arr = []; for (let i = curMonth; i < H; i++) arr.push(i); doBulkDelete(arr); }
    else { pick.classList.remove("hidden"); pick.scrollIntoView({ block: "nearest", behavior: "smooth" }); }
  });
  m.querySelector("#bmPickGo").onclick = () => {
    const months = [...m.querySelectorAll(".bm-pick-grid input:checked")].map(c => +c.value);
    if (!months.length) { toast("Marque ao menos um mês"); return; }
    doBulkDelete(months);
  };
  m.classList.remove("hidden");
}
function closeBulkModal() { const m = document.getElementById("bulkModal"); if (m) m.classList.add("hidden"); }

// Débito: cada compra vive em 1 mês só → apaga as selecionadas de vez (Ctrl+Z desfaz)
function doBulkDeleteDiaria() {
  const idxs = [...selected].sort((a, b) => b - a);   // de trás pra frente pra não bagunçar os índices
  let n = 0;
  idxs.forEach(i => { if (DATA.diaria[i]) { tombstone(DATA.diaria[i].id); DATA.diaria.splice(i, 1); n++; } });
  selMode = false; selected = new Set(); selTab = null; selMonth = -1;
  persist();                 // salva + render + histórico (desfazível) + sync
  updateBulkBar();
  toast(`${n} compra(s) apagada(s) — dá pra desfazer ↩︎`);
}

function doBulkDelete(months) {
  const tab = selTab; if (!tab) return;
  const lines = [...selected].map(i => DATA[tab][i]).filter(Boolean);
  if (!lines.length || !months.length) return;
  months.forEach(mi => lines.forEach(l => {
    if (l.vals && mi >= 0 && mi < l.vals.length) l.vals[mi] = 0;
    if (l.sts && mi >= 0 && mi < l.sts.length) l.sts[mi] = "vazio";
  }));
  lines.forEach(l => { l.m = nowMs(); });   // editou (zerou meses) → atualiza o mtime p/ o merge
  // remove linhas que ficaram 100% vazias (some de todos os meses)
  const antesIds = new Set(DATA[tab].map(l => l.id));
  DATA[tab] = DATA[tab].filter(l => (l.vals || []).some(v => Number(v) > 0) || (l.sts || []).some(s => s && s !== "vazio"));
  const depoisIds = new Set(DATA[tab].map(l => l.id));
  antesIds.forEach(id => { if (!depoisIds.has(id)) tombstone(id); });   // linha que sumiu de vez → tombstone
  selMode = false; selected = new Set(); selTab = null; selMonth = -1;
  closeBulkModal();
  persist();                 // salva + render limpo + histórico (desfazível) + sync
  updateBulkBar();           // esconde a barra
  toast(`Apagado em ${months.length} mês(es) — dá pra desfazer ↩︎`);
}

function renderLista(view) {
  if (curTab === "diaria") return renderDiaria(view);
  if (curTab === "receitas") return renderReceitas(view);
  const lines = DATA[curTab];
  const total = sumMonth(lines, curMonth);
  let rows = lines.map((l, idx) => ({ l, idx }))
    .filter(x => x.l.vals[curMonth] > 0 || (x.l.sts[curMonth] || "vazio") !== "vazio");
  rows = sortRows(rows, listSort[curTab], { val: x => x.l.vals[curMonth] || 0, dia: x => x.l.dia, desc: x => x.l.desc, nec: x => x.l.nec });
  view.innerHTML = `
    ${curTab === "cartao" ? renderCardsSection() : ""}
    <div class="list-header"><span class="lbl">${rows.length} lançamento(s) em ${mLong(curMonth)}${receitaMes(curMonth) > 0 ? ` · ${Math.round(total / receitaMes(curMonth) * 100)}% da receita` : ""}</span><span class="total">${brl(total)}</span></div>
    ${rows.length ? (selMode ? selBarHTML(curTab) : sortBarHTML(curTab)) : ""}
    <div class="list">${rows.length ? rows.map(({ l, idx }, i) => lineRow(l, idx, i)).join("") : empty()}</div>`;
  bindRows(view);
  bindSortBar(view);
  bindSelBar(view);
  if (curTab === "cartao") bindCardsSection(view);
}

function renderReceitas(view) {
  const m = curMonth;
  const groups = [["Ativa", "Renda recorrente"], ["Extra", "Renda extra"]];
  let html = `<div class="list-header"><span class="lbl">Recebido ${brl(recebido(m))}${receitaMes(m) > 0 ? ` (${Math.round(recebido(m) / receitaMes(m) * 100)}%)` : ""} · a receber ${brl(aReceber(m))}</span><span class="total">${brl(receitaMes(m))}</span></div>` + (selMode ? selBarHTML("receitas") : sortBarHTML("receitas"));
  groups.forEach(([tipo, titulo]) => {
    let rows = DATA.receitas.map((l, idx) => ({ l, idx }))
      .filter(x => x.l.tipo === tipo && (x.l.vals[m] > 0 || (x.l.sts[m] || "vazio") !== "vazio"));
    rows = sortRows(rows, listSort.receitas, { val: x => x.l.vals[m] || 0, dia: x => x.l.dia, desc: x => x.l.desc, nec: x => x.l.nec });
    if (!rows.length) return;
    const sub = DATA.receitas.filter(l => l.tipo === tipo).reduce((s, l) => s + (Number(l.vals[m]) || 0), 0);
    html += `<div class="group-head">${titulo} <span>${brl(sub)}</span></div><div class="list">${rows.map(({ l, idx }, i) => lineRow(l, idx, i)).join("")}</div>`;
  });
  view.innerHTML = html;
  bindRows(view);
  bindSortBar(view);
  bindSelBar(view);
}

function lineRow(l, idx, pos) {
  const m = curMonth, val = l.vals[m], st = l.sts[m] || "vazio";
  const bits = [];
  if (l.dia) bits.push("dia " + l.dia);
  if (curTab === "cartao" && l.parcAtual && l.parcTotal) bits.push(`parcela ${l.parcAtual}/${l.parcTotal}`);
  if (curTab === "cartao" && l.cartao) bits.push("•" + esc(l.cartao));
  const sub = bits.join(" · ");
  const on = selected.has(idx);
  const box = selMode ? `<span class="sel-box${on ? " on" : ""}" data-sel="${idx}"></span>` : "";
  return `<div class="list-row${selMode ? " sel-mode" : ""}${on ? " sel-on" : ""}" data-idx="${idx}" style="--i:${Math.min(pos || 0, 16)}">
    ${box}<div class="desc"><div class="name">${esc(l.desc || "—")}</div>${sub ? `<div class="sub">${sub}</div>` : ""}</div>
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
  let html = `<div class="list-header"><span class="lbl">${rows.length} compra(s) em ${mLong(m)}${receitaMes(m) > 0 ? ` · ${Math.round(total / receitaMes(m) * 100)}% da receita` : ""}</span><span class="total">${brl(total)}</span></div>`;
  if (!rows.length) { html += `<div class="list">${empty("Nenhuma compra no débito.")}</div>`; }
  else html += (selMode ? selBarHTML("diaria") : sortBarHTML("diaria"));
  const getD = { val: x => Number(x.d.valor) || 0, dia: x => x.d.dia, desc: x => x.d.desc, nec: () => false };
  Object.keys(cats).sort().forEach(cat => {
    const sub = cats[cat].reduce((s, x) => s + (Number(x.d.valor) || 0), 0);
    const itens = sortRows(cats[cat], listSort.diaria, getD);
    const cobj = catList().find(x => x.nome.toLowerCase() === String(cat).toLowerCase());
    const emo = cobj ? cobj.emoji + " " : "";
    html += `<div class="group-head">${emo}${esc(cat)} <span>${brl(sub)}</span></div><div class="list">${itens.map(({ d, idx }, gi) => {
      const on = selected.has(idx);
      const box = selMode ? `<span class="sel-box${on ? " on" : ""}" data-sel="${idx}"></span>` : "";
      const met = d.metodo === "pix" ? `<span class="met-pill pix">⚡ PIX</span>` : d.metodo === "debito" ? `<span class="met-pill debito">💳 Débito</span>` : "";
      const dia = d.dia ? `dia ${d.dia}` : "";
      const subln = (met || dia) ? `<div class="sub">${[dia, met].filter(Boolean).join(" · ")}</div>` : "";
      return `<div class="list-row${selMode ? " sel-mode" : ""}${on ? " sel-on" : ""}" data-idx="${idx}" style="--i:${Math.min(gi, 16)}">${box}<div class="desc"><div class="name">${esc(d.desc || "—")}</div>${subln}</div><span class="amount">${brl(d.valor)}</span></div>`;
    }).join("")}</div>`;
  });
  view.innerHTML = html;
  bindRows(view);                                  // toque-longo → seleção (igual fixas/cartões)
  if (selMode) bindSelBar(view); else bindSortBar(view);
  updateBulkBar();
}

function bindRows(view) {
  $$(".list-row", view).forEach(r => {
    if (!r.dataset.idx) return;
    const idx = +r.dataset.idx;
    if (selMode) {
      r.onclick = (e) => { e.preventDefault(); toggleSel(idx); };   // em seleção: tap marca/desmarca
      return;
    }
    // modo normal: tap = editar/status; toque longo (~550ms) = entra na seleção
    let lpTimer = null, sx = 0, sy = 0;
    const cancelLP = () => { if (lpTimer) { clearTimeout(lpTimer); lpTimer = null; } };
    r.addEventListener("pointerdown", (e) => {
      if (e.target.dataset.toggle !== undefined) return;            // não no badge de status
      sx = e.clientX; sy = e.clientY;
      cancelLP();
      lpTimer = setTimeout(() => { lpTimer = null; if (navigator.vibrate) try { navigator.vibrate(15); } catch (_) {} enterSelMode(idx); }, 550);
    });
    r.addEventListener("pointermove", (e) => { if (lpTimer && (Math.abs(e.clientX - sx) > 10 || Math.abs(e.clientY - sy) > 10)) cancelLP(); });
    r.addEventListener("pointerup", cancelLP);
    r.addEventListener("pointercancel", cancelLP);
    r.onclick = (e) => {
      if (selMode) { e.preventDefault(); toggleSel(idx); return; }  // se o long-press já ativou a seleção
      if (e.target.dataset.toggle !== undefined) { toggleStatus(curTab, +e.target.dataset.toggle); e.stopPropagation(); return; }
      if (curTab === "diaria") return openDiariaModal(idx);
      openEntryModal(curTab, idx);
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
function cardLabel(c) { return c ? (esc(c.nome || "Cartão") + (c.last4 ? ` •••• ${esc(c.last4)}` : "")) : ""; }

/* ---------- Categorias (com emoji) ---------- */
function catList() { return DATA.categorias || []; }
function catById(id) { return id ? catList().find(c => c.id === id) : null; }
function catFull(id) { const c = catById(id); return c ? `${c.emoji} ${esc(c.nome)}` : ""; }
function catSelectHTML(selId) {
  return `<option value="">📦 Sem categoria</option>` + catList().map(c =>
    `<option value="${c.id}"${c.id === selId ? " selected" : ""}>${c.emoji} ${esc(c.nome)}</option>`).join("");
}
// resolve a categoria de um lançamento: catId direto, ou pelo nome antigo (diaria.categoria), senão nenhuma
function entryCatId(l) {
  if (l.catId) return l.catId;
  if (l.categoria) { const c = catList().find(x => x.nome.toLowerCase() === String(l.categoria).toLowerCase()); if (c) return c.id; }
  return null;
}
// soma o realizado do mês m por categoria (fixas + cartão + débito); chave "__none" = sem categoria
function realizadoPorCategoria(m) {
  const out = {};
  const add = (id, v) => { if (!v) return; const k = id || "__none"; out[k] = (out[k] || 0) + v; };
  (DATA.fixas || []).forEach(l => add(entryCatId(l), Number(l.vals && l.vals[m]) || 0));
  (DATA.cartao || []).forEach(l => add(entryCatId(l), Number(l.vals && l.vals[m]) || 0));
  (DATA.diaria || []).filter(d => d.mes === m).forEach(d => add(entryCatId(d), Number(d.valor) || 0));
  return out;
}
function renderCardsSection() {
  const cs = DATA.cartoes || [];
  if (!cs.length) return "";                                   // cadastro agora é pelo + (toque no botão flutuante)
  const itens = cs.map((c, i) => `<div class="card-line" data-cidx="${i}">
      <div class="card-ic">💳</div>
      <div class="desc"><div class="name">${esc(c.nome || "Cartão")}${c.last4 ? ` <span class="card-last4">•••• ${esc(c.last4)}</span>` : ""}</div>
        <div class="sub">fecha dia <b>${c.fechamento || "—"}</b> · vence dia <b>${c.vencimento || "—"}</b></div></div>
      <span class="card-edit">editar ›</span></div>`).join("");
  return `<div class="section-card fade-in"><h3>💳 Meus cartões</h3><div class="card-list">${itens}</div></div>`;
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
    <label class="field"><span>Últimos 4 dígitos</span><input id="c_last4" type="text" inputmode="numeric" maxlength="4" value="${isNew || !c.last4 ? "" : esc(c.last4)}" placeholder="ex.: 1950" /></label>
    <div class="field-row">
      <label class="field"><span>Fecha a fatura (dia)</span><input id="c_fech" type="number" min="1" max="31" inputmode="numeric" value="${isNew || !c.fechamento ? "" : c.fechamento}" placeholder="ex.: 29" /></label>
      <label class="field"><span>Vence / paga (dia)</span><input id="c_venc" type="number" min="1" max="31" inputmode="numeric" value="${isNew || !c.vencimento ? "" : c.vencimento}" placeholder="ex.: 7" /></label>
    </div>
    <p class="hint" style="text-align:left">Compras feitas <b>até o dia do fechamento</b> entram na fatura do mês; depois disso, vão para o mês seguinte.</p>`;
  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { DATA.cartoes.splice(idx, 1); persist(); closeModal(); toast("Cartão removido"); };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const last4 = ($("#c_last4").value.match(/\d/g) || []).join("").slice(-4) || null;
    const o = { nome: $("#c_nome").value.trim() || "Cartão", last4, fechamento: parseInt($("#c_fech").value) || null, vencimento: parseInt($("#c_venc").value) || null };
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
// data de hoje em ISO (YYYY-MM-DD) para o <input type="date">
function todayISO() { const d = new Date(), p = n => String(n).padStart(2, "0"); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`; }
// pergunta "foi hoje mesmo?" ANTES de salvar quando a data está marcada como HOJE.
// retorna true = pode salvar; false = usuário quer ajustar a data (não salva, foca o campo).
function confirmaHoje(focaCampoSel) {
  const d = new Date(), dd = String(d.getDate()).padStart(2, "0") + "/" + String(d.getMonth() + 1).padStart(2, "0");
  if (confirm(`Esta compra está marcada para HOJE (${dd}). Foi feita hoje mesmo?\n\nOK = sim, pode salvar\nCancelar = quero ajustar a data antes`)) return true;
  const el = focaCampoSel && $(focaCampoSel);
  if (el) { el.focus(); if (el.showPicker) { try { el.showPicker(); } catch (e) {} } }
  return false;
}
// converte a data escolhida em { dia, mes (índice absoluto a partir de Jan/DATA.year) }
function dateParts(iso) {
  if (!iso) return { dia: null, mes: curMonth };
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d.getTime())) return { dia: null, mes: curMonth };
  let mes = (d.getFullYear() - DATA.year) * 12 + d.getMonth();
  if (mes < 0) mes = 0;
  return { dia: d.getDate(), mes };
}
function openCartaoModal() {
  const cs = DATA.cartoes || [];
  $("#modalTitle").textContent = "Nova compra no cartão";
  const cardOpts = cs.map(c => `<option value="${c.id}">${cardLabel(c)}</option>`).join("");
  const parcOpts = Array.from({ length: 59 }, (_, i) => `<option value="${i + 2}">${i + 2}×</option>`).join("");  // 2× a 60×
  $("#entryForm").innerHTML = `
    ${cs.length ? "" : `<p class="hint" style="text-align:left;margin-bottom:10px">💡 Cadastre seu cartão (com o dia do fechamento) em <b>Meus cartões</b> para as parcelas caírem no mês certo.</p>`}
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" required placeholder="Ex.: Tênis" /></label>
    <label class="field"><span>Cartão</span><select id="f_card">${cardOpts}<option value="">Outro (sem cadastro)</option></select></label>
    <label class="field"><span>Categoria</span><select id="f_catId" class="sel">${catSelectHTML(null)}</select></label>
    <div class="seg" id="f_seg" role="tablist">
      <button type="button" class="seg-btn active" data-pay="avista">À vista</button>
      <button type="button" class="seg-btn" data-pay="parc">Parcelado</button>
    </div>
    <div class="field-row">
      <label class="field"><span id="f_val_lbl">Valor da compra</span><input id="f_val" class="money" placeholder="0,00" required /></label>
      <label class="field" id="f_n_field" style="display:none"><span>Em quantas vezes</span><select id="f_n" class="sel">${parcOpts}</select></label>
    </div>
    <label class="field"><span>Data da compra</span><input id="f_data" type="date" value="${todayISO()}" min="${DATA.year}-01-01" /></label>
    <label class="field row-check nec-check"><input id="f_nec" type="checkbox" /><span>🔒 Necessário — não posso deixar de pagar</span></label>
    <div id="f_parc_prev" class="impact"></div>`;
  // segmento À vista / Parcelado → muda a interface na hora
  $$("#f_seg .seg-btn").forEach(b => b.onclick = () => {
    $$("#f_seg .seg-btn").forEach(x => x.classList.toggle("active", x === b));
    const parc = b.dataset.pay === "parc";
    $("#f_n_field").style.display = parc ? "" : "none";
    $("#f_val_lbl").textContent = parc ? "Valor de cada parcela" : "Valor da compra";
    updateParcelaPreview();
  });
  ["f_val", "f_n", "f_data", "f_card"].forEach(id => { const el = $("#" + id); if (el) { el.oninput = updateParcelaPreview; el.onchange = updateParcelaPreview; } });
  updateParcelaPreview();
  $("#btnDelete").classList.add("hidden");
  let askedHoje = false;   // pergunta "foi hoje?" só UMA vez por inclusão (sem loop)
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    if (!askedHoje && $("#f_data").value === todayISO()) { askedHoje = true; if (!confirmaHoje("#f_data")) return; }
    const parc = $("#f_seg .seg-btn.active").dataset.pay === "parc";
    const valor = moneyVal($("#f_val"));
    const n = parc ? Math.min(60, Math.max(2, parseInt($("#f_n").value) || 2)) : 1;
    const { dia, mes: base } = dateParts($("#f_data").value);
    const card = cs.find(c => c.id === $("#f_card").value) || null;
    const start = parcelaStartMonth(base, dia, card ? card.fechamento : null);
    const paidUntil = realMesAbs();
    const nec = $("#f_nec") ? $("#f_nec").checked : false;
    const last = Math.max(start + n - 1, 11);
    const catId = $("#f_catId") ? ($("#f_catId").value || null) : null;
    const line = { id: uid(), desc: $("#f_desc").value.trim(), cartao: card ? card.nome : "", catId, parcAtual: 1, parcTotal: n > 1 ? n : null, dia: card ? card.vencimento : dia, nec, vals: Array(12).fill(0), sts: Array(12).fill("vazio") };
    ensureLen(line, last + 1);                                 // estende os meses se a última parcela passa de Dez/26
    for (let k = 0; k < n; k++) { const mo = start + k; if (mo < 0) continue; line.vals[mo] = valor; line.sts[mo] = mo <= paidUntil ? "pago" : "programado"; }
    line.m = nowMs();                                          // mtime p/ o merge da conta conjunta
    DATA.cartao.push(line);
    persist(); closeModal();
    const fim = start + n - 1;
    toast(n > 1 ? `Compra lançada ✓ ${n}× (até ${mLong(fim)})` : "Compra lançada ✓");
  };
  showModal("#modal");
}
function updateParcelaPreview() {
  const el = $("#f_parc_prev"); if (!el) return;
  const parc = $("#f_seg .seg-btn.active") && $("#f_seg .seg-btn.active").dataset.pay === "parc";
  const valor = moneyVal($("#f_val"));
  const n = parc ? Math.min(60, Math.max(2, parseInt($("#f_n") && $("#f_n").value) || 2)) : 1;
  const { dia, mes: base } = dateParts($("#f_data") && $("#f_data").value);
  const cs = DATA.cartoes || [];
  const card = cs.find(c => c.id === ($("#f_card") && $("#f_card").value)) || null;
  const start = parcelaStartMonth(base, dia, card ? card.fechamento : null);
  const fim = start + n - 1;
  el.className = "impact ok";
  let txt = `<div class="impact-row"><span>${n > 1 ? n + "× de " + brl(valor) : "Compra"}</span><b>${brl(valor * n)}</b></div>`;
  if (card && card.fechamento && dia) {
    const mesmoMes = dia <= card.fechamento;
    txt += `<div class="impact-sub">${mesmoMes
      ? `Compra dia ${dia} entra na fatura de <b>${mLong(base)}</b>`
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
      <label class="field"><span>Meta/mês (opcional)</span><input id="f_meta" class="money" value="${isNew || !l.meta ? "" : l.meta}" placeholder="R$" /></label></div>` + necCheck;
  else if (tab === "cartao") extra = `<div class="field-row">
      <label class="field"><span>Parcela atual</span><input id="f_pa" type="number" min="1" value="${isNew || !l.parcAtual ? "" : l.parcAtual}" placeholder="--" /></label>
      <label class="field"><span>de (total)</span><input id="f_pt" type="number" min="1" value="${isNew || !l.parcTotal ? "" : l.parcTotal}" placeholder="--" /></label>
      <label class="field"><span>Cartão</span><input id="f_cartao" type="text" value="${isNew || !l.cartao ? "" : esc(l.cartao)}" placeholder="final" /></label></div>` + necCheck;

  const catField = isReceita ? "" : `<label class="field"><span>Categoria</span><select id="f_catId" class="sel">${catSelectHTML(isNew ? null : l.catId)}</select></label>`;
  $("#entryForm").innerHTML = `
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" value="${isNew ? "" : esc(l.desc)}" required placeholder="Ex.: ${isReceita ? "Salário" : "Aluguel"}" /></label>
    ${extra}
    ${catField}
    <label class="field"><span id="f_valLbl">Valor (${mLong(curMonth)})</span><input id="f_val" class="money" value="${isNew ? "" : (l.vals[curMonth] || "")}" placeholder="0,00" /></label>
    <div class="field-row">
      <label class="field"><span>Mês${isNew ? " de início" : ""}</span><select id="f_mes" class="sel">${monthOptionsHTML(curMonth)}</select></label>
      <label class="field"><span>${tab === "fixas" ? "Vencimento (dia)" : "Dia"}</span><select id="f_dia" class="sel"></select></label>
    </div>
    <label class="field"><span>Situação</span><select id="f_st">${stOpts.map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select></label>
    <label class="field row-check"><input id="f_all" type="checkbox" /><span>Repetir nos próximos meses</span></label>
    <label class="field" id="f_rep_wrap" style="display:none"><span>Por quantos meses? (a partir do mês escolhido — pode passar de 2026)</span>
      <input id="f_rep" type="number" min="1" max="120" inputmode="numeric" value="12" /></label>`;
  fillDaySelect("f_dia", "f_mes", isNew ? null : (l.dia || null));
  if (!isNew) { if (isReceita) $("#f_tipo").value = l.tipo || "Ativa"; $("#f_st").value = l.sts[curMonth] || "vazio"; }
  else $("#f_st").value = isReceita ? "recebido" : "pago";
  $("#f_all").onchange = () => { $("#f_rep_wrap").style.display = $("#f_all").checked ? "block" : "none"; };

  // Aviso inteligente: mostra a sobra do mês DEPOIS deste lançamento (em tempo real).
  const isExpenseE = tab !== "receitas";
  const oldValAt = (m) => isNew ? 0 : (Number(l.vals[m]) || 0);
  $("#entryForm").insertAdjacentHTML("beforeend", `<div id="f_impact" class="impact"></div>`);
  const fv = $("#f_val"); if (fv) fv.oninput = () => updateImpact(isExpenseE, oldValAt(+$("#f_mes").value));
  $("#f_mes").onchange = () => {
    const bm = +$("#f_mes").value;
    fillDaySelect("f_dia", "f_mes");
    const vl = $("#f_valLbl"); if (vl) vl.textContent = "Valor (" + mLong(bm) + ")";
    if (!isNew) { ensureLen(l, bm + 1); $("#f_val").value = l.vals[bm] ? fmtMoneyBR(l.vals[bm]) : ""; $("#f_st").value = l.sts[bm] || "vazio"; }
    updateImpact(isExpenseE, oldValAt(bm));
  };
  updateImpact(isExpenseE, oldValAt(curMonth));

  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir este lançamento (todos os meses)?")) { tombstone(DATA[tab][idx].id); DATA[tab].splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    const val = moneyVal($("#f_val")), st = $("#f_st").value, all = $("#f_all").checked;
    const bm = +$("#f_mes").value;
    let line = isNew ? { id: uid(), desc: "", vals: Array(12).fill(0), sts: Array(12).fill("vazio") } : l;
    ensureLen(line, bm + 1);
    line.desc = $("#f_desc").value.trim();
    line.dia = parseInt($("#f_dia").value) || null;
    if (isReceita) line.tipo = $("#f_tipo").value;
    if (tab === "fixas") { line.aviso = parseInt($("#f_aviso").value) || null; line.meta = moneyVal($("#f_meta")) || null; }
    if (tab === "cartao") { line.parcAtual = parseInt($("#f_pa").value) || null; line.parcTotal = parseInt($("#f_pt").value) || null; line.cartao = $("#f_cartao").value.trim(); }
    if (tab === "fixas" || tab === "cartao") { const ne = $("#f_nec"); line.nec = ne ? ne.checked : (line.nec || false); const ci = $("#f_catId"); if (ci) line.catId = ci.value || null; }
    if (all) {
      const q = Math.max(1, Math.min(120, parseInt($("#f_rep").value) || 12));
      ensureLen(line, bm + q);                                  // recorrência pode passar de Dez/26 → estende os meses
      for (let k = 0; k < q; k++) { const mo = bm + k; line.vals[mo] = val; line.sts[mo] = val > 0 ? st : "vazio"; }
    } else { line.vals[bm] = val; line.sts[bm] = val > 0 ? st : "vazio"; }
    line.m = nowMs();                                          // mtime p/ o merge da conta conjunta
    if (isNew) DATA[tab].push(line);
    persist(); closeModal();
    const sa = disponivelMes(bm) - despesaMes(bm);
    if (isExpenseE && val > 0 && sa < 0) toast(`⚠️ ${mLong(bm)} ficou no vermelho (${brl(sa)}) · Ctrl+Z desfaz`);
    else toast(`${isNew ? "Adicionado" : "Salvo"} em ${mLong(bm)} ✓`);
  };
  showModal("#modal");
}

// Atualiza a linha "sobra do mês após este lançamento" (verde = ok, vermelho = vai faltar).
function updateImpact(isExpense, oldVal) {
  const el = $("#f_impact"); if (!el) return;
  const fm = $("#f_mes"), m = fm ? (+fm.value) : curMonth, cur = disponivelMes(m) - despesaMes(m);
  const novo = moneyVal($("#f_val"));
  const delta = novo - (oldVal || 0);
  const apos = isExpense ? cur - delta : cur + delta;
  const neg = apos < 0;
  el.className = "impact " + (neg ? "bad" : "ok");
  el.innerHTML = `<div class="impact-row"><span>${isExpense ? "Sobra do mês após este gasto" : "Sobra do mês após"}</span><b>${brl(apos)}</b></div>`
    + (neg ? `<div class="impact-warn">⚠️ Isso deixa <b>${mLong(m)}</b> no vermelho. Você pode salvar, mas reveja o gasto.</div>` : "");
}

// mês absoluto de HOJE (índice a partir de Jan do DATA.year)
const realMesAbs = () => (REAL_TODAY.getFullYear() - DATA.year) * 12 + REAL_TODAY.getMonth();
const metLabel = (mt) => mt === "pix" ? "⚡ PIX" : "💳 Débito";

// ---- Seletores de Mês/Dia (compartilhados por todos os formulários com "+") ----
// meses agrupados por ano em <optgroup> → no iOS abre o picker nativo (roda)
function monthOptionsHTML(sel) {
  const maxM = yearsCount() * 12; let html = "", lastY = -1;
  for (let i = 0; i < maxM; i++) {
    const y = yearOf(i);
    if (y !== lastY) { if (lastY !== -1) html += `</optgroup>`; html += `<optgroup label="${y}">`; lastY = y; }
    html += `<option value="${i}"${i === sel ? " selected" : ""}>${MESES[((i % 12) + 12) % 12]}</option>`;
  }
  return html + `</optgroup>`;
}
function dayOptionsHTML(mesAbs, sel) {
  const n = diasNoMesAbs(mesAbs); let html = `<option value="">—</option>`;
  for (let k = 1; k <= n; k++) html += `<option value="${k}"${k === sel ? " selected" : ""}>${k}</option>`;
  return html;
}
// repopula um <select> de dia conforme o mês escolhido (preserva a seleção atual quando cabe)
function fillDaySelect(diaId, mesId, forceDia) {
  const sel = $("#" + diaId), mes = +$("#" + mesId).value;
  const prev = forceDia !== undefined ? forceDia : (+sel.value || null);
  sel.innerHTML = dayOptionsHTML(mes, prev);
}

// Balão acima do "+" (Dia a Dia): escolhe PIX ou Débito antes de abrir o form.
// Balão acima do "+" — escolhe uma ação antes de abrir o form
function showChooser(title, opts) {
  const old = $("#methodPop"); if (old) old.remove();
  const pop = document.createElement("div");
  pop.id = "methodPop"; pop.className = "method-pop";   // sem "hidden" (senão display:none esconde o balão)
  pop.innerHTML = `<div class="mp-title">${title}</div>` + opts.map((o, i) =>
    `<button type="button" class="mp-opt ${o.cls || ""}" data-i="${i}"><span class="mp-ic">${o.ic}</span><span class="mp-txt"><b>${o.label}</b>${o.sub ? `<i>${o.sub}</i>` : ""}</span></button>`).join("");
  document.body.appendChild(pop);
  requestAnimationFrame(() => pop.classList.add("show"));
  const close = () => { pop.classList.remove("show"); setTimeout(() => { try { pop.remove(); } catch (e) {} }, 200); document.removeEventListener("click", onDoc, true); };
  const onDoc = (e) => { if (!pop.contains(e.target) && e.target.id !== "fab") close(); };
  setTimeout(() => document.addEventListener("click", onDoc, true), 0);
  $$(".mp-opt", pop).forEach(b => b.onclick = () => { close(); opts[+b.dataset.i].fn(); });
}
function openDiariaChooser() {
  showChooser("Como você pagou?", [
    { ic: "⚡", label: "PIX", cls: "pix", fn: () => openDiariaModal(null, "pix") },
    { ic: "💳", label: "Débito", cls: "debito", fn: () => openDiariaModal(null, "debito") },
  ]);
}
function openCartaoChooser() {
  showChooser("O que você quer lançar?", [
    { ic: "🛒", label: "Nova compra", cls: "debito", fn: () => openCartaoModal() },
    { ic: "💳", label: "Cadastrar cartão", cls: "pix", fn: () => openCardModal(null) },
  ]);
}

function openDiariaModal(idx, method) {
  const isNew = idx == null, d = isNew ? null : DATA.diaria[idx];
  let metodo = method || (d && d.metodo) || "debito";
  const mesSel = isNew ? curMonth : (d.mes != null ? d.mes : curMonth);
  $("#modalTitle").textContent = (isNew ? "Nova " : "Editar ") + "compra no débito";
  $("#entryForm").innerHTML = `
    <div id="f_metTag" class="method-tag ${metodo}"><span class="mt-label">${metLabel(metodo)}</span><button type="button" id="f_metToggle" class="met-switch">trocar ⇄</button></div>
    <label class="field"><span>Descrição</span><input id="f_desc" type="text" value="${isNew ? "" : esc(d.desc)}" required placeholder="Ex.: Mercado" /></label>
    <label class="field"><span>Categoria</span><select id="f_catId" class="sel">${catSelectHTML(isNew ? null : entryCatId(d))}</select></label>
    <label class="field"><span>Valor (R$)</span><input id="f_val" class="money" value="${isNew ? "" : d.valor}" placeholder="0,00" required /></label>
    <div class="field-row">
      <label class="field"><span>Mês</span><select id="f_mes" class="sel">${monthOptionsHTML(mesSel)}</select></label>
      <label class="field"><span>Dia</span><select id="f_dia" class="sel"></select></label>
    </div>
    <p class="hint" style="text-align:left">📌 Escolha o <b>mês</b> aqui — o gasto vai pro mês certo mesmo que você esteja vendo outro.</p>`;
  const diaDefault = isNew ? (mesSel === realMesAbs() ? REAL_TODAY.getDate() : null) : (d.dia || null);
  fillDaySelect("f_dia", "f_mes", diaDefault);
  const oldValD = isNew ? 0 : (Number(d.valor) || 0);
  $("#entryForm").insertAdjacentHTML("beforeend", `<div id="f_impact" class="impact"></div>`);
  const fvd = $("#f_val"); if (fvd) fvd.oninput = () => updateImpact(true, oldValD);
  $("#f_mes").onchange = () => { fillDaySelect("f_dia", "f_mes"); updateImpact(true, oldValD); };
  $("#f_metToggle").onclick = () => { metodo = metodo === "pix" ? "debito" : "pix"; const t = $("#f_metTag"); t.className = "method-tag " + metodo; t.querySelector(".mt-label").textContent = metLabel(metodo); };
  updateImpact(true, oldValD);
  $("#btnDelete").classList.toggle("hidden", isNew);
  $("#btnDelete").onclick = () => { if (confirm("Excluir esta compra?")) { tombstone(DATA.diaria[idx].id); DATA.diaria.splice(idx, 1); persist(); closeModal(); toast("Excluído"); } };
  let askedHoje = false;   // pergunta "foi hoje?" só UMA vez por inclusão (sem loop)
  $("#entryForm").onsubmit = (e) => {
    e.preventDefault();
    if (!askedHoje && isNew && +$("#f_mes").value === realMesAbs() && (parseInt($("#f_dia").value) || 0) === REAL_TODAY.getDate()) {
      askedHoje = true; if (!confirmaHoje("#f_dia")) return;
    }
    const val = moneyVal($("#f_val")), mes = +$("#f_mes").value;
    const catId = $("#f_catId") ? ($("#f_catId").value || null) : null;
    const o = { desc: $("#f_desc").value.trim(), valor: val, dia: parseInt($("#f_dia").value) || null, catId, categoria: catId ? (catById(catId).nome) : "Geral", metodo };
    if (isNew) DATA.diaria.push({ id: uid(), mes, ...o, m: nowMs() });
    else { Object.assign(d, o); d.mes = mes; d.m = nowMs(); }
    persist(); closeModal();
    const sa = disponivelMes(mes) - despesaMes(mes);
    if (val > 0 && sa < 0) toast(`⚠️ ${mLong(mes)} ficou no vermelho (${brl(sa)}) · Ctrl+Z desfaz`);
    else toast(`${isNew ? "Adicionado" : "Salvo"} em ${mLong(mes)} ✓`);
  };
  showModal("#modal");
}

/* ---------- Categorias e orçamento (gerenciador no menu) ---------- */
function openCategoriasModal() { renderCatMgr(); showModal("#catModal"); }
function catTotalHTML() {
  const orc = DATA.orcamento || {};
  const tot = catList().reduce((s, c) => s + (Number(orc[c.id]) || 0), 0);
  return `Orçamento total: <b>${brl(tot)}</b> <i>/ mês</i>`;
}
function renderCatMgr() {
  const wrap = $("#catMgrList"); if (!wrap) return;
  const orc = DATA.orcamento || (DATA.orcamento = {});
  wrap.innerHTML = catList().map(c => `
    <div class="cat-mgr-row" data-cid="${c.id}">
      <button type="button" class="cat-emoji-btn" data-emoji-for="${c.id}" aria-label="Trocar emoji">${c.emoji}</button>
      <input class="cat-name-inp" data-name-for="${c.id}" type="text" value="${esc(c.nome)}" placeholder="Nome" />
      <div class="cat-orc"><span>R$</span><input class="cat-orc-inp money" data-orc-for="${c.id}" value="${orc[c.id] || ""}" placeholder="0" /></div>
      <button type="button" class="cat-del" data-del-for="${c.id}" aria-label="Excluir">🗑</button>
    </div>`).join("");
  const tEl = $("#catMgrTotal"); if (tEl) tEl.innerHTML = catTotalHTML();
  $$(".cat-emoji-btn", wrap).forEach(b => b.onclick = () => openEmojiPicker(em => {
    const c = catById(b.dataset.emojiFor); if (c) { c.emoji = em; b.textContent = em; persist(); }
  }));
  $$(".cat-name-inp", wrap).forEach(inp => inp.onchange = () => {
    const c = catById(inp.dataset.nameFor); if (c) { c.nome = inp.value.trim() || c.nome; persist(); }
  });
  $$(".cat-orc-inp", wrap).forEach(inp => { bindMoney(inp); inp.onchange = () => {
    const id = inp.dataset.orcFor, v = moneyVal(inp);
    if (v > 0) orc[id] = v; else delete orc[id];
    persist(); const tt = $("#catMgrTotal"); if (tt) tt.innerHTML = catTotalHTML();
  }; });
  $$(".cat-del", wrap).forEach(b => b.onclick = () => {
    const id = b.dataset.delFor;
    if (!confirm("Excluir esta categoria? Os lançamentos dela ficam sem categoria.")) return;
    DATA.categorias = catList().filter(c => c.id !== id); delete orc[id];
    [].concat(DATA.fixas || [], DATA.cartao || [], DATA.diaria || []).forEach(l => { if (l.catId === id) l.catId = null; });
    persist(); renderCatMgr();
  });
}
function addCategoria() {
  const id = "c" + Date.now().toString(36);
  DATA.categorias = catList().concat([{ id, nome: "Nova categoria", emoji: "🏷️" }]);
  persist(); renderCatMgr();
  const inp = document.querySelector(`.cat-name-inp[data-name-for="${id}"]`);
  if (inp) { inp.focus(); inp.select(); inp.scrollIntoView({ block: "nearest" }); }
}

/* ---------- Seletor de emoji ---------- */
// Picker estilo WhatsApp: 8 categorias-padrão (cabem na largura) + listas completas; a grade rola na vertical.
const EMOJI_GROUPS = [
  { name: "Rostos e pessoas", icon: "😀", emojis: "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 🫠 😉 😊 😇 🥰 😍 🤩 😘 😗 ☺️ 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🫣 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 🤥 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 💩 🤡 👹 👺 👻 👽 🤖 😺 😸 😹 😻 😼 😽 🙀 😿 😾 👍 👎 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ 👋 🤚 🖐️ ✋ 🖖 👏 🙌 👐 🤲 🤝 🙏 ✍️ 💪 🦾 🦵 🦶 👂 👃 🧠 🫀 👀 👁️ 👅 👄 🫦 👶 🧒 👦 👧 🧑 👨 👩 🧔 👴 👵 🙍 🙎 🙅 🙆 💁 🙋 🧏 🙇 🤦 🤷 👮 🕵️ 💂 👷 🤴 👸 👰 🤵 🧑‍🎄 🦸 🦹 🧙 🧚 🧛 🧜 🧝 🧞 🧟 💆 💇 🚶 🏃 💃 🕺 👯 🧖 🧗 🤺 🏇 ⛷️ 🏂 🏌️ 🏄 🚣 🏊 ⛹️ 🏋️ 🚴 🚵 🤸 🤼 🤽 🤾 🤹 🧘 👫 👬 👭 💏 💑 👪 ❤️ 🧡 💛 💚 💙 💜 🤎 🖤 🤍 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝".split(" ") },
  { name: "Animais e natureza", icon: "🐻", emojis: "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐽 🐸 🐵 🙈 🙉 🙊 🐒 🐔 🐧 🐦 🐤 🐣 🐥 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪰 🪲 🦟 🦗 🕷️ 🕸️ 🦂 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦞 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🦧 🐘 🦛 🦏 🐪 🐫 🦒 🦘 🐃 🐂 🐄 🐎 🐖 🐏 🐑 🦙 🐐 🦌 🐕 🐩 🦮 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦦 🦥 🐁 🐀 🐿️ 🦔 🐾 🐉 🐲 🌵 🎄 🌲 🌳 🌴 🪵 🌱 🌿 ☘️ 🍀 🎍 🪴 🎋 🍃 🍂 🍁 🍄 🐚 🪨 🌾 💐 🌷 🌹 🥀 🌺 🌸 🌼 🌻 🌞 🌝 🌛 🌜 🌚 🌕 🌖 🌗 🌘 🌑 🌒 🌓 🌔 🌙 🌎 🌍 🌏 🪐 💫 ⭐ 🌟 ✨ ⚡ ☄️ 💥 🔥 🌪️ 🌈 ☀️ 🌤️ ⛅ 🌥️ ☁️ 🌦️ 🌧️ ⛈️ 🌩️ 🌨️ ❄️ ☃️ ⛄ 🌬️ 💨 💧 💦 🌊".split(" ") },
  { name: "Comida e bebida", icon: "🍔", emojis: "🍇 🍈 🍉 🍊 🍋 🍌 🍍 🥭 🍎 🍏 🍐 🍑 🍒 🍓 🫐 🥝 🍅 🫒 🥥 🥑 🍆 🥔 🥕 🌽 🌶️ 🫑 🥒 🥬 🥦 🧄 🧅 🍄 🥜 🌰 🍞 🥐 🥖 🫓 🥨 🥯 🥞 🧇 🧀 🍖 🍗 🥩 🥓 🍔 🍟 🍕 🌭 🥪 🌮 🌯 🫔 🥙 🧆 🥚 🍳 🥘 🍲 🫕 🥣 🥗 🍿 🧈 🧂 🥫 🍱 🍘 🍙 🍚 🍛 🍜 🍝 🍠 🍢 🍣 🍤 🍥 🥮 🍡 🥟 🥠 🥡 🦪 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🥧 🍫 🍬 🍭 🍮 🍯 🍼 🥛 ☕ 🫖 🍵 🍶 🍾 🍷 🍸 🍹 🍺 🍻 🥂 🥃 🥤 🧋 🧃 🧉 🧊 🥢 🍽️ 🍴 🥄".split(" ") },
  { name: "Atividades", icon: "⚽", emojis: "⚽ 🏀 🏈 ⚾ 🥎 🎾 🏐 🏉 🥏 🎱 🪀 🏓 🏸 🏒 🏑 🥍 🏏 🪃 🥅 ⛳ 🪁 🏹 🎣 🤿 🥊 🥋 🎽 🛹 🛼 🛷 ⛸️ 🥌 🎿 ⛷️ 🏂 🪂 🏋️ 🤼 🤸 ⛹️ 🤺 🤾 🏌️ 🏇 🧘 🏄 🏊 🤽 🚣 🧗 🚵 🚴 🏆 🥇 🥈 🥉 🏅 🎖️ 🏵️ 🎗️ 🎫 🎟️ 🎪 🤹 🎭 🩰 🎨 🎬 🎤 🎧 🎼 🎹 🥁 🪘 🎷 🎺 🪗 🎸 🪕 🎻 🎲 ♟️ 🎯 🎳 🎮 🎰 🧩 🎁 🎈 🎏 🎀 🎉 🎊 🎎 🏮 🎐 🧧 ✨ 🎇 🎆".split(" ") },
  { name: "Viagens e lugares", icon: "🚗", emojis: "🚗 🚕 🚙 🚌 🚎 🏎️ 🚓 🚑 🚒 🚐 🛻 🚚 🚛 🚜 🦯 🦽 🦼 🛴 🚲 🛵 🏍️ 🛺 🚨 🚔 🚍 🚘 🚖 🚡 🚠 🚟 🚃 🚋 🚞 🚝 🚄 🚅 🚈 🚂 🚆 🚇 🚊 🚉 ✈️ 🛫 🛬 🛩️ 💺 🚀 🛸 🚁 🛶 ⛵ 🚤 🛥️ 🛳️ ⛴️ 🚢 ⚓ ⛽ 🚧 🚦 🚥 🚏 🗺️ 🗿 🗽 🗼 🏰 🏯 🏟️ 🎡 🎢 🎠 ⛲ ⛱️ 🏖️ 🏝️ 🏜️ 🌋 ⛰️ 🏔️ 🗻 🏕️ ⛺ 🏠 🏡 🏘️ 🏚️ 🏗️ 🏭 🏢 🏬 🏣 🏤 🏥 🏦 🏨 🏪 🏫 🏩 💒 🏛️ ⛪ 🕌 🕍 🛕 🕋 ⛩️ 🌁 🌃 🏙️ 🌄 🌅 🌆 🌇 🌉 🌌 🎑 🏞️ 🌠 🎇 🌈".split(" ") },
  { name: "Objetos", icon: "💡", emojis: "⌚ 📱 💻 ⌨️ 🖥️ 🖨️ 🖱️ 🕹️ 🗜️ 💽 💾 💿 📀 📼 📷 📸 📹 🎥 📽️ 🎞️ 📞 ☎️ 📟 📠 📺 📻 🎙️ 🎚️ 🎛️ 🧭 ⏱️ ⏲️ ⏰ 🕰️ ⌛ ⏳ 📡 🔋 🔌 💡 🔦 🕯️ 🪔 🧯 🛢️ 💸 💵 💴 💶 💷 🪙 💰 💳 🧾 💎 ⚖️ 🪜 🧰 🪛 🔧 🔨 ⚒️ 🛠️ ⛏️ 🪚 🔩 ⚙️ 🧲 🔫 💣 🧨 🪓 🔪 🗡️ ⚔️ 🛡️ 🚬 ⚰️ ⚱️ 🏺 🔮 📿 🧿 💈 ⚗️ 🔭 🔬 🕳️ 🩹 🩺 💊 💉 🩸 🧬 🦠 🧫 🧪 🌡️ 🧹 🪠 🧺 🧻 🚽 🚰 🚿 🛁 🛀 🧼 🪥 🪒 🧽 🪣 🧴 🛎️ 🔑 🗝️ 🚪 🪑 🛋️ 🛏️ 🛌 🧸 🪆 🖼️ 🪞 🪟 🛍️ 🛒 🎁 🎀 🪄 🪅 🎊 🎉 ✉️ 📩 📨 📧 📮 📪 📫 📬 📭 📦 🏷️ 📜 📃 📄 📑 🧾 📊 📈 📉 🗒️ 🗓️ 📆 📅 📇 🗃️ 🗳️ 🗄️ 📋 📁 📂 🗂️ 🗞️ 📰 📓 📔 📒 📕 📗 📘 📙 📚 📖 🔖 🧷 🔗 📎 🖇️ 📐 📏 🧮 📌 📍 ✂️ 🖊️ 🖋️ ✒️ 🖌️ 🖍️ 📝 ✏️ 🔍 🔎 🔏 🔐 🔒 🔓".split(" ") },
  { name: "Símbolos", icon: "❤️", emojis: "❤️ 🧡 💛 💚 💙 💜 🖤 🤍 🤎 💔 ❣️ 💕 💞 💓 💗 💖 💘 💝 💟 ☮️ ✝️ ☪️ 🕉️ ☸️ ✡️ 🔯 🕎 ☯️ ☦️ 🛐 ⛎ ♈ ♉ ♊ ♋ ♌ ♍ ♎ ♏ ♐ ♑ ♒ ♓ 🆔 ⚛️ 🉑 ☢️ ☣️ 📴 📳 🈶 🈚 🈸 🈺 🈷️ ✴️ 🆚 💮 🉐 ㊙️ ㊗️ 🈴 🈵 🈹 🈲 🅰️ 🅱️ 🆎 🆑 🅾️ 🆘 ❌ ⭕ 🛑 ⛔ 📛 🚫 💯 💢 ♨️ 🚷 🚯 🚳 🚱 🔞 📵 🚭 ❗ ❕ ❓ ❔ ‼️ ⁉️ 🔅 🔆 〽️ ⚠️ 🚸 🔱 ⚜️ 🔰 ♻️ ✅ 🈯 💹 ❇️ ✳️ ❎ 🌐 💠 Ⓜ️ 🌀 💤 🏧 🚾 ♿ 🅿️ 🛗 🈳 🈂️ 🛂 🛃 🛄 🛅 🚹 🚺 🚼 ⚧️ 🚻 🚮 🎦 📶 🈁 🔣 ℹ️ 🔤 🔡 🔠 🆖 🆗 🆙 🆒 🆕 🆓 0️⃣ 1️⃣ 2️⃣ 3️⃣ 4️⃣ 5️⃣ 6️⃣ 7️⃣ 8️⃣ 9️⃣ 🔟 🔢 #️⃣ *️⃣ ⏏️ ▶️ ⏸️ ⏯️ ⏹️ ⏺️ ⏭️ ⏮️ ⏩ ⏪ ⏫ ⏬ ◀️ 🔼 🔽 ➡️ ⬅️ ⬆️ ⬇️ ↗️ ↘️ ↙️ ↖️ ↕️ ↔️ ↪️ ↩️ ⤴️ ⤵️ 🔀 🔁 🔂 🔄 🔃 🎵 🎶 ➕ ➖ ➗ ✖️ 🟰 ♾️ 💲 💱 ™️ ©️ ®️ 〰️ ➰ ➿ 🔚 🔙 🔛 🔝 🔜 ✔️ ☑️ 🔘 🔴 🟠 🟡 🟢 🔵 🟣 ⚫ ⚪ 🟤 🔺 🔻 🔸 🔹 🔶 🔷 🔳 🔲 ▪️ ▫️ ◾ ◽ ◼️ ◻️ 🟥 🟧 🟨 🟩 🟦 🟪 ⬛ ⬜ 🟫 🔈 🔇 🔉 🔊 🔔 🔕 📣 📢 💬 💭 🗯️ ♠️ ♣️ ♥️ ♦️ 🃏 🎴 🀄 🕐 🕑 🕒 🕓 🕔 🕕 🕖 🕗 🕘 🕙 🕚 🕛".split(" ") },
  { name: "Bandeiras", icon: "🚩", emojis: "🏁 🚩 🎌 🏴 🏳️ 🏳️‍🌈 🏳️‍⚧️ 🏴‍☠️ 🇧🇷 🇵🇹 🇺🇸 🇨🇦 🇲🇽 🇦🇷 🇨🇱 🇨🇴 🇵🇪 🇺🇾 🇵🇾 🇧🇴 🇻🇪 🇪🇨 🇬🇧 🇮🇪 🇫🇷 🇪🇸 🇮🇹 🇩🇪 🇨🇭 🇦🇹 🇳🇱 🇧🇪 🇸🇪 🇳🇴 🇩🇰 🇫🇮 🇵🇱 🇷🇺 🇺🇦 🇬🇷 🇹🇷 🇯🇵 🇰🇷 🇨🇳 🇮🇳 🇦🇺 🇳🇿 🇿🇦 🇪🇬 🇸🇦 🇦🇪 🇮🇱".split(" ") },
];
let _emojiCb = null, _emojiTab = 0;
function openEmojiPicker(cb) {
  _emojiCb = cb; _emojiTab = 0;
  const tabs = $("#emojiTabs");
  if (tabs) {
    tabs.innerHTML = EMOJI_GROUPS.map((g, i) => `<button type="button" class="emoji-tab${i === 0 ? " active" : ""}" data-tab="${i}" title="${g.name}">${g.icon || g.emojis[0]}</button>`).join("");
    $$(".emoji-tab", tabs).forEach(b => b.onclick = () => { _emojiTab = +b.dataset.tab; $$(".emoji-tab", tabs).forEach(x => x.classList.toggle("active", x === b)); renderEmojiGrid(); });
  }
  renderEmojiGrid();
  showModal("#emojiModal");
}
function renderEmojiGrid() {
  const grid = $("#emojiGrid"); if (!grid) return;
  const g = EMOJI_GROUPS[_emojiTab] || EMOJI_GROUPS[0];
  const nm = $("#emojiCatName"); if (nm) nm.textContent = g.name;
  grid.scrollTop = 0;
  grid.innerHTML = g.emojis.filter(Boolean).map(e => `<button type="button" class="emoji-cell">${e}</button>`).join("");
  $$(".emoji-cell", grid).forEach(b => b.onclick = () => { const cb = _emojiCb; $("#emojiModal").classList.add("hidden"); if (cb) cb(b.textContent); });
}

/* ---------- Gráfico Orçamento × Realizado (por categoria, do mês) ---------- */
function renderOrcRealChart(m) {
  const host = $("#orcWrap"); if (!host) return;
  if (charts.orc) { try { charts.orc.destroy(); } catch (e) {} charts.orc = null; }
  const real = realizadoPorCategoria(m), orc = DATA.orcamento || {};
  const rows = [];
  catList().forEach(c => { const o = Number(orc[c.id]) || 0, r = Number(real[c.id]) || 0; if (o > 0 || r > 0) rows.push({ label: `${c.emoji} ${c.nome}`, o, r }); });
  if (real.__none) rows.push({ label: "📦 Sem categoria", o: 0, r: real.__none });
  rows.sort((a, b) => Math.max(b.o, b.r) - Math.max(a.o, a.r));
  const top = rows.slice(0, 12);
  const resumoEl = $("#orcResumo");
  if (!top.length) {
    host.style.height = ""; host.innerHTML = `<div class="empty">Defina metas no menu ☰ → <b>Categorias e orçamento</b> e classifique seus gastos por categoria.</div>`;
    if (resumoEl) resumoEl.innerHTML = "";
    return;
  }
  host.style.height = Math.max(150, top.length * 42 + 34) + "px";
  host.innerHTML = `<canvas id="orcChart"></canvas>`;
  if (typeof Chart === "undefined") return;
  const ink = (getComputedStyle(document.documentElement).getPropertyValue("--ink") || "#1a1a1a").trim();
  charts.orc = new Chart($("#orcChart"), {
    type: "bar",
    data: { labels: top.map(x => x.label), datasets: [
      { label: "Orçamento", data: top.map(x => x.o), backgroundColor: "#9aa0a6aa", borderRadius: 5 },
      { label: "Realizado", data: top.map(x => x.r), backgroundColor: top.map(x => (x.o > 0 && x.r > x.o) ? "#e5484d" : "#1db954"), borderRadius: 5 },
    ] },
    options: {
      indexAxis: "y", responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: true, position: "top" }, tooltip: { callbacks: { label: ctx => `${ctx.dataset.label}: ${brl(ctx.parsed.x)}` } } },
      scales: { x: { beginAtZero: true, ticks: { callback: v => "R$ " + (v >= 1000 ? (v / 1000) + "k" : v) } }, y: { ticks: { color: ink, font: { size: 12 } } } }
    }
  });
  const totO = top.reduce((s, x) => s + x.o, 0), totR = top.reduce((s, x) => s + x.r, 0);
  if (resumoEl) {
    const usoPct = totO > 0 ? Math.round(totR / totO * 100) : null;
    const realCls = (totO > 0 && totR > totO) ? "neg" : "pos";
    resumoEl.innerHTML = `<div class="orc-sum">
      <div class="orc-row">
        <div class="orc-col"><span class="orc-lbl">Orçado</span><b>${brl(totO)}</b></div>
        <div class="orc-col right"><span class="orc-lbl">Realizado</span><b class="${realCls}">${brl(totR)}</b></div>
      </div>
      ${usoPct != null ? `<div class="orc-pct-wrap"><span class="orc-pct ${totR > totO ? "neg" : "pos"}">${usoPct}% do orçamento</span></div>` : ""}
    </div>`;
  }
}

/* ---------- Infra ---------- */
function showModal(s) { const el = $(s); el.classList.remove("hidden"); bindMoneyAll(el); }
function closeModal() { $("#modal").classList.add("hidden"); }

/* ---------- Trava de scroll do fundo enquanto um modal está aberto ----------
   No iOS, sem isso o scroll "vaza" pra página atrás do modal/bottom-sheet.
   position:fixed no body (com top = -scrollY) congela o fundo; restaura ao fechar.
   Um MutationObserver mantém a trava em dia para QUALQUER .modal (compra, cartão,
   configurações, sync, alerta…), sem precisar editar cada ponto de fechar. */
let _scrollLockY = 0;
function lockScroll() {
  if (document.body.classList.contains("scroll-locked")) return;
  _scrollLockY = window.scrollY || window.pageYOffset || 0;
  document.body.style.top = `-${_scrollLockY}px`;
  document.body.classList.add("scroll-locked");
}
function unlockScroll() {
  if (!document.body.classList.contains("scroll-locked")) return;
  document.body.classList.remove("scroll-locked");
  document.body.style.top = "";
  window.scrollTo(0, _scrollLockY);
}
let _slRaf = 0;
function refreshScrollLock() {
  if (_slRaf) return;
  _slRaf = requestAnimationFrame(() => {
    _slRaf = 0;
    if (document.querySelector(".modal:not(.hidden)")) lockScroll(); else unlockScroll();
  });
}
try {
  new MutationObserver(refreshScrollLock)
    .observe(document.body, { subtree: true, attributes: true, attributeFilter: ["class"] });
} catch (e) {}
function persist() {
  DATA.updatedAt = Date.now();
  localStorage.removeItem("financas2026.isSeed");   // ação real do usuário → some o banner "dados de exemplo"
  history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift();
  redoStack = []; // ação nova invalida o "refazer"
  lastSnap = JSON.stringify(DATA);
  saveData(DATA); render(); pushSync(); cpSend();   // cpSend = manda a mudança pro parceiro (conta conjunta), ao vivo
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
$$(".tab").forEach(t => t.onclick = () => commitTab(t));
bindGlassDrag($(".tabbar"), ".tab", commitTab, "tab");
window.addEventListener("resize", () => { syncTabGlass(false); });
$("#fab").onclick = () => curTab === "diaria" ? openDiariaChooser() : curTab === "cartao" ? openCartaoChooser() : openEntryModal(curTab, null);
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
function openSettings() { $("#saldoInicial").value = DATA.saldoInicial || 0; renderNotifBtn(); showModal("#settingsModal"); }
{ const bs = $("#btnSettings"); if (bs) bs.onclick = openSettings; }   // botão saiu do header; fica no menu
$("#btnCloseSettings").onclick = () => { DATA.saldoInicial = moneyVal($("#saldoInicial")); persist(); $("#settingsModal").classList.add("hidden"); };
$("#settingsModal").onclick = (e) => { if (e.target.id === "settingsModal") $("#settingsModal").classList.add("hidden"); };
$("#btnExport").onclick = () => { const b = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = `financas-${DATA.year}-backup.json`; a.click(); toast("Backup exportado"); };
$("#btnImport").onclick = () => $("#importFile").click();
$("#importFile").onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => { try { DATA = migrate(JSON.parse(r.result)); persist(); toast("Backup importado"); $("#settingsModal").classList.add("hidden"); } catch { toast("Arquivo inválido"); } }; r.readAsText(f); };
$("#btnReset").onclick = () => { if (confirm("Apagar tudo e voltar aos dados de exemplo?")) { DATA = resetData(); persist(); toast("Restaurado"); $("#settingsModal").classList.add("hidden"); } };

/* ---------- Menu lateral (☰) — hub de opções ---------- */
function openMenu() {
  const m = $("#menuDrawer"); if (!m) return;
  const v = $("#menuVer"); if (v) v.textContent = APP_VERSION;
  m.classList.remove("hidden");
  $$(".menu-item", m).forEach((it, i) => it.style.setProperty("--mi", i));   // entrada em sequência (stagger)
}
function closeMenu() { const m = $("#menuDrawer"); if (m) m.classList.add("hidden"); }
const _onbHide = () => { const o = $("#onboarding"); if (o) o.classList.add("hidden"); };
$("#btnMenu").onclick = openMenu;
$("#menuClose").onclick = closeMenu;
$("#menuDrawer").onclick = (e) => { if (e.target.id === "menuDrawer") closeMenu(); };
{ const mu = $("#miUpdate"); if (mu) mu.onclick = updateNow; }
{ const mp = $("#miPerfil"); if (mp) mp.onclick = () => { closeMenu(); openProfile(); }; }
$("#miImport").onclick = () => { closeMenu(); $("#importFile").click(); };
$("#miExport").onclick = () => { closeMenu(); $("#btnExport").click(); };
$("#miSync").onclick = () => { closeMenu(); if (syncCfg()) pullSync(true, null, true); else configurarSync(); };
$("#miSim").onclick = () => { closeMenu(); curTab = "resumo"; resumoView = "graficos"; $$(".tab").forEach(x => x.classList.toggle("active", /Resumo/.test(x.textContent))); suppressNextAnim = true; window.scrollTo(0, 0); render(); };
$("#miConfig").onclick = () => { closeMenu(); openSettings(); };
{ const ma = $("#miAviso"); if (ma) ma.onclick = () => { closeMenu(); openAvisoModal(); }; }
{ const mc = $("#miCategorias"); if (mc) mc.onclick = () => { closeMenu(); openCategoriasModal(); }; }
{ const x = $("#catClose"); if (x) x.onclick = () => $("#catModal").classList.add("hidden"); }
{ const a = $("#catAdd"); if (a) a.onclick = addCategoria; }
{ const cm = $("#catModal"); if (cm) cm.onclick = (e) => { if (e.target.id === "catModal") cm.classList.add("hidden"); }; }
{ const x = $("#emojiClose"); if (x) x.onclick = () => $("#emojiModal").classList.add("hidden"); }
{ const em = $("#emojiModal"); if (em) em.onclick = (e) => { if (e.target.id === "emojiModal") em.classList.add("hidden"); }; }
$("#miAcesso").onclick = () => { closeMenu(); openAccessModal(); };   // dados reais (PIN) e modo teste (0000)
$("#miTema").onclick = () => { cycleTheme(); };
$("#miZero").onclick = () => { closeMenu(); wipeToZero(_onbHide, _onbHide); };
const _te = $("#testExit"); if (_te) _te.onclick = exitTestMode;
document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });

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
  toast(`🎉 Atualizado para v${APP_VERSION}`);   // toast pequeno no lugar do banner verde grande
}

// ===== "Nova atualização disponível" — compara a versão no ar (version.json) com a rodando =====
let updateShown = false;
async function checkForUpdate() {
  if (updateShown) return;
  try {
    const r = await fetch("version.json?cb=" + Date.now(), { cache: "no-store" });
    if (!r.ok) return;
    const j = await r.json();
    if (j && j.version && j.version !== APP_VERSION) showUpdateBanner(j.version);
  } catch (e) {}
}
let updateVer = "";
function showUpdateBanner(ver) {          // "tem atualização" → ✨ no cabeçalho + OPÇÃO NO MENU
  updateShown = true; if (ver) updateVer = ver;
  const icon = $("#btnWhatsNew"); if (icon) icon.classList.remove("hidden");   // CSS já faz o bob + .wn-dot pulsa
  const mi = $("#miUpdate"); if (mi) mi.classList.remove("hidden");            // opção no menu (some quando não há update)
  const sub = $("#miUpdateSub"); if (sub) sub.textContent = updateVer ? ("toque para instalar a v" + updateVer) : "nova versão disponível";
}
// abre o modal central de novidades com o changelog
function openWhatsNew() {
  const m = $("#whatsNewModal"); if (!m) return;
  // Mostra SÓ as melhorias da versão ATUAL (a mais recente), não o histórico inteiro.
  const atual = (CHANGELOG || [])[0] || { version: APP_VERSION, bullets: [] };
  const ver = $("#wnVersion"); if (ver) ver.textContent = "v" + esc(atual.version);
  const body = $("#wnBody");
  if (body) body.innerHTML = '<div class="wn-entry"><ul>'
    + (atual.bullets || []).map(function (b) { return '<li>' + esc(b) + '</li>'; }).join("")
    + '</ul></div>';
  m.classList.remove("hidden");
}
function closeWhatsNew() { const m = $("#whatsNewModal"); if (m) m.classList.add("hidden"); }
function applyUpdate(btn) {               // "Aceitar e atualizar": força SW novo + limpa cache + recarrega
  if (btn) { btn.textContent = "Atualizando…"; btn.disabled = true; }
  (async () => {
    let reloaded = false;
    const go = () => { if (reloaded) return; reloaded = true; try { location.reload(); } catch (e) { location.href = location.pathname; } };
    try {
      if ("serviceWorker" in navigator) {
        try { navigator.serviceWorker.addEventListener("controllerchange", go, { once: true }); } catch (e) {}
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          try { await reg.update(); } catch (e) {}
          const w = reg.waiting || reg.installing;            // manda o SW novo assumir (waiting OU instalando)
          if (w) { try { w.postMessage("skipWaiting"); } catch (e) {} }
        }
      }
      // limpa TODO o cache do app → no reload, o network-first baixa tudo de novo (resolve "não sobe" no iOS)
      if (window.caches && caches.keys) {
        const keys = await caches.keys();
        await Promise.all(keys.filter(k => k !== "fin-meta").map(k => { try { return caches.delete(k); } catch (e) { return null; } }));
      }
    } catch (e) {}
    setTimeout(go, 1500);   // fallback: se o controllerchange não vier, recarrega mesmo assim
  })();
}
// Opção do menu: atualiza agora (mesma rotina robusta), com aviso
function updateNow() { closeMenu(); toast("Atualizando o app…"); applyUpdate(null); }
/* ---------- 👤 Perfil (nome, aniversário, foto) — guardado SÓ no aparelho (localStorage), não vai pra nuvem nem pro repo ---------- */
const PERFIL_KEY = "financas2026.perfil";
function getPerfil() { try { return JSON.parse(localStorage.getItem(PERFIL_KEY) || "{}") || {}; } catch (e) { return {}; } }
function setPerfil(p) { try { localStorage.setItem(PERFIL_KEY, JSON.stringify(p)); } catch (e) {} }
/* ---------- Avatares predefinidos (estilo Netflix) — SVG inline, offline, sem download ---------- */
const AVATARS = [
  { c1: "#15c266", c2: "#0b3d2e", e: "🦊" }, { c1: "#2f7ff0", c2: "#0b2a5e", e: "🐼" },
  { c1: "#f5a623", c2: "#9a5b00", e: "🦁" }, { c1: "#e0518a", c2: "#7a1840", e: "🐱" },
  { c1: "#9b6cf0", c2: "#3d1f7a", e: "🐵" }, { c1: "#19c2b3", c2: "#0a4f49", e: "🐸" },
  { c1: "#ef5350", c2: "#7a1a18", e: "🦉" }, { c1: "#7ed957", c2: "#2e6b16", e: "🐯" },
  { c1: "#42a5f5", c2: "#123e6b", e: "🐧" }, { c1: "#ffca28", c2: "#8a6a00", e: "🐥" },
  { c1: "#ff8a65", c2: "#8a3415", e: "🦄" }, { c1: "#26c6da", c2: "#0a4a55", e: "🐬" }
];
function avatarDataURI(a) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a.c1}"/><stop offset="1" stop-color="${a.c2}"/></linearGradient></defs><rect width="120" height="120" rx="60" fill="url(#g)"/><text x="60" y="62" font-size="60" text-anchor="middle" dominant-baseline="central">${a.e}</text></svg>`;
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
}
// avatar padrão (determinístico pelo nome) p/ quem ainda não escolheu foto — nunca fica o 👤 sem graça
function defaultAvatarFor(name) {
  const s = (name || "").trim();
  let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0;
  return avatarDataURI(AVATARS[h % AVATARS.length]);
}
function renderAvatar() {
  const b = document.getElementById("btnProfile"); if (!b) return;
  const p = getPerfil();
  const img = b.querySelector(".avatar-img"), ini = b.querySelector(".avatar-ini");
  b.classList.add("has-photo");
  if (img) img.style.backgroundImage = `url("${p.foto || defaultAvatarFor(p.nome)}")`;   // sem foto → avatar padrão (nunca 👤 vazio)
  if (ini) ini.textContent = "";
  b.title = p.nome ? esc(p.nome) : "Meu perfil";
}
let _profFotoTmp = "", _profTipo = "pessoal";
function openProfile() {
  const m = $("#profileModal"); if (!m) return;
  const p = getPerfil();
  $("#profNome").value = p.nome || "";
  $("#profNasc").value = p.nasc || "";
  _profFotoTmp = p.foto || "";
  _profTipo = p.tipo === "conjunta" ? "conjunta" : "pessoal";
  refreshProfPhoto(); refreshProfTipo();
  const nm = $("#profNome"); if (nm) nm.oninput = () => { if (!_profFotoTmp) refreshProfPhoto(); };   // avatar padrão acompanha o nome
  m.classList.remove("hidden");
}
function refreshProfTipo() {
  $$("#profTipoSeg .seg-btn").forEach(b => b.classList.toggle("active", b.dataset.tipo === _profTipo));
  const conj = $("#profConjunta"); if (conj) conj.classList.toggle("hidden", _profTipo !== "conjunta");
  const st = $("#profPairStatus"); if (st) st.innerHTML = coupleActive() ? '<span class="pair-ok">🟢 Conta conjunta ativa na nuvem</span>' : (syncCfg() ? '<span class="pair-ok">☁️ Sincronização ativa</span>' : "");
}
function refreshProfPhoto() {
  const ph = $("#profPhotoBtn"); if (!ph) return;
  const img = ph.querySelector(".prof-photo-img");
  const nome = ($("#profNome") && $("#profNome").value) || "";
  const cur = _profFotoTmp || defaultAvatarFor(nome);          // sem escolha → avatar padrão (estilo Netflix)
  ph.classList.remove("empty"); if (img) img.style.backgroundImage = `url("${cur}")`;
  $("#profPhotoRemove").classList.toggle("hidden", !_profFotoTmp);   // "Remover" só quando há foto escolhida
  renderAvatarPicker();
}
function renderAvatarPicker() {
  const row = $("#avatarRow"); if (!row) return;
  row.innerHTML = AVATARS.map((a, i) => {
    const uri = avatarDataURI(a), on = _profFotoTmp === uri ? " on" : "";
    return `<button type="button" class="av-opt${on}" data-av="${i}" style="background-image:url(&quot;${uri}&quot;)" aria-label="Avatar ${i + 1}"></button>`;
  }).join("") + `<button type="button" class="av-opt av-import" id="avImport" aria-label="Importar foto">＋</button>`;
  $$(".av-opt[data-av]", row).forEach(b => b.onclick = () => { _profFotoTmp = avatarDataURI(AVATARS[+b.dataset.av]); refreshProfPhoto(); });
  const imp = $("#avImport", row); if (imp) imp.onclick = () => $("#profFile").click();
}
function saveProfile() {
  const p = getPerfil();
  p.nome = ($("#profNome").value || "").trim();
  p.nasc = $("#profNasc").value || "";
  p.foto = _profFotoTmp || "";
  p.tipo = _profTipo;
  setPerfil(p); renderAvatar();
  $("#profileModal").classList.add("hidden");
  toast("Perfil salvo ✅");
}
(function bindProfile() {
  const open = $("#btnProfile"); if (open) open.onclick = openProfile;
  const c = $("#profClose"); if (c) c.onclick = () => $("#profileModal").classList.add("hidden");
  const m = $("#profileModal"); if (m) m.onclick = (e) => { if (e.target === m) m.classList.add("hidden"); };
  const pb = $("#profPhotoBtn"); if (pb) pb.onclick = () => $("#profFile").click();
  const rm = $("#profPhotoRemove"); if (rm) rm.onclick = () => { _profFotoTmp = ""; refreshProfPhoto(); };
  $$("#profTipoSeg .seg-btn").forEach(b => b.onclick = () => { _profTipo = b.dataset.tipo; refreshProfTipo(); });
  const pair = $("#profPair"); if (pair) pair.onclick = () => openPairModal();
  const sh = $("#profSyncHelp"); if (sh) sh.onclick = () => openSyncHelp();
  const sv = $("#profSave"); if (sv) sv.onclick = saveProfile;
  const f = $("#profFile"); if (f) f.onchange = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return;
    const r = new FileReader();
    r.onload = () => openCropper(r.result);
    r.readAsDataURL(file);
    e.target.value = "";   // permite reescolher o mesmo arquivo depois
  };
})();

/* ---------- Recorte CIRCULAR da foto: arrasta pra posicionar + zoom; exporta 320×320 ---------- */
let _crop = { img: null, S: 0, base: 1, z: 1, tx: 0, ty: 0, dispW: 0, dispH: 0 };
function openCropper(dataUrl) {
  const m = $("#cropModal"), img = $("#cropImg"), stage = $("#cropStage");
  img.onload = () => {
    const S = stage.clientWidth || 260;
    _crop.img = img; _crop.S = S; _crop.z = 1;
    _crop.base = S / Math.min(img.naturalWidth, img.naturalHeight);
    $("#cropZoom").value = 1;
    layoutCrop(true);
    m.classList.remove("hidden");
  };
  img.src = dataUrl;
}
function layoutCrop(center) {
  const c = _crop, img = c.img; if (!img) return;
  c.dispW = img.naturalWidth * c.base * c.z;
  c.dispH = img.naturalHeight * c.base * c.z;
  if (center) { c.tx = (c.S - c.dispW) / 2; c.ty = (c.S - c.dispH) / 2; }
  clampCrop(); applyCrop();
}
function clampCrop() { const c = _crop; c.tx = Math.min(0, Math.max(c.S - c.dispW, c.tx)); c.ty = Math.min(0, Math.max(c.S - c.dispH, c.ty)); }
function applyCrop() { const c = _crop, img = c.img; if (!img) return; img.style.width = c.dispW + "px"; img.style.height = c.dispH + "px"; img.style.left = c.tx + "px"; img.style.top = c.ty + "px"; }
function cropExport() {
  const c = _crop, out = 320, k = out / c.S;
  const cv = document.createElement("canvas"); cv.width = out; cv.height = out;
  const ctx = cv.getContext("2d");
  ctx.fillStyle = "#06251a"; ctx.fillRect(0, 0, out, out);
  ctx.drawImage(c.img, c.tx * k, c.ty * k, c.dispW * k, c.dispH * k);
  return cv.toDataURL("image/jpeg", 0.85);
}
(function bindCropper() {
  const stage = $("#cropStage"); if (!stage) return;
  let drag = null;
  stage.addEventListener("pointerdown", (e) => { if (!_crop.img) return; drag = { x: e.clientX, y: e.clientY, tx: _crop.tx, ty: _crop.ty }; try { stage.setPointerCapture(e.pointerId); } catch (er) {} });
  stage.addEventListener("pointermove", (e) => { if (!drag) return; _crop.tx = drag.tx + (e.clientX - drag.x); _crop.ty = drag.ty + (e.clientY - drag.y); clampCrop(); applyCrop(); });
  const end = () => drag = null;
  stage.addEventListener("pointerup", end); stage.addEventListener("pointercancel", end); stage.addEventListener("pointerleave", end);
  const zoom = $("#cropZoom"); if (zoom) zoom.oninput = (e) => {
    const c = _crop; if (!c.img) return;
    const nz = parseFloat(e.target.value) || 1, cx = c.S / 2, cy = c.S / 2, k = nz / c.z;
    c.tx = cx - (cx - c.tx) * k; c.ty = cy - (cy - c.ty) * k; c.z = nz;
    c.dispW = c.img.naturalWidth * c.base * c.z; c.dispH = c.img.naturalHeight * c.base * c.z;
    clampCrop(); applyCrop();
  };
  const cancel = $("#cropCancel"); if (cancel) cancel.onclick = () => $("#cropModal").classList.add("hidden");
  const ok = $("#cropOk"); if (ok) ok.onclick = () => { _profFotoTmp = cropExport(); refreshProfPhoto(); $("#cropModal").classList.add("hidden"); };
})();

(function bindNotif() {
  const c = $("#notifClose"); if (c) c.onclick = closeNotif;
  const v = $("#notifVer"); if (v) v.onclick = verNaLista;
  const m = $("#notifModal"); if (m) m.onclick = (e) => { if (e.target === m) closeNotif(); };
})();
(function bindBell() { const b = $("#btnBell"); if (b) b.onclick = abrirAlertas; })();

/* ===================== 💑 Conta conjunta — sync P2P ao vivo (WebRTC), SEM nuvem =====================
   Um celular cria o "convite" (offer), o outro lê (QR/código) e devolve a "resposta" (answer).
   Conexão DIRETA entre os aparelhos; os dados trafegam pelo canal P2P e NUNCA são guardados em servidor.
   STUN do Google é usado só p/ descobrir o IP (não recebe dados). Vale enquanto os dois apps estão abertos. */
const RTC_CFG = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };
let _cp = { pc: null, ch: null, role: null, applying: false };
let _pairStep = "home", _pairPrefill = "";
function cpConnected() { return !!(_cp.ch && _cp.ch.readyState === "open"); }
function _b64u(u8) { let s = ""; for (const b of u8) s += String.fromCharCode(b); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function _unb64u(s) { s = s.replace(/-/g, "+").replace(/_/g, "/"); while (s.length % 4) s += "="; const bin = atob(s); const u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; }
async function cpEncode(obj) {
  const json = JSON.stringify(obj);
  try {
    if (window.CompressionStream) {
      const cs = new CompressionStream("gzip");
      const blob = await new Response(new Blob([json]).stream().pipeThrough(cs)).blob();
      return "g" + _b64u(new Uint8Array(await blob.arrayBuffer()));
    }
  } catch (e) {}
  return "j" + _b64u(new TextEncoder().encode(json));
}
async function cpDecode(str) {
  str = (str || "").trim();
  const i = str.indexOf("pair="); if (i >= 0) str = str.slice(i + 5);
  str = str.trim();
  const tag = str[0], bytes = _unb64u(str.slice(1));
  if (tag === "g" && window.DecompressionStream) {
    const ds = new DecompressionStream("gzip");
    const blob = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).blob();
    return JSON.parse(await blob.text());
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
function cpWaitIce(pc) {
  return new Promise(res => {
    if (pc.iceGatheringState === "complete") return res();
    const check = () => { if (pc.iceGatheringState === "complete") { pc.removeEventListener("icegatheringstatechange", check); res(); } };
    pc.addEventListener("icegatheringstatechange", check);
    setTimeout(res, 2800);   // não trava se o ICE demorar
  });
}
function cpSetupChannel(ch) {
  _cp.ch = ch;
  ch.onopen = cpOnConnect;
  ch.onclose = () => { refreshProfTipo(); renderPairBody(); };
  ch.onmessage = (e) => { try { const m = JSON.parse(e.data); if (m && m.t === "data" && m.data) cpApplyRemote(m.data); } catch (er) {} };
}
function cpOnConnect() { toast("Casal pareado 🔗"); refreshProfTipo(); renderPairBody(); cpSend(); }
function cpApplyRemote(remote) {
  const lt = (DATA && DATA.updatedAt) || 0, rt = (remote && remote.updatedAt) || 0;
  if (rt > lt) {
    _cp.applying = true;
    DATA = migrate(remote); if (!DATA.updatedAt) DATA.updatedAt = rt;
    saveData(DATA); lastSnap = JSON.stringify(DATA); render();
    _cp.applying = false;
    toast("Atualizado pelo parceiro ⤓");
  }
}
function cpSend() { if (!cpConnected() || _cp.applying) return; try { _cp.ch.send(JSON.stringify({ t: "data", data: DATA })); } catch (e) {} }
function cpReset() { try { if (_cp.ch) _cp.ch.close(); } catch (e) {} try { if (_cp.pc) _cp.pc.close(); } catch (e) {} _cp = { pc: null, ch: null, role: null, applying: false }; }
// avisa quando a conexão falha (rede 4G/5G costuma bloquear P2P sem servidor de apoio)
function cpWatchState(pc) {
  pc.onconnectionstatechange = () => {
    const st = pc.connectionState;
    if (st === "failed" || (st === "disconnected" && !cpConnected())) {
      const el = document.querySelector("#pairBody .pair-wait, #pairBody .pair-msg");
      if (el) el.innerHTML = '<span class="pair-err">Não fechou a conexão 😕 — pode ser a rede do celular (4G/5G). Tentem no <b>mesmo Wi-Fi</b> e gerem um convite novo.</span>';
      refreshProfTipo();
    }
  };
}
async function cpCreateOffer() {
  cpReset(); _cp.role = "host";
  const pc = new RTCPeerConnection(RTC_CFG); _cp.pc = pc;
  cpSetupChannel(pc.createDataChannel("fin")); cpWatchState(pc);
  await pc.setLocalDescription(await pc.createOffer()); await cpWaitIce(pc);
  return cpEncode({ t: pc.localDescription.type, s: pc.localDescription.sdp });
}
async function cpAcceptAnswer(code) { const d = await cpDecode(code); await _cp.pc.setRemoteDescription({ type: d.t, sdp: d.s }); }
async function cpCreateAnswer(code) {
  cpReset(); _cp.role = "guest";
  const pc = new RTCPeerConnection(RTC_CFG); _cp.pc = pc;
  pc.ondatachannel = (e) => cpSetupChannel(e.channel); cpWatchState(pc);
  const d = await cpDecode(code);
  await pc.setRemoteDescription({ type: d.t, sdp: d.s });
  await pc.setLocalDescription(await pc.createAnswer()); await cpWaitIce(pc);
  return cpEncode({ t: pc.localDescription.type, s: pc.localDescription.sdp });
}

/* ----- UI do pareamento ----- */
function pairLink(code) { return location.origin + location.pathname + "#pair=" + code; }
function pairFillShare(qrId, copyId, shareId, code, title) {
  const link = pairLink(code);
  const qel = document.getElementById(qrId);
  if (qel) {
    qel.innerHTML = "";
    try { const q = qrcode(0, "L"); q.addData(link); q.make(); qel.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
    catch (e) { qel.innerHTML = '<div class="pair-noqr">Código grande demais pro QR — use <b>Copiar</b> ou <b>Compartilhar</b>.</div>'; }
  }
  const cp = document.getElementById(copyId);
  if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(link); toast("Copiado ✓"); } catch (e) { toast("Copie o link manualmente"); } };
  const sh = document.getElementById(shareId);
  if (sh) sh.onclick = async () => { try { if (navigator.share) await navigator.share({ title: title, text: "Pareamento MorbiusFin (casal)", url: link }); else { await navigator.clipboard.writeText(link); toast("Copiado ✓"); } } catch (e) {} };
}
function openPairModal() { _pairStep = "home"; renderPairBody(); const m = $("#pairModal"); if (m) m.classList.remove("hidden"); }
function closePairModal() { const m = $("#pairModal"); if (m) m.classList.add("hidden"); }
// 📖 Guia à prova de erro de como sincronizar o casal
function openSyncHelp() {
  let m = document.getElementById("syncHelpModal");
  if (!m) {
    m = document.createElement("div"); m.id = "syncHelpModal"; m.className = "modal center hidden";
    m.innerHTML = '<div class="modal-card sh-card"><button type="button" class="wn-close" id="shClose">✕</button>'
      + '<div class="sh-head"><span>💑</span><h2>Como funciona a conta conjunta</h2></div>'
      + '<div class="sh-body">'
      + '<div class="sh-rules"><div class="sh-rules-t">☁️ Pela nuvem — funciona em qualquer rede:</div>'
      + '<ul><li>Os dois celulares usam o <b>mesmo cofre</b> na nuvem.</li>'
      + '<li>Funciona em <b>Wi-Fi ou dados móveis</b> — não precisam estar juntos nem na mesma rede.</li>'
      + '<li>O que um lança aparece pro outro em segundos (e ao abrir o app).</li></ul></div>'
      + '<div class="sh-steps-t">📲 Passo a passo:</div>'
      + '<ol class="sh-steps">'
      + '<li><b>Você (1º):</b> ative a <b>sincronização na nuvem</b> em ⚙️ (uma vez só).</li>'
      + '<li>No perfil → <b>Conta conjunta</b> → toque em <b>“Compartilhar convite”</b> e mande o link/QR pro seu par.</li>'
      + '<li><b>Ele (2º):</b> abre o link no celular. Se ainda não tem o app, instala (Android: Chrome → Instalar; iPhone: Safari → Compartilhar → Adicionar à Tela de Início) e abre o link de novo.</li>'
      + '<li>🟢 <b>Pronto!</b> Os dois compartilham a mesma conta. Cada um continua com o <b>seu</b> nome e foto.</li>'
      + '</ol>'
      + '<div class="sh-err-t">❓ Dúvidas comuns</div>'
      + '<ul class="sh-err"><li><b>Não apareceu o que ele lançou?</b> Puxe a tela pra baixo pra atualizar, ou reabra o app.</li>'
      + '<li><b>O link é seguro?</b> Ele dá acesso total à conta — mande só pra quem é da conta.</li>'
      + '<li><b>Ao entrar, o que acontece com a conta antiga dele?</b> Ele passa a usar a conta compartilhada; a anterior fica no histórico (Ctrl+Z).</li></ul>'
      + '</div>'
      + '<button type="button" class="btn primary" id="shPair">💑 Abrir conta conjunta</button></div>';
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); });
    m.querySelector("#shClose").onclick = () => m.classList.add("hidden");
    m.querySelector("#shPair").onclick = () => { m.classList.add("hidden"); openPairModal(); };
  }
  m.classList.remove("hidden");
}
// Preenche QR + Copiar + Compartilhar com um LINK pronto (usado pelo convite da conta conjunta na nuvem)
function pairFillShareLink(qrId, copyId, shareId, link, title) {
  const qel = document.getElementById(qrId);
  if (qel) {
    qel.innerHTML = "";
    try { const q = qrcode(0, "M"); q.addData(link); q.make(); qel.innerHTML = q.createSvgTag({ cellSize: 4, margin: 2, scalable: true }); }
    catch (e) { qel.innerHTML = '<div class="pair-noqr">Use <b>Copiar</b> ou <b>Compartilhar</b> o link.</div>'; }
  }
  const cp = document.getElementById(copyId);
  if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(link); toast("Link copiado ✓"); } catch (e) { toast("Copie o link manualmente"); } };
  const sh = document.getElementById(shareId);
  if (sh) sh.onclick = async () => { try { if (navigator.share) await navigator.share({ title: title, text: "Convite da nossa conta conjunta no MorbiusFin 💑", url: link }); else { await navigator.clipboard.writeText(link); toast("Link copiado ✓"); } } catch (e) {} };
}
function renderPairBody() {
  const b = $("#pairBody"); if (!b) return;
  // Conta conjunta pela NUVEM: os dois usam o mesmo cofre (qualquer rede). Pré-requisito: sync ativo.
  if (!syncCfg()) {
    b.innerHTML = '<p class="pair-intro">A <b>conta conjunta</b> funciona pela nuvem: os dois celulares usam o <b>mesmo cofre</b>, em <b>qualquer rede</b> (Wi-Fi ou dados). Primeiro, ative a sincronização na nuvem.</p>'
      + '<button class="btn primary" id="pairCfg">☁️ Ativar sincronização</button>'
      + '<button type="button" class="pair-guide-link" id="pairGuide">📖 Como funciona</button>';
    const cf = $("#pairCfg"); if (cf) cf.onclick = () => { closePairModal(); configurarSync(); };
    const g = $("#pairGuide"); if (g) g.onclick = openSyncHelp;
    return;
  }
  const link = cfgLink();
  b.innerHTML = '<p class="pair-intro">💑 <b>Conta conjunta na nuvem</b> — mande este convite pro seu par. Quando ele abrir o link no celular, vocês passam a compartilhar a <b>mesma conta</b>: o que um lançar aparece pro outro, em qualquer rede.</p>'
    + '<div class="pair-qr" id="pairQR"></div>'
    + '<div class="pair-actions"><button class="btn primary" id="pairShare">↗︎ Compartilhar convite</button><button class="btn ghost" id="pairCopy">📋 Copiar link</button></div>'
    + '<button class="btn ghost pair-role pair-invite" id="pairInstall">📲 Ainda não tem o app? Convidar pra instalar</button>'
    + '<button type="button" class="pair-guide-link" id="pairGuide">📖 Passo a passo</button>'
    + '<div class="pair-hint">⚠️ Este link dá acesso total à conta — mande só pra quem é da conta. Ao abrir, o app do seu par passa a usar a conta compartilhada (a conta dele anterior fica no histórico).</div>';
  pairFillShareLink("pairQR", "pairCopy", "pairShare", link, "Convite MorbiusFin (conta conjunta)");
  const inst = $("#pairInstall"); if (inst) inst.onclick = pairInviteAppLink;
  const g = $("#pairGuide"); if (g) g.onclick = openSyncHelp;
}
// Convidar a instalar JÁ com o link da conta conjunta (instala + entra no mesmo cofre num passo só)
async function pairInviteAppLink() {
  const link = cfgLink() || (location.origin + location.pathname);
  const msg = "Entra na nossa conta do MorbiusFin 💚\n\n1) Abra este link no celular:\n" + link
    + "\n\n📱 Android: abra no Chrome → menu (⋮) → \"Instalar app\"."
    + "\n🍎 iPhone: abra no Safari → Compartilhar → \"Adicionar à Tela de Início\"."
    + "\n\nPronto: vamos compartilhar a mesma conta, em qualquer rede.";
  try { if (navigator.share) await navigator.share({ title: "MorbiusFin (conta conjunta)", text: msg, url: link }); else { await navigator.clipboard.writeText(msg); toast("Convite copiado ✓ — cole no WhatsApp"); } } catch (e) {}
}
async function pairStartHost() {
  _pairStep = "host"; const b = $("#pairBody");
  b.innerHTML = '<p class="pair-step">Gerando convite…</p>';
  let code; try { code = await cpCreateOffer(); } catch (e) { b.innerHTML = '<p class="pair-err">Não consegui criar o convite. Tente de novo.</p><button class="btn ghost" id="pairBack">Voltar</button>'; const bk = $("#pairBack"); if (bk) bk.onclick = () => { _pairStep = "home"; renderPairBody(); }; return; }
  b.innerHTML = '<p class="pair-step"><b>1.</b> Envie este convite pro parceiro (QR, Copiar ou Compartilhar):</p>'
    + '<div class="pair-qr" id="pairQR"></div>'
    + '<div class="pair-actions"><button class="btn ghost" id="pairCopy">📋 Copiar</button><button class="btn ghost" id="pairShare">↗︎ Compartilhar</button></div>'
    + '<p class="pair-step"><b>2.</b> Cole aqui a resposta que ele te mandar:</p>'
    + '<textarea class="pair-ta" id="pairAns" placeholder="cole a resposta…"></textarea>'
    + '<button class="btn primary" id="pairConnect">Conectar</button><div class="pair-msg" id="pairMsg"></div>';
  pairFillShare("pairQR", "pairCopy", "pairShare", code, "Convite MorbiusFin");
  $("#pairConnect").onclick = async () => {
    const v = ($("#pairAns").value || "").trim(); if (!v) { $("#pairMsg").textContent = "Cole a resposta primeiro."; return; }
    $("#pairMsg").textContent = "Conectando…";
    try { await cpAcceptAnswer(v); } catch (e) { $("#pairMsg").textContent = "Resposta inválida — confira e tente de novo."; }
  };
}
async function pairGuestGen() {
  const inv = ($("#pairInv") ? $("#pairInv").value : _pairPrefill || "").trim();
  if (!inv) { const m = $("#pairMsg"); if (m) m.textContent = "Cole o convite primeiro."; return; }
  const b = $("#pairBody"); b.innerHTML = '<p class="pair-step">Gerando resposta…</p>';
  let code; try { code = await cpCreateAnswer(inv); } catch (e) { b.innerHTML = '<p class="pair-err">Convite inválido. Peça outro pro parceiro.</p><button class="btn ghost" id="pairBack">Voltar</button>'; const bk = $("#pairBack"); if (bk) bk.onclick = () => { _pairStep = "guest"; _pairPrefill = ""; renderPairBody(); }; return; }
  b.innerHTML = '<p class="pair-step"><b>2.</b> Mande esta resposta de volta pro parceiro:</p>'
    + '<div class="pair-qr" id="pairQR"></div>'
    + '<div class="pair-actions"><button class="btn ghost" id="pairCopy">📋 Copiar</button><button class="btn ghost" id="pairShare">↗︎ Compartilhar</button></div>'
    + '<p class="pair-wait">Aguardando o parceiro conectar… 🔗</p>';
  pairFillShare("pairQR", "pairCopy", "pairShare", code, "Resposta MorbiusFin");
}
// Convidar a esposa a INSTALAR o app (link simples + passo a passo iPhone/Android)
async function pairInviteApp() {
  const url = location.origin + location.pathname;
  const msg = "Instala o MorbiusFin (nosso controle financeiro do casal): " + url
    + "\n\n📱 Android: abra o link no Chrome → menu (⋮) → \"Instalar app\"."
    + "\n🍎 iPhone: abra no Safari → Compartilhar → \"Adicionar à Tela de Início\"."
    + "\n\nDepois é só a gente parear os dois celulares pelo app. 💚";
  try {
    if (navigator.share) await navigator.share({ title: "MorbiusFin", text: msg, url: url });
    else { await navigator.clipboard.writeText(msg); toast("Convite copiado ✓ — cole no WhatsApp"); }
  } catch (e) {}
}
// 🔔 Aviso de vencimento: escolher quantos dias antes e aplicar a TODAS as contas fixas de uma vez
function openAvisoModal() {
  let m = document.getElementById("avisoModal");
  if (!m) {
    m = document.createElement("div"); m.id = "avisoModal"; m.className = "modal center hidden";
    m.innerHTML = '<div class="modal-card aviso-card"><button type="button" class="wn-close" id="avClose">✕</button>'
      + '<div class="aviso-head"><span>🔔</span><h2>Aviso de vencimento</h2></div>'
      + '<p class="aviso-sub">Quantos dias antes você quer ser avisado das contas a vencer?</p>'
      + '<div class="aviso-row"><button type="button" class="aviso-step" id="avMinus">−</button>'
      + '<input id="avDays" type="number" min="0" max="15" value="3" inputmode="numeric"><span class="aviso-unit">dia(s) antes</span>'
      + '<button type="button" class="aviso-step" id="avPlus">+</button></div>'
      + '<button type="button" class="btn primary" id="avApply">Aplicar a TODAS as contas</button>'
      + '<p class="aviso-note">Isso ajusta todas de uma vez. Você ainda pode mudar conta por conta ao editar cada uma.</p></div>';
    document.body.appendChild(m);
    const inp = m.querySelector("#avDays");
    const clamp = () => { inp.value = Math.max(0, Math.min(15, parseInt(inp.value) || 0)); };
    m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); });
    m.querySelector("#avClose").onclick = () => m.classList.add("hidden");
    m.querySelector("#avMinus").onclick = () => { inp.value = (parseInt(inp.value) || 0) - 1; clamp(); };
    m.querySelector("#avPlus").onclick = () => { inp.value = (parseInt(inp.value) || 0) + 1; clamp(); };
    inp.onchange = clamp;
    m.querySelector("#avApply").onclick = () => {
      clamp(); const d = parseInt(inp.value) || 0;
      (DATA.fixas || []).forEach(l => { l.aviso = d || null; });
      persist();
      m.classList.add("hidden");
      toast(`✅ Aviso: ${d} dia(s) antes em ${(DATA.fixas || []).length} conta(s)`);
    };
  }
  // pré-preenche com o aviso mais usado hoje (ou 3)
  const vals = (DATA.fixas || []).map(l => l.aviso || 0);
  let common = 3;
  if (vals.length) { const c = {}; vals.forEach(v => c[v] = (c[v] || 0) + 1); common = +Object.keys(c).sort((a, b) => c[b] - c[a])[0]; }
  m.querySelector("#avDays").value = common;
  m.classList.remove("hidden");
}
// abre direto pareando quando o app é aberto por um link de convite (#pair=…) — ex.: câmera nativa do celular
function cpCheckHashPair() {
  const h = location.hash || ""; const i = h.indexOf("pair="); if (i < 0) return false;
  const code = h.slice(i + 5); try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
  window.__pairing = true;                          // impede o onboarding de atropelar o pareamento
  const p = getPerfil(); p.tipo = "conjunta"; setPerfil(p);
  _profTipo = "conjunta"; _pairPrefill = code;
  openPairModal(); _pairStep = "guest"; renderPairBody();
  setTimeout(() => { const ta = $("#pairInv"); if (ta) ta.value = code; pairGuestGen(); }, 80);
  return true;
}
(function bindPair() {
  const c = $("#pairClose"); if (c) c.onclick = closePairModal;
  const m = $("#pairModal"); if (m) m.onclick = (e) => { if (e.target === m) closePairModal(); };
})();

/* ===================== ❓ Ajuda: "?" contextual + FAQ + Tutorial ===================== */
const HELP = {
  toggle: ["Resumo · Gráficos · Insights", "Troca a visão do mês: <b>📋 Resumo</b> (seu fluxo), <b>📊 Gráficos</b> e <b>💡 Insights</b> (a leitura do mês e dicas)."],
  venc: ["Contas a vencer", "Contas perto de vencer ou já atrasadas. Toque em <b>Pagar</b> quando quitar — ela some daqui e do sino."],
  health: ["Saúde financeira", "Uma nota de 0 a 100 pro seu mês. Quanto mais você guarda do que recebe, maior a nota."],
  flow: ["O caminho do dinheiro", "Mostra: o que <b>sobrou do mês passado</b> + <b>receitas</b> − <b>despesas</b> = <b>o que sobra</b> no mês."],
  prevreal: ["Previsto × Realizado", "O que você <b>já recebeu/pagou</b> contra o que <b>ainda falta</b> no mês."],
  comp: ["Composição das despesas", "Como seus gastos se dividem entre <b>Fixas</b>, <b>Cartão</b> e <b>Dia a dia</b>."],
  metas: ["Orçamento (metas)", "Suas metas por categoria. <b>Verde</b> = dentro da meta; <b>vermelho</b> = estourou. Defina no menu → Categorias."],
};
function helpQ(key) { return `<button type="button" class="help-q" data-help="${key}" aria-label="O que é isso?">?</button>`; }
function openHelp(key) {
  const h = HELP[key]; if (!h) return;
  let m = document.getElementById("helpModal");
  if (!m) {
    m = document.createElement("div"); m.id = "helpModal"; m.className = "modal center hidden";
    m.innerHTML = '<div class="modal-card help-card"><div class="help-ic">💡</div><h2 id="helpTitle"></h2><p id="helpText"></p><button type="button" class="btn primary" id="helpOk">Entendi</button></div>';
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); });
    m.querySelector("#helpOk").onclick = () => m.classList.add("hidden");
  }
  m.querySelector("#helpTitle").textContent = h[0];
  m.querySelector("#helpText").innerHTML = h[1];
  m.classList.remove("hidden");
}
document.addEventListener("click", (e) => { const b = e.target.closest && e.target.closest(".help-q"); if (b) { e.preventDefault(); e.stopPropagation(); openHelp(b.dataset.help); } });

const FAQ = [
  ["📋 Resumo", "A tela inicial do mês: contas a vencer, saúde financeira, o caminho do dinheiro e os gráficos."],
  ["💡 Insights & Leitura do mês", "Toque na opção azul <b>Insights</b> no topo: a leitura do mês te diz o que pede atenção e dá dicas simples."],
  ["💰 Receitas · 📌 Fixas · 💳 Cartão · 🛒 Débito", "As abas de baixo. Cada uma lista os lançamentos daquele tipo no mês."],
  ["➕ Botão +", "Em qualquer aba (menos Resumo), o + adiciona um novo lançamento. No Cartão dá pra parcelar até 60×."],
  ["🔔 Sino de alertas", "No topo: avisa quando há conta a pagar. Toque para ver e pagar; para de piscar depois que você abre."],
  ["👤 Perfil", "Sua foto, nome e tipo de conta (Pessoal ou Conjunta de casal)."],
  ["💑 Conta conjunta", "Casal: pareie os 2 celulares por QR/código. O que um lança aparece no outro em tempo real, <b>sem nuvem</b>."],
  ["🏷️ Categorias e orçamento", "No menu: crie categorias com emoji e defina metas de gasto por categoria."],
  ["🧪 Simular gastos", "No menu: veja se vale a pena uma compra à vista ou parcelada antes de comprar."],
  ["🔄 Sincronização", "No menu: sobe/baixa seus dados da sua nuvem privada (opcional)."],
  ["⬆️ Importar · ⬇️ Exportar", "Backup: salve tudo num arquivo ou recupere de um backup .json."],
  ["🌗 Tema", "Claro, escuro ou automático."],
];
function openFaq() {
  let m = document.getElementById("faqModal");
  if (!m) {
    m = document.createElement("div"); m.id = "faqModal"; m.className = "modal center hidden";
    m.innerHTML = '<div class="modal-card faq-card"><button type="button" class="wn-close" id="faqClose">✕</button><div class="faq-head"><span>❓</span><h2>Perguntas frequentes</h2></div><div class="faq-body" id="faqBody"></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); });
    m.querySelector("#faqClose").onclick = () => m.classList.add("hidden");
  }
  m.querySelector("#faqBody").innerHTML = FAQ.map((q, i) => `<details class="faq-item"${i === 0 ? " open" : ""}><summary>${q[0]}</summary><p>${q[1]}</p></details>`).join("");
  m.classList.remove("hidden");
}

const TUTORIAL = [
  ["👋", "Bem-vindo ao MorbiusFin", "Seu controle financeiro do mês, simples e no celular. Vou te mostrar o essencial em alguns passos — pode pular quando quiser."],
  ["📋", "Resumo do mês", "Aqui você vê o caminho do seu dinheiro: o que entrou, o que saiu e o que sobra. No topo dá pra trocar para Gráficos e Insights."],
  ["🔔", "Contas a vencer", "O sino no topo avisa quando há conta perto de vencer ou atrasada. Toque para ver e pagar — ele para de piscar depois."],
  ["➕", "Lançar gastos e ganhos", "Nas abas de baixo (Receitas, Fixas, Cartão, Débito), use o + para adicionar. No Cartão dá pra parcelar até 60×."],
  ["🏷️", "Categorias e metas", "No menu, crie categorias com emoji e defina metas de orçamento. Verde = dentro, vermelho = estourou."],
  ["💑", "Conta de casal", "No perfil, escolha Conjunta e pareie os 2 celulares por QR. O que um lança aparece no outro, sem nuvem."],
  ["❓", "Ajuda sempre à mão", "Viu um “?” numa parte do app? Toque para saber o que ela faz. E este tutorial fica no menu quando quiser rever."],
];
let _tutI = 0;
function ensureTutModal() {
  if (document.getElementById("tutModal")) return;
  const m = document.createElement("div"); m.id = "tutModal"; m.className = "modal center hidden";
  m.innerHTML = '<div class="modal-card tut-card"><button type="button" class="wn-close" id="tutX">✕</button><div class="tut-ic" id="tutIc"></div><h2 id="tutTitle"></h2><p id="tutText"></p><div class="tut-dots" id="tutDots"></div><div class="tut-nav"><button type="button" class="btn ghost" id="tutPrev">Voltar</button><button type="button" class="btn primary" id="tutNext">Próximo</button></div><button type="button" class="tut-skiplink" id="tutSkip">Pular tutorial</button></div>';
  document.body.appendChild(m);
  m.querySelector("#tutX").onclick = closeTut;
  m.querySelector("#tutSkip").onclick = closeTut;
  m.addEventListener("click", e => { if (e.target === m) closeTut(); });
  m.querySelector("#tutPrev").onclick = () => { if (_tutI > 0) { _tutI--; renderTut(); } };
  m.querySelector("#tutNext").onclick = () => { if (_tutI < TUTORIAL.length - 1) { _tutI++; renderTut(); } else closeTut(); };
}
function renderTut() {
  const s = TUTORIAL[_tutI];
  document.getElementById("tutTitle").textContent = s[1];
  document.getElementById("tutText").textContent = s[2];
  document.getElementById("tutDots").innerHTML = TUTORIAL.map((_, i) => `<span class="${i === _tutI ? "on" : ""}"></span>`).join("");
  document.getElementById("tutPrev").style.visibility = _tutI === 0 ? "hidden" : "";
  document.getElementById("tutNext").textContent = _tutI === TUTORIAL.length - 1 ? "Começar a usar" : "Próximo";
  const ic = document.getElementById("tutIc"); ic.textContent = s[0]; ic.classList.remove("pop"); void ic.offsetWidth; ic.classList.add("pop");
}
function openTutorial() { _tutI = 0; ensureTutModal(); renderTut(); document.getElementById("tutModal").classList.remove("hidden"); }
function closeTut() { const m = document.getElementById("tutModal"); if (m) m.classList.add("hidden"); try { localStorage.setItem("financas2026.tutDone", "1"); } catch (e) {} }
(function bindHelpMenu() {
  const mt = $("#miTutorial"); if (mt) mt.onclick = () => { closeMenu(); openTutorial(); };
  const mf = $("#miFaq"); if (mf) mf.onclick = () => { closeMenu(); openFaq(); };
})();
(function bindWhatsNew() {                 // liga o ícone e os botões do modal (elementos estáticos)
  const i = $("#btnWhatsNew"); if (i) i.onclick = openWhatsNew;
  const a = $("#wnAccept"); if (a) a.onclick = () => applyUpdate(a);
  const c = $("#wnClose"); if (c) c.onclick = closeWhatsNew;
  const m = $("#whatsNewModal"); if (m) m.onclick = (e) => { if (e.target === m) closeWhatsNew(); };
})();

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
const TEST_CODE = "8040";   // código do modo teste (privado — sem dica na tela)
function showLock(env) {
  const ls = $("#lockScreen"); ls.classList.remove("hidden");
  document.body.classList.add("lock-on");                       // esconde tabbar/+ atrás do lock (sem faixa no rodapé)
  const pin = $("#lockPin"), msg = $("#lockMsg");
  const ttl = $("#lockTitle"); if (ttl) ttl.textContent = "Digite seu código";
  const hint = $("#lockHint"); if (hint) hint.textContent = "";   // sem aviso revelando o código
  pin.value = ""; msg.textContent = ""; setTimeout(() => pin.focus(), 100);
  let busy = false, done = false, lastTried = "", autoT = null;
  // attempt: testa o código. showErr=true (botão/Enter) mostra "incorreto"; auto (digitando) é silencioso.
  const attempt = async (showErr) => {
    const v = pin.value;
    if (!v || busy || done) return;
    if (v === TEST_CODE) { done = true; playUnlock(loadTestProfile); return; }   // código reservado = modo teste
    busy = true; lastTried = v;
    if (showErr) msg.textContent = "verificando…";
    try {
      const k = await deriveKey(v, env.salt);
      const obj = await decryptEnvelope(k, env);
      done = true;                                   // ✅ válido → entra automaticamente (sem clicar em Entrar)
      window.CRYPTO_KEY = k; DATA = migrate(obj);
      localStorage.setItem("financas2026.profile", "real");
      document.body.classList.remove("test-mode");
      playUnlock(startApp);
    } catch (e) {
      if (showErr) { msg.textContent = "código incorreto"; pin.value = ""; lastTried = ""; pin.focus(); }
      else { msg.textContent = ""; }               // digitando: não acusa erro (pode faltar dígito)
    } finally { busy = false; }
  };
  // VALIDADOR SIMULTÂNEO: a cada dígito, tenta sozinho (debounce). Acertou → entra na hora.
  pin.oninput = () => {
    if (msg.textContent === "código incorreto") msg.textContent = "";
    clearTimeout(autoT);
    const v = pin.value;
    if (v.length < 4 || v === lastTried || busy || done) return;
    autoT = setTimeout(() => attempt(false), 200);
  };
  $("#lockBtn").onclick = () => attempt(true);
  pin.onkeydown = (e) => { if (e.key === "Enter") attempt(true); };
}
// Animação de desbloqueio: cadeado abre → a tela "abre no meio" (duas metades se separam) → cadeado esmaece pra direita.
function playUnlock(after) {
  document.body.classList.remove("lock-on", "splash-on");      // libera tabbar/+ (não fica escondida após desbloquear)
  const sp = document.getElementById("splash"); if (sp) sp.remove();   // splash não interfere mais no fluxo do lock
  const ls = $("#lockScreen");
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  // cortina cobre TUDO + PRÉ-CARGA com anel de progresso — o app monta por trás (ganha tempo) e só revela pronto
  const ov = document.createElement("div");
  ov.id = "unlockReveal"; ov.className = "unlock-reveal loading";
  ov.innerHTML =
    '<div class="ur-half ur-left"></div><div class="ur-half ur-right"></div>' +
    '<div class="ur-burst"></div>' +
    '<div class="ur-center">' +
      '<div class="ur-ring">' +
        '<svg viewBox="0 0 80 80" aria-hidden="true"><circle class="ur-ring-bg" cx="40" cy="40" r="34"/><circle class="ur-ring-fg" cx="40" cy="40" r="34"/></svg>' +
        '<div class="ur-lock">🔒</div>' +
      '</div>' +
      '<div class="ur-name">MorbiusFin</div>' +
      '<div class="ur-txt">Preparando…</div>' +
    '</div>';
  document.body.appendChild(ov);
  if (ls) ls.classList.add("hidden");   // some o lock; a cortina (mesmo verde) cobre tudo
  after();                              // monta o app POR TRÁS da cortina (pré-carrega)

  const finish = () => { try { ov.remove(); } catch (e) {} };
  if (reduce) {                         // movimento reduzido: pré-carga curta + sem efeitos
    setTimeout(() => { ov.classList.add("nofx", "go"); setTimeout(finish, 120); }, 350);
    return;
  }
  const preMs = 1050;                   // anel preenche ~1s = tempo pro app/gráficos assentarem
  // 1) destrava: cadeado abre com estalo + flash de luz (anel/texto somem)
  setTimeout(() => {
    const lk = ov.querySelector(".ur-lock"); if (lk) lk.textContent = "🔓";
    ov.classList.remove("loading"); ov.classList.add("unlocked");   // pop do cadeado + burst de glow
  }, preMs);
  // 2) a PRÉ-CARGA acaba: o centro inteiro (cadeado/nome) some POR COMPLETO — nada vaza pra cortina
  setTimeout(() => ov.classList.add("cleared"), preMs + 560);
  // 3) SÓ COM O CENTRO JÁ SUMIDO (.34s de fade), abre as portas
  setTimeout(() => ov.classList.add("go"), preMs + 560 + 380);
  // 4) remove a cortina ao terminar
  setTimeout(finish, preMs + 560 + 380 + 800);
}

/* ===== Conta e acesso: dados reais protegidos (PIN 4 díg) + modo teste (0000) ===== */
function accessModalEl() {
  let m = document.getElementById("accessModal");
  if (!m) {
    m = document.createElement("div");
    m.id = "accessModal"; m.className = "modal center hidden";
    m.innerHTML = '<div class="modal-card acc-card"><button type="button" id="accClose" class="wn-close" aria-label="Fechar">✕</button><h2 style="text-align:center">Conta e acesso</h2><div id="accBody"></div></div>';
    document.body.appendChild(m);
    m.addEventListener("click", e => { if (e.target === m) m.classList.add("hidden"); });
    m.querySelector("#accClose").onclick = () => m.classList.add("hidden");
  }
  return m;
}
function openAccessModal() {
  const m = accessModalEl(), body = m.querySelector("#accBody");
  const testMode = localStorage.getItem("financas2026.profile") === "test";
  const protegido = !!window.CRYPTO_KEY;
  let html;
  if (testMode) {
    html = '<p class="acc-status test">🧪 Você está no <b>MODO TESTE</b> (dados fictícios). Seus dados reais estão guardados e intactos.</p>'
      + '<button class="btn primary" id="accExitTest">Voltar aos dados reais</button>';
  } else {
    html = protegido
      ? '<p class="acc-status ok">🔒 Seus dados reais estão <b>protegidos por PIN</b>.</p><button class="btn ghost" id="accRemove">Remover proteção (PIN)</button>'
      : '<p class="acc-status">Seus dados reais ainda estão <b>sem senha</b>. Proteja com um PIN de 4 dígitos — faço um <b>backup automático</b> antes de ativar.</p>'
        + '<div class="field-row"><label class="field"><span>PIN (4 dígitos)</span><input id="accPin" type="password" inputmode="numeric" maxlength="4" placeholder="••••" /></label>'
        + '<label class="field"><span>Repita</span><input id="accPin2" type="password" inputmode="numeric" maxlength="4" placeholder="••••" /></label></div>'
        + '<button class="btn primary" id="accProtect">Proteger (com backup antes)</button>';
    html += '<hr style="border:0;border-top:1px solid var(--line);margin:16px 0" />'
      + '<p class="acc-status">Só quer testar sem mexer no real? Entre no <b>modo teste</b> (dados fictícios, separados).</p>'
      + '<button class="btn ghost" id="accEnterTest">Entrar no modo teste</button>'
      + '<p class="hint" style="margin-top:12px">📱 <b>Face ID</b> chega em seguida (precisa ser testado no seu iPhone). Por enquanto o acesso é por PIN.</p>';
  }
  body.innerHTML = html;
  m.classList.remove("hidden");
  const ex = body.querySelector("#accExitTest"); if (ex) ex.onclick = exitTestMode;
  const et = body.querySelector("#accEnterTest"); if (et) et.onclick = () => { m.classList.add("hidden"); loadTestProfile(); };
  const pr = body.querySelector("#accProtect"); if (pr) pr.onclick = protectWithPin;
  const rm = body.querySelector("#accRemove");
  if (rm) rm.onclick = () => { if (confirm("Remover o PIN? Os dados reais ficarão sem criptografia neste aparelho.")) { window.CRYPTO_KEY = null; localStorage.setItem(STORE_KEY, JSON.stringify(DATA)); toast("Proteção removida"); openAccessModal(); } };
}
function autoBackup() {
  try {
    const b = new Blob([JSON.stringify(DATA, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(b);
    a.download = `morbiusfin-backup-${Date.now()}.json`; a.click();
    toast("Backup baixado ⬇️"); return true;
  } catch (e) { return false; }
}
async function protectWithPin() {
  const p1 = ($("#accPin") || {}).value || "", p2 = ($("#accPin2") || {}).value || "";
  if (!/^\d{4}$/.test(p1)) { toast("Use exatamente 4 dígitos numéricos"); return; }
  if (p1 === TEST_CODE) { toast("Esse código é reservado — escolha outro"); return; }
  if (p1 !== p2) { toast("Os PINs não conferem"); return; }
  autoBackup();                                   // backup ANTES de criptografar
  window.CRYPTO_KEY = await deriveKey(p1);
  localStorage.setItem("financas2026.profile", "real");
  saveData(DATA);                                 // criptografa os dados reais (financas2026.v2)
  toast("Dados reais protegidos 🔒");
  openAccessModal();                              // atualiza o status na tela
}
function exitTestMode() {
  localStorage.setItem("financas2026.profile", "real");
  try { localStorage.removeItem(TEST_STORE_KEY); } catch (e) {}   // limpa os dados de teste (some qualquer cópia)
  document.body.classList.remove("test-mode");
  closeAccessModal();
  location.reload();                              // reboot limpo → boot() carrega os reais (gate se tiver PIN)
}
function closeAccessModal() { const m = document.getElementById("accessModal"); if (m) m.classList.add("hidden"); }

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
    const novo = { url: cfg.url.trim(), token: cfg.token.trim() };
    const trocou = !cur.url || cur.url !== novo.url || cur.token !== novo.token;
    localStorage.setItem(SYNC_CFG_KEY, JSON.stringify(novo));
    if (trocou) window.__joinChannel = true;   // canal novo/diferente → adota a conta de lá (não mistura o local)
    modal.classList.add("hidden");
    toast("Sincronização configurada ✓"); renderNotifBtn();
    pullSync(true, null, true); startLiveSync();   // puxa a web na hora
  };
}
/* ========== Conta conjunta na nuvem: MERGE por item (ninguém perde lançamento) ==========
   Cada lançamento tem id + m (mtime). Apagados viram tombstone em DATA._tomb {id:m}.
   merge = união por id (vence o m maior); tombstone mais novo que o item o remove de vez.
   Tudo determinístico (listas ordenadas por id, tomb com chaves ordenadas) → os 2 celulares
   convergem pro MESMO estado e param de empurrar (sem ping-pong). */
const SYNC_LISTS = ["receitas", "fixas", "cartao", "diaria"];
const nowMs = () => Date.now();
function tombstone(ids) {
  if (!DATA._tomb) DATA._tomb = {};
  const t = nowMs();
  (Array.isArray(ids) ? ids : [ids]).forEach(id => { if (id != null) DATA._tomb[id] = t; });
}
function mergeTomb(a, b) {
  const raw = {};
  [a, b].forEach(o => { if (o) for (const k in o) raw[k] = Math.max(raw[k] || 0, o[k] || 0); });
  let keys = Object.keys(raw).sort();                          // ordem determinística
  if (keys.length > 500) keys = keys.sort((x, y) => raw[y] - raw[x]).slice(0, 500).sort();  // poda os mais antigos
  const t = {}; keys.forEach(k => t[k] = raw[k]); return t;
}
function coupleActive() { return !!syncCfg() && getPerfil().tipo === "conjunta"; }
function cfgLink() {
  const c = syncCfg(); if (!c || !c.url || !c.token) return null;
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify({ u: c.url, t: c.token }))))
    .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  return location.origin + location.pathname + "#cfg=" + b64;
}
function mergeData(local, remote) {
  if (!remote) return local;
  const lt = local.updatedAt || 0, rt = remote.updatedAt || 0;
  const cfg = rt > lt ? remote : local;                        // o lado mais novo decide os campos de configuração
  const tomb = mergeTomb(local._tomb, remote._tomb);
  const out = {
    year: cfg.year != null ? cfg.year : (local.year != null ? local.year : 2026),
    saldoInicial: cfg.saldoInicial != null ? cfg.saldoInicial : (local.saldoInicial || 0),
    metas: cfg.metas || local.metas || { fixas: 0, cartao: 0, diaria: 0 },
    cartoes: cfg.cartoes || local.cartoes || [],
    categorias: (cfg.categorias && cfg.categorias.length) ? cfg.categorias : (local.categorias || []),
    orcamento: cfg.orcamento || local.orcamento || {},
    updatedAt: Math.max(lt, rt),
    _tomb: tomb
  };
  SYNC_LISTS.forEach(list => {
    const byId = {};
    const consume = arr => (arr || []).forEach(it => {
      if (!it || it.id == null) return;
      const prev = byId[it.id];
      if (!prev || (it.m || 0) >= (prev.m || 0)) byId[it.id] = it;   // mtime maior vence
    });
    consume(local[list]); consume(remote[list]);
    out[list] = Object.values(byId)
      .filter(it => !(tomb[it.id] != null && tomb[it.id] > (it.m || 0)))   // apagado depois da última edição → some
      .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));          // ordem determinística (display reordena depois)
  });
  return out;
}

let pulling = false;
// status da última sincronização (mostrado em ⚙️ para diagnóstico)
let lastSyncInfo = { when: 0, ok: null, msg: "ainda não sincronizou", remoteTs: 0 };
// force=true → a WEB é a fonte da verdade: adota a nuvem sempre que houver e for diferente
// (usado no botão 🔄 e no puxar-para-atualizar). Sem force = merge por timestamp (boot/auto).
const isTestMode = () => localStorage.getItem("financas2026.profile") === "test";
// Bolinha "sincronizando" no header: aparece SÓ se o sync demora >220ms (não pisca nos polls rápidos de 7s) e some ao terminar.
let _syncBusyN = 0, _syncBusyTimer = 0;
function setSyncBusy(on) {
  const el = document.getElementById("syncSpin");
  if (on) {
    _syncBusyN++;
    if (!_syncBusyTimer) _syncBusyTimer = setTimeout(() => { _syncBusyTimer = 0; if (_syncBusyN > 0 && el) el.classList.remove("hidden"); }, 220);
  } else {
    _syncBusyN = Math.max(0, _syncBusyN - 1);
    if (_syncBusyN === 0) { if (_syncBusyTimer) { clearTimeout(_syncBusyTimer); _syncBusyTimer = 0; } if (el) el.classList.add("hidden"); }
  }
}
async function pullSync(aviso, onProg, force) {
  if (isTestMode()) return { ok: false, reason: "teste" };   // NUNCA sincroniza no modo teste (não baixa os reais)
  const c = syncCfg(); if (!c || pulling) return { ok: false, reason: "sem-config" };
  // bolinha de "sincronizando" SÓ em sync que o usuário pediu (manual/forçado) — as checagens
  // automáticas de fundo (a cada 7s) são SILENCIOSAS (senão a bolinha pisca toda hora, sem motivo).
  const showBusy = !!(aviso || force);
  pulling = true; if (showBusy) setSyncBusy(true);
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
      const remoteTs = (remote && remote.updatedAt) || 0;
      if (onProg) onProg(85, "Aplicando alterações…");
      if (window.__joinChannel && remote) {
        // ENTRANDO numa conta compartilhada por link → adota a conta do par inteira
        // (não mistura o exemplo/local de quem está entrando).
        window.__joinChannel = false;
        history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift();
        DATA = migrate(remote); if (!DATA.updatedAt) DATA.updatedAt = remoteTs || nowMs();
        saveData(DATA); lastSnap = JSON.stringify(DATA); render();
        result = { ok: true, changed: true };
        if (aviso) toast("Conta compartilhada carregada ⤓");
      } else if (remote) {
        // MERGE: une os lançamentos dos dois (ninguém perde nada)
        const merged = mergeData(DATA, remote);
        const ms = JSON.stringify(merged);
        const changedLocal = ms !== JSON.stringify(DATA);
        const changedRemote = ms !== JSON.stringify(remote);
        if (changedLocal) {
          window.__joinChannel = false;
          history.push(lastSnap); if (history.length > HISTORY_MAX) history.shift();
          DATA = migrate(merged); saveData(DATA); lastSnap = JSON.stringify(DATA); render();
        }
        if (changedRemote) pushSync();                 // devolve o merge pra nuvem → o par também converge
        result = { ok: true, changed: changedLocal, pushed: changedRemote };
        if (aviso) toast(changedLocal ? "Sincronizado ⤓" : (changedRemote ? "Enviado ⤴" : "Já estava em dia ✓"));
      } else {
        // nuvem vazia → mando o meu
        window.__joinChannel = false;
        pushSync(); result = { ok: true, changed: false, pushed: true };
        if (aviso) toast("Enviado pra nuvem ⤴");
      }
      lastSyncInfo = { when: Date.now(), ok: true, remoteTs: remoteTs,
        msg: result.changed ? "mesclou da nuvem" : (result.pushed ? "enviou o local" : "já estava igual") };
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
  finally { pulling = false; if (showBusy) setSyncBusy(false); }
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
  if (isTestMode()) return;   // NUNCA empurra dados de teste pra sua nuvem real
  const c = syncCfg(); if (!c) return;
  if (!DATA.updatedAt) DATA.updatedAt = Date.now();
  clearTimeout(pushT);
  pushT = setTimeout(() => {
    setSyncBusy(true);
    fetch(c.url, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: c.token, data: DATA }) }).catch(() => {}).finally(() => setSyncBusy(false));
  }, 600);
}

/* ---------- Sync ao vivo: polling + ao abrir/focar/reconectar ---------- */
let liveT = null;
const LIVE_MS = 7000;
function startLiveSync() {
  if (isTestMode() || !syncCfg()) { stopLiveSync(); return; }
  stopLiveSync();
  liveT = setInterval(() => { if (document.visibilityState === "visible" && navigator.onLine !== false) pullSync(false); }, LIVE_MS);
}
function stopLiveSync() { if (liveT) { clearInterval(liveT); liveT = null; } }
// Voltou pro app (destrava tela, troca de aba, abre do início) → puxa na hora
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") { if (syncCfg()) pullSync(false); checkForUpdate(); } });
window.addEventListener("focus", () => { if (syncCfg()) pullSync(false); checkForUpdate(); });
window.addEventListener("online", () => { if (syncCfg()) pullSync(false); checkForUpdate(); });
// checa atualização ao abrir (após o splash) e a cada 5 min
setTimeout(checkForUpdate, 6500);
setInterval(checkForUpdate, 5 * 60 * 1000);

/* ---------- Boot ---------- */
function startApp() {
  window.__started = true;
  lastSnap = JSON.stringify(DATA);
  forceAnimOnce = true;        // só a abertura tem a animação de entrada (intro); o resto é estático
  renderAvatar();              // 👤 mostra a foto/inicial do perfil no header
  render();
  if (curTab === "resumo" && !annual) renderCharts();
  checkAndNotify(); checkVersion();
  setTimeout(checkFullscreen, 3200);   // detecta install antigo (sem tela cheia → faixa no rodapé) e orienta a reinstalar
  setTimeout(cpCheckHashPair, 600);    // se abriu por um link de convite (#pair=…), já entra no pareamento do casal
  const t0 = Date.now();
  // Splash curto (só o nome): mostra ~2,2s e revela o app; o sync continua por trás.
  const fecharSplash = (min) => { const espera = Math.max(0, min - (Date.now() - t0)); setTimeout(hideSplash, espera); };
  if (syncCfg()) {
    setSplashMsg("Sincronizando suas finanças…");
    startLiveSync();
    const p = pullSync(window.__syncFromLink ? true : false);
    p.then(r => { if (r && !r.ok && r.reason !== "sem-config") setTimeout(() => toast("Não consegui baixar da web — toque 🔄"), 5200); });
    // a abertura fica sempre ~2,2s, independente de o sync terminar antes
    fecharSplash(2200);
  } else {
    fecharSplash(2200);
  }
  if (window.__syncFromLink) { toast("Sincronização ativada ⚡"); window.__syncFromLink = false; }
}
function setSplashMsg(t) { const el = document.querySelector("#splash .splash-tag"); if (el) el.textContent = t; }
function hideSplash() {
  const sp = document.getElementById("splash");
  // mantém tabbar/+ escondidos ATÉ o splash sumir de vez (senão a tabbar reaparece no meio da
  // revelação e "pisca" uma faixa no rodapé no iOS, por causa da camada de GPU dela).
  if (sp && !sp.classList.contains("reveal") && !sp.classList.contains("loading-out")) {
    // 1) o spinner SAI primeiro (esvaece/encolhe) — sincronizado pra NÃO encavalar com a abertura
    sp.classList.add("loading-out");
    // 2) só com o spinner já fora, revela o app (cortina do bg desce)
    setTimeout(() => {
      sp.classList.add("reveal");
      setTimeout(() => { try { sp.remove(); } catch (e) {} document.body.classList.remove("splash-on"); maybeStartOnboarding(); }, 1050);
    }, 320);
  } else if (!sp) { document.body.classList.remove("splash-on"); maybeStartOnboarding(); }
}
// rede de segurança: nunca deixar o splash preso
window.addEventListener("load", () => setTimeout(hideSplash, 4000));

/* ---------- Detecta install ANTIGO (sem tela cheia) → a faixa do rodapé que o CSS não pinta ----------
   Num PWA iOS em tela cheia, env(safe-area-inset-bottom) ~34px. Se está como app instalado (standalone),
   num iPhone alto, e esse inset volta 0 → o ícone foi criado antes do modo tela-cheia → orienta reinstalar. */
function checkFullscreen() {
  try {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent || "");
    const standalone = ("standalone" in navigator) && navigator.standalone;
    if (!isIOS || !standalone) return;                  // só no app instalado no iOS
    if (localStorage.getItem("financas2026.fsHintOk")) return;
    const probe = document.createElement("div");
    probe.style.cssText = "position:fixed;left:0;bottom:0;width:1px;height:env(safe-area-inset-bottom,0px);opacity:0;pointer-events:none;";
    document.body.appendChild(probe);
    const sb = probe.getBoundingClientRect().height; probe.remove();
    const tall = !!(window.screen && window.screen.height >= 780);   // iPhone moderno (tem indicador de home)
    if (sb < 2 && tall) showFullscreenHint();
  } catch (e) {}
}
function showFullscreenHint() {
  if (document.getElementById("fsHint")) return;
  const el = document.createElement("div");
  el.id = "fsHint"; el.className = "fs-hint";
  el.innerHTML = `<div class="fs-hint-card">
      <div class="fs-hint-emoji">📲</div>
      <h2>Ative a tela cheia</h2>
      <p>O ícone do MorbiusFin na sua tela de início é de uma <b>versão antiga</b> e por isso deixa aquela <b>faixa no rodapé</b>. Atualizar pelo ✨ não resolve isso — precisa <b>recriar o ícone</b> (rapidinho, sem perder nada):</p>
      <ol>
        <li>Segure o ícone do app → <b>Remover</b> → Remover da Tela de Início.</li>
        <li>Abra no <b>Safari</b>: ${(location.host + location.pathname).replace(/\/index\.html$/, "/")}</li>
        <li>Toque em <b>Compartilhar</b> ⬆️ → <b>Adicionar à Tela de Início</b>.</li>
        <li>Abra pelo <b>novo ícone</b> — a faixa some (tela cheia).</li>
      </ol>
      <p class="fs-hint-safe">💡 Faça no <b>modo teste (código 8040)</b> pra ter zero risco com seus dados.</p>
      <button id="fsHintOk" class="btn primary">Entendi</button>
    </div>`;
  document.body.appendChild(el);
  el.querySelector("#fsHintOk").onclick = () => { try { localStorage.setItem("financas2026.fsHintOk", "1"); } catch (e) {} el.remove(); };
}

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
        window.__joinChannel = true;   // abriu link de convite → entra na conta compartilhada (adota a do par)
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
/* ===== Onboarding de 1ª abertura (spec_onboarding) — boas-vindas + zero/exemplos + mini-tour ===== */
let onbStep = 0;
const ONB_COIN = '<svg class="onb-logo" width="60" height="60" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" fill="#f5a623"/><circle cx="32" cy="32" r="28" fill="none" stroke="#b9760a" stroke-width="2"/><text x="32" y="43" text-anchor="middle" font-size="32" font-weight="800" fill="#7a4d06" font-family="system-ui,sans-serif">B</text></svg>';
function onbStepIcon(kind) {
  const w = (inner) => '<svg class="onb-step-ic" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + inner + '</svg>';
  if (kind === "plus") return w('<circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>');
  if (kind === "shield") return w('<path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/><path d="M9 12l2.2 2.2L15 10.5"/>');
  return w('<rect x="3" y="4" width="18" height="15" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9.5" y1="19" x2="14.5" y2="19"/>');
}
function maybeStartOnboarding() {
  if (window.__pairing) return;                          // veio por link de convite → pareamento manda, não mostra onboarding
  if (localStorage.getItem("financas2026.onboarded") === "1") return;
  if (!window.__eraSeedNovo) { localStorage.setItem("financas2026.onboarded", "1"); return; }  // retornante: não empurra
  const o = $("#onboarding"); if (!o || !o.classList.contains("hidden")) return;
  onbStep = 0; renderOnb(); o.classList.remove("hidden");
  const f = o.querySelector("button"); if (f) try { f.focus(); } catch (e) {}
}
function wipeToZero(afterWipe, onCancel) {
  const o = $("#onboarding"), body = $("#onbBody"); if (!o || !body) return;
  body.innerHTML = '<h2 id="onbTitle">Começar do zero?</h2>'
    + '<p class="onb-sub">Vou apagar os lançamentos de exemplo para você cadastrar os seus. Você pode restaurar o exemplo depois, em Configurações.</p>'
    + '<button class="btn primary" id="onbWipe">Apagar exemplos</button>'
    + '<button class="btn ghost" id="onbCancelWipe">Voltar</button>';
  o.classList.remove("hidden");
  $("#onbWipe").onclick = () => { DATA = emptyData(); localStorage.removeItem("financas2026.isSeed"); lastSnap = JSON.stringify(DATA); render(); toast("Tudo limpo. Pode começar a lançar."); afterWipe(); };
  $("#onbCancelWipe").onclick = onCancel;
}
function renderOnb() {
  const body = $("#onbBody"); if (!body) return;
  if (onbStep === 0) {
    body.innerHTML = ONB_COIN
      + '<h2 id="onbTitle">MorbiusFin</h2>'
      + '<p class="onb-sub">Suas finanças do mês, organizadas num só lugar — receitas, contas, cartão e gastos do dia.</p>'
      + '<div class="onb-note" role="note"><span style="color:var(--accent);display:flex"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.7" fill="currentColor" stroke="none"/></svg></span><span>Os números que você vê agora são só um exemplo, para você conhecer o app. Nada aqui é seu ainda.</span></div>'
      + '<button class="btn primary" id="onbZero">Começar do zero</button>'
      + '<button class="btn ghost" id="onbExplore">Explorar com exemplos</button>'
      + '<button class="onb-skip" id="onbSkip">Pular introdução</button>';
    $("#onbZero").onclick = () => wipeToZero(() => { onbStep = 1; renderOnb(); }, () => { onbStep = 0; renderOnb(); });
    $("#onbExplore").onclick = () => { onbStep = 1; renderOnb(); };
    $("#onbSkip").onclick = () => finishOnboarding();
    return;
  }
  const steps = [
    { ic: "layout", t: "Tudo separado por aba", x: "Resumo mostra o mês inteiro. Receitas, Fixas, Cartão e Débito guardam cada tipo de lançamento." },
    { ic: "plus", t: "Adicione com o +", x: "Toque no + para lançar uma receita, conta, compra no cartão ou gasto do dia. Ele se adapta à aba aberta." },
    { ic: "shield", t: "Seus dados ficam no seu aparelho", x: "Por padrão, nada vai para a nuvem. Na engrenagem (Configurações) você faz backup do seu jeito." },
  ];
  const s = steps[onbStep - 1], last = onbStep === 3;
  body.innerHTML = onbStepIcon(s.ic)
    + '<div class="onb-tourtitle" id="onbTitle">' + s.t + '</div>'
    + '<p class="onb-tourtext">' + s.x + '</p>'
    + '<div class="onb-foot">'
    +   '<button class="onb-skip" style="width:auto;padding:4px 2px" id="onbTourSkip">Pular</button>'
    +   '<div class="onb-dots" role="progressbar" aria-valuemin="1" aria-valuemax="3" aria-valuenow="' + onbStep + '" aria-label="Passo ' + onbStep + ' de 3">' + [1, 2, 3].map(i => '<i class="' + (i === onbStep ? "on" : "") + '"></i>').join("") + '</div>'
    +   '<div class="onb-nav">' + (onbStep > 1 ? '<button class="btn ghost" id="onbBack">Voltar</button>' : '') + '<button class="btn primary" id="onbNext">' + (last ? "Começar" : "Próximo") + '</button></div>'
    + '</div>';
  $("#onbTourSkip").onclick = () => finishOnboarding();
  const bk = $("#onbBack"); if (bk) bk.onclick = () => { onbStep--; renderOnb(); };
  $("#onbNext").onclick = () => { if (last) finishOnboarding(); else { onbStep++; renderOnb(); } };
}
function finishOnboarding() {
  localStorage.setItem("financas2026.onboarded", "1");
  const o = $("#onboarding"); if (o) o.classList.add("hidden");
  render();
  toast("Pronto! Toque no + quando quiser lançar algo.");
  const t = document.querySelector(".tab.active"); if (t) try { t.focus(); } catch (e) {}
}
function renderSeedBanner() {   // banner "dados de exemplo" no topo do conteúdo (modo Explorar)
  if (localStorage.getItem("financas2026.isSeed") !== "1") return;
  const v = $("#view"); if (!v || v.querySelector(".seed-banner")) return;
  const sb = document.createElement("div");
  sb.className = "seed-banner";
  sb.innerHTML = '<span>Você está vendo <b>dados de exemplo</b>.</span><button class="sb-go" id="seedGo">Começar do zero</button>';
  v.insertBefore(sb, v.firstChild);
  const go = sb.querySelector("#seedGo");
  if (go) go.onclick = () => wipeToZero(() => { const o = $("#onboarding"); if (o) o.classList.add("hidden"); }, () => { const o = $("#onboarding"); if (o) o.classList.add("hidden"); });
}
document.addEventListener("keydown", (e) => { if (e.key === "Escape") { const o = $("#onboarding"); if (o && !o.classList.contains("hidden")) finishOnboarding(); } });

/* Carrega o perfil de TESTE (dados fictícios, store separado) — sem senha, com selo "MODO TESTE" */
function loadTestProfile() {
  localStorage.setItem("financas2026.profile", "test");
  window.CRYPTO_KEY = null;
  stopLiveSync();                          // sem sincronização no modo teste (não puxa nem empurra)
  DATA = buildSeed();                      // SEMPRE dados fictícios e LIMPOS — nunca os reais
  saveData(DATA);                          // grava no store de teste (financas2026.demo), sobrescrevendo qualquer cópia
  const ls = $("#lockScreen"); if (ls) ls.classList.add("hidden");
  document.body.classList.add("test-mode");
  startApp();
}
async function boot() {
  applyTheme();
  applyConfigLink();
  if (localStorage.getItem("financas2026.profile") === "test") { loadTestProfile(); return; }  // estava em teste
  document.body.classList.remove("test-mode");
  let raw = localStorage.getItem(STORE_KEY) || localStorage.getItem("financas2026.v1");
  let parsed = null; try { parsed = raw ? JSON.parse(raw) : null; } catch (e) {}
  if (parsed && parsed.enc) { showLock(parsed); return; }   // reais protegidos → tela de acesso (PIN / 0000=teste)
  DATA = parsed ? migrate(parsed) : buildSeed();
  window.__eraSeedNovo = !parsed;                 // 1ª vez (sem dados salvos) → decide o onboarding
  if (!parsed) { saveData(DATA); localStorage.setItem("financas2026.isSeed", "1"); }
  startApp();
}

window.addEventListener("load", () => { if (window.__started && curTab === "resumo" && !annual) renderCharts(); });
if ("serviceWorker" in navigator) navigator.serviceWorker.register("sw.js").catch(() => {});

/* ---------- Puxar para atualizar (pull-to-refresh) ---------- */
(function pullToRefresh() {
  const ptr = $("#ptr"), txt = $("#ptrText"), TH = 70;
  let startY = 0, pulling = false, armed = false;
  const atTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 0;
  // Bloqueia o "puxar pra atualizar" se QUALQUER overlay estiver aberto (senão ele rouba o scroll
  // de dentro do modal — ex.: Categorias — e o usuário "não consegue subir"). scroll-locked cobre
  // todos os .modal; somamos menu, onboarding e a tela de código.
  const bloqueado = () =>
    document.body.classList.contains("scroll-locked")
    || !!document.querySelector(".menu-drawer:not(.hidden), .onb:not(.hidden), #lockScreen:not(.hidden), #unlockReveal")
    || document.body.classList.contains("kbd-open");
  const cancelPTR = () => { pulling = false; ptr.style.height = "0"; ptr.style.opacity = "0"; };
  window.addEventListener("touchstart", (e) => {
    if (atTop() && !bloqueado()) { startY = e.touches[0].clientY; pulling = true; armed = false; }
  }, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (!pulling) return;
    if (bloqueado()) { cancelPTR(); return; }   // abriu algo no meio do gesto → aborta
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

/* ---------- Teclado aberto: a tabbar fica ESCONDIDA atrás do teclado e NUNCA sobe ao rolar.
   Por que `display:none` (e não transform/visualViewport): no iOS Safari, position:fixed ancora
   na LAYOUT viewport; ao rolar com o teclado aberto o Safari "arrasta" esses elementos e eles
   driftam pra cima — reposicionar por transform NÃO vence isso (o elemento segue no render tree).
   Um elemento com `display:none` sai do render tree → fisicamente não pode driftar/aparecer.
   Detectamos o teclado por (a) foco em campo de texto (imediato, sem janela pra "subir") e
   (b) encolhimento da visual viewport. body.kbd-open → tabbar some (CSS) + FAB some. ---------- */
(function keyboardAware() {
  const isField = (el) => el && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName) &&
    !/^(button|submit|checkbox|radio|range)$/i.test(el.type || "");
  const vv = window.visualViewport;
  const setKbd = (on) => document.body.classList.toggle("kbd-open", !!on);

  // (b) teclado encolhe a viewport visível em >140px
  if (vv) vv.addEventListener("resize", () => setKbd((window.innerHeight - vv.height) > 140 && isField(document.activeElement)));

  // (a) foco/desfoco em campo de texto — esconde já no foco (antes do teclado terminar de abrir)
  let blurT = null;
  document.addEventListener("focusin", (e) => { if (isField(e.target)) { clearTimeout(blurT); setKbd(true); } });
  document.addEventListener("focusout", (e) => {
    if (isField(e.target)) { clearTimeout(blurT); blurT = setTimeout(() => { if (!isField(document.activeElement)) setKbd(false); }, 120); }
  });
})();

boot();
