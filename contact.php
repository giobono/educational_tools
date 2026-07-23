<?php
/**
 * contact.php — handles the educational_tools (edu.ebono.au) contact form.
 *
 * Adapted from ebono_au_site/contact.php (CD input v0.1 Part A item 6:
 * Geoff, 23 Jul — move the endpoint onto this site rather than posting
 * cross-origin to ebono.au and fighting CORS). Same PHPMailer usage.
 * SMTP credentials live in mail-config.php, in the sibling config/
 * directory outside this git tree (repositories/educational_tools/config/
 * mail-config.php) — not gitignored-in-place, per the local FS layout
 * design's public_html/config split.
 */

header('Content-Type: application/json');

function respond($ok, $error = null) {
    echo json_encode(['ok' => $ok, 'error' => $error]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    respond(false, 'Method not allowed');
}

// Honeypot: bots fill hidden fields, humans don't.
if (!empty($_POST['website'])) {
    // Pretend success so the bot doesn't retry, but send nothing.
    respond(true);
}

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$message = trim($_POST['message'] ?? '');

if ($name === '' || $email === '' || $message === '') {
    http_response_code(400);
    respond(false, 'All fields are required');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    respond(false, 'Please provide a valid email address');
}

if (mb_strlen($name) > 200 || mb_strlen($email) > 200 || mb_strlen($message) > 5000) {
    http_response_code(400);
    respond(false, 'Submission too long');
}

// Strip anything that looks like a header-injection attempt.
$strip = function ($value) {
    return str_replace(["\r", "\n"], ' ', $value);
};
$name  = $strip(htmlspecialchars($name));
$email = $strip($email);

$config = require __DIR__ . '/../config/mail-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/PHPMailer/Exception.php';
require __DIR__ . '/PHPMailer/PHPMailer.php';
require __DIR__ . '/PHPMailer/SMTP.php';

$body  = "New enquiry from the Correlating Resonance / ArtIE application (edu.ebono.au)\n\n";
$body .= "Name: {$name}\n";
$body .= "Email: {$email}\n\n";
$body .= "Challenge described:\n{$message}\n";

$mail = new PHPMailer(true);

try {
    $mail->isSMTP();
    $mail->Host       = $config['host'];
    $mail->SMTPAuth   = true;
    $mail->Username   = $config['username'];
    $mail->Password   = $config['password'];
    $mail->SMTPSecure = $config['encryption'] === 'smtps'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = $config['port'];

    $mail->setFrom($config['from_email'], $config['from_name']);
    $mail->addAddress('geoff.ebbs@ebono.com.au');
    $mail->addReplyTo($email, $name);

    $mail->Subject = "ArtIE enquiry: {$name}";
    $mail->Body    = $body;

    $mail->send();
    respond(true);
} catch (Exception $e) {
    http_response_code(500);
    respond(false, 'Message could not be sent — please try again later');
}
