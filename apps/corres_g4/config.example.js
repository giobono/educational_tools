// config.example.js — committed template, for reference only. The real
// config.js lives outside this git tree, in config/apps/corres_g4/, and
// reaches the browser through config.php. Never loaded directly.
//
// THE THREE ENVIRONMENTS
//   local    front end 127.0.0.1:5500   apiBase 'http://127.0.0.1:8000'
//   develop  beta.ebono.au              apiBase 'https://api-dev.ebono.net'
//   live     edu.ebono.au               apiBase 'https://api.ebono.net'
//
// apiBase is artie, not the web server. The two differ locally: 5500 serves
// these pages, 8000 is artie.
//
// appActive: per-environment switch. KEEP THIS false UNTIL AD HAS SIGHTED
// method_strings.js (Charter §2.3, build brief v0.2 §8). Nothing in that file
// has been through AD yet, so beta must not show this app.
// appId reaches the researcher: edu_common.js's enforceAppActive() names it
// on the "not available" page. appVersion is hand-maintained here, as every
// other app's is -- the front-end half is not yet sourced from anywhere
// canonical, and platform invariant 7 covers new *contracts*, not this.
window.CORRES_CONFIG = {
  apiBase:    'http://127.0.0.1:8000',
  appId:      'corres_g4',
  appVersion: '0.1.0',
  appActive:  false,
  registrationRequired: false,
};
