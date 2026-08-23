/* ============================================================================
 * cr-common.js
 *
 * Shared JavaScript utilities for the Correlating Resonance phase pages.
 * Loaded after config.js, before any page-specific <script> block.
 *
 * Organisation: this file is sectioned by Stage 3 migration destination.
 * When the JS → Python migration happens, each section is moved (or stays)
 * as a unit. Read the section headers as a migration manifest.
 *
 *   §A  PLATFORM-BINDING            — stays browser-side (per contract §6)
 *   §B  FILE I/O                    — stays until §16 file-services lands
 *   §C  ARTEFACT I/O (CSV)          — stays browser-side (the §11.1 boundary)
 *   §D  UI UTILITIES                — stays browser-side
 *   §E  STAGE 3 RETIREMENT          — current technical debt against §6;
 *                                     disappears when platform parsing ships
 *
 * Globals introduced by this file (intentional, used by page scripts):
 *   CR_MODEL, callAPI, pollTask, friendlyTaskError, readFile, sanitiseText,
 *   csvCell, downloadBlob, today, assignConceptIds, formatBytes,
 *   escHtml, showError, clearError
 *
 * Globals expected to exist before this script runs:
 *   window.CORRES_CONFIG (from config.js)
 *   window.pdfjsLib      (from the pdf.js CDN script tag)
 * ============================================================================ */


/* ============================================================================
 * §A  PLATFORM-BINDING — stays browser-side
 *
 * The thin client over the platform LLM endpoint. Per contract §6 the
 * platform abstraction is the only path to the provider; per §6.1 the
 * platform holds the credentials. Per §6 the model registry will eventually
 * replace pinned_model with task-semantic selection (Q6b); for now we pin.
 *
 * Stage 3 will change three things about this section, none of which alter
 * its location:
 *   1. callAPI gains a `task` parameter and calls the registry instead of
 *      passing pinned_model (or in addition to it for academic reproduction).
 *   2. callAPI returns parsed objects rather than raw text once the platform
 *      structured-output parsing layer ships (retires §E below).
 *   3. The endpoint path changes per app (/v1/gioianie/, /v1/sanzognie/, etc.)
 *      once the four-app split is provisioned.
 * ============================================================================ */

// Pinned model identifier. Will become a fallback / explicit-pin escape hatch
// once the registry ships (contract §6, paragraph on identifier pinning).
window.CR_MODEL = 'claude-sonnet-5';

// Single-sourced graceful copy for structured errors the platform's LLM
// abstraction can return (billing ceiling brief v1.1 §2.2/§2.4:
// SpendCeilingReached / RateLimitExceeded, surfaced as
// artie_platform.llm.errors.AT_CAPACITY_ERROR / rate_limit_error()). Lives
// here, once, rather than per-page: every existing `catch (err) {
// showError(err.message) }` call site across the four apps gets this text
// automatically, with no page-level changes — the CL19 single-sourcing
// the brief asks for. Codes not in this map fall through to the raw
// technical detail unchanged (this only softens the two capacity-related
// cases, not general error UX).
//
// response_truncated added 14 Jul 2026 (artie_platform.llm.errors.
// ResponseTruncated / response_truncated_error()) — a live finding that a
// model response cut off mid-generation could previously look like a
// generic parse failure, or worse, silently produce an incomplete-but-
// valid-looking result. Now raised loudly with its own code; this is the
// researcher-facing translation of it.
const CR_FRIENDLY_ERROR_MESSAGES = {
  service_at_capacity: 'The service is temporarily at capacity. Please try again in a few minutes.',
  rate_limit_exceeded: 'Too many requests right now — please wait a moment and try again.',
  response_truncated: 'The response was too large to complete in one step. This usually means the corpus or document set is too large for the current limits — try a smaller batch, or flag this to the project team.',
};

// Shared response-error parsing for callAPI/callAppAPI — one implementation,
// not two copies of the same detail/code extraction logic.
async function _crParseApiError(res) {
  let detail = res.statusText;
  let code = `http_${res.status}`;
  try {
    const err = await res.json();
    code = err?.detail?.code || err?.error?.code || code;
    detail = err?.detail?.message || err?.error?.message || detail;
  } catch (_) { /* keep statusText */ }

  const friendly = CR_FRIENDLY_ERROR_MESSAGES[code];
  const error = new Error(friendly || `API error ${res.status}: ${detail}`);
  error.code = code;
  error.status = res.status;
  return error;
}

