// Syntax check of the phase 3 front end: each JavaScript file, and each
// page's inline <script> blocks, compiled with vm.Script (parsed, never run).
// Then the strings and config files are loaded against a bare `window`, so a
// typo in either shows here rather than on beta.
//
//   node tests/harness/check.js <work tree root>
//
// On a machine without Node, VS Code's Electron will do:
//   ELECTRON_RUN_AS_NODE=1 "<VS Code>/Code.exe" tests/harness/check.js <root>
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = process.argv[2];
let failed = 0;
function check(label, src) {
  try { new vm.Script(src, { filename: label }); console.log('  ok    ' + label); }
  catch (e) { failed++; console.log('  FAIL  ' + label + ': ' + e.message); }
}
for (const f of ['edu_common.js', 'apps/common/signin.js', 'apps/common/metering.js', 'apps/common/metering_strings.js', 'apps/common/config.example.js', 'apps/common/vendor/kinde-auth-pkce-js-4.5.3.umd.min.js']) {
  check(f, fs.readFileSync(path.join(root, f), 'utf8'));
}
for (const page of ['apps/gioianie/index.html', 'apps/gioianie/gioianie_iterate.html', 'apps/sanzognie/index.html', 'apps/pluralitie/index.html']) {
  const html = fs.readFileSync(path.join(root, page), 'utf8');
  const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g;
  let m, i = 0;
  while ((m = re.exec(html))) check(`${page} inline script ${++i}`, m[1]);
}
// Load the two data files for real.
const window = {};
vm.runInNewContext(fs.readFileSync(path.join(root, 'apps/common/metering_strings.js'), 'utf8'), { window });
vm.runInNewContext(fs.readFileSync(path.join(root, 'apps/common/config.example.js'), 'utf8'), { window });
const S = window.ARTIE_STRINGS;
const keys = Object.keys(S).filter(k => /^S\d+$/.test(k));
console.log(`  strings: ${keys.length} S-numbers (${keys.join(' ')}), AD sighting: ${window.ARTIE_STRINGS_AD_SIGHTING.join(', ')}`);
const expect = ['S1.heading', 'S1.body', 'S1.email_label', 'S1.button', 'S2.heading', 'S2.body', 'S2.checkbox', 'S2.link_terms', 'S2.link_privacy', 'S2.button', 'S3.heading', 'S3.body', 'S4.text', 'S5.text', 'S6.text', 'S7.heading', 'S7.body', 'S7.partial_link', 'S7.topup', 'S7.topup_button', 'S7.team', 'S8.heading', 'S8.body', 'S9.heading', 'S9.body', 'S10.text', 'S11.text', 'S12.text', 'S13.text', 'S14.text', 'S15.text', 'S16.title', 'S16.projects', 'S16.project_line', 'S16.my_use', 'S16.signout'];
const missing = expect.filter(p => { const [k, s] = p.split('.'); return !(S[k] && typeof S[k][s] === 'string' && S[k][s].length); });
if (missing.length) { failed++; console.log('  FAIL  strings missing: ' + missing.join(', ')); } else console.log('  ok    all 36 strings of CD\'s note present');
const cfgKeys = Object.keys(window.ARTIE_AUTH_CONFIG);
console.log('  config keys: ' + cfgKeys.join(', '));
if (/kinde/i.test(JSON.stringify(window.ARTIE_AUTH_CONFIG))) { failed++; console.log('  FAIL  config example names the supplier'); }
console.log(failed ? `\n${failed} failed` : '\nall ok');
process.exitCode = failed ? 1 : 0;
