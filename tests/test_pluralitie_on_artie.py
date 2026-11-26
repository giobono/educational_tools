"""
pluralitie on artie, the page (OD's brief to D2Dev of 26 Nov 2026,
`briefs/d2dev/2026-11-26_brief_od_d2dev_pluralitie_on_artie_beta_v1_0.md`;
Geoff's instruction of the same evening).

The real pluralitie.js runs against a stand-in page and a stand-in server,
as the metering tests do. What is checked is the seam: the page shows what
the server sent, sends the two model calls down the metered route sanzognie
takes, and changes a definition only when the researcher says so.
"""

import json
import re

from tests.test_metering_fixes_after_test import ROOT, _run

APP = ROOT / "apps/pluralitie"
JS = APP / "pluralitie.js"
PAGE = APP / "index.html"

STUB = r"""
var registry = {}, ready = [], CALLS = [], GETS = [], POSTS = [], REPLACED = null, DOWNLOADED = null;
function el(id) {
  return registry[id] || (registry[id] = { id: id, innerHTML: '', textContent: '', value: '', disabled: false,
    className: '', style: {}, dataset: {}, scrollIntoView: function () {},
    querySelectorAll: function () { return []; }, querySelector: function () { return el(id + ':child'); } });
}
var document = {
  getElementById: function (id) { return el(id); },
  addEventListener: function (k, f) { if (k === 'DOMContentLoaded') ready.push(f); },
  querySelectorAll: function () { return []; },
  querySelector: function (sel) { return el(sel); }
};
function URLSearchParams(s) { this.m = {}; var me = this;
  String(s || '').replace(/^\?/, '').split('&').forEach(function (kv) { if (kv) { var p = kv.split('='); me.m[p[0]] = decodeURIComponent(p[1] || ''); } });
  this.get = function (k) { return k in this.m ? this.m[k] : null; }; }
function URL(h) { this.href = h; this.search = ''; }
var SESSION = %(session)s;
var window = {
  CORRES_CONFIG: { apiBase: 'https://api.test' },
  location: { href: 'https://beta.test/apps/pluralitie/', pathname: '/apps/pluralitie/', search: %(search)s },
  history: { replaceState: function (a, b, u) { REPLACED = u.search || String(u); } },
  ArtieMetering: { handled: function () { return false; } },
  downloadBlob: function (name, text, type) { DOWNLOADED = { name: name, text: text, type: type }; },
  today: function () { return '2026-11-26'; }
};
function reply(body) { return Promise.resolve({ ok: true, json: function () { return Promise.resolve(body); }, text: function () { return Promise.resolve('# report'); } }); }
var _crRequest = function (url, init) {
  if (init.method === 'POST') { POSTS.push({ url: url, body: JSON.parse(init.body) });
    if (/\/accept$/.test(url)) { var b = JSON.parse(init.body); SESSION.frames[b.frame_id].definition = { name: b.name, definition: b.definition, by: b.by }; }
    return reply(SESSION); }
  GETS.push(url);
  if (/\/sources$/.test(url)) return reply([{ id: 'mfc', title: 'MFC-A (same-sex marriage)', stored: { computed: '2026-11-21T11:19:54', documents: 3325, concepts: 15 } }]);
  return reply(SESSION);
};
var callAppAPI = function (app, path, body) { CALLS.push({ app: app, path: path, body: body }); return Promise.resolve({ task_id: 't1' }); };
var pollTask = function (app, id) { CALLS.push({ poll: app, id: id });
  if (!SESSION.drafts) { SESSION.drafts = { F1: { discussion: 'DISCUSSED', questions: ['Q1?'], cautions: ['CAUTION'] } };
    SESSION.frames.F1.definition = { name: 'Drafted name', definition: 'Drafted definition.', by: 'model draft' }; SESSION.model = 'model-x'; }
  return Promise.resolve({}); };
var fetch = function (url) { return reply(/version\.php/.test(url) ? { commit: 'feedfacecafe' } : { artie_commit: 'abc123def456', model: 'model-x' }); };
"""

READ = """JSON.stringify({
  samples: el('pl-samples').innerHTML, recap: el('pl-recap').innerHTML, evidence: el('pl-evidence').innerHTML,
  frames: el('pl-frames').innerHTML, runsOn: el('pl-runs-on').textContent, error: el('pl-error').textContent,
  framesShown: el('card-frames').style.display, calls: CALLS, gets: GETS, posts: POSTS, replaced: REPLACED,
  downloaded: DOWNLOADED
})"""


def _session(**kw):
    f1 = {"id": "F1", "name": "Frame A", "documents_carrying": 1200, "share_of_corpus": 0.36,
          "documents_carrying_only_this_frame": 400,
          "members": [{"concept": "Economic", "class": "distinguishing", "documents": 500, "share_of_corpus": 0.15, "towards": None},
                      {"concept": "Capacity <b>", "class": "bridging_candidate", "documents": 300, "share_of_corpus": 0.09, "towards": "Frame B"}],
          "strongest_pairs": [{"concepts": ["Economic", "Capacity <b>"], "documents_with_both": 120, "lift": 2.4}],
          "typical_documents": [{"document": "1", "label": "same-sex_marriage1.0-881", "carries": ["Economic"], "of_members": 2,
                                 "also_carries_from_other_frames": []}],
          "meets_other_frames": [{"frame": "Frame B", "documents_carrying_both": 300, "share_of_this_frames_documents": 0.25}]}
    s = {"session_id": "pls_0123456789abcdef", "created": "2026-11-26T10:00:00+00:00",
         "source": {"kind": "stored_sample", "description": "MFC-A (P = 49)", "run_id": "mfc_1"},
         "evidence": {"run_id": "mfc_1", "corpus": "MFC-A (same-sex marriage)", "documents": 3325, "concepts": 15,
                      "checks_done": ["chance_check"], "frames": [f1], "unplaced": [{"concept": "Other"}]},
         "frames": {"F1": {"name": "Frame A", "definition": None, "accepted": [], "conversation": []}},
         "drafts": None, "model": None}
    s.update(kw)
    return s


