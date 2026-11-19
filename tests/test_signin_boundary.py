"""
Metering phase 3 (OD brief v1.1 of 19 Nov 2026, §4.1 and §5): the front end's
two boundaries.

1. **The identity supplier is named in one file.** `apps/common/signin.js` is
   the only front-end file that loads or calls the supplier's script, and the
   vendored script itself sits under `apps/common/vendor/`. Nowhere else in
   the tracked front end may the supplier's name, or a reference to its
   script, appear. Swapping the supplier then replaces one file and one
   vendored script.
2. **`callAPI` is gone, and no page names `llm/messages`** (§3: the dead
   helper called the route D2Dev's switch-off return §8.4 closed).

Run from the work tree: `python -m pytest -q tests` or `python tests/test_signin_boundary.py`.
Plain stdlib; no package to install.
"""

import re
import subprocess
import sys
from pathlib import Path

# ARTIE_FRONT_END_ROOT points the scan at another work tree: used to show the
# tests failing against a tree that breaks a boundary, without editing this one.
import os
ROOT = Path(os.environ.get("ARTIE_FRONT_END_ROOT") or Path(__file__).resolve().parents[1])
SUPPLIER_FILE = "apps/common/signin.js"
VENDOR_DIR = "apps/common/vendor/"
FRONT_END = (".js", ".html", ".php", ".css", ".json", ".md", ".txt")

# The supplier's name and its script, as the only two things that identify it.
SUPPLIER = re.compile(r"kinde", re.IGNORECASE)


def tracked_front_end_files():
    out = subprocess.run(["git", "ls-files"], cwd=ROOT, capture_output=True, text=True, check=True).stdout
    for line in out.splitlines():
        if line.startswith("tests/") or line.startswith(VENDOR_DIR) or line == SUPPLIER_FILE:
            continue
        if line.endswith(FRONT_END):
            yield line


def read(path):
    return (ROOT / path).read_text(encoding="utf-8", errors="replace")


def test_the_supplier_is_named_only_in_the_signin_component():
    offenders = [p for p in tracked_front_end_files() if SUPPLIER.search(read(p))]
    assert offenders == [], f"the supplier is named outside {SUPPLIER_FILE}: {offenders}"


def test_the_signin_component_is_the_only_loader_of_the_vendored_script():
    offenders = [p for p in tracked_front_end_files() if VENDOR_DIR in read(p)]
    assert offenders == [], f"a file other than {SUPPLIER_FILE} loads the vendored script: {offenders}"


def test_callapi_is_retired_and_no_page_names_the_closed_route():
    bad = []
    for p in tracked_front_end_files():
        text = read(p)
        if re.search(r"window\.callAPI\s*=|function callAPI\b|\bcallAPI\(", text):
            bad.append((p, "callAPI"))
        if "llm/messages" in text:
            bad.append((p, "llm/messages"))
    assert bad == [], bad


if __name__ == "__main__":
    failed = 0
    for name, fn in list(globals().items()):
        if name.startswith("test_") and callable(fn):
            try:
                fn()
                print(f"  PASS  {name}")
            except AssertionError as exc:
                failed += 1
                print(f"  FAIL  {name}: {exc}")
    print(f"\n{'all passed' if not failed else f'{failed} failed'}")
    sys.exit(1 if failed else 0)
