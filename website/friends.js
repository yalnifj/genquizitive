angular.module('genquiz.friends', ['genquizitive'])
.service('firebaseService', ['$q', 'facebookService', function($q, facebookService) {
	this.authenticated = false;
	
	this.authenticate = function() {
		var deferred = $q.defer();
		if (facebookService.facebookUser!=null) {
			var temp = this;
			var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
				unsubscribe();
				// Check if we are already signed-in Firebase with the correct user.
				if (!temp.isUserEqual(facebookService.facebookUser, firebaseUser)) {
					// Build Firebase credential with the Facebook auth token.
					var credential = firebase.auth.FacebookAuthProvider.credential(
						facebookService.accessToken);
					// Sign in with the credential from the Facebook user.
					firebase.auth().signInWithCredential(credential).then(function(value) {
						this.authenticated = true;
						deferred.resolve(value);
					}, function(error) {
						this.authenticated = false;
					  // Handle Errors here.
					  var errorCode = error.code;
					  var errorMessage = error.message;
					  // The email of the user's account used.
					  var email = error.email;
					  // The firebase.auth.AuthCredential type that was used.
					  var credential = error.credential;
					  deferred.reject(errorMessage);
					});
				} else {
					this.authenticated = true
					// User is already signed-in Firebase with the correct user.
					deferred.resolve(firebaseUser);
				}
			});
		} else {
			firebase.auth().signOut();
			this.authenticated = false;
			deferred.reject("not authenticated with facebook");
		}
		return deferred.promise;
	};
	
	this.isUserEqual = function(facebookUser, firebaseUser) {
	  if (firebaseUser && facebookUser) {
		var providerData = firebaseUser.providerData;
		for (var i = 0; i < providerData.length; i++) {
		  if (providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
			  providerData[i].uid === facebookUser.userID) {
			  return true;
		  }
		}
	  }
	  return false;
	};
	
	this.getUser = function(userId) {
		var deferred = $q.defer();
		//var userId = firebase.auth().currentUser.uid;
		firebase.database().ref('/users/' + userId).once('value').then(function(snapshot) {
		  deferred.resolve(snapshot.val());
		});
		return deferred.promise;
	};
	
	this.createUserFromFacebookUser = function(facebookUser, hasFamilyTree) {
		var user = {
			userId: facebookUser.id,
			authType: 'facebook',
			practiceRounds: 0,
			challengeRounds: 0,
			practiceHighScore: 0,
			challengeHighScore: 0,
			hasFamilyTree: hasFamilyTree
		};
		this.writeUser(user);
		return user;
	};
	
	this.writeUser = function(user) {
		firebase.database().ref('users/' + user.userId).set(user);
	};
	
	this.getUserProperty = function(userId, property) {
		var deferred = $q.defer();
		firebase.database().ref('users/' + user.userId+"/"+property).once('value').then(function(snapshot) {
			if (!snapshot) deferred.resolve(null);
			else deferred.resolve(snapshot.val());
		});
		return deferred.promise;
	};
	
	this.writeUserProperty = function(userId, property, value) {
		firebase.database().ref('users/' + userId+"/"+property).set(value);
	};
	
	this.writeRound = function(round) {
		var deferred = $q.defer();
		var ref = firebase.database().ref('rounds').push();
		ref.once('value', function(snapshot) {
			round.id = snapshot.key();
			ref.set(round);
			deferred.resolve(round);
		});
		return deferred.promise;
	};
	
	this.getUserRounds = function(userId) {
		var deferred = $q.defer();
		firebase.database().ref('rounds').orderByChild("to").equalTo(userId).once('value').then(function(snapshot) {
			deferred.resolve(spanshot.val());
		});
		return deferred.promise;
	};
}])
.service('facebookService', ['$q', function($q) {
	this.facebookUser = null;
	this.hasPicture = false;
	this.accessToken = null;
	
	this.fbLoginStatus = function() {
		var deferred = $q.defer();
		var temp = this;
		if (!window.FB) {
			deferred.reject("Could not communicate with Facebook");
		} else {
			FB.getLoginStatus(function(response) {
				console.log(response.status);
				if (response.status === 'connected') {
					temp.accessToken = response.authResponse.accessToken;
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
					temp.accessToken = response.authResponse.accessToken;
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
	};
	
	this.getGenquizitiveFriends = function() {
		var deferred = $q.defer();
		var temp = this;
		FB.api('/me/friends', {fields: "id,picture,first_name,last_name"}, function(response) {
			deferred.resolve(response);
		});
		return deferred.promise;
	};
}])
;