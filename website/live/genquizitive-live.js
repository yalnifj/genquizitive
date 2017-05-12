var FS_REDIRECT_URL = 'https://www.genquizitive.com/fs-live.php';
angular.module('genquizitive-live', ['ngRoute','ngCookies','ngAnimate','ui.bootstrap', 
				'genquiz-components', 'genquiz.questions', 'genquiz.familytree',
				'ngMap','genquiz.live.backend'])
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
.controller('livestart', function($scope, $location, familysearchService, backendService) {
	$scope.loading = false;
	familysearchService.fsLoginStatus().then(function(fsUser){
		if (fsUser.display) {
			$scope.fsLoggedIn = true;
			$scope.fsUserName = fsUser.display.name;
			backendService.authenticate().then(function(firebaseUser) {
				console.log("succesfully authenticated with firebase");
			}, function(error) {
				console.log("unable to authenticate with firebase "+error);
			});
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
.controller('liveCreateGame', function($scope, $location, $q, familysearchService, notificationService, backendService, languageService) {
	$scope.loading = false;
	$scope.search = {};
	$scope.tree = {};
	$scope.step = 1;
	$scope.questions = 5;
	$scope.difficulty = 3;
	$scope.showLiving = false;
	$scope.mode = 'tree';
	familysearchService.fsLoginStatus().then(function(fsUser){
		if (fsUser) {
			//TODO store screen name in firebase user
			$scope.screenName = languageService.shortenName(fsUser.display.name);
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

			backendService.authenticate().then(function(firebaseUser) {
				console.log("succesfully authenticated with firebase");
			}, function(error) {
				console.log("unable to authenticate with firebase "+error);
			});
		} else {
			$location.path("/");
		}
	}, function() {
		$location.path("/");
	});
	
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
					$scope.showStep(2);
				}, function() {
					$scope.showStep(1);
				});
			} else {
				$scope.person = person;
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
			$scope.genQuizRound.id = $scope.getTempId();
			$scope.genQuizRound.creator = $scope.screenName;
			$scope.genQuizRound.questionCount = $scope.questions;
			$scope.genQuizRound.showLiving = $scope.showLiving;
			$scope.genQuizRound.difficulty = $scope.difficulty;
			$scope.genQuizRound.currentQuestion = 0;
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
					if (exists) {
						$scope.genQuizRound.error = "This id is unavailable.  Please enter another game id.";
					} else {
						if (!$scope.genQuizRound.creator || $scope.genQuizRound.creator.length < 3) {
							$scope.genQuizRound.error = "Your name must be at least 3 characters long.";
						} else {
							$scope.genQuizRound.error = null;
							$scope.genQuizRound.ready = true;
							backendService.writeGenQuiz($scope.genQuizRound);
							backendService.currentGenQuiz = $scope.genQuizRound;
							$scope.step = step;
							backendService.watchPlayers();
							backendService.addPlayer({name: $scope.genQuizRound.creator, score: 0});
						}
					}
				}
			});
		}
	};

	$scope.startGame = function() {
		$location.path("/live-genquiz");
	};

	$scope.$on('playersChanged', function(event, players) {
		$scope.players = players;
	});
})
.directive('genquizId', function(backendService) {
	return {
		restrict: 'A',
		scope: {
			genQuizRound: '='
		},
		template: '<div contenteditable="true" class="editable-id">{{genQuizRound.id}}</div>\
			<div class="alert alert-danger" ng-show="genQuizRound.error">{{genQuizRound.error}}</div>',
		link: function($scope, $element, $attrs) {
			$element.children('div').on('blur keyup change', function() {
				var text = $(this).text();
				text = text.replaceAll(/[^a-zA-Z0-9]/g, "");
				if (text != $scope.genQuizRound.id) {
					$scope.genQuizRound.id = text;
					$scope.checkGameId();
					$scope.$apply();
				}
			});

			$scope.checkGameId = function() {
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
			}
		}
	};
})
.controller('liveJoinGame', function($scope, $location, $q, notificationService, backendService, languageService) {
	$scope.genQuizId = null;
	$scope.playerName = null;

	$scope.genQuizRound = null;

	$scope.joinGame = function() {
		$scope.nameError = null;
		$scope.idError = null;
		if (!$scope.playerName || $scope.playerName.length < 3) {
			$scope.nameError = "Please include at least 3 characters in your name.";
			return;
		}
		if (!$scope.genQuizId || $scope.genQuizId.length < 4 || $scope.genQuizId.length > 31) {
			$scope.idError = "Please enter a valid GenQuiz Game Id. A valid GenQuiz ID \
			can be obtained from your friend who created it.";
			return;
		}

		backendService.getGenQuizById($scope.genQuizId).then(function(genQuizRound) {
			$scope.genQuizRound = genQuizRound;
			backendService.currentGenQuiz = $scope.genQuizRound;
			$scope.player = {name: $scope.playerName, score: 0};
			backendService.addPlayer($scope.player);

			//-- TODO wait for game start signal
		}, function(error) {
			$scope.idError = error;
		});
	};

	$scope.leaveGame = function() {
		if ($scope.player && $scope.player.id) {
			backendService.removePlayer($scope.player.id);
		}
		$location.path("/");
	};
})
.controller('liveGenQuiz', function($scope, $location, $q, notificationService, backendService, languageService, QuestionService) {
	$scope.$emit('changeBackground', 'home_background.jpg');

	$scope.genQuizRound = backendService.currentGenQuiz;

	$scope.maxQuestions = $scope.genQuizRound.questionCount;
	$scope.currentQuestion = $scope.genQuizRound.currentQuestion;
	$scope.minute = 0;
	$scope.second = 0;	
	$scope.loadingTime = 0;
	$scope.startTime = new Date();

	$scope.interval = $interval(function() {
		if ($scope.startTime && $scope.currentQuestion < $scope.maxQuestions) {
			if ($scope.question && $scope.question.isReady) {
				var d = new Date();
				var diff = d.getTime() - $scope.startTime.getTime() - $scope.loadingTime;
				$scope.minute = Math.floor(diff / (1000*60));
				$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
				if ($scope.minute >= 2) {
					$scope.abandon();
				}
			} else {
				$scope.loadingTime++;
			}
		}
	}, 1000);

	$scope.setupQuestion = function(num, tries) {
		if (tries == 0) {
			$scope.question = $scope.getRandomQuestion();
		}
		if (tries < 5) {
			console.log('trying question '+num+" "+$scope.question.name+' setup again '+tries);
			$scope.question.error = null;
			$scope.question.setup(num+1, true).then(function() {
				console.log('successfully setup question '+num+' '+$scope.question.name);
				var q = $scope.question.getPersistence();
				backendService.persistQuestion(q);
			}, function(error) {
				console.log('failed to setup question '+num+' '+$scope.question.name+'. error='+$scope.question.error);
				$scope.setupQuestion(num, tries+1);
			});
		} else {
			console.log('too many fails try a new question');
			tries = 0;
			$scope.questions.error = null;
			$scope.questions = $scope.getRandomQuestion();
			$scope.question.setup(num + 1, true).then(function() {
				console.log('successfully setup question '+num+' '+$scope.question.name);
				var q = $scope.question.getPersistence();
				backendService.persistQuestion(q);
			}, function(error) {
				console.log('failed to setup question '+num+' '+$scope.question.name+'. error='+$scope.question.error);
				$scope.setupQuestion(num, tries+1);
			});
		}
	};

	$scope.nextQuestion = function() {
		$scope.tries = 0;
		$scope.question.completeTime = (new Date()).getTime();

		// TODO -- backendService.saveScore

		if ($scope.currentQuestion < $scope.maxQuestions-1) {
			//-- wait for all players to answer
			$location.path('/live-wait');
		} else {
			//-- no more questions go to scoreboard
			$location.path('/live-scoreboard');
		}
	}

	$scope.$watch('question.isReady', function(newval, oldval) {
		if (newval!=oldval && newval==true) {
			$scope.question.startTime = (new Date()).getTime();
		}
	});

	$scope.abandon = function() {
		$scope.missedQuestions++;
		$scope.nextQuestion();
	};

	$scope.$on('questionCorrect', function(event, question) {
		$scope.nextQuestion();
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
	});

	$scope.setupQuestion($scope.currentQuestion, 0);
})
;