<?php
/**
 * The commit of educational_tools this surface serves, read from the tree's
 * own .git (OD's brief to D2Dev of 26 Nov 2026, §2.5: the page shows the
 * commits it runs on). Twelve characters of a sha, nothing else.
 */
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$git = dirname(__DIR__, 2) . '/.git';
$sha = '';
$head = @file_get_contents("$git/HEAD");
if ($head !== false) {
    $head = trim($head);
    if (strpos($head, 'ref: ') === 0) {
        $ref = substr($head, 5);
        $sha = trim((string) @file_get_contents("$git/$ref"));
        if ($sha === '' && is_file("$git/packed-refs")) {
            foreach (file("$git/packed-refs") as $line) {
                if (substr(trim($line), -strlen($ref)) === $ref) { $sha = substr($line, 0, 40); break; }
            }
        }
    } else {
        $sha = $head;
    }
}
echo json_encode(['commit' => preg_match('/^[0-9a-f]{40}$/', $sha) ? substr($sha, 0, 12) : null]);
