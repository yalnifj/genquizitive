angular.module('genquiz.questions', ['genquizitive', 'ui.bootstrap'])
.service ('QuestionService', ['familysearchService', 'languageService', 'relationshipService', '$http', '$sce', '$q', '$templateCache', 
		function(familysearchService, languageService, relationshipService, $http, $sce, $q, $templateCache) {
	this.questions = [
		{
			name: 'photo1', 
			background: 'questions/photo1/background.jpg',
			difficulty: 1,
			error: null,
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				this.difficulty = difficulty;
				familysearchService.getRandomPersonWithPortrait(useLiving).then(function(person) {
					question.person = person;
					
					familysearchService.getRandomPeopleNear(person, 3, useLiving).then(function(people) {
						question.randomPeople = people;
						deferred.resolve(question);
					}, function(error) {
						console.log(error);
						question.error = error;
						deferred.reject(question);
					});
				}, function(error){
					console.log(error);
					question.error = error;
					deferred.reject(question);
				});
				return deferred.promise;
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id
					questionText: this.questionText,
					answers: [],
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}});
				}
				return q;
			}
		},
		{
			name: 'multi1', 
			background: 'questions/multi1/background.jpg',
			difficulty: 2,
			error: null,
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				this.difficulty = difficulty;
				question.startPerson = familysearchService.fsUser;
				
				var length = 4 + Math.floor(Math.random()*3)
				relationshipService.getRandomRelationshipPath(question.startPerson.id, length, useLiving).then(function(path) {
					question.path = path;
					
					relationshipService.verbalizePath(familysearchService.fsUser, path).then(function(pathText) {
						question.questionText = 'Who is your ' + pathText + '?';
					});
					
					var lastRel = path[path.length-1];
					question.person = null;
					var lastPersonId = null;
					if (lastRel.person1.resourceId != question.startPerson.id) {
						lastPersonId = lastRel.person1.resourceId;
					} else {
						lastPersonId = lastRel.person2.resourceId;
					}
					familysearchService.getPersonById(lastPersonId).then(function(lastPerson) {
						question.person = lastPerson;
						familysearchService.getRandomPeopleNear(question.person, 3, useLiving).then(function(people) {
							question.randomPeople = people;
							deferred.resolve(question);
						}, function(error) {
							console.log(error);
							question.error = error;
							deferred.reject(question);
						});
					}, function(error){
						console.log(error);
						question.error = error;
						deferred.reject(question);
					});
				}, function(error){
					console.log(error);
					question.error = error;
					deferred.reject(question);
				});
				return deferred.promise;
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id
					questionText: this.questionText,
					answers: [],
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}});
				}
				return q;
			}
		},
		{
			name: 'multi2',
			background: 'questions/multi2/background.jpg',
			difficulty: 2,
			error: null,
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				this.difficulty = difficulty;
				question.person = familysearchService.getRandomPerson(useLiving);
				//-- make sure we have a person with facts
				while(!question.person.facts || question.person.facts.length==0) {
					question.person = familysearchService.getRandomPerson(useLiving);
				}
				familysearchService.getRandomPeopleNear(question.person, 3, useLiving).then(function(people) {
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
					deferred.resolve(question);
				}, function(error) {
					console.log(error);
					question.error = error;
					deferred.reject(question);
				});
				return deferred.promise;
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id
					questionText: this.questionText,
					answers: [],
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}});
				}
				return q;
			}
		},
		{
			name: 'tree', 
			background: 'questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			tryCount: 0,
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				this.difficulty = difficulty;
				question.questionText = 'Complete the family tree.'
				
				question.person = familysearchService.getRandomPerson(useLiving);
				familysearchService.getAncestorTree(question.person.id, 2, false, null, true).then(function(tree) {
					if (tree.persons.length<3 && question.tryCount < 5) {
						console.log('Not enough people. Trying setup again.');
						question.tryCount++;
						question.setup().then(function(q) { deferred.resolve(q); }, function(q) { deferred.reject(q); });
					} else {
						question.people = [];
						question.tryCount = 0;
						for(var p=0; p<tree.persons.length; p++){
							if (tree.persons[p].display.ascendancyNumber.indexOf("S")<0) {
								question.people.push(tree.persons[p]);
							}
						}
						deferred.resolve(question);
					}
				});
				return deferred.promise;
			},
			checkAnswer: function(answer) {
				
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id
					questionText: this.questionText,
					answers: [],
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.people[p].id, display: { name: this.people[p].display.name}});
				}
				return q;
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
		var q = Math.floor (Math.random () * this.questions.length);
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
.controller('photo1Controller', function($scope, QuestionService) {
	
	$scope.questionText = 'Who is shown in this picture?';
	
	$scope.answerPeople = [];
	$scope.incorrectAnswers = {};
	
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[0]) {
				$scope.incorrectAnswers[0] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[1]) {
				$scope.incorrectAnswers[1] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[2]) {
				$scope.incorrectAnswers[2] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[3]) {
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
		}
	};
})
.controller('multi2Controller', function($scope, QuestionService) {
	
	$scope.questionText = '';
	
	$scope.answerPeople = [];
	$scope.incorrectAnswers = {};
	
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[0]) {
				$scope.incorrectAnswers[0] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[1]) {
				$scope.incorrectAnswers[1] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[2]) {
				$scope.incorrectAnswers[2] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
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
			$scope.$emit('questionCorrect', $scope.question);
		} else {
			console.log("Incorrect!");
			if (!$scope.incorrectAnswers[3]) {
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionIncorrect', $scope.question);
			}
		}
	};
})
.directive('treePerson', [function() {
	return {
		scope: {
			treePerson: '='
		},
		link: function($scope, $element, $attr) {
			$element.draggable({
				revert: "invalid", 
				containment: 'body', 
				zIndex: 101,
				start: function(event, ui) {
					$scope.treePerson.originalPosition = ui.position;
				}
			})
			.data('person', $scope.treePerson);
		}
	};
}])
.directive('treeSpot', [function() {
	return {
		link: function($scope, $element, $attr) {
			$element.droppable({
				drop: function(event, ui) {
					var person = ui.draggable.data('person');
					var dropper = $element.data('dropper');
					if (dropper) {
						var oldperson = dropper.data('person');
						if (person.originalPosition) {
							dropper.animate({top: person.originalPosition.top, left: person.originalPosition.left });
						}
					}
					ui.draggable.css('top', $element.position().top+'px');
					ui.draggable.css('left', ($element.position().left+15)+'px');
					if (person.display.ascendancyNumber == $attr.number) {
						person.display.inPlace = true;
						$element.droppable( "option", "disabled", true );
						ui.draggable.draggable("option", "disabled", true);
						ui.draggable.removeClass("movable");
						$element.addClass('active-tree-spot');
					} else {
						person.display.inPlace = false;
						$element.addClass('inactive-tree-spot');
					}
					$element.data('dropper', ui.draggable);
					$element.data('person', person);
					$scope.checkTree();
				},
				out: function(event, ui) {
					if ($element.data('dropper')) {
						var person1 = ui.draggable.data('person');
						var person2 = $element.data('dropper').data('person');
						if (person1==person2) {
							$element.removeClass('inactive-tree-spot');
							$element.data('dropper', null);
							$element.droppable( "option", "disabled", false );
						}
					}
				}
			});
		}
	};
}])
.directive('treeSign', [function() {
	return {
		link: function($scope, $element, $attr) {
			$element.droppable({
				drop: function(event, ui) {
					var person = ui.draggable.data('person');
					person.display.inPlace = false;
				}
			});
		}
	}
}])
.controller('treeController', function($scope, QuestionService, familysearchService) {
	$scope.questionText = '';
	
	$scope.$watchCollection('question.people', function() {
		if ($scope.question.people && $scope.question.people.length > 0) {
			$scope.people = [];
			var x = 45;
			var y = 120;
			var count = 0;
			var hash = {};
			for(var p=0; p<$scope.question.people.length; p++) {
				hash[$scope.question.people[p].id] = $scope.question.people[p];
				familysearchService.getPersonPortrait($scope.question.people[p].id).then(function(res) {
					if (hash[res.id]) {
						hash[res.id].portrait = res.src;
					}
				});
				$scope.people.push({person: $scope.question.people[p], position: {x: x, y: y}});
				x += 105;
				count++;
				if (count>3) {
					x = 45;
					y += 110;
					count = 0;
				}
			}
			$scope.people = QuestionService.shuffleArray($scope.people);
			$scope.questionText = $scope.question.questionText;
		}
	});
	
	$scope.checkTree = function() {
		var correct = true;
		for (var p=0; p<$scope.people.length; p++) {
			if (!$scope.people[p].person.display.inPlace) {
				correct = false;
				break;
			}
		}
		console.log("Tree is complete "+correct);
		if (correct) {
			$scope.$emit('questionCorrect', $scope.question);
		}
	}
})
;