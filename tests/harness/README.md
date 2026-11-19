# Metering front-end harness (off-canon)

Kept on the branch `scratch/metering-harness` only, under OD's response to
D1Dev's phase 3 return (19 Nov 2026, §2). **Never merged into `develop`:** beta
serves the work tree, so anything on `develop` is published. Whether this
becomes a standing regression suite is decided after promotion.

Two files:

- **`harness.html`** drives every state of `apps/common/metering.js` and the
  metering parts of `edu_common.js` against a stubbed `/v1/account`, with no
  network and no sign-in supplier: S1 signed out; S4/S5/S6 and the
  `X-Allowance-*` headers; the `allowanceDisplay` switch; S16; S7 (as amended
  19 Nov) and S8, from a 402 and from a cancelled task; S9–S15 by code; S2 →
  accept → retry; S3; `callAPI` retired. Serve the work tree root and open it:

      python -m http.server 8010 --bind 127.0.0.1
      http://127.0.0.1:8010/tests/harness/harness.html

  The `<pre>` lists PASS/FAIL per check and ends `HARNESS-DONE`.

- **`check.js`** parses every front-end script and inline block (never runs
  them) and loads the strings and config example for real:

      node tests/harness/check.js .

Written by D1Dev on 19 Nov 2026. It was not run in a browser before it was
committed: headless Edge on the Windows machine hangs without writing the
page. The first run is owed, and its result goes in a return.