/**
 * Call the platform LLM endpoint and return the response text.
 *
 * @param {string} system    System prompt
 * @param {string} user      User message
 * @param {number} maxTokens Max output tokens (default 4096)
 * @returns {Promise<string>} Response text (raw — parsing is the caller's
 *                            responsibility until §E retires; see §6)
 */
window.callAPI = async function callAPI(system, user, maxTokens = 4096) {
  const cfg = window.CORRES_CONFIG;
  if (!cfg || !cfg.apiBase) {
    throw new Error('CORRES_CONFIG not loaded — check config.js is deployed');
  }

  const requestId = (crypto.randomUUID && crypto.randomUUID()) ||
                    (Date.now() + '-' + Math.random().toString(36).slice(2));

  const res = await fetch(`${cfg.apiBase}/v1/corres/llm/messages`, {
    method: 'POST',
    headers: {
      'Content-Type':  'application/json',
      'X-Request-Id':  requestId,
    },
    body: JSON.stringify({
      system,
      user,
      max_tokens:   maxTokens,
      pinned_model: window.CR_MODEL,
    }),
  });

  if (!res.ok) {
    throw await _crParseApiError(res);
  }

  const data = await res.json();
  return data.text;
};

// §A — App-specific endpoint helper
//
// POSTs body to ${cfg.apiBase}/v1/${appId}/${path} and returns the parsed
// JSON response. Errors thrown carry .code and .status for callers that
// need machine-readable error handling.
//
// Used by Phase 1 consolidation in v0.9.3. v0.10.0 generalises this across
// every workflow that has a server-side endpoint.
async function callAppAPI(appId, path, body) {
  const cfg = window.CORRES_CONFIG;
  if (!cfg || !cfg.apiBase) {
    throw new Error('CORRES_CONFIG not loaded — check config.js is deployed');
  }

  const requestId = (crypto.randomUUID && crypto.randomUUID()) ||
                    (Date.now() + '-' + Math.random().toString(36).slice(2));
  // One idempotency key per call, matching the platform's
  // UNIQUE(tenant_id, app_id, idempotency_key) task-creation contract —
  // protects against a double-submit (e.g. a stray double-click before
  // the button disables) creating two tasks for the same logical request.
  const idempotencyKey = (crypto.randomUUID && crypto.randomUUID()) ||
                          (Date.now() + '-' + Math.random().toString(36).slice(2));

  const res = await fetch(`${cfg.apiBase}/v1/${appId}/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Request-Id': requestId,
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw await _crParseApiError(res);
  }

  return res.json();
}

// §A — Task polling
//
// Every task/workflow endpoint (POST returns 202 + task_id) follows the
// same completion shape: GET /v1/<appId>/tasks/<taskId> until state is
// terminal. One implementation, shared across gioianie/sanzognie/corres,
// rather than each page re-deriving its own poll loop — the same
// single-sourcing reasoning as callAPI/callAppAPI, applied before the
// duplication has a chance to happen this time.
//
// Task routes normally live directly under /v1/<appId>/tasks/... (true
// for gioianie and sanzognie). corres's are one level deeper —
// /v1/corres/ttm/tasks/... — because its three task-creating endpoints
// (build/cluster/name-frames) share one TTM-scoped router
// (apps/corres/api/ttm.py declares its own full "/v1/corres/ttm" prefix
// directly, rather than getting "/v1/corres" applied at mount time the
// way gioianie/sanzognie's routers do) rather than living at the bare
// app root. Pass opts.routeSegment ('ttm') when polling those. Found
// live, 14 Jul 2026: callAppAPI's own `path` argument already threads
// this extra segment through correctly for the create call
// (callAppAPI('corres', 'ttm/build', ...)); pollTask had no equivalent,
// so a corres task was created successfully (202) but its poll request
// 404'd — the task existed server-side with no way for the front end to
// ever retrieve it.
//
// @param {string} appId
// @param {string} taskId
// @param {Object} [opts]
// @param {(progress: any) => void} [opts.onProgress] called with the
//        task's progress object on every poll (app-defined shape, §6.2.4)
// @param {number} [opts.intervalMs=1000]
// @param {string} [opts.routeSegment] extra path segment between appId
//        and "tasks", if this app's task routes aren't at the bare root
// @returns {Promise<any>} the task's result on success
// @throws {Error} with .code set, via friendlyTaskError() for the message,
//         on failure or cancellation
window.pollTask = async function pollTask(appId, taskId, opts = {}) {
  const cfg = window.CORRES_CONFIG;
  if (!cfg || !cfg.apiBase) {
    throw new Error('CORRES_CONFIG not loaded — check config.js is deployed');
  }
  const intervalMs = opts.intervalMs || 1000;
  const segment = opts.routeSegment ? `${opts.routeSegment}/` : '';

  while (true) {
    const res = await fetch(`${cfg.apiBase}/v1/${appId}/${segment}tasks/${taskId}`);
    if (!res.ok) {
      throw await _crParseApiError(res);
    }
    const task = await res.json();

    if (opts.onProgress) opts.onProgress(task.progress);

    if (task.state === 'succeeded') return task.result;

    if (task.state === 'failed') {
      const error = new Error(window.friendlyTaskError(task.error));
      error.code = task.error && task.error.code;
      throw error;
    }

    if (task.state === 'cancelled') {
      const error = new Error('Processing was cancelled.');
      error.code = 'cancelled';
      throw error;
    }

    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
};

// §A — Task-polling error translation
//
// The task/workflow endpoints (POST returns 202 + task_id; caller polls
// GET .../tasks/{id} until state is terminal) surface SpendCeilingReached /
// RateLimitExceeded inside the polled body's `error.code`/`error.message`
// once state === "failed" — never as an HTTP status on the POST itself,
// since the POST already returned before the workflow ran. pollTask()
// (below) calls this directly when translating a failed task into the
// Error it throws, so every caller gets the same graceful text
// regardless of which path (direct endpoint vs task polling) produced it.
window.friendlyTaskError = function friendlyTaskError(taskError) {
  if (!taskError) return 'An unknown error occurred.';
  return CR_FRIENDLY_ERROR_MESSAGES[taskError.code] || taskError.detail || taskError.message || 'An unknown error occurred.';
};



/* ============================================================================
 * §B  FILE I/O — stays browser-side until §16 file-services lands
 *
 * Reading uploaded files (txt and pdf) into strings. PDF extraction uses
 * pdf.js loaded from the CDN. The 10-item override surface specification
 * of 1 May 2026 anticipates this moving server-side in a later release
 * (Q7); until then it lives here.
 * ============================================================================ */

// Configure pdf.js worker once. Idempotent.
if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
  window.pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Read an uploaded file into text. Supports .txt and .pdf.
 *
 * @param {File}   file
 * @param {Object} [opts]
 * @param {number} [opts.limit] Maximum characters to extract (PDF only).
 *                              Useful for very large PDFs in Phase 3.
 * @returns {Promise<string>}
 */
window.readFile = async function readFile(file, opts = {}) {
  const name = (file.name || '').toLowerCase();
  const limit = opts.limit || Infinity;

  if (name.endsWith('.txt')) {
    const text = await file.text();
    return limit === Infinity ? text : text.substring(0, limit);
  }

  if (name.endsWith('.pdf')) {
    if (!window.pdfjsLib) {
      throw new Error('PDF.js not loaded — cannot read PDF files');
    }
    const buf = await file.arrayBuffer();
    const pdf = await window.pdfjsLib.getDocument({ data: buf }).promise;
    let out = '';
    for (let p = 1; p <= pdf.numPages && out.length < limit; p++) {
      const page    = await pdf.getPage(p);
      const content = await page.getTextContent();
      out += content.items.map(i => i.str).join(' ') + '\n\n';
    }
    return out.substring(0, limit).trim();
  }

  throw new Error(`Unsupported file type: ${file.name}`);
};

/**
 * Sanitise text before sending to the LLM. Removes characters that
 * commonly cause LLMs to generate broken JSON: smart quotes (replaced
 * with straight ASCII equivalents), en/em dashes (replaced with hyphens),
 * control characters (replaced with spaces), and backslashes (replaced
 * with forward slashes).
 *
 * @param {string} text Raw text from a file or other untrusted source
 * @returns {string}    Sanitised text safe for inclusion in an LLM prompt
 */
window.sanitiseText = function sanitiseText(text) {
  return String(text ?? '')
    .replace(/[\u2018\u2019]/g, "'")   // smart single quotes → plain
    .replace(/[\u201C\u201D]/g, '"')   // smart double quotes → plain
    .replace(/[\u2013\u2014]/g, '-')   // en/em dash → hyphen
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, ' ') // control chars
    .replace(/\\/g, '/')               // backslashes → forward slash
    .trim();
};


/* ============================================================================
 * §C  ARTEFACT I/O (CSV) — stays browser-side (the §11.1 boundary)
 *
 * The inter-phase handoff format. Per platform contract §11.1, artefact-I/O
 * is the permanent shape of the application boundary; user-mediated handoff
 * (download from one phase, upload at the next) is platform-supported by
 * design, not a degraded fallback. These utilities therefore stay here
 * even after the JS → Python migration.
 * ============================================================================ */

/**
 * Escape a value for inclusion in a CSV row. Quotes fields containing
 * commas, double-quotes, or newlines; doubles up internal quotes.
 */
window.csvCell = function csvCell(val) {
  const s = String(val ?? '');
  return (s.includes(',') || s.includes('"') || s.includes('\n'))
    ? '"' + s.replace(/"/g, '""') + '"'
    : s;
};

/**
 * Trigger a download of a string as a file.
 *
 * @param {string} filename
 * @param {string} content
 * @param {string} [type='text/csv'] MIME type
 */
window.downloadBlob = function downloadBlob(filename, content, type = 'text/csv') {
  const blob = new Blob([content], { type });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

/** ISO date stamp for filenames: YYYY-MM-DD. */
window.today = function today() {
  return new Date().toISOString().slice(0, 10);
};

/**
 * Assign concept_id to a list of typology items ({term, ...}), the minimum
 * column set the backend's TypologyArtefact/Concept schema requires
 * (concept_schema_note_v0_1.md — {concept_id, term, data_type}). The
 * CSV-based typology handoff between gioianie → sanzognie → corres predates
 * that requirement and carries no ID column of its own, so this is the
 * single place that closes the gap: keep each item's real .concept_id where
 * present (e.g. read from a CSV's Concept_ID column by the caller), and
 * assign a synthetic ID only to items that lack one.
 *
 * Deliberately per-item rather than all-or-nothing: gioianie Phase 2's own
 * "export new concept candidates" CSV (see exportNewConcepts in
 * gioianie_iterate.html) tells researchers to hand-append new rows to an
 * existing, already-ID'd typology CSV. Those appended rows have no
 * Concept_ID. An all-or-nothing rule would treat that one missing value as
 * license to renumber the whole typology, silently discarding the real
 * backend-assigned IDs that any already-scored DTM data is keyed to.
 * Synthetic IDs are chosen above the highest real ID seen (or from 1, if
 * none) so they can never collide with a real one.
 *
 * @param {Array<Object>} items Typology items, each with at least .term
 * @returns {{items: Array<Object>, idsAreSynthetic: boolean}}
 *          items are shallow copies with .concept_id set (int); idsAreSynthetic
 *          is true if any item lacked a real ID and had one assigned —
 *          callers should console.warn on this so a partial re-numbering
 *          doesn't go unnoticed.
 */
window.assignConceptIds = function assignConceptIds(items) {
  const hasReal = it => it.concept_id !== undefined && it.concept_id !== null && it.concept_id !== '';
  const realIds = items.filter(hasReal).map(it => parseInt(it.concept_id, 10));
  let nextSynthetic = (realIds.length ? Math.max(...realIds) : 0) + 1;
  let idsAreSynthetic = false;

  const out = items.map(it => {
    if (hasReal(it)) {
      return { ...it, concept_id: parseInt(it.concept_id, 10) };
    }
    idsAreSynthetic = true;
    return { ...it, concept_id: nextSynthetic++ };
  });

  return { items: out, idsAreSynthetic };
};


/* ============================================================================
 * §D  UI UTILITIES — stays browser-side
 *
 * Page-level helpers that have no business migrating server-side: HTML
 * escaping, error/status display against well-known DOM ids, byte-formatting
 * for file size readouts.
 *
 * Convention: pages provide a #error-display element if they want
 * showError/clearError to work. Pages that don't provide one get a console
 * warning rather than a thrown exception, so a missing element is visible
 * without breaking the call site.
 * ============================================================================ */

/** Escape a string for safe insertion into innerHTML. */
window.escHtml = function escHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

/**
 * Display an error message in #error-display. If the element is absent,
 * logs a warning and falls back to alert() so the user still sees something.
 */
window.showError = function showError(msg) {
  const el = document.getElementById('error-display');
  if (!el) {
    console.warn('showError: no #error-display element on this page');
    return;
  }
  el.innerHTML =
    `<div class="error-box"><strong>Error</strong>${window.escHtml(msg)}</div>`;
};

/** Clear the error display. No-op if #error-display is absent. */
window.clearError = function clearError() {
  const el = document.getElementById('error-display');
  if (el) el.innerHTML = '';
};

/** Format a byte count as a short human string: "847B", "23KB", "1.8MB". */
window.formatBytes = function formatBytes(b) {
  if (b < 1024)        return `${b}B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)}KB`;
  return `${(b / 1024 / 1024).toFixed(1)}MB`;
};
// ── Fragment loader ─────────────────────────────

window.loadFragment = async function loadFragment(id, path) {
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);

    const html = await res.text();
    const el = document.getElementById(id);
    if (el) el.innerHTML = html;

    // The contact FAB/modal ships inside the edu-header fragment (CD input
    // v0.1 Part A item 6) so every page gets it from one include, rather
    // than duplicating the markup/wiring per page. Init only runs once the
    // fragment's actual DOM nodes exist.
    if (id === 'edu-header') window.initContactModal();
  } catch (err) {
    console.warn(err.message);
  }
};

// ── Contact modal (CD input v0.1 Part A item 6) ─────────────────────
//
// Mirrors ebono_au_site's floating contact FAB/modal component and
// script.js wiring (same fetch-with-JSON-reply pattern, same honeypot).
// Posts to this site's own /contact.php (23 Jul: moved onto
// educational_tools rather than posting cross-origin to ebono.au,
// which avoided the CORS question entirely instead of solving it).
window.initContactModal = function initContactModal() {
  const openBtn = document.getElementById('contactOpen');
  const closeBtn = document.getElementById('contactClose');
  const overlay = document.getElementById('contactModal');
  const form = document.getElementById('contactForm');
  const status = document.getElementById('contactStatus');
  if (!openBtn || !overlay || !form) return; // fragment not present on this page

  let lastFocused = null;

  function openModal() {
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.getElementById('contact-name').focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    document.removeEventListener('keydown', onKeydown);
    if (lastFocused) lastFocused.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') closeModal();
  }

  openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const honeypot = document.getElementById('contact-website');
    if (honeypot && honeypot.value) {
      status.textContent = 'Message sent — thank you.';
      status.setAttribute('data-state', 'ok');
      form.reset();
      return;
    }

    status.textContent = 'Sending…';
    status.removeAttribute('data-state');

    fetch(form.getAttribute('action'), {
      method: 'POST',
      body: new FormData(form),
      headers: { 'X-Requested-With': 'XMLHttpRequest' },
    })
      .then((res) => res.json().catch(() => ({ ok: res.ok })))
      .then((json) => {
        if (json && json.ok) {
          status.textContent = "Message sent — thank you. We'll be in touch.";
          status.setAttribute('data-state', 'ok');
          form.reset();
        } else {
          throw new Error((json && json.error) || 'Send failed');
        }
      })
      .catch(() => {
        status.textContent = 'Something went wrong — please email us directly instead.';
        status.setAttribute('data-state', 'err');
      });
  });
};


// ── Active navigation marker ─────────────────────────────

window.markActiveNav = function markActiveNav() {
  const path = window.location.pathname;

  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    if (path.startsWith(href)) {
      a.classList.add('current');
    }
  });
};

/**
 * App on/off switch (per-environment config/apps/<app>/config.js
 * appActive field, aggregated for all four apps by apps-enabled.php —
 * see config/README.md). Call after the page's own links are in the DOM
 * (homepage phase-cards are static; nav links arrive via loadFragment).
 *
 * Removes, rather than hides, any link whose href points into a
 * disabled app's folder (/apps/<app>/...) — covers the homepage's
 * phase-cards and the shared nav fragment in one pass, no per-page
 * link inventory needed.
 */
window.applyAppVisibility = function applyAppVisibility() {
  if (!window.APPS_ENABLED) return; // apps-enabled.php not loaded on this page — leave links as-is
  Object.keys(window.APPS_ENABLED).forEach(appId => {
    if (window.APPS_ENABLED[appId]) return;
    document.querySelectorAll(`a[href*="/apps/${appId}/"]`).forEach(a => a.remove());
  });
};

/**
 * Blocks this page's own app when it's switched off (config.js's
 * appActive field). Call as early as possible — after config.php and
 * this script have loaded, before any other page-specific script runs
 * — since it works by replacing the entire document via document.open/
 * write/close, which aborts the browser's parsing of whatever HTML
 * still follows in the original page source (the standard technique;
 * anything less than a full document replace risks the rest of the
 * original body still being parsed in and appended afterwards).
 */
window.enforceAppActive = function enforceAppActive() {
  const cfg = window.CORRES_CONFIG;
  if (!cfg || cfg.appActive !== false) return;
  document.open();
  document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Not available</title>
    <style>body{font-family:sans-serif;background:#05070a;color:#eee;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}
    a{color:#7ec8e3;}</style></head><body><div>
    <h1>Not available in this environment</h1>
    <p>${window.escHtml(cfg.appId || 'This application')} is currently switched off here.</p>
    <p><a href="/">Return to the homepage</a></p>
    </div></body></html>`);
  document.close();
  window.stop();
};

