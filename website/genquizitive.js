angular.module('genquizitive', ['ngRoute','ui.bootstrap'])
.config(['$locationProvider', '$routeProvider',
    function config($locationProvider, $routeProvider) {
      $routeProvider.
        when('/', {
          templateUrl: 'getting-started.html'
        }).
        when('/menu', {
          templateUrl: 'menu.html'
        }).
        otherwise({ redirectTo: '/' });
    }
])
.service('facebookService', ['$q', function($q) {
	this.facebookUser = null;
	
	this.fbLoginStatus = function() {
		var deferred = $q.defer();
		var temp = this;
		FB.getLoginStatus(function(response) {
			console.log(response.status);
			if (response.status === 'connected') {
				// Logged into your app and Facebook.
				temp.fbGetUser().then(function() {
					deferred.resolve(temp.facebookUser);
				});
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.fbLogin = function() {
		var deferred = $q.defer();
		var temp = this;
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
		return deferred.promise;
	};
	
	this.fbGetUser = function() {
		var deferred = $q.defer();
		var temp = this;
		FB.api('/me', function(response) {
			temp.facebookUser = response;
			deferred.resolve(temp.facebookUser);
			console.log('Successful login for: ' + response.name);
		});
		return deferred.promise;
	}
}])
.service('familysearchService', ['$q', function($q) {
	this.fsUser = null;
	
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
				temp.fsUser = response.body;
				deferred.resolve(temp.fsUser);
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.fsLogin = function() {
		window.open('fs-login.html', 'fs', 'width=600,height=500');
	};
}])
.controller('getstarted', function($scope, familysearchService, facebookService) {
	$scope.fsLoggedIn = false;
	$scope.fsUserName = "";
	$scope.fbLoggedIn = false;
	$scope.fbUserName = "";
	$scope.$on('fsLoginComplete', function() {
		familysearchService.fsLoginStatus().then(function(fsUser) {
			$scope.fsLoggedIn = true;
			$scope.checkLogin();
		});
	});
	
	$scope.checkLogin = function() {
		if (facebookService.facebookUser && familysearchService.fsUser) {
			$location.path('/menu');
		}
	}
	
	$scope.fsLogin = function() {
		familysearchService.fsLogin().then(function(fsUser) {
			$scope.fsLoggedIn = true;
			$scope.fsUserName = fsUser.name;
			$scope.checkLogin();
		});
	}
	
	$scope.fbLogin = function() {
		facebookService.fbLogin().then(function(fbUser) {
			$scope.fbUserName = fbUser.name;
			$scope.fbLoggedIn = true;
			$scope.checkLogin();
		});
	}
	
	familysearchService.fsLoginStatus().then(function(fsUser){
		$scope.fsLoggedIn = true;
		$scope.fsUserName = fsUser.name;
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbUserName = fbUser.name;
			$scope.fbLoggedIn = true;
			$scope.checkLogin();
		});
	}, function() {
		facebookService.fbLoginStatus().then(function(fbUser){
			$scope.fbLoggedIn = true;
			$scope.fbUserName = fbUser.name;
			$scope.checkLogin();
		});
	});
})
.controller('menuController', function($scope, $uibModal) {
	$scope.menuItems = [
		{route: '/practice', title: 'Practice Round', button: 'left'},
		{route: '/challenge', title: 'Challenge a Friend', button: 'right'}
	];
})
;