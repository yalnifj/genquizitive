angular.module('genquizitive', ['ui.bootstrap'])
.controller('getstarted', function($scope, $uibModal) {
	$scope.isLoggedIn = false;
	
	$scope.fs = new FamilySearch({
	  //environment: 'production',
	  environment: 'sandbox',
	  appKey: 'a02j000000JERmSAAX',
	  redirectUri: 'http://genquizitive.com/fsoauth.php',
	  saveAccessToken: true,
	  tokenCookie: 'FS_AUTH_TOKEN',
	  maxThrottledRetries: 10
	});
	
	$scope.fsLogin = function() {
		$scope.fs.oauthRedirect();
	};
	
	$scope.fsHandleOathResponse = function(response) {
		if (response) {
			console.log(response);
			if (response.statusCode == 200) {
				
			}
		}
	};
	
	$scope.fbLogin = function() {
		FB.login(function(response) {
			console.log(response.status);
			if (response.status === 'connected') {
				// Logged into your app and Facebook.
			} else if (response.status === 'not_authorized') {
				// The person is logged into Facebook, but not your app.
			} else {
				// The person is not logged into Facebook, so we're not sure if
				// they are logged into this app or not.
			}
		}, {scope: 'public_profile,email,user_friends,user_relationships'});
	};
	
	$scope.play = function() {
		
		FB.getLoginStatus(function(response) {
			console.log(response.status);
			if (response.status === 'connected') {
				// Logged into your app and Facebook.
				$scope.fsLogin();
			} else if (response.status === 'not_authorized') {
				// The person is logged into Facebook, but not your app.
				$scope.fbLogin();
			} else {
				// The person is not logged into Facebook, so we're not sure if
				// they are logged into this app or not.
				$scope.fbLogin();
			}
		});

	};
	
	$scope.FBok = function() {
		$scope.modalInstance.dismiss();
		$scope.showFS();
	}
	
	$scope.FSok = function() {
		$scope.modalInstance.dismiss();
		$scope.isLoggedIn = true;
	}
	
	$scope.cancel = function() {
		$scope.modalInstance.dismiss();
	}
	
	$scope.showFS = function() {
		$scope.modalInstance = $uibModal.open({
		  templateUrl: 'familysearch-modal.html',
		  scope: $scope
		});
	};
})
;