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
		http_response_code(401);
		print('Not authorized');
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

			print  $server_output ;
		}
	}
}
?>