<?php
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$filename = "photocache/errorlog.txt";
$file = fopen($filename, "a") or die('cannot open error log');
fwrite($file, $request->date.' '.$request->exception."\r\n");
if (!empty($request->cause)) fwrite($file, $request->date.' '.$request->cause."\r\n");
fclose($file);
print('Success');
?>