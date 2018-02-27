angular.module('genquiz.questions', ['genquiz.familytree', 'ui.bootstrap'])
.service ('QuestionService', ['familysearchService', 'languageService', 'relationshipService', '$http', '$sce', '$q', '$templateCache', 
		function(familysearchService, languageService, relationshipService, $http, $sce, $q, $templateCache) {
	this.questions = [
		{
			name: 'photo1', 
			letter: 'P',
			background: '/questions/photo1/background.jpg',
			difficulty: 1,
			error: null,
			hints: ['fifty','lifesaver','freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var deferred = $q.defer();
				var question = this;
				this.difficulty = difficulty;
				this.isReady = false;
				this.timeOffset = 0;
				this.questionText = 'Who is shown in this picture?';
				familysearchService.getRandomPersonWithPortrait(useLiving, this.difficulty).then(function(person) {
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

				var question = this;
				question.difficulty = roundQuestion.difficulty;
				question.person = roundQuestion.person;
				question.questionText = roundQuestion.questionText;

				question.randomPeople = [];
				for(var r=0; r<roundQuestion.answers.length; r++) {
					this.randomPeople[r] = angular.copy(roundQuestion.answers[r]);	
				}
				question.isReady = true;
				return question;
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
					person: {id: this.person.id, display: this.person.display, portrait: this.person.portrait},
					questionText: this.questionText,
					answers: []
				};
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				for(var p=0; p<this.randomPeople.length; p++) {
					var ps = {id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}};
					if (this.randomPeople[p].gender) {
						ps.gender = this.randomPeople[p].gender;
					}
					q.answers.push(ps);
				}
				return q;
			}
		},
		{
			name: 'multi1', 
			letter: 'R',
			background: '/questions/multi1/background.jpg',
			difficulty: 1,
			error: null,
			hints: ['fifty','lifesaver','freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.difficulty = difficulty;
				question.startPerson = startPerson;
				if (!question.startPerson) {
					question.startPerson = familysearchService.fsUser;
				}
				this.timeOffset = 0;
				
				var length = difficulty + Math.floor(Math.random() * 2);
				relationshipService.getRandomRelationshipPath(question.startPerson.id, length, useLiving).then(function(path) {
					var lastRel = path[path.length-1];
					if (!lastRel || !lastRel.person1 || !lastRel.person2) {
						console.log('relationship missing person');
						deferred.reject(question);
						return;
					}

					question.path = path;
					
					relationshipService.verbalizePath(question.startPerson, path).then(function(pathInfo) {
						if (question.startPerson == familysearchService.fsUser) {
							question.questionText = 'Who is your ' + pathInfo.text + '?';
						} else {
							question.questionText = 'Who is ' + question.startPerson.display.name +"'s "+ pathInfo.text + '?';
						}
						question.person = pathInfo.person;
						familysearchService.markUsed(question.person);						
						familysearchService.getRandomPeopleNear(question.person, 3, useLiving, question.difficulty < 4).then(function(people) {
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
				this.randomPeople = [];
				for(var r=0; r<roundQuestion.answers.length; r++) {
					this.randomPeople[r] = angular.copy(roundQuestion.answers[r]);
				}
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var questionText = this.questionText;
				if (familysearchService.fsUser) {
					questionText = questionText.replace("your", this.startPerson.display.name + "'s");
				}
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: {id: this.person.id, display: { name: this.person.display.name}},
					questionText: questionText,
					answers: []
				};
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				if (this.person.portrait && this.person.portrait!='/images/unknown_sil.png') {
					q.person.portrait = this.person.portrait;
				}
				for(var p=0; p<this.randomPeople.length; p++) {
					var p2 = {id: this.randomPeople[p].id, display: { name: this.randomPeople[p].display.name}};
					if (this.randomPeople[p].gender) {
						p2.gender = this.randomPeople[p].gender;
					}
					if (this.randomPeople[p].portrait && this.randomPeople[p].portrait!='/images/unknown_sil.png') {
						p2.portrait = this.randomPeople[p].portrait;
					}
					q.answers.push(p2);
				}
				return q;
			}
		},
		{
			name: 'multi2',
			letter: 'F',
			background: '/questions/multi2/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['fifty','lifesaver','freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.difficulty = difficulty;
				this.timeOffset = 0;
				question.person = familysearchService.getRandomPerson(useLiving, this.difficulty);
				//-- make sure we have a person with facts
				var counter = 0;
				while(!question.person || !question.person.facts || question.person.facts.length<2) {
					question.person = familysearchService.getRandomPerson(useLiving, this.difficulty);
					counter++;
					if (counter > 10) {
						console.log('unable to find random person with facts after 10 tries');
						question.error = 'unable to find random person with facts after 10 tries';
						deferred.reject(question);
						return;
					}
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
						if (question.difficulty < 3 && question.fact.type=='http://gedcomx.org/Residence') {
							good = false;
							count++;
						}
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
					this.randomPeople[r] = angular.copy(roundQuestion.answers[r]);
				}
				this.person = roundQuestion.person;
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
					answers: []
				};
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				if (this.person.portrait && this.person.portrait!='/images/unknown_sil.png') {
					q.person.portrait = this.person.portrait;
				}
				for(var p=0; p<this.randomPeople.length; p++) {
					var p2 = {id: this.randomPeople[p].id, gender: this.randomPeople[p].gender, display: { name: this.randomPeople[p].display.name}};
					if (this.randomPeople[p].gender) {
						p2.gender = this.randomPeople[p].gender;
					}
					if (this.randomPeople[p].portrait && this.randomPeople[p].portrait!='/images/unknown_sil.png') {
						p2.portrait = this.randomPeople[p].portrait;
					}
					q.answers.push(p2);
				}
				return q;
			}
		},
		{
			name: 'tree', 
			letter: 'T',
			background: '/questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			tryCount: 0,
			canReset: true,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.difficulty = difficulty;
				this.timeOffset = 0;
				question.questionText = 'Drag your relatives onto the family tree.'
				
				question.person = familysearchService.getRandomPerson(useLiving, this.difficulty);
				familysearchService.markUsed(question.person);
				familysearchService.getAncestorTree(question.person.id, 2, false, null, true).then(function(tree) {
					if ((!tree.persons || tree.persons.length<3) && question.tryCount < 8) {
						console.log('Not enough people. Trying setup again. '+question.tryCount);
						question.tryCount++;
						if (question.tryCount==8) {
							question.error = tree;
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
						var promises = [];
						for(var p=0; p<tree.persons.length; p++){
							if (tree.persons[p].display.ascendancyNumber.indexOf("S")<0) {
								question.people.push(tree.persons[p]);
								var pro = question.loadPortrait(tree.persons[p]);
								promises.push(pro);
							}
						}
						$q.all(promises).then(function() {
							question.isReady = true;
							deferred.resolve(question);
						});
					}
				}, function(error) {
					console.log(error);
					deferred.reject(error);
				});
				return deferred.promise;
			},
			loadPortrait: function(person) {
				return familysearchService.getPersonPortrait(person.id).then(function(res){
					person.portrait = res.src;
				},function(error){
					if (person.gender.type=="http://gedcomx.org/Female") {
						person.portrait = '/images/female_sil.png';
					} else if (person.gender.type=="http://gedcomx.org/Male") {
						person.portrait = '/images/male_sil.png';
					} else {
						person.portrait = '/images/unknown_sil.png';
					}
				});
			},
			checkAnswer: function(answer) {
				
			},
			reset: function() {

			},
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.person = angular.copy(roundQuestion.person);
				this.people = [];
				for(var r=0; r<roundQuestion.people.length; r++) {
					this.people[r] = angular.copy(roundQuestion.people[r]);
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
					person: {id: this.person.id, display: {name: this.person.display.name, ascendancyNumber: "1"}},
					questionText: this.questionText,
					people: []
				};
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				if (this.person.portrait && this.person.portrait!='/images/unknown_sil.png') {
					q.person.portrait = this.person.portrait;
				}
				for(var p=0; p<this.people.length; p++) {
					var p2={id: this.people[p].id, display: { name: this.people[p].display.name, ascendancyNumber: this.people[p].display.ascendancyNumber}};
					if (this.people[p].gender) {
						p2.gender = this.people[p].gender;
					}
					if (this.people[p].portrait && this.people[p].portrait!='/images/unknown_sil.png') {
						p2.portrait = this.people[p].portrait;
					}
					q.people.push(p2);
				}
				return q;
			}
		},
		{
			name: 'timeline',
			letter: 'L',
			background: '/questions/multi2/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				this.timeOffset = 0;
				question.difficulty = difficulty;
				question.person = familysearchService.getRandomPerson(useLiving, this.difficulty);
				//-- make sure we have a person with facts
				var count = 0;
				
				var person = question.person;
				var factCount = question.countFacts(question.person.facts);
				while(count < 10 && (!question.person.facts || factCount<1+question.difficulty)) {
					person = familysearchService.getRandomPerson(useLiving, this.difficulty);
					var newFactCount = question.countFacts(question.person.facts);
					if (person.facts && (!question.person.facts || newFactCount > factCount)) {
						question.person = person;
						factCount = newFactCount;
					}
					count++;
				}
				if (count==10) {
					console.log('unable to find person with enough facts');
					deferred.reject(question);
				} else {
					familysearchService.markUsed(question.person);
					question.questionText = 'Drag the facts for '+question.person.display.name+' into the correct order on the timeline with the earliest near the top.';
					question.isReady = true;
					deferred.resolve(question);
				}
				
				return deferred.promise;
			},
			countFacts: function(facts) {
				var count = 0;
				if (facts && facts.length >0) {
					var badFacts = ["LifeSketch","Other","REFN","Residence"];
					for(var f=0; f<facts.length; f++) {
						var found = false;
						if (this.difficulty < 4 && !facts[f].date) {
							//-- ignore facts that don't have dates
							found = true;
							break;
						} else {
							for(var b=0; b<badFacts.length; b++) {
								if (facts[f].type.indexOf(badFacts[b]) >= 0) {
									found = true;
									break;
								}
							}
						}
						if (!found) count++;
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
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					personId: this.person.id,
					person: {id: this.person.id, display: this.person.display, living: this.person.living, 
						facts: this.person.facts },
					questionText: this.questionText
				};
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				if (this.person.portrait && this.person.portrait!='/images/unknown_sil.png') {
					q.person.portrait = this.person.portrait;
				}
				return q;
			}
		},
		{
			name: 'map',
			letter: 'M',
			background: '/questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var deferred = $q.defer();
				var question = this;
				question.isReady = false;
				question.difficulty = difficulty;
				this.timeOffset = 0;
				question.person = familysearchService.getRandomPerson(useLiving, this.difficulty);
				question.factCount = question.countFacts(question.person);
				//-- make sure we have a person with facts
				var count = 0;
				
				var person = question.person;
				while(count < 10 && (!question.factCount || question.factCount<1+question.difficulty || question.factCount>2+2*question.difficulty)) {
					person = familysearchService.getRandomPerson(useLiving, this.difficulty);
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
											if (placeAuthority.latitude) {
												var latlongid = Math.floor(placeAuthority.latitude) + ' ' + Math.floor(placeAuthority.longitude);
												if (!uniquePlaces[placeAuthority.id] && !uniquePlaces[latlongid]) {
													uniquePlaces[placeAuthority.id] = placeAuthority;
													uniquePlaces[latlongid] = placeAuthority;
													placeAuthority.fact = uniqueFacts[responsePlace];
													placeAuthority.pos = [placeAuthority.latitude, placeAuthority.longitude];
													question.places.push(placeAuthority);
												}
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
							question.questionText = 'Drag the facts for '+question.person.display.name+' to the correct place on the map.';
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
				this.places = roundQuestion.places;
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					person: {id: this.person.id, display: this.person.display},
					questionText: this.questionText
				};
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				if (this.person.portrait && this.person.portrait!='/images/unknown_sil.png') {
					q.person.portrait = this.person.portrait;
				}
				var pPlaces = [];
				for(var p=0; p<this.places.length; p++) {
					var place = this.places[p];
					var pp = {};
					pp.fact = place.fact;
					pp.pos = place.pos;
					pp.latitude = place.latitude;
					pp.longitude = place.longitude;
					pp.display = place.display;
					pPlaces.push(pp);
				}
				q.places = pPlaces;
				return q;
			}
		},
		{
			name: 'map2',
			letter: 'B',
			background: '/questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var question = this;
				question.deferred = $q.defer();				
				question.isReady = false;
				question.difficulty = difficulty;
				this.timeOffset = 0;
				question.uniquePlaces = {};
				question.places = [];
				question.placeCount = 0;
				question.personQueue = [];
				question.questionText = 'Drag the people to their correct birth place on the map.';
				
				question.checkNextPerson(useLiving);
				
				return question.deferred.promise;
			},
			checkNextPerson: function(useLiving) {
				if (this.placeCount >= 1 + this.difficulty) {
					if (!this.isReady) {
						this.isReady = true;
						this.deferred.resolve(this);
					}
				} else {
					if (this.personQueue.length == 0) {
						var person = familysearchService.getRandomPerson(useLiving, this.difficulty);
						this.personQueue.push(person);
					}
					var person = this.personQueue.shift();
					if (!person) {
						person = familysearchService.getRandomPerson(useLiving, this.difficulty);
					}
					var question = this;
					this.checkBirthPlace(person).then(function(placeAuthority) {
						question.places.push(placeAuthority);
						question.placeCount++;
						question.checkNextPerson(useLiving);
					}, function(error) {
						console.log(error);
						question.checkNextPerson(useLiving);
					});
					
					if (person!=null) {
						familysearchService.getRandomPeopleNear(person, 0, useLiving, true).then(function(people) {
							for(var p=0; p<people.length; p++) {
								question.personQueue.push(people[p]);
							}
						}, function(error) {
							console.log(error);
						});
					}
				}
			},
			checkBirthPlace: function(person) {
				var deferred = $q.defer();
				if (!person) {
					deferred.reject('null person');
					return deferred.promise;
				}
				if (!person.facts) {
					deferred.reject('person has no facts');
					return deferred.promise;
				}
				var birthFact = null;
				for(var f=0; f<person.facts.length; f++) {
					var fact = person.facts[f];
					if (fact.type=='http://gedcomx.org/Birth' && fact.place) {
						birthFact = fact;
						break;
					}
				}
				if (birthFact) {
					var place = "";
					if (birthFact.place.normalized && birthFact.place.normalized.value) {
						place = birthFact.place.normalized.value;
					} else if (birthFact.place.original) {
						place = birthFact.place.original;
					}
					
					if (place!="") {
						var question = this;
						familysearchService.searchPlace(place).then(function(response) {
							if (response.entries && response.entries.length>0) {
								var responsePlace = response.place;
								var entry = response.entries[0];
								if (entry.content && entry.content.gedcomx && entry.content.gedcomx.places && entry.content.gedcomx.places.length>0) {
									var placeAuthority = entry.content.gedcomx.places[0];
									if (!question.uniquePlaces[placeAuthority.id] && placeAuthority.latitude) {
										question.uniquePlaces[placeAuthority.id] = placeAuthority;
										placeAuthority.pos = [placeAuthority.latitude, placeAuthority.longitude];
										placeAuthority.person = person;
										deferred.resolve(placeAuthority);
									} else {
										deferred.reject('duplicate birth place ['+place+'] for person '+person.id);
									}
								} else {
									deferred.reject('birth place ['+place+'] not found for person '+person.id);
								}
							} else {
								deferred.reject('birth place ['+place+'] not found for person '+person.id);
							}
						}, function(error) {
							deferred.reject('birth place ['+place+'] not found for person '+person.id);
						});
					} else {
						deferred.reject('no birth place for person '+person.id);
					}
				} else {
					deferred.reject('no birth place for person '+person.id);
				}
				return deferred.promise;
			},
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.places = roundQuestion.places;
				this.difficulty = roundQuestion.difficulty;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					questionText: this.questionText
				};
				var pPlaces = [];
				for(var p=0; p<this.places.length; p++) {
					var place = this.places[p];
					var pp = {};
					pp.person = {id: place.person.id, display: place.person.display};
					if (place.person.gender) {
						pp.person.gender = place.person.gender;
					}
					if (place.person.portrait && place.person.portrait!='/images/unknown_sil.png') {
						pp.person.portrait = place.person.portrait;
					}
					pp.pos = place.pos;
					pp.latitude = place.latitude;
					pp.longitude = place.longitude;
					pp.display = place.display;
					pPlaces.push(pp);
				}
				q.places = pPlaces;
				return q;
			}
		},
		{
			name: 'connect',
			letter: 'C',
			background: '/questions/tree/background.jpg',
			difficulty: 2,
			error: null,
			canReset: true,
			hints: ['freeze','skip','rollback'],
			setup: function(difficulty, useLiving, startPerson) {
				var question = this;
				question.deferred = $q.defer();				
				question.isReady = false;
				question.difficulty = difficulty;
				question.startPerson = startPerson;
				this.timeOffset = 0;
				
				var length = 1 + difficulty;
				if (length < 3) {
					length = 3;
				}
				if (length > 8) {
					length = 8;
				}
				relationshipService.getRandomRelationshipPath(question.startPerson.id, length, useLiving, 'parents').then(function(path) {
					var lastRel = path[path.length-1];
					if (!lastRel || !lastRel.person1 || !lastRel.person2) {
						console.log('relationship missing person');
						deferred.reject(question);
						return;
					}

					var rel = path[path.length-1];
					
					familysearchService.getPersonById(rel.person1.resourceId).then(function(person1) {
						question.person = person1;
						question.questionText = 'Click on the people to expand the tree path from '+question.startPerson.display.name
							+ ' up to '+question.person.display.name;
						familysearchService.markUsed(question.person);						
						familysearchService.getAncestorTree(question.startPerson.id,path.length).then(function(tree) {
							question.treePersons = {};
							var promises = [];
							for(var i=0; i<tree.persons.length; i++) {
								var tp = tree.persons[i];
								question.treePersons[tp.display.ascendancyNumber] = tp;
								var pro = question.loadPortrait(tp);
								promises.push(pro);
							}
							$q.all(promises).then(function() {
								question.isReady = true;
								question.deferred.resolve(question);
							});
						}, function(error) {
							console.log(error);
							question.error = error;
							question.deferred.reject(question);
						});
					}, function(error) {
						console.log(error);
						question.error = error;
						question.deferred.reject(question);
					});
				}, function(error){
					console.log(error);
					question.error = error;
					question.deferred.reject(question);
				});
				
				return question.deferred.promise;
			},
			loadPortrait: function(person) {
				return familysearchService.getPersonPortrait(person.id).then(function(res){
					person.portrait = res.src;
				},function(error){
					if (person.gender.type=="http://gedcomx.org/Female") {
						person.portrait = '/images/female_sil.png';
					} else if (person.gender.type=="http://gedcomx.org/Male") {
						person.portrait = '/images/male_sil.png';
					} else {
						person.portrait = '/images/unknown_sil.png';
					}
				});
			},
			reset: function() {

			},
			setupFromPersistence: function(roundQuestion) {
				this.questionText = roundQuestion.questionText;
				this.difficulty = roundQuestion.difficulty;
				this.person = roundQuestion.person;
				this.startPerson = roundQuestion.startPerson;
				this.treePersons = roundQuestion.treePersons;
				this.isReady = true;
				this.timeOffset = 0;
			},
			getPersistence: function() {
				var q = {
					name: this.name,
					difficulty: this.difficulty,
					questionText: this.questionText,
					startPerson: {id: this.startPerson.id, display: this.startPerson.display},
					person: {id: this.person.id, display: this.person.display},
					treePersons: {}
				};

				if (this.startPerson.gender) {
					q.startPerson.gender = this.startPerson.gender;
				}
				if (this.person.gender) {
					q.person.gender = this.person.gender;
				}
				if (this.startPerson.portrait && this.startPerson.portrait!='/images/unknown_sil.png') {
					q.startPerson.portrait = this.startPerson.portrait;
				}
				if (this.person.portrait && this.person.portrait!='/images/unknown_sil.png') {
					q.person.portrait = this.person.portrait;
				}

				for(key in this.treePersons) {
					var tp = this.treePersons[key];
					q.treePersons[key] = {id: tp.id, display: tp.display};
					if (tp.gender) {
						q.treePersons[key].gender = tp.gender;
					}
					if (tp.portrait && tp.portrait!='/images/unknown_sil.png') {
						q.treePersons[key].portrait = tp.portrait;
					}
				}
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
			questions: ['photo1','multi1','multi2','tree','timeline','map','map2','connect'],
			description: 'The Freeze hint will pause the timer for 20 seconds while you consider how to answer a problem.',
			time: 20
		},
		{
			name: "skip",
			img: "hints/skip.png",
			questions: ['photo1','multi1','multi2','tree','timeline','map','map2','connect'],
			description: 'The Skip hint will allow you to skip to the next question, but it will keep the current amount of time that you have spent on the question.'
		},
		{
			name: "rollback",
			img: "hints/rollback.png",
			questions: ['photo1','multi1','multi2','tree','timeline','map','map2','connect'],
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
	
	this.availableQuestions = [0,1,2,3,4,7];
	this.getRandomQuestion = function () {
		var q = Math.floor (Math.random () * this.availableQuestions.length);
		return angular.copy(this.questions[this.availableQuestions[q]]);
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
		B: 'Map People by Birth Place',
		C: 'Connect the tree path',
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
				
				var templateUrl = '/questions/'+$scope.question.name+'/question.html';
				QuestionService.getDeferredTemplate(templateUrl).then(function(template) {
					if (template) {
						var $t = $(template);
						var qel = $compile($t)($scope);
						$element.empty();
						$element.append(qel);
					}
				});
			}
			if ($scope.question) {
				$scope.loadQuestion();
			}
			
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
	$scope.correctAnswers = {};
	$scope.complete = false;
	
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
		if (!$scope.complete) {
			console.log("guess 1 clicked");
			if ($scope.answerPeople.length < 1) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[0])) {
				console.log("Correct!");
				$scope.complete = true;
				$scope.correctAnswers[0] = true;
				$scope.incorrectAnswers[1] = true;
				$scope.incorrectAnswers[2] = true;
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[0]) {
					$scope.incorrectAnswers[0] = true;
					$scope.correctAnswers[0] = false;
					$scope.$emit('questionIncorrect', $scope.question);
				}
			}
		}
	};
	
	$scope.guess2 = function() {
		if (!$scope.complete) {
			console.log("guess 2 clicked");
			if ($scope.answerPeople.length < 2) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[1])) {
				console.log("Correct!");
				$scope.complete = true;
				$scope.incorrectAnswers[0] = true;
				$scope.correctAnswers[1] = true;
				$scope.incorrectAnswers[2] = true;
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[1]) {
					$scope.incorrectAnswers[1] = true;
					$scope.correctAnswers[1] = false;
					$scope.$emit('questionIncorrect', $scope.question);
				}
			}
		}
	};
	
	$scope.guess3 = function() {
		if (!$scope.complete) {
			console.log("guess 3 clicked");
			if ($scope.answerPeople.length < 3) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[2])) {
				console.log("Correct!");
				$scope.complete = true;
				$scope.incorrectAnswers[1] = true;
				$scope.incorrectAnswers[0] = true;
				$scope.correctAnswers[2] = true;
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[2]) {
					$scope.incorrectAnswers[2] = true;
					$scope.correctAnswers[0] = false;
					$scope.$emit('questionIncorrect', $scope.question);
				}
			}
		}
	};
	
	$scope.guess4 = function() {
		if (!$scope.complete) {
			console.log("guess 4 clicked");
			if ($scope.answerPeople.length < 4) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[3])) {
				console.log("Correct!");
				$scope.complete = true;
				$scope.incorrectAnswers[1] = true;
				$scope.incorrectAnswers[2] = true;
				$scope.incorrectAnswers[0] = true;
				$scope.correctAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[3]) {
					$scope.incorrectAnswers[3] = true;
					$scope.correctAnswers[3] = false;
					$scope.$emit('questionIncorrect', $scope.question);
				}
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
	$scope.correctAnswers = {};
	$scope.complete = false;
	
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
			if (!$scope.complete) {
			console.log("guess 1 clicked");
			if ($scope.answerPeople.length < 1) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[0])) {
				console.log("Correct!");
				$scope.complete = true;
				$scope.correctAnswers[0] = true;
				$scope.incorrectAnswers[1] = true;
				$scope.incorrectAnswers[2] = true;
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[0]) {
					$scope.incorrectAnswers[0] = true;
					$scope.$emit('questionIncorrect', $scope.question);
				}
			}
		}
	};
	
	$scope.guess2 = function() {
		if (!$scope.complete) {
			console.log("guess 2 clicked");
			if ($scope.answerPeople.length < 2) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[1])) {
				console.log("Correct!");
				$scope.complete = true;	
				$scope.incorrectAnswers[0] = true;
				$scope.correctAnswers[1] = true;
				$scope.incorrectAnswers[2] = true;
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[1]) {
					$scope.incorrectAnswers[1] = true;
					$scope.$emit('questionIncorrect', $scope.question);
				}
			}
		}
	};
	
	$scope.guess3 = function() {
		if (!$scope.complete) {
			console.log("guess 3 clicked");
			if ($scope.answerPeople.length < 3) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[2])) {
				console.log("Correct!");
				$scope.complete = true;	
				$scope.incorrectAnswers[1] = true;
				$scope.incorrectAnswers[0] = true;
				$scope.correctAnswers[2] = true;
				$scope.incorrectAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[2]) {
					$scope.incorrectAnswers[2] = true;
					$scope.$emit('questionIncorrect', $scope.question);
				}
			}
		}
	};
	
	$scope.guess4 = function() {
		if (!$scope.complete) {
			console.log("guess 4 clicked");
			if ($scope.answerPeople.length < 4) {
				console.log("Incorrect!");
				return;
			}
			if ($scope.question.checkAnswer($scope.answerPeople[3])) {
				console.log("Correct!");
				$scope.complete = true;
				$scope.incorrectAnswers[1] = true;
				$scope.incorrectAnswers[2] = true;
				$scope.incorrectAnswers[0] = true;
				$scope.correctAnswers[3] = true;
				$scope.$emit('questionCorrect', $scope.question);
			} else {
				console.log("Incorrect!");
				if (!$scope.incorrectAnswers[3]) {
					$scope.incorrectAnswers[3] = true;
					$scope.$emit('questionIncorrect', $scope.question);
				}
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
			$scope.setup = function() {
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
			$scope.setup();

			$scope.$on('questionReset', function() {
				$scope.setup();
			});
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
					var offset = ($element.width() - ui.draggable.width()) / 2;
					ui.draggable.css('left', ($element.position().left+offset)+'px');
					if (person.display.ascendancyNumber == $attr.number) {
						person.display.inPlace = true;
						$element.droppable( "option", "disabled", true );
						ui.draggable.draggable("option", "disabled", true);
						ui.draggable.removeClass("movable");
						$element.addClass('active-tree-spot');
						$element.removeClass('inactive-tree-spot');
					} else {
						person.display.inPlace = false;
						$element.addClass('inactive-tree-spot');
						$element.removeClass('active-tree-spot');
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

			$scope.$on('questionReset', function() {
				var dropper = $element.data('dropper');
				if (dropper) {
					dropper.draggable("option", "disabled", false);
					dropper.addClass("movable");
				}
				$element.removeClass('inactive-tree-spot');
				$element.addClass('active-tree-spot');
				$element.data('dropper', null);
				$element.droppable( "option", "disabled", false );
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
	
	$scope.$watch('question.people', function() {
		$scope.setupTree();
	});

	$scope.setupTree = function() {
		$scope.portrait = window.portrait;
		if ($scope.question.people && $scope.question.people.length > 0) {
			$scope.people = [];
			var x = 49;
			var y = 110;
			var count = 0;
			var hash = {};
			$scope.spots = {
				4: {left: -15, top: 370},
				5: {left: 115, top: 370},
				6: {left: 305, top: 370},
				7: {left: 435, top: 370},
				2: {left: 50,  top: 490},
				3: {left: 370, top: 490},
				1: {left: 210, top: 550}
			};
			if ($scope.portrait) {
				x = 49;
				y = 86;
				$scope.spots = {
					4: {left: -15, top: 286},
					5: {left: 70, top: 286},
					6: {left: 198, top: 286},
					7: {left: 283, top: 286},
					2: {left: 33,  top: 370},
					3: {left: 240, top: 370},
					1: {left: 136, top: 416}
				};
				if ($(window).width() < 350) {
					x = 25;
					$scope.spots = {
						4: {left: -15, top: 255},
						5: {left: 55, top: 255},
						6: {right: 73, top: 255},
						7: {right: 3, top: 255},
						2: {left: 18,  top: 337},
						3: {right: 37, top: 337},
						1: {left: 136, top: 400}
					};
				}
			}
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
				var pos = {left: x, top: y};
				if ($scope.question.people[p].display.inPlace) {
					if ($scope.spots[$scope.question.people[p].display.ascendancyNumber]) {
						pos = $scope.spots[$scope.question.people[p].display.ascendancyNumber];
						if ($scope.portrait) pos.left += 20;
						$scope.spots[$scope.question.people[p].display.ascendancyNumber].highlight = true;
					}
				}
				$scope.people.push({person: $scope.question.people[p], position: pos});
				if ($scope.portrait) {
					x += 68;	
				} else {
					x += 105;
				}
				count++;
				if (count>3) {
					x = 49;
					if ($(window).width() < 350) x = 25;
					if ($scope.portrait) y += 72;
					else y += 110;
					count = 0;
				}
			}
			$scope.questionText = $scope.question.questionText;
		}
	};
	
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

	$scope.$on('questionReset', function() {
		$scope.setupTree();
	});
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

	$scope.portrait = window.portrait;

	$scope.timelineClass = "timeline-fact";
	
	$scope.badFacts = ["LifeSketch","Other","REFN","Residence"];
	
	$scope.$watch('question.person', function() {
		if ($scope.question.person && $scope.question.person.facts) {
			$scope.questionText = $scope.question.questionText;
			$scope.maxFacts = $scope.question.difficulty * 2;
			$scope.sortedfacts = languageService.sortFacts($scope.question.person.facts);
			$scope.facts = [];
			for(var f=0; f<$scope.sortedfacts.length; f++) {
				var found = false;
				for(var b=0; b<$scope.badFacts.length; b++) {
					if ($scope.question.difficulty < 4 && !$scope.sortedfacts[f].date) {
						found = true;
						break;
					}
					else if ($scope.sortedfacts[f].type.indexOf($scope.badFacts[b]) >= 0) {
						found = true;
						break;
					}
				}
				if (!found) $scope.facts.push($scope.sortedfacts[f]);
				if ($scope.facts.length > $scope.maxFacts) {
					break;
				}
			}
			for(var f=0; f<$scope.facts.length; f++) {
				$scope.facts[f].sortIndex = f;
			}
			$scope.facts = QuestionService.shuffleArray($scope.facts);
			if ($scope.checkTimeline()) {
				$scope.facts = QuestionService.shuffleArray($scope.facts);
			}
			if ($scope.portrait) {
				if ($(window).width() <= 350) {
					$scope.poleStyle = {height: (($scope.facts.length - 1)*70)+'px'};
				} else {
					$scope.poleStyle = {height: (($scope.facts.length - 1)*80)+'px'};
				}
			} else {
				$scope.poleStyle = {height: (($scope.facts.length - 1)*100)+'px'};
			}
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
				zIndex: 101
			})
			.data('place', $scope.place);
			
			$scope.$on('$destroy', function() {
				$($element).draggable( "destroy" );
			});
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
				accept: function(element) {
					var droppedFact = element.data('place');
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
						ui.draggable.removeClass('movable');
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
			
			$scope.$on('$destroy', function() {
				$($element).droppable( "destroy" );
			});
		}
	}
}])
.controller('mapController', function($scope, $q, QuestionService, languageService, familysearchService, NgMap) {
	$scope.questionText = '';
	
	$scope.$watch('question.questionText', function() {
		if ($scope.question.questionText) {
			$scope.questionText = $scope.question.questionText;
		}
	});
	
	$scope.$watchCollection('question.places', function() {
		if ($scope.question && $scope.question.places) {
			$scope.dynMarkers = [];
			NgMap.getMap().then(function(map) {
				$scope.map = map;
				for (var k in map.customMarkers) {
					var cm = map.customMarkers[k];
					$scope.dynMarkers.push(cm);
				}
				if ($scope.markerClusterer) {
					$scope.markerClusterer.clearMarkers();
					$scope.markerClusterer.addMarkers($scope.dynMarkers);
				} else {
					$scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {styles: [{url: '/images/map_cluster.png', gridSize: 200, width: 70, height: 41, textSize: 16}]}); 
				}
				setTimeout(function() {
					$scope.markerClusterer.fitMapToMarkers();
					google.maps.event.trigger(map, 'resize');
				}, 300);
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
	
	$scope.$on('$destroy', function() {
		if ($scope.map) {
			$scope.markerClusterer.clearMarkers();
			google.maps.event.clearInstanceListeners($scope.map);
		}
	});
})
.directive('mapPerson', ['NgMap', 'familysearchService', 'languageService', function(NgMap, familysearchService, languageService) {
	return {
		scope: {
			place: '='
		},
		template: '<div avatar-badge class="avatar ancestor-avatar" src="place.person.portrait" label="label"></div>',
		link: function($scope, $element, $attr) {
			$scope.label = "";
			if ($scope.place && $scope.place.person) {
				//-- make sure we have portrait pictures for each person					
				if (!$scope.place.person.portrait) {
					familysearchService.getPersonPortrait($scope.place.person.id).then(function(res) {
						$scope.place.portrait = res.src;
					},function(error){
						if ($scope.place.person.gender.type=="http://gedcomx.org/Female") {
							$scope.place.portrait = '/images/female_sil.png';
						} else if ($scope.place.person.gender.type=="http://gedcomx.org/Male") {
							$scope.place.portrait = '/images/male_sil.png';
						} else {
							$scope.place.portrait = '/images/unknown_sil.png';
						}
					});
				}
				
				$scope.label = $scope.place.person.display.name;
				if ($scope.place.person.display.birthDate) {
					$scope.label += ' ('+languageService.getDateYear($scope.place.person.display.birthDate)+')';
				}
			}
			$element.draggable({
				revert: "invalid", 
				zIndex: 101
			})
			.data('place', $scope.place);
			
			$scope.$on('$destroy', function() {
				$($element).draggable( "destroy" );
			});
		}
	}
}])
.directive('mapPersonHolder', [function() {
	return {
		scope: {
			place: '='
		},
		link: function($scope, $element, $attr) {
			$scope.isFull = false;
			$element.droppable({
				accept: function(element) {
					var droppedPlace = element.data('place');
					if (droppedPlace && droppedPlace.id==$scope.place.id) {
						return true;
					}
					return false;
				},
				drop: function(event, ui) {
					$scope.isFull = true;
					$($element).append(ui.draggable.detach());
					ui.draggable.css('position', 'absolute');
					ui.draggable.css('left', '-10px');
					ui.draggable.css('top', '-3px');
					ui.draggable.css('z-index', '2');
					var droppedPlace = ui.draggable.data('place');
					if (droppedPlace.id==$scope.place.id) {
						ui.draggable.addClass('inPlace');
						ui.draggable.removeClass('movable');
						droppedPlace.inPlace = true;
						$element.droppable( "option", "disabled", true );
						ui.draggable.draggable("option", "disabled", true);
					} else {
						ui.draggable.removeClass('inPlace');
						droppedPlace.inPlace = false;
					}
					$scope.$emit('checkMap');
				}
			});
			
			$scope.$on('$destroy', function() {
				$($element).droppable( "destroy" );
			});
		}
	}
}])
.controller('map2Controller', function($scope, $q, QuestionService, languageService, familysearchService, NgMap, NgMapPool) {
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
				$scope.map = map;
				for (var k in map.customMarkers) {
					var cm = map.customMarkers[k];
					$scope.dynMarkers.push(cm);
				}
				if ($scope.markerClusterer) {
					$scope.markerClusterer.clearMarkers();
					$scope.markerClusterer.addMarkers($scope.dynMarkers);
				} else {
					$scope.markerClusterer = new MarkerClusterer(map, $scope.dynMarkers, {styles: [{url: '/images/map_cluster.png', gridSize: 200, width: 100, height: 58, textSize: 16}]}); 
				}
				setTimeout(function() {
					$scope.markerClusterer.fitMapToMarkers();
					google.maps.event.trigger(map, 'resize');
				}, 300);
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
	
	$scope.$on('$destroy', function() {
		if ($scope.map) {
			$scope.markerClusterer.clearMarkers();
			google.maps.event.clearInstanceListeners($scope.map);
		}
	});
})
.controller('connectController', function($scope, QuestionService, languageService, familysearchService, relationshipService) {
	$scope.questionText = '';
	
	$scope.$watch('question.treePersons', function() {
		if ($scope.question.treePersons) {
			$scope.questionText = $scope.question.questionText;
			$scope.levels = [];	
			var level = {
				person: $scope.question.startPerson,
				ascendancyNumber: 1,
				css: 'connect-center'
			};
			$scope.question.startPerson.display.ascendancyNumber = 1;
			$scope.fillLevel(level);
			$scope.levels.push(level);
		}
	});
	$scope.fillLevel = function(level) {
		var fn = ""+(level.ascendancyNumber * 2);
		var mn = ""+(1 + (level.ascendancyNumber * 2));

		if ($scope.question.treePersons[fn]) {
			level.parent1 = $scope.question.treePersons[fn];
		}
		if ($scope.question.treePersons[mn]) {
			level.parent2 = $scope.question.treePersons[mn];
		}
	};
	
	$scope.selectLevel = function(level, parent, index) {
		if (parent) {
			if (parent.id == $scope.question.person.id) {
				$scope.complete = true;
				$scope.relationshipText = "";
				var rel = relationshipService.getRelationshipLabel($scope.levels.length, 0, $scope.question.person);
				if (rel) {
					$scope.relationshipText = $scope.question.person.display.name + " is the " 
						+ rel + " of "+$scope.question.startPerson.display.name;
				}
				//console.log('connect question complete');
				$scope.$emit('pause');
				window.setTimeout(function() {
					$scope.$emit('questionCorrect', $scope.question);
				}, 3000);
				//-- trigger css animation
				window.setTimeout(function() {
					$('.connect-correct-block').addClass("grow");
				}, 50);
			} else {
				if (index < $scope.levels.length) {
					$scope.levels = $scope.levels.slice(index);
				}
				if (parent.id == level.parent1.id) {
					level.css = 'connect-left';
				} else {
					level.css = 'connect-right';
				}
				var nextlevel = {
					person: parent,
					ascendancyNumber: parent.display.ascendancyNumber,
					css: 'connect-center'
				};
				$scope.fillLevel(nextlevel);
				$scope.levels.unshift(nextlevel);
			}
		}
	};

	$scope.$on('questionReset', function() {
		$scope.levels = [];	
		var level = {
			person: $scope.question.startPerson,
			ascendancyNumber: 1,
			css: 'connect-center'
		};
		$scope.question.startPerson.display.ascendancyNumber = 1;
		$scope.fillLevel(level);
		$scope.levels.push(level);
	});
})
;