// The CR3 trial's pages (AD trial brief v1.1 §3). One page at a time; each
// page shows the elapsed time of every step on it and the run's total, and
// carries a notes box whose notes are saved with the run by page and time.
(function () {
  'use strict';
  const C = window.CR3_TRIAL || { apiBase: 'http://127.0.0.1:8000', prefix: '/trial/corres' };
  const API = C.apiBase + C.prefix;
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.from((el || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const PAGES = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7'];
  let run = null;          // the run's public state
  let frames = null;       // the frames view
  let started = null;      // when this run began, for the clock
  let reached = 1;         // the furthest page reached

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
  async function call(method, path, body, isForm) {
    const opt = { method, headers: { 'X-Request-Id': crypto.randomUUID() } };
    if (method === 'POST') opt.headers['Idempotency-Key'] = crypto.randomUUID();
    if (body && !isForm) { opt.headers['Content-Type'] = 'application/json'; opt.body = JSON.stringify(body); }
    if (body && isForm) opt.body = body;
    const r = await fetch(API + path, opt);
    const text = await r.text();
    let data; try { data = JSON.parse(text); } catch (e) { data = text; }
    if (!r.ok) {
      const d = data && data.detail;
      const msg = typeof d === 'string' ? d : (d && d.message) || `Something went wrong (${r.status}). Try again; if it repeats, note it here.`;
      const err = new Error(msg); err.status = r.status; err.detail = d; throw err;
    }
    return data;
  }
  function toast(msg) { const t = $('#tr-toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(() => { t.hidden = true; }, 6000); }
  const fmtS = (s) => s == null ? '—' : (s < 60 ? `${(+s).toFixed(s < 10 ? 2 : 1)} s` : `${Math.floor(s / 60)} min ${Math.round(s % 60)} s`);
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
    const n = PAGES.indexOf(id) + 1; if (n > reached) reached = n;
    PAGES.forEach((p) => $('#' + p).classList.toggle('on', p === id));
    renderSteps(id); window.scrollTo(0, 0);
    if (id === 'p5' || id === 'p6' || id === 'p7') refreshFrames().catch((e) => toast(e.message));
  }
  function renderSteps(cur) {
    const nav = $('#tr-steps'); nav.innerHTML = '';
    PAGES.forEach((p, i) => {
      const b = document.createElement('button');
      b.textContent = `${i + 1} ${$('#' + p).dataset.title}`; b.className = p === cur ? 'on' : '';
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
        <div class="saved">${mine.map((n) => `${esc(n.at)}: ${esc(n.text)}`).join('<br>')}</div>`;
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
      const ex = await call('GET', '/examples');
      $('#tr-examples').innerHTML = ex.map((e) => `<button class="tr-btn" data-ex="${esc(e.id)}" ${e.available ? '' : 'disabled title="The file isn’t where the record says it is"'}>${esc(e.title)}</button>${e.id === 'marpor' ? tip('p1.example.marpor') : ''}`).join('');
      $$('[data-ex]').forEach((b) => { b.onclick = () => startExample(b.dataset.ex); });
    } catch (e) { $('#tr-examples').textContent = 'The analysis engine isn’t answering at ' + C.apiBase + '. Start it and reload.'; }
  }
  async function startExample(id) {
    try { const t0 = performance.now(); run = await call('POST', `/runs/example/${id}`); started = Date.now(); afterCheck((performance.now() - t0) / 1000); }
    catch (e) { toast(e.message); }
  }

  // --- page 2 ---------------------------------------------------------------------
  $('#tr-upload').onsubmit = async (ev) => {
    ev.preventDefault();
    const f = $('#tr-file').files[0]; if (!f) return;
    const fd = new FormData(); fd.append('file', f); fd.append('corpus_id', $('#tr-cid').value || 'upload');
    try { const t0 = performance.now(); run = await call('POST', '/runs/upload', fd, true); started = Date.now(); const s = (performance.now() - t0) / 1000; $('#p2-time').textContent = 'Upload and check took ' + fmtS(s); afterCheck(s); }
    catch (e) { toast(e.message); }
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
      ? `<p>${c.documents} documents. ${c.concepts.length} concepts. Document details: ${esc(c.document_details.join(', '))}.${tip('p3.summary')}</p>`
      : `<p>${c.documents} documents and ${c.concepts.length} concepts. No document details were found, so the frames will be shown without who voices them.</p>`)
      + ss.map((f) => `<p class="tr-small">${esc(f.name)}: treated as one detail with ${f.columns.length + 1} values (${esc(f.columns.map((col) => col.slice(f.name.length + 1)).join(', '))}, or none)</p>`).join('')
      + failedSS.map((f) => `<p class="tr-small">${esc(f.name)}: ${esc(f.reason_plain || f.reason)}</p>`).join('')
      + (dg ? `<p class="tr-small">${dg.documents} documents share their values with others (${dg.sets} sets; the largest ${dg.largest_set}). On yes/no data that is expected, and nothing is changed.</p>` : '');
    const qTip = (id) => tip(id.startsWith('family_') ? 'p3.q.family' : id.startsWith('group_') ? 'p3.q.group' : id.startsWith('total_') ? 'p3.q.total' : 'p3.q.' + id);
    $('#p3-questions').innerHTML = c.questions.length ? c.questions.map((q) => `<div class="tr-q" data-q="${esc(q.id)}"><p>${esc(q.ask)}${qTip(q.id)}</p>${q.options.map((o, i) => `<label><input type="radio" name="q_${esc(q.id)}" value="${esc(o.value)}" ${i === 0 ? 'checked' : ''}/> ${esc(o.label)}</label>`).join('')}${q.id === 'scale' ? '<label>Top of the scale (for example 3 for a 0–3 rating) <input type="number" min="1" max="100" id="q-scale-max" style="width:5rem"/></label>' : ''}</div>`).join('')
      : '<div class="tr-q"><p>Your file is ready. Nothing in it needs a decision before the analysis.</p></div>';
    const roles = c.roles;
    $('#p3-roles').innerHTML = `<details><summary>Every column and what we think it is (change any)</summary><div class="tr-roles">${Object.keys(roles).map((col) => `<label>${esc(col)} <select data-col="${esc(col)}">${['concept', 'covariate', 'label', 'id', 'exclude'].map((r) => `<option value="${r}" ${roles[col] === r ? 'selected' : ''}>${{ concept: 'concept', covariate: 'document detail', label: 'label (shown, not analysed)', id: 'document identifier', exclude: 'remove' }[r]}</option>`).join('')}</select></label>`).join('')}</div></details>`;
    $('#fq1').textContent = FQ1; $('#fq2').textContent = FQ2;
    const cats = c.category_details || [];
    $('#fq2-list').innerHTML = (cats.length ? cats.map((d) => `<label><input type="checkbox" class="fq2" value="${esc(d)}"/> ${esc(d)}</label>`).join('') : '<p class="tr-small">No document details of the kind we can compare (categories) were found.</p>')
      + '<label><input type="checkbox" id="fq2-unsure"/> Not sure yet</label>';
    $('#p3-time').textContent = 'Checking the file took ' + fmtS(run.timings && run.timings.check);
    reached = Math.max(reached, 3); renderNotes(); show('p3');
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
    } catch (e) { toast(e.message); } finally { $('#p3-go').disabled = false; }
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
  async function runMain(taskId) {
    const lines = $('#p4-lines'); lines.innerHTML = ''; let fvShown = false; const t0 = Date.now();
    const done = await waitTask(taskId, async () => {
      run = await call('GET', `/runs/${run.run_id}`);
      if (!fvShown && run.first_view) {
        fvShown = true;
        const fv = await call('GET', `/runs/${run.run_id}/first-view`);
        heat($('#fv-canvas'), fv.concepts, fv.residuals, true);
        $('#fv-caption').innerHTML = esc(`${fv.documents_admitted} documents and ${fv.concepts_admitted} concepts in play. Concepts that appear together more often than their frequencies predict are placed side by side: red means together more than expected, blue less. Drawn in ${fmtS(fv.seconds)}.`) + tip('p4.fv.caption');
      }
      const t = run.timings || {};
      const step = [['declare', 'Reading how your file is set up'], ['binarise', 'Deciding what counts as \'present\''], ['admit', 'Setting aside documents and concepts that can\'t say anything about co-occurrence'], ['first_view', 'Drawing the first view'],
        ['associate', 'Measuring how far concepts appear together beyond what their frequencies predict'], ['stability', 'Splitting the corpus in half, many times, to find the groups that keep reappearing'], ['covariates', 'Relating each frame to the document details, to see who voices it'], ['structure', 'Reading the inside of each frame: which concepts mark it out, which sit between frames'], ['pairs', 'Recording any specific pairs you asked about']];
      lines.innerHTML = step.filter(([k]) => t[k] != null).map(([k, l]) => `<li class="done">${esc(l)}: ${fmtS(t[k])}${tip('p4.line.' + k)}</li>`).join('')
        + (run.running && run.running.line ? `<li>${esc(run.running.line)}…</li>` : '');
      $('#p4-time').textContent = 'This page so far: ' + fmtS((Date.now() - t0) / 1000);
    });
    // AD review of 12 Nov §5: a plain line, never G4's raw output; the
    // technical message is in the reviewer's report.
    if (done.state !== 'succeeded') { const er = done.error || {}; toast(`The run couldn't continue: ${(er.plain || 'the analysis stopped').replace(/\.$/, '')}. Details are in the reviewer's report.`); return; }
    await refreshFrames();
    if (frames.defaults) $('#p4-defaults').innerHTML = `<h3>What the app chose for you, and why${tip('p4.defaults.title')}</h3>` + frames.defaults.choices.map((c) => `<div class="tr-card"><b>${esc(c.fork)}</b>: ${esc(c.chosen)}.${c.reason ? ` <span class="tr-small">${esc(c.reason)}</span>` : ''}${c.id ? tip(c.id) : ''}</div>`).join('') + '<p class="tr-small">All five were chosen from the shape of your data before any result was seen.</p>';
    reached = Math.max(reached, 5); show('p5');
  }

  // --- page 5 ---------------------------------------------------------------------
  async function refreshFrames() {
    if (!run) return;
    try { frames = await call('GET', `/runs/${run.run_id}/frames`); } catch (e) { if (e.status === 404) return; throw e; }
    run = await call('GET', `/runs/${run.run_id}`);
    renderFrames(); renderChecklist(); renderExport(); renderNotes(); renderSteps(PAGES.find((p) => $('#' + p).classList.contains('on')));
  }
  function concepts(list, withTarget, withFailed) { return list.length ? list.map((c) => esc(c.concept) + (withTarget && c.towards ? ` <span class="tr-small">(towards ${esc(c.towards)})</span>` : '') + (withFailed && (c.failed_test_plain || c.failed_test) ? ` <span class="tr-small">(${esc(c.failed_test_plain || c.failed_test)})</span>` : '')).join(', ') : '<span class="tr-small">none</span>'; }
  function renderFrames() {
    const f = frames;
    $('#p5-tier').innerHTML = f.tier === 'descriptive'
      ? 'These frames are <b>descriptive</b> so far: true of this corpus, not yet tested against chance. The chance check is the first item on the Firm up page.' + tip('p5.tier.descriptive')
      : `How firm these frames are: <b>${esc(f.tier)}</b>.` + tip('p5.tier.other');
    // B.6's caution, once the second grouping has run (AD response of 12 Nov §1.1).
    if (f.b6_caution) $('#p5-tier').innerHTML += `<br><span class="tr-small">The two grouping methods agree at ${(+f.b6_caution.ari).toFixed(3)}, below 0.5, so where a concept sits depends partly on how the grouping is done.</span>${tip('p6.review.grouping.ari')}`;
    $('#p5-table').innerHTML = f.frames.map((fr) => `<div class="tr-frame">
      <input class="tr-name" data-frame="${esc(fr.id)}" value="${esc(fr.name)}" aria-label="Frame name"/> <span class="tr-small">${esc(fr.tier_statement || fr.tier)}</span>${tip('p5.frame.tier')}
      ${fr.relabelled ? `<div class="tr-small">This isn't a frame within any one kind of document: it appears only when the kinds are pooled (${esc(fr.relabelled)}). It marks a difference between them.${tip('p5.frame.relabelled')}</div>` : ''}
      <div class="k">Marks this frame out${tip('p5.frame.distinguishing')}</div><div>${concepts(fr.distinguishing)}</div>
      <div class="k">Shared with another frame${tip('p5.frame.bridging')}</div><div>${concepts(fr.bridging_candidates, true)}</div>
      <div class="k">Weakly placed${glossTip('distinguishing-bridging-diffuse')}</div><div>${concepts(fr.diffuse, false, true)}</div>
      ${fr.method_contingent.length ? `<div class="k">Depends on the grouping method${tip('p5.frame.contingent')}</div><div>${concepts(fr.method_contingent)}</div>` : ''}
      ${fr.outside_support.length ? `<div class="k">Too rare or too common to say anything${tip('p5.frame.outside')}</div><div>${concepts(fr.outside_support)}</div>` : ''}
      ${fr.shares_by_population.length ? `<div class="k">Who voices this frame${tip('p5.frame.shares')}</div><ul>${fr.shares_by_population.filter((s) => s.share != null).map((s) => `<li>${esc(s.population)} (${esc(s.detail)}; ${s.documents} documents, about ${s.mean_concepts_per_document.toFixed(1)} concepts each): ${s.share.toFixed(2)}</li>`).join('')}</ul>` : ''}
    </div>`).join('') + (f.unplaced.length ? `<div class="tr-frame"><div class="k">In no frame${tip('p5.unplaced')}</div><div>${concepts(f.unplaced)}</div></div>` : '')
      + (f.number_of_frames === 0 ? `<p>No group held up well enough to be called a frame, so everything here is descriptive: a picture of this corpus, not a finding about frames.${tip('p5.no_frame')}</p>` : '');
    $$('input.tr-name').forEach((inp) => { inp.onchange = async () => { await call('POST', `/runs/${run.run_id}/frames/${inp.dataset.frame}/name`, { name: inp.value }); refreshFrames(); }; });
    if (f.consensus) heat($('#sd-canvas'), f.consensus.concepts, f.consensus.values, false);
    const nf = `${f.number_of_frames} frame${f.number_of_frames === 1 ? '' : 's'} among ${f.number_of_groups} groups`;
    $('#p5-chosen').innerHTML = `<h3>What the app chose, and why</h3><p>${f.k === f.recommended_k ? `${nf}, with ${f.k} groups being the number that held up best.${tip('p5.chosen.k')}` : `${nf}; you chose ${f.k} groups, where ${f.recommended_k} held up best.${tip('p5.chosen.k_other')}`}</p>
      <table class="tr-k"><tr><th>Number of groups</th>${f.by_k.map((r) => `<td>${r.k}</td>`).join('')}</tr><tr><th>How well it held up${tip('p5.chosen.table')}</th>${f.by_k.map((r) => `<td>${r.evaluated ? r.reproducibility.toFixed(3) : 'not tried'}</td>`).join('')}</tr></table>
      ${f.compositional ? `<p class="tr-small">Your values are shares of a whole, so some of the 'together' and 'apart' between concepts is forced by the arithmetic. Read the frames with that in mind. Who voices each frame is not affected.${tip('p5.compositional')}</p>` : ''}
      <p class="tr-small"><a href="#" id="values-used">Settings used in this run (all provisional)</a></p>`;
    $('#values-used').onclick = (e) => { e.preventDefault(); toast('49 shuffles for the chance line; 50 splits; 10 starts per grouping; 19 shuffles per concept for the pattern test; concepts count when in 10 or more documents and fewer than 90%; at least 50 documents and 6 concepts; class cut-offs 0.5, 0.10 and 0.6. All provisional.'); };
    const w = f.where_you_stand;
    $('#p5-where').innerHTML = `<h3>Where you stand</h3>
      ${w.meets_reporting_minimum ? '' : `<p class="tr-small">Taken before the chance check: not yet enough to report from.${tip('p5.where.before')}</p>`}
      <ul>${w.how_firm.map((x) => `<li>${esc(x.sentence)}${tip('p5.where.firm.' + x.tier)}</li>`).join('')}</ul>
      <p class="draft">Sentences you can use (draft wording):</p><ul>${w.sentences_you_can_use.map((s) => `<li>${esc(s.sentence)}</li>`).join('')}</ul>
      <p>${w.checklist_unticked.length ? 'Still to do: ' + w.checklist_unticked.map((m) => `☐ ${esc(m.item)}`).join(' · ') : 'Every checklist item has been run.'}</p>`;
    const t = run.timings || {};
    $('#p5-time').textContent = 'The main run took ' + fmtS(['associate', 'stability', 'covariates', 'structure', 'pairs'].reduce((a, k) => a + (+t[k] || 0), 0));
  }

  // --- page 6 ---------------------------------------------------------------------
  let liveItem = false;
  function renderChecklist() {
    const f = frames; if (!f) return;
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
    $('#p6-notin').innerHTML = f.not_in_trial.map((x) => `<li>${esc(x)}: not in this trial</li>`).join('');
  }
  // Values a review line's hover refers to ({ref}, {s}): the chance check's own.
  function reviewVars(res) {
    if (!res || !res.strength) return {};
    const f = (x) => (x == null ? '' : (+x).toFixed(3));
    return { ref: f(res.strength.reference), s: f(res.spread) };
  }
  async function runItem(key) {
    liveItem = true; renderChecklist();
    const box = $('#p6-running'); box.hidden = false; const t0 = Date.now();
    try {
      const t = await call('POST', `/runs/${run.run_id}/checklist`, { item: key });
      await waitTask(t.task_id, async () => {
        const r = await call('GET', `/runs/${run.run_id}`);
        const line = r.running ? r.running.line : 'Working';
        box.innerHTML = `<b>Running: ${esc(frames.checklist.find((i) => i.key === key).title)}</b>. ${esc(line)}. ${fmtS((Date.now() - t0) / 1000)} so far.<br><span class="tr-small">Nothing else starts while this runs. You can rename frames, browse the table and read the shared concepts.</span>`;
      });
    } catch (e) { toast(e.message); }
    liveItem = false; box.hidden = true; await refreshFrames();
    $('#p6-time').textContent = `The last item took ${fmtS((Date.now() - t0) / 1000)}`;
  }
  // The stored value is the method's word; the label is AD's plain one (12 Nov).
  const READINGS = [['shared priority', 'shared priority'], ['distinct framings of the same problem', 'two framings of the same problem'], ['explicit disagreement', 'explicit disagreement'], ['co-mention only', 'mentioned together, nothing more']];
  async function showBridging() {
    const list = await call('GET', `/runs/${run.run_id}/bridging`);
    $('#p6-bridging').innerHTML = '<h3>Reading the shared concepts</h3>' + (list.length ? list.map((b) => `<div class="tr-card"><b>${esc(b.concept)}</b> sits in ${esc(b.frame)} and is pulled towards ${esc(b.towards)}: ${b.document_count} documents carry it alongside concepts from both.
      <div class="tr-doclist">${b.documents.slice(0, 60).map((d) => `${esc(d.document)} ${esc(d.label)}: with ${esc(d.with_own.join(', '))} | ${esc(d.with_other.join(', '))}`).join('<br>')}</div>
      <label>What the overlap means, in your reading${tip('p6.bridging.reading')} <select data-reading="${esc(b.concept)}"><option value="">not yet read</option>${READINGS.map(([v, l]) => `<option value="${esc(v)}" ${b.reading && b.reading.reading === v ? 'selected' : ''}>${esc(l)}</option>`).join('')}</select></label></div>`).join('') : '<p>No concept in this run is shared between frames.</p>');
    $$('[data-reading]').forEach((s) => { s.onchange = async () => { if (!s.value) return; await call('POST', `/runs/${run.run_id}/bridging/reading`, { concept: s.dataset.reading, reading: s.value }); toast('Reading recorded.'); }; });
  }

  // --- page 7 ---------------------------------------------------------------------
  function renderExport() {
    if (!run) return;
    $('#p7-article').href = `${API}/runs/${run.run_id}/export/article`;
    $('#p7-reviewer').href = `${API}/runs/${run.run_id}/export/reviewer`;
    $('#p7-limit').innerHTML = frames && !frames.where_you_stand.meets_reporting_minimum
      ? `<p class="tr-tier">A report taken now is marked interim, because the chance check hasn't run.${tip('p7.limit')}</p>` : '';
  }

  // --- boot -------------------------------------------------------------------------
  fillTips(document); renderSteps('p1'); renderNotes(); loadExamples(); show('p1');
})();
