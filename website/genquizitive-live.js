var FS_REDIRECT_URL = 'https://www.genquizitive.com/fs-live.html';
angular.module('genquizitive-live', ['ngRoute','ngCookies','ngAnimate','ui.bootstrap', 
				'genquiz-components', 'genquiz.questions', 'genquiz.familytree','ngMap'])
.config(['$locationProvider', '$routeProvider', '$uibTooltipProvider',
    function config($locationProvider, $routeProvider, $uibTooltipProvider) {
		$uibTooltipProvider.options({popupDelay: 300});
      $routeProvider
		.when('/', {
			templateUrl: 'live-start.html'
        })
		.when('/:page', {
			templateUrl: function($routeParams) {
				return $routeParams.page +'.html';
			}
        })
		.otherwise({ redirectTo: '/' });
    }
])
.controller('livestart', function($scope, $location, familysearchService) {
	$scope.loading = false;
	familysearchService.fsLoginStatus().then(function(fsUser){
		if (fsUser.display) {
			$scope.fsLoggedIn = true;
			$scope.fsUserName = fsUser.display.name;
		} else {
			//location.reload();
			facebookService.setCanvasReady();
			$scope.loading = false;
		}
	}, function() { });
	
	
	$scope.createGame = function() {
		if ($scope.fsLoggedIn) {
			$location.path("/live-fs-intro");
		} else {
			$location.path("/live-create-game");
		}
	};
	
	$scope.joinGame = function() {
		$location.path("/live-join-game");
	};
})
.controller('livefamilytree', function($scope, $location, familysearchService) {
	$scope.loading = false;
	
	$scope.fsLogin = function() {
		familysearchService.fsLogin();
	};
})
.controller('livecreate', function($scope, $location, familysearchService) {
	$scope.loading = false;
	
})
;