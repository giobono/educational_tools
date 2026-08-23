// config.example.js — committed template, for reference only. Never
// loaded directly: the real, working config.js lives outside this git
// tree entirely, in the sibling config/apps/pluralitie/ directory
// (config/README.md), and reaches the browser via this app's
// config.php, not a <script src> pointed at a static file.
//
// THE THREE ENVIRONMENTS
//   local    front end 127.0.0.1:5500   apiBase 'http://127.0.0.1:8000'
//   develop  beta.ebono.au              apiBase 'https://api-dev.ebono.net'
//   live     edu.ebono.au               apiBase 'https://api.ebono.net'
//
// apiBase is the API, not the web server. The two differ locally: 5500
// serves these pages, 8000 is artie. An earlier version of this file gave
// 5500 as the local apiBase, which is the front end pointing at itself.
//
// appActive: per-environment on/off switch for this app. false hides this
// app's links on the homepage and shared nav, and blocks direct access to
// its own pages (edu_common.js's enforceAppActive()).
//
// registrationRequired: shows the registration gate in place of step one
// and hides the workspace behind it (CD's gate strings v0.1, 23 Aug).
// Added 24 Aug because the gate is specified as showing "where the visitor
// is not registered" and this site has no registration mechanism for that
// to key to. Absent or false means no gate, which is what local and develop
// want while the copy is being worked on. Set true only on a surface that
// must display corres without letting it run.
//
// appVersion is hand-maintained here and disagrees between apps and with
// artie's own version. artie collapsed its five copies to one constant on
// 24 Aug; this front-end half is not yet sourced from anywhere canonical.

window.CORRES_CONFIG = {
  apiBase:    'http://127.0.0.1:8000',
  appId:      'pluralitie',
  appVersion: '1.1.0',
  appActive:  false,
  registrationRequired: false
};
