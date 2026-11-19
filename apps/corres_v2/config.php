<?php
/**
 * Serves this app's config.js to the browser, read directly from the
 * sibling config/ directory outside the public_html git tree — same
 * "real file lives outside, served via a relative read" approach
 * contact.php already uses for mail-config.php (see config/README.md).
 *
 * This is the earlier CorRes app, moved from apps/corres/ to apps/corres_v2/
 * when CR3 took apps/corres/ (OD's merge brief of 19 Nov 2026 §2.2). Its API,
 * /v2/corres/*, is unchanged; its config is config/apps/corres_v2/config.js.
 */
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');
readfile(__DIR__ . '/../../../config/apps/corres_v2/config.js');