/* ============================================================================
 * §E  STAGE 3 RETIREMENT — technical debt against contract §6
 *
 * Per platform contract §6, structured-output parsing and repair is a
 * platform-layer responsibility: applications "do not implement parsing or
 * repair locally." The current pages inline JSON.parse after every callAPI;
 * that pattern is incompatible with §6 and retires at Stage 3 when the
 * platform parsing layer ships (Q4a–Q4b).
 *
 * This helper is provided as a single chokepoint for the existing parse
 * pattern. Pages should call this rather than scattering inline parse calls
 * across the codebase; the eventual retirement is then a single delete plus
 * a callsite sweep, not a hunt through page-specific JS.
 *
 * Stage 3 action: delete this section; replace callsites with the parsed
 * object returned directly by callAPI; close out the §6 contract debt.
 * ============================================================================ */

/**
 * Parse an LLM response as JSON. Tolerates the common failure mode of the
 * model wrapping its JSON in a ```json ... ``` fence.
 *
 * @param {string} text Response text from callAPI
 * @param {string} [context] Optional context string for error messages
 *                            (e.g. "Phase 1 typology generation")
 * @throws {Error} If parsing fails after de-fencing.
 */
window.parseLLMResponse = function parseLLMResponse(text, context = '') {
  let s = String(text || '').trim();

  // Strip ```json ... ``` or ``` ... ``` fences if present.
  const fence = s.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fence) s = fence[1].trim();

  try {
    return JSON.parse(s);
  } catch (err) {
    const where = context ? ` (${context})` : '';
    throw new Error(`Could not parse LLM response as JSON${where}: ${err.message}`);
  }
};

