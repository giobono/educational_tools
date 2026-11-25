/* ============================================================================
 * apps/common/signin.js — sign-in, behind one component
 *
 * Metering phase 3 (OD brief v1.1 of 19 Nov 2026, §4.1). **This is the only
 * front-end file that loads or calls the identity supplier's script.** Every
 * other file, edu_common.js included, uses only the three functions below.
 * Swapping the supplier replaces this file and the vendored script beside it,
 * and nothing else; tests/test_signin_boundary.py fails if the supplier's
 * name appears anywhere else.
 *
 *   getToken()            -> Promise<string|null>  the access token, or null
 *                            when signed out. Held in memory and refreshed by
 *                            the supplier's script; never written to storage.
 *   signIn(returnTo, hint) -> Promise<void>          redirects to the supplier's
 *                            sign-in page; the supplier returns to this host's
 *                            one callback, /auth/callback.html, which sends the
 *                            browser back to `returnTo` (checked by
 *                            return_to.js). `hint` is the email address, if the
 *                            person typed one.
 *   signOut()             -> Promise<void>          ends the session; returns
 *                            to the site root.
 *
 * Supplier: Kinde, as the phase 2 Part A trial confirmed (18 Nov 2026), via
 * @kinde-oss/kinde-auth-pkce-js 4.5.3, vendored as a plain UMD file under
 * vendor/ (MIT; the licence file sits beside it). PKCE in the browser: the
 * client ID is public and no secret exists or is used.
 *
 * Configuration (window.ARTIE_AUTH_CONFIG, served by apps/common/config.php
 * from the outside-git config/ tree): domain, clientId, audience. The
 * audience is the API the token is for (https://api-dev.ebono.net on beta);
 * without it the supplier issues a token with no `aud`, which the API
 * refuses (Part A, "For Part B" 1).
 * ============================================================================ */

(function () {
  'use strict';

  const VENDOR_SCRIPT = '/apps/common/vendor/kinde-auth-pkce-js-4.5.3.umd.min.js';
  let clientPromise = null;

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('The sign-in script could not be loaded.'));
      document.head.appendChild(s);
    });
  }

  // One callback per host (OD brief to D1Dev of 25 Nov 2026, Part B). Until
  // then every page was its own redirect address, in up to three spellings,
  // each registered at the supplier: 26 entries for four apps, and a missing
  // one a dead end. Now the supplier returns only to /auth/callback.html,
  // which completes the exchange and sends the browser back to the page that
  // started sign-in. The address is fixed and has no trailing slash, so the
  // 21 Nov loop (the supplier strips a trailing slash from the address in
  // the sign-in request but not in the exchange) cannot recur.
  const CALLBACK_PATH = '/auth/callback.html';
  const RETURN_KEY = 'artie.returnTo';

  // Followed once only. Both the supplier's callback hook and
  // artieCompleteSignIn() call this, one straight after the other; the first
  // reads and removes the stored address, so a second call would find nothing
  // and its replace() to the root, issued last, would win. That was the fault
  // found on beta on 25 Nov: every sign-in returned to the home page.
  let returned = false;
  function goBack() {
    if (returned) return;
    returned = true;
    let raw = null;
    try { raw = sessionStorage.getItem(RETURN_KEY); sessionStorage.removeItem(RETURN_KEY); } catch (_) { /* private mode */ }
    const safe = window.artieSafeReturn
      ? window.artieSafeReturn(raw, window.location.origin)
      : window.location.origin + '/';
    window.location.replace(safe);
  }

  function client() {
    if (clientPromise) return clientPromise;
    clientPromise = (async () => {
      const cfg = window.ARTIE_AUTH_CONFIG || {};
      if (!cfg.domain || !cfg.clientId) {
        throw new Error('ARTIE_AUTH_CONFIG not loaded — check apps/common/config.php is deployed and config/apps/common/config.js exists');
      }
      if (!window.createKindeClient) await loadScript(VENDOR_SCRIPT);
      return window.createKindeClient.default({
        client_id: cfg.clientId,
        domain: cfg.domain,
        audience: cfg.audience,
        redirect_uri: window.location.origin + CALLBACK_PATH,
        logout_uri: window.location.origin + '/',
        is_dangerously_use_local_storage: false,
        on_redirect_callback: () => {
          // Back from the supplier with a code, on the callback page: the
          // library has exchanged it. Return to the page that started.
          if (window.location.pathname === CALLBACK_PATH) { goBack(); return; }
          window.dispatchEvent(new CustomEvent('artie:signed-in'));
        },
      });
    })();
    return clientPromise;
  }

  window.getToken = async function getToken() {
    try {
      const k = await client();
      if (!(await k.isAuthenticated())) return null;
      return (await k.getToken()) || null;
    } catch (err) {
      console.warn('getToken:', err.message);
      return null;
    }
  };

  window.signIn = async function signIn(returnTo, hint) {
    const k = await client();
    // The callback page reads this to send the browser back (Part B.2.1).
    try { sessionStorage.setItem(RETURN_KEY, returnTo || window.location.href); } catch (_) { /* private mode */ }
    const options = {};
    if (hint) options.authUrlParams = { login_hint: hint };
    await k.login(options);
  };

  // Called by /auth/callback.html. Creating the client completes the code
  // exchange and fires on_redirect_callback, which returns the browser. If
  // there was no code (the page opened directly) or the exchange failed, the
  // browser still goes back, signed out, rather than staying here.
  window.artieCompleteSignIn = async function artieCompleteSignIn() {
    try { await client(); } catch (err) { console.warn('sign-in:', err.message); }
    if (window.location.pathname === CALLBACK_PATH) goBack();
  };

  window.signOut = async function signOut() {
    const k = await client();
    await k.logout();
  };
})();
