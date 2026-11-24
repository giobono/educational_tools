// config.example.js — committed template, for reference only. Never loaded
// directly: the real, working config.js lives outside this git tree, in the
// sibling config/apps/corres/ directory (config/README.md), and reaches the
// browser via this app's config.php.
//
// CR3 (CorRes methodology v3.0) at apps/corres/, OD's merge brief of 19 Nov
// 2026 §2.1–§3.
//
//   apiBase        the API that serves the engine under /v3/corres: the
//                  page builds every call from it, never from a constant
//                    local    'http://127.0.0.1:8000'
//                    beta     'https://api-dev.ebono.net'
//                    live     'https://api.ebono.net'
//   appActive      the per-environment on/off switch, read by app_gate.php
//                  and apps-enabled.php as for every app
//   // sampleLiveRuns: offer "run it now" beside a sample's stored result.
  // Off for the launch (CD brief of 20 Nov 2026 §3.2); CD turns it on per surface.
  sampleLiveRuns: false,
  requireSignIn  the page's half of the sign-in switch (§3). true: the
//                  page signs people in through /apps/common/signin.js and
//                  sends the token on every call; the API's half is
//                  ARTIE_CORRES_REQUIRE_SIGNIN. With both false, CR3 runs
//                  with no sign-in. true on beta from the first smoke test
//   articlesBase   optional: where a hover's "Read more" link points; left
//                  out, hovers carry no link

window.CORRES_CONFIG = {
  apiBase:       'http://127.0.0.1:8000',
  appId:         'corres',
  appActive:     true,
  requireSignIn: true
};
