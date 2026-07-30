<?php
/**
 * Serves this app's config.js to the browser, read directly from the
 * sibling config/ directory outside the public_html git tree — same
 * "real file lives outside, served via a relative read" approach
 * contact.php already uses for mail-config.php (see config/README.md).
 */
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');
readfile(__DIR__ . '/../../../config/apps/pluralitie/config.js');
