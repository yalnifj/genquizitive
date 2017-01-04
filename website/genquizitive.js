angular.module('genquizitive', ['ngRoute','ngCookies','ngAnimate','ui.bootstrap', 'genquiz.questions', 'genquiz.familytree','genquiz.friends','ngMap'])
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
					$scope.start();
				}, $scope.delayStart);
			} else {
				$scope.numberElement.text('START');
				$scope.numberElement.on('click', function() {
					if (!$scope.timer) {
						$scope.start();
					}
				});
			}
			
			$scope.start = function() {
				$scope.numberElement.text('');
				$scope.number = 3;
				$scope.numberElement.css('background-image', "url('number"+$scope.number+".png')");
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
				}, 1000);
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
.directive('timelineFact', ['languageService',function(languageService) {
	return {
		scope: {
			fact: '=',
			person: '='
		},
		template: '<div class="fact-circle"><span class="fact-month-day">{{monthDay}}</span><br /><span class="fact-year">{{year}}</span></div>\
			<div class="fact-details"><div class="fact-age"><span ng-hide="!age">Age<br /><span class="age">{{age}}</span></span></div>\
			<div class="fact-place"><span class="fact-type">{{fact.type | factlabel}}</span><br />{{fact.value}}<br ng-if="value"/>{{fact.place.original}}</div></div>',
		link: function($scope, $element, $attr) {
			$($element).data('fact', $scope.fact);
		},
		controller: ['$scope', 'languageService', function($scope, languageService) {
			if ($scope.fact.date) {
				if (!$scope.fact.date.parsedDate) {
					if ($scope.fact.date.original) {
						$scope.fact.date.parsedDate = languageService.parseDate($scope.fact.date.original);
					}
				}
				if ($scope.fact.date.parsedDate) {
					var date = new Date($scope.fact.date.parsedDate);
					$scope.year = date.getFullYear();
					if ($scope.fact.date.original.length > 4) {
						$scope.monthDay = date.getDate() +" "+languageService.monthShort[date.getMonth()];
					}
					
					if ($scope.person && $scope.person.display && $scope.person.display.birthDate) {
						if (!$scope.person.display.parsedBirthDate) {
							$scope.person.display.parsedBirthDate = languageService.parseDate($scope.person.display.birthDate);
						}
						$scope.age = $scope.fact.date.parsedDate.getFullYear() - $scope.person.display.parsedBirthDate.getFullYear();
						var bmonth = $scope.person.display.parsedBirthDate.getMonth();
						var fmonth = $scope.fact.date.parsedDate.getMonth();
						if (fmonth < bmonth) {
							$scope.age -= 1;
						} else if (fmonth==bmonth) {
							var bday = $scope.person.display.parsedBirthDate.getDate();
							var fday = $scope.fact.date.parsedDate.getDate();
							if (fday < bday) {
								$scope.age -= 1;
							}
						}
					}
				}
			}
			
		}]
	}
}])
.directive('answerButton', [function() {
	return {
		scope: {
			label: '=',
			background: '@',
			incorrect: '='
		},
		template: '<div class="answer-button" ng-style="answerStyle">{{label}}</div>',
		link: function($scope, $element, $attr) {
			$scope.updateStyle = function() {
				$scope.answerStyle = {
					background: "url('"+$scope.background+"')",
					opacity: $scope.incorrect ? '0.7':'1.0'
				};
			};
			$scope.$watch('background', function() {
				$scope.updateStyle();
			});
			$scope.$watch('incorrect', function() {
				$scope.updateStyle();
			});
		}
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
.directive('animatedTimer', ['$interval', function($interval) {
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
					if ($scope.step > 5) $scope.step = 5;
					if ($scope.step > 0 && $scope.step < 0.05) $scope.curVal = $scope.time;
					if ($scope.step < -5) $scope.step = -5;
					if ($scope.step < 0 && $scope.step > -0.05) $scope.curVal = $scope.time;
					$scope.curVal += $scope.step;
					$scope.curVal = Math.round($scope.curVal);
					
					var minutes = Math.floor($scope.curVal / 60.0);
					$scope.display = minutes + ":";
					var seconds = $scope.curVal - (minutes * 60);
					if (seconds < 10) $scope.display += "0";
					$scope.display += seconds;
					
					if ($scope.curVal==$scope.time) {
						$interval.cancel($scope.interval);
						$scope.interval = null;
					}
				}, 50);
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
.directive('zoomToFit', [function() {
	return {
		link: function($scope, $element, $attr) {
			var h = $attr.zoomMaxHeight;
			if (h && h>0) {
				var wh = $(window).height();
				if (h > wh) {
					var zoom=wh/h;
					$element.css('zoom', zoom);
				}
			}
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
.controller('hintsController', function($scope, facebookService, firebaseService, $location, QuestionService, familysearchService, notificationService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	if (!facebookService.facebookUser) {
		//-- go back to home screen if not authed to anything
		$location.path('/');
		return;
	}
	
	$scope.hints = angular.copy(QuestionService.hints);
	
	$scope.$watch('gameUser', function() {
		if ($scope.gameUser) {
			angular.forEach($scope.hints, function(hint) {
				if ($scope.gameUser.hints && $scope.gameUser.hints[hint.name]) {
					hint.userCount = $scope.gameUser.hints[hint.name];
				} else {
					hint.userCount = 0;
				}
			});
		}
	});
	
	firebaseService.getUser(facebookService.facebookUser.id).then(function(user) {
		if (user) {
			$scope.gameUser = user;
		}
	});
	
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
		$scope.foundEntry = null;
		$scope.entryCount = 0;
		familysearchService.getUserHistory().then(function(entries) {
			if (entries && entries.length>0) {
				for(var e=0; e<entries.length; e++) {
					if (entries[e].updated > lastDate) {
						$scope.entryCount++;
						familysearchService.getPersonChanges(entries[e].id).then(function(personEntries) {
							if (personEntries) {
								for(var i=0; i<personEntries.length; i++) {
									var entry = personEntries[i];
									if (entry.updated >= lastDate) {
										if (entry.contributors) {
											for(var c=0; c<entry.contributors.length; c++) {
												if (familysearchService.currentUser && entry.contributors[c].name == familysearchService.currentUser.contactName) {
													if ($scope.foundEntry == null) {
														var hint = QuestionService.getRandomHint();
														firebaseService.addUserHint($scope.gameUser.userId, hint).then(function(user) {
															$scope.gameUser = user;
														});
														var notif = notificationService.showNotification({title: 'Congratulations!',message: 'You\'ve earned a free hint! \
															<img src="'+hint.img+'" />', closable: true});
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
					}
				}
				$scope.gameUser.lastFSHint = (new Date()).getTime();
				firebaseService.writeUserProperty($scope.gameUser.userId, 'lastFSHint', $scope.gameUser.lastFSHint);
			} else {
				var notif = notificationService.showNotification({title: 'Hints',message: 'We were unable to find any change you have made on your family tree. \
					Improve your family tree each day to earn free hints!', closable: true});
				notif.show();
			}
		}, function(error) {
			var notif = notificationService.showNotification({title: 'FamilySearch Error',message: 'Unable to get user history from FamilySearch.', closable: true});
			notif.show();
			console.log(error);
		});
	};
	$scope.$watch('foundEntry', function(newval, oldval) {
		if (newval!=oldval) {
			if ($scope.foundEntry===false) {
				var notif = notificationService.showNotification({title: 'FamilySearch',message: 'No user history was found in FamilySearch.', closable: true});
				notif.show();
			}
		}
	});
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
.component('personDetails', {
	templateUrl: 'personDetails.html',
	bindings: {
		person: '<',
		resolve: '<',
		close: '&',
		dismiss: '&'
	},
	controller: function(familysearchService, languageService, NgMap) {
		var $ctrl = this;
		$ctrl.active = 0;
		$ctrl.$onInit = function () {
			if (!$ctrl.person) {
				$ctrl.person = $ctrl.resolve.person;
			}
			if ($ctrl.person) {
				$ctrl.facts = languageService.sortFacts($ctrl.person.facts);
				$ctrl.poleStyle = {height: (($ctrl.facts.length - 1)*85)+'px'};
				
				$ctrl.ancestors = [];
				var hash = {};
				familysearchService.getAncestorTree($ctrl.person.id, 2, false).then(function(tree) {
					$ctrl.parents = [];
					$ctrl.gParents = [];
					if (tree.persons) {
						var lastIndex = 1;
						angular.forEach(tree.persons, function(person) {
							if (person.display.ascendancyNumber.indexOf("S")<0 && person.display.ascendancyNumber > 1) {
								if (person.display.ascendancyNumber < 4) {
									while(lastIndex < person.display.ascendancyNumber - 1) {
										$ctrl.parents.push("spacer");
									}
									$ctrl.parents.push(person);
								} else {
									while(lastIndex < person.display.ascendancyNumber - 1) {
										$ctrl.parents.push("spacer");
									}
									$ctrl.gParents.push(person);
								}
								lastIndex = person.display.ascendancyNumber;
							}
							hash[person.id] = person;
							familysearchService.getPersonPortrait(person.id).then(function(details) {
								hash[details.id].portrait = details.src;
							});
						});
					}
				});
				$ctrl.spouseTrees = {};
				$ctrl.hasSpouses = false;
				familysearchService.getDescendancyTree($ctrl.person.id, 1, false).then(function(tree) {
					if (tree.persons) {
						angular.forEach(tree.persons, function(person) {
							if (person.display.descendancyNumber!="1") {
								var dnums = person.display.descendancyNumber.split(".");
								if (dnums[0]=="1") dnums[0]="1-S";
								if (!$ctrl.spouseTrees[dnums[0]]) {
									$ctrl.hasSpouses = true;
									$ctrl.spouseTrees[dnums[0]] = { children: [] };
								}
								if (dnums.length==1) {
									$ctrl.spouseTrees[dnums[0]].spouse = person;
								} else {
									$ctrl.spouseTrees[dnums[0]].children.push(person);
								}
								hash[person.id] = person;
								familysearchService.getPersonPortrait(person.id).then(function(details) {
									hash[details.id].portrait = details.src;
								});
							}
						});
					}
				});
				familysearchService.getPersonMemories($ctrl.person.id).then(function(memories) {
					$ctrl.memories = [];
					angular.forEach(memories, function(memory) {
						if (memory.links && memory.links['image-thumbnail'] && memory.links['image-thumbnail'].href) {
							//if (!$ctrl.active) $ctrl.active = memory.id;
							memory.src = 'fs-proxy.php?url='+encodeURIComponent(memory.links['image-thumbnail'].href);
							$ctrl.memories.push(memory);
						}
					});
				});
				
				//-- map the facts
				$ctrl.places = [];
				var placeFacts = {};
				var promises = [];
				for(var f=0; f<$ctrl.facts.length; f++) {
					var fact = $ctrl.facts[f];
					if (fact.place) {
						var place = "";
						if (fact.place.normalized && fact.place.normalized.value) {
							place = fact.place.normalized.value;
						} else if (fact.place.original) {
							place = fact.place.original;
						}
						
						if (place!="") {
							if (placeFacts[place]) placeFacts[place].push(fact);
							else {
								placeFacts[place] = [fact];
								var promise = familysearchService.searchPlace(place).then(function(response) {
									if (response.entries && response.entries.length>0) {
										var responsePlace = response.place;
										var entry = response.entries[0];
										if (entry.content && entry.content.gedcomx && entry.content.gedcomx.places && entry.content.gedcomx.places.length>0) {
											var placeAuthority = entry.content.gedcomx.places[0];
											if (placeAuthority.latitude) {
												placeAuthority.facts = placeFacts[responsePlace];
												placeAuthority.pos = [placeAuthority.latitude, placeAuthority.longitude];
												$ctrl.places.push(placeAuthority);
											}
										}
									}
								}, function(error) {
									console.log("unable to get place for "+place+" "+error);
								});
								promises.push(promise);
							}
						}
					}
				}
				//-- wait for all place searches to complete
				$q.all(promises).then(function() {
					//map is ready
					$ctrl.dynMarkers = [];
					NgMap.getMap().then(function(map) {
						$ctrl.map = map;
						for (var k in map.customMarkers) {
							var cm = map.customMarkers[k];
							$ctrl.dynMarkers.push(cm);
						}
						if ($ctrl.markerClusterer) {
							$ctrl.markerClusterer.clearMarkers();
							$ctrl.markerClusterer.addMarkers($ctrl.dynMarkers);
						} else {
							$ctrl.markerClusterer = new MarkerClusterer(map, $ctrl.dynMarkers, {styles: [{url: 'map_cluster.png', gridSize: 200, width: 100, height: 58, textSize: 16}]}); 
						}
						setTimeout(function() {
							$ctrl.markerClusterer.fitMapToMarkers();
							google.maps.event.trigger(map, 'resize');
						}, 200);
					});
				}, function(error) {
					console.log("unable to resolve all promises "+error);
				});
			}
		};
		
		$ctrl.$onDestroy = function() {
			if ($ctrl.map) {
				$ctrl.markerClusterer.clearMarkers();
				google.maps.event.clearInstanceListeners($ctrl.map);
			}
		};
		
		$ctrl.ok = function () {
			$ctrl.close();
		};

		$ctrl.cancel = function () {
			$ctrl.dismiss();
		};
	}
})
.controller('testQuestionController', function($scope, notificationService, QuestionService, familysearchService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	$scope.questions = QuestionService.questions;
	$scope.question = $scope.questions[0];
	$scope.difficulty = 1;
	$scope.useLiving = true;
	
	familysearchService.fsLoginStatus().then(function(fsUser) {
		familysearchService.clearUsed();
		familysearchService.getAncestorTree(fsUser.id, 6, true).then(function() {
			$scope.question.setup(1, true);
		});
	});

	$scope.tries = 0;
	$scope.setupQuestion = function() {
		$scope.tries++;
		console.log('trying question '+$scope.question.name+' setup again '+$scope.tries);
		$scope.question.error = null;
		$scope.question.setup($scope.difficulty, $scope.useLiving).then(function() {
			console.log('successfully setup question '+$scope.question.name);
		}, function(error) {
			familysearchService.clearUsed();
			window.setTimeout(function() {
				$scope.setupQuestion();
			}, 1500);
		});

	};
	
	$scope.$watch('question', function(newval, oldval) {
		$scope.setupQuestion();
	});

	$scope.$watch('difficulty', function(newval, oldval) {
		$scope.setupQuestion();
	});

	$scope.$watch('useLiving', function(newval, oldval) {
		$scope.setupQuestion();
	});
})
;