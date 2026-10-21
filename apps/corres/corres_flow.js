/* corres_flow.js — the nine steps, on G3's pattern, over /v2/corres.
 *
 * Rewrite brief v1.1 §2: *"The pattern is G3's; the plumbing is G4's."* So the
 * markup is G3's `.step-card` with its header, waiting line, hidden controls
 * and radio groups; the data flow is inverted. G3 holds the matrix in the
 * browser and hands it back on every call. **Here the browser holds a run id
 * and nothing else** -- the artefacts are the server's (invariant 4), and
 * every number on screen came from `reports/{step}` or a figure route.
 *
 * **No screen reads anything the routes don't serve** (§4.2). If something is
 * missing from a card it is missing from the route, and the fix is a route.
 *
 * Why this is a file and not inline, where G3 put it: §2 salvages `g4_api.js`
 * and `method_strings.js` as separate files, so a separate flow file is the
 * same choice carried through. G3's 1,550 inline lines are the reason the
 * front end was hard to check.
 */

(function () {
  'use strict';

  var M = window.CORRES_METHOD || window.G4_METHOD || {};
  var ORDER = ['declare', 'binarise', 'admit', 'associate', 'stability',
               'covariates', 'structure', 'pairs', 'sensitivity'];

  /* Stage 3 delivers screens 0-4 and stage 4 delivers 5-8. The card renderer
   * is the same for all nine -- four parts from `reports/{step}` -- and the
   * back end runs all nine, so the only thing that ever stopped 5-8 was this
   * constant. It stopped a researcher mid-analysis at step 4 with no way on,
   * which reads as broken rather than as staged.
   *
   * All nine now run. **Cards past 4 are marked not yet signed**, because
   * stage 3's sign-off covers screens 0-4 and stage 4's covers the rest: a
   * screen nobody has signed should say so rather than be hidden. */
  var SIGNED_THROUGH = 4;

  var state = {
    runId: null,
    upload: null,
    fixed: {},        // step -> published `fixed` literals, from GET /config
    reports: {},      // step -> the four-part report
    furthest: -1,
  };

  function $(id) { return document.getElementById(id); }
  function text(el, s) { if (el) el.textContent = (s == null ? '' : String(s)); }
  function clear(el) { while (el && el.firstChild) el.removeChild(el.firstChild); }

  /* ---- G3's status line and error display, reused ------------------- */

  function status(step, msg) { text($('s' + step + '-status'), msg || ''); }

  function fail(err) {
    // G3's own error surface, so a G4 failure looks like a G3 failure.
    if (window.showError) { window.showError(err && err.message ? err.message : String(err)); }
    else { console.error(err); }
  }

  /* ---- the published parameter table (AD 21 Oct §1.2) --------------- */

  async function loadConfig() {
    var rows = [];
    try { rows = await window.G4.config(); } catch (e) { return; }
    rows.forEach(function (r) {
      // Only `fixed` literals are sent. `decision` is the researcher's,
      // `beta` is a tester's, and `input` is shown and never offered
      // (CR4-30 §3.6).
      if (r['class'] !== 'fixed') return;
      if (typeof r.default !== 'number' && typeof r.default !== 'boolean') return;
      (state.fixed[r.step] = state.fixed[r.step] || {})[r.name] = r.default;
    });
  }

  /* ---- tiers: the five names of draft 0.5 §14 (CR4-30 §3.2) --------- */

  var TIERS = {
    certified:    'Certified',
    interpretive: 'Interpretive',
    confirmatory: 'Confirmatory',
    exploratory:  'Exploratory',
    limits:       'Limits',
  };

  function tierBadge(tier, note) {
    var s = document.createElement('span');
    s.className = 'cr-tier';
    s.setAttribute('data-tier', tier);
    text(s, TIERS[tier] || tier);
    if (note) { s.title = note; }
    return s;
  }

  /* ---- part 3: flags, at G3's three severities ---------------------- */

  var SEVERITY_ORDER = { stop: 0, caution: 1, note: 2 };

  function renderFlags(host, flags) {
    clear(host);
    if (!flags || !flags.length) {
      var none = document.createElement('p');
      none.className = 'cr-flag-none';
      text(none, 'No flags.');
      host.appendChild(none);
      return;
    }
    flags.slice().sort(function (a, b) {
      return (SEVERITY_ORDER[a.severity] === undefined ? 3 : SEVERITY_ORDER[a.severity])
           - (SEVERITY_ORDER[b.severity] === undefined ? 3 : SEVERITY_ORDER[b.severity]);
    }).forEach(function (f) {
      var d = document.createElement('div');
      d.className = 'cr-flag';
      d.setAttribute('data-severity', f.severity);
      var head = document.createElement('p');
      head.className = 'cr-flag-head';
      var sev = document.createElement('span');
      sev.className = 'cr-flag-sev';
      text(sev, (f.severity || '').toUpperCase());
      var code = document.createElement('code');
      text(code, f.code);
      head.appendChild(sev);
      head.appendChild(document.createTextNode(' '));
      head.appendChild(code);
      d.appendChild(head);
      var msg = document.createElement('p');
      text(msg, f.message);
      d.appendChild(msg);
      if (f.proposal) {
        var pr = document.createElement('p');
        pr.className = 'cr-flag-proposal';
        text(pr, f.proposal);
        d.appendChild(pr);
      }
      host.appendChild(d);
    });
  }

  /* ---- part 2: the one thing to look at ---------------------------- */

  /* AD 22 Oct item 9: round to 3 decimal places and print plain headings.
   * An unrounded float is noise, and `J k` or `unusable fit failed` is an
   * internal name a researcher has no reason to know. */
  function cell(v) {
    if (v === null || v === undefined || v === '') { return ''; }
    if (typeof v === 'object') { return JSON.stringify(v); }
    var n = (typeof v === 'number') ? v : (v !== '' && isFinite(v) ? Number(v) : null);
    if (n === null) { return String(v); }
    if (Number.isInteger(n)) { return String(n); }
    return n.toFixed(3);
  }

  var HEADINGS = {
    J_k: 'usable splits', pac: 'PAC', ci_low: 'interval low', ci_high: 'interval high',
    reproducibility: 'reproducibility', k: 'k', passed: 'passes the gate',
    evaluated: 'evaluated', splits: 'splits', concept: 'concept', frame: 'frame',
  };

  function heading(c) {
    return HEADINGS[c] || c.replace(/_/g, ' ');
  }

  /* AD 22 Oct item 11 and 9: a column empty on every row tells the reader
   * nothing, and an internal count that is zero on every row is noise. Both
   * are dropped here rather than printed blank; the export carries them. */
  function usefulColumns(rows) {
    var INTERNAL = ['unusable_fit_failed', 'unusable_too_few_positive'];
    return Object.keys(rows[0]).filter(function (c) {
      var anyValue = rows.some(function (r) {
        return r[c] !== null && r[c] !== undefined && r[c] !== '';
      });
      if (!anyValue) { return false; }
      if (INTERNAL.indexOf(c) !== -1) {
        return rows.some(function (r) { return Number(r[c]) > 0; });
      }
      return true;
    });
  }

  function tableFrom(rows, caption) {
    if (!rows || !rows.length) { return null; }
    var cols = usefulColumns(rows);
    var t = document.createElement('table');
    t.className = 'cr-table';
    if (caption) {
      var cap = document.createElement('caption');
      text(cap, caption);
      t.appendChild(cap);
    }
    var hr = t.createTHead().insertRow();
    cols.forEach(function (c) {
      var th = document.createElement('th');
      text(th, heading(c));
      hr.appendChild(th);
    });
    var body = t.createTBody();
    rows.slice(0, 200).forEach(function (r) {
      var tr = body.insertRow();
      cols.forEach(function (c) {
        var td = tr.insertCell();
        text(td, cell(r[c]));
      });
    });
    if (rows.length > 200) {
      var note = document.createElement('tfoot').insertRow().insertCell();
      note.colSpan = cols.length;
      text(note, rows.length + ' rows; the first 200 are shown. The export carries all of them.');
      t.appendChild(note.parentNode.parentNode);
    }
    return t;
  }

  function renderLookAt(host, step, rep) {
    clear(host);
    var look = rep.look_at || {};
    var any = false;

    Object.keys(look.tables || {}).forEach(function (name) {
      var spec = look.tables[name];
      var rows = spec.rows;
      // A table can come back as an object keyed by group (step 2's two).
      if (rows && !Array.isArray(rows)) {
        rows = Object.keys(rows).map(function (k) {
          var v = rows[k];
          return (v !== null && typeof v === 'object')
            ? Object.assign({ key: k }, v) : { key: k, value: v };
        });
      }
      var wrap = document.createElement('div');
      wrap.className = 'cr-look-block';
      var h = document.createElement('div');
      h.className = 'cr-look-title';
      text(h, name.replace(/_/g, ' '));
      // §4.7: every table on screen carries its tier. The opposition table
      // is served `interpretive` and is never certified, whatever the run's
      // cap allows -- the route fixes that, not this screen.
      if (spec.tier) { h.appendChild(tierBadge(spec.tier, spec.tier_is_fixed)); }
      wrap.appendChild(h);
      if (spec.no_opposition_at_k2) {
        var p = document.createElement('p');
        p.className = 'cr-look-empty';
        text(p, 'At k = 2 no opposition is reported.');
        wrap.appendChild(p);
      }
      /* AD 22 Oct item 5: step 1's reading is one row, and a one-row table
       * is a worse way to say it than a sentence. The look-at string
       * promises "how many cells counted as present, and the threshold that
       * decided it"; this is that sentence. */
      if (name === 'binarisation' && rows && rows.length === 1) {
        var b = rows[0];
        var sent = document.createElement('p');
        sent.className = 'cr-measure';
        text(sent,
          cell(b.cells_present) + ' of ' + cell(b.cells_total) + ' cells counted as present ('
          + (b.share_present === null || b.share_present === undefined
              ? '' : Math.round(b.share_present * 100) + '%')
          + '), at a threshold of ' + cell(b.threshold) + '.'
          + (b.normalised ? ' Values were normalised within each document first.' : ''));
        wrap.appendChild(sent);
      } else {
        var t = tableFrom(rows, null);
        if (t) { wrap.appendChild(t); }
      }

      /* AD 22 Oct item 8: eta-squared is reported every run, not only when
       * its Caution fires -- a reader needs the measure, not its absence. */
      if (spec.prevalence_eta2 !== undefined && spec.prevalence_eta2 !== null) {
        var eta = document.createElement('p');
        eta.className = 'cr-measure';
        text(eta, 'Prevalence across the frames: \u03b7\u00b2 = '
          + cell(spec.prevalence_eta2)
          + ' (a caution fires at ' + cell(spec.prevalence_eta2_caution) + ').'
          + (spec.check_arm_ari === null || spec.check_arm_ari === undefined ? ''
             : ' Main and check arms agree at ARI ' + cell(spec.check_arm_ari) + '.'));
        wrap.appendChild(eta);
      }

      /* AD 22 Oct item 7: a neighbouring k means nothing without what it does
       * to the frames, so R8's alternative is shown with its consequence. */
      if (spec.neighbouring_k && Object.keys(spec.neighbouring_k).length) {
        var nb = document.createElement('ul');
        nb.className = 'cr-governing';
        Object.keys(spec.neighbouring_k).forEach(function (key) {
          var n = spec.neighbouring_k[key];
          var li = document.createElement('li');
          var what = (n.affected || []).map(function (a) {
            return a.change === 'split' || a.becomes
              ? a.frame + ' splits into ' + (a.becomes || []).join(' and ')
              : (a.frames || []).join(' and ') + ' merge into ' + a.merge_into;
          }).join('; ');
          text(li, 'k = ' + n.k + ': ' + n.frames + ' frames — '
            + (what || 'the same concepts, regrouped'));
          nb.appendChild(li);
        });
        wrap.appendChild(nb);
      }
      if (!wrap.querySelector('table, p.cr-measure') && !spec.no_opposition_at_k2) {
        var e = document.createElement('p');
        e.className = 'cr-look-empty';
        text(e, 'Nothing to show for this corpus.');
        wrap.appendChild(e);
      }
      host.appendChild(wrap);
      any = true;
    });

    (look.figures || []).forEach(function (f) {
      var wrap = document.createElement('div');
      wrap.className = 'cr-look-block';
      var img = document.createElement('img');
      img.className = 'cr-figure';
      img.alt = f.name.replace(/_/g, ' ');
      img.src = window.G4.figureUrl(state.runId, f.name);
      img.loading = 'lazy';
      wrap.appendChild(img);
      host.appendChild(wrap);
      any = true;
    });

    if (!any) {
      var none = document.createElement('p');
      none.className = 'cr-look-empty';
      text(none, 'This step has no figure or table of its own.');
      host.appendChild(none);
    }
  }

  /* ---- part 4: the decision, G3's radio pattern -------------------- */

  function renderDecide(host, step, rep) {
    clear(host);
    var decisions = (rep.decide || []).filter(function (d) {
      // The register's questions. A parameter with no options to offer is
      // still recorded, but a radio group needs options from the method
      // strings, which are AD's and arrive sighted.
      return (M.decisions || {})[step];
    });
    var spec = (M.decisions || {})[step];
    if (!spec) {
      var none = document.createElement('p');
      none.className = 'cr-decide-none';
      text(none, 'No decision — continue.');
      host.appendChild(none);
      return;
    }
    var q = document.createElement('div');
    q.className = 'cr-decide-q';
    text(q, spec.prompt);
    host.appendChild(q);
    (spec.options || []).forEach(function (o) {
      var opt = document.createElement('div');
      opt.className = 'tmode-opt';          // G3's class, unchanged
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = 'decide-' + step;
      input.id = 'decide-' + step + '-' + o.value;
      input.value = o.value;
      if (o.isDefault) { input.checked = true; }
      var label = document.createElement('label');
      label.setAttribute('for', input.id);
      /* AD 22 Oct item 7: "Take the recommended k" does not say what k is.
       * The register's wording is AD's; the number is this run's, so it is
       * substituted rather than rewritten. */
      var labelText = o.label;
      var rec = (((state.reports[step] || {}).look_at || {}).tables || {});
      rec = (rec.by_k || {}).recommended_k;
      if (step === 4 && rec !== undefined && rec !== null && /recommended/i.test(o.label)) {
        labelText = o.label + ' — k = ' + rec;
      }
      text(label, labelText);
      var sub = document.createElement('span');
      sub.className = 'tmode-sub';          // G3's class, unchanged
      text(sub, o.consequence);
      label.appendChild(sub);
      opt.appendChild(input);
      opt.appendChild(label);
      host.appendChild(opt);
    });
  }

  function chosen(step) {
    var el = document.querySelector('input[name="decide-' + step + '"]:checked');
    return el ? el.value : null;
  }

  /* ---- rendering one card ------------------------------------------ */

  function renderCard(step) {
    var rep = state.reports[step];
    var body = $('s' + step + '-body');
    if (!body) { return; }
    clear(body);

    if (!rep) {
      var wait = document.createElement('p');
      wait.className = 'cr-waiting';
      text(wait, step === 0
        ? 'Upload a DTM to begin.'
        : 'Waiting for step ' + (step - 1) + '.');
      body.appendChild(wait);
      return;
    }

    // part 1 — what was done
    var done = document.createElement('div');
    done.className = 'cr-part';
    var dh = document.createElement('div');
    dh.className = 'cr-part-head';
    text(dh, 'What was done');
    done.appendChild(dh);
    var dp = document.createElement('p');
    dp.className = 'cr-done';
    // AD-sighted prose where it exists; the route's purpose otherwise, so a
    // card is never blank while method_strings is unsighted.
    text(dp, ((M.steps || {})[step] || {}).did || rep.done.purpose);
    done.appendChild(dp);
    body.appendChild(done);

    // part 2 — the one thing to look at
    var look = document.createElement('div');
    look.className = 'cr-part';
    var lh = document.createElement('div');
    lh.className = 'cr-part-head';
    text(lh, 'The one thing to look at');
    look.appendChild(lh);
    if ((M.lookAt || {})[step]) {
      var ls = document.createElement('p');
      ls.className = 'cr-look-sub';
      text(ls, M.lookAt[step]);
      look.appendChild(ls);
    }
    var lookHost = document.createElement('div');
    renderLookAt(lookHost, step, rep);
    look.appendChild(lookHost);
    body.appendChild(look);

    /* AD 22 Oct item 10: each report shows the values that governed it, with
     * the provisional ones marked. The mark comes from the published table,
     * so a value cannot read as settled here while GET /config calls it
     * provisional. */
    var governing = (rep.done && rep.done.parameters) || [];
    if (governing.length) {
      var gov = document.createElement('div');
      gov.className = 'cr-part';
      var gh = document.createElement('div');
      gh.className = 'cr-part-head';
      text(gh, 'The values that governed this step');
      gov.appendChild(gh);
      var ul = document.createElement('ul');
      ul.className = 'cr-governing';
      governing.forEach(function (g) {
        var li = document.createElement('li');
        var nm = document.createElement('code');
        text(nm, g.name);
        li.appendChild(nm);
        li.appendChild(document.createTextNode(' = ' + cell(g.value)));
        if (g.provisional) {
          var pv = document.createElement('span');
          pv.className = 'cr-provisional';
          text(pv, 'provisional');
          li.appendChild(pv);
        }
        if (g.note) { li.title = g.note; }
        ul.appendChild(li);
      });
      gov.appendChild(ul);
      body.appendChild(gov);
    }

    // part 3 — flags
    var flags = document.createElement('div');
    flags.className = 'cr-part';
    var fh = document.createElement('div');
    fh.className = 'cr-part-head';
    text(fh, 'Flags');
    flags.appendChild(fh);
    var flagHost = document.createElement('div');
    renderFlags(flagHost, rep.flags);
    flags.appendChild(flagHost);
    body.appendChild(flags);

    // part 4 — the decision
    var decide = document.createElement('div');
    decide.className = 'cr-part';
    var dch = document.createElement('div');
    dch.className = 'cr-part-head';
    text(dch, 'Your decision');
    decide.appendChild(dch);
    var decideHost = document.createElement('div');
    renderDecide(decideHost, step, rep);
    decide.appendChild(decideHost);
    body.appendChild(decide);

    /* AD 22 Oct item 2. The cap sentence says the run "passes the
     * reproducibility gate"; at steps 0-3 no gate has been computed, so it
     * was false on four cards out of five. Shown only where tiers exist
     * (step 4 onward, which the route states) and only once a k has actually
     * passed -- both conditions, because either alone still lies somewhere. */
    var tiersHere = rep.tier
      && step >= (rep.tier.tiers_exist_from_step === undefined ? 4 : rep.tier.tiers_exist_from_step)
      && rep.tier.gate_passed;
    if (tiersHere && rep.tier.run_cap) {
      var cap = document.createElement('p');
      cap.className = 'cr-cap';
      cap.appendChild(tierBadge(rep.tier.run_cap));
      var reasons = (rep.tier.cap_reasons || []).map(function (r) { return r.reason; });
      var sp = document.createElement('span');
      text(sp, reasons.length ? ' ' + reasons.join(' ') : ' the strongest tier this run may claim');
      cap.appendChild(sp);
      body.appendChild(cap);
    }

    // the controls
    var controls = document.createElement('p');
    controls.className = 'cr-controls';
    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'cr-btn';
    next.id = 's' + step + '-next';
    if (step >= 8) {
      next.disabled = true;
      text(next, 'The analysis is complete');
    } else {
      text(next, 'Run step ' + (step + 1));
      next.onclick = function () { runStep(step + 1); };
    }
    controls.appendChild(next);

    /* AD 22 Oct item 12, and §4.5: "Back starts a new numbered run, and the
     * run history is visible." It did not exist -- AD looked for it and found
     * nothing. Back from a step re-runs the analysis from there under a new
     * run id, so the earlier run stays whole and both are in the history;
     * decision register §1.4 requires exactly that, and it is why a run is
     * numbered at all. */
    if (step > 0 && state.runId) {
      var back = document.createElement('button');
      back.type = 'button';
      back.className = 'cr-btn ghost';
      back.id = 's' + step + '-back';
      text(back, 'Back to step ' + (step - 1));
      back.onclick = function () { goBack(step - 1); };
      controls.appendChild(back);
    }

    if (step > SIGNED_THROUGH) {
      // Stage 3 signs screens 0-4; these are stage 4's and nobody has signed
      // them yet. Said on the card rather than hidden behind a disabled
      // button, which is what stopped a run mid-analysis.
      var unsigned = document.createElement('span');
      unsigned.className = 'cr-unsigned';
      text(unsigned, 'This screen is not yet signed off.');
      controls.appendChild(unsigned);
    }
    body.appendChild(controls);
  }

  /* ---- running a step ---------------------------------------------- */

  function paramsFor(step) {
    var p = {};
    var fixed = state.fixed[step] || {};
    Object.keys(fixed).forEach(function (k) { p[k] = fixed[k]; });
    if (step === 0) {
      if (state.upload) {
        p.upload_id = state.upload.upload_id;
        p.roles = state.upload.proposed_roles;
        p.covariate_types = state.upload.proposed_covariate_types;
      }
      var vt = $('value-type');
      if (vt) { p.value_type = vt.value; }
    }
    // The researcher's answer, where the register offers one. Never a
    // numeric threshold: the register's own rule.
    var answer = chosen(step);
    if (step === 3 && answer === 'exclude') { p.exclude_low_signal = true; }
    if (step === 4 && answer === 'choose') {
      var sel = $('k-choice');
      if (sel) { p.k = Number(sel.value); }
    }
    return p;
  }

  async function runStep(step) {
    var btn = $('s' + (step - 1) + '-next');
    if (btn) { btn.disabled = true; }
    status(step, 'running…');
    var began = Date.now();
    try {
      var out = await window.G4.runStep(ORDER[step], {
        run_id: state.runId,
        corpus_id: state.runId,
        params: paramsFor(step),
      }, {
        idempotencyKey: state.runId + ':' + step + ':' + began,
        onTick: function () {
          status(step, 'running… ' + Math.round((Date.now() - began) / 1000) + 's');
        },
      });
      state.reports[step] = await window.G4.report(state.runId, step);
      state.furthest = Math.max(state.furthest, step);
      status(step, 'done in ' + out.result.seconds + 's');
      renderCard(step);
      $('s' + step + '-card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
      status(step, 'stopped');
      if (err.flags && err.flags.length) {
        // A method Stop is flags, not a message.
        state.reports[step] = { done: { purpose: '' }, look_at: {}, flags: err.flags,
                                decide: [], tier: {} };
        renderCard(step);
      } else {
        fail(err);
      }
    } finally {
      if (btn) { btn.disabled = false; }
    }
  }

  /* Back: a new numbered run from the step chosen, with the earlier run kept
   * whole. §4.5 and decision register §1.4. The run history is the list of
   * runs the server already keeps; nothing is discarded, so a reader can see
   * how many paths were tried -- which is the point of numbering them. */
  async function goBack(step) {
    if (!state.upload) {
      fail(new Error('the uploaded file is needed to start a new run; upload it again'));
      return;
    }
    try {
      status(step, 'starting a new run…');
      var run = await window.G4.createRun(
        (state.upload.name || 'corpus').replace(/\.[a-z0-9]+$/i, '')
          .replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-+|-+$/g, '') || 'corpus',
        'back:' + Date.now());
      var previous = state.runId;
      state.runId = run.run_id;
      state.reports = {};
      state.furthest = -1;
      text($('run-id'), run.run_id);
      $('run-export').href = window.G4.exportUrl(run.run_id);
      for (var i = 0; i <= 8; i += 1) { renderCard(i); }
      status(0, 'new run ' + run.run_id + ' — the previous run ' + previous + ' is kept');
      // Re-run from step 0, since every step reads the one before it.
      await runStep(0);
      for (var j = 1; j <= step; j += 1) { await runStep(j); }
    } catch (err) {
      fail(err);
    }
  }

  /* ---- step 0's upload, on G3's drop zone -------------------------- */

  async function loadDTM(file) {
    try {
      status(0, 'reading…');
      state.upload = await window.G4.upload(file);
      text($('dtm-stats'),
        state.upload.rows + ' rows · ' + state.upload.columns.length + ' columns · sha256 '
        + String(state.upload.sha256).slice(0, 12));
      var run = await window.G4.createRun(
        (state.upload.name || 'corpus').replace(/\.[a-z0-9]+$/i, '')
          .replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-+|-+$/g, '') || 'corpus',
        'new-run:' + Date.now());
      state.runId = run.run_id;
      state.reports = {};
      state.furthest = -1;
      text($('run-id'), run.run_id);
      $('run-export').href = window.G4.exportUrl(run.run_id);
      $('run-export').hidden = false;
      status(0, 'uploaded — run ' + run.run_id);
      await runStep(0);
    } catch (err) {
      status(0, 'failed');
      fail(err);
    }
  }

  /* ---- boot --------------------------------------------------------- */

  async function boot() {
    await loadConfig();
    for (var i = 0; i <= 8; i += 1) { renderCard(i); }

    var zone = $('dtm-zone');
    var input = $('dtm-file');
    if (input) {
      input.addEventListener('change', function (e) {
        if (e.target.files[0]) { loadDTM(e.target.files[0]); }
      });
    }
    if (zone) {
      // G3's drag-and-drop, unchanged.
      zone.addEventListener('dragover', function (e) {
        e.preventDefault(); zone.classList.add('drag-over');
      });
      zone.addEventListener('dragleave', function () { zone.classList.remove('drag-over'); });
      zone.addEventListener('drop', function (e) {
        e.preventDefault();
        zone.classList.remove('drag-over');
        if (e.dataTransfer.files[0]) { loadDTM(e.dataTransfer.files[0]); }
      });
    }

    // The sighting gate. method_strings.js carries its own status; until AD
    // has sighted it the page says so rather than showing unsighted prose
    // quietly (Charter §2.3).
    if (M.sighted !== true) {
      var banner = $('method-unsighted');
      if (banner) { banner.hidden = false; }
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})();
