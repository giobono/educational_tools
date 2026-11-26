// pluralitie: the frames, defined and discussed (26 Nov 2026).
//
// The page's whole job: open a finished CorRes run as a session on artie,
// show the evidence artie counted from the run's matrix, ask for the drafted
// definitions, carry the conversation on each frame, and record what the
// researcher accepts. Every count and every word of a draft comes from the
// server; nothing is computed here.
//
// The two calls that reach a model go through callAppAPI and pollTask, the
// route sanzognie takes: sign-in, the Terms, the hold and the stop are
// metering.js's, unchanged.
(function () {
  'use strict';

  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const pct = x => `${Math.round((x || 0) * 100)}%`;
  const api = path => `${window.CORRES_CONFIG.apiBase}/v1/pluralitie/${path}`;

  let session = null;
  let busy = false;

  function showError(msg) { const b = $('pl-error'); b.textContent = msg; b.style.display = 'block'; b.scrollIntoView({ block: 'center' }); }
  function clearError() { $('pl-error').style.display = 'none'; }

  // An error from a call: the stop, capacity and account states are shown by
  // metering.js; anything else is said plainly here.
  function failed(err) {
    if (window.ArtieMetering && window.ArtieMetering.handled(err)) return;
    showError(err && err.code ? `That did not complete: ${err.message}`
      : 'There is a connection issue preventing access to the back end code. Please try again later.');
  }

  async function get(path) { return (await _crRequest(api(path), { method: 'GET' })).json(); }
  async function post(path, body) {
    return (await _crRequest(api(path), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })).json();
  }

  // ── Step 1: open ───────────────────────────────────────────────────────
  async function listSamples() {
    try {
      const samples = await get('sources');
      $('pl-samples').innerHTML = samples.map(s => `
        <div class="pl-sample">
          <div><strong>${esc(s.title)}</strong>
          <span class="pl-sample-sub">stored CorRes result, computed ${esc((s.stored.computed || '').slice(0, 10))} · ${esc(s.stored.documents)} documents, ${esc(s.stored.concepts)} concepts</span></div>
          <button class="btn btn-primary" data-sample="${esc(s.id)}">Open this analysis →</button>
        </div>`).join('');
      $('pl-samples').querySelectorAll('button').forEach(b => {
        b.onclick = () => openSession({ sample: b.dataset.sample });
      });
    } catch (err) { failed(err); }
  }

  async function openSession(body) {
    if (busy) return; busy = true; clearError();
    try {
      session = await post('sessions', body);
      const url = new URL(window.location.href);
      url.search = `?session=${session.session_id}`;
      window.history.replaceState(null, '', url);
      render();
    } catch (err) { failed(err); } finally { busy = false; }
  }

  async function resume(id) {
    try { session = await get(`sessions/${id}`); render(); }
    catch (err) { if (err.status === 404) { window.history.replaceState(null, '', window.location.pathname); listSamples(); } else failed(err); }
  }

  // ── Rendering ──────────────────────────────────────────────────────────
  const CLASS_LABEL = {
    distinguishing: 'marks this frame out', bridging_candidate: 'shared with another frame',
    method_contingent: 'depends on the grouping method', diffuse: 'weakly placed',
    outside_support: 'too rare to place',
  };

  function recap() {
    const ev = session.evidence, src = session.source;
    const frames = ev.frames.map(f => `<li><strong>${esc(f.name)}</strong> — ${f.members.length} concept${f.members.length === 1 ? '' : 's'}, carried by ${f.documents_carrying} documents</li>`).join('');
    const checks = (ev.checks_done || []).length
      ? `Checks already run in CorRes: ${ev.checks_done.map(c => esc(c.replace(/_/g, ' '))).join(', ')}.`
      : 'No further checks have been run in CorRes on this analysis yet.';
    $('pl-choose').style.display = 'none';
    $('pl-recap').style.display = '';
    $('pl-recap').innerHTML = `
      <div class="pl-recap-head"><strong>${esc(ev.corpus)}</strong>
        <span class="pl-sample-sub">${src.kind === 'stored_sample' ? `stored CorRes result (${esc(src.description || '')})` : `CorRes analysis ${esc(ev.run_id)}`}</span></div>
      <div class="pl-stats">
        <div class="pl-stat"><span class="pl-stat-val">${ev.documents}</span><span class="pl-stat-label">documents</span></div>
        <div class="pl-stat"><span class="pl-stat-val">${ev.concepts}</span><span class="pl-stat-label">concepts</span></div>
        <div class="pl-stat"><span class="pl-stat-val">${ev.frames.length}</span><span class="pl-stat-label">frames found by CorRes</span></div>
        <div class="pl-stat"><span class="pl-stat-val">${ev.unplaced.length}</span><span class="pl-stat-label">concepts in no frame</span></div>
      </div>
      <ul class="pl-recap-frames">${frames}</ul>
      <p class="pl-aside">${checks} The frames, their concepts and each concept's place are CorRes's findings. Nothing here changes them.
        <a href="/apps/pluralitie/">Open a different analysis</a></p>`;
  }

  function chips(members) {
    return members.map(m => `<span class="pl-chip ${m.class === 'distinguishing' ? 'pl-chip-cert' : 'pl-chip-uncert'}"
      title="${esc(CLASS_LABEL[m.class] || m.class)}${m.towards ? `, towards ${esc(m.towards)}` : ''} · in ${m.documents} documents">
      ${esc(m.concept)}<span class="pl-chip-meta">${pct(m.share_of_corpus)}</span></span>`).join('');
  }

  function evidenceCard(f) {
    const by = cls => f.members.filter(m => m.class === cls);
    const groups = Object.keys(CLASS_LABEL).map(cls => by(cls).length
      ? `<div class="pl-frame-sub">${esc(CLASS_LABEL[cls])} — ${by(cls).length}</div><div class="pl-chips">${chips(by(cls))}</div>` : '').join('');
    const pairs = f.strongest_pairs.filter(p => p.documents_with_both).slice(0, 4).map(p =>
      `<li><span class="pl-doc-id">${esc(p.concepts[0])} + ${esc(p.concepts[1])}</span><span class="pl-doc-score">together in ${p.documents_with_both} documents${p.lift ? ` · ${p.lift}× chance` : ''}</span></li>`).join('');
    const meets = f.meets_other_frames.map(o =>
      `<li><span class="pl-doc-id">with ${esc(o.frame)}</span><span class="pl-doc-score">${o.documents_carrying_both} documents carry both (${pct(o.share_of_this_frames_documents)} of this frame's)</span></li>`).join('');
    const docs = f.typical_documents.map(t =>
      `<li><span class="pl-doc-id">${esc(t.label || t.document)}</span><span class="pl-doc-score">${t.carries.length} of ${t.of_members} concepts${t.also_carries_from_other_frames.length ? ` · also ${t.also_carries_from_other_frames.length} from other frames` : ' · none from other frames'}</span></li>`).join('');
    return `<div class="pl-frame">
      <div class="pl-frame-head"><span class="pl-frame-num">${esc(f.id)}</span><h3 class="pl-frame-name">${esc(f.name)}</h3></div>
      <p class="pl-frame-desc">Carried by ${f.documents_carrying} documents, ${pct(f.share_of_corpus)} of the corpus; ${f.documents_carrying_only_this_frame} carry this frame and no other.</p>
      ${groups}
      ${pairs ? `<div class="pl-frame-sub">Concepts that travel together</div><ul class="pl-docs">${pairs}</ul>` : ''}
      ${meets ? `<div class="pl-frame-sub">Where it meets the other frames</div><ul class="pl-docs">${meets}</ul>` : ''}
      ${docs ? `<div class="pl-frame-sub">Documents to read first</div><ul class="pl-docs">${docs}</ul>` : ''}
    </div>`;
  }

  function frameCard(f) {
    const fr = session.frames[f.id];
    const d = fr.definition || {};
    const draft = (session.drafts || {})[f.id] || {};
    const list = (xs, cls) => (xs && xs.length) ? `<ul class="${cls}">${xs.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
    const turns = fr.conversation.map((t, i) => {
      const last = i === fr.conversation.length - 1;
      const p = t.proposed;
      const proposal = p ? `<div class="pl-proposal">
          <div class="pl-frame-sub">Proposed revision</div>
          <p><strong>${esc(p.name)}</strong>. ${esc(p.definition)}</p>
          ${p.why ? `<p class="pl-aside">${esc(p.why)}</p>` : ''}
          ${last ? `<button class="btn btn-primary pl-accept" data-frame="${esc(f.id)}" data-turn="${i}">Accept this definition</button>
                    <span class="pl-actions-note">or carry on the conversation to leave it</span>` : ''}
        </div>` : '';
      return `<div class="pl-turn pl-turn-${t.who}"><span class="pl-turn-who">${t.who === 'researcher' ? 'You' : 'pluralitie'}</span><div class="pl-turn-text">${esc(t.text)}</div>${proposal}</div>`;
    }).join('');
    const earlier = fr.accepted.length ? `<details class="pl-earlier"><summary>${fr.accepted.length} earlier definition${fr.accepted.length === 1 ? '' : 's'}</summary>
      ${fr.accepted.map(a => `<p><strong>${esc(a.name)}</strong>. ${esc(a.definition)} <span class="pl-aside">(${esc(a.by)})</span></p>`).join('')}</details>` : '';
    return `<div class="pl-frame" id="frame-${esc(f.id)}">
      <div class="pl-frame-head"><span class="pl-frame-num">${esc(f.id)}</span><h3 class="pl-frame-name">${esc(d.name || f.name)}</h3>
        <span class="pl-by">${esc(d.by || '')}</span></div>
      <p class="pl-definition">${esc(d.definition || '')}</p>
      ${earlier}
      <details class="pl-edit"><summary>Rewrite this definition yourself</summary>
        <input class="pl-input pl-edit-name" data-frame="${esc(f.id)}" maxlength="80" type="text" value="${esc(d.name || f.name)}"/>
        <textarea class="pl-input pl-edit-def" data-frame="${esc(f.id)}" rows="3">${esc(d.definition || '')}</textarea>
        <button class="btn btn-outline pl-save" data-frame="${esc(f.id)}">Save my definition</button>
      </details>
      ${draft.discussion ? `<div class="pl-frame-sub">The evidence, discussed (first draft)</div><p class="pl-frame-desc">${esc(draft.discussion)}</p>` : ''}
      ${draft.distinct_from ? `<div class="pl-frame-sub">Distinct from the other frames</div><p class="pl-frame-desc">${esc(draft.distinct_from)}</p>` : ''}
      ${draft.meets ? `<div class="pl-frame-sub">Where it meets them</div><p class="pl-frame-desc">${esc(draft.meets)}</p>` : ''}
      ${(draft.questions || []).length ? `<div class="pl-frame-sub">Questions to take to your documents</div>${list(draft.questions, 'pl-questions')}` : ''}
      ${(draft.cautions || []).length ? `<div class="pl-warn"><strong>What the evidence cannot support</strong>${list(draft.cautions, 'pl-cautions')}</div>` : ''}
      <div class="pl-frame-sub">Conversation</div>
      <div class="pl-convo">${turns || '<p class="pl-aside">Nothing said yet. Tell it what you found when you read the documents, or ask why it defined the frame this way.</p>'}</div>
      <div class="pl-say">
        <textarea class="pl-input pl-message" data-frame="${esc(f.id)}" maxlength="4000" placeholder="What did you find? Agree, disagree, or ask." rows="2"></textarea>
        <button class="btn btn-primary pl-send" data-frame="${esc(f.id)}">Send</button>
      </div>
    </div>`;
  }

  function render() {
    recap();
    const ev = session.evidence;
    $('card-evidence').style.display = '';
    $('pl-evidence').innerHTML = ev.frames.map(evidenceCard).join('')
      + (ev.unplaced.length ? `<p class="pl-aside">In no frame: ${ev.unplaced.map(u => esc(u.concept)).join(', ')}.</p>` : '');
    $('card-define').style.display = '';
    const drafted = !!session.drafts;
    $('pl-define-btn').textContent = drafted ? 'Draft them again from the evidence' : 'Draft a definition of each frame →';
    $('pl-define-btn').className = drafted ? 'btn btn-outline' : 'btn btn-primary';
    $('card-frames').style.display = drafted ? '' : 'none';
    $('card-export').style.display = drafted ? '' : 'none';
    if (drafted) { $('pl-frames').innerHTML = ev.frames.map(frameCard).join(''); wire(); }
    runsOn();
  }

  // ── Steps 3 and 4: the two metered calls, and what the researcher accepts ──
  async function metered(path, body) {
    const created = await callAppAPI('pluralitie', path, body);
    return pollTask('pluralitie', created.task_id);
  }

  async function defineFrames() {
    if (busy) return; busy = true; clearError();
    $('pl-define-btn').disabled = true; $('pl-defining').style.display = '';
    try {
      await metered('frames/define', { session_id: session.session_id });
      session = await get(`sessions/${session.session_id}`);
      render();
      $('card-frames').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) { failed(err); }
    finally { busy = false; $('pl-define-btn').disabled = false; $('pl-defining').style.display = 'none'; }
  }

  async function send(frameId, btn) {
    const box = document.querySelector(`.pl-message[data-frame="${frameId}"]`);
    const message = box.value.trim();
    if (!message || busy) return; busy = true; clearError();
    btn.disabled = true; btn.textContent = 'Thinking…';
    try {
      await metered('frames/discuss', { session_id: session.session_id, frame_id: frameId, message });
      session = await get(`sessions/${session.session_id}`);
      render();
      const card = $(`frame-${frameId}`); if (card) card.querySelector('.pl-say').scrollIntoView({ block: 'center' });
    } catch (err) { failed(err); btn.disabled = false; btn.textContent = 'Send'; }
    finally { busy = false; }
  }

  async function accept(frameId, name, definition, by) {
    if (busy) return; busy = true; clearError();
    try {
      session = await post(`sessions/${session.session_id}/accept`, { frame_id: frameId, name, definition, by });
      render();
    } catch (err) { failed(err); } finally { busy = false; }
  }

  function wire() {
    document.querySelectorAll('.pl-send').forEach(b => { b.onclick = () => send(b.dataset.frame, b); });
    document.querySelectorAll('.pl-accept').forEach(b => {
      b.onclick = () => {
        const p = session.frames[b.dataset.frame].conversation[Number(b.dataset.turn)].proposed;
        accept(b.dataset.frame, p.name, p.definition, 'accepted proposal');
      };
    });
    document.querySelectorAll('.pl-save').forEach(b => {
      b.onclick = () => {
        const f = b.dataset.frame;
        const name = document.querySelector(`.pl-edit-name[data-frame="${f}"]`).value.trim();
        const def = document.querySelector(`.pl-edit-def[data-frame="${f}"]`).value.trim();
        if (name && def) accept(f, name, def, 'researcher');
      };
    });
  }

  async function exportReport() {
    clearError();
    try {
      const res = await _crRequest(api(`sessions/${session.session_id}/export`), { method: 'GET' });
      window.downloadBlob(`pluralitie_frames_${window.today()}.md`, await res.text(), 'text/markdown');
    } catch (err) { failed(err); }
  }

  // ── What this runs on (OD's brief of 26 Nov, §2.5) ─────────────────────
  let about = null, front = null;
  async function runsOn() {
    try {
      if (!about) about = await (await fetch(api('about'))).json();
      if (!front) front = await (await fetch('version.php', { cache: 'no-store' })).json();
    } catch (e) { /* shown as unknown below */ }
    const called = session && session.model;
    $('pl-runs-on').textContent = `Runs on artie ${(about && about.artie_commit) || 'unknown'} · educational_tools ${(front && front.commit) || 'unknown'} · model ${called || (about && about.model) || 'unknown'}${called ? ' (called in this session)' : ' (none called yet)'}`;
  }

  document.addEventListener('DOMContentLoaded', () => {
    $('pl-define-btn').onclick = defineFrames;
    $('pl-export-btn').onclick = exportReport;
    $('pl-open-run').onclick = () => { const v = $('pl-run-id').value.trim(); if (v) openSession({ run_id: v }); };
    const q = new URLSearchParams(window.location.search);
    // Arriving from CorRes with ?run=<id> opens that analysis at once; a
    // return from sign-in or a reload resumes the session in the address.
    if (q.get('session')) resume(q.get('session'));
    else if (q.get('run')) openSession({ run_id: q.get('run') });
    else listSamples();
    runsOn();
  });
})();
