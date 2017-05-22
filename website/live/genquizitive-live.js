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
.controller('livestart', function($scope, $location, familysearchService, backendService, $log) {
	$scope.loading = false;
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
	
	$scope.fsLogin = function() {
		familysearchService.fsLogin();
	};
})
.controller('liveCreateGame', function($scope, $location, $q, $cookies, familysearchService, notificationService, backendService, languageService, $log) {
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
					// TODO - load initial data
				}
			}, function() {
				var notif = notificationService.showNotification({title: 'Family Tree Error', 
					message: 'Unable to retrieve data from your family tree.  Please go back and try again.', 
					closable: true});
				notif.show();
			});

			backendService.authenticate().then(function(firebaseUser) {
				$log.error("succesfully authenticated with firebase");
				backendService.getOwnerGenQuiz().then(function(genQuiz) {
					$scope.genQuizRound = genQuiz;
					backendService.currentGenQuiz = $scope.genQuizRound;
					$scope.person = genQuiz.person;
					$scope.step = 4;
					backendService.watchPlayers().then(function(players) {
						$scope.players = players;
						$scope.player = $cookies.getObject("player");
						if (!$scope.player) {
							$scope.player = {name: $scope.genQuizRound.creator, score: 0};
							backendService.addPlayer($scope.player);
							$cookies.putObject('player', $scope.player);
						}
						backendService.currentPlayer = $scope.player;
					});
				}, function() {

				});
			}, function(error) {
				$log.error("unable to authenticate with firebase "+error);
			});
		} else {
			$location.path("/");
		}
	}, function() {
		$location.path("/");
	});
	
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
			familysearchService.search(1, 10, searchParams).then(function(searchResults) {
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
						$scope.genQuizRound.error = null;
						$scope.genQuizRound.ready = true;
						backendService.writeGenQuiz($scope.genQuizRound);
						backendService.currentGenQuiz = $scope.genQuizRound;
						$scope.step = step;
						backendService.watchPlayers();
						$scope.player = {name: $scope.genQuizRound.creator, score: 0};
						backendService.addPlayer($scope.player);
						backendService.currentPlayer = $scope.player;
						$cookies.putObject('player', $scope.player);
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
				text = text.replace(/[^a-zA-Z0-9]/g, "");
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
.controller('liveJoinGame', function($scope, $location, $q, $cookies, notificationService, backendService, languageService) {
	$scope.data = {};
	$scope.data.genQuizId = null;
	$scope.data.playerName = "";

	$scope.genQuizRound = null;

	$scope.joinGame = function() {
		$scope.nameError = null;
		$scope.idError = null;
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
	};

	$scope.checkGenQuiz = function() {
		backendService.getGenQuizById($scope.data.genQuizId).then(function(genQuizRound) {
			$scope.genQuizRound = genQuizRound;
			backendService.currentGenQuiz = $scope.genQuizRound;
			$scope.player = {name: $scope.data.playerName, score: 0};
			backendService.addPlayer($scope.player);
			backendService.currentPlayer = $scope.player;
			$cookies.putObject('player', $scope.player);
			$cookies.put('genQuizId', $scope.genQuizRound.id);

			if ($scope.genQuizRound.currentQuestionId) {
				$location.path('/live-question');
			}
			else {
				//-- wait for game start signal
				backendService.watchForQuestion($scope.genQuizRound.id);
			}
		}, function(error) {
			$scope.idError = error;
		});
	};

	$scope.leaveGame = function() {
		if ($scope.player && $scope.player.id) {
			notificationService.showConfirmation({title: 'Leave GenQuiz?', message: 'You have already joined an active GenQuiz game.\
				  Are you sure you want to leave?'}).then(function(result) {
				if (result) {
					backendService.removePlayer($scope.player.id);
					$location.path('/');
				}
			}, function() {

			});
		} else {
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
	});

	$scope.$on('questionAdded', function(event, question) {
		backendService.currentQuestion = question;
		$location.path('/live-question');
	});
})
.controller('liveGenQuiz', function($scope, $location, $q, $interval, notificationService, backendService, languageService, QuestionService, $log) {
	$scope.$emit('changeBackground', '/images/home_background.jpg');

	$scope.genQuizRound = backendService.currentGenQuiz;

	$scope.maxQuestions = $scope.genQuizRound.questionCount;
	$scope.currentQuestion = $scope.genQuizRound.currentQuestionNum;
	$scope.minute = 0;
	$scope.second = 0;	
	$scope.loadingTime = 0;
	$scope.missedQuestions = 0;
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

	$scope.getRandomQuestion = function() {
		var nextQ = QuestionService.getRandomQuestion();
		while(nextQ.name=='connect' || $scope.questionPersistence && $scope.questionPersistence.name==nextQ.name) {
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
			$scope.question.setup($scope.genQuizRound.difficulty, true).then(function() {
				$log.error('successfully setup question '+$scope.question.name);
				var q = $scope.question.getPersistence();
				backendService.persistQuestion(q, $scope.genQuizRound.id, $scope.currentQuestion);
				$scope.genQuizRound.currentQuestionId = q.id;
			}, function(error) {
				$log.error('failed to setup question '+$scope.question.name+'. error='+$scope.question.error);
				$scope.setupQuestion($scope.genQuizRound.difficulty, tries+1);
			});
		} else {
			$log.error('too many fails try a new question');
			tries = 0;
			$scope.questions.error = null;
			$scope.questions = $scope.getRandomQuestion();
			$scope.question.setup($scope.genQuizRound.difficulty, true).then(function() {
				$log.error('successfully setup question '+$scope.question.name);
				var q = $scope.question.getPersistence();
				backendService.persistQuestion(q, $scope.genQuizRound.id, $scope.currentQuestion);
				$scope.genQuizRound.currentQuestionId = q.id;
			}, function(error) {
				$log.error('failed to setup question '+$scope.question.name+'. error='+$scope.question.error);
				$scope.setupQuestion($scope.genQuizRound.difficulty, tries+1);
			});
		}
	};

	$scope.nextQuestion = function() {
		$scope.tries = 0;
		$scope.question.completeTime = (new Date()).getTime();

		$interval.cancel($scope.interval);

		// save players score
		var d = new Date();
		var diff = d.getTime() - $scope.startTime.getTime() - $scope.loadingTime;
		var score = {time: diff, missed: $scope.missedQuestions};
		backendService.savePlayerQuestionScore(backendService.currentPlayer.id, $scope.genQuizRound.currentQuestionId, 
					$scope.genQuizRound.id, score);

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

	$scope.$on('$destroy', function() {
		$interval.cancel($scope.interval);
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
.controller('liveQuestion', function($scope, $location, $q, $interval, notificationService, backendService, languageService, QuestionService) {
	$scope.$emit('changeBackground', '/images/home_background.jpg');

	$scope.genQuizRound = backendService.currentGenQuiz;

	$scope.maxQuestions = $scope.genQuizRound.questionCount;
	$scope.currentQuestion = $scope.genQuizRound.currentQuestionNum;
	$scope.minute = 0;
	$scope.second = 0;	
	$scope.loadingTime = 0;
	$scope.missedQuestions = 0;
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

	$scope.setupQuestion = function() {
		$scope.question = QuestionService.getQuestionByName($scope.questionPersistence.name);
		$scope.question.setupFromPersistence($scope.questionPersistence);
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
		$interval.cancel($scope.interval);
		// save players score
		var d = new Date();
		var diff = d.getTime() - $scope.startTime.getTime() - $scope.loadingTime;
		var score = {time: diff, missed: $scope.missedQuestions};
		backendService.savePlayerQuestionScore(backendService.currentPlayer.id, $scope.question.id, 
					$scope.genQuizRound.id, score);
	}

	$scope.abandon = function() {
		$scope.missedQuestions++;
		// update score and go to wait screen
		$scope.saveScore();
		if ($scope.currentQuestion < $scope.maxQuestions-1) {
			$location.path('/live-question-wait');
		} else {
			$location.path('/live-scoreboard');
		}
	};

	$scope.$on('questionCorrect', function(event, question) {
		// update score and go to wait screen
		$scope.saveScore();
		if ($scope.currentQuestion < $scope.maxQuestions-1) {
			$location.path('/live-question-wait');
		} else {
			$location.path('/live-scoreboard');
		}
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
	});

	$scope.$on('$destroy', function() {
		$interval.cancel($scope.interval);
	});
})
.controller('liveWait', function($scope, $location, backendService, notificationService) {
	$scope.$emit('changeBackground', '/images/home_background.jpg');
	$scope.genQuizRound = backendService.currentGenQuiz;

	$scope.players = backendService.currentPlayers;

	backendService.watchPlayerScores($scope.genQuizRound.currentQuestionId, $scope.genQuizRound.id);

	$scope.$on('$destroy', function() {
		backendService.unWatchPlayerScores();
	});

	$scope.nextQuestion = function() {
		$scope.genQuizRound.currentQuestionNum++;
		backendService.updateQuestionNum($scope.genQuizRound);
		$location.path('/live-genquiz');
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
		$scope.playerScores = playerScores;
	});
})
.controller('liveQuestionWait', function($scope, $location, backendService, notificationService) {
	$scope.$emit('changeBackground', '/images/home_background.jpg');
	$scope.genQuizRound = backendService.currentGenQuiz;

	$scope.players = backendService.currentPlayers;

	//-- watch for player scores
	backendService.watchPlayerScores($scope.genQuizRound.currentQuestionId, $scope.genQuizRound.id);
	//-- wait for game start signal
	backendService.watchForQuestion($scope.genQuizRound.id);

	$scope.leaveGame = function() {
		notificationService.showConfirmation({title: 'Leave GenQuiz?', message: 'Are you sure you want to leave this QenQuiz?'}).then(function() {
			backendService.removePlayer(backendService.currentPlayer);
			$location.path('/');
		});
	};

	$scope.$on('playerScores', function(event, playerScores) {
		$scope.playerScores = playerScores;
	});

	$scope.$on('questionAdded', function(event, question) {
		backendService.currentQuestion = question;
		$location.path('/live-question');
	});

	$scope.$on('$destroy', function() {
		backendService.unWatchPlayerScores();
		backendService.unWatchQuestion();
	});
})
.controller('liveScoreboard', function($scope, $location, backendService) {

})
.service('adService', [function() {

}])
;