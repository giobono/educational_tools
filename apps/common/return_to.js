/* ============================================================================
 * apps/common/return_to.js — where the browser goes after signing in
 *
 * One callback per host (OD brief to D1Dev of 25 Nov 2026, Part B.2.2). The
 * callback page returns the browser to the page that started sign-in, which
 * signIn() recorded in sessionStorage['artie.returnTo']. That value is
 * checked here before it is followed, so the callback cannot be used as an
 * open redirect: it must be on this origin, and its path must be the site
 * root or under /apps/. Anything else returns to the root.
 *
 *   artieSafeReturn(raw, origin) -> string   an absolute address
 * ============================================================================ */

(function () {
  'use strict';
  // A plain string check rather than URL(), so it behaves the same in every
  // engine, including the one the tests run in. Strict by construction: an
  // absolute address must begin with this origin and a slash; a relative one
  // must begin with exactly one slash; the path may hold no dot segment, no
  // backslash, no encoded dot or slash, and no whitespace or control code.
  window.artieSafeReturn = function artieSafeReturn(raw, origin) {
    const home = origin + '/';
    if (typeof raw !== 'string' || raw === '') return home;
    let rest;
    if (raw === origin) rest = '/';
    else if (raw.indexOf(origin + '/') === 0) rest = raw.slice(origin.length);
    else if (raw.charAt(0) === '/' && raw.charAt(1) !== '/' && raw.charAt(1) !== '\\') rest = raw;
    else return home;
    if (/[\s\u0000-\u001f\\]/.test(rest)) return home;
    const cut = rest.search(/[?#]/);
    const path = cut < 0 ? rest : rest.slice(0, cut);
    if (/%2e|%2f|%5c/i.test(path) || /(^|\/)\.\.?(\/|$)/.test(path)) return home;
    if (path !== '/' && path.indexOf('/apps/') !== 0) return home;
    return origin + rest;
  };
})();
