"""
CR3 at apps/corres/ (OD's merge brief of 19 Nov 2026 §2.2 and §3), on the
tracked front end:

1. the earlier app is at apps/corres_v2/ with its own config loader, and the
   allow-lists and the rewrite rules know both;
2. nothing tracked names `corres_trial` except the 301 that sends it on;
3. the CR3 page takes its address from config, not from a constant, and
   loads the shared sign-in; no page constant file remains.

Run from the work tree: `python -m pytest -q tests`. Plain stdlib.
"""
import os
import re
import subprocess
from pathlib import Path

ROOT = Path(os.environ.get("ARTIE_FRONT_END_ROOT") or Path(__file__).resolve().parents[1])


def tracked():
    out = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    return out.splitlines()


def text(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def test_the_two_apps_have_their_own_folders_and_config_loaders():
    files = set(tracked())
    assert "apps/corres/index.html" in files and "apps/corres/trial.js" in files
    assert "apps/corres_v2/index.html" in files and "apps/corres_v2/g4_api.js" in files
    assert "config/apps/corres/config.js" in text("apps/corres/config.php")
    assert "config/apps/corres_v2/config.js" in text("apps/corres_v2/config.php")
    assert not any(f.startswith("apps/corres_trial/") for f in files)
    assert "apps/corres/trial_config.js" not in files


def test_the_allow_lists_and_the_rewrite_rules_know_both_apps():
    gate = text("app_gate.php")
    assert "'corres'" in gate and "'corres_v2'" in gate
    assert "preg_replace('/[^a-z0-9_]/'" in gate, "the id cleaner would strip corres_v2 to corresv"
    enabled = text("apps-enabled.php")
    assert "'corres'" in enabled and "'corres_v2'" in enabled
    ht = text(".htaccess")
    assert re.search(r"RewriteRule \^apps/corres_trial/\?\(\.\*\)\$ /apps/corres/\$1 \[R=301,L\]", ht)
    assert ht.index("corres_trial") < ht.index("app_gate.php?app=$1"), "the 301 comes before the gate rules"
    assert ht.count("(gioianie|sanzognie|corres|corres_v2|pluralitie)") == 2


def test_corres_trial_is_named_nowhere_else():
    hits = []
    for f in tracked():
        if f.startswith("tests/") or not f.endswith((".js", ".html", ".php", ".css", ".json", ".md", ".txt")):
            continue
        if "corres_trial" in text(f) and f != ".htaccess":
            hits.append(f)
    assert hits == [], hits


def test_the_cr3_page_reads_config_and_loads_the_shared_signin():
    page = text("apps/corres/index.html")
    for src in ("/apps-enabled.php", "config.php", "/apps/common/config.php",
                "/apps/common/signin.js", "/apps/common/metering_strings.js", "/apps/common/metering.js"):
        assert src in page, src
    assert "trial_config.js" not in page
    js = text("apps/corres/trial.js")
    assert "window.CORRES_CONFIG" in js and "127.0.0.1" not in js
    assert "'/v3/corres'" in js and "/trial/corres" not in js
    assert "requireSignIn" in js and "window.getToken" in js
