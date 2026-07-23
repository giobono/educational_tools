<?php
/**
 * mail-config.example.php — committed template.
 *
 * Real config lives one directory above the web root, at
 * repositories/educational_tools/config/mail-config.php — entirely
 * outside this git tree (local FS layout design's public_html/config
 * split), not merely gitignored-in-place. contact.php requires it via
 * __DIR__ . '/../config/mail-config.php'.
 *
 * Same underlying mailbox as ebono_au_site's own mail-config.php (one
 * organisation, one inbox) — copy that file's real values here rather
 * than provisioning a second mailbox.
 */

return [
    'host'       => 'smtp.hostinger.com',
    'port'       => 465,
    'encryption' => 'smtps', // matches PHPMailer::ENCRYPTION_SMTPS
    'username'   => 'REPLACE_ME',
    'password'   => 'REPLACE_ME',
    'from_email' => 'info@ebono.au',
    'from_name'  => 'ArtIE · The Ebono Institute',
];
