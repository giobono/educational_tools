<?php
/**
 * Serves the shared sign-in and metering config.js to the browser, read
 * directly from the sibling config/ directory outside the public_html git
 * tree — the same approach each app's own config.php uses (config/README.md).
 * One file for all four apps, because the sign-in supplier, the Terms links
 * and the allowance display are per surface, not per app.
 */
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');
readfile(__DIR__ . '/../../../config/apps/common/config.js');