def _page(tmp_path, session, *, search="", then=""):
    prog = (STUB % {"session": json.dumps(session), "search": json.dumps(search)}
            + JS.read_text(encoding="utf-8")
            + "\nready.forEach(function (f) { f(); });\nPromise.resolve().then(function () { return Promise.resolve(); })"
              ".then(function () {" + then + "});\n")
    return _run(prog, READ, tmp_path)


def _text(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", html or "")).strip()


# ---- the page takes the route sanzognie takes ---------------------------------

def test_the_page_loads_sign_in_and_metering_as_sanzognie_does_and_adds_no_callback():
    page = PAGE.read_text(encoding="utf-8")
    for src in ("/apps/common/signin.js", "/apps/common/metering.js", "/apps/common/metering_strings.js"):
        assert src in page
    assert "ArtieMetering.init({ appId: 'pluralitie' })" in page
    assert "callback.html" not in page                      # it registers no callback of its own
    assert not (APP / "auth").exists()                      # one /auth/callback.html per host, not one per app
    js = JS.read_text(encoding="utf-8")
    assert "llm/messages" not in js and "anthropic" not in js.lower()   # no open route, no key, no direct call


def test_the_earlier_page_is_kept_unchanged_in_what_it_does():
    old = (APP / "name_frames.html").read_text(encoding="utf-8")
    assert "callAppAPI('corres', 'ttm/name-frames'" in old


def test_the_nav_links_to_pluralitie():
    assert 'href="/apps/pluralitie/"' in (ROOT / "edu_header.html").read_text(encoding="utf-8")


# ---- arriving ------------------------------------------------------------------

def test_with_nothing_in_the_address_the_stored_sample_is_offered(tmp_path):
    r = _page(tmp_path, _session())
    assert "MFC-A (same-sex marriage)" in r["samples"] and "3325 documents" in _text(r["samples"])
    assert r["posts"] == [] and r["calls"] == []


def test_arriving_from_corres_with_a_run_opens_it_at_once_and_no_model_is_called(tmp_path):
    r = _page(tmp_path, _session(), search="?run=mfc_1")
    (post,) = r["posts"]
    assert post["url"].endswith("/v1/pluralitie/sessions") and post["body"] == {"run_id": "mfc_1"}
    assert r["replaced"] == "?session=pls_0123456789abcdef"     # a reload returns to the same work
    assert "3325" in r["recap"] and "Frame A" in r["recap"] and "chance check" in r["recap"]
    t = _text(r["evidence"])
    assert "Carried by 1200 documents, 36% of the corpus" in t and "together in 120 documents · 2.4× chance" in t
    assert "same-sex_marriage1.0-881" in t and "In no frame: Other." in t
    assert "Capacity &lt;b&gt;" in r["evidence"]                  # what the server sent is escaped
    assert r["calls"] == [] and r["framesShown"] == "none"
    assert "artie abc123def456" in r["runsOn"] and "educational_tools feedfacecafe" in r["runsOn"]
    assert "model model-x (none called yet)" in r["runsOn"]


# ---- the two metered calls -----------------------------------------------------

def test_drafting_goes_down_the_metered_route_and_shows_what_came_back(tmp_path):
    r = _page(tmp_path, _session(), search="?session=pls_0123456789abcdef",
              then="return el('pl-define-btn').onclick();")
    assert r["calls"][0] == {"app": "pluralitie", "path": "frames/define",
                             "body": {"session_id": "pls_0123456789abcdef"}}
    assert r["calls"][1] == {"poll": "pluralitie", "id": "t1"}
    t = _text(r["frames"])
    assert "Drafted name" in t and "Drafted definition." in t and "DISCUSSED" in t and "Q1?" in t and "CAUTION" in t
    assert r["framesShown"] == "" and "model model-x (called in this session)" in r["runsOn"]


def test_a_proposal_is_shown_with_its_accept_button_only_on_the_latest_turn(tmp_path):
    convo = [{"who": "researcher", "text": "first"},
             {"who": "assistant", "text": "old", "proposed": {"name": "Old", "definition": "o", "why": "w"}},
             {"who": "researcher", "text": "second"},
             {"who": "assistant", "text": "new", "proposed": {"name": "New name", "definition": "n", "why": "w"}}]
    s = _session(drafts={"F1": {}}, model="model-x")
    s["frames"]["F1"].update(definition={"name": "Drafted", "definition": "D.", "by": "model draft"}, conversation=convo)
    r = _page(tmp_path, s, search="?session=pls_0123456789abcdef")
    assert r["frames"].count("pl-accept") == 1 and "New name" in r["frames"] and "Old" in r["frames"]
    assert r["posts"] == []                                   # nothing accepted by showing it


def test_the_report_is_downloaded_from_the_server(tmp_path):
    s = _session(drafts={"F1": {}})
    r = _page(tmp_path, s, search="?session=pls_0123456789abcdef", then="return el('pl-export-btn').onclick();")
    assert r["downloaded"] == {"name": "pluralitie_frames_2026-11-26.md", "text": "# report", "type": "text/markdown"}
    assert r["gets"][-1].endswith("/sessions/pls_0123456789abcdef/export")
