<?php
// Minimal GnuBoard formmail_send.php fixture for hook-order contract tests.

$file = array();
for ($i=1; $i<=$attach; $i++) {
    if ($_FILES['file'.$i]['name']) {
        $file[] = attach_file($_FILES['file'.$i]['name'], $_FILES['file'.$i]['tmp_name']);
    }
}

$content = stripslashes($content);
if ($type == 2) {
    $type = 1;
    $content = str_replace("\n", "<br>", $content);
}

mailer($fnick, $fmail, $to, $subject, $mail_content, $type, $file, '', '', $reply_to_email);
