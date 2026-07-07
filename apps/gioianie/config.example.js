// config.example.js — committed template.
// Copy to config.js in this same directory; config.js is gitignored
// (see .gitignore's bare `config.js` line — matches at any depth).
//
// Local (interim, on VPS):       apiBase: 'https://api-local.ebono.net'
// Local (target, on laptop):     apiBase: 'http://localhost:8001'
// Dev:                           apiBase: 'https://api-dev.ebono.net'
// Prod:                          apiBase: 'https://api.ebono.net'

window.CORRES_CONFIG = {
  apiBase:    'https://api-local.ebono.net',
  appId:      'gioianie',
  appVersion: '0.9.6'
};
