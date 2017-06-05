angular.module('genquiz.live.backend', ['ngCookies','genquizitive-live'])
.service('backendService', ['$q', 'familysearchService', '$http', '$rootScope', '$cookies', 
		function($q, familysearchService, $http, $rootScope, $cookies) {
	this.authenticated = false;
	this.firebaseUser = null;
	this.currentGenQuiz = null;
	this.playerWatch = null;
	this.currentPlayers = null;
	this.currentPlayer = null;
	this.currentQuestion = null;
	this.ownerId = null;

	this.authenticate = function() {
		var deferred = $q.defer();
		if (this.firebaseUser) {
			deferred.resolve(this.firebaseUser);
			return deferred.promise;
		}
		if (familysearchService.currentUser != null) {
			var temp = this;

			this.ownerId = this.getOwnerId();
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
				data: {token: familysearchService.fs.getAccessToken(), uid: this.ownerId}
			}).then(function (response) {
				if (response && response.data && response.data.indexOf('token=')==0) {
					var token = response.data.substr(6);
					firebase.auth().signInWithCustomToken(token).catch(function(error) {
						// Handle Errors here.
						var errorCode = error.code;
						var errorMessage = error.message;
						deferred.reject(errorMessage);
					});
					var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
						if (firebaseUser) {
							unsubscribe();
							temp.authenticated = true;
							temp.firebaseUser = firebaseUser;
							deferred.resolve(firebaseUser);
						} else {
							temp.authenticated = false;
							//deferred.reject("unable to auth with firebase");
						}
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

	this.checkId = function(genQuizId) {
		var deferred = $q.defer();
		firebase.database().ref('/genquiz/' + genQuizId).once('value').then(function(snapshot) {
			if (snapshot && snapshot.val()) {
				deferred.resolve(true);
				return;
			}
			deferred.resolve(false);
		});
		return deferred.promise;
	};

	this.getOwnerId = function() {
		var ownerId = familysearchService.currentUser.id.replace(/\./g, "");
		return ownerId;
	};

	this.getGenQuizById = function(genQuizId) {
		var deferred = $q.defer();
		firebase.database().ref('/genquiz/' + genQuizId).once('value').then(function(snapshot) {
			if (snapshot && snapshot.val()) {
				deferred.resolve(snapshot.val());
				return;
			}
			deferred.reject("GenQuiz "+genQuizId+" not found.");
		});
		return deferred.promise;
	};

	this.getOwnerGenQuiz = function() {
		var deferred = $q.defer();
		var backendService = this;
		firebase.database().ref('/ownerGames/'+this.ownerId).once('value').then(function(snapshot) {
			if (snapshot && snapshot.val()) {
				var genQuizId = snapshot.val();
				backendService.getGenQuizById(genQuizId).then(function(genQuiz) {
					deferred.resolve(genQuiz);
				}, function(error) {
					backendService.removeGenQuiz(genQuizId);
					deferred.reject(error);
				})
				return;
			}
			deferred.reject("GenQuiz "+genQuizId+" not found.");
		});
		return deferred.promise;
	};

	this.writeGenQuiz = function(genQuiz) {
		genQuiz.lastModified = (new Date()).getTime();
		firebase.database().ref('/genquiz/' + genQuiz.id).set(genQuiz);
		firebase.database().ref('/ownerGames/'+this.ownerId).set(genQuiz.id);
	};

	this.removeGenQuiz = function(genQuiz) {
		firebase.database().ref('/genquiz/' + genQuiz.id).remove();
		firebase.database().ref('/players/' + genQuiz.id).remove();
		firebase.database().ref('/questions/' + genQuiz.id).remove();
		firebase.database().ref('/ownerGames/'+this.ownerId).remove();
	};

	this.updateQuestionNum = function(genQuiz) {
		firebase.database().ref('/genquiz/' + genQuiz.id+'/currentQuestionNum').set(genQuiz.currentQuestionNum);
	};

	this.watchPlayers = function() {
		var deferred = $q.defer();
		if (this.currentGenQuiz) {
			this.currentPlayers = {};
			var backendService = this;
			if (!this.playerWatch) {
				this.playerWatch = firebase.database().ref('/players/'+this.currentGenQuiz.id);
				this.playerWatch.once('value').then(function(snapshot) {
					if (snapshot) {
						backendService.currentPlayers = snapshot.val();
						deferred.resolve(backendService.currentPlayers);
					}
				});
				this.playerWatch.on('child_added', function(data) {
					backendService.currentPlayers[data.key] = data.val();
					$rootScope.$apply(function() {
						$rootScope.$broadcast('playersChanged', backendService.currentPlayers);
					});
				});
				this.playerWatch.on('child_removed', function(data) {
					delete(backendService.currentPlayers[data.key]);
					$rootScope.$apply(function() {
						$rootScope.$broadcast('playersChanged', backendService.currentPlayers);
					});
				});
			}
		}
		return deferred.promise;
	};

	this.unWatchPlayers = function() {
		if (this.playerWatch) {
			this.playerWatch.off();
		}
		this.playerWatch = null;
	};

	this.addPlayer = function(player) {
		var newPlayerRef = firebase.database().ref('/players/'+this.currentGenQuiz.id).push();
		player.id = newPlayerRef.key;
		newPlayerRef.set(player);
	};

	this.removePlayer = function(player) {
		if (this.currentGenQuiz) {
			firebase.database().ref('/players/'+this.currentGenQuiz.id + '/' + player.id).remove();
		}
	};

	this.updatePlayers = function(players) {
		this.currentPlayers = players;
		firebase.database().ref('/players/'+this.currentGenQuiz.id).set(players);
	}

	this.persistQuestion = function(question, genQuizId, num) {
		var newQuestionRef = firebase.database().ref('/questions/'+genQuizId).push();
		question.id = newQuestionRef.key
		newQuestionRef.set(question);

		firebase.database().ref('/genquiz/'+genQuizId+'/currentQuestionId').set(question.id);
		firebase.database().ref('/genquiz/'+genQuizId+'/currentQuestionNum').set(num);
	};

	this.getQuestionById = function(questionId, genQuizId) {
		var deferred = $q.defer();
		firebase.database().ref('/questions/'+genQuizId+'/'+questionId).once('value').then(function(snapshot) {
			deferred.resolve(snapshot.val());
		})
		return deferred.promise;
	};

	this.watchForQuestion = function(genQuizId) {
		if (!this.questionRef) {
			this.questionRef = firebase.database().ref('/questions/'+genQuizId);
			this.questionRef.on('child_added', function(data) {
				$rootScope.$apply(function() {
					$rootScope.$broadcast('questionAdded', data.val());
				});
			});
		}
	};

	this.unWatchQuestion = function() {
		if (this.questionRef) {
			this.questionRef.off();
		}
		this.questionRef = null;
	};

	this.savePlayerQuestionScore = function(playerId, questionId, genQuizId, score) {
		firebase.database().ref('/questions/'+genQuizId+'/'+questionId+'/players/'+playerId).set(score);
	};

	this.watchPlayerScores = function(questionId, genQuizId) {
		if (!this.playerScoreRef) {
			this.playerScoreRef = firebase.database().ref('/questions/'+genQuizId+'/'+questionId+'/players');
			this.playerScoreRef.on('value', function(snapshot) {
				var playerScores = snapshot.val();
				if (playerScores) {
					$rootScope.$apply(function() {
						$rootScope.$broadcast('playerScores', playerScores);
					});
				}
			});
		}
	};

	this.unWatchPlayerScores = function() {
		if (this.playerScoreRef) {
			this.playerScoreRef.off();
		}
		this.playerScoreRef = null;
	};
}])
;