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
 *                            sign-in page; on return the browser comes back to
 *                            the page it left (the page is its own redirect
 *                            address, so no in-page hop is needed). `hint` is
 *                            the email address, if the person typed one.
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

  // The page is its own redirect address: origin + pathname, no query or
  // hash, so the supplier returns the browser to exactly this page and the
  // token is held in this page's memory from then on. Each page that signs
  // people in is therefore a registered callback address at the supplier.
  //
  // Without a trailing slash, deliberately (21 Nov 2026). The supplier's
  // library strips a trailing slash from the address it sends with the
  // sign-in request, but sends this value as given when it exchanges the
  // code; the two must match exactly or the exchange is refused with
  // invalid_grant. While /apps/corres answered 200, the browser came back
  // to the slashless page and the two happened to agree. The 301 to the
  // slash form (OD's brief of 21 Nov) broke that agreement, and every
  // sign-in looped. Both spellings are registered at the supplier; the
  // address bar keeps the slash form (below).
  function here() {
    return (window.location.origin + window.location.pathname).replace(/\/$/, '');
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
        redirect_uri: here(),
        logout_uri: window.location.origin + '/',
        is_dangerously_use_local_storage: false,
        on_redirect_callback: () => {
          // Back from the supplier with a code: the library has exchanged it.
          // Drop the ?code=&state= from the address bar without reloading.
          window.history.replaceState({}, document.title, window.location.origin + window.location.pathname);
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
    // returnTo is recorded for a caller that wants it after the round trip;
    // the redirect itself comes back to this page.
    try { sessionStorage.setItem('artie.returnTo', returnTo || window.location.href); } catch (_) { /* private mode */ }
    const options = {};
    if (hint) options.authUrlParams = { login_hint: hint };
    await k.login(options);
  };

  window.signOut = async function signOut() {
    const k = await client();
    await k.logout();
  };
})();
