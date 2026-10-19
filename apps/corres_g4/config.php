<?php
/**
 * Serves this app's config.js to the browser, read from the sibling config/
 * directory outside the public_html git tree — the same approach
 * apps/corres/config.php uses, so a compromise of the web root cannot reach
 * the config.
 */
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');
readfile(__DIR__ . '/../../../config/apps/corres_g4/config.js');
