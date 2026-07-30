// config.example.js — committed template, for reference only. Never
// loaded directly: the real, working config.js lives outside this git
// tree entirely, in the sibling config/apps/pluralitie/ directory
// (config/README.md), and reaches the browser via this app's
// config.php, not a <script src> pointed at a static file.
//
// Local (target, on laptop):     apiBase: 'http://127.0.0.1:5500'
// Dev:                           apiBase: 'https://api-dev.ebono.net'
// Prod:                          apiBase: 'https://api.ebono.net'
//
// appActive: per-environment on/off switch for this app. false hides
// this app's links on the homepage and shared nav, and blocks direct
// access to its own pages (edu_common.js's enforceAppActive()).

window.CORRES_CONFIG = {
  apiBase:    'http://127.0.0.1:5500',
  appId:      'pluralitie',
  appVersion: '0.9.6',
  appActive:  true
};
