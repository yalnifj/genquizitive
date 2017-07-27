<?php
	session_start();
//-- TODO - process code and token with PHP for firebase custom auth
?>
<html>
<head>
	<title>GenQuizitive FamilySearch</title>
	<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<!-- Optional theme -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
<link rel="stylesheet" href="/genquizitive.css">

<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<script src="/FamilySearch.min.js"></script>
<style>
body {
	background-image: url('/live/live_background.jpg');
}
</style>
</head>
<body ng-app="genquizitive">
	<script>
var fs = new FamilySearch({
	environment: 'beta',
	//environment: 'integration',
	appKey: 'a02j000000JERmSAAX',
	redirectUri: 'https://www.genquizitive.com/fs-live.php',
	saveAccessToken: true,
	tokenCookie: 'FS_AUTH_TOKEN',
	maxThrottledRetries: 10
});

var fscheck = fs.oauthResponse(function(error, response){
	if (response && response.data) {
		$.post('/fs-proxy.php', {'FS_AUTH_TOKEN': response.data['access_token']});
		document.cookie = 'FS_AUTH_TOKEN='+response.data['access_token']+';path=/live';
		fs.setAccessToken(response.data['access_token']);
		//alert(response.data['access_token']);
		//alert(document.cookie);
		window.setTimeout(function() {
			window.location = 'https://www.genquizitive.com/live/#/live-create-game';
		}, 500);
	} else {
		window.location = 'https://www.genquizitive.com/live/';
	}
});

if (!fscheck) {
	window.location = 'https://www.genquizitive.com/live/';
}

	</script>
	<div class="center-div">
	<h3 style="color: white">Connecting to FamilySearch...</h3>
	<br /><br /><br />
	<img src="/images/loading1.png" />
	</div>
</body>
</html>