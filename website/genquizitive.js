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
.service('languageService', [function() {
	this.facts = {
		'http://gedcomx.org/Adoption':{ pastVerb: 'was adopted' },
		'http://gedcomx.org/AdultChristening':{ pastVerb: 'was christened as an adult' },
		'http://gedcomx.org/Amnesty':{ pastVerb: 'was given amnesty' },
		'http://gedcomx.org/Apprenticeship':{ pastVerb: 'served an apprenticeship' },
		'http://gedcomx.org/Arrest':{ pastVerb: 'was arrested' },
		'http://gedcomx.org/Baptism':{ pastVerb: 'was baptized' },
		'http://gedcomx.org/BarMitzvah':{ pastVerb: 'had a Bar Mitzvah' },
		'http://gedcomx.org/BatMitzvah':{ pastVerb: 'had a Bat Mitzvah' },
		'http://gedcomx.org/Birth':{ pastVerb: 'was born' },
		'http://gedcomx.org/Blessing':{ pastVerb: 'was blessed' },
		'http://gedcomx.org/Burial':{ pastVerb: 'was buried' },
		//'http://gedcomx.org/Caste':{ pastVerb: '' },
		'http://gedcomx.org/Census':{ pastVerb: 'was recorded in a census' },
		'http://gedcomx.org/Christening':{ pastVerb: 'was christened' },
		'http://gedcomx.org/Circumcision':{ pastVerb: 'was circumcized' },
		//'http://gedcomx.org/Clan':{ pastVerb: '' },
		'http://gedcomx.org/Confirmation':{ pastVerb: 'had a confirmation' },
		'http://gedcomx.org/Cremation':{ pastVerb: 'was cremated' },
		'http://gedcomx.org/Court':{ pastVerb: 'appeared in court' },
		'http://gedcomx.org/Death':{ pastVerb: 'died' },
		'http://gedcomx.org/Education':{ pastVerb: 'was educated' },
		'http://gedcomx.org/EducationEnrollment':{ pastVerb: 'enrolled in an education' },
		'http://gedcomx.org/Emigration':{ pastVerb: 'emigrated' },
		//'http://gedcomx.org/Ethnicity':{ pastVerb: '' },
		'http://gedcomx.org/Excommunication':{ pastVerb: 'was excommunicated' },
		'http://gedcomx.org/FirstCommunion':{ pastVerb: 'had first communion' },
		'http://gedcomx.org/Funeral':{ pastVerb: 'had a funeral' },
		'http://gedcomx.org/GenderChange':{ pastVerb: 'changed genders' },
		'http://gedcomx.org/Graduation':{ pastVerb: 'graduated' },
		'http://gedcomx.org/Immigration':{ pastVerb: 'immigrated' },
		'http://gedcomx.org/Imprisonment':{ pastVerb: 'was imprisoned' },
		//'http://gedcomx.org/Inquest':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/LandTransaction':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/Language':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/Living':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/MaritalStatus':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/Medical':{ pastVerb: 'adopted' },
		'http://gedcomx.org/MilitaryAward':{ pastVerb: 'received a military award' },
		'http://gedcomx.org/MilitaryDischarge':{ pastVerb: 'was discharged from the military' },
		'http://gedcomx.org/MilitaryDraftRegistration':{ pastVerb: 'was drafted into the military' },
		//'http://gedcomx.org/MilitaryInduction':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/MilitaryService':{ pastVerb: 'adopted' },
		'http://gedcomx.org/Mission':{ pastVerb: 'served a mission' },
		'http://gedcomx.org/MoveFrom':{ pastVerb: 'moved from' },
		'http://gedcomx.org/MoveTo':{ pastVerb: 'moved to' },
		//'http://gedcomx.org/MultipleBirth':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/NationalId':{ pastVerb: 'adopted' },
		//'http://gedcomx.org/Nationality':{ pastVerb: 'adopted' },
		'http://gedcomx.org/Naturalization':{ pastVerb: 'was naturalized' },
		//'http://gedcomx.org/NumberOfMarriages':{ pastVerb: 'adopted' },
		'http://gedcomx.org/Obituary':{ pastVerb: 'appeared in an obituary' },
		'http://gedcomx.org/Occupation':{ pastVerb: 'worked as', expectValue: true },
		'http://gedcomx.org/Ordination':{ pastVerb: 'was ordained' },
		'http://gedcomx.org/Pardon':{ pastVerb: 'was pardoned' },
		//'http://gedcomx.org/PhysicalDescription':{ pastVerb: '' },
		//'http://gedcomx.org/Probate':{ pastVerb: '' },
		//'http://gedcomx.org/Property':{ pastVerb: '' },
		'http://gedcomx.org/Religion':{ pastVerb: 'was a', expectValue: true },
		'http://gedcomx.org/Residence':{ pastVerb: 'resided' },
		'http://gedcomx.org/Retirement':{ pastVerb: 'retired' },
		//'http://gedcomx.org/Stillbirth':{ pastVerb: '' },
		//'http://gedcomx.org/TaxAssessment':{ pastVerb: '' },
		//'http://gedcomx.org/Will':{ pastVerb: '' },
		//'http://gedcomx.org/Visit':{ pastVerb: '' },
		//'http://gedcomx.org/Yahrzeit':{ pastVerb: '' },
		//'http://gedcomx.org/Annulment':{ pastVerb: '' },
		//'http://gedcomx.org/CommonLawMarriage':{ pastVerb: '' },
		'http://gedcomx.org/CivilUnion':{ pastVerb: 'entered a civil union', family: true },
		'http://gedcomx.org/Divorce':{ pastVerb: 'was divorced', family: true },
		//'http://gedcomx.org/DivorceFiling':{ pastVerb: '' },
		'http://gedcomx.org/DomesticPartnership':{ pastVerb: 'was in a domestic partnership', family: true },
		'http://gedcomx.org/Engagement':{ pastVerb: 'was engaged', family: true },
		'http://gedcomx.org/Marriage':{ pastVerb: 'was married', family: true },
		//'http://gedcomx.org/MarriageBanns':{ pastVerb: '' },
		//'http://gedcomx.org/MarriageContract':{ pastVerb: '' },
		//'http://gedcomx.org/MarriageLicense':{ pastVerb: '' },
		//'http://gedcomx.org/MarriageNotice':{ pastVerb: '' },
		//'http://gedcomx.org/NumberOfChildren':{ pastVerb: '' },
		'http://gedcomx.org/Separation':{ pastVerb: 'was separated', family: true }
	};
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
			}, {scope: 'public_profile,email,user_friends'});
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
			console.log('Successful facebook login for: ' + response.name);
		});
		return deferred.promise;
	}
}])
.service('familysearchService', ['$q','$cookies', '$interval', '$http', '$sce', function($q, $cookies, $interval, $http, $sce) {
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
				var token = $cookies.get(temp.fs.tokenCookie);
				$.post('/fs-proxy.php', {'FS_AUTH_TOKEN': token});
				deferred.resolve(temp.fsUser);
			} else if (response.statusCode==401) {
				//-- delete any old cookies
				document.cookie = 'FS_AUTH_TOKEN=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
				temp.fs.setAccessToken('');
				deferred.reject(response.body);
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.fsLogin = function() {
		this.fs.oauthRedirect();
	};
	
	this.fsLoginComplete = function(response) {
		var token = $cookies.get(this.fs.tokenCookie);
		this.fs.setAccessToken(token);
		$.post('/fs-proxy.php', {'FS_AUTH_TOKEN': token});
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
		}, 1500);
	};
	
	this.stopBackgroundQueue = function() {
		if (this.interval) {
			$interval.cancel(this.interval);
		}
		this.interval = null;
	};
	
	this.ancestorPromises = {};
	this.getAncestorTree = function(personId, noCache) {
		var deferred = $q.defer();
		if (this.ancestorPromises[personId]) {
			this.ancestorPromises[personId].push(deferred);
			return deferred.promise;
		}
		var temp = this;
		this.fs.get('/platform/tree/ancestry?person='+personId+'&generations=6&personDetails=', function(response) {
			if (!noCache) {
				for(var p=0; p < response.data.persons.length; p++) {
					var person = response.data.persons[p];
					temp.people[person.id] = person;
					temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
				}
			}
			for(var p=0; p<temp.ancestorPromises[personId].length; p++) {
				var def = temp.ancestorPromises[personId][p];
				def.resolve(response.data);
			}
			delete(temp.ancestorPromises[personId]);
			//deferred.resolve(response.data);
		});
		this.ancestorPromises[personId] = [];
		this.ancestorPromises[personId].push(deferred);
		return deferred.promise;
	};
	
	this.getPersonById = function(personId) {
		var deferred = $q.defer();
		var temp = this;
		if (personId) {
			this.fs.get('/platform/tree/persons/'+personId, function(response) {
				for(var p=0; p < response.data.persons.length; p++) {
					var person = response.data.persons[p];
					temp.people[person.id] = person;
				}
				deferred.resolve(temp.people[personId]);
			});
		} else {
			deferred.reject('invalid personId '+personId);
		}
		return deferred.promise;
	};

	this.getPeopleById = function(ids) {
		var deferred = $q.defer();
		var temp = this;
		if (ids) {
			this.fs.get('/platform/tree/persons?pids='+id, function(response) {
				var people = [];
				for(var p=0; p < response.data.persons.length; p++) {
					var person = response.data.persons[p];
					temp.people[person.id] = person;
					people.push(person);
				}
				deferred.resolve(people);
			});
		} else {
			deferred.reject('invalid personId '+ids);
		}
		return deferred.promise;
	};
	
	this.getPersonRelatives = function(personId) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/families', function(response) {
			if (response.statusCode!=200) {
				deferred.reject(response);
				return;
			}
			var persons = [];
			var pids = '';
			for(var p=0; p < response.data.persons.length; p++) {
				var pid = response.data.persons[p].id;
				if (temp.people[pid]) {
					persons.push(temp.people[pid]);
				} else {
					if (p>0) pids += ',';
					pids += pid;
				}
			}
			if (pids != '') {
				temp.getPeopleById(pids).then(function(people) {
					for(var p=0; p<people.length; p++) {
						persons.push(people[p]);
					}
					deferred.resolve(persons);
				}, function(error) {
					console.log(error);
					deferred.resolve(persons);
				});
			} else {
				deferred.resolve(persons);
			}
		});
		return deferred.promise;
	};
	
	this.getPersonPortrait = function(personId) {
		var deferred = $q.defer();
		if (this.people[personId] && this.people[personId].portrait) {
			deferred.resolve(this.people[personId].portrait);
		}
		
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/portrait', {headers: {'X-Expect-Override':'200-ok'}}, function(response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				var src = response.effectiveUrl;
				if (temp.people[personId]) {
					temp.people[personId].portrait = src;
				}
				temp.portraitPeople[personId] = true;
				deferred.resolve(src);
			} else {
				deferred.reject(response.body);
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
		var keys = Object.keys(this.people);
		if (keys.length > 0) {
			var count = 0;
			var person = null;
			while(count < 5 && person == null) {
				var rand = Math.floor(Math.random() * keys.length);
				var randomId = keys[rand];
				if (!this.usedPeople[randomId]) {
					person = randomId;
				}
			}
			if (person != null) {
				return this.people[person];
			}
		}
		return null;
	};
	
	this.getRandomPeopleNear = function(person, num) {
		var deferred = $q.defer();
		var persons = [];
		var temp = this;
		this.getPersonRelatives(person.id).then(function(relatives) {
			var personCount = 0;
			var loopCount = 0;
			while(loopCount < num-1) {
				var rand = Math.floor(Math.random() * relatives.length);
				var rPerson = relatives[rand];
				if (rPerson.id != person.id && rPerson.gender.type == person.gender.type && persons.indexOf(rPerson)==-1) {
					persons.push(rPerson);
					personCount++;
				}
				loopCount++;
			}
			
			while(personCount < num && loopCount < num * 4) {
				var rPerson = temp.getRandomPerson();
				if (rPerson && rPerson.id != person.id && rPerson.gender.type == person.gender.type && persons.indexOf(rPerson)==-1) {
					persons.push(rPerson);
					personCount++;
				}
				loopCount++;
			}
			deferred.resolve(persons);
		}, function(error) {
			deferred.reject(error);
		});
		return deferred.promise;
	};
	
	this.shortenName = function(name) {
		var arr = name.split(" ");
		var shortName = arr[0];
		if (arr.length > 1) {
			shortName = shortName + " " + arr[arr.length-1].substr(0,1);
		}
		return shortName;
	};

	this.getDateYear = function(date) {
		var yearPatt = new RegExp("\d\d\d\d");
		var year = yearPatt.exec(date);
		return year;
	};
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
				$scope.fsUserName = familysearchService.shortenName(fsUser.display.name);
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
			$scope.fbUserName = familysearchService.shortenName(fbUser.name);
			$scope.fbHasPicture = facebookService.hasPicture;
			$scope.fbUser = fbUser;
			$scope.checkLogin();
		});
	}
	
	familysearchService.fsLoginStatus().then(function(fsUser){
		$scope.fsLoggedIn = true;
		$scope.fsUserName = fsUser.display.name;
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbUserName = familysearchService.shortenName(fbUser.name);
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
			$scope.fbUserName = familysearchService.shortenName(fbUser.name);
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
		
		var question = QuestionService.getRandomQuestion();
		
		
	}
})
.controller('testQuestionController', function($scope, notificationService, QuestionService, familysearchService) {
	$scope.$emit('changeBackground', 'home_background.jpg');
	
	$scope.questions = QuestionService.questions;
	$scope.question = $scope.questions[0];
	
	familysearchService.fsLoginStatus().then(function(fsUser) {
		familysearchService.usedPeople = {};
		familysearchService.getAncestorTree(fsUser.id).then(function() {
			$scope.question.setup();
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
			$scope.question.setup();
		}
	});
})
;