<?php
$text = $_REQUEST["text"];
$words = file('badwords.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
foreach ($words as $key => $word) {
    $text = preg_replace("/$word/i", "", $text);
}
print($text);
?>