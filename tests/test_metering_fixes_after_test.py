"""
Fixes from the metered test of 25 November, front end (OD build brief to
DnDev of 25 Nov 2026, `briefs/dndev/2026-11-25_brief_od_dndev_metering_fixes_after_test_v1_0.md`,
signed GE 26/11/2026 07:53).

§3  the account panel lists only the projects this app may be charged to;
§5  nothing is chosen before sign-in: file controls and marked containers are
    disabled, and a dropped file is refused, until sign-in completes;
§5A choosing a sample shows that something is happening, and starts one run;
§5B who is signed in, and a way to sign out, on the home page and in corres.

The behavioural tests run the real metering.js against a stand-in page in
JavaScriptCore (or node), letting its promise jobs run before reading.
"""

import json
import re
import shutil
import subprocess
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
METERING = ROOT / "apps/common/metering.js"
TRIAL = ROOT / "apps/corres/trial.js"

STUB = r"""
var registry = {}, handlers = {}, prevented = 0;
function el(id) {
  var e = registry[id] || (registry[id] = { id: id, innerHTML: '', inert: false, disabled: false, attrs: {},
    classes: {}, setAttribute: function (k, v) { this.attrs[k] = v; }, removeAttribute: function (k) { delete this.attrs[k]; },
    hasAttribute: function (k) { return k in this.attrs; }, scrollIntoView: function () {},
    classList: { toggle: function (c, on) { e.classes[c] = !!on; } } });
  return e;
}
var fileInput = el('file'), chooser = el('chooser');
var document = {
  getElementById: function (id) { return id === 'edu-header' ? null : el(id); },
  createElement: function () { return el('created'); },
  body: { insertBefore: function () {}, firstChild: null, appendChild: function () {} },
  documentElement: {},
  querySelectorAll: function (sel) {
    if (sel === 'input[type="file"]') return [fileInput];
    if (sel === '[data-requires-signin]') return [chooser];
    return [];
  }
};
var TOKEN = %(token)s;
var window = {
  ARTIE_STRINGS: { S1: { heading: 'Sign in', body: 'b', email_label: 'e', button: 'Sign in' },
                   S16: { signout: 'Sign out', title: 'Your account', projects: 'p', project_line: '{project}', my_use: 'm' } },
  ARTIE_AUTH_CONFIG: {}, CORRES_CONFIG: { apiBase: '' },
  location: { href: 'https://beta.ebono.au/apps/corres/' },
  addEventListener: function (k, f) { (handlers[k] = handlers[k] || []).push(f); },
  getToken: function () { return Promise.resolve(TOKEN); },
  signOut: function () {}, signIn: function () {}
};
var sessionStorage = { getItem: function () { return null; }, setItem: function () {}, removeItem: function () {} };
var MutationObserver = function () { this.observe = function () {}; };
var console = { warn: function () {}, error: function () {} };
var ACCOUNT = %(account)s;
var fetch = function () { return Promise.resolve({ ok: true, json: function () { return Promise.resolve(ACCOUNT); } }); };
"""

READ = """JSON.stringify({
  fileDisabled: fileInput.disabled, chooserInert: chooser.inert, greyed: !!chooser.classes['artie-needs-signin'],
  bar: registry['artie-bar'] ? registry['artie-bar'].innerHTML : null,
  panel: registry['artie-panel'] ? registry['artie-panel'].innerHTML : null,
  dropRefused: (function () { var n = 0; (handlers.drop || []).forEach(function (f) {
    f({ preventDefault: function () { n++; }, stopPropagation: function () {} }); }); return n > 0; })()
})"""


def _run(prog: str, read: str, tmp_path) -> dict:
    if shutil.which("node"):
        out = subprocess.run(["node", "-e", prog + f"\nsetTimeout(function () {{ process.stdout.write({read}); }}, 0);"],
                             capture_output=True, text=True, check=True).stdout
    elif shutil.which("osascript"):
        src, rd = tmp_path / "prog.js", tmp_path / "read.js"
        src.write_text(prog, encoding="utf-8")
        rd.write_text(read, encoding="utf-8")
        jxa = ('ObjC.import("JavaScriptCore"); var ctx = $.JSContext.alloc.init;'
               ' function f(p) { return $.NSString.stringWithContentsOfFileEncodingError(p, 4, null); }'
               f' ctx.evaluateScript(f({json.dumps(str(src))}));'
               f' ObjC.unwrap(ctx.evaluateScript(f({json.dumps(str(rd))})).description);')
        out = subprocess.run(["osascript", "-l", "JavaScript", "-e", jxa], capture_output=True, text=True, check=True).stdout
    else:
        pytest.skip("no JavaScript engine on this machine")
    out = out.strip()
    assert not out.startswith("EXC"), out
    return json.loads(out)


