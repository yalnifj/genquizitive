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
			$scope.loading = false;
		}
	}, function() { });
	
	
	$scope.createGame = function() {
		if (!$scope.fsLoggedIn) {
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
.controller('liveCreateGame', function($scope, $location, familysearchService, notificationService) {
	$scope.loading = false;
	$scope.search = {};
	$scope.tree = {};
	familysearchService.getAncestorTree(familysearchService.fsUser.id, 6, false).then(function(tree) {
		if (tree.persons) {
			angular.forEach(tree.persons, function(person) {
				$scope.tree[person.display.ancestryNumber] = person;
				familysearchService.getPersonPortrait(person.id).then(function(path) {
					person.portrait = path.src;
				},function(error){});
			});
		}
	}, function() {
		var notif = notificationService.showNotification({title: 'Family Tree Error', 
			message: 'Unable to retrieve data from your family tree.  Please go back and try again.', 
			closable: true});
		notif.show();
	});
	
	$scope.searchForPerson = function() {
	};
	
	$scope.selectPerson = function(person) {
		if (person) {
			
		}
	};
})
;