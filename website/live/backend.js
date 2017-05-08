angular.module('genquiz.live.backend', ['genquizitive-live'])
.service('backendService', ['$q', 'familysearchService', '$http', function($q, familysearchService, $http) {
	this.authenticated = false;
	this.firebaseUser = null;

	this.authenticate = function() {
		var deferred = $q.defer();
		if (this.firebaseUser) {
			deferred.resolve(this.firebaseUser);
			return deferred.promise;
		}
		if (familysearchService.currentUser != null) {
			var temp = this;
			var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
				unsubscribe();
				if (firebaseUser) {
					this.authenticated = true;
					deferred.resolve(firebaseUser);
				} else {
					this.authenticated = false;
					deferred.reject("unable to auth with firebase");
				}
			});

			$http({
				method: 'POST',
				url: "/live/token.php",
				headers: {'Content-Type': 'application/x-www-form-urlencoded'},
				transformRequest: function(obj) {
					var str = [];
					for(var p in obj)
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: {token: familysearchService.fs.getAccessToken(), uid: familysearchService.currentUser.id}
			}).then(function (response) {
				if (response && response.data) {
					var token = response.data;
					firebase.auth().signInWithCustomToken(token).catch(function(error) {
						// Handle Errors here.
						var errorCode = error.code;
						var errorMessage = error.message;
						deferred.reject(errorMessage);
					});
				} else {
					deferred.reject("unable to get firebase token");
				}
			}, function() {
				deferred.reject("unable to get firebase token");
			});
		} else {
			this.authenticated = false;
			deferred.reject("not authenticated with FamilySearch");
		}
		return deferred.promise;
	};
}])
;