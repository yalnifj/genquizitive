<?php
session_start();

if (!empty($_POST['FS_AUTH_TOKEN'])) {
	$_SESSION['FS_AUTH_TOKEN'] = $_POST['FS_AUTH_TOKEN'];
} else if (!empty($_REQUEST['getToken'])) {
	print $_SESSION['FS_AUTH_TOKEN'];
} else {
	if (empty($_REQUEST['url'])) {
		http_response_code(404);
		print('Not Found');
	}
	else if (empty($_SESSION['FS_AUTH_TOKEN'])) {
		$url = $_REQUEST['url'];
		if (preg_match('/\.jpg/', $url)) {
			$parts = explode("/", $url);
			$filename = $parts[count($parts)-2];
			$filename = "live/photocache/".$filename.".jpg";

			if (file_exists($filename)) {
				readfile($filename);
			} else {
				http_response_code(401);
				print('Not authorized');
			}
		} else {
			http_response_code(401);
			print('Not authorized');
		}
	}
	else {
		$url = $_REQUEST['url'];
		if (!preg_match('/^https:\/\/\w+\.familysearch.org/', $url)) {
			http_response_code(404);
			print('invalid domain');
		} else {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

			$headers = [
				'Authorization: Bearer '.$_SESSION['FS_AUTH_TOKEN'],
				'Origin: http://www.genquizitive.com',
				'Accept: */*'
			];

			curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
			$server_output = curl_exec ($ch);
			curl_close ($ch);

			//https://integration.familysearch.org/sandbox/v2/TH-999-51839-150-73/thumb200.jpg?ctx=ArtCtxPublic
			if (preg_match('/\.jpg/', $url)) {
				$parts = explode("/", $url);
				$filename = $parts[count($parts)-2];
				$filename = "live/photocache/".$filename.".jpg";

				$file = fopen($filename, "w");
				fwrite($file, $server_output);
				fclose($file);
			}

			print  $server_output ;
		}
	}
}
?>