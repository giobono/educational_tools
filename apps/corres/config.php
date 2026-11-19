<?php
/**
 * Serves this app's config.js to the browser, read directly from the
 * sibling config/ directory outside the public_html git tree — the same
 * "real file lives outside, served via a relative read" approach every app
 * uses (see config/README.md).
 *
 * This is CR3 (CorRes methodology v3.0), at apps/corres/ since OD's merge
 * brief of 19 Nov 2026 §2.2. The page takes the engine's address (apiBase)
 * and the sign-in switch (requireSignIn) from here, never from a constant in
 * the page; the sign-in supplier's own settings come from
 * /apps/common/config.php.
 */
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');
readfile(__DIR__ . '/../../../config/apps/corres/config.js');
