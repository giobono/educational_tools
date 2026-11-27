// The CR3 trial's pages (AD trial brief v1.1 §3). One page at a time; each
// page shows the elapsed time of every step on it and the run's total, and
// carries a notes box whose notes are saved with the run by page and time.
(function () {
  'use strict';
  // The engine's address comes from this app's config (config/apps/corres/
  // config.js, served by config.php), never from a constant here; the prefix
  // is the engine's on the one API (OD's merge brief of 19 Nov 2026 §2.1).
  const C = window.CORRES_CONFIG || {};
  const PREFIX = '/v3/corres';
  const API = (C.apiBase || '') + PREFIX;
  // The page's half of the sign-in switch (§3): false runs with no sign-in.
  const SIGN_IN = C.requireSignIn !== false;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PAGES = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
  let run = null;          // the run's public state
  let frames = null;       // the frames view
  let started = null;      // when this run began, for the clock
  let reached = 1;         // the furthest page reached
  let busy = null;         // what the one progress indicator shows (AD brief of 20 Nov §4.1)
  let nextOverride = null; // where Next goes after a run that made a new run (a variation)

  // --- page 3 wording: trial brief v1.1 §3.1, placed as given ---------------
  const OPENING = 'Your file holds two kinds of information, and corres treats them differently. Concepts are what your documents say: the codes you applied. Your frames are built from these alone. Document details are facts about each document: who wrote it, when, what kind of document it is. They are never used to build the frames. Once the frames are found, they show who voices each frame, which is often the finding you’ll discuss in your article. Keeping the two apart matters: a label for the speaker treated as a concept can become a frame of its own. If your file has no document details, you’ll still get frames, but not who voices them.';
  const FQ1 = 'Do you intend to firm up these results for publication?';
  // AD plain-language review of 12 Nov (p3.fq2, a claim, placed as written).
  const FQ2 = 'Later, we can show how strongly each frame is tied to a kind of document (its author, its date, its type). Each comparison takes some time, so choose the few most likely to matter; you can add others at any point. The ones you choose now are reported as planned; any added later as exploratory. That distinction protects you from the suggestion that a comparison was chosen because of what it showed.';

  // --- hovers: AD plain-language review of 12 Nov §5 ------------------------------
  // One mechanism for every string: glossary.js holds each string's hover (by
  // its inventory id) and the glossary (by slug); a string with a slug and no
  // hover of its own shows the glossary's. Placeholders in a hover are filled
  // from `vars`. A link appears only once articlesBase is configured.
  const GL = window.CR3_GLOSSARY || {}, HV = window.CR3_HOVERS || {};
  function tipText(id, vars) {
    const h = HV[id]; if (!h) return '';
    let t = h.hover || ((GL[h.link] || {}).hover) || '';
    if (vars) t = t.replace(/\{([^}]+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
    return t;
  }
  function tip(id, vars) {
    const t = tipText(id, vars); if (!t) return '';
    const h = HV[id]; const link = C.articlesBase && h.link ? ` data-link="${esc(C.articlesBase + h.link)}"` : '';
    return `<button type="button" class="tr-tip" aria-label="What this means" aria-expanded="false" data-tip="${esc(t)}"${link}>?</button>`;
  }
  // A hover from the glossary alone, where a string's own hover needs a value
  // only each concept has (p5.frame.diffuse's {failed test}).
  function glossTip(slug) {
    const g = GL[slug]; if (!g) return '';
    const link = C.articlesBase ? ` data-link="${esc(C.articlesBase + slug)}"` : '';
    return `<button type="button" class="tr-tip" aria-label="What this means" aria-expanded="false" data-tip="${esc(g.hover)}"${link}>?</button>`;
  }
  // A hover whose text the engine builds: the academic form of a plain
  // sentence (AD note of 16 Nov §2.1).
  function rawTip(text, link) {
    return text ? `<button type="button" class="tr-tip" aria-label="What this means" aria-expanded="false" data-tip="${esc(text)}"${link ? ` data-link="${esc(link)}"` : ''}>?</button>` : '';
  }
  // Trial brief v1.2 §2.2 (F1, F16): a count with its noun in the right
  // number, and a time the engine recorded in UTC shown in the researcher's own.
  const cnt = (k, w, p) => `${k} ${k === 1 ? w : (p || w + 's')}`;
  const localTime = (iso) => { const d = new Date(iso); return isNaN(d) ? String(iso) : d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }); };
  const localDate = (iso) => { const d = new Date(iso); return isNaN(d) ? String(iso) : d.toLocaleDateString(undefined, { dateStyle: 'long' }); };
  const zone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } };
  const pop = () => $('#tr-pop');
  let pinned = null;
  function openTip(b) {
    const p = pop(); p.textContent = b.dataset.tip;
    if (b.dataset.link) { const a = document.createElement('a'); a.href = b.dataset.link; a.target = '_blank'; a.textContent = 'Read more'; p.appendChild(a); }
    p.hidden = false; b.setAttribute('aria-expanded', 'true');
    const r = b.getBoundingClientRect(), w = p.offsetWidth;
    p.style.left = Math.max(8, Math.min(window.scrollX + r.left - 8, window.scrollX + document.documentElement.clientWidth - w - 8)) + 'px';
    p.style.top = (window.scrollY + r.bottom + 6) + 'px';
  }
  function closeTip() { pop().hidden = true; $$('.tr-tip[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false')); pinned = null; }
  document.addEventListener('mouseover', (e) => { const b = e.target.closest('.tr-tip'); if (b && !pinned) openTip(b); });
  document.addEventListener('mouseout', (e) => { const b = e.target.closest('.tr-tip'); if (b && !pinned) closeTip(); });
  document.addEventListener('focusin', (e) => { const b = e.target.closest('.tr-tip'); if (b && !pinned) openTip(b); });
  document.addEventListener('focusout', (e) => { if (e.target.closest('.tr-tip') && !pinned) closeTip(); });
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.tr-tip');
    if (b) { e.preventDefault(); if (pinned === b) closeTip(); else { closeTip(); openTip(b); pinned = b; } return; }
    if (pinned && !e.target.closest('#tr-pop')) closeTip();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeTip(); });
  function fillTips(root) { $$('[data-tip-id]', root).forEach((el) => { if (!el.dataset.tipDone) { el.insertAdjacentHTML('beforeend', tip(el.dataset.tipId)); el.dataset.tipDone = '1'; } }); }

  // --- plumbing ---------------------------------------------------------------
  async function call(method, path, body, isForm, retried) {
    const opt = { method, headers: { 'X-Request-Id': crypto.randomUUID() } };
    if (method === 'POST') opt.headers['Idempotency-Key'] = crypto.randomUUID();
    // Sign-in without metering (§3): the token on every call, from signin.js
    // alone; no project header, because nothing here is charged.
    if (SIGN_IN && typeof window.getToken === 'function') {
      const tok = await window.getToken();
      if (tok) opt.headers['Authorization'] = `Bearer ${tok}`;
    }
    if (body && !isForm) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    if (body && isForm) opt.body = body;
    const r = await fetch(API + path, opt);
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch (e) { data = text; }
    if (!r.ok) {
      const d = data && data.detail;
      const code = d && typeof d === 'object' ? d.code : null;
      // The Terms once (S2/S3, shown by metering.js), then the call again.
      if (SIGN_IN && code === 'terms_required' && !retried && window.ArtieMetering
          && await window.ArtieMetering.requireTerms()) return call(method, path, body, isForm, true);
      const msg = typeof d === 'string' ? d : (d && d.message) || `Something went wrong (${r.status}). Try again; if it repeats, note it here.`;
      const err = new Error(msg); err.status = r.status; err.detail = d; err.code = code; throw err;
    }
    return data;
  }
  // An error's string comes from metering.js where its code has one (401
  // sends the person to sign in; S10–S15 by code); the page's toast otherwise.
  function fail(e) {
    if (SIGN_IN && window.ArtieMetering && window.ArtieMetering.handled(e)) return;
    toast(e && e.message ? e.message : String(e));
  }
  function toast(msg) { const t = $('#tr-toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 6000); }
  // Trial brief v1.2 §2.2 (F10): whole seconds from a minute up, so neither
  // "1 min 60 s" nor "60.0 s" can appear; hours once there are any.
  const fmtS = (s) => {
    if (s == null) return '—';
    s = +s;
    if (s < 10) return `${s.toFixed(2)} s`;
    if (s < 59.95) return `${s.toFixed(1)} s`;
    const t = Math.round(s), h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), r = t % 60;
    return h ? `${h} h ${m} min` : `${m} min ${r} s`;
  };
  // --- AD brief of 20 Nov §4: one progress indicator, same place on every page ---
  // What runs now, in its plain words (inventory 4.3, 6.17, 6.18); the time so
  // far; and the estimate, which is the real figure for this host or nothing.
  function progressStart(title, estimate, note) {
    busy = { title, t0: Date.now(), estimate: estimate == null ? null : +estimate, line: '', note: note || '' };
    progressDraw(); $('#tr-progress').hidden = false;
  }
  function progressLine(line) { if (busy) { busy.line = line || ''; progressDraw(); } }
  function progressDraw() {
    if (!busy) return;
    const so = (Date.now() - busy.t0) / 1000;
    $('#tr-progress').innerHTML = `<b>Running: ${esc(busy.title)}</b>${busy.line ? `. ${esc(String(busy.line).replace(/\.$/, ''))}…` : ''}`
      + `<span class="tr-progress-time">${fmtS(so)} so far${busy.estimate != null ? ` · about ${fmtS(busy.estimate)}` : ''}</span>`
      + (busy.note ? `<span class="tr-small">${esc(busy.note)}</span>` : '');
  }
  function progressEnd() { busy = null; const p = $('#tr-progress'); p.hidden = true; p.innerHTML = ''; }
  setInterval(progressDraw, 1000);
  // §4.2–4.3: when a run finishes the page stays where it is and says the work
  // is ready; Next sits in the same place on every page, enabled when the next
  // page can be reached, and the app never moves on its own.
  // AD brief of 24 Nov 2026 §1: page 6 is skipped for everyone at launch. Its
  // run buttons are live on a stored sample, and the page's checks are set out
  // on page 5's tiers and in page 7's reviewer report. Next on page 5 goes to
  // page 7; the step bar leaves page 6 out; a jump to page 6 lands on page 5.
  // Reversed by putting 'p6' back in NEXT and emptying SKIPPED.
  const SKIPPED = new Set(['p6']);
  const NEXT = { p1: 'p2', p2: 'p3', p3: 'p4', p4: 'p5', p5: 'p7', p6: 'p7', p7: null };
  // What the next page needs before Next will take you there: a checked file
  // for page 3, a confirmed run for page 4, frames for pages 5 to 7.
  // AD's note of 23 Nov 2026 §2: a researcher's own file, as against a sample
  // (a sample's run carries its test corpus).
  const isUpload = () => !!run && !run.corpus;
  const SUPPORT_EMAIL = 'info@ebono.au';
  function nextAllowed(id) {
    if (id === 'p2') return true;
    if (id === 'p3') return !!run;
    if (id === 'p4') return !!run && reached >= 4;
    return !!frames;
  }
  function renderNext(cur) {
    const b = $('#tr-next'), n = nextOverride || NEXT[cur];
    b.hidden = !n;
    if (n) { b.disabled = !nextAllowed(n); b.onclick = () => { nextOverride = null; show(n); }; }
  }
  function ready(sentence) { $('#tr-ready').textContent = sentence || ''; }
  const current = () => PAGES.find((p) => $('#' + p).classList.contains('on')) || 'p1';
  // §5.2: what a stored result is, on every page that shows one. The estimate
  // is this host's, for the four checks on a file of this size.
  function renderStored() {
    const box = $('#tr-stored'), se = run && run.stored_example;
    if (!se) { box.hidden = true; box.textContent = ''; return; }
    // AD's note of 23 Nov 2026 §2: the old ending ("the checks take about
    // {estimate}") rested on main-run timings and could understate a day's work.
    box.textContent = `These are stored results for this sample, computed on ${localDate(se.computed)}. For your own file, we can run these checks and email you the results.`;
    box.hidden = false;
  }

  // --- AD's rights brief of 20 Nov 2026: the sighted statements, as written -----
  function rightsFull(r) {
    return `<div class="tr-rights"><b>${esc(r.heading)}</b>${r.paragraphs.map((t) => `<p>${esc(t)}</p>`).join('')}<p><b>${esc(r.cite_label || 'Please cite')}:</b> <i>${esc(r.cite)}</i> <a href="${esc(r.cite_url)}" target="_blank" rel="noopener">${esc(r.cite_url)}</a></p></div>`;
  }
  // The one-line form at the top of every page that shows a result from the
  // sample; "Rights and citation" opens the full statement under it.
  function renderRights() {
    const box = $('#tr-rights'), r = run && run.rights;
    if (!r) { box.hidden = true; box.innerHTML = ''; return; }
    box.innerHTML = `${esc(r.short)} <a href="#" id="tr-rights-more">Rights and citation.</a><div id="tr-rights-full" hidden>${rightsFull(r)}</div>`;
    $('#tr-rights-more').onclick = (e) => { e.preventDefault(); const f = $('#tr-rights-full'); f.hidden = !f.hidden; };
    box.hidden = false;
  }

  async function waitTask(taskId, onTick) {
    for (;;) {
      const t = await call('GET', `/tasks/${taskId}`);
      if (onTick) await onTick(t);
      if (['succeeded', 'failed', 'cancelled'].includes(t.state)) return t;
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  // --- navigation and the clock ------------------------------------------------
  function show(id) {
    if (SKIPPED.has(id)) id = 'p5';
    const n = PAGES.indexOf(id) + 1; if (n > reached) reached = n;
    PAGES.forEach((p) => $('#' + p).classList.toggle('on', p === id));
    renderSteps(id); renderNext(id); ready(''); window.scrollTo(0, 0);
    if (id === 'p4' && run && run.first_view && !busy) drawPage4().catch((e) => fail(e));
    if (id === 'p5' || id === 'p6' || id === 'p7') refreshFrames().catch((e) => fail(e));
  }
  function renderSteps(cur) {
    const nav = $('#tr-steps'); nav.innerHTML = '';
    let shown = 0;
    PAGES.forEach((p, i) => {
      if (SKIPPED.has(p)) return;
      shown += 1;
      const b = document.createElement('button');
      b.textContent = `${shown} ${$('#' + p).dataset.title}`; b.className = p === cur ? 'on' : '';
      b.disabled = i + 1 > reached || (i >= 3 && !run) || (i >= 4 && !frames);
      b.onclick = () => show(p); nav.appendChild(b);
    });
  }
  setInterval(() => { if (started) $('#tr-clock').textContent = 'This run: ' + fmtS((Date.now() - started) / 1000); }, 1000);
  $$('[data-go]').forEach((b) => { b.onclick = () => show(b.dataset.go); });

  // --- notes, on every page ------------------------------------------------------
  function renderNotes() {
    $$('.tr-notes').forEach((box) => {
      const page = box.dataset.page;
      const mine = ((run && run.notes) || []).filter((n) => n.page === page);
      box.innerHTML = `<label class="tr-small" style="display:block">Your notes on this page${run ? '' : ' (start a run to save them)'}</label>
        <textarea placeholder="What you noticed, how long it felt, what you would have wanted here"></textarea>
        <br><button class="tr-btn">Save note</button>
        <div class="saved">${mine.map((n) => `${esc(localTime(n.at))}: ${esc(n.text)}`).join('<br>')}</div>`;
      $('button', box).onclick = async () => {
        const text = $('textarea', box).value; if (!text.trim() || !run) return;
        await call('POST', `/runs/${run.run_id}/notes`, { page, text });
        run = await call('GET', `/runs/${run.run_id}`); renderNotes(); toast('Note saved with the run.');
      };
    });
  }

  // --- page 1 ---------------------------------------------------------------------
  async function loadExamples() {
    try {
      // OD's merge brief of 19 Nov §4 (AD §3): only a corpus that is present
      // on this host is offered; an absent one is simply absent, and the
      // line above the buttons goes with the last of them.
      const ex = (await call('GET', '/examples')).filter((e) => e.available);
      // AD brief of 20 Nov §5: the stored result is the default where one
      // exists for the version now serving. The live run beside it is one
      // setting (CD brief of 20 Nov §3.2, D15): off for the launch, and turned
      // back on per surface with `sampleLiveRuns: true` in the app's
      // config.js once the load is known. A researcher's own file always
      // runs live.
      const liveRuns = C.sampleLiveRuns === true;
      $('#tr-examples').innerHTML = ex.map((e) => `<div class="tr-example"><button class="tr-btn" data-ex="${esc(e.id)}" data-mode="${e.stored ? 'stored' : 'live'}">${esc(e.title)}</button>`
        + (e.stored ? `<span class="tr-small">stored results, ${esc(localDate(e.stored.computed))}${liveRuns ? ` · <a href="#" data-ex="${esc(e.id)}" data-mode="live">run it now</a>` : ''}</span>` : '')
        + (e.id === 'marpor' ? tip('p1.example.marpor') : '')
        + (e.rights ? rightsFull(e.rights) : '') + '</div>').join('');
      $('#tr-samples').hidden = !ex.length;
      $$('[data-ex]').forEach((b) => { b.onclick = (ev) => { ev.preventDefault(); startExample(b.dataset.ex, b.dataset.mode); }; });
    } catch (e) {
      // Signed out: the shared panel asks the person to sign in; nothing to say here.
      if (e.status === 401 || e.status === 403) { $('#tr-examples').textContent = ''; return; }
      // Trial brief v1.2 §2.1 (E8): the address goes to the log, not the page.
      console.error('The analysis engine isn’t answering at ' + C.apiBase, e);
      $('#tr-examples').textContent = 'The analysis engine isn’t answering. Try again in a few minutes.';
    }
  }
  // OD brief to DnDev of 25 Nov 2026, §5A: from the click until the next page
  // draws, the choice shows it is working (the controls disabled, the one
  // progress indicator showing the sample's own title), so a second click is
  // neither needed nor possible. Before, nothing changed until the page did.
  let startingExample = false;
  async function startExample(id, mode) {
    if (startingExample) return;
    startingExample = true;
    const controls = $$('[data-ex]');
    controls.forEach((b) => { b.disabled = true; b.setAttribute('aria-disabled', 'true'); });
    const btn = controls.find((b) => b.dataset.ex === id && b.tagName === 'BUTTON');
    const title = btn ? btn.textContent : id;
    progressStart(title, null);
    try {
      const t0 = performance.now();
      run = await call('POST', mode === 'stored' ? `/runs/example/${id}/stored` : `/runs/example/${id}`);
      started = Date.now(); frames = null;
      // A stored result is complete: every page can be reached, and the
      // review still happens in order (§5.4), so it opens at page 3.
      if (run.stored_example) { reached = Math.max(reached, 5); await refreshFrames(); }
      afterCheck((performance.now() - t0) / 1000);
    } catch (e) { fail(e); } finally {
      if (busy && busy.title === title) progressEnd();
      controls.forEach((b) => { b.disabled = false; b.removeAttribute('aria-disabled'); });
      startingExample = false;
    }
  }

  // --- page 2 ---------------------------------------------------------------------
  $('#tr-upload').onsubmit = async (ev) => {
    ev.preventDefault();
    const f = $('#tr-file').files[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f); fd.append('corpus_id', $('#tr-cid').value || 'upload');
    try { const t0 = performance.now(); run = await call('POST', '/runs/upload', fd, true); started = Date.now(); const s = (performance.now() - t0) / 1000; $('#p2-time').textContent = 'Upload and check took ' + fmtS(s); afterCheck(s); }
    catch (e) { fail(e); }
  };

  // --- page 3 ---------------------------------------------------------------------
  function afterCheck(secs) {
    const c = run.check;
    $('#p3-opening').innerHTML = esc(OPENING) + tip('p3.opening');
    // AD response of 12 Nov §2 (countersigned 13 Nov): the combined detail,
    // a family that fails the single-select test, and identical documents on
    // yes/no data, each in its plain form.
    const sd = c.single_select_details || {}, ss = sd.combine || [];
    const failedSS = (sd.tested || []).filter((f) => !f.passes);
    const dg = (c.diagnostics || {}).identical;
    $('#p3-summary').innerHTML = (c.document_details.length
      ? `<p>${cnt(c.documents, 'document')}. ${cnt(c.concepts.length, 'concept')}. Document details: ${esc(c.document_details.join(', '))}.${tip('p3.summary')}</p>`
      : `<p>${cnt(c.documents, 'document')} and ${cnt(c.concepts.length, 'concept')}. No document details were found, so the frames will be shown without who voices them.</p>`)
      + ss.map((f) => `<p class="tr-small">${esc(f.name)}: treated as one detail with ${f.columns.length + 1} values (${esc(f.columns.map((col) => col.slice(f.name.length + 1)).join(', '))}, or none).</p>`).join('')
      + failedSS.map((f) => `<p class="tr-small">${esc(f.name)}: ${esc(f.reason_plain || f.reason)}.</p>`).join('')
      + (dg ? `<p class="tr-small">${cnt(dg.documents, 'document')} share their values with others (${cnt(dg.sets, 'set')}; the largest ${dg.largest_set}). On yes/no data that is expected, and nothing is changed.</p>` : '');
    const qTip = (id) => tip(id.startsWith('family_') ? 'p3.q.family' : id.startsWith('group_') ? 'p3.q.group' : id.startsWith('total_') ? 'p3.q.total' : 'p3.q.' + id);
    $('#p3-questions').innerHTML = c.questions.length ? c.questions.map((q) => `<div class="tr-q" data-q="${esc(q.id)}"><p>${esc(q.ask)}${qTip(q.id)}</p>${q.options.map((o, i) => `<label><input type="radio" name="q_${esc(q.id)}" value="${esc(o.value)}" ${i === 0 ? 'checked' : ''}/> ${esc(o.label)}</label>`).join('')}${q.id === 'scale' ? '<label>Top of the scale (for example 3 for a 0–3 rating) <input type="number" min="1" max="100" id="q-scale-max" style="width:5rem"/></label>' : ''}</div>`).join('')
      : '<div class="tr-q"><p>Your file is ready. Nothing in it needs a decision before the analysis.</p></div>';
    const roles = c.roles;
    $('#p3-roles').innerHTML = `<details><summary>Every column and what we think it is (change any)</summary><div class="tr-roles">${Object.keys(roles).map((col) => `<label>${esc(col)} <select data-col="${esc(col)}">${['concept', 'covariate', 'label', 'id', 'exclude'].map((r) => `<option value="${r}" ${roles[col] === r ? 'selected' : ''}>${{ concept: 'concept', covariate: 'document detail', label: 'label (shown, not analysed)', id: 'document identifier', exclude: 'remove' }[r]}</option>`).join('')}</select></label>`).join('')}</div></details>`;
    $('#fq1').textContent = FQ1; $('#fq2').textContent = FQ2;
    // AD brief of 20 Nov §2: the box (inventory 3.13) is shown only when the
    // file has at least one category detail; when there are none, nothing
    // replaces it.
    const cats = c.category_details || [];
    $('#fq2-box').hidden = !cats.length;
    $('#fq2-list').innerHTML = cats.map((d) => `<label><input type="checkbox" class="fq2" value="${esc(d)}"/> ${esc(d)}</label>`).join('')
      + '<label><input type="checkbox" id="fq2-unsure"/> Not sure yet</label>';
    $('#p3-time').textContent = 'Checking the file took ' + fmtS(run.timings && run.timings.check);
    $('#p3-go').hidden = !!run.stored_example;
    reached = Math.max(reached, 3); renderNotes(); renderStored(); renderRights(); show('p3');
  }
  $('#p3-go').onclick = async () => {
    const answers = {};
    $$('.tr-q[data-q]').forEach((q) => { const v = $('input[type=radio]:checked', q); if (v) answers[q.dataset.q] = v.value; });
    const sm = $('#q-scale-max'); if (sm && sm.value) answers.scale_max = +sm.value;
    answers.roles = {}; $$('#p3-roles select').forEach((s) => { if (s.value !== run.check.roles[s.dataset.col]) answers.roles[s.dataset.col] = s.value; });
    const framing = { publish: ($('input[name=fq1]:checked') || {}).value === 'yes', attributes: $$('.fq2:checked').map((x) => x.value), not_sure_yet: $('#fq2-unsure').checked };
    $('#p3-go').disabled = true;
    try {
      const t = await call('POST', `/runs/${run.run_id}/confirm`, { answers, framing, point_x: $('#tr-pointx').value });
      show('p4'); await runMain(t.task_id);
    } catch (e) { fail(e); } finally { $('#p3-go').disabled = false; }
  };

  // --- page 4 ---------------------------------------------------------------------
  function heat(canvas, labels, values, diverging) {
    const n = labels.length, ctx = canvas.getContext('2d');
    const pad = Math.min(160, 8 + Math.max(...labels.map((l) => l.length)) * 5.2);
    const top = 6;
    const cell = Math.max(3, Math.floor((canvas.width - pad) / n));
    canvas.height = top + n * cell + 6; ctx.clearRect(0, 0, canvas.width, canvas.height);
    let lim = 0; values.forEach((r) => r.forEach((v) => { lim = Math.max(lim, Math.abs(v)); })); lim = lim || 1;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = values[i][j]; let col;
      if (diverging) { const t = Math.max(-1, Math.min(1, v / lim)); col = t >= 0 ? `rgb(${255},${Math.round(255 * (1 - t))},${Math.round(255 * (1 - t))})` : `rgb(${Math.round(255 * (1 + t))},${Math.round(255 * (1 + t))},255)`; }
      else { const g = Math.round(255 * (1 - Math.max(0, Math.min(1, v)))); col = `rgb(${g},${g},${g})`; }
      ctx.fillStyle = col; ctx.fillRect(pad + j * cell, top + i * cell, cell, cell);
    }
    if (cell >= 7) {
      ctx.fillStyle = '#333'; ctx.font = `${Math.min(11, cell - 1)}px Barlow, sans-serif`; ctx.textAlign = 'right';
      labels.forEach((l, i) => ctx.fillText(l.slice(0, 26), pad - 4, top + i * cell + cell * 0.8));
    }
  }
  const STEP_LINES = [['declare', 'Reading how your file is set up'], ['binarise', 'Deciding what counts as \'present\''], ['admit', 'Setting aside documents and concepts that can\'t say anything about co-occurrence'], ['first_view', 'Drawing the first view'],
    ['associate', 'Measuring how far concepts appear together beyond what their frequencies predict'], ['stability', 'Splitting the corpus in half, many times, to find the groups that keep reappearing'], ['covariates', 'Relating each frame to the document details, to see who voices it'], ['structure', 'Reading the inside of each frame: which concepts mark it out, which sit between frames'], ['pairs', 'Recording any specific pairs you asked about']];
  let fvDrawnFor = null;
  // The first view and the step lines, from the run's state: drawn as a live
  // run proceeds, and again whole when a stored result is opened at page 4.
  async function drawPage4() {
    if (run.first_view && fvDrawnFor !== run.run_id) {
      const fv = await call('GET', `/runs/${run.run_id}/first-view`);
      fvDrawnFor = run.run_id;
      heat($('#fv-canvas'), fv.concepts, fv.residuals, true);
      // AD brief of 20 Nov §3: the view is seriated (engine `_seriate`, the
      // leading eigenvectors of the residual matrix), so the clause about
      // placement is true of what is shown and stays until AD words it.
      $('#fv-caption').innerHTML = esc(`${fv.documents_admitted} documents and ${fv.concepts_admitted} concepts in play. Concepts that appear together more often than their frequencies predict are placed side by side: red means together more than expected, blue less. Drawn in ${fmtS(fv.seconds)}.`) + tip('p4.fv.caption');
    }
    const t = run.timings || {};
    $('#p4-lines').innerHTML = STEP_LINES.filter(([k]) => t[k] != null).map(([k, l]) => `<li class="done">${esc(l)}: ${fmtS(t[k])}${tip('p4.line.' + k)}</li>`).join('')
      + (run.running && run.running.line ? `<li>${esc(String(run.running.line).replace(/\.$/, ''))}…</li>` : '');
    if (!busy && frames && frames.defaults) renderDefaults();
  }
  function renderDefaults() {
    $('#p4-defaults').innerHTML = `<h3>What the app chose for you, and why${tip('p4.defaults.title')}</h3>` + frames.defaults.choices.map((c) => `<div class="tr-card"><b>${esc(c.fork)}</b>: ${esc(c.chosen)}.${c.reason ? ` <span class="tr-small">${esc(c.reason)}</span>` : ''}${c.id ? tip(c.id) : ''}</div>`).join('') + '<p class="tr-small">All five were chosen from the shape of your data before any result was seen.</p>';
  }
  async function runMain(taskId) {
    $('#p4-lines').innerHTML = ''; $('#p4-defaults').innerHTML = ''; fvDrawnFor = null; const t0 = Date.now();
    // AD brief of 24 Nov 2026 §3: the step and the time so far only. The
    // estimate (37 s shown, 1 min 38 s taken on the walk-through) returns when
    // it has been measured against real runs on the serving host and AD rules.
    progressStart('the main run', null);
    const done = await waitTask(taskId, async () => {
      run = await call('GET', `/runs/${run.run_id}`);
      progressLine(run.running && run.running.line);
      await drawPage4();
      $('#p4-time').textContent = 'This page so far: ' + fmtS((Date.now() - t0) / 1000);
    });
    progressEnd();
    // AD review of 12 Nov §5: a plain line, never G4's raw output; the
    // technical message is in the reviewer's report.
    // Trial brief v1.2 §2.2 (F4): the plain lines are sentences; the report
    // sentence is added once, and "couldn't continue" is not said before a
    // line that says the first view is still shown.
    if (done.state !== 'succeeded') {
      const er = done.error || {};
      const plain = String(er.plain || 'The analysis stopped.').trim();
      const lead = /first view is still shown/.test(plain) ? '' : "The run couldn't continue. ";
      const details = /reviewer's report\.?$/.test(plain) ? '' : " Details are in the reviewer's report.";
      toast(lead + plain + details); return;
    }
    await refreshFrames();
    if (frames.defaults) renderDefaults();
    // §4.2: the page stays where it is; the work is ready, and Next waits.
    reached = Math.max(reached, 5); renderSteps(current()); renderNext(current()); ready('Your frames are ready');
  }

  // --- page 5 ---------------------------------------------------------------------
  async function refreshFrames() {
    if (!run) return;
    try { frames = await call('GET', `/runs/${run.run_id}/frames`); } catch (e) { if (e.status === 404) return; throw e; }
    run = await call('GET', `/runs/${run.run_id}`);
    renderFrames(); renderChecklist(); renderExport(); renderNotes(); renderStored(); renderRights();
    renderSteps(current()); renderNext(current());
  }
  function concepts(list, withTarget, withFailed) { return list.length ? list.map((c) => esc(c.concept) + (withTarget && c.towards ? ` <span class="tr-small">(towards ${esc(c.towards)})</span>` : '') + (withFailed && (c.failed_test_plain || c.failed_test) ? ` <span class="tr-small">(${esc(c.failed_test_plain || c.failed_test)})</span>` : '')).join(', ') : '<span class="tr-small">none</span>'; }
  function renderFrames() {
    const f = frames;
    // Trial brief v1.2 §2.1 (F5): the frames' own tiers, listed when they differ.
    const tiers = f.frames.map((fr) => fr.tier);
    $('#p5-tier').innerHTML = (!tiers.length || tiers.every((t) => t === 'descriptive'))
      ? (isUpload()
        ? 'These frames are <b>descriptive</b> so far: true of this corpus, not yet tested against chance. The checks that test them take time to run. If you\'d like them, ask, and we\'ll run them and email you the results.'
        : 'These frames are <b>descriptive</b> so far: true of this corpus, not yet tested against chance. The chance check is the first item on the Firm up page.' + tip('p5.tier.descriptive'))
      : tiers.every((t) => t === tiers[0])
        ? `How firm these frames are: <b>${esc(tiers[0])}</b>.` + tip('p5.tier.other')
        : `How firm these frames are: ${f.frames.map((fr) => `${esc(fr.name)} <b>${esc(fr.tier)}</b>`).join(', ')}.` + tip('p5.tier.other');
    // B.6's caution, once the second grouping has run (AD response of 12 Nov §1.1).
    // AD note of 16 Nov §2.3: the figure is in the reviewer's report.
    if (f.b6_caution) $('#p5-tier').innerHTML += `<br><span class="tr-small">The two grouping methods agree only weakly, so where a concept sits depends partly on how the grouping is done.</span>${tip('p6.review.grouping.ari')}`;
    // A run started by a change after the first stop (AD note of 16 Nov §1.2).
    if (f.variation) $('#p5-tier').innerHTML += `<br><span class="tr-small">This run is a variation of run ${esc(f.variation.of)}: ${esc(f.variation.label.toLowerCase())}. Chosen after the first stop, so its results are exploratory.</span>`;
    $('#p5-table').innerHTML = f.frames.map((fr) => `<div class="tr-frame">
      <input class="tr-name" data-frame="${esc(fr.id)}" value="${esc(fr.name)}" aria-label="Frame name"/> <span class="tr-small">${esc(fr.tier_statement || fr.tier)}</span>${tip('p5.frame.tier')}
      ${fr.relabelled ? `<div class="tr-small">This isn't a frame within any one kind of document: it appears only when the kinds are pooled (${esc(fr.relabelled)}). It marks a difference between them.${tip('p5.frame.relabelled')}</div>` : ''}
      <div class="k">Marks this frame out${tip('p5.frame.distinguishing')}</div><div>${fr.distinguishing_note ? `<span class="tr-small">${esc(fr.distinguishing_note)}</span>` : concepts(fr.distinguishing)}</div>
      <div class="k">Shared with another frame${tip('p5.frame.bridging')}</div><div>${concepts(fr.bridging_candidates, true)}</div>
      <div class="k">Weakly placed${glossTip('distinguishing-bridging-diffuse')}</div><div>${concepts(fr.diffuse, false, true)}</div>
      ${fr.method_contingent.length ? `<div class="k">Depends on the grouping method${tip('p5.frame.contingent')}</div><div>${concepts(fr.method_contingent)}</div>` : ''}
      ${fr.outside_support.length ? `<div class="k">Too rare or too common to say anything${tip('p5.frame.outside')}</div><div>${concepts(fr.outside_support)}</div>` : ''}
      <div class="k">Who voices this frame${tip('p5.frame.shares')}</div>${fr.shares_by_population.some((s) => s.share != null) ? `<ul>${fr.shares_by_population.filter((s) => s.share != null).map((s) => `<li>${esc(s.population)} (${esc(s.detail)}; ${cnt(s.documents, 'document')}, about ${s.mean_concepts_per_document.toFixed(1)} concepts each): ${s.share.toFixed(2)}</li>`).join('')}</ul>` : '<div class="tr-small">no category details, so who voices it isn’t shown</div>'}
    </div>`).join('') + (f.unplaced.length ? `<div class="tr-frame"><div class="k">In no frame${tip('p5.unplaced')}</div><div>${concepts(f.unplaced)}</div></div>` : '')
      + (f.number_of_frames === 0 ? `<p>No group held up well enough to be called a frame, so everything here is descriptive: a picture of this corpus, not a finding about frames.${tip('p5.no_frame')}</p>` : '');
    $$('input.tr-name').forEach((inp) => { inp.onchange = async () => { await call('POST', `/runs/${run.run_id}/frames/${inp.dataset.frame}/name`, { name: inp.value }); refreshFrames(); }; });
    if (f.consensus) heat($('#sd-canvas'), f.consensus.concepts, f.consensus.values, false);
    const nf = `${cnt(f.number_of_frames, 'frame')} among ${cnt(+f.number_of_groups, 'group')}`;
    $('#p5-chosen').innerHTML = `<h3>What the app chose, and why</h3><p>${f.k === f.recommended_k ? `${nf}, with ${cnt(f.k, 'group')} being the number that held up best.${tip('p5.chosen.k')}` : `${nf}; you chose ${cnt(f.k, 'group')}, where ${f.recommended_k} held up best.${tip('p5.chosen.k_other')}`}</p>
      <table class="tr-k"><tr><th>Number of groups</th>${f.by_k.map((r) => `<td>${r.k}</td>`).join('')}</tr><tr><th>How well it held up${tip('p5.chosen.table')}</th>${f.by_k.map((r) => `<td>${r.evaluated ? r.reproducibility.toFixed(3) : 'not tried'}</td>`).join('')}</tr></table>
      ${f.compositional ? `<p class="tr-small">Your values are shares of a whole, so some of the 'together' and 'apart' between concepts is forced by the arithmetic. Read the frames with that in mind. Who voices each frame is not affected.${tip('p5.compositional')}</p>` : ''}
      <p class="tr-small"><a href="#" id="values-used">Settings used in this run (all provisional)</a></p>`;
    // Trial brief v1.2 §2.2 (F16): the counts come from the parameter record,
    // which the frames view carries as `settings`, not from this file.
    const pv = f.settings;
    $('#values-used').onclick = (e) => { e.preventDefault(); toast(pv
      ? `${pv.permutations} shuffles for the chance line; ${pv.splits} splits; ${pv.kmeans_starts} starts per grouping; ${pv.signal_shuffles} shuffles per concept for the pattern test; concepts count when in ${pv.support_min_documents} or more documents and fewer than ${Math.round(pv.support_max_share * 100)}%; at least ${pv.minimum_documents} documents and ${pv.minimum_concepts} concepts; class cut-offs ${pv.cutoff_own}, ${pv.cutoff_pull} and ${pv.cutoff_concentration}. All provisional.`
      : 'Every setting is in the settings record, in the download for your reviewer.'); };
    const w = f.where_you_stand;
    $('#p5-where').innerHTML = `<h3>Where you stand</h3>
      ${w.meets_reporting_minimum ? '' : `<p class="tr-small">Taken before the chance check: not yet enough to report from.${tip('p5.where.before')}</p>`}
      <ul>${w.how_firm.map((x) => `<li>${esc(x.sentence)}${x.academic ? rawTip(x.academic + (x.read_more_url ? '' : '\n\n' + x.read_more), x.read_more_url) : tip('p5.where.firm.' + x.tier)}</li>`).join('')}</ul>
      <p class="draft">Sentences you can use (draft wording):</p><ul>${w.sentences_you_can_use.map((s) => `<li>${esc(s.sentence)}</li>`).join('')}</ul>
      <p>${isUpload() ? 'Still to do: ☐ The checks against chance (on request)' : w.checklist_unticked.length ? 'Still to do: ' + w.checklist_unticked.map((m) => `☐ ${esc(m.item)}`).join(' · ') : 'Every checklist item has been run.'}</p>`;
    renderAskP5();
    // The side step to pluralitie: this analysis, by its reference, where
    // pluralitie is switched on for this surface (apps-enabled.php).
    const next = $('#p5-next');
    if (next && window.APPS_ENABLED && window.APPS_ENABLED.pluralitie) {
      $('#p5-pluralitie').href = `/apps/pluralitie/?run=${encodeURIComponent(run.run_id)}`;
      next.hidden = false;
    }
    const t = run.timings || {};
    $('#p5-time').textContent = 'The main run took ' + fmtS(['associate', 'stability', 'covariates', 'structure', 'pairs'].reduce((a, k) => a + (+t[k] || 0), 0));
  }

  // --- page 5: Ask for the checks (AD brief of 24 Nov 2026 §2) -------------------
  // For a researcher's own file only. The request is recorded against the run
  // as a note under its own page key, so the fleet lists requests from the
  // runs' records; no engine change. Nothing is emailed at the click, so the
  // page says the request is recorded, never sent. A second click on the same
  // run records nothing new.
  const ASK_KEY = 'checks_request';
  const asked = () => ((run && run.notes) || []).some((n) => n.page === ASK_KEY);
  // The sign-in email, from the platform's account route; null if the page
  // cannot read it, and the sentence then names no address.
  async function signedInEmail() {
    try {
      if (!SIGN_IN || typeof window.getToken !== 'function') return null;
      const tok = await window.getToken(); if (!tok) return null;
      const r = await fetch(`${C.apiBase || ''}/v1/account`, { headers: { Authorization: `Bearer ${tok}` } });
      if (!r.ok) return null;
      const j = await r.json();
      return (j && j.person && j.person.email) || null;
    } catch (e) { return null; }
  }
  function askedSentence(box, email) {
    box.innerHTML = `<p class="tr-asked">Your request is recorded. We'll run the checks for this file and email the results to ${email ? esc(email) : 'the email you signed in with'}.</p>`;
  }
  async function renderAskP5() {
    const box = $('#p5-ask'); if (!box) return;
    if (!isUpload()) { box.hidden = true; box.innerHTML = ''; return; }
    box.hidden = false;
    if (asked()) { askedSentence(box, await signedInEmail()); return; }
    box.innerHTML = '<button class="tr-btn tr-primary" id="p5-ask-btn">Ask for the checks</button>';
    const btn = $('#p5-ask-btn');
    btn.onclick = async () => {
      btn.disabled = true;
      try {
        const email = await signedInEmail();
        run = await call('GET', `/runs/${run.run_id}`);
        if (!asked()) {
          await call('POST', `/runs/${run.run_id}/notes`, { page: ASK_KEY,
            text: `Checks requested for run ${run.run_id} (${run.corpus_id || 'uploaded file'}) by ${email || 'the signed-in person; the page could not read the email'}.` });
          run = await call('GET', `/runs/${run.run_id}`);
        }
        askedSentence(box, email);
      } catch (e) { btn.disabled = false; fail(e); }
    };
  }

  // --- page 6 ---------------------------------------------------------------------
  let liveItem = false;
  function renderChecklist() {
    const f = frames; if (!f) return;
    if (isUpload()) { renderAskForChecks(); return; }
    $('#p6-ask').hidden = true; $('#p6-items').hidden = false;
    const review = f.checklist.find((i) => i.state === 'done' && !i.acknowledged);
    const rv = $('#p6-review');
    if (review && review.review) {
      rv.hidden = false;
      const rvars = reviewVars(review.result);
      rv.innerHTML = `<b>${esc(review.title)}: what changed</b><ul>${(review.review.lines || []).map((l, n) => `<li>${esc(l)}${tip((review.review.line_ids || [])[n] || '', rvars)}</li>`).join('')}${(review.review.tiers_changed || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul><button class="tr-btn tr-primary" id="ack">I've read this</button>`;
      $('#ack').onclick = async () => { await call('POST', `/runs/${run.run_id}/checklist/${review.key}/acknowledge`); refreshFrames(); };
    } else rv.hidden = true;
    $('#p6-items').innerHTML = f.checklist.filter((i) => i.shown).map((i) => {
      const can = i.available && !liveItem && !review && i.state !== 'running';
      return `<li class="tr-item"><div class="lab">${esc(i.label)}${tip('p6.item.label.' + i.label)}${i.state === 'done' ? ' · done in ' + fmtS(i.seconds) : ''}</div>
        <b>${esc(i.title)}</b>${tip('p6.item.' + i.key + '.title')}: ${esc(i.question)}<br><span class="tr-small">About ${fmtS(i.estimate_seconds)}${i.available ? '' : ' · available after the chance check'}${i.key === 'compare_types' ? ' · offered because ' + i.tracked.map((t) => `${esc(t.frame)} is strongly tied to ${esc(t.detail)}`).join('; ') : ''}</span><br>
        ${i.key === 'bridging_readings' ? '<button class="tr-btn" data-bridge>Read the shared concepts</button>' : `<button class="tr-btn ${can ? 'tr-primary' : ''}" data-item="${i.key}" ${can ? '' : 'disabled'}>${i.state === 'done' ? 'Run again' : 'Run'}</button>`}
        ${i.state === 'failed' ? `<div class="tr-small">This item couldn't finish: ${esc(i.plain_error || 'it stopped')}</div>` : ''}</li>`;
    }).join('');
    $$('[data-item]').forEach((b) => { b.onclick = () => runItem(b.dataset.item); });
    $$('[data-bridge]').forEach((b) => { b.onclick = showBridging; });
    $('#p6-notin').innerHTML = f.not_in_trial.map((x) => `<li>${esc(x)}: not in this version</li>`).join('');
    renderVariations();
  }
  // AD's note of 23 Nov 2026 §2: at launch a researcher's own file runs to its
  // frames, and the checks are run by the fleet on request. The button opens an
  // email to the address the edu pages publish, its subject naming the run.
  function renderAskForChecks() {
    $('#p6-review').hidden = true; $('#p6-items').hidden = true; $('#p6-items').innerHTML = '';
    $('#p6-variations').innerHTML = ''; $('#p6-bridging').innerHTML = '';
    const subject = encodeURIComponent(`CorRes checks for run ${run.run_id}`);
    const box = $('#p6-ask');
    box.innerHTML = `<p>The checks that test your frames, against chance, under other settings and with a second grouping method, can take from an hour to a day to run on a corpus this size. Ask, and we'll run them for you and email you the results, with the records your reviewer will want.</p>
      <a class="tr-btn tr-primary" href="mailto:${SUPPORT_EMAIL}?subject=${subject}">Ask for the checks</a>`;
    box.hidden = false;
    $('#p6-notin').innerHTML = frames.not_in_trial.map((x) => `<li>${esc(x)}: not in this version</li>`).join('');
  }
  // Page 6: settings the researcher can change after the first stop (AD note of 16 Nov §1.2).
  function renderVariations() {
    const f = frames, box = $('#p6-variations'); if (!box) return;
    const list = f.variations || [];
    box.innerHTML = (list.length || f.variation) ? '<h3>Settings you can change</h3>'
      + list.map((v) => `<div class="tr-card"><b>${esc(v.label)}</b><br><span class="tr-small">This starts a new run, with its own chance check. Chosen now, after the first stop, its results are exploratory.</span><br>
        <button class="tr-btn" data-variation="${esc(v.key)}" ${liveItem ? 'disabled' : ''}>Start the new run</button>
        ${v.runs.map((r) => `<br><a href="#" data-open-run="${esc(r)}">Open run ${esc(r)}</a>`).join('')}</div>`).join('')
      + (f.variation ? `<p class="tr-small">This run changed one setting from run <a href="#" data-open-run="${esc(f.variation.of)}">${esc(f.variation.of)}</a>: ${esc(f.variation.label.toLowerCase())}.</p>` : '') : '';
    $$('[data-variation]').forEach((b) => { b.onclick = () => runVariation(b.dataset.variation); });
    $$('[data-open-run]').forEach((a) => { a.onclick = async (e) => { e.preventDefault(); run = await call('GET', `/runs/${a.dataset.openRun}`); await refreshFrames(); show('p5'); }; });
  }
  async function runVariation(key) {
    liveItem = true; renderChecklist();
    try {
      const out = await call('POST', `/runs/${run.run_id}/variations`, { change: key });
      run = out.run; frames = null; fvDrawnFor = null;
      progressStart('the new run', null); // AD brief of 24 Nov §3
      await waitTask(out.task_id, async () => {
        const r = await call('GET', `/runs/${run.run_id}`);
        progressLine(r.running ? r.running.line : 'Working');
      });
    } catch (e) { fail(e); }
    progressEnd(); liveItem = false; await refreshFrames();
    // §4.2: the new run's frames are ready; Next goes to them, the page stays.
    nextOverride = 'p5'; renderNext(current()); ready('Your frames are ready');
  }
  // Values a review line's hover refers to ({ref}, {s}): the chance check's own.
  function reviewVars(res) {
    if (!res || !res.strength) return {};
    const f = (x) => (x == null ? '' : (+x).toFixed(3));
    return { ref: f(res.strength.reference), s: f(res.spread) };
  }
  async function runItem(key) {
    liveItem = true; renderChecklist();
    const item = frames.checklist.find((i) => i.key === key) || { title: key }; const t0 = Date.now();
    progressStart(item.title, item.estimate_seconds, 'Nothing else starts while this runs. You can rename frames, browse the table and read the shared concepts.');
    try {
      const t = await call('POST', `/runs/${run.run_id}/checklist`, { item: key });
      await waitTask(t.task_id, async () => {
        const r = await call('GET', `/runs/${run.run_id}`);
        progressLine(r.running ? r.running.line : 'Working');
      });
    } catch (e) { fail(e); }
    progressEnd(); liveItem = false; await refreshFrames();
    $('#p6-time').textContent = `The last item took ${fmtS((Date.now() - t0) / 1000)}`;
  }
  // The stored value is the method's word; the label is AD's plain one (12 Nov).
  const READINGS = [['shared priority', 'shared priority'], ['distinct framings of the same problem', 'two framings of the same problem'], ['explicit disagreement', 'explicit disagreement'], ['co-mention only', 'mentioned together, nothing more']];
  async function showBridging() {
    const list = await call('GET', `/runs/${run.run_id}/bridging`);
    $('#p6-bridging').innerHTML = '<h3>Reading the shared concepts</h3>' + (list.length ? list.map((b) => `<div class="tr-card"><b>${esc(b.concept)}</b> sits in ${esc(b.frame)} and is pulled towards ${esc(b.towards)}: ${cnt(b.document_count, 'document')} ${b.document_count === 1 ? 'carries' : 'carry'} it alongside concepts from both.
      <div class="tr-doclist">${b.documents.slice(0, 60).map((d) => `${esc(d.document)} ${esc(d.label)}: with ${esc(d.with_own.join(', '))} | ${esc(d.with_other.join(', '))}`).join('<br>')}</div>
      <label>What the overlap means, in your reading${tip('p6.bridging.reading')} <select data-reading="${esc(b.concept)}"><option value="">not yet read</option>${READINGS.map(([v, l]) => `<option value="${esc(v)}" ${b.reading && b.reading.reading === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label></div>`).join('') : '<p>No concept in this run is shared between frames.</p>');
    $$('[data-reading]').forEach((s) => { s.onchange = async () => { if (!s.value) return; await call('POST', `/runs/${run.run_id}/bridging/reading`, { concept: s.dataset.reading, reading: s.value }); toast('Reading recorded.'); }; });
  }

  // --- page 7 ---------------------------------------------------------------------
  // The two baskets fetch with the sign-in token, as every other call on the
  // page does, and hand the browser the response. A plain link or a new window
  // carries no token, so the engine answered `unauthenticated` to a signed-in
  // researcher at step 7 (AD handoff to OD of 20 Nov §3; OD brief of 21 Nov §1).
  async function fetchExport(path) {
    const headers = { 'X-Request-Id': crypto.randomUUID() };
    if (SIGN_IN && typeof window.getToken === 'function') {
      const tok = await window.getToken();
      if (tok) headers['Authorization'] = `Bearer ${tok}`;
    }
    const r = await fetch(API + path, { headers });
    if (!r.ok) {
      let d = null; try { d = (await r.json()).detail; } catch (e) { /* not JSON */ }
      const msg = typeof d === 'string' ? d : (d && d.message) || `Something went wrong (${r.status}). Try again; if it repeats, note it here.`;
      const err = new Error(msg); err.status = r.status; err.detail = d; err.code = d && typeof d === 'object' ? d.code : null; throw err;
    }
    return r;
  }
  const exportName = (r, fallback) => { const m = /filename="?([^";]+)"?/.exec(r.headers.get('Content-Disposition') || ''); return m ? m[1] : fallback; };
  function renderExport() {
    if (!run) return;
    const article = $('#p7-article'), reviewer = $('#p7-reviewer');
    article.href = '#'; reviewer.href = '#';
    article.onclick = async (e) => {
      e.preventDefault();
      // The window opens on the click itself, so a popup blocker allows it; the
      // report is shown in it once fetched, from the page's own copy.
      const w = window.open('', '_blank');
      try {
        const r = await fetchExport(`/runs/${run.run_id}/export/article?tz=${encodeURIComponent(zone())}`);
        const url = URL.createObjectURL(await r.blob());
        if (w) w.location = url; else window.location = url;
      } catch (err) { if (w) w.close(); fail(err); }
    };
    reviewer.onclick = async (e) => {
      e.preventDefault();
      try {
        const r = await fetchExport(`/runs/${run.run_id}/export/reviewer`);
        const url = URL.createObjectURL(await r.blob());
        const a = document.createElement('a'); a.href = url; a.download = exportName(r, `corres_${run.run_id}.zip`); a.click();
        setTimeout(() => URL.revokeObjectURL(url), 60000);
      } catch (err) { fail(err); }
    };
    $('#p7-limit').innerHTML = frames && !frames.where_you_stand.meets_reporting_minimum
      ? `<p class="tr-tier">A report taken now is marked interim, because the chance check hasn't run.${tip('p7.limit')}</p>` : '';
  }

  // --- boot -------------------------------------------------------------------------
  fillTips(document); renderSteps('p1'); renderNotes(); loadExamples(); show('p1');
  // The route back from pluralitie (AD's dispatch of 27 Nov 2026 §1 item 1.2):
  // an address naming a run opens that run at the page asked for. It asks for
  // page 6, the reviewer's checklist; while page 6 is skipped (above), show()
  // lands it on page 5, and it reaches the checklist the day the skip is lifted.
  (async () => {
    const q = new URLSearchParams(window.location.search), id = q.get('run'), page = q.get('page');
    if (!id) return;
    try {
      run = await call('GET', `/runs/${encodeURIComponent(id)}`);
      await refreshFrames();
      if (!frames) return;               // a run with no frames yet has no page to return to
      reached = PAGES.length;
      show(PAGES.includes(page) ? page : 'p5');
    } catch (e) { fail(e); }
  })();
})();
