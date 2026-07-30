<?php
/**
 * Aggregates all four apps' appActive flags into one shared object, for
 * pages that need to know about apps OTHER than their own — the root
 * homepage's phase-cards and the shared nav fragment (edu_header.html),
 * both of which link to every app, not just one.
 *
 * Each app's own config.js (sibling config/ directory, config/README.md)
 * remains the single source of truth for its own appActive flag; this
 * just reads all four rather than introducing a second, separately-
 * maintained flag set that could drift from them.
 */
header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-store');

$apps = ['gioianie', 'sanzognie', 'corres', 'pluralitie'];
$enabled = [];

foreach ($apps as $app) {
    $path = __DIR__ . "/../config/apps/$app/config.js";
    $active = true; // fail open: an unreadable/unparseable config leaves the app visible, not hidden
    if (is_file($path)) {
        $contents = file_get_contents($path);
        if (preg_match('/appActive\s*:\s*(true|false)/', $contents, $matches)) {
            $active = $matches[1] === 'true';
        }
    }
    $enabled[$app] = $active;
}

echo 'window.APPS_ENABLED = ' . json_encode($enabled) . ';' . PHP_EOL;
