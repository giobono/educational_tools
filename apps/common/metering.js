/* ============================================================================
 * apps/common/metering.js — the banner, the sign-in panel, the Terms, the
 * stop and the account panel
 *
 * Metering phase 3 (OD brief v1.1 of 19 Nov 2026, §4.2–§4.6). Loaded after
 * edu_common.js, metering_strings.js and signin.js on every page that can
 * reach a model (gioianie's two, sanzognie's one, pluralitie's frame-naming
 * step). corres's non-LLM pages never load it.
 *
 * Every word shown comes from metering_strings.js (CD's). This file decides
 * *which* string, from the API's `detail.code` and never from its message,
 * and fills the placeholders:
 *   {pct}            project.used_pct from /v1/account, rounded
 *   {reset_date}     project.resets_on, shown as "1 December" (a plain date,
 *                    no timezone shift)
 *   {terms_version}  terms.current from /v1/account, or the 409's `current`
 *   {email}          person.email
 *   {project}        project.name
 *   {my_pct}         projects[].mine.used_pct (the person's own use of the
 *                    chosen project this period, computed by the API against
 *                    the member cap where one applies, else the allowance)
 *   {pack_aud}       the pack's A$ price, from /v1/account topups.packs
 *   {bought_pct}     the project's active lots: remaining over bought, rounded
 *   {expiry_date}    the latest expiry among the project's active lots, as
 *                    "26 November 2027"
 *
 * The paid tier (OD's build brief to D2Dev of 26 Nov 2026, 1.3–1.4): S17 for
 * a project with nothing this month, S18 naming the project a run charges,
 * S20 on bought use, and S19 (the purchase screen) reachable from S7 and the
 * account panel **only while /v1/account says top-ups are enabled**. R1:
 * file controls are withheld while the project has nothing available.
 *
 * The banner reads /v1/account. The X-Allowance-* headers are also read when
 * a response carries them, but the five metered routes answer 202 before the
 * workflow runs, so on task routes they never do; /v1/account is refreshed
 * after each task instead.
 *
 * Uses only getToken(), signIn() and signOut() from signin.js.
 * ============================================================================ */

