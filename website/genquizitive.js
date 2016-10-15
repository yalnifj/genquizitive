angular.module('genquizitive', ['ui.bootstrap'])
.controller('getstarted', function($scope, $uibModal) {
	$scope.isLoggedIn = false;
	
	$scope.play = function() {
		
		FB.getLoginStatus(function(response) {
			if (response.status === 'connected') {
				// Logged into your app and Facebook.
			} else if (response.status === 'not_authorized') {
				// The person is logged into Facebook, but not your app.
			} else {
				// The person is not logged into Facebook, so we're not sure if
				// they are logged into this app or not.
			}
		});
		
		$scope.modalInstance = $uibModal.open({
		  templateUrl: 'facebook-modal.html',
		  scope: $scope
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