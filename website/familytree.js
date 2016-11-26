angular.module('genquiz.familytree', ['genquizitive'])
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
.service('relationshipService', ['$q', 'familysearchService', function($q, familysearchService) {

	this.checkRelationships = function(rel, lastRel) {
		if (rel.type == "http://gedcomx.org/Couple" && rel.type==lastRel.type) return false;
		if (!rel.person2 || !rel.person1) return false;
		if (rel.type == "http://gedcomx.org/ParentChild" 
				&& rel.type==lastRel.type 
				&& rel.person2.resourceId==lastRel.person2.resourceId 
				&& rel.person1.resourceId==lastRel.person1.resourceId)
			return false;
		return true;
	}

	this.processRelationships = function(deferred, relationships, personId, path, length, useLiving) {
		if (relationships.length<=0) {
			deferred.reject(path);
			return;
		}
		var r = Math.floor(Math.random() * relationships.length);
		var rel = relationships[r];
		var count = 0;
		var lastRel = path[path.length-1];
		if (lastRel) {
			//-- loop until we find a new relationship
			while(count < relationships.length && !this.checkRelationships(rel, lastRel)) {
				r++;
				if (r>=relationships.length) r=0;
				rel = relationships[r];
				count++;
			}
			if (count==relationships.length+1 || !this.checkRelationships(rel, lastRel)) {
				deferred.reject(path);
				return;
			}
		}
		relationships.splice(r, 1);
		
		path.push(rel);
		var nextPerson = rel.person1.resourceId;
		if (nextPerson == personId) {
			nextPerson = rel.person2.resourceId;
		}
		var temp = this;
		var maxPath = null;
		temp.recursivePath(nextPerson, path, length, useLiving).then(function(newpath) {
			if (!maxPath || maxPath.length < newpath.length) maxPath = newpath.slice();
			if (maxPath.length >= length) {
				deferred.resolve(maxPath);
			}
			else if (relationships.length==0) {
				deferred.reject(maxPath);
			}
			else {
				newpath.pop();
				temp.processRelationships(deferred, relationships, personId, newpath, length, useLiving);
			}
		}, function(newpath) {
			var lastRel = newpath[newpath.length-1];
			if (lastRel && lastRel.living) {
				newpath.pop();
				if (!maxPath || maxPath.length < newpath.length) maxPath = newpath.slice();
				temp.processRelationships(deferred, relationships, personId, newpath, length, useLiving);
			} else {
				if (!maxPath || maxPath.length < newpath.length) maxPath = newpath.slice();
				if (maxPath.length >= length) {
					deferred.resolve(maxPath);
				}
				else if (relationships.length==0) {
					deferred.reject(maxPath);
				}
				else {
					newpath.pop();
					temp.processRelationships(deferred, relationships, personId, newpath, length, useLiving);
				}
			}
		});
	}

	this.recursivePath = function(personId, path, length, useLiving) {
		var pathstr = "[";
		for(var p=0; p<path.length; p++) pathstr += path[p].person1.resourceId+"="+path[p].type.substring(19)+"="+path[p].person2.resourceId+" -> ";
		pathstr += "]";
		console.log("recursivePath: "+personId+" "+length+" "+pathstr);
		var deferred = $q.defer();
		if (path.length >= length) {
			if (!useLiving) {
				var rel = path[path.length-1];
				var nextPerson = rel.person1.resourceId;
				if (nextPerson == personId) {
					nextPerson = rel.person2.resourceId;
				}
				familysearchService.getPersonById(nextPerson).then(function(person) {
					if (person.living) {
						rel.living==true;
						deferred.reject(path);
					} else {
						deferred.resolve(path);
					}
				}, function(error) {
					deferred.reject(error);
				});
			} else {
				deferred.resolve(path);
			}
		} else {
			var temp = this;
			
			var promise;
			promise = familysearchService.getPersonRelationships(personId);
			promise.then(function(relationships) {
				temp.processRelationships(deferred, relationships, personId, path, length, useLiving);
			}, function(error) { 
				familysearchService.getPersonParents(personId, true).then(function(relationships) {
					temp.processRelationships(deferred, relationships, personId, path, length, useLiving);
				}, function(error) {
					deferred.reject(path);
				});
			});
		}
		return deferred.promise;
	};

	this.getRandomRelationshipPath = function(personId, length, useLiving) {
		var path = [];
		var deferred = $q.defer();
		
		this.recursivePath(personId, path, length, useLiving).then(function(path) {
			deferred.resolve(path);
		}, function(path) { 
			deferred.resolve(path); 
		});
		
		return deferred.promise;
	};
	
	this.verbalizePath = function(startPerson, path) {
		var deferred = $q.defer();
		var pathText = '';
		
		var pids = {};
		var pidstr = '';
		var lastId = startPerson.id;
		for(var p=0; p<path.length; p++) {
			if (path[p].person1) pids[path[p].person1.resourceId] = true;
			if (path[p].person2) pids[path[p].person2.resourceId] = true;
		}
		var keys = Object.keys(pids);
		for(var o=0; o<keys.length; o++) {
			pidstr += keys[o]+",";
		}
		familysearchService.getPeopleById(pidstr).then(function(people) {
			var currentPerson = startPerson;
			for(var p=0; p<path.length; p++) {
				var pid = null;
				var isPerson1 = true;
				if (path[p].person1) pid = path[p].person1.resourceId;
				else isPerson1 = false;
				if (pid==currentPerson.id) {
					pid = path[p].person2.resourceId;
					isPerson1 = false;
				}
				var person = familysearchService.people[pid];
				if (path[p].type=="http://gedcomx.org/ParentChild") {
					if (isPerson1) {
						if (person.gender.type=="http://gedcomx.org/Male") {
							pathText += "father";
						} else {
							pathText += "mother";
						}
					} else {
						if (person.gender.type=="http://gedcomx.org/Male") {
							pathText += "son";
						} else {
							pathText += "daughter";
						}
					}
				} else if (path[p].type=="http://gedcomx.org/Couple") {
					if (person.gender.type=="http://gedcomx.org/Male") {
						pathText += "husband";
					} else {
						pathText += "wife";
					}
				} else {
					if (person.gender.type=="http://gedcomx.org/Male") {
						pathText += "brother";
					} else {
						pathText += "sister";
					}
				}
				if (p < path.length-1) pathText += "'s ";
			}
			deferred.resolve(pathText);
		});
		return deferred.promise;
	};
}])
.service('familysearchService', ['$q','$cookies', '$interval', '$http', '$sce', '$filter', function($q, $cookies, $interval, $http, $sce, $filter) {
	this.fsUser = null;
	
	this.people = {};
	this.portraitPeople = {};
	this.usedPeople = {};
	this.backgroundQueue = [];
	
	this.fs = new FamilySearch({
	  //environment: 'production',
	  environment: 'integration',
	  appKey: 'a02j000000JERmSAAX',
	  redirectUri: 'https://www.genquizitive.com/fs-login.html',
	  saveAccessToken: true,
	  tokenCookie: 'FS_AUTH_TOKEN',
	  maxThrottledRetries: 10
	});

	if (!this.fs.getAccessToken()) {
		var token = $cookies.get(this.fs.tokenCookie);
		if (token) {
			alert('set access token from cookie');
			this.fs.setAccessToken(token);
		} else {
			$.get('/fs-proxy.php?getToken=true', function(data){
				if (data) {
					token = data.trim();
					alert('set access token from session '+token);
					this.fs.setAccessToken(token);
				}
			});
		}
	}
	
	this.fsLoginStatus = function() {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/current-person', { headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache'}}, function(response){
			if (response.statusCode==200) {
				if (response.data) {
					temp.fsUser = response.data.persons[0];
					temp.people[temp.fsUser.id] = temp.fsUser;
					temp.usedPeople[temp.fsUser.id] = true;
					temp.getAncestorTree(temp.fsUser.id, 8, true).then(function(data) {
						var count = 0;
						angular.forEach(data.persons.reverse(), function(person) {
							if (count < data.persons.length/2) {
								temp.backgroundQueue.push(function(){ temp.getDescendancyTree(person.id, 2, true); });
							}
							count++;
						});
					});
					temp.getPersonPortrait(temp.fsUser.id);
					temp.getPersonSpouses(temp.fsUser.id).then(function(spouses) {
						if (spouses) {
							angular.forEach(spouses, function(spouse) {
								temp.backgroundQueue.push(function(){ temp.getAncestorTree(spouse.id, 6, true); });
							});
						}
					});
					temp.startBackgroundQueue();
					var token = $cookies.get(temp.fs.tokenCookie);
					$.post('/fs-proxy.php', {'FS_AUTH_TOKEN': token});
					deferred.resolve(temp.fsUser);
				} else {
					//-- retry in 1 second
					/*
					window.setTimeout(function() {
						alert('trying again');
						temp.fsLoginStatus().then(function(r) { deferred.resolve(r);}, function(r) {deferred.reject(r);});
					}, 1000);
					*/
					deferred.reject('no content');
				}
			} else if (response.statusCode==401) {
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
		}, 1000);
	};
	
	this.stopBackgroundQueue = function() {
		if (this.interval) {
			$interval.cancel(this.interval);
		}
		this.interval = null;
	};

	this.getAncestorTree = function(personId, generations, details, spouse, noCache) {
		var deferred = $q.defer();
		if (generations>8) generations = 8;
		var temp = this;
		var url = '/platform/tree/ancestry?person='+personId+'&generations='+generations;
		if (spouse) url += '&spouse='+spouse;
		if (details) url += '&personDetails='
		this.fs.get(url, function(response) {
			if (!noCache) {
				angular.forEach(response.data.persons, function(person) {
					if (details && !temp.people[person.id]) {
						temp.people[person.id] = person;
						temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
					}
				});
			}
			deferred.resolve(response.data);
		});
		return deferred.promise;
	};
	
	this.getDescendancyTree = function(personId, generations, details, spouse, noCache) {
		var deferred = $q.defer();
		var temp = this;
		if (generations>2) generations = 2;
		var url = '/platform/tree/descendancy?person='+personId+'&generations='+generations;
		if (spouse) url += '&spouse='+spouse;
		if (details) url += '&personDetails='
		this.fs.get(url, function(response) {
			if (!noCache) {
				angular.forEach(response.data.persons, function(person) {
					if (details && !temp.people[person.id]) {
						temp.people[person.id] = person;
						temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
					}
				});
			}
			deferred.resolve(response.data);
		});
		return deferred.promise;
	};
	
	this.getPersonById = function(personId) {
		var deferred = $q.defer();
		var temp = this;
		if (personId) {
			//TODO - check cache and download time
			this.fs.get('/platform/tree/persons/'+personId, function(response) {
				for(var p=0; p < response.data.persons.length; p++) {
					var person = response.data.persons[p];
					temp.people[person.id] = person;
					temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
				}
				deferred.resolve(temp.people[personId]);
			});
		} else {
			deferred.reject('invalid personId '+personId);
		}
		return deferred.promise;
	};
	
	this.getLocalPersonById = function(personId) {
		if (this.people[personId]) {
			return this.people[personId];
		}
		return null;
	};

	this.getPeopleById = function(ids) {
		var deferred = $q.defer();
		var temp = this;
		if (ids) {
			this.fs.get('/platform/tree/persons?pids='+ids, function(response) {
				var people = [];
				for(var p=0; p < response.data.persons.length; p++) {
					var person = response.data.persons[p];
					if (temp.people[person.id] && temp.people[person.id].portrait) {
						person.portrait = temp.people[person.id].portrait
					} else {
						temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
					}
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
			if (response.statusCode!=200 || !response.data) {
				deferred.reject(response);
				return;
			}
			if (temp.people[personId] && response.data.relationships) {
				var rels = [];
				for(var r=0; r<response.data.relationships.length; r++) {
					var rel = response.data.relationships[r];
					//-- include include relationships where personId is a member
					if (rel.person1.resourceId==personId || rel.person2.resourceId==personId) {
						rels.push(rel);
					}
				}
				if (temp.people[personId]) temp.people[personId].relationships = rels;
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

	this.getPersonRelationships = function(personId) {
		var deferred = $q.defer();
		if (this.people[personId] && this.people[personId].relationships) {
			deferred.resolve(this.people[personId].relationships);
		} else {
			var temp = this;
			this.fs.get('/platform/tree/persons/'+personId+'/families', function(response) {
				if (response.statusCode!=200 || !response.data) {
					deferred.reject(response);
					return;
				}
				var rels = [];
				for(var r=0; r<response.data.relationships.length; r++) {
					var rel = response.data.relationships[r];
					//-- include include relationships where personId is a member
					if (rel.person1.resourceId==personId || rel.person2.resourceId==personId) {
						rels.push(rel);
					}
				}
				if (temp.people[personId]) temp.people[personId].relationships = rels;
				deferred.resolve(rels);
			});
		}
		return deferred.promise;
	};
	
	this.getPersonParents = function(personId, relationships, marriageRelationships) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/parents', function(response) {
			if (response.statusCode!=200 || !response.data) {
				deferred.reject(response);
				return;
			}
			for(var p=0; p < response.data.persons.length; p++) {
				var person = response.data.persons[p];
				if (temp.people[person.id] && temp.people[person.id].portrait) {
					person.portrait = temp.people[person.id].portrait
				} else {
					temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
				}
				temp.people[person.id] = person;
			}
			if (relationships) {
				if (!marriageRelationships) {
					var rels = [];
					for(var r=0; r<response.data.relationships.length; r++) {
						if (response.data.relationships[r].type != 'http://gedcomx.org/Couple') {
							rels.push(response.data.relationships[r]);
						}
					}
					deferred.resolve(rels);
				} else {
					deferred.resolve(response.data.relationships);
				}
			} else {
				deferred.resolve(response.data.persons);
			}
		});
		return deferred.promise;
	};
	
	this.getPersonSpouses = function(personId, relationships) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/spouses', function(response) {
			if (response.statusCode!=200 || !response.data) {
				deferred.reject(response);
				return;
			}
			for(var p=0; p < response.data.persons.length; p++) {
				var person = response.data.persons[p];
				if (temp.people[person.id] && temp.people[person.id].portrait) {
					person.portrait = temp.people[person.id].portrait
				} else {
					temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
				}
				temp.people[person.id] = person;
			}
			if (relationships) {
				deferred.resolve(response.data.relationships);
			} else {
				deferred.resolve(response.data.persons);
			}
		});
		return deferred.promise;
	};
	
	this.getPersonPortrait = function(personId) {
		var deferred = $q.defer();
		if (this.people[personId] && this.people[personId].portrait) {
			deferred.resolve({id: personId, src: this.people[personId].portrait});
		} else {		
			var temp = this;
			this.fs.get('/platform/tree/persons/'+personId+'/portrait', {headers: {'X-Expect-Override':'200-ok'}}, function(response) {
				if (response.statusCode==200 || response.statusCode == 307) {
					var src = response.effectiveUrl;
					if (temp.people[personId]) {
						temp.people[personId].portrait = "fs-proxy.php?url="+encodeURIComponent(src);
						temp.portraitPeople[personId] = true;
					}
					deferred.resolve({id: personId, src: temp.people[personId].portrait});
				} else {
					deferred.reject(response.body);
				}
			});
		}
		
		return deferred.promise;
	};
	
	this.getRandomPersonWithPortrait = function(useLiving) {
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
					if (!useLiving && this.people[person] && this.people[person].living) {
						person = null;
					}
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
					if (!useLiving && this.people[person] && this.people[person].living) {
						person = null;
					}
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
	
	this.getRandomPerson = function(useLiving) {
		var keys = Object.keys(this.people);
		if (keys.length > 0) {
			var count = 0;
			var person = null;
			while(count < 5 && person == null) {
				var rand = Math.floor(Math.random() * keys.length);
				var randomId = keys[rand];
				if (!this.usedPeople[randomId]) {
					person = randomId;
					if (!useLiving && this.people[person] && this.people[person].living) {
						person = null;
					}
				}
			}
			if (person != null) {
				return this.people[person];
			}
		}
		return null;
	};
	
	this.arrayContainsPerson = function(array, person) {
		if (!array || !person || array.length==0) return false;
		for (var p=0; p<array.length; p++) {
			if (array[p].id==person.id) return true;
		}
		return false;
	};

	this.getRandomPeopleNear = function(person, num, useLiving) {
		var deferred = $q.defer();
		var persons = [];
		var temp = this;
		this.getPersonRelatives(person.id).then(function(relatives) {
			var personCount = 0;
			var loopCount = 0;
			while(loopCount < num-1) {
				var rand = Math.floor(Math.random() * relatives.length);
				var rPerson = relatives[rand];
				if (rPerson.id != person.id && rPerson.gender && rPerson.gender.type == person.gender.type && !temp.arrayContainsPerson(persons, rPerson) && (useLiving || !rPerson.living)) {
					persons.push(rPerson);
					personCount++;
				}
				loopCount++;
			}
			
			while(personCount < num && loopCount < num * 4) {
				var rPerson = temp.getRandomPerson(useLiving);
				if (rPerson && rPerson.id != person.id && rPerson.gender && rPerson.gender.type == person.gender.type && !temp.arrayContainsPerson(persons, rPerson) && (useLiving || !rPerson.living)) {
					persons.push(rPerson);
					personCount++;
				}
				loopCount++;
			}
			deferred.resolve(persons);
		}, function(error) {
			var keys = Object.keys(temp.people);
			if (keys.length > 0) {
				var count = 0;
				while(count < num) {
					var rand = Math.floor(Math.random() * keys.length);
					var randomId = keys[rand];
					var rPerson = temp.people[randomId];
					if (randomId != person.id && rPerson.gender && rPerson.gender.type == person.gender.type && !temp.arrayContainsPerson(persons, rPerson) && (useLiving || !rPerson.living)) {
						persons.push(temp.people[randomId]);
						count++;
					}
				}
				deferred.resolve(persons);
			} else {
				deferred.reject(error);
			}
		});
		return deferred.promise;
	};
}])
;