def _page(tmp_path, *, token, init, account=None):
    acct = account or {"person": {"email": "researcher@example.test"}, "projects": []}
    prog = STUB % {"token": json.dumps(token), "account": json.dumps(acct)} + METERING.read_text(encoding="utf-8")
    prog += f"\nwindow.ArtieMetering.init({init});\n"
    return _run(prog, READ, tmp_path)


# -- §5: nothing is chosen before sign-in -------------------------------------

def test_signed_out_the_file_control_and_the_chooser_are_disabled_and_drops_refused(tmp_path):
    r = _page(tmp_path, token=None, init="{ appId: 'corres', banner: false, accountBar: true }")
    assert r["fileDisabled"] and r["chooserInert"] and r["greyed"]
    assert r["dropRefused"]
    assert "Sign in" in r["panel"]          # S1 in their place


def test_signed_in_they_are_enabled(tmp_path):
    r = _page(tmp_path, token="t", init="{ appId: 'corres', banner: false, accountBar: true }")
    assert not r["fileDisabled"] and not r["chooserInert"] and not r["greyed"]
    assert not r["dropRefused"]


def test_corres_marks_its_upload_choice_and_its_form():
    html = (ROOT / "apps/corres/index.html").read_text(encoding="utf-8")
    assert '<div class="tr-choice" data-requires-signin>' in html
    assert '<form id="tr-upload" class="tr-upload" data-requires-signin>' in html


# -- §5B: who is signed in, and sign-out ------------------------------------

def test_the_bar_shows_who_is_signed_in_and_sign_out(tmp_path):
    r = _page(tmp_path, token="t", init="{ appId: 'corres', banner: false, accountBar: true }")
    assert "researcher@example.test" in r["bar"] and "Sign out" in r["bar"]


def test_the_home_page_shows_nothing_when_signed_out(tmp_path):
    r = _page(tmp_path, token=None, init="{ appId: 'corres', banner: false, accountBar: true, signInPanel: false }")
    assert r["bar"] == "" and "Sign in" not in (r["panel"] or "")


def test_the_home_page_and_corres_carry_the_bar():
    home = (ROOT / "index.html").read_text(encoding="utf-8")
    assert "accountBar: true, signInPanel: false" in home
    assert "/apps/common/signin.js" in home and "/apps/common/metering.js" in home
    corres = (ROOT / "apps/corres/index.html").read_text(encoding="utf-8")
    assert "window.ArtieMetering.init({ appId: 'corres', banner: false, accountBar: true })" in corres


# -- §3: the panel lists only this app's projects ---------------------------

def test_the_panel_lists_only_this_apps_projects(tmp_path):
    acct = {"person": {"email": "r@example.test"}, "projects": [
        {"id": "g", "name": "gioianie stop", "product": "gioianie"},
        {"id": "s", "name": "sanzognie stop", "product": "sanzognie"},
        {"id": "a", "name": "Standard", "product": "artie"}]}
    prog = STUB % {"token": json.dumps("t"), "account": json.dumps(acct)} + METERING.read_text(encoding="utf-8")
    prog += "\nwindow.ArtieMetering.init({ appId: 'sanzognie' });\n"
    read = "JSON.stringify({ chosen: window.ArtieMetering.projectId() })"
    assert _run(prog, read, tmp_path)["chosen"] == "s"
    prog2 = prog.replace('"product": "sanzognie"', '"product": "pluralitie"')
    assert _run(prog2, read, tmp_path)["chosen"] == "a"   # never gioianie's, though it is first


def test_a_mismatch_refusal_drops_the_choice():
    js = METERING.read_text(encoding="utf-8")
    assert re.search(r"case 'project_product_mismatch':\s*\n\s*chooseProject\(null\);", js)


# -- §5A: a sample click shows it is working, and starts one run --------------

def test_a_sample_click_disables_the_controls_and_shows_the_indicator():
    js = TRIAL.read_text(encoding="utf-8")
    body = js[js.index("async function startExample"):js.index("// --- page 2")]
    assert "if (startingExample) return;" in body                       # a double click starts one run
    assert "b.disabled = true" in body and "progressStart(title" in body
    assert "finally" in body and "b.disabled = false" in body