(function () {
  'use strict';

  const state = {
    appId: null, product: null, account: null, signedIn: false,
    projectId: null, panel: null, accountOpen: false, termsPromise: null, mount: null,
    // init({ banner: false }): sign-in and the Terms only, no banner and no
    // account panel, for a page with no allowance to report (CR3: OD's merge
    // brief of 19 Nov 2026 §3).
    banner: true,
    // init({ banner: false, accountBar: true }): no allowance banner, but who is
    // signed in and a way to sign out (OD brief to DnDev of 25 Nov 2026, §5B):
    // corres and the edu home page, which had no way out but a private window.
    accountBar: false,
    // init({ signInPanel: false }): S1 is not shown when signed out (the home
    // page, whose words are CD's launch copy).
    signInPanel: true,
  };
  try { state.projectId = sessionStorage.getItem('artie.projectId') || null; } catch (_) { /* private mode */ }

  const S = () => window.ARTIE_STRINGS || {};
  const cfg = () => window.ARTIE_AUTH_CONFIG || {};
  const apiBase = () => (window.CORRES_CONFIG && window.CORRES_CONFIG.apiBase) || '';
  const $ = id => document.getElementById(id);

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function fmt(text, vars) {
    return String(text == null ? '' : text).replace(/\{(\w+)\}/g, (m, k) =>
      (vars && vars[k] !== undefined && vars[k] !== null) ? String(vars[k]) : m);
  }
  // A string by its S-number path. A missing one shows its own name, so a
  // gap is visible rather than filled with words that are not CD's.
  function str(path) {
    const [k, sub] = path.split('.');
    const s = S()[k];
    const v = s && (sub ? s[sub] : s.text);
    return v == null ? `[${path}]` : v;
  }
  // "1 December", Brisbane's calendar: the API gives a plain date.
  function resetDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = String(iso).split('-').map(Number);
    if (!y || !m || !d) return String(iso);
    return new Date(y, m - 1, d).toLocaleDateString('en-AU', { day: 'numeric', month: 'long' });
  }
  // Every "contact us" links to the support address (CD's note, 19 Nov 2026).
  function withLinks(text) {
    const url = cfg().supportUrl || 'https://ebono.au/support/';
    return esc(text).replace(/\b([Cc]ontact us)\b/g, `<a href="${esc(url)}">$1</a>`);
  }

  // ── the mount: banner, account panel, state panel, in that order ────────
  function mount() {
    if (state.mount) return state.mount;
    let el = $('artie-metering');
    if (!el) {
      el = document.createElement('div');
      el.id = 'artie-metering';
      const header = $('edu-header');
      if (header && header.parentNode) header.parentNode.insertBefore(el, header.nextSibling);
      else document.body.insertBefore(el, document.body.firstChild);
    }
    el.innerHTML = state.banner
      ? '<div id="artie-banner"></div><div id="artie-run"></div><div id="artie-account"></div><div id="artie-panel"></div>'
      : (state.accountBar ? '<div id="artie-bar"></div>' : '') + '<div id="artie-panel"></div>';
    state.mount = el;
    return el;
  }

  // ── the token and the project ───────────────────────────────────────────
  async function token() {
    return (typeof window.getToken === 'function') ? await window.getToken() : null;
  }
  // Only the projects this app's calls may be charged to: the app's own, or a
  // platform-wide (`artie`) one (OD brief to DnDev of 25 Nov 2026, §3). On
  // 25 Nov sanzognie's calls were charged to a gioianie project chosen here.
  const PLATFORM_PRODUCT = 'artie';
  function projects() {
    const all = (state.account && state.account.projects) || [];
    return state.product ? all.filter(p => p.product === state.product || p.product === PLATFORM_PRODUCT) : all;
  }
  function currentProject() {
    const ps = projects();
    return ps.find(p => p.id === state.projectId) || ps.find(p => p.product === state.product) || ps[0] || null;
  }
  // The project the banner shows is the project a call is charged to: the
  // id is sent as X-Project-Id on every call once the account is known.
  function projectId() { const p = currentProject(); return p ? p.id : null; }
  function chooseProject(id) {
    state.projectId = id || null;
    try { if (id) sessionStorage.setItem('artie.projectId', id); else sessionStorage.removeItem('artie.projectId'); } catch (_) { /* private mode */ }
    render();
  }

  // ── errors, in the platform's shape {"detail": {"code", "message"}} ─────
  async function parseError(res) {
    let body = null;
    try { body = await res.json(); } catch (_) { /* no body */ }
    const d = (body && typeof body.detail === 'object' && body.detail) || {};
    const err = new Error(d.message || res.statusText || `HTTP ${res.status}`);
    err.status = res.status;
    err.code = d.code || `http_${res.status}`;
    err.scope = d.scope;
    err.detail = d;
    return err;
  }

  // ── /v1/account ─────────────────────────────────────────────────────────
  async function refresh() {
    const t = await token();
    state.signedIn = !!t;
    if (!t) { state.account = null; render(); return null; }
    const res = await fetch(`${apiBase()}/v1/account`, { headers: { Authorization: `Bearer ${t}` } });
    if (!res.ok) {
      const err = await parseError(res);
      state.account = null;
      render();
      if (!handled(err)) throw err;
      return null;
    }
    state.account = await res.json();
    render();
    return state.account;
  }

  // X-Allowance-* on any response that carries them (phase 1 §3.6).
  function observeResponse(res) {
    if (!res || !res.headers) return;
    const pct = res.headers.get('X-Allowance-Used-Pct');
    if (pct === null) return;
    const p = currentProject();
    if (!p) return;
    p.used_pct = parseFloat(pct);
    const remaining = res.headers.get('X-Allowance-Remaining');
    if (remaining !== null) p.remaining = parseFloat(remaining);
    const warning = res.headers.get('X-Allowance-Warning');
    p.warning = warning ? parseInt(warning, 10) : null;
    renderBanner();
  }

  // ── rendering ───────────────────────────────────────────────────────────
  function render() {
    mount();
    renderBanner();
    renderRun();
    renderAccount();
    renderBar();
    if (!state.signedIn && state.signInPanel) renderSignedOut();
    else if (state.panel === 'signedout') clearPanel();
    gate();
  }

  // ── nothing is chosen before sign-in (OD brief to DnDev of 25 Nov, §5) ──
  // Until sign-in completes, every file control on the page is disabled, a
  // container marked `data-requires-signin` (a sample list, an upload
  // choice) is inert, and a file dropped on the page is refused, so S1 is
  // the one way on. Before, a researcher could choose files and was asked to
  // sign in only at the upload, so the choosing was wasted.
  const GATED = 'data-artie-gated';
  // R1 (the paid tier, 1.4): on a metered page, a project with nothing
  // available (no free allowance left, no bought use) withholds uploads too,
  // so no one prepares a run that can only be stopped.
  function nothingAvailable() {
    if (!state.banner || !state.signedIn || !state.account) return false;
    const p = currentProject();
    return !!p && typeof p.remaining === 'number' && p.remaining <= 0;
  }
  function gate() {
    const out = !state.signedIn || nothingAvailable();
    document.querySelectorAll('input[type="file"]').forEach(el => {
      if (out && !el.disabled) { el.disabled = true; el.setAttribute(GATED, ''); }
      else if (!out && el.hasAttribute(GATED)) { el.disabled = false; el.removeAttribute(GATED); }
    });
    document.querySelectorAll('[data-requires-signin]').forEach(el => {
      const out = !state.signedIn;                   // a sample needs sign-in, not allowance
      el.inert = out;
      el.classList.toggle('artie-needs-signin', out);
      if (out) el.setAttribute('aria-disabled', 'true'); else el.removeAttribute('aria-disabled');
    });
  }
  function refuseDrop(e) {
    if (state.signedIn) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
  }
  // Capture phase, so a page's own drop zone never sees the files.
  window.addEventListener('dragover', refuseDrop, true);
  window.addEventListener('drop', refuseDrop, true);
  // Controls drawn after load (gioianie draws its file inputs) are gated too.
  new MutationObserver(() => { if (!state.signedIn || nothingAvailable()) gate(); })
    .observe(document.documentElement, { childList: true, subtree: true });

  function vars(p) {
    return {
      pct: Math.round(p.used_pct || 0),
      reset_date: resetDate(p.resets_on),
      project: p.name,
      remaining: p.remaining != null ? Number(p.remaining).toFixed(0) : '—',
      allowance: p.allowance != null ? Number(p.allowance).toFixed(0) : '—',
    };
  }
  function longDate(iso) {
    const d = iso ? new Date(iso) : null;
    if (!d || isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Australia/Brisbane' });
  }
  function activeLots(p) { return (p.lots || []).filter(l => l.status === 'active'); }
  function bought(p) {
    const lots = activeLots(p);
    const total = lots.reduce((a, l) => a + (l.ebonis || 0), 0);
    const left = lots.reduce((a, l) => a + (l.remaining || 0), 0);
    const last = lots.map(l => l.expires_at).sort().pop();
    return { bought_pct: total ? Math.round(left / total * 100) : 0, expiry_date: longDate(last) };
  }
  function bannerKind(p) {
    const has = (p.bought_remaining || 0) > 0;
    if (!has && !(p.allowance > 0)) return 'S17';
    if (has && (p.used_pct || 0) >= 100) return 'S20';
    return null;
  }
  function bannerText(p) {
    const kind = bannerKind(p);
    if (kind === 'S20') return fmt(str('S20.text'), bought(p));
    if ((cfg().allowanceDisplay || 'percent') === 'ebonis') return fmt(str('UNFILLED.S4_ebonis'), vars(p));
    const key = p.warning >= 95 ? 'S6' : p.warning >= 80 ? 'S5' : 'S4';
    return fmt(str(key + '.text'), vars(p));
  }
  function renderBanner() {
    const el = $('artie-banner');
    if (!el) return;
    const p = currentProject();
    if (!state.signedIn || !p) { el.innerHTML = ''; return; }
    const text = bannerKind(p) === 'S17' ? withLinks(str('S17.text')) : esc(bannerText(p));
    el.innerHTML = `<div class="artie-banner" data-warning="${p.warning || ''}" role="status">
      <span>${text}</span>
      <span class="artie-banner-controls">
        <button type="button" id="artie-account-btn" aria-expanded="${state.accountOpen}">${esc(str('S16.title'))}</button>
        <button type="button" id="artie-signout-btn">${esc(str('S16.signout'))}</button>
      </span></div>`;
    $('artie-account-btn').onclick = () => { state.accountOpen = !state.accountOpen; renderBanner(); renderAccount(); };
    $('artie-signout-btn').onclick = () => window.signOut();
  }

  // S18. Before every run: the project it charges, and a way to change it,
  // which opens the account panel's project list.
  function renderRun() {
    const el = $('artie-run');
    if (!el) return;
    const p = currentProject();
    if (!state.signedIn || !p) { el.innerHTML = ''; return; }
    el.innerHTML = `<p class="artie-run" role="note">${esc(fmt(str('S18.text'), { project: p.name }))}
      <a href="#" id="artie-change-project">${esc(str('S18.change_project'))}</a></p>`;
    $('artie-change-project').onclick = (e) => { e.preventDefault(); state.accountOpen = true; renderBanner(); renderAccount(); };
  }

  // ── top-ups (S19): only while /v1/account says they are enabled ──────────
  function topupsOn() { return !!(state.account && state.account.topups && state.account.topups.enabled); }
  function packs() { return (state.account && state.account.topups && state.account.topups.packs) || []; }
  function openBuy() {
    const p = currentProject();
    if (!topupsOn() || !p) return false;
    const opts = packs().map((k, i) => `<label class="artie-pack"><input type="radio" name="artie-pack" value="${esc(k.name)}" ${i === 0 ? 'checked' : ''}>
      <span>${esc(fmt(str('S19.pack'), { pack_aud: k.aud }))}</span></label>`).join('');
    showPanel('buy', `<h2 class="cr-gate-title">${esc(str('S19.heading'))}</h2>
      <p class="cr-gate-body">${esc(fmt(str('S19.body'), { project: p.name }))}</p>
      <div class="artie-packs">${opts}</div>
      <button type="button" class="cr-gate-action" id="artie-buy-btn">${esc(str('S19.button'))}</button>`);
    $('artie-buy-btn').onclick = () => {
      const chosen = document.querySelector && document.querySelector('input[name="artie-pack"]:checked');
      buy(chosen ? chosen.value : (packs()[0] || {}).name).catch(err => { if (!handled(err)) console.error(err); });
    };
    return true;
  }
  // The page sends a pack name and where to come back to; the server sets the
  // price and the project's membership is its check (spec §4.2).
  async function buy(name) {
    const p = currentProject();
    const pack = packs().find(k => k.name === name);
    if (!topupsOn() || !p || !pack) return;
    const t = await token();
    const back = String(window.location.href || '').split('?')[0].split('#')[0];
    const res = await fetch(`${apiBase()}/v1/projects/${encodeURIComponent(p.id)}/topups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
      body: JSON.stringify({ pack: pack.name, return_url: back }),
    });
    if (!res.ok) throw await parseError(res);
    const out = await res.json();
    try { sessionStorage.setItem('artie.topup', JSON.stringify({ project: p.id, aud: pack.aud })); } catch (_) { /* private mode */ }
    window.location.assign(out.url);
  }
  // The return from Stripe credits nothing (spec §4.3): S19's *done* is shown
  // only once the server says the lot exists, asked a few times while the
  // webhook arrives.
  function query(name) {
    const m = new RegExp('[?&]' + name + '=([^&#]*)').exec(String(window.location.search || ''));
    return m ? decodeURIComponent(m[1]) : null;
  }
  async function afterReturn() {
    const outcome = query('topup');
    if (!outcome || !state.signedIn) return;
    if (outcome === 'cancelled') { showPanel('buy', `<p class="cr-gate-body">${esc(str('S19.cancelled'))}</p>`); return; }
    const session = query('session_id');
    let kept = {};
    try { kept = JSON.parse(sessionStorage.getItem('artie.topup') || '{}') || {}; } catch (_) { /* private mode */ }
    const p = projects().find(x => x.id === kept.project) || currentProject();
    if (outcome !== 'done' || !session || !p) return;
    for (let attempt = 0; attempt < 10; attempt++) {
      const t = await token();
      const res = await fetch(`${apiBase()}/v1/projects/${encodeURIComponent(p.id)}/topups/${encodeURIComponent(session)}`,
                              { headers: { Authorization: `Bearer ${t}` } });
      const body = res.ok ? await res.json() : {};
      if (body.credited) {
        try { sessionStorage.removeItem('artie.topup'); } catch (_) { /* private mode */ }
        showPanel('buy', `<p class="cr-gate-body">${esc(fmt(str('S19.done'), { pack_aud: kept.aud || '', project: p.name }))}</p>`);
        refresh().catch(() => {});
        return;
      }
      if (typeof setTimeout !== 'function') return;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // §5B. Who is signed in, and S16's sign-out, for a page with no banner. The
  // email is the person's own, from /v1/account; no new words.
  function renderBar() {
    const el = $('artie-bar');
    if (!el) return;
    const email = state.account && state.account.person && state.account.person.email;
    if (!state.signedIn || !email) { el.innerHTML = ''; return; }
    el.innerHTML = `<div class="artie-banner artie-bar" role="status">
      <span class="artie-technical">${esc(email)}</span>
      <span class="artie-banner-controls">
        <button type="button" id="artie-bar-signout">${esc(str('S16.signout'))}</button>
      </span></div>`;
    $('artie-bar-signout').onclick = () => window.signOut();
  }

  // S16. No ceiling or pool figure, and no provider tokens (CD seat file
  // §5.1, I3): only what /v1/account returns about this person.
  function renderAccount() {
    const el = $('artie-account');
    if (!el) return;
    if (!state.accountOpen || !state.account) { el.innerHTML = ''; return; }
    const a = state.account, ps = projects(), cur = currentProject();
    const lines = ps.map(p => `<li>${ps.length > 1
      ? `<input type="radio" name="artie-project" value="${esc(p.id)}" ${cur && cur.id === p.id ? 'checked' : ''} aria-label="${esc(p.name)}">` : ''}
      <span>${esc(fmt(str('S16.project_line'), vars(p)))}</span></li>`).join('');
    // {my_pct}: the person's own use of the chosen project this period, as the
    // API computes it (`projects[].mine.used_pct`, D2Dev's Part B follow-up of
    // 19 Nov: against the member cap where one applies, else the allowance).
    // The earlier approximation from `usage.ebonis` stands in only where the
    // field is absent, which no current API build produces.
    const mine = cur && cur.mine;
    const own = (a.usage && a.usage.ebonis) || 0;
    const myPct = mine && typeof mine.used_pct === 'number'
      ? Math.round(mine.used_pct)
      : (cur && cur.allowance ? Math.round(own / cur.allowance * 100) : 0);
    el.innerHTML = `<section class="artie-account">
      <h3>${esc(str('S16.title'))}</h3>
      <div class="artie-technical">${esc((a.person && a.person.email) || '')}</div>
      <h4>${esc(str('S16.projects'))}</h4><ul>${lines}</ul>
      ${cur ? `<p class="artie-my-use">${esc(fmt(str('S16.my_use'), { my_pct: myPct, project: cur.name }))}</p>` : ''}
      ${cur && topupsOn() ? `<button type="button" class="cr-gate-action" id="artie-account-topup">${esc(str('S7.topup_button'))}</button>` : ''}
    </section>`;
    if (el.querySelectorAll) el.querySelectorAll('input[name="artie-project"]').forEach(r => { r.onchange = () => chooseProject(r.value); });
    const add = cur && topupsOn() ? $('artie-account-topup') : null;
    if (add) add.onclick = () => openBuy();
  }

  function showPanel(kind, html) {
    mount();
    state.panel = kind;
    const el = $('artie-panel');
    el.innerHTML = `<div class="artie-panel"><div class="cr-gate">${html}</div></div>`;
    if (kind !== 'signedout') el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function clearPanel() {
    state.panel = null;
    const el = $('artie-panel');
    if (el) el.innerHTML = '';
  }

  // S1. The email, if typed, is passed to sign-in as a hint; the supplier's
  // page collects it otherwise.
  function renderSignedOut() {
    showPanel('signedout', `
      <h2 class="cr-gate-title">${esc(str('S1.heading'))}</h2>
      <p class="cr-gate-body">${esc(str('S1.body'))}</p>
      <form id="artie-signin-form">
        <div><label for="artie-signin-email">${esc(str('S1.email_label'))}</label>
        <input type="email" id="artie-signin-email" autocomplete="email"></div>
        <button type="submit" class="cr-gate-action">${esc(str('S1.button'))}</button>
      </form>`);
    $('artie-signin-form').onsubmit = (e) => {
      e.preventDefault();
      const hint = $('artie-signin-email').value.trim();
      window.signIn(window.location.href, hint || undefined);
    };
  }

  // S7 / S8. The product's own design, not an error page (spec v0.2 F5). The
  // partial result is the task record, downloadable from the screen.
  function stop(err) {
    const member = err.scope === 'member';
    const p = currentProject() || {};
    const v = { reset_date: resetDate(p.resets_on) };
    const s = member ? 'S8' : 'S7';
    let html = `<h2 class="cr-gate-title">${esc(str(s + '.heading'))}</h2>
      <p class="cr-gate-body">${withLinks(fmt(str(s + '.body'), v))}</p>`;
    if (!member) {
      if (err.task) html += `<p class="artie-partial"><a href="#" id="artie-partial-link">${esc(str('S7.partial_link'))}</a></p>`;
      if (topupsOn()) html += `<div class="artie-topup">
        <p class="cr-gate-body">${esc(fmt(str('S7.topup'), v))}</p>
        <button type="button" class="cr-gate-action" id="artie-topup-btn">${esc(str('S7.topup_button'))}</button></div>`;
      html += `<p class="cr-gate-sub">${withLinks(str('S7.team'))}</p>`;
    }
    showPanel('stop', html);
    const add = topupsOn() ? $('artie-topup-btn') : null;
    if (add) add.onclick = () => openBuy();
    partialLink(err);
    refresh().catch(() => {});
  }
  // The task record, kept whatever ended the task, downloadable from the panel.
  function partialLink(err) {
    const link = $('artie-partial-link');
    if (link) link.onclick = (e) => {
      e.preventDefault();
      const name = `results-so-far-${err.task.task_id || 'task'}.json`;
      if (window.downloadBlob) window.downloadBlob(name, JSON.stringify(err.task, null, 2), 'application/json');
    };
  }
  // A task ended by a server restart (restart sweep §3.4): its own line, the
  // items already done kept, and its hold already released by the server.
  function interrupted(err) {
    let html = `<p class="cr-gate-body">${esc(str('UNFILLED.S21_interrupted'))}</p>`;
    if (err.task) html += `<p class="artie-partial"><a href="#" id="artie-partial-link">${esc(str('S7.partial_link'))}</a></p>`;
    showPanel('interrupted', html);
    partialLink(err);
    refresh().catch(() => {});
  }

  function line(s, v) {
    showPanel(s, `<p class="cr-gate-body">${withLinks(fmt(str(s + '.text'), v))}</p>`);
  }

  // Maps a code to its string (§4.4). Returns true when the error was shown
  // here, so the page's own showError() stays quiet. Reads detail.code only.
  function handled(err) {
    if (!err || !err.code) return false;
    const v = { email: state.account && state.account.person && state.account.person.email };
    switch (err.code) {
      case 'allowance_exhausted': stop(err); return true;
      case 'interrupted_by_restart': interrupted(err); return true;
      case 'service_at_capacity':
        showPanel('capacity', `<h2 class="cr-gate-title">${esc(str('S9.heading'))}</h2><p class="cr-gate-body">${withLinks(str('S9.body'))}</p>`);
        return true;
      case 'suspended': line('S10'); return true;
      case 'email_unverified': line('S11', v); return true;
      case 'no_project': line('S12'); return true;
      case 'not_a_member': chooseProject(null); line('S13'); return true;
      // A project kept from another app's page (OD brief of 25 Nov, §3): the
      // choice is dropped and the server's own line is shown.
      case 'project_product_mismatch':
        chooseProject(null);
        showPanel('mismatch', `<p class="cr-gate-body">${esc(err.message)}</p>`);
        return true;
      case 'identity_unavailable': line('S14'); return true;      // the token may be fine: no sign-in redirect
      case 'terms_not_configured': line('S15'); return true;
      case 'model_not_available':
        // A user should never see this; a technical line, and the console.
        console.error('model_not_available', err.detail || err);
        showPanel('technical', `<p class="artie-technical">${esc(err.code)}: ${esc(err.message)}</p>`);
        return true;
      case 'unauthenticated': window.signIn(window.location.href); return true;
      default: return false;
    }
  }

  // ── the Terms (S2, S3) ──────────────────────────────────────────────────
  // Resolves true once the current version is accepted, so the caller can
  // retry. A 409 means the version moved under us: show S3 with the new one.
  function requireTerms() {
    if (state.termsPromise) return state.termsPromise;
    state.termsPromise = (async () => {
      try {
        const account = state.account || await refresh();
        const current = account && account.terms && account.terms.current;
        if (!current) { line('S15'); return false; }
        const had = account.person && account.person.terms_version;
        let version = current, isNew = !!had && had !== current;
        for (let attempt = 0; attempt < 3; attempt++) {
          await showTerms(version, isNew);
          const t = await token();
          const res = await fetch(`${apiBase()}/v1/account/terms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${t}` },
            body: JSON.stringify({ version }),
          });
          if (res.ok) { await refresh(); return true; }
          const err = await parseError(res);
          if (err.status === 409 && err.detail && err.detail.current) { version = err.detail.current; isNew = true; continue; }
          if (!handled(err)) line('S15');
          return false;
        }
        return false;
      } finally {
        state.termsPromise = null;
      }
    })();
    return state.termsPromise;
  }

  function showTerms(version, isNew) {
    return new Promise(resolve => {
      const s = isNew ? 'S3' : 'S2';
      const c = cfg();
      let overlay = $('artie-terms-modal');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'artie-terms-modal';
        overlay.className = 'modal-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        document.body.appendChild(overlay);
      }
      // The links are to the published pages, set by configuration; until a
      // surface has them, the link text stands unlinked.
      const link = (url, text) => url
        ? `<a href="${esc(url)}" target="_blank" rel="noopener">${esc(text)}</a>`
        : `<span title="link set by configuration">${esc(text)}</span>`;
      overlay.innerHTML = `<div class="modal">
        <h2>${esc(str(s + '.heading'))}</h2>
        <p class="modal-body">${esc(fmt(str(s + '.body'), { terms_version: version }))}</p>
        <div class="artie-terms-links">${link(c.termsUrl, str('S2.link_terms'))}${link(c.privacyUrl, str('S2.link_privacy'))}</div>
        <label class="artie-terms-check"><input type="checkbox" id="artie-terms-tick">
          <span>${esc(fmt(str('S2.checkbox'), { terms_version: version }))}</span></label>
        <div class="modal-actions"><span></span>
          <button type="button" class="modal-submit" id="artie-terms-accept" disabled>${esc(str('S2.button'))}</button></div>
      </div>`;
      const tick = $('artie-terms-tick'), accept = $('artie-terms-accept');
      tick.onchange = () => { accept.disabled = !tick.checked; };
      accept.onclick = () => { overlay.classList.remove('is-open'); resolve(); };
      overlay.classList.add('is-open');
    });
  }

  // ── init ────────────────────────────────────────────────────────────────
  async function init(opts) {
    state.appId = opts && opts.appId;
    state.product = (opts && opts.product) || state.appId;
    state.banner = !(opts && opts.banner === false);
    state.accountBar = !state.banner && !!(opts && opts.accountBar);
    state.signInPanel = !(opts && opts.signInPanel === false);
    mount();
    window.addEventListener('artie:signed-in', () => { refresh().catch(() => {}); });
    try { await refresh(); } catch (err) { console.warn('account:', err.message); }
    try { await afterReturn(); } catch (err) { console.warn('topup:', err.message); }
  }

  window.ArtieMetering = { init, token, projectId, chooseProject, observeResponse, requireTerms, handled, refresh,
                           openBuy, buy };
})();
