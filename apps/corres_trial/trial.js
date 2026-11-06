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
  const FQ2 = 'You might consider using these document attributes when discussing your findings. We can analyse how strongly they are reflected in the framing of concepts, but each analysis takes some time. We recommend you choose a small number of attributes that are most likely to be of interest. We can come back to this point and select other attributes at any time. Attributes you choose now are reported as planned; those added later are reported as exploratory. This distinction protects you from any suggestion that an analysis was chosen to produce a desired result.';

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
      const msg = typeof d === 'string' ? d : (d && d.message) || ('request failed: ' + r.status);
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
      box.innerHTML = `<label class="tr-small">Your notes on this page${run ? '' : ' (start a run to save them)'}</label>
        <textarea placeholder="What you noticed, how long it felt, what you would want here"></textarea>
        <button class="tr-btn">Save note</button>
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
      $('#tr-examples').innerHTML = ex.map((e) => `<button class="tr-btn" data-ex="${esc(e.id)}" ${e.available ? '' : 'disabled title="not found where its data register says it is"'}>${esc(e.title)}</button>`).join('');
      $$('[data-ex]').forEach((b) => { b.onclick = () => startExample(b.dataset.ex); });
    } catch (e) { $('#tr-examples').textContent = 'The local backend is not answering at ' + C.apiBase + '.'; }
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
    try { const t0 = performance.now(); run = await call('POST', '/runs/upload', fd, true); started = Date.now(); const s = (performance.now() - t0) / 1000; $('#p2-time').textContent = 'Upload and check: ' + fmtS(s); afterCheck(s); }
    catch (e) { toast(e.message); }
  };

  // --- page 3 ---------------------------------------------------------------------
  function afterCheck(secs) {
    const c = run.check;
    $('#p3-opening').textContent = OPENING;
    $('#p3-summary').innerHTML = `<p>${c.documents} documents. ${c.concepts.length} concepts. ${c.document_details.length ? 'Document details: ' + esc(c.document_details.join(', ')) + '.' : 'No document details were found.'}</p>`;
    $('#p3-questions').innerHTML = c.questions.length ? c.questions.map((q) => `<div class="tr-q" data-q="${esc(q.id)}"><p>${esc(q.ask)}</p>${q.options.map((o, i) => `<label><input type="radio" name="q_${esc(q.id)}" value="${esc(o.value)}" ${i === 0 ? 'checked' : ''}/> ${esc(o.label)}</label>`).join('')}${q.id === 'scale' ? '<label>Top of the scale <input type="number" min="1" max="100" id="q-scale-max" style="width:5rem"/></label>' : ''}</div>`).join('')
      : '<div class="tr-q"><p>Your file is ready: nothing in it needs a decision before the analysis.</p></div>';
    const roles = c.roles;
    $('#p3-roles').innerHTML = `<details><summary>Every column, and what it is (change any)</summary><div class="tr-roles">${Object.keys(roles).map((col) => `<label>${esc(col)} <select data-col="${esc(col)}">${['concept', 'covariate', 'label', 'id', 'exclude'].map((r) => `<option value="${r}" ${roles[col] === r ? 'selected' : ''}>${{ concept: 'concept', covariate: 'document detail', label: 'label', id: 'identifier', exclude: 'remove' }[r]}</option>`).join('')}</select></label>`).join('')}</div></details>`;
    $('#fq1').textContent = FQ1; $('#fq2').textContent = FQ2;
    const cats = c.category_details || [];
    $('#fq2-list').innerHTML = (cats.length ? cats.map((d) => `<label><input type="checkbox" class="fq2" value="${esc(d)}"/> ${esc(d)}</label>`).join('') : '<p class="tr-small">No category columns were detected.</p>')
      + '<label><input type="checkbox" id="fq2-unsure"/> Not sure yet</label>';
    $('#p3-time').textContent = 'Checking the matrix: ' + fmtS(run.timings && run.timings.check) + (secs ? ` (round trip ${fmtS(secs)})` : '');
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
    const cell = Math.max(3, Math.floor((canvas.width - pad) / n));
    canvas.height = canvas.width; ctx.clearRect(0, 0, canvas.width, canvas.height);
    let lim = 0; values.forEach((r) => r.forEach((v) => { lim = Math.max(lim, Math.abs(v)); })); lim = lim || 1;
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
      const v = values[i][j]; let col;
      if (diverging) { const t = Math.max(-1, Math.min(1, v / lim)); col = t >= 0 ? `rgb(${255},${Math.round(255 * (1 - t))},${Math.round(255 * (1 - t))})` : `rgb(${Math.round(255 * (1 + t))},${Math.round(255 * (1 + t))},255)`; }
      else { const g = Math.round(255 * (1 - Math.max(0, Math.min(1, v)))); col = `rgb(${g},${g},${g})`; }
      ctx.fillStyle = col; ctx.fillRect(pad + j * cell, pad + i * cell, cell, cell);
    }
    if (cell >= 7) {
      ctx.fillStyle = '#333'; ctx.font = `${Math.min(11, cell - 1)}px Barlow, sans-serif`; ctx.textAlign = 'right';
      labels.forEach((l, i) => ctx.fillText(l.slice(0, 26), pad - 4, pad + i * cell + cell * 0.8));
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
        $('#fv-caption').textContent = `${fv.documents_admitted} documents and ${fv.concepts_admitted} concepts admitted. Residuals under document-level independence, ordered so that concepts that resonate sit together: red, more often together than expected; blue, less. Shown in ${fmtS(fv.seconds)}.`;
      }
      const t = run.timings || {};
      const step = [['declare', 'Reading the declaration'], ['binarise', 'Applying the presence rule'], ['admit', 'Admitting documents and concepts'], ['first_view', 'The first view'],
        ['associate', 'Measuring how far concepts co-occur beyond chance'], ['stability', 'Finding the groups that reappear across halves of the corpus'], ['covariates', 'Relating each frame to the document details'], ['structure', 'Reading the inside of each frame'], ['pairs', 'Recording the pairs tested']];
      lines.innerHTML = step.filter(([k]) => t[k] != null).map(([k, l]) => `<li class="done">${esc(l)}: ${fmtS(t[k])}</li>`).join('')
        + (run.running && run.running.line ? `<li>${esc(run.running.line)}…</li>` : '');
      $('#p4-time').textContent = 'This page so far: ' + fmtS((Date.now() - t0) / 1000);
    });
    if (done.state !== 'succeeded') { toast('The run stopped: ' + JSON.stringify(done.error || done.state)); return; }
    await refreshFrames();
    if (frames.defaults) $('#p4-defaults').innerHTML = '<h3>What the app chose, and why</h3>' + frames.defaults.choices.map((c) => `<div class="tr-card"><b>${esc(c.fork)}</b>: ${esc(c.chosen)}. <span class="tr-small">${esc(c.reason)}.</span></div>`).join('') + '<p class="tr-small">Chosen from the shape of the data before any result.</p>';
    reached = Math.max(reached, 5); show('p5');
  }

  // --- page 5 ---------------------------------------------------------------------
  async function refreshFrames() {
    if (!run) return;
    try { frames = await call('GET', `/runs/${run.run_id}/frames`); } catch (e) { if (e.status === 404) return; throw e; }
    run = await call('GET', `/runs/${run.run_id}`);
    renderFrames(); renderChecklist(); renderExport(); renderNotes(); renderSteps(PAGES.find((p) => $('#' + p).classList.contains('on')));
  }
  function concepts(list, withTarget) { return list.length ? list.map((c) => esc(c.concept) + (withTarget && c.towards ? ` <span class="tr-small">(towards ${esc(c.towards)})</span>` : '')).join(', ') : '<span class="tr-small">none</span>'; }
  function renderFrames() {
    const f = frames;
    $('#p5-tier').innerHTML = f.tier === 'descriptive'
      ? 'These results are <b>descriptive</b>; the stable and robust tiers await the references.'
      : `The frames' tier: <b>${esc(f.tier)}</b>.`;
    $('#p5-table').innerHTML = f.frames.map((fr) => `<div class="tr-frame">
      <input class="tr-name" data-frame="${esc(fr.id)}" value="${esc(fr.name)}" aria-label="Frame name"/> <span class="tr-small">${esc(fr.tier)}</span>
      <div class="k">Distinguishing</div><div>${concepts(fr.distinguishing)}</div>
      <div class="k">Bridging candidates</div><div>${concepts(fr.bridging_candidates, true)}</div>
      <div class="k">Diffuse</div><div>${concepts(fr.diffuse)}</div>
      ${fr.method_contingent.length ? `<div class="k">Placement depends on the grouping method</div><div>${concepts(fr.method_contingent)}</div>` : ''}
      ${fr.outside_support.length ? `<div class="k">Too rare or too common to carry a claim</div><div>${concepts(fr.outside_support)}</div>` : ''}
      ${fr.shares_by_population.length ? `<div class="k">Share by population</div><ul>${fr.shares_by_population.filter((s) => s.share != null).map((s) => `<li>${esc(s.population)} (${esc(s.detail)}, ${s.documents} documents, ${s.mean_concepts_per_document.toFixed(1)} concepts each): ${s.share.toFixed(2)}</li>`).join('')}</ul>` : ''}
    </div>`).join('') + (f.unplaced.length ? `<div class="tr-frame"><div class="k">Unplaced: in no frame</div><div>${concepts(f.unplaced)}</div></div>` : '')
      + (f.number_of_frames === 0 ? '<p>No frame was found at this k, so every result is descriptive.</p>' : '');
    $$('input.tr-name').forEach((inp) => { inp.onchange = async () => { await call('POST', `/runs/${run.run_id}/frames/${inp.dataset.frame}/name`, { name: inp.value }); refreshFrames(); }; });
    if (f.consensus) heat($('#sd-canvas'), f.consensus.concepts, f.consensus.values, false);
    $('#p5-chosen').innerHTML = `<h3>What the app chose, and why</h3><p>${f.number_of_frames} frame${f.number_of_frames === 1 ? '' : 's'} among ${f.number_of_groups} groups, at k = ${f.k}${f.k === f.recommended_k ? ', the most reproducible number of groups' : `; the recommended k was ${f.recommended_k}`}.</p>
      <table class="tr-k"><tr><th>k</th>${f.by_k.map((r) => `<td>${r.k}</td>`).join('')}</tr><tr><th>Reproducibility</th>${f.by_k.map((r) => `<td>${r.evaluated ? r.reproducibility.toFixed(3) : 'not evaluated'}</td>`).join('')}</tr></table>
      ${f.compositional ? '<p class="tr-small">Your values are shares of each document, so associations between concepts are partly built into the data; frame shares across populations are not affected.</p>' : ''}
      <p class="tr-small"><a href="#" id="values-used">Values used</a>: every threshold in this run is provisional.</p>`;
    $('#values-used').onclick = (e) => { e.preventDefault(); toast('Provisional values: 49 permutations, 50 splits, 10 k-means starts, 19 signal shuffles, support window 10 to 90% of documents, minimum corpus 50 documents and 6 concepts, class cut-offs 0.5, 0.10 and 0.6.'); };
    const w = f.where_you_stand;
    $('#p5-where').innerHTML = `<h3>Where you stand</h3>
      ${w.meets_reporting_minimum ? '' : '<p class="tr-small">Taken before the chance check: this does not yet meet the authors’ reporting minimum.</p>'}
      <ul>${w.how_firm.map((x) => `<li>${esc(x.sentence)}</li>`).join('')}</ul>
      <p class="draft">Sentences you can use (draft wording):</p><ul>${w.sentences_you_can_use.map((s) => `<li>${esc(s.sentence)}</li>`).join('')}</ul>
      <p><b>Checklist</b>: ${w.checklist_unticked.length ? w.checklist_unticked.map((m) => `☐ ${esc(m.item)}`).join(' · ') : 'every item run'}</p>`;
    const t = run.timings || {};
    $('#p5-time').textContent = 'Main run: ' + fmtS(['associate', 'stability', 'covariates', 'structure', 'pairs'].reduce((a, k) => a + (+t[k] || 0), 0));
  }

  // --- page 6 ---------------------------------------------------------------------
  let liveItem = false;
  function renderChecklist() {
    const f = frames; if (!f) return;
    const review = f.checklist.find((i) => i.state === 'done' && !i.acknowledged);
    const rv = $('#p6-review');
    if (review && review.review) {
      rv.hidden = false;
      rv.innerHTML = `<b>${esc(review.title)}: what changed</b><ul>${(review.review.lines || []).map((l) => `<li>${esc(l)}</li>`).join('')}${(review.review.tiers_changed || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul><button class="tr-btn tr-primary" id="ack">I have read this</button>`;
      $('#ack').onclick = async () => { await call('POST', `/runs/${run.run_id}/checklist/${review.key}/acknowledge`); refreshFrames(); };
    } else rv.hidden = true;
    $('#p6-items').innerHTML = f.checklist.filter((i) => i.shown).map((i) => {
      const can = i.available && !liveItem && !review && i.state !== 'running';
      return `<li class="tr-item"><div class="lab">${esc(i.label)}${i.state === 'done' ? ' · done in ' + fmtS(i.seconds) : ''}</div>
        <b>${esc(i.title)}</b>: ${esc(i.question)}<br><span class="tr-small">About ${fmtS(i.estimate_seconds)}${i.available ? '' : ' · offered after the chance check'}${i.key === 'compare_types' ? ' · shown because ' + i.tracked.map((t) => `${t.frame} tracks ${t.detail} (η = ${t.eta.toFixed(2)})`).join('; ') : ''}</span><br>
        ${i.key === 'bridging_readings' ? '<button class="tr-btn" data-bridge>Read the bridging concepts</button>' : `<button class="tr-btn ${can ? 'tr-primary' : ''}" data-item="${i.key}" ${can ? '' : 'disabled'}>${i.state === 'done' ? 'Run again' : 'Run'}</button>`}
        ${i.state === 'failed' ? `<div class="tr-small">It stopped: ${esc(i.error)}</div>` : ''}</li>`;
    }).join('');
    $$('[data-item]').forEach((b) => { b.onclick = () => runItem(b.dataset.item); });
    $$('[data-bridge]').forEach((b) => { b.onclick = showBridging; });
    $('#p6-notin').innerHTML = f.not_in_trial.map((x) => `<li>${esc(x)}: not in this trial</li>`).join('');
  }
  async function runItem(key) {
    liveItem = true; renderChecklist();
    const box = $('#p6-running'); box.hidden = false; const t0 = Date.now();
    try {
      const t = await call('POST', `/runs/${run.run_id}/checklist`, { item: key });
      await waitTask(t.task_id, async () => {
        const r = await call('GET', `/runs/${run.run_id}`);
        const line = r.running ? r.running.line : 'Working';
        box.innerHTML = `<b>Running: ${esc(frames.checklist.find((i) => i.key === key).title)}</b>. ${esc(line)}. ${fmtS((Date.now() - t0) / 1000)} so far.<br><span class="tr-small">No new analysis starts while this runs. You can rename frames, browse the frame table, and read the bridging concepts.</span>`;
      });
    } catch (e) { toast(e.message); }
    liveItem = false; box.hidden = true; await refreshFrames();
    $('#p6-time').textContent = `Last item: ${fmtS((Date.now() - t0) / 1000)}`;
  }
  const READINGS = ['shared priority', 'distinct framings of the same problem', 'explicit disagreement', 'co-mention only'];
  async function showBridging() {
    const list = await call('GET', `/runs/${run.run_id}/bridging`);
    $('#p6-bridging').innerHTML = '<h3>Reading the bridging concepts</h3>' + (list.length ? list.map((b) => `<div class="tr-card"><b>${esc(b.concept)}</b> in ${esc(b.frame)}, towards ${esc(b.towards)}: ${b.document_count} documents carry it with members of both frames.
      <div class="tr-doclist">${b.documents.slice(0, 60).map((d) => `${esc(d.document)} ${esc(d.label)}: with ${esc(d.with_own.join(', '))} | ${esc(d.with_other.join(', '))}`).join('<br>')}</div>
      <label>Your reading <select data-reading="${esc(b.concept)}"><option value="">not yet read</option>${READINGS.map((r) => `<option ${b.reading && b.reading.reading === r ? 'selected' : ''}>${r}</option>`).join('')}</select></label></div>`).join('') : '<p>There are no bridging candidates in this run.</p>');
    $$('[data-reading]').forEach((s) => { s.onchange = async () => { if (!s.value) return; await call('POST', `/runs/${run.run_id}/bridging/reading`, { concept: s.dataset.reading, reading: s.value }); toast('Reading recorded.'); }; });
  }

  // --- page 7 ---------------------------------------------------------------------
  function renderExport() {
    if (!run) return;
    $('#p7-article').href = `${API}/runs/${run.run_id}/export/article`;
    $('#p7-reviewer').href = `${API}/runs/${run.run_id}/export/reviewer`;
    $('#p7-limit').innerHTML = frames && !frames.where_you_stand.meets_reporting_minimum
      ? '<p class="tr-tier">A report taken now is labelled as not yet meeting the authors’ reporting minimum, because the chance check has not run.</p>' : '';
  }

  // --- boot -------------------------------------------------------------------------
  renderSteps('p1'); renderNotes(); loadExamples(); show('p1');
})();