/**
 * Repair control characters inside JSON string values. Walks the raw text
 * character by character; inside string values, replaces literal newlines,
 * carriage returns, and tabs with a space, and silently drops any other
 * bare control characters. This fixes the most common LLM failure mode:
 * embedding a literal newline in a string value, which produces an
 * "Unterminated string" error from JSON.parse.
 *
 * Intended as a helper for callers building their own JSON-repair logic.
 * Page-local repairJSON functions in Phase 1 and Phase 2 use this as
 * Strategy 1 before falling back to more aggressive recovery.
 *
 * Like parseLLMResponse, this retires when the platform structured-output
 * parsing layer ships and applications stop doing local JSON repair.
 *
 * @param {string} text Raw JSON-like text (after any fence stripping)
 * @returns {string}    Text with control characters fixed inside strings
 */
window.fixJSONStrings = function fixJSONStrings(text) {
  let result = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (escaped) {
      result += ch;
      escaped = false;
      continue;
    }
    if (ch === '\\' && inString) {
      result += ch;
      escaped = true;
      continue;
    }
    if (ch === '"') {
      result += ch;
      inString = !inString;
      continue;
    }
    if (inString) {
      const code = ch.charCodeAt(0);
      if (ch === '\n' || ch === '\r' || ch === '\t') {
        result += ' '; // replace literal whitespace control chars with space
        continue;
      }
      if (code < 0x20) {
        continue; // drop other control characters silently
      }
    }
    result += ch;
  }
  return result;
};

/* ── Build stamp ───────────────────────────────────────────────────────────
 * Read from config.js rather than hand-typed into the header fragment, which
 * is where it had drifted to beta-2026-08-09 on a build made on 23 August.
 * Both surfaces call this, so they cannot disagree about which build is live.
 */
window.renderBuildVersion = function renderBuildVersion() {
  const el = document.getElementById('cr-build-version');
  if (!el) return;
  const cfg = window.CORRES_CONFIG;
  el.textContent = (cfg && cfg.appVersion) ? `build ${cfg.appVersion}` : '';
};
