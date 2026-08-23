<?php
/**
 * Server-side enforcement of the appActive flag.
 *
 * The flag stays the single control — this file changes nothing about how an
 * application is switched on or off. What changes is where the decision is
 * enforced: enforceAppActive() in edu_common.js runs after the server has
 * already sent the whole document, so anything reading HTML without executing
 * it receives the full page (CD dispatch to OD, 23 August, §1). This reads the
 * same config.js apps-enabled.php reads, and decides before a byte of the
 * application is sent.
 *
 * Turning an application on remains one edit to one config file, outside the
 * web root and outside git, exactly as before.
 */
$app  = preg_replace('/[^a-z]/', '', $_GET['app'] ?? '');
$page = preg_replace('/[^a-z0-9_.-]/', '', $_GET['page'] ?? 'index.html');

$allowed = ['gioianie', 'sanzognie', 'corres', 'pluralitie'];
if (!in_array($app, $allowed, true) || strpos($page, '..') !== false) {
    http_response_code(404);
    exit;
}

// noindex on these paths in BOTH flag states, so switching an application on
// for beta does not silently switch indexing on with it (CD §4).
header('X-Robots-Tag: noindex, nofollow');

$configPath = __DIR__ . "/../config/apps/$app/config.js";
$active = true;  // absent config leaves the app reachable, matching apps-enabled.php
if (is_file($configPath) && preg_match('/appActive\s*:\s*(true|false)/', file_get_contents($configPath), $m)) {
    $active = $m[1] === 'true';
}

if (!$active) {
    // 403, not 404: the path exists and is switched off. A 404 would be a false
    // statement about the estate. Nothing describing the application is sent.
    http_response_code(403);
    header('Content-Type: text/html; charset=utf-8');
    // D1Dev's switched-off page, reproduced from enforceAppActive() in
    // edu_common.js so the two routes render identically. Naming the
    // application discloses nothing: the requester already has the name, it is
    // in the URL they asked for. Kept self-contained — no stylesheet, no
    // script — so it renders whatever else is unreachable.
    $name = htmlspecialchars($app, ENT_QUOTES, 'UTF-8');
    echo '<!doctype html><html lang="en"><head><meta charset="utf-8">'
       . '<meta name="robots" content="noindex, nofollow">'
       . '<title>Not available</title>'
       . '<style>body{font-family:sans-serif;background:#05070a;color:#eee;display:flex;'
       . 'align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center;}'
       . 'a{color:#7ec8e3;}</style></head><body><div>'
       . '<h1>Not available in this environment</h1>'
       . "<p>$name is currently switched off here.</p>"
       . '<p><a href="/">Return to the homepage</a></p>'
       . '</div></body></html>';
    exit;
}

$target = __DIR__ . "/apps/$app/$page";
if (!is_file($target)) { http_response_code(404); exit; }
header('Content-Type: text/html; charset=utf-8');
readfile($target);
