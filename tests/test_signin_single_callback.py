"""
One sign-in callback per host (OD build brief to D1Dev of 25 Nov 2026, Part B,
`briefs/d1dev/2026-11-25_brief_od_d1dev_metering_caps_and_single_callback_v1_0.md`).

B.2.1 `/auth/callback.html` is the only redirect: signin.js sends every sign-in
      there, and the callback returns the browser to the page that started it.
B.2.2 the return address is checked: same origin, under /apps/ or the root,
      anything else goes to /.
B.2.4 one spelling per app page: /apps/x and /apps/x/index.html answer one 301
      to /apps/x/ (probed against a served site when ARTIE_SITE_URL is set).
The 21 Nov sign-in loop came from a redirect address that changed with the
page's trailing slash; a fixed callback address cannot.

The return-address check is run in a JavaScript engine: node if present,
else macOS's JavaScriptCore through osascript. Without either it is skipped.
"""

import json
import os
import re
import shutil
import subprocess
import urllib.request
from pathlib import Path

import pytest

ROOT = Path(os.environ.get("ARTIE_FRONT_END_ROOT") or Path(__file__).resolve().parents[1])
SIGNIN = ROOT / "apps/common/signin.js"
RETURN_TO = ROOT / "apps/common/return_to.js"
CALLBACK = ROOT / "auth/callback.html"
ORIGIN = "https://beta.ebono.au"
APP_PAGES = ["/apps/corres/", "/apps/gioianie/", "/apps/gioianie/gioianie_iterate.html",
             "/apps/sanzognie/", "/apps/pluralitie/"]


def _js(expr: str):
    src = RETURN_TO.read_text(encoding="utf-8")
    prog = f"var window = {{}};\n{src}\nJSON.stringify({expr});"
    if shutil.which("node"):
        out = subprocess.run(["node", "-e", f"console.log((function(){{{prog.replace('JSON.stringify(', 'return JSON.stringify(', 1)}}})())"],
                             capture_output=True, text=True, check=True).stdout
    elif shutil.which("osascript"):
        out = subprocess.run(["osascript", "-l", "JavaScript", "-e", prog],
                             capture_output=True, text=True, check=True).stdout
    else:
        pytest.skip("no JavaScript engine on this machine")
    return json.loads(out.strip())


def safe(raw):
    return _js(f"window.artieSafeReturn({json.dumps(raw)}, {json.dumps(ORIGIN)})")


def test_the_callback_page_exists_and_loads_the_component():
    html = CALLBACK.read_text(encoding="utf-8")
    assert "/apps/common/signin.js" in html and "/apps/common/return_to.js" in html
    assert "/apps/common/config.php" in html


def test_signin_sends_every_sign_in_to_the_one_callback():
    js = SIGNIN.read_text(encoding="utf-8")
    assert re.search(r"redirect_uri:\s*window\.location\.origin\s*\+\s*CALLBACK_PATH", js), "redirect_uri is not the callback"
    assert "const CALLBACK_PATH = '/auth/callback.html';" in js
    assert "pathname).replace(" not in js, "the per-page redirect address is still built"


@pytest.mark.parametrize("page", APP_PAGES)
def test_sign_in_returns_to_the_page_that_started_it(page):
    assert safe(ORIGIN + page) == ORIGIN + page
    assert safe(ORIGIN + page + "?x=1#h") == ORIGIN + page + "?x=1#h"


@pytest.mark.parametrize("raw", [
    "https://evil.example/apps/corres/",
    "//evil.example/apps/corres/",
    "https://beta.ebono.au.evil.example/apps/",
    "javascript:alert(1)",
    "/auth/callback.html",
    "/tests/",
    "/apps/../tests/",
    "",
    None,
])
def test_any_other_return_address_goes_to_the_root(raw):
    assert safe(raw) == ORIGIN + "/"


def test_the_root_is_allowed():
    assert safe(ORIGIN + "/") == ORIGIN + "/"


