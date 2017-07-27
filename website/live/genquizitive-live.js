var FS_REDIRECT_URL = 'https://www.genquizitive.com/fs-login.html';
angular.module('genquizitive-live', ['ngRoute','ngCookies','ngAnimate','ui.bootstrap', 
				'genquiz-components', 'genquiz.questions', 'genquiz.familytree',
				'ngMap','genquiz.live.backend','genquiz-affiliates'])
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
.directive('liveLogo', function($timeout) {
	return {
		scope: {
			delay: '=?'
		},
		link: function($scope, $element, $attr) {
			if (!$scope.delay) {
				$scope.delay = 500;
			}
			$scope.randomTime = function(min, max) {
				var num = min + (Math.random() * (max-min));
				return Math.round(num);
			};
			$scope.images = [
				new Image(),
				new Image(),
				new Image(),
				new Image()
			];
			$scope.images[0].src = '/live/t_logo_a.png';
			$scope.images[1].src = '/live/t_logo_b.png';
			$scope.images[2].src = '/live/t_logo_c.png';
			$scope.images[3].src = '/live/t_logo_d.png';
			$scope.timings = [
				{time: $scope.randomTime($scope.delay, 500+$scope.delay), image: 0},
				{time: $scope.randomTime(50, 100), image: 1},
				{time: $scope.randomTime(50, 100), image: 0},
				{time: $scope.randomTime(50, 100), image: 1},
				{time: $scope.randomTime(100, 200), image: 0},
				{time: $scope.randomTime(100, 200), image: 1},
				{time: $scope.randomTime(50, 100), image: 2},
				{time: $scope.randomTime(100, 200), image: 1},
				{time: $scope.randomTime(50, 100), image: 0},
				{time: $scope.randomTime(50, 100), image: 1},
				{time: $scope.randomTime(200, 300), image: 2},
				{time: $scope.randomTime(50, 100), image: 3},
				{time: $scope.randomTime(200, 300), image: 2},
				{time: -1, image: 3}
			];
			$scope.state = 0;
			$element.css('background-image', "url('"+$scope.images[$scope.timings[$scope.state].image].src+"')");
			$scope.runState = function() {
				$timeout(function() {
					$scope.state++;
					$element.css('background-image', "url('"+$scope.images[$scope.timings[$scope.state].image].src+"')");
					if ($scope.timings[$scope.state].time > 0) {
						$scope.runState();
					}
				}, $scope.timings[$scope.state].time);
			};
			$scope.runState();
			$timeout(function() {
				var audio = new Audio('/live/flicker.mp3');
				audio.play();
			}, $scope.delay+500);
		}
	}
})
.directive('neonImage', function($timeout) {
	return {
		scope: {
			delay: '=?'
		},
		link: function($scope, $element) {
			if (!$scope.delay) {
				$scope.delay = 500;
			}
			var srcOff = $element.attr('src');
			var srcOn = srcOff.replace("_off", "_on");
			var img = new Image();
			img.src = srcOn;
			$scope.randomTime = function(min, max) {
				var num = min + (Math.random() * (max-min));
				return Math.round(num);
			};
			$scope.timings = [
				{time: $scope.randomTime($scope.delay,500+$scope.delay), src: srcOff},
				{time: $scope.randomTime(50,100), src: srcOn},
				{time: $scope.randomTime(50,100), src: srcOff},
				{time: $scope.randomTime(100,200), src: srcOn},
				{time: $scope.randomTime(100,200), src: srcOff},
				{time: $scope.randomTime(50,100), src: srcOn},
				{time: $scope.randomTime(50,100), src: srcOff},
				{time: -1, src: srcOn}
			];
			$scope.state = 0;
			$scope.runState = function() {
				$timeout(function() {
					$scope.state++;
					$element.attr('src', $scope.timings[$scope.state].src);
					if ($scope.timings[$scope.state].time > 0) {
						$scope.runState();
					}
				}, $scope.timings[$scope.state].time);
			};
			$scope.runState();
		}
	}
})
.controller('livestart', function($scope, $location, familysearchService, backendService, $log, $http) {
	$scope.$emit('changeBackground', '/live/live_background.jpg');
	$scope.loading = false;

	$http.get("/ads.js").then(function() {
		$scope.adblocker = false;
	}, function() {
		$scope.adblocker = true;
	});

	familysearchService.fsLoginStatus().then(function(fsUser){
		if (fsUser.display) {
			$scope.fsLoggedIn = true;
			$scope.fsUserName = fsUser.display.name;
			backendService.authenticate().then(function(firebaseUser) {
				$log.error("succesfully authenticated with firebase");
			}, function(error) {
				$log.error("unable to authenticate with firebase "+error);
			});
		} else {
			$scope.loading = false;
		}
	}, function(error) {
		$log.error(error);
		$scope.loading = false;
	 });
	
	
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
	
	$scope.leaveGame = function() {
		$location.path('/');
	};

	$scope.fsLogin = function() {
		familysearchService.fsLogin();
	};
})
.controller('liveCreateGame', function($scope, $location, $q, $http, $cookies, familysearchService, notificationService, backendService, languageService, $log) {
	$scope.$emit('changeBackground', '/live/live_background.jpg');
	$scope.loading = false;
	$scope.search = {};
	$scope.tree = {};
	$scope.step = 1;
	$scope.questions = 5;
	$scope.difficulty = 2;
	$scope.showLiving = false;
	$scope.mode = 'loading';
	$scope.portrait = window.portrait;
	familysearchService.fsLoginStatus().then(function(fsUser){
		if (fsUser) {
			//TODO store screen name in firebase user
			$scope.screenName = languageService.shortenName(fsUser.display.name);
			$scope.getTree(familysearchService.fsUser.id, 4, 1);

			backendService.authenticate().then(function(firebaseUser) {
				$log.error("succesfully authenticated with firebase");
				backendService.getOwnerGenQuiz().then(function(genQuiz) {
					$scope.genQuizRound = genQuiz;
					backendService.currentGenQuiz = $scope.genQuizRound;
					$scope.person = genQuiz.person;
					$scope.step = 4;
					var generations = $scope.genQuizRound.difficulty + 1;
					familysearchService.clearCache();
					familysearchService.loadInitialData($scope.genQuizRound.person.id, generations, $scope.genQuizRound.difficulty - 2);
					backendService.watchPlayers();
				}, function() {

				});
			}, function(error) {
				$log.error("unable to authenticate with firebase "+error);
			});
		} else {
			$location.path("/");
		}
	}, function(msg) {
		var messageText = msg;
		if (msg.errors && msg.errors[0] && msg.errors[0].message) {
			messageText = msg.errors[0].message;
		}
		notificationService.showConfirmation({title: "Family Tree Error", 
				message: messageText, showCancelButton: false, confirmButtonText: "Ok"})
		.then(function() {
			$location.path("/");
		});
	});

	$scope.shortenName = function(name) {
		var shortName = languageService.fitName(name, 16);
		return shortName;
	};

	$scope.showArrow = function(num) {
		var par = num * 2;
		for(var g=0; g<$scope.arrowLevels.length; g++) {
			if ($scope.arrowLevels[g].anum==par) {
				return false;
			}
		}
		return ($scope.tree[par] || $scope.tree[par+1] || $scope.tree[par+2] || $scope.tree[par+3]);
	};

	$scope.arrowLevels = [];
	$scope.arrowClicked = function(num, index) {
		$scope.activeArrow = num;
		var par = num * 2;
		var found = false;
		for(var i=0; i<8; i++) {
			var gpar = i+(par*2);
			if ($scope.tree[gpar]) {
				found = true;
				break;
			}
		}
		if (!found) {
			for(var i=0; i<2; i++) {
				if ($scope.tree[num+i]) {
					$scope.getTree($scope.tree[num+i].id, 4, $scope.tree[num+i].display.ascendancyNumber);
				}
			}
		}
		var newLevels = [];
		var gen = Math.floor(Math.log2(par));
		gen = Math.pow(2, gen);
		for(var g=0; g<$scope.arrowLevels.length; g++) {
			if ($scope.arrowLevels[g].anum<gen) {
				newLevels.push($scope.arrowLevels[g]);
			}
		}
		$scope.arrowLevels = newLevels;
		$scope.arrowLevels.unshift({anum: par, line: index});
	};

	$scope.getTree = function(personId, generations, baseNum) {
		familysearchService.getAncestorTree(personId, generations, false).then(function(tree) {
			$scope.mode = 'tree';
			if (tree.persons) {
				angular.forEach(tree.persons, function(person) {
					if (person.display.ascendancyNumber.indexOf("S") < 0) {
						var gen = Math.floor(Math.log2(person.display.ascendancyNumber));
						var tn = (baseNum * Math.pow(2,gen)) + (person.display.ascendancyNumber - Math.pow(2,gen));
						if (!$scope.tree[tn] || !$scope.tree[tn].id) {
							$scope.tree[tn] = person;
							familysearchService.getPersonPortrait(person.id).then(function(path) {
								person.portrait = path.src;
							},function(error){
								if (person.gender.type=="http://gedcomx.org/Female") {
									person.portrait = '/images/female_sil.png';
								} else if (person.gender.type=="http://gedcomx.org/Male") {
									person.portrait = '/images/male_sil.png';
								} else {
									person.portrait = '/images/unknown_sil.png';
								}
							});
						}
					}
				});
			}
		}, function() {
			var notif = notificationService.showNotification({title: 'Family Tree Error', 
				message: 'Unable to retrieve data from your family tree.  Please go back and try again.', 
				closable: true});
			notif.show();
		});
	};
	
	$scope.searchForPerson = function() {
		$scope.search.error = null;
		if ($scope.search.id) {
			familysearchService.getPersonById($scope.search.id, true).then(function(person) {
				$scope.search.results = [person];
				$scope.search.error = null;
			}, function(error) {
				$log.error(error);
				$scope.search.error = 'Unable to find person with id '+$scope.search.id;
			});
		} else {
			var searchParams = {};
			if ($scope.search.givenName) searchParams.givenName = $scope.search.givenName;
			if ($scope.search.surname) searchParams.surname = $scope.search.surname;
			if ($scope.search.birthDate) searchParams.birthDate = $scope.search.birthDate;
			if ($scope.search.birthPlace) searchParams.birthPlace = $scope.search.birthPlace;
			if ($scope.search.gender) searchParams.gender = $scope.search.gender;
			if (Object.keys(searchParams).length ==0) {
				$scope.search.error = "Please search by at least a first and last name.";
				return;
			}
			familysearchService.search(1, 10, searchParams, true).then(function(searchResults) {
				if (searchResults && searchResults.entries) {
					$scope.search.results = searchResults.entries;
					angular.forEach($scope.search.results, function(entry) {
						var person = entry.content.gedcomx.persons[0];
						familysearchService.getPersonPortrait(person.id).then(function(path) {
							person.portrait = path.src;
						}, function(error) { })
					});
				} else {
					$scope.search.error = "No results matched your search.";
				}
			}, function(error) {
				$log.error(error);
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
						Are you sure you want to select a living person?'})
				.then(function() {
					$scope.person = person;
					$scope.showLiving = person.living;
					$scope.showStep(2);
				}, function() {
					$scope.showStep(1);
				});
			} else {
				$scope.person = person;
				$scope.showLiving = person.living;
				$scope.showStep(2);
			}
		}
	};

	$scope.getTempId = function() {
		var tempId = '';
		if ($scope.person.names && $scope.person.names.length>0) {
			if ($scope.person.names[0].nameForms && $scope.person.names[0].nameForms.length > 0) {
				var nameForm = $scope.person.names[0].nameForms[0];
				if (nameForm.parts && nameForm.parts.length > 0) {
					for(var p=0; p<nameForm.parts.length; p++) {
						if (nameForm.parts[p].type=="http://gedcomx.org/Surname") {
							tempId = nameForm.parts[p].value.toLowerCase().replace(/[^a-z0-9]/g, "");
							break;
						}
					}
				}
			}
		}
		if (tempId!='') {
			for(var i=0; i<3; i++) {
				var r = Math.floor(Math.random() * 10);
				tempId += r;
			}
		}
		if (tempId=='' || tempId.length < 4) {
			tempId = $scope.getRandomId();
		}
		if (tempId.length > 31) {
			tempId = tempId.substr(0, 31);
		}
		return tempId;
	};

	$scope.getRandomId = function() {
		var tempId = '';
		for(var i=0; i<8; i++) {
			var r = Math.floor(Math.random() * 10);
			tempId += r;
		}
		return tempId;
	};

	$scope.createGenQuiz = function() {
		if (!$scope.genQuizRound) {
			$scope.genQuizRound = {};
			$scope.genQuizRound.person = {id: $scope.person.id, display: $scope.person.display};
			if ($scope.person.portrait) {
				//todo - store temporary copy of image for unauth access
				$scope.genQuizRound.person.portrait = $scope.person.portrait;
			}
			$scope.genQuizRound.id = $scope.getTempId();
			$scope.genQuizRound.creator = $scope.screenName;
			$scope.genQuizRound.questionCount = $scope.questions;
			$scope.genQuizRound.currentQuestionNum = 0;
			$scope.genQuizRound.showLiving = $scope.showLiving;
			$scope.genQuizRound.difficulty = $scope.difficulty;
			$scope.checkId($scope.genQuizRound.id).then(function(exists) {
				if (exists) {
					$scope.genQuizRound.id = $scope.getTempId();
				}
			});
		}
	};

	$scope.checkId = function(gameId) {
		var deferred = $q.defer();
		backendService.checkId(gameId).then(function(exists) {
			$scope.idExists = exists;
			deferred.resolve($scope.idExists);
		});
		return deferred.promise;
	};
	
	$scope.showStep = function(step) {
		if (step==1) {
			$scope.step = step;
		} else if (step==2 && $scope.person) {
			$scope.step = step;
		} else if (step==3 && $scope.person) {
			$scope.createGenQuiz();
			$scope.step = step;
		} else if (step==4 && $scope.person && $scope.genQuizRound && !$scope.genQuizRound.error) {
			$scope.checkId($scope.genQuizRound.id).then(function(exists){
				if (exists) {
					$scope.genQuizRound.error = "This id is unavailable.  Please enter another game id.";
				} else {
					if (!$scope.genQuizRound.creator || $scope.genQuizRound.creator.length < 3) {
						$scope.genQuizRound.error = "Your name must be at least 3 characters long.";
					} else {
						$http.get('/badwordfilter.php?text='+encodeURIComponent($scope.genQuizRound.creator)).then(function(response){
							$scope.genQuizRound.creator = response.data;
							if ($scope.genQuizRound.creator.length < 3) {
								$scope.nameError = 'Please include at least 3 characters in your name.';
							} else {
								$scope.genQuizRound.error = null;
								$scope.genQuizRound.ready = true;
								$scope.genQuizRound.creator = $scope.screenName;
								$scope.genQuizRound.questionCount = $scope.questions;
								$scope.genQuizRound.currentQuestionNum = 0;
								$scope.genQuizRound.showLiving = $scope.showLiving;
								$scope.genQuizRound.difficulty = $scope.difficulty;
								backendService.writeGenQuiz($scope.genQuizRound);
								backendService.currentGenQuiz = $scope.genQuizRound;
								$scope.step = step;
								$scope.player = {name: $scope.genQuizRound.creator, score: 0};
								backendService.addPlayer($scope.player);
								backendService.currentPlayer = $scope.player;
								$cookies.putObject('player', $scope.player);
								var generations = $scope.genQuizRound.difficulty + 1;
								familysearchService.clearCache();
								familysearchService.loadInitialData($scope.genQuizRound.person.id, generations, $scope.genQuizRound.difficulty - 2);
								backendService.watchPlayers();
							}
						});
					}
				}
			});
		}
	};

	$scope.startGame = function() {
		$location.path("/live-genquiz");
	};

	$scope.leaveGame = function() {
		if ($scope.genQuizRound && $scope.genQuizRound.id) {
			notificationService.showConfirmation({title: 'Quit GenQuiz?', message: 'You have an active GenQuiz game.  If you leave now your game will end.\
				  Are you sure you want to leave?'}).then(function(result) {
				if (result) {
					backendService.removeGenQuiz($scope.genQuizRound);
					$location.path('/');
				}
			}, function() {

			});
		} else {
			$location.path('/');
		}
	};

	$scope.$on('playersChanged', function(event, players) {
		$scope.players = players;
		$scope.player = $cookies.getObject("player");
		if (!$scope.player || !$scope.player.id) {
			$scope.player = {name: $scope.genQuizRound.creator, score: 0};
			backendService.addPlayer($scope.player);
			$cookies.putObject('player', $scope.player);
		} else {
			if (!$scope.players[$scope.player.id]) {
				backendService.addPlayer($scope.player);
				$cookies.putObject('player', $scope.player);
			}
		}
		backendService.currentPlayer = $scope.player;
	});
})
.directive('genquizId', function(backendService, $http) {
	return {
		restrict: 'A',
		scope: {
			genQuizRound: '='
		},
		template: '<div contenteditable="true" class="editable-id">{{genQuizRound.id}}</div>\
			<div class="alert alert-danger" ng-show="genQuizRound.error">{{genQuizRound.error}}</div>',
		link: function($scope, $element, $attrs) {
			var d = $element.children(".editable-id").on('blur keypress', function() {
				var text = $(this).text();
				$scope.genQuizRound.id = text.replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
				$scope.checkGameId();
			});

			$scope.checkGameId = function() {
				$http.get('/badwordfilter.php?text='+encodeURIComponent($scope.genQuizRound.id)).then(function(response) {
					$scope.genQuizRound.id = response.data;
					if ($scope.genQuizRound.id.length < 4) {
						$scope.genQuizRound.error = "The id must be at least 4 characters long.";
						return;
					}
					if ($scope.genQuizRound.id.length > 31) {
						$scope.genQuizRound.error = "The id must be less than 32 characters long.";
						return;
					}
				
					backendService.checkId($scope.genQuizRound.id).then(function(exists) {
						if (exists) {
							$scope.genQuizRound.error = "This id is unavailable.  Please enter another game id.";
						} else {
							$scope.genQuizRound.error = null;
						}
					});
				});
			}
		}
	};
})
.controller('liveJoinGame', function($scope, $location, $q, $http, $cookies, notificationService, backendService, languageService) {
	$scope.data = {};
	$scope.data.genQuizId = null;
	$scope.data.playerName = "";

	$scope.genQuizRound = null;

	$scope.joinGame = function() {
		$scope.nameError = null;
		$scope.idError = null;
		$http.get('/badwordfilter.php?text='+encodeURIComponent($scope.data.playerName)).then(function(response){
			$scope.data.playerName = response.data;
			if (!$scope.data.playerName || $scope.data.playerName.length < 3) {
				$scope.nameError = "Please include at least 3 characters in your name.";
				return;
			}
			if (!$scope.data.genQuizId || $scope.data.genQuizId.length < 4 || $scope.data.genQuizId.length > 31) {
				$scope.idError = "Please enter a valid GenQuiz Game Id. A valid GenQuiz ID \
				can be obtained from your friend who created it.";
				return;
			}
			$scope.checkGenQuiz();
		});
	};

	$scope.checkGenQuiz = function() {
		$scope.data.genQuizId = $scope.data.genQuizId.toLowerCase();
		backendService.getGenQuizById($scope.data.genQuizId).then(function(genQuizRound) {
			if (!genQuizRound.ended) {
				$scope.genQuizRound = genQuizRound;
				backendService.currentGenQuiz = $scope.genQuizRound;
				if (!$scope.player) {
					$scope.player = {name: $scope.data.playerName, score: 0};
					backendService.addPlayer($scope.player);
					$cookies.putObject('player', $scope.player);
					if ($scope.genQuizRound.currentQuestionId) {
						$location.path('/live-question');
					}
					else {
						//-- wait for game start signal
						backendService.watchForQuestion($scope.genQuizRound.id);
						backendService.watchGenQuizById($scope.genQuizRound.id);
					}
				} else {
					backendService.getPlayers().then(function(players) {
						if (!players[$scope.player.id]) {
							backendService.addPlayer($scope.player);
							$cookies.putObject('player', $scope.player);
						}
						backendService.watchGenQuizById($scope.genQuizRound.id);
						if ($scope.genQuizRound.currentQuestionId) {
							$location.path('/live-question');
						}
						else {
							//-- wait for game start signal
							backendService.watchForQuestion($scope.genQuizRound.id);
							backendService.watchPlayers();
						}
					});
				}
				backendService.currentPlayer = $scope.player;
				$cookies.put('genQuizId', $scope.genQuizRound.id);
			}
			else {
				if ($scope.data.genQuizId == $cookies.get("genQuizId")) {
					$scope.data.genQuizId = '';
				}
				$cookies.remove("genQuizId");
			}
		}, function(error) {
			$scope.idError = error;
		});
	};

	$scope.leaveGame = function() {
		if ($scope.genQuizRound && $scope.player && $scope.player.id) {
			notificationService.showConfirmation({title: 'Leave GenQuiz?', message: 'You have already joined an active GenQuiz game.\
				  Are you sure you want to leave?'}).then(function(result) {
				if (result) {
					backendService.removePlayer($scope.player.id);
					$cookies.remove("genQuizId");
					$location.path('/');
				}
			}, function() {

			});
		} else {
			$cookies.remove("genQuizId");
			$location.path("/");
		}
	};

	$scope.player = $cookies.getObject("player");
	if ($scope.player) {
		$scope.data.genQuizId = $cookies.get("genQuizId");
		$scope.data.playerName = $scope.player.name;
		if ($scope.data.genQuizId) {
			$scope.checkGenQuiz();
		}
	}

	$scope.$on('$destroy', function() {
		backendService.unWatchQuestion();
		backendService.unWatchPlayers();
	});

	$scope.$on('questionAdded', function(event, question) {
		if (question && question.name && 
				(!backendService.currentQuestion || backendService.currentQuestion.id != question.id)) {
			backendService.currentQuestion = question;
			$location.path('/live-question');
		}
	});

	$scope.$on('genQuizRemoved', function(event, genQuiz) {
		var notif = notificationService.showNotification({title: 'GenQuiz Ended', 
			message: 'We\'re sorry, but the owner of this GenQuiz has ended the game.  Press ok to continue.', 
			closable: true});
		notif.close = function() {
			notif.element.remove();
			$cookies.remove("genQuizId");
			$location.path("/");
		};
		notif.show();
	});

	$scope.$on('playersChanged', function(event, players) {
		$scope.players = players;
		$scope.player = $cookies.getObject("player");
		if (!$scope.player || !$scope.player.id) {
			$scope.player = {name: $scope.genQuizRound.creator, score: 0};
			backendService.addPlayer($scope.player);
			$cookies.putObject('player', $scope.player);
		} else {
			if (!$scope.players[$scope.player.id]) {
				backendService.addPlayer($scope.player);
				$cookies.putObject('player', $scope.player);
			}
		}
		backendService.currentPlayer = $scope.player;
	});
})
.controller('liveGenQuiz', function($scope, $location, $q, $interval, $timeout, notificationService, backendService, 
			languageService, QuestionService, $log) {
	$scope.$emit('changeBackground', '/live/live_background.jpg');

	$scope.genQuizRound = backendService.currentGenQuiz;
	if (!$scope.genQuizRound) {
		$location.path('/live-create-game');
		return;
	}

	$scope.maxQuestions = $scope.genQuizRound.questionCount;
	$scope.currentQuestion = $scope.genQuizRound.currentQuestionNum;
	$scope.minute = 0;
	$scope.second = 0;	
	$scope.loadingTime = 0;
	$scope.maxTime = 2 * 60 * 1000;
	$scope.missedQuestions = 0;
	$scope.startTime = new Date();
	$scope.blinkerStarted = false;

	$scope.interval = $interval(function() {
		if ($scope.interval && $scope.startTime && $scope.currentQuestion < $scope.maxQuestions) {
			if ($scope.question && $scope.question.isReady) {
				var d = new Date();
				var diff = $scope.maxTime - (d.getTime() - $scope.startTime.getTime() - ($scope.loadingTime*1000));
				$scope.minute = Math.floor(diff / (1000*60));
				$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
				if (diff <= 10000 && !$scope.blinkerStarted) {
						var audio = new Audio('/live/blinker.mp3');
						audio.play();
						$scope.blinkerStarted = true;
					}
				if (diff <= 0) {
					$scope.abandon();
				}
			} else {
				$scope.loadingTime++;
			}
		} else {
			$scope.loadingTime++;
		}
	}, 1000);

	$scope.getRandomQuestion = function() {
		var nextQ = QuestionService.getRandomQuestion();
		while($scope.questionPersistence && $scope.questionPersistence.name==nextQ.name) {
			nextQ = QuestionService.getRandomQuestion();
		}
		return nextQ;
	};

	$scope.setupQuestion = function(num, tries) {
		if (tries == 0) {
			$scope.question = $scope.getRandomQuestion();
		}
		if (tries < 5) {
			$log.error('trying question '+$scope.question.name+' setup again '+tries);
			$scope.question.error = null;
			$scope.question.setup($scope.genQuizRound.difficulty, $scope.genQuizRound.showLiving, $scope.genQuizRound.person).then(function() {
				$log.error('successfully setup question '+$scope.question.name);
				var q = $scope.question.getPersistence();
				backendService.persistQuestion(q, $scope.genQuizRound.id, $scope.currentQuestion);
				$scope.genQuizRound.currentQuestionId = q.id;
				var audio = new Audio('/live/vroom.mp3');
				audio.play();
			}, function(error) {
				$log.error('failed to setup question '+$scope.question.name+'. error='+$scope.question.error);
				$scope.setupQuestion($scope.genQuizRound.difficulty, tries+1);
			});
		} else {
			$log.error('too many fails try a new question');
			tries = 0;
			$scope.question.error = null;
			$scope.question = $scope.getRandomQuestion();
			$scope.question.setup($scope.genQuizRound.difficulty, $scope.genQuizRound.showLiving, $scope.genQuizRound.person).then(function() {
				$log.error('successfully setup question '+$scope.question.name);
				var q = $scope.question.getPersistence();
				backendService.persistQuestion(q, $scope.genQuizRound.id, $scope.currentQuestion);
				$scope.genQuizRound.currentQuestionId = q.id;
				var audio = new Audio('/live/vroom.mp3');
				audio.play();
			}, function(error) {
				$log.error('failed to setup question '+$scope.question.name+'. error='+$scope.question.error);
				$scope.setupQuestion($scope.genQuizRound.difficulty, tries+1);
			});
		}
	};

	$scope.nextQuestion = function() {
		$scope.tries = 0;
		$scope.question.completeTime = (new Date()).getTime();

		if ($scope.interval) {
			$interval.cancel($scope.interval);
			$scope.interval = null;
		}

		// save players score
		var d = new Date();
		var diff = $scope.maxTime - (d.getTime() - $scope.startTime.getTime() - ($scope.loadingTime*1000));
		if (diff < 0) {
			diff = 0;
		}
		var score = {time: diff, missed: $scope.missedQuestions};
		backendService.savePlayerQuestionScore(backendService.currentPlayer.id, $scope.genQuizRound.currentQuestionId, 
					$scope.genQuizRound.id, score);

		$timeout(function() {
			if ($scope.currentQuestion < $scope.maxQuestions-1) {
				//-- wait for all players to answer
				$location.path('/live-wait');
			} else {
				//-- no more questions go to scoreboard
				$location.path('/live-scoreboard');
			}
		}, 1500);
	}

	$scope.$watch('question.isReady', function(newval, oldval) {
		if (newval!=oldval && newval==true) {
			$scope.question.startTime = (new Date()).getTime();
		}
	});

	$scope.abandon = function() {
		$scope.missedQuestions++;
		var audio = new Audio('/live/car_horn2.mp3');
		audio.play();
		$scope.nextQuestion();
	};

	$scope.skip = function() {
		notificationService.showConfirmation({title: 'Leave GenQuiz?', message: 'Are you sure you want skip this question? You will receive no score for this question.'}).then(function() {
			$scope.maxTime = 0;
			$scope.abandon();
		});
	};

	$scope.$on('questionCorrect', function(event, question) {
		var audio = new Audio('/live/car_horn3.mp3');
		audio.play();
		$scope.nextQuestion();
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
		var audio = new Audio('/live/car_horn2.mp3');
		audio.play();
	});

	$scope.$on('$destroy', function() {
		if ($scope.interval) {
			$interval.cancel($scope.interval);
		}
		$scope.interval = null;
	});

	if ($scope.genQuizRound.currentQuestionId) {
		backendService.getQuestionById($scope.genQuizRound.currentQuestionId, $scope.genQuizRound.id).then(function(question) {
			$scope.questionPersistence = question;
			$scope.setupQuestion($scope.currentQuestion, 0);
		});
	} else {
		$scope.setupQuestion($scope.currentQuestion, 0);
	}
})
.controller('liveQuestion', function($scope, $location, $q, $interval, $timeout, $cookies, notificationService, 
				backendService, languageService, QuestionService) {
	$scope.$emit('changeBackground', '/live/live_background.jpg');

	$scope.genQuizRound = backendService.currentGenQuiz;
	if (!$scope.genQuizRound) {
		$location.path("/");
		return;
	}

	$scope.maxQuestions = $scope.genQuizRound.questionCount;
	$scope.currentQuestion = $scope.genQuizRound.currentQuestionNum;
	$scope.minute = 0;
	$scope.second = 0;	
	$scope.loadingTime = 0;
	$scope.maxTime = 2 * 60 * 1000;
	$scope.missedQuestions = 0;
	$scope.startTime = new Date();
	$scope.blinkerStarted = false;

	$scope.interval = $interval(function() {
		if ($scope.interval && $scope.startTime && $scope.currentQuestion < $scope.maxQuestions) {
			if ($scope.startTime && $scope.currentQuestion < $scope.maxQuestions) {
				if ($scope.question && $scope.question.isReady) {
					var d = new Date();
					var diff = $scope.maxTime - (d.getTime() - $scope.startTime.getTime() - ($scope.loadingTime*1000));
					$scope.minute = Math.floor(diff / (1000*60));
					$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
					if (diff <= 10000 && !$scope.blinkerStarted) {
						var audio = new Audio('/live/blinker.mp3');
						audio.play();
						$scope.blinkerStarted = true;
					}
					if (diff <= 0) {
						$scope.abandon();
					}
				} else {
					$scope.loadingTime++;
				}
			}
		} else {
			$scope.loadingTime++;
		}
	}, 1000);

	$scope.setupQuestion = function() {
		$scope.question = QuestionService.getQuestionByName($scope.questionPersistence.name);
		$scope.question.setupFromPersistence($scope.questionPersistence);
		$scope.question.id = $scope.questionPersistence.id;
		var audio = new Audio('/live/vroom.mp3');
		audio.play();
	};

	if (backendService.currentQuestion != null) {
		$scope.questionPersistence = backendService.currentQuestion;
		$scope.setupQuestion();
	} else if ($scope.genQuizRound.currentQuestionId) {
		backendService.getQuestionById($scope.genQuizRound.currentQuestionId, $scope.genQuizRound.id).then(function(question) {
			$scope.questionPersistence = question;
			$scope.setupQuestion();
		});
	} else {
		$location.path('/');
	}

	$scope.saveScore = function() {
		if ($scope.interval) {
			$interval.cancel($scope.interval);
			$scope.interval = null;
		}
		// save players score
		var d = new Date();
		var diff = $scope.maxTime - (d.getTime() - $scope.startTime.getTime() - ($scope.loadingTime*1000));
		if (diff < 0) {
			diff = 0;
		}
		var score = {time: diff, missed: $scope.missedQuestions};
		backendService.savePlayerQuestionScore(backendService.currentPlayer.id, $scope.question.id, 
					$scope.genQuizRound.id, score);
	}

	$scope.abandon = function() {
		$scope.missedQuestions++;
		var audio = new Audio('/live/car_horn2.mp3');
		audio.play();
		// update score and go to wait screen
		$scope.saveScore();
		if ($scope.currentQuestion < $scope.maxQuestions-1) {
			$location.path('/live-question-wait');
		} else {
			$location.path('/live-scoreboard');
		}
	};

	$scope.skip = function() {
		notificationService.showConfirmation({title: 'Leave GenQuiz?', message: 'Are you sure you want skip this question? You will receive no score for this question.'}).then(function() {
			$scope.maxTime = 0;
			$scope.abandon();
		});
	};

	$scope.$on('questionCorrect', function(event, question) {
		// update score and go to wait screen
		$scope.saveScore();
		var audio = new Audio('/live/car_horn3.mp3');
		audio.play();
		if ($scope.interval) {
			$interval.cancel($scope.interval);
		}
		$scope.interval = null;
		$timeout(function() {
			if ($scope.currentQuestion < $scope.maxQuestions-1) {
				$location.path('/live-question-wait');
			} else {
				$location.path('/live-scoreboard');
			}
		}, 1500);
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
		var audio = new Audio('/live/car_horn2.mp3');
		audio.play();
	});

	$scope.$on('genQuizRemoved', function(event, genQuiz) {
		var notif = notificationService.showNotification({title: 'GenQuiz Ended', 
			message: 'We\'re sorry, but the owner of this GenQuiz has ended the game.  Press ok to continue.', 
			closable: true});
		notif.close = function() {
			notif.element.remove();
			$cookies.remove("genQuizId");
			$location.path("/");
		};
		notif.show();
	});

	$scope.$on('$destroy', function() {
		if ($scope.interval) {
			$interval.cancel($scope.interval);
		}
		$scope.interval = null;
	});
})
.controller('liveWait', function($scope, $location, $cookies, backendService, notificationService) {
	$scope.$emit('changeBackground', '/live/live_background.jpg');
	$scope.genQuizRound = backendService.currentGenQuiz;

	if (!$scope.genQuizRound) {
		$location.path('/');
		return;
	}

	$scope.allScored = false;
	$scope.players = backendService.currentPlayers;
	$scope.scoredPlayers = {};

	backendService.watchPlayerScores($scope.genQuizRound.currentQuestionId, $scope.genQuizRound.id);

	$scope.$on('$destroy', function() {
		backendService.unWatchPlayerScores();
	});

	$scope.nextQuestion = function() {
		if (!$scope.allScored) {
			notificationService.showConfirmation({title: 'Continue?', message: 'We are still waiting for some players to answer.\
					Are you sure you want to continue to the next question?'}).then(function() {
						$scope.allScored = true;
						$scope.nextQuestion();
			});
		} else {
			$scope.genQuizRound.currentQuestionNum++;
			backendService.updateQuestionNum($scope.genQuizRound);
			if ($scope.genQuizRound.currentQuestionNum < $scope.genQuizRound.questionCount) {
				$location.path('/live-genquiz');
			} else {
				$location.path('/live-scoreboard');
			}
		}
	};

	$scope.leaveGame = function() {
		notificationService.showConfirmation({title: 'End GenQuiz?', message: 'Are you sure you want to end this QenQuiz? Any players\
					currently in the game will no longer be able to continue.'}).then(function() {
			if ($scope.genQuizRound && $scope.genQuizRound.id) {
				backendService.unWatchPlayers();
				backendService.removeGenQuiz($scope.genQuizRound);
			}
			$location.path('/');
		});
	};

	$scope.$on('playerScores', function(event, playerScores) {
		var updated = false;
		angular.forEach(playerScores, function(score, playerId){
			if (!$scope.players[playerId]) {
				$scope.players[playerId] = {name: "unknown", id: playerId, score: 0};
			}
			if (!$scope.scoredPlayers[playerId]) {
				updated = true;
				$scope.scoredPlayers[playerId] = true;
				var score = (score.time/1000)  - (score.missed * 20);
				if (score < 0) score = 0;
				$scope.players[playerId].score += score;
			}
		});
		if (updated) {
			backendService.updatePlayers($scope.players);
		}
		if (Object.keys($scope.players).length == Object.keys($scope.scoredPlayers).length) {
			$scope.allScored = true;
		}
		$scope.playerArray = Object.keys($scope.players).map(function(key) {
			return angular.copy($scope.players[key]);
		});
	});
})
.controller('liveQuestionWait', function($scope, $location, $cookies, backendService, notificationService) {
	$scope.$emit('changeBackground', '/live/live_background.jpg');
	$scope.genQuizRound = backendService.currentGenQuiz;

	if (!$scope.genQuizRound) {
		$location.path('/');
		return;
	}

	//-- watch for player scores
	backendService.watchPlayerScores($scope.genQuizRound.currentQuestionId, $scope.genQuizRound.id);
	backendService.watchPlayers();
	//-- wait for game start signal
	backendService.watchForQuestion($scope.genQuizRound.id);

	$scope.leaveGame = function() {
		notificationService.showConfirmation({title: 'Leave GenQuiz?', message: 'Are you sure you want to leave this QenQuiz?'}).then(function() {
			backendService.removePlayer(backendService.currentPlayer);
			$cookies.remove("genQuizId");
			$location.path('/');
		});
	};

	$scope.scoredPlayers = {};
	$scope.$on('playerScores', function(event, playerScores) {
		var updated = false;
		angular.forEach(playerScores, function(score, playerId){
			if (!$scope.players[playerId]) {
				$scope.players[playerId] = {name: "unknown", id: playerId, score: 0};
			}
			if (!$scope.scoredPlayers[playerId]) {
				updated = true;
				$scope.scoredPlayers[playerId] = true;
			}
		});
	});

	$scope.$on('playersChanged', function(event, players) {
		$scope.players = players;
		if ($scope.players) {
			$scope.playerArray = Object.keys($scope.players).map(function(key) {
				return $scope.players[key];
			});
		} else {
			$scope.playerArray = [];
		}
	});

	$scope.$on('questionAdded', function(event, question) {
		if (question && question.name && 
					(!backendService.currentQuestion || backendService.currentQuestion.id != question.id)) {
			if (!question.players || !question.players[backendService.currentPlayer.id]) {
				backendService.currentQuestion = question;
				$location.path('/live-question');
			}
		}
	});

	$scope.$on('genQuizRemoved', function(event, genQuiz) {
		var notif = notificationService.showNotification({title: 'GenQuiz Ended', 
			message: 'We\'re sorry, but the owner of this GenQuiz has ended the game.  Press ok to continue.', 
			closable: true});
		notif.close = function() {
			notif.element.remove();
			$cookies.remove("genQuizId");
			$location.path("/");
		};
		notif.show();
	});

	$scope.$on('$destroy', function() {
		backendService.unWatchPlayers();
		backendService.unWatchPlayerScores();
		backendService.unWatchQuestion();
	});
})
.controller('liveScoreboard', function($scope, $location, backendService, $rootScope, affiliateService) {
	$scope.$emit('changeBackground', '/images/score_background.jpg');
	$scope.genQuizRound = backendService.currentGenQuiz;

	$scope.leaveGame = function() {
		if ($scope.genQuizRound && $scope.genQuizRound.id) {
			backendService.endGenQuiz($scope.genQuizRound);
		}
		$location.path('/');
	};

	affiliateService.showLargeAd();

	backendService.getPlayers().then(function(players) {
		$scope.players = players;
		$scope.playerArray = Object.keys($scope.players).map(function(key) {
			return angular.copy($scope.players[key]);
		});
	});
})
;