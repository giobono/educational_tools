/* g4_api.js — this app's own API client.
 *
 * WHY NOT edu_common.js's callAppAPI. That helper hardcodes `/v1/${appId}/`,
 * and G4 is on `/v2/corres/`. Widening it would mean editing a file four
 * apps share, and G3 is fenced: "G3 must keep running, untouched." So G4
 * carries its own client and leaves the shared one alone. The cost is some
 * duplication; the alternative risks a live app.
 *
 * ONE OBSERVATION, NOT FIXED HERE. edu_common.js mints a fresh random
 * idempotency key per call and says it "protects against a double-submit
 * (e.g. a stray double-click)". It cannot: two clicks make two calls, two
 * keys and two tasks. Reported to OD rather than changed, because the file
 * is G3's. G4 does not rely on the key for that: a second POST while a step
 * is running on a run answers 409 with the live task id (OD ruling §2.2),
 * which is the protection that actually holds.
 */

(function () {
  'use strict';

  function base() {
    const cfg = window.CORRES_CONFIG;
    if (!cfg || !cfg.apiBase) {
      throw new Error('CORRES_CONFIG not loaded — check config.js is deployed');
    }
    return cfg.apiBase;
  }

  function newId() {
    return (crypto.randomUUID && crypto.randomUUID()) ||
           (Date.now() + '-' + Math.random().toString(36).slice(2));
  }

  async function parseError(res) {
    let detail = null;
    try { detail = (await res.json()).detail; } catch (e) { /* not JSON */ }
    const err = new Error(
      typeof detail === 'string' ? detail :
      (detail && detail.message) || `${res.status} ${res.statusText}`
    );
    err.status = res.status;
    err.detail = detail;
    return err;
  }

  async function get(path) {
    const res = await fetch(`${base()}/v2/corres${path}`);
    if (!res.ok) throw await parseError(res);
    return res.json();
  }

  /* One idempotency key per USER ACTION, supplied by the caller — OD ruling
   * §2.2. A caller that reuses a key on a retry gets the same task back; a
   * caller that wants a genuine re-run passes a new one. */
  async function post(path, body, idempotencyKey) {
    const res = await fetch(`${base()}/v2/corres${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': newId(),
        ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  }

  async function upload(file) {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${base()}/v2/corres/uploads`, {
      method: 'POST', body: form, headers: { 'X-Request-Id': newId() },
    });
    if (!res.ok) throw await parseError(res);
    return res.json();
  }

  /* Poll one task to a terminal state.
   *
   * Every step route answers 202 with a task_id (OD ruling §2.3), so this is
   * the only way a result is obtained. A failed task's error carries the
   * method's flags, so a Stop is surfaced as flags rather than as a bare
   * message. */
  async function awaitTask(taskId, { onTick, intervalMs = 1000 } = {}) {
    for (;;) {
      const task = await get(`/tasks/${taskId}`);
      if (onTick) onTick(task);
      if (task.state === 'succeeded') return task.result;
      if (task.state === 'failed') {
        const e = task.error || {};
        const err = new Error(e.detail || 'the step did not complete');
        err.code = e.code;
        err.flags = e.flags || [];
        err.stopped = !!e.stopped;
        throw err;
      }
      if (task.state === 'cancelled') {
        const err = new Error('The step was cancelled.');
        err.code = 'cancelled';
        throw err;
      }
      await new Promise(r => setTimeout(r, intervalMs));
    }
  }

  /* Run one step and wait for it. `onTick` fires on every poll, which is how
   * the page shows a slow step is alive: step 6 is about five minutes on a
   * 5,000-document corpus, and the API answers throughout. */
  async function runStep(name, body, { onTick, idempotencyKey } = {}) {
    const started = await post(`/${name}`, body, idempotencyKey);
    return { task: started, result: await awaitTask(started.task_id, { onTick }) };
  }

  window.G4 = {
    get, post, upload, awaitTask, runStep,
    steps:            () => get('/steps'),
    config:           () => get('/config'),
    artefactContract: () => get('/artefact-contract'),
    runs:             () => get('/runs'),
    run:              (id) => get(`/runs/${id}`),
    artefact:         (id, slot) => get(`/runs/${id}/artefacts/${slot}`),
    createRun:        (corpusId, key) => post('/runs', { corpus_id: corpusId }, key),
    cancel:           (taskId) => post(`/tasks/${taskId}/cancel`, {}),
  };
})();
