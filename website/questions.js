angular.module('genquiz.questions', ['genquizitive', 'ui.bootstrap'])
.service ('QuestionService', ['familysearchService', 'languageService', 'relationshipService', '$http', '$sce', '$q', '$templateCache', 
		function(familysearchService, languageService, relationshipService, $http, $sce, $q, $templateCache) {
	this.questions = [
		{
			name: 'photo1', 
			letter: 'P',
			background: 'questions/photo1/background.jpg',
			difficulty: 1,
			error: null,
			hints: ['fifty','lifesaver','freeze','skip','rollback'],
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				this.difficulty = difficulty;
				this.isReady = false;
				this.timeOffset = 0;
				this.questionText = 'Who is shown in this picture?';
				familysearchService.getRandomPersonWithPortrait(useLiving).then(function(person) {
					question.person = person;
					familysearchService.markUsed(question.person);
					
					familysearchService.getRandomPeopleNear(person, 3, useLiving).then(function(people) {
						question.randomPeople = people;
						question.isReady = true;
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
			setupFromPersistence: function(roundQuestion) {
				this.isReady = false;
				this.timeOffset = 0;
				var person = familysearchService.getLocalPersonById(roundQuestion.personId);
				if (person) {
					var deferred = $q.defer();
					this.difficulty = roundQuestion.difficulty;
					this.person = person;
					this.questionText = roundQuestion.questionText;
					familysearchService.getRandomPeopleNear(person, 3, useLiving).then(function(people) {
						question.randomPeople = people;
						question.isReady = true;
						deferred.resolve(question);
					}, function(error) {
						console.log(error);
						question.error = error;
						deferred.reject(question);
					});
					return deferred.promise;
				} else {
					return this.setup(roundQuestion.difficulty, true);
				}
				
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
					personId: this.person.id,
					questionText: this.questionText,
					answers: [],
					startTime: this.startTime,
					completeTime: this.completeTime,
					timeOffset: this.timeOffset
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}});
				}
				return q;
			}
		},
		{
			name: 'multi1', 
			letter: 'R',
			background: 'questions/multi1/background.jpg',
			difficulty: 1,
			error: null,
			hints: ['fifty','lifesaver','freeze','skip','rollback'],
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.difficulty = difficulty;
				question.startPerson = familysearchService.fsUser;
				this.timeOffset = 0;
				
				var length = 1 + difficulty;
				relationshipService.getRandomRelationshipPath(question.startPerson.id, length, useLiving).then(function(path) {
					var lastRel = path[path.length-1];
					if (!lastRel || !lastRel.person1 || !lastRel.person2) {
						console.log('relationship missing person');
						deferred.reject(question);
						return;
					}

					question.path = path;
					
					relationshipService.verbalizePath(familysearchService.fsUser, path).then(function(pathInfo) {
						question.questionText = 'Who is your ' + pathInfo.text + '?';
						question.person = pathInfo.person;
						familysearchService.markUsed(question.person);						
						familysearchService.getRandomPeopleNear(question.person, 3, useLiving).then(function(people) {
							question.randomPeople = people;
							question.isReady = true;
							deferred.resolve(question);
						}, function(error) {
							console.log(error);
							question.error = error;
							deferred.reject(question);
						});
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
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.answers = roundQuestion.answers;
				this.person = roundQuestion.person;
				var person = familysearchService.getLocalPersonById(roundQuestion.personId);
				if (person) {
					this.person = person;
				}
				this.randomPeople = [];
				for(var r=0; r<roundQuestion.answers.length; r++) {
					var rp = familysearchService.getLocalPersonById(roundQuestion.answers[r].id);
					if (rp) {
						this.randomPeople[r] = rp;
					} else {
						this.randomPeople[r] = angular.copy(roundQuestion.answers[r]);
					}
				}
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var questionText = this.questionText;
				if (familysearchService.fsUser) {
					questionText = questionText.replace("your", languageService.shortenName(familysearchService.fsUser.display.name)+"'s");
				}
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: {id: this.person.id, display: { name: this.person.display.name}},
					questionText: questionText,
					answers: [],
					startTime: this.startTime,
					completeTime: this.completeTime,
					timeOffset: this.timeOffset
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}});
				}
				return q;
			}
		},
		{
			name: 'multi2',
			letter: 'F',
			background: 'questions/multi2/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['fifty','lifesaver','freeze','skip','rollback'],
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.difficulty = difficulty;
				this.timeOffset = 0;
				question.person = familysearchService.getRandomPerson(useLiving);
				//-- make sure we have a person with facts
				while(!question.person.facts || question.person.facts.length<2) {
					question.person = familysearchService.getRandomPerson(useLiving);
				}
				familysearchService.markUsed(question.person);
				familysearchService.getRandomPeopleNear(question.person, 3, useLiving).then(function(people) {
					question.randomPeople = people;
					var found = false;
					var count = 0;
					while(!found && count < 10) {
						var r = Math.floor(Math.random() * question.person.facts.length);
						question.fact = question.person.facts[r];
						var good = true;
						if (question.fact.type=='http://gedcomx.org/Birth' || question.fact.type=='http://gedcomx.org/Death') {
							if (!question.fact.date && !question.fact.place) {
								good = false;
								count++;
							}
						}
						if (good && languageService.facts[question.fact.type] && languageService.facts[question.fact.type].pastVerb) {
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
							if (question.fact.date.original.length > 4) {
								question.questionText += " on "+question.fact.date.original;
							} else {
								question.questionText += " in "+question.fact.date.original;
							}
						}
						question.questionText += "?";

						question.isReady = true;
						deferred.resolve(question);
					} else {
						console.log('not enough facts for person');
						question.error = 'not enough facts for person';
						deferred.reject(question);
					}
					
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
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.answers = roundQuestion.answers;
				this.randomPeople = [];
				for(var r=0; r<roundQuestion.answers.length; r++) {
					var rp = familysearchService.getLocalPersonById(roundQuestion.answers[r].id);
					if (rp) {
						this.randomPeople[r] = rp;
					} else {
						this.randomPeople[r] = angular.copy(roundQuestion.answers[r]);
					}
				}
				this.person = roundQuestion.person;
				var person = familysearchService.getLocalPersonById(roundQuestion.personId);
				if (person) {
					this.person = person;
				}
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: {id: this.person.id, display: { name: this.person.display.name}},
					questionText: this.questionText,
					answers: [],
					startTime: this.startTime,
					completeTime: this.completeTime,
					timeOffset: this.timeOffset
				};
				for(var p=0; p<this.randomPeople.length; p++) {
					q.answers.push({id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}});
				}
				return q;
			}
		},
		{
			name: 'tree', 
			letter: 'T',
			background: 'questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			tryCount: 0,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.difficulty = difficulty;
				this.timeOffset = 0;
				question.questionText = 'Complete the family tree.'
				
				question.person = familysearchService.getRandomPerson(useLiving);
				familysearchService.markUsed(question.person);
				familysearchService.getAncestorTree(question.person.id, 2, false, null, true).then(function(tree) {
					if ((!tree.persons || tree.persons.length<3) && question.tryCount < 8) {
						console.log('Not enough people. Trying setup again. '+question.tryCount);
						question.tryCount++;
						if (question.tryCount==8) {
							deferred.reject(question);
							return;
						}
						question.setup(difficulty, useLiving).then(function(q) { 
							deferred.resolve(q); 
						}, function(q) { 
							deferred.reject(q); 
						});
						return;
					} else {
						question.people = [];
						question.tryCount = 0;
						for(var p=0; p<tree.persons.length; p++){
							if (tree.persons[p].display.ascendancyNumber.indexOf("S")<0) {
								question.people.push(tree.persons[p]);
							}
						}
						question.isReady = true;
						deferred.resolve(question);
					}
				}, function(error) {
					console.log(error);
					deferred.reject(error);
				});
				return deferred.promise;
			},
			checkAnswer: function(answer) {
				
			},
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				var person = familysearchService.getLocalPersonById(roundQuestion.personId);
				if (person) {
					this.person = person;
					this.person.display.ascendancyNumber = roundQuestion.person.ascendancyNumber;
				} else {
					this.person = angular.copy(roundQuestion.person);
				}
				this.people = [];
				for(var r=0; r<roundQuestion.people.length; r++) {
					var rp = familysearchService.getLocalPersonById(roundQuestion.people[r].id);
					if (rp) {
						var an = roundQuestion.people[r].display.ascendancyNumber;
						rp.display.ascendancyNumber = an;
						this.people[r] = rp;
					} else {
						this.people[r] = angular.copy(roundQuestion.people[r]);
					}
				}
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: {id: this.person.id, display: {name: this.person.display.name, ascendancyNumber: this.person.display.ascendancyNumber}},
					questionText: this.questionText,
					people: [],
					startTime: this.startTime,
					completeTime: this.completeTime,
					timeOffset: this.timeOffset
				};
				for(var p=0; p<this.people.length; p++) {
					q.people.push({id: this.people[p].id, display: { name: this.people[p].display.name, ascendancyNumber: this.people[p].display.ascendancyNumber}});
				}
				return q;
			}
		},
		{
			name: 'timeline',
			letter: 'L',
			background: 'questions/multi2/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.timeOffset = 0;
				question.difficulty = difficulty;
				question.person = familysearchService.getRandomPerson(useLiving);
				//-- make sure we have a person with facts
				var count = 0;
				
				var person = question.person;
				while(count < 10 && (!question.person.facts || question.person.facts.length<1+question.difficulty || question.person.facts.length>2+2*question.difficulty)) {
					person = familysearchService.getRandomPerson(useLiving);
					if (person.facts && (!question.person.facts || person.facts.length > question.person.facts.length)) {
						question.person = person;
					}
					count++;
				}
				if (count==10) {
					console.log('unabled to find person with enough facts');
					deferred.reject(question);
				} else {
					familysearchService.markUsed(question.person);
					question.questionText = 'Place the facts for '+question.person.display.name+' in the correct order on the timeline.';
					question.isReady = true;
					deferred.resolve(question);
				}
				
				return deferred.promise;
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			},
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.person = roundQuestion.person;
				var person = familysearchService.getLocalPersonById(roundQuestion.personId);
				if (person) {
					this.person = person;
				}
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: this.person,
					questionText: this.questionText,
					startTime: this.startTime,
					completeTime: this.completeTime,
					timeOffset: this.timeOffset
				};
				return q;
			}
		},
		{
			name: 'map',
			letter: 'M',
			background: 'questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				question.difficulty = difficulty;
				this.timeOffset = 0;
				question.person = familysearchService.getRandomPerson(useLiving);
				question.factCount = question.countFacts(question.person);
				//-- make sure we have a person with facts
				var count = 0;
				
				var person = question.person;
				while(count < 10 && (!question.factCount || question.factCount<1+question.difficulty || question.factCount>2+2*question.difficulty)) {
					person = familysearchService.getRandomPerson(useLiving);
					var pcount=question.countFacts(person);
					if (pcount>=1+question.difficulty && pcount<=2+2*question.difficulty) {
						question.person = person;
						question.factCount = pcount;
					}
					count++;
				}
				if (count==10) {
					console.log('unabled to find person with enough facts');
					deferred.reject(question);
				} else {
					console.log('lookup geocodes for person '+question.person.id +' '+question.person.display.name);
					var sortedfacts = languageService.sortFacts(question.person.facts);
					var uniquePlaces = {};
					var uniqueFacts = {};
					question.places = [];
					var promises = [];
					for(var f=0; f<sortedfacts.length; f++) {
						var fact = sortedfacts[f];
						if (fact.place) {
							var place = "";
							if (fact.place.normalized && fact.place.normalized.value) {
								place = fact.place.normalized.value;
							} else if (fact.place.original) {
								place = fact.place.original;
							}
							
							if (place!="" && !uniqueFacts[place]) {
								uniqueFacts[place] = fact;
								var promise = familysearchService.searchPlace(place).then(function(response) {
									if (response.entries && response.entries.length>0) {
										var responsePlace = response.place;
										var entry = response.entries[0];
										if (entry.content && entry.content.gedcomx && entry.content.gedcomx.places && entry.content.gedcomx.places.length>0) {
											var placeAuthority = entry.content.gedcomx.places[0];
											if (!uniquePlaces[placeAuthority.id] && placeAuthority.latitude) {
												uniquePlaces[placeAuthority.id] = placeAuthority;
												placeAuthority.fact = uniqueFacts[responsePlace];
												placeAuthority.pos = [placeAuthority.latitude, placeAuthority.longitude];
												question.places.push(placeAuthority);
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
					//-- wait for all place searches to complete
					$q.all(promises).then(function() {
						if (question.places.length >= 1+question.difficulty && question.places.length <= 2+2*question.difficulty) {
							familysearchService.markUsed(question.person);
							question.questionText = 'Move the facts for '+question.person.display.name+' to the correct place on the map.';
							question.isReady = true;
							deferred.resolve(question);
						} else {
							deferred.reject("person "+question.person.id+" does not have enough facts with geocoded place data");
						}
					}, function(error) {
						console.log("unable to resolve all promises "+error);
					});
				}
				
				return deferred.promise;
			},
			countFacts: function(person) {
				var count = 0;
				if (person.facts && person.facts.length > 0) {
					for(var f=0; f<person.facts.length; f++) {
						if (person.facts[f].place) count++;
					}
				}
				return count;
			},
			checkAnswer: function(answer) {
				if (answer.id == this.person.id) {
					return true;
				}
				return false;
			},
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.person = roundQuestion.person;
				var person = familysearchService.getLocalPersonById(roundQuestion.personId);
				if (person) {
					this.person = person;
				}
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: this.person,
					questionText: this.questionText,
					startTime: this.startTime,
					completeTime: this.completeTime,
					timeOffset: this.timeOffset
				};
				return q;
			}
		}
	];
	
	this.hints = [
		{
			name: "fifty",
			img: "hints/fifty.png",
			questions: ['photo1','multi1','multi2'],
			description: 'The 50/50 hint removes two of the incorrect choices from multiple choice questions.'
		},
		{
			name: "lifesaver",
			img: "hints/lifesaver.png",
			questions: ['photo1','multi1','multi2'],
			description: 'The Life-Saver hint will erase a missed question penalty or save you from incurring a penalty if you answer a future question incorrectly.'
		},
		{
			name: "freeze",
			img: "hints/freeze.png",
			questions: ['photo1','multi1','multi2','tree','timeline','map'],
			description: 'The Freeze hint will pause the timer for 20 seconds while you consider how to answer a problem.',
			time: 20
		},
		{
			name: "skip",
			img: "hints/skip.png",
			questions: ['photo1','multi1','multi2','tree','timeline','map'],
			description: 'The Skip hint will allow you to skip to the next question, but it will keep the current amount of time that you have spent on the question.'
		},
		{
			name: "rollback",
			img: "hints/rollback.png",
			questions: ['photo1','multi1','multi2','tree','timeline','map'],
			description: 'The Rollback hint will subtract 15 seconds of time from the current question. If there are not 15 seconds available it will reduce the time to 0.',
			time: 15
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
		return angular.copy(this.questions[q]);
	};
	
	this.getQuestionByName = function(name) {
		for(var q=0; q<this.questions.length; q++) {
			if (this.questions[q].name==name) return angular.copy(this.questions[q]);
		}
		return null;
	};

	this.getQuestionLetter = function(name) {
		for(var q=0; q<this.questions.length; q++) {
			if (this.questions[q].name==name) return this.questions[q].letter;
		}
		return 'Q';
	};
	
	this.getRandomHint = function () {
		var q = Math.floor (Math.random () * this.hints.length);
		return angular.copy(this.hints[q]);
	};
	
	this.getHintByName = function(name) {
		for(var q=0; q<this.hints.length; q++) {
			if (this.hints[q].name==name) return angular.copy(this.hints[q]);
		}
		return null;
	};

	this.friendlyNames = {
		R: 'Relationship Mulitple Choice Question',
		T: 'Complete the Tree Question',
		P: 'Picture Mulitple Choice Question',
		F: 'Fact Mulitple Choice Question',
		L: 'Timeline Sort Question',
		M: 'Map the Facts Question',
		U: 'Unknown'
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
		link: function($scope, $element, $attr) {
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
	
	$scope.$on('applyHint', function(event, hint) {
		if (hint.name=='fifty') {
			var count = Math.floor($scope.answerPeople.length / 2);
			var temp = [];
			for (var a=0; a<$scope.answerPeople.length; a++) temp.push(a);
			temp = QuestionService.shuffleArray(temp);
			var a=0;
			while(count>0 && a<temp.length) {
				if (!$scope.question.checkAnswer($scope.answerPeople[temp[a]])) {
					$scope.incorrectAnswers[temp[a]] = true;
					count--;
				}
				a++;
			}
		}
	});
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
	
	$scope.$on('applyHint', function(event, hint) {
		if (hint.name=='fifty') {
			var count = Math.floor($scope.answerPeople.length / 2);
			var temp = [];
			for (var a=0; a<$scope.answerPeople.length; a++) temp.push(a);
			temp = QuestionService.shuffleArray(temp);
			var a=0;
			while(count>0 && a<temp.length) {
				if (!$scope.question.checkAnswer($scope.answerPeople[temp[a]])) {
					$scope.incorrectAnswers[temp[a]] = true;
					count--;
				}
				a++;
			}
		}
	});
})
.directive('treePerson', [function() {
	return {
		scope: {
			treePerson: '='
		},
		link: function($scope, $element, $attr) {
			if (!$scope.treePerson.display.inPlace) {
				$element.draggable({
					revert: "invalid", 
					zIndex: 101,
					start: function(event, ui) {
						$scope.treePerson.originalPosition = ui.position;
					}
				})
				.data('person', $scope.treePerson);
			}
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

			$scope.$watch('spots', function() {
				if ($scope.spots && $scope.spots[$attr.number].highlight) {
					$element.droppable( "option", "disabled", true );
					$element.addClass('active-tree-spot');
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
	
	$scope.$watch('question', function() {
		if ($scope.question.people && $scope.question.people.length > 0) {
			$scope.people = [];
			var x = 45;
			var y = 120;
			var count = 0;
			var hash = {};
			$scope.spots = {
				4: {left: -15, top: 440},
				5: {left: 115, top: 440},
				6: {left: 305, top: 440},
				7: {left: 435, top: 440},
				2: {left: 50,  top: 570},
				3: {left: 370, top: 570},
				1: {left: 210, top: 640}
			};
			for(var p=0; p<$scope.question.people.length; p++) {
				$scope.question.people[p].display.inPlace = false;
			}
			if ($scope.question.people.length>1) {
				var perc = (5 - $scope.question.difficulty) / 7.0;
				var num = Math.floor($scope.question.people.length * perc);
				if (num > $scope.question.people.length/2) {
					num = Math.floor($scope.question.people.length/2);
				}
				for(var p=0; p<num; p++) {
					var rand = Math.floor(Math.random() * $scope.question.people.length);
					while($scope.question.people[rand].display.inPlace) {
						rand = Math.floor(Math.random() * $scope.question.people.length);
					}
					$scope.question.people[rand].display.inPlace = true;
				}
			}
			$scope.question.people = QuestionService.shuffleArray($scope.question.people);
			for(var p=0; p<$scope.question.people.length; p++) {
				hash[$scope.question.people[p].id] = $scope.question.people[p];
				familysearchService.getPersonPortrait($scope.question.people[p].id).then(function(res) {
					if (hash[res.id]) {
						hash[res.id].portrait = res.src;
					}
				});
				var pos = {left: x, top: y};
				if ($scope.question.people[p].display.inPlace) {
					if ($scope.spots[$scope.question.people[p].display.ascendancyNumber]) {
						pos = $scope.spots[$scope.question.people[p].display.ascendancyNumber];
						$scope.spots[$scope.question.people[p].display.ascendancyNumber].highlight = true;
					}
				}
				$scope.people.push({person: $scope.question.people[p], position: pos});
				x += 105;
				count++;
				if (count>3) {
					x = 45;
					y += 110;
					count = 0;
				}
			}
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
.directive('sortableTimeline', [function() {
	return {
		link: function($scope, $element, $attr) {
			$element.sortable({
				//containment: "parent",
				axis: "y",
				items: '> .timeline-fact',
				stop: function( event, ui ) {
					var complete = true;
					$element.find( ".timeline-fact" ).each(function( index ) {
						var fact = $(this).data('fact');
						if (fact) {
							if (fact.sortIndex!=index) {
								fact.factClass="hide-date";
								complete = false;
							} else {
								fact.factClass=null;
							}
						}
					});
					if (complete) {
						$scope.sendComplete();
					}
				}
			});
		}
	}
}])
.controller('timelineController', function($scope, QuestionService, languageService) {
	$scope.questionText = '';
	
	$scope.$watch('question.person', function() {
		if ($scope.question.person) {
			$scope.questionText = $scope.question.questionText;
			$scope.sortedfacts = languageService.sortFacts($scope.question.person.facts);
			$scope.facts = angular.copy($scope.sortedfacts);
			for(var f=0; f<$scope.facts.length; f++) {
				$scope.facts[f].sortIndex = f;
			}
			$scope.facts = QuestionService.shuffleArray($scope.facts);
			if ($scope.checkTimeline()) {
				$scope.facts = QuestionService.shuffleArray($scope.facts);
			}
			$scope.poleStyle = {height: (($scope.sortedfacts.length - 1)*100)+'px'};
		}
	});
	
	$scope.checkTimeline = function() {
		var complete = true;
		for(var f=0; f<$scope.facts.length; f++) {
			if (f!=$scope.facts[f].sortIndex) {
				$scope.facts[f].factClass="hide-date";
				complete = false;
			}
		}
		return complete;
	};
	
	$scope.sendComplete = function() {
		console.log('timeline complete');
		$scope.$emit('questionCorrect', $scope.question);
	};
})
.directive('mapFact', ['NgMap', function(NgMap) {
	return {
		scope: {
			place: '='
		},
		template: '<span class="fact-type">{{place.fact.type | factlabel}} {{place.fact.value}}</span><br /><span class="fact-date">{{place.fact.date.original}}</span>',
		link: function($scope, $element, $attr) {
			$element.draggable({
				revert: "invalid", 
				zIndex: 101,
				start: function(event, ui) {
					NgMap.getMap().then(function(map) {
					  map.setOptions({draggable: false});
					});
				},
				stop: function(event, ui) {
					NgMap.getMap().then(function(map) {
					  map.setOptions({draggable: true});
					});
				}
			})
			.data('place', $scope.place);
		}
	}
}])
.directive('mapFactHolder', [function() {
	return {
		scope: {
			place: '='
		},
		link: function($scope, $element, $attr) {
			$scope.isFull = false;
			$element.droppable({
				accept: function(event, ui) {
					var droppedFact = ui.draggable.data('place');
					if (droppedFact.id==$scope.place.id) {
						return true;
					}
					return false;
				},
				drop: function(event, ui) {
					$scope.isFull = true;
					$($element).append(ui.draggable.detach());
					ui.draggable.css('position', 'absolute');
					ui.draggable.css('left', '-1px');
					ui.draggable.css('top', '-3px');
					var droppedFact = ui.draggable.data('place');
					if (droppedFact.id==$scope.place.id) {
						ui.draggable.addClass('inPlace');
						droppedFact.inPlace = true;
						$element.droppable( "option", "disabled", true );
						ui.draggable.draggable("option", "disabled", true);
					} else {
						ui.draggable.removeClass('inPlace');
						droppedFact.inPlace = false;
					}
					$scope.$emit('checkMap');
				}
			});
		}
	}
}])
.controller('mapController', function($scope, $q, QuestionService, languageService, familysearchService, NgMap) {
	$scope.questionText = '';
	
	$scope.$watch('question.person', function() {
		if ($scope.question.person) {
			$scope.questionText = $scope.question.questionText;
		}
	});
	
	$scope.$watchCollection('question.places', function() {
		if ($scope.question && $scope.question.places) {
			$scope.dynMarkers = [];
			NgMap.getMap().then(function(map) {
				var bounds = new google.maps.LatLngBounds();
				for (var k in map.customMarkers) {
					var cm = map.customMarkers[k];
					bounds.extend(cm.getPosition());
					$scope.dynMarkers.push(cm);
				}
				if ($scope.marketClusterer) {
					$scope.marketClusterer.clearMarkers();
					$scope.marketClusterer.addMarkers($scope.dynMarkers);
				} else {
					$scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {styles: [{url: 'map_cluster.png', gridSize: 200, width: 100, height: 55, textSize: 16}]}); 
				}
				map.setCenter(bounds.getCenter());
				map.fitBounds(bounds);
			});
		}
	});
	
	$scope.$on('checkMap', function() {
		$scope.checkMap();
	});
	
	$scope.checkMap = function() {
		var complete = true;
		for(var i=0; i<$scope.question.places.length; i++) {
			if (!$scope.question.places[i].inPlace) {
				complete = false;
				break;
			}
		}
		console.log('map complete in '+complete);
		if (complete) {
			$scope.$emit('questionCorrect', $scope.question);
		}
	};
})
;