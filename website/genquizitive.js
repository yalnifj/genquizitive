if (!window.console) {
	window.console = {};
}
if (!window.console.log) {
	window.console.log = function() { };
}
angular.module('genquizitive', ['ngRoute','ngCookies','ui.bootstrap', 'genquiz.questions', 'genquiz.familytree','genquiz.friends'])
.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
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
.directive('backgrounds', [function() {
	return {
		link: function($scope, $element, $attrs) {
			$scope.$on('changeBackground', function(event, background) {
				$element.css('background-image', "url('"+background+"')");
			});
		}
	}
}])
.service('notificationService', ['$rootScope', '$compile', function($rootScope, $compile){
	this.showNotification = function(options) {
		var $scope = $rootScope.$new();
		$scope.title = options.title;
		$scope.message = options.message;
		$scope.options = options;
		var template = '<div class="notification"><div class="title">{{title}}</div><div class="message">{{message}}</div>\
			<button ng-if="options.closable" ng-click="close()" class="btn btn-default closebutton">Close</button></div>';
		$scope.element = $compile(template)($scope);
		$('body').append($scope.element);
		
		$scope.show = function() {
			var left = ($(window).width() - $scope.element.width()) / 2;
			$scope.element.css('left', left + 'px');
			$scope.element.animate({top: '20px'}, 1500);
		};
		
		$scope.close = function() {
			$scope.element.animate({top: '-500px'}, {duration: 800, complete: function() { $scope.element.remove(); } });
		};
		
		return $scope;
	};
}])
.directive('countdown', ['$interval', '$timeout', function($interval, $timeout) {
	return {
		restrict: 'C',
		scope: {
			callback: '&',
			remove: '=',
			delayStart: '='
		},
		link: function($scope, $element, $attr) {
			$scope.numberElement = $('<div style="position: absolute;top: 40px;left: 150px;width: 100px;height: 110px; color: white; font-size: 35px; font-family: monospace; line-height: 110px;"></div>');
			$element.append($scope.numberElement);
			$scope.number = 4;
			if (!$scope.delayStart) {
				$scope.delayStart = 1000;
			}
			
			if ($scope.delayStart > 0) {
				$scope.timeout = $timeout(function() {
					$scope.start($scope.delayStart);
				}, $scope.delayStart);
			} else {
				$scope.numberElement.text('START');
				$scope.numberElement.on('click', function() {
					if (!$scope.timer) {
						$scope.start(0);
					}
				});
			}
			
			$scope.start = function(delay) {
				$scope.numberElement.text('');
				$scope.timer = $interval(function() {
					$scope.number--;
					if ($scope.number>0) {
						$scope.numberElement.css('background-image', "url('number"+$scope.number+".png')");
					} else {
						if ($scope.remove && $scope.remove!='false') {
							$element.remove();
						}
						$scope.callback();
					}
				}, delay);
			};
			
			$element.on('$destroy', function() {
				$timeout.cancel($scope.timeout);
				$interval.cancel($scope.timer);
			});
		}
	}
}])
.directive('avatarBadge', ['facebookService', function(facebookService) {
	return {
		scope: {
			src: '=',
			label: '='
		},
		template: '<img src="{{src}}" ng-if="src" /><div class="avatar-label" ng-if="label">{{label}}</div>',
		replace: false
	}
}])
.directive('answerButton', [function() {
	return {
		scope: {
			label: '=',
			background: '@',
			incorrect: '='
		},
		template: '<div class="answer-button" style="background: url(\'{{background}}\'); {{incorrect? \'opacity: 0.7;\':\'opacity: 1.0;\'}}">{{label}}</div>'
	}
}])
.directive('proxyImg', [function() {
	return {
		scope: {
			src: '@'
		},
		link: function($scope, $element, $attr) {
			$scope.setProxyUrl = function() {
				if ($scope.src) {
					var src = "/fs-proxy.php?url=" + encodeURIComponent($scope.src);
					$element.attr('src', src);
				}
			}
			$scope.setProxyUrl();
			$scope.$watch('src', function() {
				$scope.setProxyUrl();
			});
		}
	}
}])
.directive('guage', ['$interval', function($interval) {
	return {
		scope: {
			min: '=',
			max: '=',
			value: '=',
			label: '@'
		},
		template: '<img src="guage_hand.png" /><div ng-if="label" class="guage-label">{{label}}</div>',
		link: function($scope, $element, $attr) {
			if (!$scope.min) $scope.min = 0;
			if (!$scope.max) $scope.max = 100;
			if (!$scope.value) $scope.value = $scope.min;
			
			$scope.rotate = function() {
				$scope.currDeg = $scope.targetDeg;
				if (!$scope.currDeg) $scope.currDeg = 0;
				
				var perc = ($scope.value - $scope.min) / ($scope.max - $scope.min);
				$scope.targetDeg = Math.floor(perc * 270);
				
				$scope.degStep = ($scope.targetDeg - $scope.currDeg) / 10;
				$scope.rotStep = 0;
				
				if (!$scope.interval) {
					$scope.interval = $interval(function() {
						$scope.currDeg += $scope.degStep;
						$element.children('img').css('transform', 'rotate('+$scope.currDeg+'deg)');
						$scope.rotStep++;
						if ($scope.rotStep==10) {
							$interval.cancel($scope.interval);
							$scope.interval = null;
						}
					}, 100);
				}
			};
			
			$scope.$watch('value', function(newval, oldval) {
				if (newval!=oldval) {
					if ($scope.value < $scope.min) {
						$scope.value = $scope.min;
					}
					if ($scope.value > $scope.max) {
						$scope.value = $scope.max;
					}
					$scope.rotate();
				}
			});
		}
	}
}])
.directive('light', [function() {
	return {
		scope: {
			on: '=',
			color: '@'
		},
		template: '<img src="{{imgUrl}}" />',
		link: function($scope, $element, $attr) {
			$scope.setImgUrl = function() {
				$scope.imgUrl = $scope.color+"_light_";
				if ($scope.on===true) $scope.imgUrl+="on";
				else $scope.imgUrl+="off";
				$scope.imgUrl+=".png";
			}
			$scope.setImgUrl();
			
			$scope.$watch('on', function() {
				$scope.setImgUrl();
			});
			$scope.$watch('color', function() {
				$scope.setImgUrl();
			});
		}
	}
}])
.directive('animatedTimer', [function() {
	return {
		scope: {
			time: '='
		},
		template: '{{display}}',
		link: function($scope, $element, $attr) {
			if (!$scope.time) $scope.time=0;
			$scope.curVal = 0;
			$scope.display = "0:00";
			
			$scope.animate = function() {				
				$scope.interval = $interval(function() {
					$scope.step = ($scope.time - $scope.curVal) / 2.0; 
					if ($scope.step > 2) $scope.step = 2;
					if ($scope.step > 0 && $scope.step < 0.05) $scope.curVal = $scope.time;
					if ($scope.step < -2) $scope.step = -2;
					if ($scope.step < 0 && $scope.step > -0.05) $scope.curVal = $scope.time;
					$scope.curVal += $scope.step;
					
					var minutes = Math.floor($scope.curVal / 60.0);
					$scope.display = minutes + ":";
					var seconds = $scope.curVal - (minutes * 60);
					if (seconds < 10) $scope.display += "0";
					$scope.display += seconds;
					
					if ($scope.curVal==$scope.time) {
						$interval.cancel($scope.interval);
						$scope.interval = null;
					}
				}, 20);
			};
			$scope.animate();
			
			$scope.$watch('value', function(newval, oldval) {
				if (newval!=oldval) {
					if (!$scope.interval) $scope.animate();
				}
			});
		}
	}
}])
.directive('loadingSign', ['$interval', function($interval) {
	return {
		link: function($scope, $element, $attr) {
			$scope.count = 1;
			$scope.step = 1;
			
			$scope.images = [];
			var img = new Image();
			img.src = "loading1.png";
			$scope.images.push(img);
			img = new Image();
			img.src = "loading2.png";
			$scope.images.push(img);
			img = new Image();
			img.src = "loading3.png";
			$scope.images.push(img);
			
			$scope.setBackground = function() {
				$element.css('background-image', 'url("loading'+$scope.count+'.png")');
			};
			
			$scope.setBackground();
			$scope.interval = $interval(function() {
				$scope.count+=$scope.step;
				if ($scope.count > 3) {
					$scope.count = 2;
					$scope.step = -1;
				}
				if ($scope.count < 1) {
					$scope.count = 2;
					$scope.step = 1;
				}
				$scope.setBackground();
			}, 750);
			
			$scope.$on('$destroy', function() {
				$interval.cancel($scope.interval);
			});
		}
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
	
	familysearchService.fsLoginStatus().then(function(fsUser){
		$scope.fsLoggedIn = true;
		$scope.fsUserName = fsUser.display.name;
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbUserName = languageService.shortenName(fbUser.name);
			$scope.fbLoggedIn = true;
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		}, function(error) {
			//var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
			//notif.show();
			$scope.checkLogin();
		});
	}, function() {
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbLoggedIn = true;
			$scope.fbUserName = languageService.shortenName(fbUser.name);
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		}, function(error) {
			//var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
			//notif.show();
			$scope.checkLogin();
		});
	});
})
.controller('menuController', function($scope, facebookService, familysearchService, firebaseService, $location) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	$scope.fsLogin = function() {
		familysearchService.fsLogin();
	}
	
	if (familysearchService.fsUser) {
		$scope.hasFamilyTree = true;
	}
	
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
	
})
.controller('continueController', function($scope, facebookService, firebaseService, notificationService, $location, languageService) {
	$scope.$emit('changeBackground', 'questions/multi2/background.jpg');
	
	if (!facebookService.facebookUser) {
		//-- go back to home screen if not authed to anything
		$location.path('/');
		return;
	}
	
	$scope.launchReview = function(round) {
		firebaseService.lastRound = $scope.round;
		$location.path('/challengeRoundReview');
	};
	
	$scope.launchRound = function(round) {
		$location.search({roundId: round.id});
		$location.path('/challengeRound');
	};
	
	$scope.friends = {};
	$scope.completeGames = [];
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
				$scope.completeGames.push(round);
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
				$scope.completeGames.push(round);
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
			startTime: new Date(),
			questions: []
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
			
			if ($scope.round.hasFamilyTree || facebookService.facebookUser.id==$scope.round.from) {
				$scope.fromPersistence = false;
				if ($scope.round.fromStats) {
					$scope.questions[$scope.currentQuestion] = QuestionService.getQuestionByName($scope.round.fromStats.questions[0].name);
				} else {
					$scope.questions[$scope.currentQuestion] = QuestionService.getRandomQuestion();
				}
				if (familysearchService.fsUser && $scope.round.fromStats && familysearchService.getLocalPersonById($scope.round.fromStats.questions[0].personId)) {
					$scope.questions[$scope.currentQuestion].setupFromPersistence($scope.round.fromStats.questions[0]);
				} else {
					$scope.setupQuestion($scope.currentQuestion);
					//$scope.questions[$scope.currentQuestion].setup($scope.currentQuestion + 1, $scope.round.friendTree);
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
	$scope.maxQuestions = 4;
	$scope.ready = false;
	
	$scope.minute = 0;
	$scope.second = 0;
	$scope.interval = $interval(function() {
		if ($scope.startTime && $scope.currentQuestion < 4) {
			var d = new Date();
			var diff = d.getTime() - $scope.startTime.getTime();
			$scope.minute = Math.floor(diff / (1000*60));
			$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
			if ($scope.minute >= 30) {
				$scope.completeRound();
			}
		}
	}, 1000);
	
	$scope.missedQuestions = 0;
	
	$scope.startRound = function() {
		notif.close();
		$scope.ready = true;
		$scope.startTime = new Date();
		
		$scope.question = $scope.questions[$scope.currentQuestion];
		
		if ($scope.round.fromStats && $scope.round.fromStats.questions[$scope.currentQuestion+1]) {
			$scope.questions[$scope.currentQuestion+1] = QuestionService.getQuestionByName($scope.round.fromStats.questions[$scope.currentQuestion+1].name);
		} else {
			var nextQ = QuestionService.getRandomQuestion();
			while(nextQ.name==$scope.question.name) {
				nextQ = QuestionService.getRandomQuestion();
			}
		}
		$scope.questions[$scope.currentQuestion+1] = nextQ;
		if ($scope.fromPersistence) {
			$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
		} else {
			if (familysearchService.fsUser && $scope.round.fromStats && familysearchService.getLocalPersonById($scope.round.fromStats.questions[$scope.currentQuestion+1].personId)) {
				$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
			} else {
				$scope.setupQuestion($scope.currentQuestion + 1);
				//$scope.questions[$scope.currentQuestion+1].setup($scope.currentQuestion + 2, $scope.round.friendTree);
			}
		}
	}
	
	$scope.completeRound = function() {
		$scope.complete = true;
		$interval.cancel($scope.interval);
		$scope.endTime = new Date();
		
		if ($scope.round.from==facebookService.facebookUser.id) {
			$scope.round.fromStats = {
				time: $scope.endTime,
				missed: $scope.missedQuestions,
				questions: []
			};
			for(var q=0; q<4; q++) {
				if (q < $scope.questions.length) {
					$scope.round.fromStats.questions[q] = $scope.questions[q].getPersistence();
				} else {
					$scope.round.fromStats.questions[q] = {};
				}
			}
			
			//-- send facebook event
			facebookService.sendGenQuiz(round.to).then(function(response) {
				round.requestId = response.request;
				firebaseService.writeRound(round);
			});
		} else {
			$scope.round.toStats = {
				time: $scope.endTime,
				missed: $scope.missedQuestions,
				questions: []
			};
			for(var q=0; q<4; q++) {
				if (q < $scope.questions.length) {
					$scope.round.toStats.questions[q] = $scope.questions[q].getPersistence();
				} else {
					$scope.round.toStats.questions[q] = {};
				}
			}
			$scope.round.complete = true;
			//-- send facebook event
			facebookService.sendGenQuizComplete(round.from).then(function(response) {
				round.requestId = response.request;
				firebaseService.writeRound(round);
			});
		}
		firebaseService.lastRound = $scope.round;
		$location.path('/challengeRoundReview');
	};
	
	$scope.nextQuestion = function() {
		$scope.question.completeTime = new Date();
		
		if ($scope.currentQuestion >= 4) {
			$scope.completeRound();
		} else {		
			$scope.currentQuestion++;
			$scope.question = $scope.questions[$scope.currentQuestion];
			
			if ($scope.round.fromStats && $scope.round.fromStats.questions[$scope.currentQuestion+1]) {
				$scope.questions[$scope.currentQuestion+1] = QuestionService.getQuestionByName($scope.round.fromStats.questions[$scope.currentQuestion+1].name);
			} else {
				var nextQ = QuestionService.getRandomQuestion();
				while(nextQ.name==$scope.question.name) {
					nextQ = QuestionService.getRandomQuestion();
				}
			}
			$scope.questions[$scope.currentQuestion+1] = nextQ;
			if ($scope.fromPersistence) {
				$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
			} else {
				if (familysearchService.fsUser && $scope.round.fromStats && familysearchService.getLocalPersonById($scope.round.fromStats.questions[$scope.currentQuestion+1].personId)) {
					$scope.questions[$scope.currentQuestion+1].setupFromPersistence($scope.round.fromStats.questions[$scope.currentQuestion+1]);
				} else {
					$scope.setupQuestion($scope.currentQuestion + 1);
					//$scope.questions[$scope.currentQuestion+1].setup($scope.currentQuestion + 2, $scope.round.friendTree);
				}
			}
		}
	}
	
	$scope.$on('questionCorrect', function(event, question) {
		$scope.nextQuestion();
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
	});
	
	$scope.tries = 0;
	$scope.setupQuestion = function(num) {
		$scope.tries++;
		if ($scope.tries < 5) {
			console.log('trying question setup again '+$scope.tries);
			$scope.questions[num].error = null;
			$scope.questions[num].setup(num+1, $scope.round.friendTree).then(function() {
			}, function(error) {
				$scope.setupQuestion(num);
			});
		} else {
			console.log('too many fails try a new question');
			$scope.tries = 0;
			$scope.questions[num].error = null;
			$scope.questions[num] = QuestionService.getRandomQuestion();
			$scope.questions[num].setup(num + 1, $scope.round.friendTree).then(function() {
			}, function(error) {
				$scope.setupQuestion(num);
			});
			$scope.question = $scope.questions[num];
		}
	};
	
	/*
	$scope.$watch('question.error', function(newval, oldval) {
		if (newval && newval!=oldval) {
			$scope.setupQuestion($scope.currentQuestion);
		}
	});
	*/
	
	$scope.launchMenu = function() {
		notif.close();
		$location.path("/menu");
	};
})
.controller('challengeRoundReviewController', function($scope, notificationService, QuestionService, familysearchService, $interval, facebookService, $location, firebaseService, languageService) {
	$scope.$emit('changeBackground', 'challenge_review_background.jpg');
	
	$scope.round = firebaseService.lastRound;
	
	if ($scope.round || !facebookService.facebookUser) {
		$location.path("/");
		return;
	}
	
	$scope.me = facebookService.facebookUser;
	$scope.me.shortName = languageService.shortenName(me['first_name']+' '+me['last_name']);
	
	if (facebookService.facebookUser.id==$scope.round.from) {
		$scope.friend = facebookService.fbGetUserById($scope.round.to);
	} else {
		$scope.friend = facebookService.fbGetUserById($scope.round.from)
	}
	$scope.friend.shortName = languageService.shortenName($scope.friend['first_name']+' '+$scope.friend['last_name']);
	
	$scope.myScore = 0;
	$scope.myMissed = 0;
	$scope.friendScore = 0;
	$scope.friendMissed = 0;
	
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
	
	for(var q=0; q<4; q++) {
		var display = {};
		if (familysearchService.fsUser && myStats.personId) {
			familysearchService.getPersonById(myStats.personId).then(function(person) {
				display.person = person;
			});
		}
		
		display.myTime = $scope.myStats.questions[q].time;
		display.friendTime = $scope.friendStats.questions[q].time;
		switch($scope.myStats.questions[q].name) {
			case 'multi1':
				display.letter = 'R';
				break;
			case 'multi2':
				display.letter = 'F';
				break;
			case 'tree':
				display.letter = 'T';
				break;
			default:
				display.letter = 'P';
				break;
		}
		$scope.questionDisplays[q] = display;
	}
	
})
.controller('practiceController', function($scope, notificationService, QuestionService, familysearchService, $interval, facebookService, $location) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	if (!familysearchService.fsUser) {
		$location.path('/');
		return;
	}
	
	if (facebookService.facebookUser && facebookService.facebookUser.picture) {
		$scope.pictureUrl = facebookService.facebookUser.picture.data.url;
	}
	
	var notif = notificationService.showNotification({title: 'Practice GenQuiz', message: 'Practice a GenQuiz on your family tree then challenge your family and friends. Answer the questions as quickly as you can.  Try not to make any mistakes or you will receive a time penalty.'});
	notif.show();
	
	$scope.questions = [];
	$scope.currentQuestion = 0;
	$scope.maxQuestions = 4;
	$scope.ready = false;
	
	$scope.minute = 0;
	$scope.second = 0;
	$scope.interval = $interval(function() {
		if ($scope.startTime && $scope.currentQuestion < 4) {
			var d = new Date();
			var diff = d.getTime() - $scope.startTime.getTime();
			$scope.minute = Math.floor(diff / (1000*60));
			$scope.second = Math.floor(diff / 1000) - ($scope.minute * 60);
			if ($scope.minute >= 30) {
				$scope.completeRound();
			}
		}
	}, 1000);
	
	$scope.missedQuestions = 0;
	$scope.tries = 0;
	$scope.setupQuestion = function(num) {
		$scope.tries++;
		if ($scope.tries < 5) {
			console.log('trying question setup again '+$scope.tries);
			$scope.questions[num].error = null;
			$scope.questions[num].setup(num+1, true).then(function() {
			}, function(error) {
				$scope.setupQuestion(num);
			});
		} else {
			console.log('too many fails try a new question');
			$scope.tries = 0;
			$scope.questions[num].error = null;
			$scope.questions[num] = QuestionService.getRandomQuestion();
			$scope.questions[num].setup(num + 1, true).then(function() {
			}, function(error) {
				$scope.setupQuestion(num);
			});
			$scope.question = $scope.questions[num];
		}
	};
	
	$scope.questions[$scope.currentQuestion] = QuestionService.getRandomQuestion();
	//$scope.questions[$scope.currentQuestion].setup($scope.currentQuestion + 1, true);
	$scope.setupQuestion($scope.currentQuestion);
	
	$scope.startRound = function() {
		notif.close();
		$scope.ready = true;
		$scope.startTime = new Date();
		
		$scope.question = $scope.questions[$scope.currentQuestion];
		
		var nextQ = QuestionService.getRandomQuestion();
		while(nextQ.name==$scope.question.name) {
			nextQ = QuestionService.getRandomQuestion();
		}
		$scope.questions[$scope.currentQuestion+1] = nextQ;
		//$scope.questions[$scope.currentQuestion+1].setup($scope.currentQuestion + 2, true);
		$scope.setupQuestion($scope.currentQuestion+1);
	}
	
	$scope.completeRound = function() {
		$scope.complete = true;
		$interval.cancel($scope.interval);
		$scope.endTime = new Date();
	};
	
	$scope.nextQuestion = function() {
		$scope.question.completeTime = new Date();
		
		if ($scope.currentQuestion >= 4) {
			$scope.completeRound();
		} else {		
			$scope.currentQuestion++;
			$scope.question = $scope.questions[$scope.currentQuestion];
			
			$scope.questions[$scope.currentQuestion+1] = QuestionService.getRandomQuestion();
			//$scope.questions[$scope.currentQuestion+1].setup($scope.currentQuestion + 2, true);
			$scope.setupQuestion($scope.currentQuestion+1);
		}
	}
	
	$scope.$on('questionCorrect', function(event, question) {
		$scope.nextQuestion();
	});
	
	$scope.$on('questionIncorrect', function(event, question) {
		$scope.missedQuestions++;
	});
	
	/*
	$scope.$watch('question.error', function(newval, oldval) {
		if (newval && newval!=oldval) {
			$scope.tries++;
			console.log('trying question setup again '+$scope.tries);
			$scope.question.error = null;
			$scope.question.setup($scope.question.difficulty, true);
		}
	});
	*/
	
	$scope.launchMenu = function() {
		notif.close();
		$location.path("/menu");
	};
})
.controller('testQuestionController', function($scope, notificationService, QuestionService, familysearchService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	$scope.questions = QuestionService.questions;
	$scope.question = $scope.questions[0];
	
	familysearchService.fsLoginStatus().then(function(fsUser) {
		familysearchService.usedPeople = {};
		familysearchService.getAncestorTree(fsUser.id, 6, true).then(function() {
			$scope.question.setup(1, true);
		});
	});
	
	$scope.$watch('question', function(newval, oldval) {
		$scope.question.setup();
	});
	
	$scope.tries = 0;
	$scope.$watch('question.error', function(newval, oldval) {
		if (newval && newval!=oldval) {
			$scope.tries++;
			console.log('trying question setup again '+$scope.tries);
			$scope.question.error = null;
			$scope.question.setup($scope.question.difficulty, true);
		}
	});
})
;