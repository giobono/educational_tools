/* corres_g4.js — the nine-step pipeline, driven over /v2/corres.
 *
 * Build brief v0.2 §8. No sentence here describes the method: those live in
 * method_strings.js, so AD sights one file (Charter §2.3). What is here is
 * §8's four-part page shape, the run rail, and the task polling the API
 * contract requires.
 *
 * A step route answers 202 and the task's result is an artefact REFERENCE,
 * never the matrix (invariant 4, OD ruling §1.4). So every figure on this
 * page is read from the artefact's manifest — `params` for what the step
 * resolved, `provenance` for its tables — not from the task result.
 *
 * THE K IS NEVER A CONSTANT. It is read back from A4's `params.k`, which is
 * what the step 4 decision set. That is the thing which removes G3's fixed 3
 * (CR4-11, build brief §8). There is no numeric k literal in this file.
 */

(function () {
  'use strict';

  const M = window.G4_METHOD;
  const ORDER = ['declare', 'binarise', 'admit', 'associate', 'stability',
                 'covariates', 'structure', 'pairs', 'sensitivity'];
  const SLOT = ['a0', 'a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'];
  const LAST = ORDER.length - 1;

  const state = {
    runId: null,
    step: 0,
    chosenK: null,       // only ever from A4's params.k
    upload: null,
    valueType: 'count',   // what the researcher declared, held across redraws
    results: {},         // step -> the merged manifest view
    flags: {},           // step -> that step's flags
    polling: null,       // the live task id, for Cancel
    cap: null,           // {tier, reason} once any step reports one
    fixed: {},           // step -> published `fixed` defaults, from GET /config
  };

  const $ = (id) => document.getElementById(id);
  const text = (el, s) => { if (el) el.textContent = s == null ? '' : String(s); };
  const clear = (el) => { while (el && el.firstChild) el.removeChild(el.firstChild); };
  const note = (s) => { const p = document.createElement('p'); p.className = 'g4-running'; text(p, s); return p; };

  /* ---- the published parameter table -------------------------------- */
  /* Step 6 refuses to run without its class cut-offs, by design: it "will not
   * choose a value the specification leaves open" (draft 0.3 §12). The values
   * are not invented here and they are not written here either -- invariant 7
   * forbids a second copy of a front-end-held parameter. They are read from
   * `GET /config`, which publishes all 39 parameters with their class, their
   * default and whether they are provisional.
   *
   * Only `class: "fixed"` is sent. `decision` belongs to the researcher
   * (frame_names) and `beta` to the environment (opposition_seed).
   *
   * And only where the default is a usable literal. Some fixed defaults are
   * descriptions of a rule rather than a value -- step 1 publishes
   * `rating_threshold: "half_declared_max"` -- and sending that as a number
   * would break a step that already works without it.
   */
  function usableLiteral(v) {
    return typeof v === 'number' || typeof v === 'boolean';
  }

  async function loadConfig() {
    let rows = [];
    try { rows = await window.G4.config(); } catch (e) { return; }
    const byStep = {};
    rows.forEach((r) => {
      if (r.class !== 'fixed' || !usableLiteral(r.default)) return;
      (byStep[r.step] = byStep[r.step] || {})[r.name] = {
        value: r.default, provisional: !!r.provisional, note: r.note || '',
      };
    });
    state.fixed = byStep;
  }

  /* ---- the sighting gate -------------------------------------------- */
  /* method_strings.js carries its own status line. Until AD has sighted it,
   * the page says so in the open rather than showing unsighted prose
   * quietly. */
  function sightingBanner() {
    const sighted = M && M.sighted === true;
    $('g4-unsighted').hidden = sighted;
    if (sighted) return;
    text($('g4-unsighted-detail'),
      'The wording on these pages is drawn from specification draft 0.5 and the '
      + 'numbered CR4 decisions, and has not been through AD. It is shown here '
      + 'for development only.');
  }

  /* ---- reading an artefact ------------------------------------------ */
  /* The merged view the panes render from. `GET /runs/{id}/artefacts/{slot}`
   * answers {manifest, files}; the step's own task result adds how long it
   * took and the digest it was recorded under. */
  async function loadArtefact(step, fromTask) {
    const slot = SLOT[step];
    const got = await window.G4.artefact(state.runId, slot);
    const m = got.manifest || {};
    const view = {
      step,
      slot,
      params: m.params || {},
      provenance: m.provenance || {},
      tier: m.tier,
      variant: m.variant || null,
      files: got.files || [],
      generated_at: m.generated_at,
      seconds: fromTask ? fromTask.seconds : null,
      manifest_sha256: fromTask ? fromTask.manifest_sha256 : null,
    };
    state.results[step] = view;
    state.flags[step] = (fromTask && fromTask.flags)
      || view.provenance.flags || [];
    noteCap(view);
    if (step === 4) state.chosenK = view.params.k ?? null;
    return view;
  }

  /* A cap is a property of the run, not of one pane: once a step records one
   * it governs every claim shown afterwards. Steps write it into `params` as
   * `claim_tier_cap`, so this reads the artefact rather than guessing from a
   * flag code. */
  /* The server's reason is a developer string. Where a sighted string says
   * the same thing, the sighted one is what the researcher reads: CR4-22 (3)
   * requires that wording quoted exactly, and the point of method_strings.js
   * is that no unsighted sentence reaches the page. An unrecognised reason is
   * still shown -- saying nothing would be worse -- and marked as not sighted. */
  function sightedReason(raw) {
    const r = String(raw || '').toLowerCase().replace(/[.\s]+$/, '');
    if (r === 'compositional data is not yet supported in g4; results are exploratory') {
      return { text: M.unsupportedShape, sighted: true };
    }
    return { text: raw || '', sighted: false };
  }

  function noteCap(view) {
    const t = view.params.claim_tier_cap;
    if (!t) return;
    const r = sightedReason(view.params.claim_tier_cap_reason);
    state.cap = { tier: t, reason: r.text, sighted: r.sighted };
  }

  /* ---- part 3: the flags -------------------------------------------- */
  const SEVERITY_ORDER = { stop: 0, caution: 1, note: 2 };

  function renderFlags(flags) {
    const host = $('g4-flags');
    clear(host);
    if (!flags || !flags.length) { host.appendChild(note('None.')); return; }
    [...flags]
      .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 3) - (SEVERITY_ORDER[b.severity] ?? 3))
      .forEach((f) => {
        const d = document.createElement('div');
        d.className = 'g4-flag';
        d.dataset.severity = f.severity;
        const head = document.createElement('p');
        const sev = document.createElement('span');
        sev.className = 'g4-sev';
        sev.title = (M.severities[f.severity] || {}).gloss || '';
        text(sev, (M.severities[f.severity] || {}).label || f.severity);
        const code = document.createElement('code');
        text(code, f.code);
        head.append(sev, document.createTextNode(' '), code);
        d.appendChild(head);
        const msg = document.createElement('p');
        text(msg, f.message);
        d.appendChild(msg);
        if (f.proposal) {
          const pr = document.createElement('p');
          pr.className = 'g4-proposal';
          text(pr, f.proposal);
          d.appendChild(pr);
        }
        host.appendChild(d);
      });
  }

  /* ---- part 2: the one thing to look at ----------------------------- */
  function table(headers, rows, opts) {
    const o = opts || {};
    const t = document.createElement('table');
    const hr = t.createTHead().insertRow();
    headers.forEach((h) => {
      const th = document.createElement('th');
      if (h && h.num) th.className = 'g4-num';
      text(th, (h && h.label) != null ? h.label : h);
      hr.appendChild(th);
    });
    const body = t.createTBody();
    rows.forEach((r) => {
      const tr = body.insertRow();
      if (o.mark && o.mark(r)) tr.dataset.recommended = 'true';
      headers.forEach((h, i) => {
        const td = tr.insertCell();
        if (h && h.num) td.className = 'g4-num';
        text(td, r[i]);
      });
    });
    return t;
  }

  function tierBadge(tier) {
    const s = document.createElement('span');
    s.className = 'g4-tier';
    s.dataset.tier = tier;
    s.title = (M.tiers[tier] || {}).gloss || '';
    text(s, (M.tiers[tier] || {}).label || tier);
    return s;
  }

  /* A claim never appears without its tier, and the run's cap wins: §8 and
   * CR4-13 both turn on the opposition table never being shown as certified
   * because it is interpretive by contract. */
  function effectiveTier(view) {
    const capped = state.cap && state.cap.tier;
    if (!capped) return view.tier;
    const rank = ['exploratory', 'limits', 'interpretive', 'confirmatory', 'certified'];
    const a = rank.indexOf(capped), b = rank.indexOf(view.tier);
    return (a >= 0 && (b < 0 || a < b)) ? capped : view.tier;
  }

  function showNumber(v) {
    if (typeof v === 'number') return Number.isInteger(v) ? v : v.toFixed(4);
    return v;
  }

  function renderFocus(step, view) {
    const host = $('g4-focus');
    clear(host);
    if (!view) {
      host.appendChild(note('Nothing yet. Run this step.'));
      return;
    }
    const p = view.params;

    if (step === 0) {
      const roles = p.roles || {};
      const types = p.covariate_types || {};
      host.appendChild(table(
        ['Column', 'Role', 'Declared as'],
        Object.keys(roles).map((c) => [c, roles[c], types[c] || ''])
      ));
    } else if (step === 4) {
      /* The table by k. The recommended row is marked; the k the run
       * proceeds on is p.k, set by the decision below. */
      const rows = (view.provenance.by_k || []).map((r) => [
        r.k,
        r.J_k,
        r.evaluated ? showNumber(r.reproducibility) : '—',
        (r.ci_low != null && r.ci_high != null)
          ? `[${showNumber(r.ci_low)}, ${showNumber(r.ci_high)}]` : '',
        showNumber(r.pac),
        r.passed ? 'yes' : (r.reason || 'no'),
      ]);
      host.appendChild(table(
        [{ label: 'k', num: true }, { label: 'Usable splits', num: true },
         { label: 'Reproducibility', num: true }, '95% interval',
         { label: 'PAC', num: true }, 'Passes the gate'],
        rows, { mark: (r) => String(r[0]) === String(p.k_recommended) }
      ));
      if (p.k != null) {
        host.appendChild(note(
          p.k_by_researcher
            ? `Proceeding on k = ${p.k}, your choice.`
            : `Proceeding on k = ${p.k}, the recommendation.`));
      }
    } else {
      /* The general case: what the step resolved. Each step's own figure is
       * a design question for AD, and showing the resolved parameters is the
       * honest thing to show until there is one. */
      const entries = Object.entries(p).filter(
        ([k]) => !k.startsWith('_')
               && k !== 'claim_tier_cap' && k !== 'claim_tier_cap_reason');
      host.appendChild(table(
        ['', 'Value'],
        entries.map(([k, v]) => [
          k,
          (v !== null && typeof v === 'object') ? JSON.stringify(v) : showNumber(v),
        ])
      ));
    }

    /* What the step was run with, where the specification leaves it open.
     * Shown rather than applied quietly: `provisional` is AD's sighted
     * wording, and a reader should be able to see which numbers it refers to. */
    const fixed = state.fixed[step] || {};
    const provisional = Object.entries(fixed).filter(([, v]) => v.provisional);
    if (provisional.length) {
      const d = document.createElement('p');
      d.className = 'g4-source';
      text(d, 'Provisional, from the published parameter table: '
        + provisional.map(([k, v]) => `${k} = ${v.value}`).join(', '));
      host.appendChild(d);
    }

    const foot = document.createElement('p');
    foot.className = 'g4-artefact';
    foot.append(tierBadge(effectiveTier(view)));
    foot.appendChild(document.createTextNode(
      ` Artefact ${view.slot.toUpperCase()}`
      + (view.files.length ? ` — ${view.files.join(', ')}` : '')
      + (view.manifest_sha256 ? ` — ${String(view.manifest_sha256).slice(0, 12)}` : '')));
    host.appendChild(foot);
  }

  /* ---- part 4: the decision, default pre-selected ------------------- */
  function renderDecision(step) {
    const host = $('g4-decision');
    clear(host);
    const d = M.decisions[step];
    if (!d) { $('g4-decision-part').hidden = true; return; }
    $('g4-decision-part').hidden = false;

    const fs = document.createElement('fieldset');
    const lg = document.createElement('legend');
    text(lg, d.prompt);
    fs.appendChild(lg);
    d.options.forEach((o) => {
      const lab = document.createElement('label');
      lab.className = 'g4-option';
      const input = document.createElement('input');
      input.type = 'radio';
      input.name = `g4-decision-${step}`;
      input.value = o.value;
      if (o.isDefault) input.checked = true;          // §8: a default, always
      const span = document.createElement('span');
      span.className = 'g4-label';
      text(span, o.label);
      const cons = document.createElement('span');
      cons.className = 'g4-consequence';
      text(cons, o.consequence);                      // §8: one line each
      lab.append(input, document.createTextNode(' '), span, cons);
      fs.appendChild(lab);
    });
    host.appendChild(fs);
    if (d.source) {
      const s = document.createElement('p');
      s.className = 'g4-source';
      text(s, d.source);
      host.appendChild(s);
    }

    /* Choosing a neighbouring k needs a number, so offer the evaluated ones
     * rather than a free field. */
    if (step === 4) {
      const view = state.results[4];
      const evaluated = ((view && view.provenance.by_k) || []).filter((r) => r.evaluated);
      if (evaluated.length) {
        const wrap = document.createElement('p');
        const lab = document.createElement('label');
        text(lab, 'If choosing: ');
        const sel = document.createElement('select');
        sel.id = 'g4-k-choice';
        evaluated.forEach((r) => {
          const o = document.createElement('option');
          o.value = r.k;
          text(o, `k = ${r.k}`);
          if (String(r.k) === String(view.params.k_recommended)) o.selected = true;
          sel.appendChild(o);
        });
        lab.appendChild(sel);
        wrap.appendChild(lab);
        host.appendChild(wrap);
      }
    }
  }

  function chosen(step) {
    const el = document.querySelector(`input[name="g4-decision-${step}"]:checked`);
    return el ? el.value : null;
  }

  /* ---- the rails ---------------------------------------------------- */
  function renderRail() {
    const ol = $('g4-rail-steps');
    clear(ol);
    ORDER.forEach((name, i) => {
      const li = document.createElement('li');
      const done = !!state.results[i];
      const reachable = done || i === state.step || !!state.results[i - 1];
      li.dataset.state = (state.polling && state.step === i) ? 'running'
        : done ? 'done'
        : reachable ? 'todo' : 'blocked';
      if (i === state.step) li.setAttribute('aria-current', 'step');
      text(li, `${i}. ${M.steps[i].title}`);
      /* The chosen k, on the rail from step 4 onwards, because every step
       * after it is read at that granularity and the researcher should not
       * have to go back to see which one they are reading. */
      if (i === 4 && state.chosenK != null) {
        const k = document.createElement('span');
        k.className = 'g4-rail-k';
        text(k, `k = ${state.chosenK}`);
        li.appendChild(k);
      }
      if (reachable) { li.tabIndex = 0; li.onclick = () => show(i); }
      ol.appendChild(li);
    });
  }

  /* §8: Back starts a new numbered run, and the run history is visible. */
  async function renderRuns() {
    const ul = $('g4-rail-runs');
    clear(ul);
    let runs = [];
    try { runs = await window.G4.runs(); } catch (e) { /* offline is not fatal here */ }
    if (!runs.length) { ul.appendChild(note('No runs yet.')); return; }
    runs.forEach((r) => {
      const li = document.createElement('li');
      if (r.parent_run_id) li.className = 'g4-rerun';
      if (r.run_id === state.runId) li.dataset.current = 'true';
      const a = document.createElement('a');
      a.href = '#';
      text(a, r.run_id + (r.parent_run_id ? ' (rerun)' : ''));
      a.onclick = (e) => { e.preventDefault(); openRun(r); };
      li.appendChild(a);
      const n = document.createElement('span');
      n.className = 'g4-run-note';
      text(n, r.furthest_step == null ? ' — started'
        : ` — through step ${r.furthest_step}`);
      li.appendChild(n);
      ul.appendChild(li);
    });
  }

  async function openRun(row) {
    state.runId = row.run_id;
    state.results = {}; state.flags = {}; state.chosenK = null; state.cap = null;
    state.upload = null;
    const steps = (row.artefacts || []).map((s) => SLOT.indexOf(s)).filter((i) => i >= 0);
    for (const i of steps.sort((a, b) => a - b)) {
      try { await loadArtefact(i, null); } catch (e) { /* a partial run is fine */ }
    }
    state.step = steps.length ? Math.min(LAST, Math.max(...steps)) : 0;
    await renderRuns();
    show(state.step);
    if (state.step === 0 && !state.results[0]) mountUpload();
  }

  /* ---- the pane ----------------------------------------------------- */
  function show(step) {
    state.step = step;
    const view = state.results[step];
    text($('g4-step-num'), String(step));
    text($('g4-step-title'), M.steps[step].title);
    text($('g4-did'), M.steps[step].did);
    text($('g4-look-at'), M.lookAt[step]);
    renderFocus(step, view);
    renderFlags(state.flags[step]);
    renderDecision(step);
    renderCap();
    $('g4-next').hidden = !view || step === LAST;
    text($('g4-run'), view ? 'Run it again' : 'Run this step');
    $('g4-running').hidden = !state.polling;
    renderRail();
  }

  function renderCap() {
    const host = $('g4-provisional').parentNode || $('g4-pane');
    const old = document.querySelector('.g4-cap');
    if (old) old.remove();
    if (!state.cap) return;
    const d = document.createElement('div');
    d.className = 'g4-cap';
    d.append(tierBadge(state.cap.tier));
    const s = document.createElement('span');
    text(s, ' ' + (state.cap.reason || ''));
    d.appendChild(s);
    if (!state.cap.sighted && state.cap.reason) {
      const u = document.createElement('span');
      u.className = 'g4-not-sighted';
      text(u, ' (wording not sighted)');
      d.appendChild(u);
    }
    host.insertBefore(d, $('g4-provisional'));
  }

  /* ---- running a step ----------------------------------------------- */
  /* Only the researcher's own decisions go here. Everything a step reads it
   * reads from its declared inputs, so this stays small by design. */
  function paramsFor(step) {
    /* The published defaults first, the researcher's own decisions over the
     * top: a decision must always beat a default. */
    const p = {};
    Object.entries(state.fixed[step] || {}).forEach(([k, v]) => { p[k] = v.value; });
    if (step === 0) {
      if (state.upload) p.upload_id = state.upload.upload_id;
      if (chosen(0) === 'confirm' && state.upload) {
        p.roles = state.upload.proposed_roles;
        p.covariate_types = state.upload.proposed_covariate_types;
      }
      const vt = $('g4-value-type');
      if (vt) state.valueType = vt.value;
      // Held in state, not read off the pane: the pane is redrawn and the
      // select goes with it, and a dropped value_type would silently change
      // what the step did.
      if (state.valueType) p.value_type = state.valueType;
    }
    if (step === 3 && chosen(3) === 'exclude') p.exclude_low_signal = true;
    if (step === 4 && chosen(4) === 'choose') {
      const sel = $('g4-k-choice');
      if (sel) p.k = Number(sel.value);               // the researcher's k
    }
    return p;
  }

  async function runStep() {
    if (!state.runId) await newRun();
    const step = state.step;
    const running = $('g4-running');
    $('g4-run').disabled = true;
    $('g4-cancel').hidden = false;
    running.hidden = false;
    text(running, 'Running…');

    const started = Date.now();
    try {
      // One idempotency key per user action: this click (OD ruling §2.2).
      const key = `${state.runId}:${step}:${started}`;
      const { task, result } = await window.G4.runStep(ORDER[step], {
        run_id: state.runId,
        corpus_id: state.runId,
        params: paramsFor(step),
      }, {
        idempotencyKey: key,
        onTick: (t) => {
          if (t && t.task_id) state.polling = t.task_id;
          const secs = Math.round((Date.now() - started) / 1000);
          /* A slow step is alive and the API answers throughout: step 6 is
           * about five minutes on a large corpus. */
          text(running, `Running… ${secs}s`);
        },
      });
      state.polling = task.task_id;
      await loadArtefact(step, result);
      text(running, `Done in ${result.seconds}s.`);
    } catch (err) {
      if (err.status === 409 && err.detail && err.detail.task_id) {
        state.polling = err.detail.task_id;
        text(running, 'That step is already running on this run.');
      } else if (err.flags && err.flags.length) {
        state.flags[step] = err.flags;       // a Stop is flags, not a message
        text(running, 'Stopped. See the flags above.');
      } else {
        text(running, err.message || 'The step did not complete.');
      }
    } finally {
      state.polling = null;
      $('g4-run').disabled = false;
      $('g4-cancel').hidden = true;
      const msg = $('g4-running').textContent;
      show(step);
      $('g4-running').hidden = false;
      text($('g4-running'), msg);
      renderRuns();
    }
  }

  /* Starting the run for a file just chosen must not redraw part 2 out from
   * under the upload controls. */
  async function newRunKeepingUpload() {
    const corpus = corpusName();
    const run = await window.G4.createRun(corpus, `new-run:${Date.now()}`);
    state.runId = run.run_id;
    state.results = {}; state.flags = {}; state.chosenK = null; state.cap = null;
    state.step = 0;
    await renderRuns();
    renderRail();
    renderDecision(0);
    text($('g4-run'), 'Run this step');
    return run;
  }

  function corpusName() {
    return ((state.upload && state.upload.name) || 'corpus')
      .replace(/\.[a-z0-9]+$/i, '')
      .replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      .replace(/^-+|-+$/g, '') || 'corpus';
  }

  async function newRun() {
    const run = await window.G4.createRun(corpusName(), `new-run:${Date.now()}`);
    state.runId = run.run_id;
    state.results = {}; state.flags = {}; state.chosenK = null; state.cap = null;
    state.step = 0;
    await renderRuns();
    show(0);
    return run;
  }

  /* ---- step 0's upload --------------------------------------------- */
  /* The matrix goes to the server once and is referred to by id afterwards
   * (OD routes ruling §3); nothing of it is held here. */
  function mountUpload() {
    const host = $('g4-focus');
    clear(host);

    /* The controls stay put and the proposal appears beneath them, so the
     * researcher can pick a different file or a different value type without
     * starting a new run. */
    const controls = document.createElement('div');
    controls.className = 'g4-upload';
    const row = document.createElement('p');
    const file = document.createElement('input');
    file.type = 'file';
    file.accept = '.csv,text/csv';
    file.id = 'g4-file';
    row.appendChild(file);

    const vtRow = document.createElement('p');
    const lab = document.createElement('label');
    text(lab, 'What the values are: ');
    const vt = document.createElement('select');
    vt.id = 'g4-value-type';
    ['count', 'rating', 'presence', 'percentage'].forEach((v) => {
      const o = document.createElement('option');
      o.value = v; text(o, v);
      if (v === state.valueType) o.selected = true;
      vt.appendChild(o);
    });
    vt.onchange = () => { state.valueType = vt.value; };
    lab.appendChild(vt);
    vtRow.appendChild(lab);

    controls.append(row, vtRow);
    const proposal = document.createElement('div');
    proposal.id = 'g4-proposal-block';
    host.append(controls, proposal);

    file.onchange = async () => {
      if (!file.files || !file.files[0]) return;
      const running = $('g4-running');
      running.hidden = false;
      text(running, 'Reading the file…');
      try {
        state.upload = await window.G4.upload(file.files[0]);
        state.flags[0] = [];
        renderFlags([]);
        await newRunKeepingUpload();
        /* The proposal, for confirmation: CR4-16 (2). Nothing is written
         * until step 0 runs. */
        clear(proposal);
        const roles = state.upload.proposed_roles || {};
        const types = state.upload.proposed_covariate_types || {};
        proposal.appendChild(table(
          ['Column', 'Proposed role', 'Proposed type'],
          Object.keys(roles).map((c) => [c, roles[c], types[c] || ''])
        ));
        const prov = state.upload.provenance || [];
        if (prov.length) {
          const h = document.createElement('p');
          text(h, 'Carried from the file, verbatim:');
          const pre = document.createElement('pre');
          text(pre, prov.join('\n'));
          proposal.append(h, pre);
        }
        text(running,
          `${state.upload.rows} rows, ${state.upload.columns.length} columns, `
          + `sha256 ${String(state.upload.sha256).slice(0, 12)}.`);
      } catch (err) {
        const flags = (err.detail && err.detail.flags) || err.flags;
        if (flags && flags.length) { state.flags[0] = flags; renderFlags(flags); }
        text(running, err.message || 'The file could not be read.');
      }
    };
  }

  /* ---- boot --------------------------------------------------------- */
  async function boot() {
    /* The site's own header, nav and build version, loaded exactly as every
     * other app loads them. An earlier version of this called a
     * `window.renderHeader` that does not exist, behind an `if` -- so it
     * failed silently and the page rendered with no header and no nav at all,
     * looking like an orphaned prototype rather than part of the site. */
    if (window.loadFragment) {
      try { await window.loadFragment('edu-header', '/edu_header.html'); }
      catch (e) { /* the app still works without the chrome */ }
    }
    if (window.markActiveNav) window.markActiveNav();
    if (window.applyAppVisibility) window.applyAppVisibility();
    if (window.renderBuildVersion) window.renderBuildVersion();
    if (window.enforceAppActive && !window.enforceAppActive()) return;

    sightingBanner();
    text($('g4-intro'), M.intro);
    text($('g4-provisional'), M.provisional);

    $('g4-run').onclick = runStep;
    $('g4-next').onclick = () => show(Math.min(LAST, state.step + 1));
    $('g4-new-run').onclick = async () => {
      state.upload = null;
      await newRun();
      mountUpload();
    };
    $('g4-cancel').onclick = async () => {
      if (!state.polling) return;
      try { await window.G4.cancel(state.polling); } catch (e) { /* best effort */ }
      text($('g4-running'), 'Cancelling at the next checkpoint…');
    };

    await loadConfig();
    renderRail();
    await renderRuns();
    show(0);
    mountUpload();
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
