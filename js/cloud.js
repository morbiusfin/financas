/* ===== Conta na nuvem (Supabase) — login email+senha + cofre E2E =====
   Privacidade: a senha NÃO é a chave de cifra. No cadastro gera-se uma DEK aleatória
   (cifra os dados). Da senha deriva-se uma KEK (PBKDF2) que SÓ embrulha a DEK.
   A nuvem guarda: email (auth), wrapped_dek, salt, ct (ciphertext). Nunca a senha,
   a KEK, a DEK ou os números em claro.
   Tudo dentro de uma IIFE; exposto via window.MFCloud. */
(function () {
  "use strict";
  var SUPABASE_URL = "https://fyjzrsmfeokdkhboeopc.supabase.co";
  var SUPABASE_KEY = "sb_publishable_oUTz-QGMaaMo42n0hXJMlw_JVUst6Om";   // publishable (pública por design)
  var CLOUD_PENDING_KEY = "financas2026.cloudPending";

  var _sb = null;
  function sbClient() {
    if (_sb) return _sb;
    if (!window.supabase || !window.supabase.createClient) return null;
    _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
    // Link de "esqueci minha senha" → o cliente troca o token na URL e dispara PASSWORD_RECOVERY.
    // Marca o estado e avisa o app pra mostrar a tela de "definir nova senha".
    try {
      _sb.auth.onAuthStateChange(function (event) {
        if (event === "PASSWORD_RECOVERY") { window.MFCLOUD_RECOVERY = true; try { if (typeof window.__onRecovery === "function") window.__onRecovery(); } catch (e) {} }
      });
    } catch (e) {}
    return _sb;
  }
  // Define a nova senha (fluxo de recuperação, com a sessão temporária do link).
  async function cloudUpdatePassword(novaSenha) {
    try {
      var sb = sbClient(); if (!sb) return { ok: false, reason: "sdk" };
      var r = await sb.auth.updateUser({ password: novaSenha });
      if (r.error) return { ok: false, reason: r.error.message };
      return { ok: true };
    } catch (e) { return { ok: false, reason: "erro" }; }
  }
  function cloudConfigured() { return !!sbClient(); }

  // estado da conta na sessão (DEK só vive em memória)
  window.CLOUD = window.CLOUD || { dek: null, email: null };

  /* ---- cripto E2E ---- */
  var _cb64 = function (u8) { return btoa(String.fromCharCode.apply(null, new Uint8Array(u8))); };
  var _cub64 = function (s) { return Uint8Array.from(atob(s), function (c) { return c.charCodeAt(0); }); };
  function _importDEK(bytes) { return crypto.subtle.importKey("raw", bytes, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]); }
  async function _encKey(cryptoKey, obj) {
    var iv = crypto.getRandomValues(new Uint8Array(12));
    var ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv: iv }, cryptoKey, new TextEncoder().encode(JSON.stringify(obj)));
    return { iv: _cb64(iv), ct: _cb64(ct) };
  }
  async function _decKey(cryptoKey, env) {
    var pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv: _cub64(env.iv) }, cryptoKey, _cub64(env.ct));
    return JSON.parse(new TextDecoder().decode(pt));
  }
  // monta o cofre cifrado: gera DEK, embrulha pela KEK(senha), cifra os dados
  async function _buildVault(senha, data) {
    var dek = crypto.getRandomValues(new Uint8Array(32));
    var kek = await window.deriveKey(senha);                       // {key, salt(b64)}
    var wrapped = await _encKey(kek.key, { dek: _cb64(dek) });
    var dekKey = await _importDEK(dek);
    var ct = await _encKey(dekKey, data);
    return { dek: dek, wrapped_dek: JSON.stringify(wrapped), salt: kek.salt, ct: JSON.stringify(ct) };
  }
  async function _uid() { var sb = sbClient(); if (!sb) return null; var r = await sb.auth.getUser(); return (r.data && r.data.user) ? r.data.user.id : null; }

  /* ---- fluxos ---- */
  async function cloudSignUp(email, senha, data) {
    var sb = sbClient(); if (!sb) return { ok: false, reason: "sdk" };
    email = (email || "").trim().toLowerCase();
    var r = await sb.auth.signUp({ email: email, password: senha, options: { emailRedirectTo: "https://morbiusfin.github.io/confirmado.html" } });
    if (r.error) return { ok: false, reason: r.error.message };
    var built = await _buildVault(senha, data);
    window.CLOUD.dek = built.dek; window.CLOUD.email = email; window.CLOUD.salt = built.salt; window.CLOUD.wrapped = built.wrapped_dek;
    window.CLOUD.uid = (r.data && r.data.user) ? r.data.user.id : null;   // user_id (PK) p/ checar/assinar a licença
    var row = { wrapped_dek: built.wrapped_dek, salt: built.salt, ct: built.ct };
    if (r.data && r.data.session && r.data.user) {                 // já logado (confirm-email OFF)
      var ins = await sb.from("vaults").upsert(Object.assign({ user_id: r.data.user.id }, row));
      if (ins.error) return { ok: false, reason: ins.error.message };
      return { ok: true, confirm: false };
    }
    try { localStorage.setItem(CLOUD_PENDING_KEY, JSON.stringify(row)); } catch (e) {}   // grava após confirmar+logar
    return { ok: true, confirm: true };
  }
  async function cloudSignIn(email, senha) {
    var sb = sbClient(); if (!sb) return { ok: false, reason: "sdk" };
    email = (email || "").trim().toLowerCase();
    var r = await sb.auth.signInWithPassword({ email: email, password: senha });
    if (r.error) return { ok: false, reason: r.error.message };
    var uid = r.data.user.id;
    var q = await sb.from("vaults").select("*").eq("user_id", uid).limit(1);
    if (q.error) return { ok: false, reason: q.error.message };
    var row = q.data && q.data[0];
    if (!row) {                                                    // 1º login pós-confirmação → grava o pendente
      var pend = null; try { pend = JSON.parse(localStorage.getItem(CLOUD_PENDING_KEY) || "null"); } catch (e) {}
      if (pend) { var up = await sb.from("vaults").upsert(Object.assign({ user_id: uid }, pend)); if (up.error) return { ok: false, reason: up.error.message }; row = pend; try { localStorage.removeItem(CLOUD_PENDING_KEY); } catch (e) {} }
      else return { ok: false, reason: "sem-cofre" };
    }
    var kek = await window.deriveKey(senha, row.salt);
    var dekObj; try { dekObj = await _decKey(kek.key, JSON.parse(row.wrapped_dek)); } catch (e) { return { ok: false, reason: "senha-errada" }; }
    var dek = _cub64(dekObj.dek);
    window.CLOUD.dek = dek; window.CLOUD.email = email; window.CLOUD.salt = row.salt; window.CLOUD.wrapped = row.wrapped_dek;
    window.CLOUD.uid = uid;   // user_id (PK) p/ checar/assinar a licença
    var data = null;
    try { var dekKey = await _importDEK(dek); data = await _decKey(dekKey, JSON.parse(row.ct)); } catch (e) { return { ok: false, reason: "cofre-corrompido" }; }
    return { ok: true, data: data };
  }
  async function cloudPush(data) {
    var sb = sbClient(); if (!sb || !window.CLOUD.dek) return { ok: false, reason: "sem-dek" };
    var uid = await _uid(); if (!uid) return { ok: false, reason: "noauth" };
    var dekKey = await _importDEK(window.CLOUD.dek);
    var ct = await _encKey(dekKey, data);
    var u = await sb.from("vaults").update({ ct: JSON.stringify(ct) }).eq("user_id", uid);
    return { ok: !u.error, reason: u.error && u.error.message };
  }
  async function cloudPull() {
    var sb = sbClient(); if (!sb || !window.CLOUD.dek) return { ok: false, reason: "sem-dek" };
    var uid = await _uid(); if (!uid) return { ok: false, reason: "noauth" };
    var q = await sb.from("vaults").select("ct,updated_at").eq("user_id", uid).limit(1);
    if (q.error) return { ok: false, reason: q.error.message };
    var row = q.data && q.data[0]; if (!row || !row.ct) return { ok: false, reason: "sem-cofre" };
    var data; try { var dekKey = await _importDEK(window.CLOUD.dek); data = await _decKey(dekKey, JSON.parse(row.ct)); } catch (e) { return { ok: false, reason: "cofre-corrompido" }; }
    return { ok: true, data: data, updated_at: row.updated_at };
  }
  async function cloudSignOut() { var sb = sbClient(); if (sb) { try { await sb.auth.signOut(); } catch (e) {} } window.CLOUD = { dek: null, email: null }; }
  async function cloudSession() { var sb = sbClient(); if (!sb) return null; var r = await sb.auth.getSession(); return (r.data && r.data.session) ? r.data.session : null; }
  async function cloudResetSenha(email) { var sb = sbClient(); if (!sb) return { ok: false, reason: "sdk" }; var r = await sb.auth.resetPasswordForEmail((email || "").trim().toLowerCase(), { redirectTo: "https://morbiusfin.github.io" }); return { ok: !r.error, reason: r.error && r.error.message }; }
  // Reenvia o email de CONFIRMAÇÃO de conta (confirm-email ON). Usado pelo popup de confirmação.
  async function cloudResendConfirm(email) {
    try {
      var sb = sbClient(); if (!sb) return { ok: false, reason: "sdk" };
      var r = await sb.auth.resend({ type: "signup", email: (email || "").trim().toLowerCase(), options: { emailRedirectTo: "https://morbiusfin.github.io/confirmado.html" } });
      return { ok: !r.error, reason: r.error && r.error.message };
    } catch (e) { return { ok: false, reason: "erro" }; }
  }

  // ---- cache local p/ abrir OFFLINE (tudo só abre com a senha) ----
  async function cloudMakeCt(data) {
    if (!window.CLOUD.dek) return null;
    var dekKey = await _importDEK(window.CLOUD.dek);
    return JSON.stringify(await _encKey(dekKey, data));
  }
  function cloudSnapshot(ctStr) {
    return JSON.stringify({ v: 1, email: window.CLOUD.email, salt: window.CLOUD.salt, wrapped_dek: window.CLOUD.wrapped, ct: ctStr });
  }
  async function cloudOfflineUnlock(senha, snapStr) {
    try {
      var snap = JSON.parse(snapStr);
      var kek = await window.deriveKey(senha, snap.salt);
      var dekObj = await _decKey(kek.key, JSON.parse(snap.wrapped_dek));
      var dek = _cub64(dekObj.dek);
      var data = await _decKey(await _importDEK(dek), JSON.parse(snap.ct));
      window.CLOUD.dek = dek; window.CLOUD.email = snap.email; window.CLOUD.salt = snap.salt; window.CLOUD.wrapped = snap.wrapped_dek;
      return { ok: true, data: data };
    } catch (e) { return { ok: false, reason: "senha-errada" }; }
  }

  // Garante que TODA conta nova apareça no painel admin (linha em 'licencas').
  // 1) tenta a RPC ensure_licenca() (se o SQL foi rodado: SECURITY DEFINER, anti-clobber);
  // 2) FALLBACK robusto: se não há linha pra este usuário, cria o trial de 7 dias direto
  //    (idempotente; não duplica se já existir por user_id ou por email). Fail-silent.
  async function cloudRegisterLicenca(nome, tel) {
    try {
      var sb = sbClient(); if (!sb) return;
      var u = await sb.auth.getUser(); if (!u.data || !u.data.user) return;
      var uid = u.data.user.id;
      var email = (u.data.user.email || "").toLowerCase().trim();
      try { await sb.rpc("ensure_licenca"); } catch (e) {}                 // se a RPC existir, já cria/vincula
      var q1 = await sb.from("licencas").select("user_id").eq("user_id", uid).limit(1);
      var temLinha = !q1.error && q1.data && q1.data.length;               // já tem linha por user_id?
      if (!q1.error && !temLinha) {
        var skip = false;
        if (email) { var q2 = await sb.from("licencas").select("email").eq("email", email).limit(1); if (q2.error || (q2.data && q2.data.length)) skip = true; }
        if (!skip) { var validade = new Date(Date.now() + 7 * 86400000).toISOString(); await sb.from("licencas").insert({ user_id: uid, email: email, status: "ativo", plano: "teste", validade: validade }); }   // 1ª vez: trial 7 dias (plano key="teste", rótulo "Novo" na UI)
      }
      // Sobe NOME+TELEFONE pro painel admin (colunas nome/telefone via RPC SECURITY DEFINER). NÃO entram no
      // insert de propósito: se o Kaick ainda não rodou o ALTER/RPC, a conta continua nascendo normal (fail-silent).
      if ((nome && nome.trim()) || (tel && tel.trim())) { await cloudSetContato(nome, tel); }
    } catch (e) {}
  }
  // Grava NOME e TELEFONE na licença (pro admin achar pela pessoa). RPC (SECURITY DEFINER) atualiza por
  // user_id OU email da sessão; coalesce no SQL → mandar vazio não apaga o que já tinha.
  async function cloudSetContato(nome, tel) {
    try { var sb = sbClient(); if (!sb) return; nome = (nome || "").trim(); tel = (tel || "").trim(); if (!nome && !tel) return; await sb.rpc("set_licenca_perfil", { p_nome: nome, p_tel: tel }); } catch (e) {}
  }

  // checa a licença no login. FAIL-OPEN: qualquer erro/sem linha/sem rede => libera (nunca trancar por bug).
  // Só barra em caso EXPLÍCITO: status 'bloqueado' ou validade vencida (validade null = vitalício, nunca expira).
  // Lê plano e validade e expõe em window.CLOUD.plano / window.CLOUD.validade p/ a UI de trial/tier.
  function _licDiag(d) { try { window.__lic = Object.assign({ t: Date.now() }, d); } catch (e) {} return d; }
  async function cloudCheckLicenca() {
    try {
      var sb = sbClient(); if (!sb) { _licDiag({ diag: "sem-sdk" }); return { ok: true, err: true, diag: "sem-sdk" }; }
      // CHAVE = user_id (PK) OU email. user_id em memória (signIn) ou getSession (local, sem rede).
      var uid = (window.CLOUD && window.CLOUD.uid) ? window.CLOUD.uid : "";
      var email = (window.CLOUD && window.CLOUD.email ? window.CLOUD.email : "").toLowerCase().trim();
      var hasSession = false;
      try { var s = await sb.auth.getSession(); if (s && s.data && s.data.session && s.data.session.user) { hasSession = true; if (!uid) { uid = s.data.session.user.id; window.CLOUD.uid = uid; } if (!email) email = (s.data.session.user.email || "").toLowerCase().trim(); } } catch (e) {}
      if (!uid && !email) { _licDiag({ diag: "sem-sessao", hasSession: hasSession }); return { ok: true, err: true, diag: "sem-sessao" }; }
      // CHAVE DUPLA: user_id (PK) OU email. Cobre linha com user_id defasado (conta recriada em testes).
      var q;
      if (uid && email) q = await sb.from("licencas").select("user_id,status,plano,validade").or("user_id.eq." + uid + ",email.eq." + email).limit(1);
      else if (uid)     q = await sb.from("licencas").select("user_id,status,plano,validade").eq("user_id", uid).limit(1);
      else              q = await sb.from("licencas").select("user_id,status,plano,validade").eq("email", email).limit(1);
      if (q.error) { _licDiag({ diag: "erro-leitura", erro: q.error.message, hasSession: hasSession, uid: uid }); return { ok: true, err: true, diag: "erro-leitura", erro: q.error.message }; }
      var l = q.data && q.data[0];
      if (!l) { _licDiag({ diag: "sem-linha", hasSession: hasSession, uid: uid, email: email }); return { ok: true, err: true, diag: "sem-linha" }; }   // leu mas RLS/escopo não devolveu linha (ou linha não existe)
      // Expõe plano e validade na sessão (pra UI do banner/tier)
      window.CLOUD.plano = l.plano || "teste";
      window.CLOUD.validade = l.validade || null;
      _licDiag({ diag: "ok", key: (l.user_id === uid ? "uid" : "email"), uid: uid, plano: l.plano, status: l.status, validade: l.validade });
      if (l.status === "bloqueado") return { ok: false, reason: "bloqueado", plano: l.plano, validade: l.validade };
      if (l.validade) {
        var agora = new Date();
        var v = new Date(l.validade);
        if (!isNaN(v.getTime()) && v < agora) return { ok: false, reason: "expirado", plano: l.plano, validade: l.validade };
      }
      return { ok: true, plano: l.plano, validade: l.validade };
    } catch (e) { _licDiag({ diag: "excecao", erro: String(e && e.message || e) }); return { ok: true, err: true, diag: "excecao" }; }
  }

  // REALTIME: o Supabase EMPURRA qualquer mudança na linha de licença do usuário (admin mexeu →
  // chega na hora, sem depender só do poll). Chama onChange a cada INSERT/UPDATE/DELETE da própria linha.
  var _licChannel = null;
  function cloudWatchLicenca(onChange) {
    try {
      var sb = sbClient(); if (!sb) return;
      var uid = (window.CLOUD && window.CLOUD.uid) ? window.CLOUD.uid : "";
      if (!uid) return;
      cloudUnwatchLicenca();
      // Assina por user_id E por email (2 filtros) — cobre linha com user_id defasado e garante o push.
      var email = (window.CLOUD && window.CLOUD.email ? window.CLOUD.email : "").toLowerCase().trim();
      var ch = sb.channel("lic-" + uid);
      ch.on("postgres_changes", { event: "*", schema: "public", table: "licencas", filter: "user_id=eq." + uid },
        function () { try { window.__licRT = { t: Date.now(), via: "uid" }; } catch (e) {} try { if (typeof onChange === "function") onChange(); } catch (e) {} });
      if (email) ch.on("postgres_changes", { event: "*", schema: "public", table: "licencas", filter: "email=eq." + email },
        function () { try { window.__licRT = { t: Date.now(), via: "email" }; } catch (e) {} try { if (typeof onChange === "function") onChange(); } catch (e) {} });
      ch.subscribe(function (status) { try { window.__licRTStatus = status; } catch (e) {} });
      _licChannel = ch;
    } catch (e) {}
  }
  function cloudUnwatchLicenca() { try { if (_licChannel) { sbClient().removeChannel(_licChannel); _licChannel = null; } } catch (e) {} }

  window.MFCloud = {
    configured: cloudConfigured,
    signUp: cloudSignUp, signIn: cloudSignIn, push: cloudPush, pull: cloudPull,
    signOut: cloudSignOut, session: cloudSession, reset: cloudResetSenha, resendConfirm: cloudResendConfirm,
    updatePassword: cloudUpdatePassword,
    watchLicenca: cloudWatchLicenca, unwatchLicenca: cloudUnwatchLicenca,
    makeCt: cloudMakeCt, snapshot: cloudSnapshot, offlineUnlock: cloudOfflineUnlock,
    registerLicenca: cloudRegisterLicenca, checkLicenca: cloudCheckLicenca, setContato: cloudSetContato,
  };
  // Inicia o cliente já no carregamento → processa o token do link de recuperação (detectSessionInUrl)
  // e registra o listener de PASSWORD_RECOVERY mesmo antes de qualquer login.
  try { sbClient(); } catch (e) {}
})();
