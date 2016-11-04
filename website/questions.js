angular.module('genquiz.questions', ['genquizitive', 'ui.bootstrap'])
.service ('QuestionService', ['familysearchService', 'languageService', '$http', '$sce', '$q', '$templateCache', function(familysearchService, languageService, $http, $sce, $q, $templateCache) {
	this.questions = [
		{
			name: 'photo1', 
			background: 'questions/photo1/background.jpg',
			difficulty: 1,
			error: null,
			setup: function() {
				var question = this;
				familysearchService.getRandomPersonWithPortrait().then(function(person) {
					question.person = person;
					
					familysearchService.getRandomPeopleNear(person, 3).then(function(people) {
						question.randomPeople = people;

					}, function(error) {
						console.log(error);
						question.error = error;
					});
				}, function(error){
					console.log(error);
					question.error = error;
				});
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			}
		},
		{
			name: 'multi1', 
			background: 'questions/multi1/background.jpg',
			difficulty: 2,
			error: null,
			setup: function() {
				var question = this;
				question.person = familysearchService.getRandomPerson();
					
				familysearchService.getRandomPeopleNear(question.person, 3).then(function(people) {
					question.randomPeople = people;
					
					question.questionText = 'Who is your great grand father?';

				}, function(error) {
					console.log(error);
					question.error = error;
				});
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			}
		},
		{
			name: 'multi2',
			background: 'questions/multi2/background.jpg',
			difficulty: 2,
			error: null,
			setup: function() {
				var question = this;
				question.person = familysearchService.getRandomPerson();
				familysearchService.getRandomPeopleNear(question.person, 3).then(function(people) {
					question.randomPeople = people;
					var found = false;
						var count = 0;
						while(!found && count < 10) {
							var r = Math.floor(Math.random() * question.person.facts.length);
							question.fact = question.person.facts[r];
							if (languageService.facts[question.fact.type]) {
								found = true;
								//-- check for a matching fact
								for(var p=0; p<question.randomPeople.length; p++) {
									if (question.randomPeople[p].facts) {
										for(var f=0; f<question.randomPeople[p].facts.length; f++) {
											var ofact = question.randomPeople[p].facts[f];
											if (ofact.type==question.fact.type) {
												var yearMatch = false;
												var placeMatch = false;
												if (!ofact.date && !question.fact.date) {
													yearMatch = true;
												} else if (ofact.date && question.fact.date) {
													if (languageService.getDateYear(ofact.date.original)==languageService.getDateYear(question.fact.date.original)) {
														yearMatch = true;
													}
												}
												if (yearMatch) {
													if (!ofact.place && !question.fact.place) {
														placeMatch = true;
													} else if (ofact.place && question.fact.place) {
														if (ofact.place.original == question.fact.place.original) {
															placeMatch = true;
														}
													}
												}
												if (yearMatch && placeMatch) {
													found = false;
													break;
												}
											}
										}
									}
									if (!found) break;
								}
								count++;
							}
						}

						if (question.fact) {
							var factLang = languageService.facts[question.fact.type];
							question.questionText = "Who "+factLang.pastVerb;
							if (factLang.expectValue && question.fact.value) {
								question.questionText += " "+question.fact.value;
							}
							if (question.fact.place && question.fact.place.original) {
								question.questionText += " in "+question.fact.place.original;
							}
							if (question.fact.date && question.fact.date.original) {
								question.questionText += " on "+question.fact.date.original;
							}
							question.questionText += "?";
						}
				}, function(error) {
					console.log(error);
					question.error = error;
				});
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			}
		}
	];
	
	/**
	 * load a template and return a promise
	 * uses the $templateCache to locally cache loaded templates
	 */
	this.getDeferredTemplate = function(templateUrl) {
		var deferred = $q.defer();

    	var url = $sce.getTrustedResourceUrl(templateUrl);
	    $http.get(url, {cache: $templateCache})
	        .success(function(response){
	          deferred.resolve(response);
	        })
	        .error(function(){
	          deferred.reject('could not load template');
	        });

	    return deferred.promise;
	};
	
	this.getRandomQuestion = function () {
		var q = Msth.floor (Math.random () * this.questions.length);
		return this.questions[q];
	};
	
	this.shuffleArray = function(array) {
		for (var i=0; i<array.length-1; i++) {
			var r = i + Math.floor(Math.random() * (array.length - i));
			var t = array[i];
			array[i] = array[r];
			array[r] = t;
		}
		return array;
	};
}])
.directive('question', ['QuestionService', '$compile', function (QuestionService, $compile) {
	return {
		scope: {
			question: '='
		},
		restrict: 'A',
		link ($scope, $element, $attr) {
			$scope.loadQuestion = function () {
				$scope.$emit('changeBackground', $scope.question.background);
				
				var templateUrl = 'questions/'+$scope.question.name+'/question.html';
				QuestionService.getDeferredTemplate(templateUrl).then(function(template) {
					if (template) {
						var $t = $(template);
						var qel = $compile($t)($scope);
						$element.empty();
						$element.append(qel);
					}
				});
			}
			$scope.loadQuestion();
			
			$scope.$watch('question', function (newval, oldval) {
				if (newval && newval!=oldval) {
					$scope.loadQuestion();
				}
			});
		}
	}
}])
.controller('photo1Controller', function($scope, familysearchService, QuestionService) {
	
	$scope.questionText = 'Who is shown in this picture?';
	
	$scope.answerPeople = [];
	
	$scope.$watchCollection('question.randomPeople', function() {
		if ($scope.question.randomPeople && $scope.question.randomPeople.length > 0) {
			$scope.answerPeople = [];
			$scope.answerPeople.push($scope.question.person);
			for(var p=0; p<$scope.question.randomPeople.length; p++) {
				$scope.answerPeople.push($scope.question.randomPeople[p]);
			}
			$scope.answerPeople = QuestionService.shuffleArray($scope.answerPeople);
		}
	});
	
	$scope.guess1 = function() {
		console.log("guess 1 clicked");
		if ($scope.answerPeople.length < 1) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[0])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
	
	$scope.guess2 = function() {
		console.log("guess 2 clicked");
		if ($scope.answerPeople.length < 2) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[1])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
	
	$scope.guess3 = function() {
		console.log("guess 3 clicked");
		if ($scope.answerPeople.length < 3) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[2])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
	
	$scope.guess4 = function() {
		console.log("guess 4 clicked");
		if ($scope.answerPeople.length < 4) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[3])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
})
.controller('multi2Controller', function($scope, familysearchService, QuestionService) {
	
	$scope.questionText = '';
	
	$scope.$watch('question.person', function(newval, oldval) {
		if (newval && newval!=oldval) {
			if ($scope.question && $scope.question.person) {
				$scope.picture = $scope.question.person.portrait;
			}
		}
	});
	
	$scope.answerPeople = [];
	
	$scope.$watchCollection('question.randomPeople', function() {
		if ($scope.question.randomPeople && $scope.question.randomPeople.length > 0) {
			$scope.answerPeople = [];
			$scope.answerPeople.push($scope.question.person);
			for(var p=0; p<$scope.question.randomPeople.length; p++) {
				$scope.answerPeople.push($scope.question.randomPeople[p]);
			}
			$scope.answerPeople = QuestionService.shuffleArray($scope.answerPeople);

			$scope.questionText = $scope.question.questionText;
		}
	});
	
	$scope.guess1 = function() {
		console.log("guess 1 clicked");
		if ($scope.answerPeople.length < 1) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[0])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
	
	$scope.guess2 = function() {
		console.log("guess 2 clicked");
		if ($scope.answerPeople.length < 2) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[1])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
	
	$scope.guess3 = function() {
		console.log("guess 3 clicked");
		if ($scope.answerPeople.length < 3) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[2])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
	
	$scope.guess4 = function() {
		console.log("guess 4 clicked");
		if ($scope.answerPeople.length < 4) {
			console.log("Incorrect!");
			return;
		}
		if ($scope.question.checkAnswer($scope.answerPeople[3])) {
			console.log("Correct!");	
		} else {
			console.log("Incorrect!");	
		}
	};
})
;