def test_htaccess_sends_index_html_to_the_slash_form():
    ht = (ROOT / ".htaccess").read_text(encoding="utf-8")
    assert re.search(r"RewriteRule \^apps/\(gioianie\|sanzognie\|corres\|corres_v2\|pluralitie\)/index\\\.html\$ /apps/\$1/ \[R=301,L\]", ht)


SITE = os.environ.get("ARTIE_SITE_URL")


@pytest.mark.skipif(not SITE, reason="ARTIE_SITE_URL not set")
@pytest.mark.parametrize("app", ["corres", "sanzognie", "gioianie", "pluralitie"])
@pytest.mark.parametrize("spelling", ["", "/index.html"])
def test_each_spelling_reaches_the_canonical_in_one_301(app, spelling):
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None
    opener = urllib.request.build_opener(NoRedirect)
    try:
        opener.open(f"{SITE}/apps/{app}{spelling}")
        raise AssertionError("no redirect")
    except urllib.error.HTTPError as e:
        assert e.code == 301, e.code
        assert e.headers["Location"].rstrip() in (f"/apps/{app}/", f"{SITE}/apps/{app}/")


@pytest.mark.skipif(not SITE, reason="ARTIE_SITE_URL not set")
def test_the_callback_is_served_and_not_redirected():
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *a, **k):
            return None
    r = urllib.request.build_opener(NoRedirect).open(f"{SITE}/auth/callback.html")
    assert r.status == 200


def test_the_callback_returns_once_to_the_stored_page(tmp_path):
    """25 Nov on beta: every sign-in landed on the home page. The supplier's
    hook and artieCompleteSignIn() both called goBack(); the second found the
    stored address gone and its replace() to the root, issued last, won. This
    runs the real signin.js against a stand-in supplier that fires its hook
    during creation, as the real one does after the exchange, and lets the
    pending promise jobs run before reading what was followed."""
    stub = """
var calls = [], store = {'artie.returnTo': '%(o)s/apps/sanzognie/'};
var window = {
  ARTIE_AUTH_CONFIG: {domain: 'd', clientId: 'c', audience: 'a'},
  location: {origin: '%(o)s', pathname: '/auth/callback.html', href: '%(o)s/auth/callback.html?code=x',
             replace: function (u) { calls.push(u); }},
  createKindeClient: {default: function (o) { o.on_redirect_callback(); return {}; }},
  dispatchEvent: function () {}
};
var sessionStorage = {getItem: function (k) { return k in store ? store[k] : null; },
                      removeItem: function (k) { delete store[k]; }, setItem: function (k, v) { store[k] = v; }};
var CustomEvent = function () {}, console = {warn: function () {}};
""" % {"o": ORIGIN}
    prog = (stub + RETURN_TO.read_text(encoding="utf-8") + SIGNIN.read_text(encoding="utf-8")
            + "\nwindow.artieCompleteSignIn();\n")
    if shutil.which("node"):
        out = subprocess.run(["node", "-e", prog + "setTimeout(function () { process.stdout.write(JSON.stringify(calls)); }, 0);"],
                             capture_output=True, text=True, check=True).stdout
    elif shutil.which("osascript"):
        # A JSContext runs pending promise jobs when an evaluation returns, so
        # the second evaluation sees every replace() the first one caused.
        src = tmp_path / "prog.js"
        src.write_text(prog, encoding="utf-8")
        jxa = ('ObjC.import("JavaScriptCore"); var ctx = $.JSContext.alloc.init;'
               ' ctx.evaluateScript($.NSString.stringWithContentsOfFileEncodingError(%s, 4, null));'
               ' ObjC.unwrap(ctx.evaluateScript("JSON.stringify(calls)").description);' % json.dumps(str(src)))
        out = subprocess.run(["osascript", "-l", "JavaScript", "-e", jxa],
                             capture_output=True, text=True, check=True).stdout
    else:
        pytest.skip("no JavaScript engine on this machine")
    assert json.loads(out.strip()) == [ORIGIN + "/apps/sanzognie/"]
