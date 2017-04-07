var FS_REDIRECT_URL = 'https://www.genquizitive.com/fs-login.html';
angular.module('genquizitive', ['ngRoute','ngCookies','ngAnimate','ui.bootstrap', 
				'genquiz-components', 'genquiz.questions', 'genquiz.familytree','genquiz.friends','ngMap'])
.config(['$locationProvider', '$routeProvider', '$uibTooltipProvider',
    function config($locationProvider, $routeProvider, $uibTooltipProvider) {
		$uibTooltipProvider.options({popupDelay: 300});
      $routeProvider
		.when('/', {
			templateUrl: 'getting-started.html'
        })
		.when('/:page', {
			templateUrl: function($routeParams) {
				return $routeParams.page +'.html';
			}
        })
		.otherwise({ redirectTo: '/' });
    }
])
.directive('hintSpinner', ['$interval', 'QuestionService', function($interval, QuestionService) {
	return {
		restrict: 'A',
		scope: {
			hint: '=hintWon'
		},
		template: '<img ng-src="{{img}}" />',
		link: function($scope, $element, $attr) {
			$scope.hints = QuestionService.hints;
			$scope.currentIndex == 0;
			$scope.delay = 4000;
			$scope.swapDelay = 100;
			$scope.img = $scope.hints[$scope.currentIndex].img;
			
			$scope.interval = $interval(function() {
				if ($scope.delay > 0) {
					$scope.delay -= 100;
					$scope.swapDelay -= 100;
					if ($scope.swapDelay <=0) {
						$scope.swapDelay = 100 + (4000 - $scope.delay) / 2;
						$scope.currentIndex++;
						if ($scope.currentIndex >= $scope.hints.length) {
							$scope.currentIndex = 0;
						}
						$scope.img = $scope.hints[$scope.currentIndex].img;
					}
				} else {
					$scope.img = $scope.hint.img;
				}
			}, 100);
			$scope.$on('$destroy', function() {
				$interval.cancel($scope.interval);
			});
		}
	}
}])
.directive('hint', [function() {
	return {
		scope: {
			hint: '='
		},
		template: '<img ng-src="{{hint.img}}" class="image-responsive" /><div class="hint-count">{{hint.userCount}}</div>'
	}
}])
.controller('getstarted', function($scope, familysearchService, facebookService, firebaseService, languageService, $location, $timeout, notificationService, $cookies) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	$scope.fsLoggedIn = false;
	$scope.fsUserName = "";
	$scope.fbLoggedIn = false;
	$scope.fbUserName = "";
	
	$scope.checkLogin = function() {
		if (facebookService.facebookUser || familysearchService.fsUser) {
			//-- from facebook notification
			if ($scope.requestId) {
				if (facebookService.facebookUser) {
					facebookService.removeGenQuizRequest($scope.requestId);
				}
				if (firebaseService.authenticated) {
					firebaseService.getRoundByRequestId($scope.requestId).then(function(round) {
						if (round.hasFamilyTree && !familysearchService.fsUser) {
							$cookies.put('roundId', round.id);
							$scope.fsLogin();
						} else {
							$location.search({roundId: round.id});
							if (round.complete) {
								$location.path('/challengeRoundReview');
							} else {
								$location.path('/challengeRound');
							}
						}
					}, function() {
						$scope.loading = false;
					});
				} else {
					$location.path('/menu');
				}
			//-- return from familysearch login
			} else if ($cookies.get('roundId')) {
				var roundId = $cookies.get('roundId');
				$cookies.remove('roundId');
				$location.search({roundId: roundId});
				$location.path('/challengeRound');
			} else {
				$location.path('/menu');
			}
		} else {
			$scope.loading = false;
		}
	}
	
	$scope.fsLogin = function() {
		familysearchService.fsLogin();
	}
	
	$scope.fbLogin = function() {
		if (facebookService.facebookUser) {
			facebookService.fbLogout();
		}
		facebookService.fbLogin().then(function(fbUser) {
			$scope.fbLoggedIn = true;
			$scope.fbUserName = languageService.shortenName(fbUser.name);
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		});
	};
	
	var search = $location.search();
	if (search && search["request_ids"]) {
		$scope.requestId = search["request_ids"];
	}
	
	$scope.loading = true;
	$timeout(function() {
		familysearchService.fsLoginStatus().then(function(fsUser){
			if (fsUser.display) {
				$scope.fsLoggedIn = true;
				$scope.fsUserName = fsUser.display.name;
				familysearchService.loadInitialData(fsUser.id);
				facebookService.fbLoginStatus().then(function(fbUser){
					$scope.fbUserName = languageService.shortenName(fbUser.name);
					$scope.fbLoggedIn = true;
					$scope.fbHasPicture = facebookService.hasPicture;
					$scope.fbUser = fbUser;
					facebookService.setCanvasReady();
					$scope.checkLogin();
				}, function(error) {
					//var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
					//notif.show();
					facebookService.setCanvasReady();
					$scope.checkLogin();
					$scope.loading = false;
				});
			} else {
				//location.reload();
				facebookService.setCanvasReady();
				$scope.loading = false;
			}
		}, function() {
			facebookService.fbLoginStatus().then(function(fbUser){
				$scope.fbLoggedIn = true;
				$scope.fbUserName = languageService.shortenName(fbUser.name);
				$scope.fbHasPicture = facebookService.hasPicture;
				$scope.fbUser = fbUser;
				facebookService.setCanvasReady();
				$scope.checkLogin();
			}, function(error) {
				//var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
				//notif.show();
				facebookService.setCanvasReady();
				$scope.loading = false;
			});
		});
	}, 500);
})
.controller('menuController', function($scope, facebookService, familysearchService, firebaseService, $location, notificationService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	$scope.fsLogin = function() {
		familysearchService.fsLogin();
	}
	
	$scope.logoutFS = function() {
		familysearchService.fsLogout();
		$location.path("/");
	};
	
	$scope.logoutFB = function() {
		facebookService.fbLogout();
		$location.path("/");
	};
	
	if (familysearchService.fsUser) {
		$scope.hasFamilyTree = true;
	}
	
	$scope.continueGameCount = 0;
	
	$scope.checkFacebook = function() {
		if (facebookService.facebookUser) {
			$scope.hasFacebook = true;
			if (facebookService.facebookUser.picture) {
				$scope.pictureUrl = facebookService.facebookUser.picture.data.url;
			}
			firebaseService.authenticate().then(function(fireUser) {
				$scope.fireUser = fireUser;
				//-- get firebase user
				firebaseService.getUser(facebookService.facebookUser.id).then(function(user) {
					if (user) {
						$scope.gameUser = user;
						if ($scope.hasFamilyTree && !user.hasFamilyTree) {
							user.hasFamilyTree = $scope.hasFamilyTree;
							firebaseService.writeUserProperty(facebookService.facebookUser.id, 'hasFamilyTree', $scope.hasFamilyTree);
						} else if (user.hasFamilyTree && !$scope.hasFamilyTree) {
							//-- force familysearch login if user 
							familysearchService.fsLogin();
						} else {
							firebaseService.getUserFromRounds(facebookService.facebookUser.id).then(function(rounds) {
								angular.forEach(rounds, function(round) {
									if (round.complete) {
										if (!round.read || !round.read[facebookService.facebookUser.id]) {
											$scope.continueGameCount++;
										}
									} else if (!round.fromStats) {
										$scope.continueGameCount++;
									}
								});
							});
							
							firebaseService.getUserToRounds(facebookService.facebookUser.id).then(function(rounds) {
								angular.forEach(rounds, function(round) {
									if (!round.read || !round.read[facebookService.facebookUser.id]) {
										$scope.continueGameCount++;
									}
								});
							});
						}
					} else {
						//--- create firebase user if not exist
						$scope.gameUser = firebaseService.createUserFromFacebookUser(facebookService.facebookUser, $scope.hasFamilyTree);
					}
				});
			});
		} else {
			if (!familysearchService.fsUser) {
				//-- go back to home screen if not authed to anything
				$location.path('/');
			} else {
				familysearchService.getPersonPortrait(familysearchService.fsUser.id).then(function(data) {
					$scope.pictureUrl = data.src;
				});
			}
		}
	};
	
	$scope.checkFacebook();
	
	$scope.fbLogin = function() {
		if (facebookService.facebookUser) {
			facebookService.fbLogout();
		}
		facebookService.fbLogin().then(function(fbUser) {
			$scope.checkFacebook();
		});
	}
	
	$scope.launchPractice = function() {
		if (familysearchService.fsUser) {
			$location.path('/practice');
		} else {
			var notif = notificationService.showNotification({title: 'Family Tree Required', 
				message: 'This feature requires a connection to a Family Tree. Please connect to FamilySearch and try again.', 
				closable: true});
			notif.show();
		}
	};
	
	$scope.launchChallenge = function() {
		if (facebookService.facebookUser) {
			$location.path('/challenge');
		} else {
			var notif = notificationService.showNotification({title: 'Facebook Required', 
				message: 'This feature requires a connection to Facebook. Please connect to Facebook and try again.', 
				closable: true});
			notif.show();
		}
	};
	
	$scope.launchContinue = function() {
		if (facebookService.facebookUser) {
			$location.path('/continue');
		} else {
			var notif = notificationService.showNotification({title: 'Facebook Required', 
				message: 'This feature requires a connection to Facebook. Please connect to Facebook and try again.', 
				closable: true});
			notif.show();
		}
	};
	
	$scope.launchHints = function() {
		if (facebookService.facebookUser) {
			$location.path('/hints');
		} else {
			var notif = notificationService.showNotification({title: 'Facebook Required', 
				message: 'This feature requires a connection to Facebook. Please connect to Facebook and try again.', 
				closable: true});
			notif.show();
		}
	};
	
})
.controller('hintsController', function($scope, facebookService, firebaseService, $location, QuestionService, familysearchService, notificationService, $q) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	if (!facebookService.facebookUser) {
		//-- go back to home screen if not authed to anything
		$location.path('/');
		return;
	}
	
	$scope.hints = angular.copy(QuestionService.hints);
	$scope.hintTxt = "Daily Hint!";
	
	$scope.$watch('gameUser', function() {
		if ($scope.gameUser) {
			angular.forEach($scope.hints, function(hint) {
				if ($scope.gameUser.hints && $scope.gameUser.hints[hint.name]) {
					hint.userCount = $scope.gameUser.hints[hint.name];
				} else {
					hint.userCount = 0;
				}
			});
			var lastDate = (new Date()).getTime() - (1000*60*60*24*7);
			if ($scope.gameUser.lastFSHint) {
				lastDate = $scope.gameUser.lastFSHint;
				var now = new Date();
				var diff = lastDate + (1000*60*60*24) - now.getTime();
				if (diff > 0) {
					var hours = Math.floor(diff / (1000*60*60));
					var minutes = Math.round((diff - (hours*1000*60*60)) / (1000*60));
					$scope.hintTxt = "Next Hint in ";
					if (hours > 0) $scope.hintTxt += hours + " hours";
					else $scope.hintTxt += minutes + " minutes";
				}
			}
		}
	});
	
	firebaseService.getUser(facebookService.facebookUser.id).then(function(user) {
		if (user) {
			$scope.gameUser = user;
		}
	});
	
	$scope.showNoChanges = function() {
		$scope.hintTxt = "Daily Hint!";
		var notif = notificationService.showNotification({title: 'Hints',message: 'We were not able to detect any changes you made to your family tree. \
			Go to your family tree and make some changes, then return and check again to earn free hints!', closable: true});
		notif.show();
	};
	
	$scope.checkFamilySearch = function() {
		var lastDate = (new Date()).getTime() - (1000*60*60*24*7);
		if ($scope.gameUser.lastFSHint) {
			lastDate = $scope.gameUser.lastFSHint;
			var now = new Date();
			var diff = lastDate + (1000*60*60*24) - now.getTime();
			if (diff > 0) {
				var hours = Math.floor(diff / (1000*60*60));
				var minutes = Math.round((diff - (hours*1000*60*60)) / (1000*60));
				var notif = notificationService.showNotification({title: 'Please Wait',message: 'You may only earn 1 family tree update hint per day. \
				Improve your family tree each day to earn more hints. Try again in '+hours+' hours and '+minutes+' minutes.', closable: true});
				notif.show();
				return;
			}
		}
		$scope.hintTxt = "Loading...";
		$scope.foundEntry = null;
		$scope.entryCount = 0;
		familysearchService.getUserHistory().then(function(entries) {
			if (entries && entries.length>0) {
				var promises = [];
				for(var e=0; e<entries.length; e++) {
					if (entries[e].updated > lastDate) {
						$scope.entryCount++;
						var promise = familysearchService.getPersonChanges(entries[e].id).then(function(personEntries) {
							if (personEntries) {
								for(var i=0; i<personEntries.length; i++) {
									var entry = personEntries[i];
									if (entry.updated >= lastDate) {
										if (entry.contributors) {
											for(var c=0; c<entry.contributors.length; c++) {
												if (familysearchService.currentUser && entry.contributors[c].name == familysearchService.currentUser.contactName) {
													if ($scope.foundEntry == null) {
														var hint = QuestionService.getRandomHint();
														$scope.gameUser.lastFSHint = (new Date()).getTime();
														firebaseService.writeUserProperty($scope.gameUser.userId, 'lastFSHint', $scope.gameUser.lastFSHint);
														firebaseService.addUserHint($scope.gameUser.userId, hint).then(function(user) {
															$scope.gameUser = user;
														});
														var notif = notificationService.showHintWon({title: 'Congratulations!',message: 'You\'ve earned a free hint!', 
																hint: hint, closable: true});
														notif.show();
													}
													$scope.foundEntry = entry;
												}
											}
										}
									}
								}
							}
						});
						promises.push(promise);
					}
				}
				if (promises.length>0) {
					$q.all(promises).then(function() {
						if ($scope.foundEntry == null) {
							$scope.showNoChanges();
						}
					}, function(error) {
						console.log("unable to resolve all promises "+error);
						$scope.hintTxt = "Daily Hint!";
					});
				} else {
					$scope.showNoChanges();
				}
			} else {
				$scope.showNoChanges();
			}
		}, function(error) {
			var notif = notificationService.showNotification({title: 'FamilySearch Error',message: 'Unable to get user history from FamilySearch.', closable: true});
			notif.show();
			console.log(error);
			$scope.hintTxt = "Daily Hint!";
		});
	};
})
.controller('continueController', function($scope, facebookService, firebaseService, notificationService, $location, languageService) {
	$scope.$emit('changeBackground', 'questions/multi2/background.jpg');
	
	if (!facebookService.facebookUser) {
		//-- go back to home screen if not authed to anything
		$location.path('/');
		return;
	}
	
	$scope.launchReview = function(round) {
		firebaseService.lastRound = round;
		$location.path('/challengeRoundReview');
	};
	
	$scope.launchRound = function(round) {
		$location.search({roundId: round.id});
		$location.path('/challengeRound');
	};
	
	$scope.friends = {};
	$scope.completeGames = [];
	$scope.completeReadGames = [];
	$scope.myTurnGames = [];
	$scope.theirTurnGames = [];
	$scope.gameCount = 0;
	$scope.loading = true;
	
	firebaseService.getUserFromRounds(facebookService.facebookUser.id).then(function(rounds) {
		$scope.loading = false;
		angular.forEach(rounds, function(round) {
			$scope.gameCount++;
			facebookService.fbGetUserById(round.to).then(function(fbu) {
				fbu.shortName = languageService.shortenName(fbu['first_name']+" "+fbu['last_name']);
				$scope.friends[round.id] = fbu;
			});
			if (round.complete) {
				if (round.read && round.read[facebookService.facebookUser.id]) {
					$scope.completeReadGames.push(round);
				} else {
					$scope.completeGames.push(round);
				}
			} else if (round.fromStats) {
				$scope.theirTurnGames.push(round);
			} else {
				$scope.myTurnGames.push(round);
			}
		});
	}, function(error) {
		console.log(error);
		$scope.loading = false;
	});
	
	firebaseService.getUserToRounds(facebookService.facebookUser.id).then(function(rounds) {
		$scope.loading = false;
		angular.forEach(rounds, function(round) {
			$scope.gameCount++;
			facebookService.fbGetUserById(round.from).then(function(fbu) {
				fbu.shortName = languageService.shortenName(fbu['first_name']+" "+fbu['last_name']);
				$scope.friends[round.id] = fbu;
			});
			if (round.complete) {
				if (round.read && round.read[facebookService.facebookUser.id]) {
					$scope.completeReadGames.push(round);
				} else {
					$scope.completeGames.push(round);
				}
			} else {
				$scope.myTurnGames.push(round);
			}
		});
	}, function(error) {
		console.log(error);
		$scope.loading = false;
	});
})
.controller('challengeController', function($scope, facebookService, firebaseService, notificationService, languageService, $interval, $location) {
	$scope.$emit('changeBackground', 'questions/multi2/background.jpg');
	
	if (!facebookService.facebookUser) {
		//-- go back to home screen if not authed to anything
		$location.path('/');
		return;
	}
	
	$scope.chooseFriend = function(friend) {
		var round = {
			from: facebookService.facebookUser.id,
			to: friend.id,
			friendTree: false,
			startTime: new Date()
		};
		//-- check if friend has familytree
		firebaseService.getUserProperty(friend.id, "hasFamilyTree").then(function(hasFamilyTree) {
			if (hasFamilyTree) round.friendTree = true;
			
			firebaseService.writeRound(round).then(function(round) {
				//-- move to play round
				$location.search({roundId: round.id});
				$location.path('/challengeRound');
			});
		});
	};
	
	$scope.invite = function() {
		//-- load facebook invite window
		facebookService.inviteFriends().then(function(response) {
			if (response && response.request && response.to && response.to.length>0) {
				var round = {
					from: facebookService.facebookUser.id,
					to: response.to[0],
					friendTree: false,
					startTime: new Date(),
					requestId: response.request
				};
				firebaseService.writeRound(round).then(function(round) {
					//-- move to play round
					$location.search({roundId: round.id});
					$location.path('/challengeRound');
				});
			}
		});
	};
	
	$scope.hnum = 2;
	$scope.vnum = 1;
	$interval(function() {
		$scope.hnum++;
		if ($scope.hnum>3) $scope.hnum = 1;
		$scope.vnum++;
		if ($scope.vnum>3) $scope.vnum = 1;
		$('.hlights').attr('src', 'lights'+$scope.hnum+'.png');
		$('.vlights').attr('src', 'lightsv'+$scope.vnum+'.png');
	}, 400);
	
	facebookService.getGenquizitiveFriends().then(function(response) {
		if (response && response.data) {
			$scope.friends = response.data;
			for(var f=0; f<$scope.friends.length; f++) {
				var friend = $scope.friends[f];
				friend.shortName = languageService.shortenName(friend['first_name']+' '+friend['last_name']);
			}
			/*
			for(var h=$scope.friends.length; h<11; h++) {
				$scope.friends.push(angular.copy($scope.friends[0]));
			}
			*/
		}
		//TODO - paging
		if (!$scope.friends || $scope.friends.length==0) {
			$scope.invite();
		}
	}, function(error) {
		var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
		notif.show();
	});
})
.controller('challengeRoundController', function($scope, notificationService, QuestionService, familysearchService, $interval, facebookService, $location, firebaseService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	var search = $location.search();
	var roundId = search.roundId;
	if (!roundId || !facebookService.facebookUser) {
		$location.search({});
		$location.path("/menu");
		return;
	} else {
		firebaseService.getRoundById(roundId).then(function(round) {
			$scope.round = round;
			
			if (familysearchService.fsUser || facebookService.facebookUser.id==$scope.round.from) {
				$scope.fromPersistence = false;
				if ($scope.round.fromStats) {
					$scope.questions[$scope.currentQuestion] = QuestionService.getQuestionByName($scope.round.fromStats.questions[0].name);
				} else {
					$scope.questions[$scope.currentQuestion] = QuestionService.getRandomQuestion();
				}
				if (familysearchService.fsUser && $scope.round.fromStats && familysearchService.getLocalPersonById($scope.round.fromStats.questions[0].personId)) {
					$scope.questions[$scope.currentQuestion].setupFromPersistence($scope.round.fromStats.questions[0]);
				} else {
					$scope.setupQuestion($scope.currentQuestion, 0);
				}
			} else {
				//-- setup from persistence
				$scope.fromPersistence = true;
				$scope.questions[$scope.currentQuestion] = QuestionService.getQuestionByName($scope.round.fromStats.questions[0].name);
				$scope.questions[$scope.currentQuestion].setupFromPersistence($scope.round.fromStats.questions[0]);
			}
		});
	}
	
	if (facebookService.facebookUser && facebookService.facebookUser.picture) {
		$scope.pictureUrl = facebookService.facebookUser.picture.data.url;
	}
	
	var notif = notificationService.showNotification({title: 'Challenge GenQuiz', message: 'Answer the questions as quickly as you can. The friend who answers the questions the fastest with the fewest mistakes wins!'});
	notif.show();
	
	$scope.questions = [];
	$scope.currentQuestion = 0;
	$scope.maxQuestions = 5;
	$scope.ready = false;
	
	$scope.freezeTime = 0;
	$scope.minute = 0;
	$scope.second = 0;
	$scope.loadingTime = 0;
	$scope.interval = $interval(function() {
		if ($scope.startTime && $scope.currentQuestion < $scope.maxQuestions) {
			if ($scope.question && $scope.question.isReady) {
				if ($scope.freezeTime && $scope.freezeTime > 0) {
					$scope.freezeTime--;
					$scope.loadingTime++;
					if (!$scope.question.timeOffset) {
						$scope.question.timeOffset = 1;
					} else {
						$scope.question.timeOffset++;
					}
				} else {
					var d = new Date();
					var diff = d.getTime() - $scope.startTime.getTime() - $scope.loadingTime;
					$scope.minute = Math.floor(diff / (1000*60));
					$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
					if ($scope.minute >= 15) {
						$scope.completeRound();
					}
				}
			} else {
				$scope.loadingTime++;
			}
		}
	}, 1000);
	
	$scope.missedQuestions = 0;
	
	$scope.getRandomQuestion = function() {
		var nextQ = QuestionService.getRandomQuestion();
		while($scope.question && nextQ.name==$scope.question.name) {
			nextQ = QuestionService.getRandomQuestion();
		}
		return nextQ;
	};
	
	$scope.startRound = function() {
		notif.close();
		$scope.ready = true;
		$scope.startTime = new Date();
		
		familysearchService.clearUsed();
		
		$scope.question = $scope.questions[$scope.currentQuestion];
		$scope.question.startTime = (new Date()).getTime();
		
		var nextQ = null;
		if ($scope.round.fromStats && $scope.round.fromStats.questions[$scope.currentQuestion+1]) {
			nextQ = QuestionService.getQuestionByName($scope.round.fromStats.questions[$scope.currentQuestion+1].name);
		} else {
			nextQ = $scope.getRandomQuestion();
		}
		$scope.questions[$scope.currentQuestion+1] = nextQ;
		console.log('next question at '+($scope.currentQuestion+1)+' is '+nextQ.name);
		if ($scope.fromPersistence) {
			$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
		} else {
			if (familysearchService.fsUser && $scope.round.fromStats && familysearchService.getLocalPersonById($scope.round.fromStats.questions[$scope.currentQuestion+1].personId)) {
				$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
			} else {
				$scope.setupQuestion($scope.currentQuestion + 1, 0);
			}
		}
	}
	
	$scope.completeRound = function() {
		$scope.question.completeTime = (new Date()).getTime();
		$scope.complete = true;
		$interval.cancel($scope.interval);
		$scope.endTime = new Date();
		
		var stats = {
			startTime: $scope.startTime,
			endTime: $scope.endTime,
			loadingTime: $scope.loadingTime,
			missed: $scope.missedQuestions,
			questions: []
		};
		for(var q=0; q<$scope.maxQuestions; q++) {
			if (q < $scope.questions.length) {
				stats.questions[q] = $scope.questions[q].getPersistence();
			}
		}
		if ($scope.round.from==facebookService.facebookUser.id) {
			$scope.round.fromStats = stats;
			if (!$scope.round.requestId) {
				//-- send facebook event
				facebookService.sendGenQuiz($scope.round.to).then(function(response) {
					$scope.round.requestId = response.request;
					firebaseService.writeRound($scope.round);
				}, function(response) {
					firebaseService.writeRound($scope.round);
				});
			} else {
				firebaseService.writeRound($scope.round);
			}
		} else {
			$scope.round.toStats = stats;
			$scope.round.complete = true;
			//-- send facebook event
			facebookService.sendGenQuizComplete($scope.round.from).then(function(response) {
				$scope.round.requestId = response.request;
				firebaseService.writeRound($scope.round);
			});
		}
		firebaseService.lastRound = $scope.round;
		$location.path('/challengeRoundReview');
	};
	
	$scope.nextQuestion = function() {
		$scope.question.completeTime = (new Date()).getTime();
		
		if ($scope.currentQuestion >= $scope.maxQuestions-1) {
			$scope.completeRound();
		} else {		
			$scope.currentQuestion++;
			$scope.question = $scope.questions[$scope.currentQuestion];
			$scope.question.startTime = (new Date()).getTime();
			
			if ($scope.question.error) {
				console.log('question in error, resetting');
				$scope.setupQuestion($scope.currentQuestion, 0);
			}
			
			if ($scope.currentQuestion < $scope.maxQuestions-1) {
				var nextQ = null;
				if ($scope.round.fromStats && $scope.round.fromStats.questions[$scope.currentQuestion+1]) {
					nextQ = QuestionService.getQuestionByName($scope.round.fromStats.questions[$scope.currentQuestion+1].name);
				} else {
					nextQ = $scope.getRandomQuestion();
				}
				$scope.questions[$scope.currentQuestion+1] = nextQ;
				if ($scope.fromPersistence) {
					$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
				} else {
					if (familysearchService.fsUser && $scope.round.fromStats && $scope.round.fromStats.questions[$scope.currentQuestion+1]
								&& familysearchService.getLocalPersonById($scope.round.fromStats.questions[$scope.currentQuestion+1].personId)) {
						$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
					} else {
						$scope.setupQuestion($scope.currentQuestion + 1, 0);
					}
				}
			}
		}
	}
	
	$scope.applyHint = function(hint) {
		if ($scope.gameUser && $scope.gameUser.hints[hint.name] && !hint.disabled) {
			firebaseService.subtractUserHint($scope.gameUser.userId, hint).then(function(user) {
				$scope.gameUser = user;
				if (hint.name=='freeze') {
					$scope.freezeTime = hint.time;
				} else if (hint.name=='rollback') {
					if (!$scope.question.timeOffset) $scope.question.timeOffset = 0;
					if ($scope.question.startTime) {
						var now = new Date();
						var diff = Math.round((now.getTime() - $scope.question.startTime.getTime())/1000);
						if (diff < hint.time) {
							$scope.question.timeOffset += diff;
						} else {
							$scope.question.timeOffset += hint.time;
						}
					}
				} else if (hint.name=='lifesaver') {
					$scope.missedQuestions--;
				} else if (hint.name=='fifty') {
					hint.disabled = true;
					hint.hintClass = 'hint-disabled';
					$scope.$broadcast('applyHint', hint);
				} else if (hint.name=='skip') {
					//-- TODO show skip animation
					$scope.nextQuestion();
				}
			}, function(user) {
				$scope.gameUser = user;
				var notif = notificationService.showNotification({title: 'No Hints Available', 
					message: 'All of those hints have been used. Or an error occurred.', 
					closable: true});
				notif.show();
			});
		}
	};
	
	$scope.$on('questionCorrect', function(event, question) {
		$scope.nextQuestion();
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
	});
	
	$scope.setupQuestion = function(num, tries) {
		if (tries < 5) {
			var question = $scope.questions[num];
			console.log('trying question '+num+" "+question.name+' setup again '+tries);
			question.error = null;
			question.setup(num+1, $scope.round.friendTree).then(function() {
				console.log('successfully setup question '+num+' '+question.name);
			}, function(error) {
				console.log('failed to setup question '+num+' '+question.name+'. error='+question.error);
				$scope.setupQuestion(num, tries+1);
			});
		} else {
			console.log('too many fails try a new question');
			tries = 0;
			$scope.questions[num].error = null;
			$scope.questions[num] = $scope.getRandomQuestion();
			var question = $scope.questions[num];
			question.setup(num + 1, $scope.round.friendTree).then(function() {
				console.log('successfully setup question '+num+' '+question.name);
			}, function(error) {
				console.log('failed to setup question '+num+' '+question.name+'. error='+question.error);
				$scope.setupQuestion(num, tries + 1);
			});
			//-- question object changed so update the current question
			if ($scope.currentQuestion==num) {
				$scope.question = question;
			}
		}
	};
	
	$scope.$watch('question.isReady', function(newval, oldval) {
		if (newval!=oldval && newval==true) {
			$scope.question.startTime = (new Date()).getTime();
		}
	});
	
	$scope.launchMenu = function() {
		if (notif) {
			notif.close();
		}
		$location.path("/menu");
	};
	
	$scope.$on('$destroy', function() {
		if (notif) {
			notif.close();
		}
	});
})
.controller('challengeRoundReviewController', function($scope, notificationService, QuestionService, familysearchService, $interval, $timeout, facebookService, $location, firebaseService, languageService, $uibModal) {
	$scope.$emit('changeBackground', 'challenge_review_background.jpg');
	
	$scope.round = firebaseService.lastRound;
	
	if (!$scope.round || !facebookService.facebookUser) {
		$location.path("/");
		return;
	}
	
	$scope.me = facebookService.facebookUser;
	$scope.me.shortName = languageService.shortenName($scope.me.name);
	
	if (facebookService.facebookUser.id==$scope.round.from) {
		facebookService.fbGetUserById($scope.round.to).then(function(friend) {
			$scope.friend = friend;
			$scope.friend.shortName = languageService.shortenName($scope.friend['first_name']+' '+$scope.friend['last_name']);
		});
	} else {
		facebookService.fbGetUserById($scope.round.from).then(function(friend) {
			$scope.friend = friend;
			$scope.friend.shortName = languageService.shortenName($scope.friend['first_name']+' '+$scope.friend['last_name']);
		});
	}
	
	if ($scope.round.fromStats && $scope.round.toStats) {
		if (!$scope.round.read) $scope.round.read = {};
		$scope.round.read[facebookService.facebookUser.id] = true;
		firebaseService.writeRound($scope.round);
	}
	
	$scope.questionDisplays = [];
	$scope.myStats = null;
	$scope.friendStats = null;
	if ($scope.round.from==facebookService.facebookUser.id) {
		$scope.myStats = $scope.round.fromStats;
		$scope.friendStats = $scope.round.toStats;
	} else {
		$scope.myStats = $scope.round.toStats;
		$scope.friendStats = $scope.round.fromStats;
	}
	
	$scope.maxQuestions = 5;
	$scope.myMissed = $scope.myStats.missed;
	if ($scope.myMissed < 0) $scope.myMissed = 0;
	$scope.myScore = $scope.myMissed * 20;
	if ($scope.friendStats) {
		$scope.friendMissed = $scope.friendStats.missed;
		if ($scope.friendMissed < 0) $scope.friendMissed = 0;
		$scope.friendScore = $scope.friendMissed * 20;
	}
	
	var displayHash = {};
	for(var q=0; q<$scope.maxQuestions; q++) {
		var display = {num: q};
		if ($scope.myStats.questions[q]) {
			if (familysearchService.fsUser && $scope.myStats.questions[q].personId) {
				displayHash[$scope.myStats.questions[q].personId] = display;
				familysearchService.getPersonById($scope.myStats.questions[q].personId, true).then(function(person) {
					displayHash[person.id].person = person;
				});
			} else if ($scope.myStats.questions[q].person) {
				display.person = $scope.myStats.questions[q].person;
			}
			
			display.mySeconds = Math.round(($scope.myStats.questions[q].completeTime - $scope.myStats.questions[q].startTime)/1000);
			if ($scope.myStats.questions[q].timeOffset) {
				display.mySeconds -= $scope.myStats.questions[q].timeOffset;
				if (display.mySeconds < 0) display.mySeconds = 0;
			}
			$scope.myScore += display.mySeconds;
			display.myTime = "";
			var minutes = Math.floor(display.mySeconds / 60.0);
			if (minutes < 10) {
				display.myTime = "0";
			}
			display.myTime += minutes + ":";
			var seconds = display.mySeconds - (minutes * 60);
			if (seconds < 10) display.myTime += "0";
			display.myTime += seconds;
		} else {
			display.mySeconds = 0;
			display.myTime = "0:00";
		}

		if ($scope.friendStats && $scope.friendStats.questions[q]) {
			display.friendSeconds = Math.round(($scope.friendStats.questions[q].completeTime - $scope.friendStats.questions[q].startTime)/1000);
			if ($scope.friendStats.questions[q].timeOffset) {
				display.friendSeconds -= $scope.friendStats.questions[q].timeOffset;
				if (display.friendSeconds < 0) display.friendSeconds = 0;
			}
			$scope.friendScore += display.friendSeconds;
			display.friendTime = "";
			var minutes = Math.floor(display.friendSeconds / 60.0);
			if (minutes < 10) {
				display.friendTime = "0";
			}
			display.friendTime += minutes + ":";
			var seconds = display.friendSeconds - (minutes * 60);
			if (seconds < 10) display.friendTime += "0";
			display.friendTime += seconds;
		}

		if ($scope.myStats.questions[q]) {
			display.letter = QuestionService.getQuestionLetter($scope.myStats.questions[q].name);
			display.letterTooltip = QuestionService.friendlyNames[display.letter];
		} else {
			display.letter = "U";
			display.letterTooltip = "You did not complete the QenQuiz";
		}
		
		displayHash[q] = display;
		$timeout(function() {
			var q = $scope.questionDisplays.length;
			$scope.questionDisplays[q] = displayHash[q];
		}, 500*q);
	}
	
	if (facebookService.facebookUser && $scope.myScore > 0) {
		firebaseService.getUser(facebookService.facebookUser.id).then(function(user) {
			user.challengeRounds++;
			if (user.challengeHighScore==0 || user.challengeHighScore > $scope.myScore) {
				user.challengeHighScore = $scope.myScore;
			}
			firebaseService.writeUser(user);
		});
	}
	
	$scope.challengeAgain = function() {
		var round = {
			from: facebookService.facebookUser.id,
			to: $scope.friend.id,
			friendTree: false,
			startTime: new Date()
		};
		//-- check if friend has familytree
		firebaseService.getUserProperty($scope.friend.id, "hasFamilyTree").then(function(hasFamilyTree) {
			if (hasFamilyTree) round.friendTree = true;
			 
			firebaseService.writeRound(round).then(function(round) {
				//-- move to play round
				$location.search({roundId: round.id});
				$location.path('/challengeRound');
			});
		});
	};
	
	$scope.showPersonDetails = function(person) {
		if (familysearchService.fsUser) {
			var modalInstance = $uibModal.open({
				component: 'personDetails',
				//size: 'lg',
				resolve: {
					person: function () {
						return person;
					}
				}
			});
		} else {
			var notif = notificationService.showNotification({title: 'Family Tree Required', 
				message: 'This feature requires a connection to a Family Tree. Please connect to FamilySearch and try again.', 
				closable: true});
			notif.show();
		}
	};
})
.controller('practiceRoundReviewController', function($scope, notificationService, QuestionService, familysearchService, $interval, $timeout, facebookService, $location, firebaseService, languageService, $uibModal) {
	$scope.$emit('changeBackground', 'challenge_review_background.jpg');
	
	$scope.round = firebaseService.lastRound;
	
	if (!$scope.round) {
		$location.path("/");
		return;
	}
	
	if (facebookService.facebookUser) {
		$scope.me = {};
		$scope.me.shortName = languageService.shortenName(facebookService.facebookUser.name);
		if (facebookService.facebookUser.picture && facebookService.facebookUser.picture.data) {
			$scope.me.photoUrl = facebookService.facebookUser.picture.data.url;
		}
	} else {
		if (familysearchService.fsUser) {
			$scope.me = {};
			$scope.me.shortName = languageService.shortenName(familysearchService.fsUser.display.name);
			$scope.me.photoUrl = familysearchService.fsUser.portrait;
		}
	}
	
	$scope.maxQuestions = 5;
	$scope.myScore = 0;
	$scope.myMissed = 0;
	
	$scope.questionDisplays = [];
	$scope.myStats = null;
	$scope.myStats = $scope.round.fromStats;
	$scope.myMissed = $scope.myStats.missed;
	if ($scope.myMissed < 0) $scope.myMissed = 0;
	$scope.myScore = $scope.myMissed * 20;

	var displayHash = {};
	for(var q=0; q<$scope.maxQuestions; q++) {
		var display = {};
		if ($scope.myStats.questions[q]) {
			if (familysearchService.fsUser && $scope.myStats.questions[q].personId) {
				displayHash[$scope.myStats.questions[q].personId] = display;
				familysearchService.getPersonById($scope.myStats.questions[q].personId, true).then(function(person) {
					displayHash[person.id].person = person;
				});
			}
			
			display.mySeconds = Math.round(($scope.myStats.questions[q].completeTime - $scope.myStats.questions[q].startTime)/1000);
			if ($scope.myStats.questions[q].timeOffset) {
				display.mySeconds -= $scope.myStats.questions[q].timeOffset;
				if (display.mySeconds < 0) display.mySeconds = 0;
			}
			$scope.myScore += display.mySeconds;
			display.myTime = "";
			var minutes = Math.floor(display.mySeconds / 60.0);
			if (minutes < 10) {
				display.myTime = "0";
			}
			display.myTime += minutes + ":";
			var seconds = display.mySeconds - (minutes * 60);
			if (seconds < 10) display.myTime += "0";
			display.myTime += seconds;

			display.letter = QuestionService.getQuestionLetter($scope.myStats.questions[q].name);
			display.letterTooltip = QuestionService.friendlyNames[display.letter];
		} else {
			display.mySeconds = 0;
			display.myTime = "0:00";
			display.letter = "U";
			display.letterTooltip = "You did not complete the QenQuiz";
		}

		displayHash[q] = display;
		$timeout(function() {
			var q = $scope.questionDisplays.length;
			$scope.questionDisplays[q] = displayHash[q];
		}, 500*q);
	}

	if (facebookService.facebookUser && $scope.myScore > 0) {
		firebaseService.getUser(facebookService.facebookUser.id).then(function(user) {
			user.practiceRounds++;
			if (user.practiceHighScore==0 || user.practiceHighScore > $scope.myScore) {
				user.practiceHighScore = $scope.myScore;
			}
			firebaseService.writeUser(user);
		});
	}
	
	$scope.showPersonDetails = function(person) {
		if (familysearchService.fsUser) {
			var modalInstance = $uibModal.open({
				component: 'personDetails',
				//size: 'lg',
				resolve: {
					person: function () {
						return person;
					}
				}
			});
		} else {
			var notif = notificationService.showNotification({title: 'Family Tree Required', 
				message: 'This feature requires a connection to a Family Tree. Please connect to FamilySearch and try again.', 
				closable: true});
			notif.show();
		}
	};
})
.controller('practiceController', function($scope, notificationService, QuestionService, familysearchService, $interval, $timeout, facebookService, $location, firebaseService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	if (!familysearchService.fsUser) {
		$location.path('/');
		return;
	}
	
	if (facebookService.facebookUser) {
		if (facebookService.facebookUser.picture) {
			$scope.pictureUrl = facebookService.facebookUser.picture.data.url;
		}
		firebaseService.getUser(facebookService.facebookUser.id).then(function(user) {
			if (user) {
				$scope.gameUser = user;
			}
		});
	} else {
		if (familysearchService.fsUser) {
			familysearchService.getPersonPortrait(familysearchService.fsUser.id).then(function(data) {
				$scope.pictureUrl = data.src;
			});
		}
	}
	
	var notif = notificationService.showNotification({title: 'Practice GenQuiz', message: 'Practice a GenQuiz on your family tree then challenge your family and friends. Answer the questions as quickly as you can.  Try not to make any mistakes or you will receive a time penalty.'});
	notif.show();
	
	$scope.maxQuestions = 5;
	$scope.ready = false;
	
	$scope.interval = $interval(function() {
		if ($scope.startTime && $scope.currentQuestion < $scope.maxQuestions) {
			if ($scope.question && $scope.question.isReady) {
				if ($scope.freezeTime && $scope.freezeTime > 0) {
					$scope.freezeTime--;
					$scope.loadingTime++;
					if (!$scope.question.timeOffset) {
						$scope.question.timeOffset = 1;
					} else {
						$scope.question.timeOffset++;
					}
				} else {
					var d = new Date();
					var diff = d.getTime() - $scope.startTime.getTime() - $scope.loadingTime;
					$scope.minute = Math.floor(diff / (1000*60));
					$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
					if ($scope.minute >= 15) {
						$scope.completeRound();
					}
				}
			} else {
				$scope.loadingTime++;
			}
		}
	}, 1000);
	
	$scope.getRandomQuestion = function() {
		var nextQ = QuestionService.getRandomQuestion();
		while($scope.question && nextQ.name==$scope.question.name) {
			nextQ = QuestionService.getRandomQuestion();
		}
		return nextQ;
	};
	
	$scope.setupQuestion = function(num, tries) {
		if (tries < 5) {
			var question = $scope.questions[num];
			console.log('trying question '+num+" "+question.name+' setup again '+tries);
			question.error = null;
			question.setup(num+1, true).then(function() {
				console.log('successfully setup question '+num+' '+question.name);
			}, function(error) {
				console.log('failed to setup question '+num+' '+question.name+'. error='+question.error);
				$scope.setupQuestion(num, tries+1);
			});
		} else {
			console.log('too many fails try a new question');
			tries = 0;
			$scope.questions[num].error = null;
			$scope.questions[num] = $scope.getRandomQuestion();
			var question = $scope.questions[num];
			question.setup(num + 1, true).then(function() {
				console.log('successfully setup question '+num+' '+question.name);
			}, function(error) {
				console.log('failed to setup question '+num+' '+question.name+'. error='+question.error);
				$scope.setupQuestion(num, tries+1);
			});
			//-- question object changed so update the current question
			if ($scope.currentQuestion==num) {
				$scope.question = question;
			}
		}
	};
	
	$scope.questions = [];
	$scope.currentQuestion = 0;
	$scope.questions[$scope.currentQuestion] = QuestionService.getRandomQuestion();
	$scope.setupQuestion($scope.currentQuestion, 0);
	
	$scope.startRound = function() {
		notif.close();
		$scope.missedQuestions = 0;
		
		$scope.freezeTime = 0;
		$scope.minute = 0;
		$scope.second = 0;
		$scope.loadingTime = 0;
		$scope.ready = true;
		$scope.startTime = new Date();
		
		$scope.question = $scope.questions[$scope.currentQuestion];
		if ($scope.question.person && $scope.question.isReady) {
			familysearchService.clearUsed();
			familysearchService.markUsed($scope.question.person);
		}
		$scope.question.startTime = (new Date()).getTime();
		$scope.letterTooltip = QuestionService.friendlyNames[$scope.question.letter];
		
		var nextQ = $scope.getRandomQuestion();
		$scope.questions[$scope.currentQuestion+1] = nextQ;
		$scope.setupQuestion($scope.currentQuestion+1, 0);
	}
	
	$scope.completeRound = function() {
		$scope.question.completeTime = (new Date()).getTime();
		$scope.complete = true;
		$interval.cancel($scope.interval);
		$scope.endTime = new Date();
		
		$scope.round = {
		};
		
		$scope.round.fromStats = {
			startTime: $scope.startTime,
			endTime: $scope.endTime,
			loadingTime: $scope.loadingTime,
			missed: $scope.missedQuestions,
			questions: []
		};
		for(var q=0; q<$scope.maxQuestions; q++) {
			if (q < $scope.questions.length) {
				$scope.round.fromStats.questions[q] = $scope.questions[q].getPersistence();
			} else {
				$scope.round.fromStats.questions[q] = {};
			}
		}
		
		firebaseService.lastRound = $scope.round;
		$location.path('/practiceRoundReview');
	};
	
	$scope.nextQuestion = function() {
		$scope.tries = 0;
		$scope.question.completeTime = (new Date()).getTime();
		
		$scope.currentQuestion++;
		if ($scope.currentQuestion >= $scope.maxQuestions) {
			$scope.completeRound();
		} else {		
			$scope.question = $scope.questions[$scope.currentQuestion];
			$scope.question.startTime = new Date();
			$scope.letterTooltip = QuestionService.friendlyNames[$scope.question.letter];
			
			if ($scope.currentQuestion < $scope.maxQuestions-1) {
				$scope.questions[$scope.currentQuestion+1] = $scope.getRandomQuestion();
				$scope.setupQuestion($scope.currentQuestion+1, 0);
			}
		}
	}
	
	$scope.applyHint = function(hint) {
		if ($scope.gameUser && $scope.gameUser.hints[hint.name] && !hint.disabled) {
			firebaseService.subtractUserHint($scope.gameUser.userId, hint).then(function(user) {
				$scope.gameUser = user;
				if (hint.name=='freeze') {
					$scope.freezeTime = hint.time;
				} else if (hint.name=='rollback') {
					if (!$scope.question.timeOffset) $scope.question.timeOffset = 0;
					if ($scope.question.startTime) {
						var now = new Date();
						var diff = Math.round((now.getTime() - $scope.question.startTime.getTime())/1000);
						if (diff < hint.time) {
							$scope.question.timeOffset += diff;
						} else {
							$scope.question.timeOffset += hint.time;
						}
					}
				} else if (hint.name=='lifesaver') {
					$scope.missedQuestions--;
				} else if (hint.name=='fifty') {
					hint.disabled = true;
					hint.hintClass = 'hint-disabled';
					$scope.$broadcast('applyHint', hint);
				} else if (hint.name=='skip') {
					//-- TODO show skip animation
					$scope.nextQuestion();
				}
			}, function(user) {
				$scope.gameUser = user;
				var notif = notificationService.showNotification({title: 'No Hints Available', 
					message: 'All of those hints have been used. Or an error occurred.', 
					closable: true});
				notif.show();
			});
		}
	};
	
	$scope.$on('questionCorrect', function(event, question) {
		$scope.nextQuestion();
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		if ($scope.missedQuestions < 0) {
			//-- TODO show lifesaver animation
		}
		$scope.missedQuestions++;
	});
	
	$scope.$watch('question.isReady', function(newval, oldval) {
		if (newval!=oldval && newval==true) {
			$scope.question.startTime = (new Date()).getTime();

			if ($scope.gameUser) {
				$scope.hints = [];
				angular.forEach(QuestionService.hints, function(hint) {
					if ($scope.gameUser.hints && $scope.gameUser.hints[hint.name] && hint.questions.indexOf($scope.question.name)>=0) {
						var gameHint = angular.copy(hint);
						gameHint.userCount = $scope.gameUser.hints[hint.name];
						$scope.hints.push(gameHint);
					}
				});
			}
		}
	});
	
	$scope.launchMenu = function() {
		if (notif) {
			notif.close();
		}
		$location.path("/menu");
	};
	
	$scope.$on('$destroy', function() {
		if (notif) {
			notif.close();
		}
	});
})
;