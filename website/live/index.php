<?php
session_start();
?>
<html>
<head>
	<title>GenQuizitive Live!</title>
	<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<link rel="stylesheet" href="/genquizitive.css">
<link rel="stylesheet" href="/jquery-ui.min.css">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<script type="text/javascript"> if (!window.console) console = {log: function() {}}; </script>
<script src="https://code.jquery.com/jquery-2.2.4.min.js" integrity="sha256-BbhdlvQf/xTY9gja0Dq3HiwQF8LaCRTXxZKRutelT44=" crossorigin="anonymous"></script>
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular-route.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular-cookies.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.5.8/angular-animate.min.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDPoCYaty65dtD_aUGZTt6c-k6Goy8IPJ0"></script>
<script src="/ng-map.min.js"></script>
<script src="/markerclusterer.js"></script>
<script src="/jquery-ui.min.js"></script>
<script src="/ui-bootstrap-tpls-2.2.0.min.js"></script>
<script src="/FamilySearch.min.js"></script>
<script src="genquizitive-live.js"></script>
<script src="backend.js"></script>
<script src="/components.js"></script>
<script src="/questions.js"></script>
<script src="/familytree.js"></script>
<script>
	$(document).ready(function() {
		if (isMobile()) {
			$.getScript("jquery.ui.touch-punch.min.js");
		}
		/*
		var arrow = 3;
		var arrows = [];
		arrows[0] = new Image();
		arrows[0].src = '/images/home_arrow1.png';
		arrows[1] = new Image();
		arrows[1].src = '/images/home_arrow2.png';
		arrows[2] = new Image();
		arrows[2].src = '/images/home_arrow3.png';
		window.setInterval(function() {
			arrow--;
			if (arrow < 0) arrow = 2;
			$('#home_arrows').attr('src', arrows[arrow].src);
		}, 400);
		*/
	});
	
	function isMobile() {
	  try{ document.createEvent("TouchEvent"); return true; }
	  catch(e){ return false; }
	}
</script>
<<style>
body {
	background-image: url('/live/live_background.jpg');
}
</style>
</head>
<body ng-app="genquizitive-live" backgrounds="">	
	<script src="https://www.gstatic.com/firebasejs/3.7.5/firebase-app.js"></script>
	<script src="https://www.gstatic.com/firebasejs/3.7.5/firebase-auth.js"></script>
	<script src="https://www.gstatic.com/firebasejs/3.7.5/firebase-database.js"></script>
	<script src="https://www.gstatic.com/firebasejs/3.7.5/firebase-messaging.js"></script>
	
	<script>
	  // Initialize Firebase
	  var config = {
		apiKey: "AIzaSyARR_SULy80oiyuSVr5WRNIOQ1fwZW5X1Y",
		authDomain: "genquizitive-live.firebaseapp.com",
		databaseURL: "https://genquizitive-live.firebaseio.com",
		projectId: "genquizitive-live",
		storageBucket: "genquizitive-live.appspot.com",
		messagingSenderId: "623511946977"
	  };
	  firebase.initializeApp(config);
	</script>
	
	<div ng-view></div>

</body>
</html>