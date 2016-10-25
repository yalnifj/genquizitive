angular.module('genquizitive', ['ngRoute','ngCookies','ui.bootstrap', 'genquiz.questions'])
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
		.when('/question/:page', {
			templateUrl: function($routeParams) {
				return 'questions/'+$routeParams.page +'.html';
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
.service('facebookService', ['$q', function($q) {
	this.facebookUser = null;
	this.hasPicture = false;
	
	this.fbLoginStatus = function() {
		var deferred = $q.defer();
		var temp = this;
		if (!window.FB) {
			deferred.reject("Could not communicate with Facebook");
		} else {
			FB.getLoginStatus(function(response) {
				console.log(response.status);
				if (response.status === 'connected') {
					// Logged into your app and Facebook.
					temp.fbGetUser().then(function() {
						deferred.resolve(temp.facebookUser);
					});
				} else {
					if (response.status !== 'unknown') {
						deferred.reject(response.body);
					}
				}
			});
		}
		return deferred.promise;
	};
	
	this.fbLogin = function() {
		var deferred = $q.defer();
		var temp = this;
		if (!window.FB) {
			deferred.reject("Could not communicate with Facebook");
		} else {
			FB.login(function(response) {
				console.log(response.status);
				if (response.status === 'connected') {
					// Logged into your app and Facebook.
					temp.fbGetUser().then(function() {
						deferred.resolve(temp.facebookUser);
					});
				} else if (response.status === 'not_authorized') {
					// The person is logged into Facebook, but not your app.
					//alert('Facebook login failed');
					deferred.reject(response.body);
				} else {
					// The person is not logged into Facebook, so we're not sure if
					// they are logged into this app or not.
					//alert('Facebook login failed');
					deferred.reject(response.body);
				}
			}, {scope: 'public_profile,email,user_friends,user_relationships'});
		}
		return deferred.promise;
	};
	
	this.fbLogout = function() {
		FB.logout();
	};
	
	this.fbGetUser = function() {
		var deferred = $q.defer();
		var temp = this;
		FB.api('/me', {fields: "id,name,picture"}, function(response) {
			temp.facebookUser = response;
			if (temp.facebookUser.picture && temp.facebookUser.picture.data && !temp.facebookUser.picture.data.is_silhouette) {
				temp.hasPicture = true;
			}
			deferred.resolve(temp.facebookUser);
			console.log('Successful login for: ' + response.name);
		});
		return deferred.promise;
	}
}])
.service('familysearchService', ['$q','$cookies', '$interval', function($q, $cookies, $interval) {
	this.fsUser = null;
	
	this.people = {};
	this.portraitPeople = {};
	this.usedPeople = {};
	this.backgroundQueue = [];
	
	this.fs = new FamilySearch({
	  //environment: 'production',
	  environment: 'sandbox',
	  appKey: 'a02j000000JERmSAAX',
	  redirectUri: 'http://www.genquizitive.com/fs-login.html',
	  saveAccessToken: true,
	  tokenCookie: 'FS_AUTH_TOKEN',
	  maxThrottledRetries: 10
	});
	
	this.fsLoginStatus = function() {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/current-person', function(response){
			if (response.statusCode==200) {
				temp.fsUser = response.data.persons[0];
				temp.people[temp.fsUser.id] = temp.fsUser;
				temp.usedPeople[temp.fsUser.id] = true;
				temp.getAncestorTree(temp.fsUser.id);
				temp.getPersonPortrait(temp.fsUser.id);
				temp.startBackgroundQueue();
				deferred.resolve(temp.fsUser);
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.fsLogin = function() {
		this.loginWin = window.open('fs-login.html', 'fs', 'width=600,height=500');
	};
	
	this.fsLoginComplete = function(response) {
		var token = $cookies.get(this.fs.tokenCookie);
		this.fs.setAccessToken(token);
		this.startBackgroundQueue();
		this.loginWin.close();
	};
	
	this.startBackgroundQueue = function() {
		if (this.interval) {
			$interval.cancel(this.interval);
		}
		var temp = this;
		this.interval = $interval(function() {
			if (temp.backgroundQueue.length > 0) {
				var func = temp.backgroundQueue.shift();
				func();
			}
		}, 1000);
	};
	
	this.stopBackgroundQueue = function() {
		if (this.interval) {
			$interval.cancel(this.interval);
		}
		this.interval = null;
	};
	
	this.getAncestorTree = function(personId, noCache) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/ancestry?person='+personId+'&generations=6&personDetails=', function(response) {
			if (!noCache) {
				for(var p=0; p < response.data.persons.length; p++) {
					var person = response.data.persons[p];
					temp.people[person.id] = person;
					temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
				}
			}
			deferred.resolve(response.data);
		});
		return deferred.promise;
	};
	
	this.getPersonPortrait = function(personId) {
		var deferred = $q.defer();
		if (this.people[personId] && this.people[personId].portrait) {
			deferred.resolve(this.people[personId].portrait);
		}
		
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/portrait', function(response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				if (temp.people[personId]) {
					temp.people[personId].portrait = response.getHeader('Content-Location');
				}
				temp.portraitPeople[personId] = true;
				deferred.resolve(response.getHeader('Content-Location'));
			} else {
				deferred.reject(response.data);
			}
		});
		
		return deferred.promise;
	};
	
	this.getRandomPersonWithPortrait = function() {
		var deferred = $q.defer();
		if (Object.keys(this.portraitPeople).length > 0) {
			var count = 0;
			var person = null;
			while(count < 5 && person == null) {
				var keys = Object.keys(this.portraitPeople);
				var rand = Math.floor(Math.random() * keys.length);
				var randomId = keys[rand];
				if (!this.usedPeople[randomId]) {
					person = randomId;
				}
				count++;
			}
			if (person != null) {
				deferred.resolve(this.people[person]);
				return deferred.promise;
			}
		}
		if (Object.keys(this.people).length > 0) {
			var count = 0;
			var person = null;
			while(count < 5 && person == null) {
				var keys = Object.keys(this.people);
				var rand = Math.floor(Math.random() * keys.length);
				var randomId = keys[rand];
				if (!this.usedPeople[randomId]) {
					person = randomId;
				}
				count++;
			}
			if (person != null) {
				var temp = this;
				this.getPersonPortrait(person).then(function() {
						deferred.resolve(temp.people[person]);
					}, function(error) {
						deferred.reject('No portrait for '+person);
					});
			} else {
				deferred.reject('No people available');
			}
		} else {
			deferred.reject('No people loaded');
		}
			
		return deferred.promise;
	};
	
	this.getRandomPerson = function() {
		var deferred = $q.defer();
		if (this.people.length > 0) {
			var count = 0;
			var person = null;
			while(count < 5 && person == null) {
				var keys = Object.keys(this.people);
				var rand = Math.floor(Math.random() * keys.length);
				var randomId = keys[rand];
				if (!usedPeople[randomId]) {
					person = randomId;
				}
			}
			if (person != null) {
				deferred.resolve(this.people[person]);
			} else {
				deferred.reject ('No people available')
			}
		} else {
			deferred.reject('No people loaded');
		}
		return deferred.promise;
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
			$scope.numberElement = $('<div style="position: absolute;top: 40px;left: 150px;width: 100px;height: 110px;"></div>');
			$element.append($scope.numberElement);
			$scope.number = 4;
			if (!$scope.delayStart) {
				$scope.delayStart = 1000;
			}
			$scope.timeout = $timeout(function() {
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
			}, $scope.delayStart);
			
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
			src: '='
		},
		template: '<img src="{{src}}" />',
		replace: false,
		link: function($scope, $element, $attr) {
			if (!$scope.src && facebookService.facebookUser) {
				$scope.src = facebookService.facebookUser.picture.data.url;
			}
		}
	}
}])
.directive('answerButton', [function() {
	return {
		scope: {
			label: '=',
			background: '@'
		},
		template: '<div class="answer-button" style="background-image: url(\'{{background}}\');">{{label}}</div>'
	}
}])
.controller('getstarted', function($scope, familysearchService, facebookService, $location, $timeout, notificationService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	$scope.fsLoggedIn = false;
	$scope.fsUserName = "";
	$scope.fbLoggedIn = false;
	$scope.fbUserName = "";
	$scope.$on('fsLoginComplete', function(event, data) {
		familysearchService.fsLoginComplete(data);
		$timeout(function() {
			familysearchService.fsLoginStatus().then(function(fsUser) {
				$scope.fsLoggedIn = true;
				$scope.fsUserName = fsUser.display.name;
				$scope.checkLogin();
			}, function(error) {
				var notif = notificationService.showNotification({title: 'FamilySearch Error',message: 'Unable to authenticate with FamilySearch.', closable: true});
				notif.show();
			});
		}, 500);
	});
	
	$scope.checkLogin = function() {
		if (facebookService.facebookUser && familysearchService.fsUser) {
			$location.path('/menu');
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
			$scope.fbUserName = fbUser.name;
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		});
	}
	
	familysearchService.fsLoginStatus().then(function(fsUser){
		$scope.fsLoggedIn = true;
		$scope.fsUserName = fsUser.display.name;
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbUserName = fbUser.name;
			$scope.fbLoggedIn = true;
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		}, function(error) {
			var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
			notif.show();
		});
	}, function() {
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbLoggedIn = true;
			$scope.fbUserName = fbUser.name;
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		}, function(error) {
			var notif = notificationService.showNotification({title: 'Facebook Error',message: error+' Please check your network connection and try again.', closable: true});
			notif.show();
		});
	});
})
.controller('menuController', function($scope, $uibModal) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	$scope.menuItems = [
		{route: '/practice', title: 'Practice Round', button: 'left'},
		{route: '/challenge', title: 'Challenge a Friend', button: 'right'}
	];
})
.controller('practiceController', function($scope, notificationService, QuestionService, familysearchService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	var notif = notificationService.showNotification({title: 'Practice Round', message: 'Answer the questions as quickly as you can.'});
	notif.show();
	
	$scope.startRound = function() {
		notif.close();
		/*
		var question = QuestionService.getRandomQuestion();
		familysearchService.getRandomPersonWithPortrait().then(function(person) {
			$scope.person = person;
		});
		*/
	}
})
.controller('testQuestionController', function($scope, notificationService, QuestionService, familysearchService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	$scope.questions = QuestionService.questions;
	$scope.question = $scope.questions[0];
	
	familysearchService.fsLoginStatus().then(function() {
		familysearchService.usedPeople = {};
		familysearchService.getRandomPersonWithPortrait().then(function(person) {
			$scope.person = person;
			$scope.question.person = person;
		}, function(error){
			console.log(error);
		});
	});
	
	$scope.$watch('question', function(newval, oldval) {
		if (newval != oldval) {
			if (oldval) oldval.person = null;
			if (newval) newval.person = $scope.person;
		}
	});
})
;