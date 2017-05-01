var FS_REDIRECT_URL = 'https://www.genquizitive.com/fs-login.html';
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
	$scope.step = 1;
	$scope.questions = 5;
	$scope.difficulty = 3;
	$scope.showLiving = false;
	$scope.mode = 'tree';
	if (!familysearchService.fsUser || !familysearchService.fsUser.id) {
		$location.path("/");
	} else {
	familysearchService.getAncestorTree(familysearchService.fsUser.id, 3, false).then(function(tree) {
		if (tree.persons) {
			angular.forEach(tree.persons, function(person) {
				$scope.tree[person.display.ascendancyNumber] = person;
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
	}
	
	$scope.searchForPerson = function() {
		if ($scope.search.id) {
			familysearchService.getPersonById($scope.search.id, true).then(function(person) {
				$scope.search.results = [person];
				$scope.search.error = null;
			}, function(error) {
				console.log(error);
				$scope.search.error = 'Unable to find person with id '+$scope.search.id;
			});
		} else {
			var searchParams = {};
			if ($scope.search.givenName) searchParams.givenName = $scope.search.givenName;
			if ($scope.search.surname) searchParams.surname = $scope.search.surname;
			if ($scope.search.birthDate) searchParams.birthDate = $scope.search.birthDate;
			if ($scope.search.birthPlace) searchParams.birthPlace = $scope.search.birthPlace;
			if (Object.keys(searchParams).length ==0) {
				$scope.search.error = "Please search by at least a first and last name.";
				return;
			}
			familysearchService.search(1, 10, searchParams).then(function(searchResults) {
				if (searchResults && searchResults.entries && searchResults.entries.content && searchResults.entries.content.gedcomx &&
							searchResults.entries.content.gedcomx.persons) {
					$scope.search.results = searchResults.entries.content.gedcomx.persons;
					angular.forEach($scope.search.results, function(person) {
						familysearchService.getPersonPortrait(person.id).then(function(path) {
							person.portrait = path.src;
						}, function(error) { })
					});
				} else {
					$scope.search.error = "No results matched your search.";
				}
			}, function(error) {
				console.log(error);
				$scope.search.error = "There was an error with your search.";
			});
		}
	};
	
	$scope.selectPerson = function(person) {
		if (person) {
			if (person.living) {
				notificationService.showConfirmation({title: 'Living Person', 
					message: person.display.name + ' is marked as a living person. Other players who join your game may be shown \
						details of this person during the game.\
						<br /><br />Are you sure you want to select a living person?'})
				.then(function() {
					$scope.person = person;
					$scope.step = 2;
				}, function() {
					$scope.step = 1;
				});
			} else {
				$scope.person = person;
				$scope.step = 2;
			}
		}
	};
	
	$scope.showStep = function(step) {
		if (step==1) {
			$scope.step = step;
		} else if (step==2 && $scope.person) {
			$scope.step = step;
		} else if (step==3 && $scope.person) {
			$scope.step = step;
		}
	};
})
;