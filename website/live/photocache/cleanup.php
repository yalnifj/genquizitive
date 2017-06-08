<?php
$dir = dir(".");

$count = 0;
if ($dir) {
    while (false !== ($entry = $dir->read())) {
        if ($entry!='.' && $entry!='..') {
            if (is_file($entry) && preg_match("/\.jpg/", $entry)) {
                $time = filemtime($entry);
                $diff = time() - $time;
                if ($diff > 60*60*24) {
                    unlink($entry);
                    print("Deleted old file $entry<br />\n");
                } else {
                    $count++;
                }
            }
        }
    }
}
print("$count cached images.");
?>