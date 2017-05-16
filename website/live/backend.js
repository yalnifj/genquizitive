angular.module('genquiz.live.backend', ['genquizitive-live'])
.service('backendService', ['$q', 'familysearchService', '$http', '$rootScope', function($q, familysearchService, $http, $rootScope) {
	this.authenticated = false;
	this.firebaseUser = null;
	this.currentGenQuiz = null;
	this.playerWatch = null;
	this.currentPlayers = null;
	this.currentPlayer = null;
	this.currentQuestion = null;

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
					temp.authenticated = true;
					temp.firebaseUser = firebaseUser;
					deferred.resolve(firebaseUser);
				} else {
					temp.authenticated = false;
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

	this.writeGenQuiz = function(genQuiz) {
		genQuiz.lastModified = (new Date()).getTime();
		firebase.database().ref('/genquiz/' + genQuiz.id).set(genQuiz);
	};

	this.removeGenQuiz = function(genQuiz) {
		firebase.database().ref('/genquiz/' + genQuiz.id).remove();
		firebase.database().ref('/players/' + genQuiz.id).remove();
		firebase.database().ref('/questions/' + genQuiz.id).remove();
	};

	this.updateQuestionNum = function(genQuiz) {
		firebase.database().ref('/genquiz/' + genQuiz.id+'/currentQuestionNum').set(genQuiz.currentQuestionNum);
	};

	this.watchPlayers = function() {
		if (this.currentGenQuiz) {
			this.currentPlayers = {};
			this.playerWatch = firebase.database().ref('/players/'+this.currentGenQuiz.id);
			this.playerWatch.on('child_added', function(data) {
				this.currentPlayers[data.key] = data.val();
				$rootScope.$broadcast('playersChanged', this.currentPlayers);
			});
			this.playerWatch.on('child_removed', function(data) {
				delete(this.currentPlayers[data.key]);
				$rootScope.$broadcast('playersChanged', this.currentPlayers);
			});
		}
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
		firebase.database().ref('/players/'+this.currentGenQuiz.id + '/' + player.id).remove();
	};

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
		this.questionRef = firebase.database().ref('/questions/'+genQuizId);
		this.questionRef.on('child_added', function(data) {
			$rootScope.$broadcast('questionAdded', data.val());
		});
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
		this.playerScoreRef = firebase.database().ref('/questions/'+genQuizId+'/'+questionId+'/players');
		this.playerScoreRef.on('value', function(snapshot) {
			var playerScores = snapshot.val();
			if (playerScores) {
				$rootScope.$broadcast('playerScores', playerScores);
			}
		});
	};

	this.unWatchPlayerScores = function() {
		if (this.playerScoreRef) {
			this.playerScoreRef.off();
		}
		this.playerScoreRef = null;
	};
}])
;