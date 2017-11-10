<?php
//print($_SERVER['HTTP_HOST']);
if ($_SERVER['HTTP_HOST']=='live.genquizitive.com') {
	header("Location: https://www.genquizitive.com/live".$_SERVER['REQUEST_URI']);
	exit();
}

session_start();
?>
<html>
<head>
	<title>GenQuizitive Live!</title>
	<meta name="theme-color" content="#000000" />
	<meta name="viewport" content="width=device-width,initial-scale=1.0" />
	<link rel="manifest" href="./manifest.json">
	<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">

<link rel="stylesheet" href="/genquizitive.css">
<link rel="stylesheet" href="/jquery-ui.min.css">
<link rel="icon" type="image/png" sizes="200x200" href="/logo_live_square.png">
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
<script src="/ui-bootstrap-tpls-2.5.0.min.js"></script>
<script src="/FamilySearch.js"></script>
<script src="genquizitive-live.js"></script>
<script src="backend.js"></script>
<script src="/components.js"></script>
<script src="/questions.js"></script>
<script src="/familytree.js"></script>
<script src="/affiliates.js"></script>
<script>
	function supported() {
		return !!document.createElement('canvas').getContext;
	}
	$(document).ready(function() {
		if (!supported()) {
			$('.showthelove').show();
		}
		if (isMobile()) {
			$.getScript("/jquery.ui.touch-punch.min.js");
		}
		checkPortrait();
		$(window).resize(function() {
			checkPortrait();
		});
	});

	var oldWidth = null;
	function checkPortrait() {
		var width = $(window).width();
		if (width!=oldWidth) {
			var wRatio = width / $(window).height();
			oldWidth = width;
			if (wRatio < 0.8) {
				window.portrait = true;
				$('body').addClass('portrait');
			} else {
				window.portrait = false;
				$('body').removeClass('portrait');
			}
			if (width < 400) {
				$('body').addClass('portrait-small');
			} else {
				$('body').removeClass('portrait-small');
			}
		}
	}
	
	function isMobile() {
	  try{ document.createEvent("TouchEvent"); return true; }
	  catch(e){ return false; }
	}
</script>
<script>
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-103628828-2', 'auto');
  ga('send', 'pageview');

</script>
<style>
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

	<div class="showthelove" style="display: none">
		<p>We are sorry, but this browser does not have the features required to play GenQuizitive.</p>
	</div>

</body>
</html>