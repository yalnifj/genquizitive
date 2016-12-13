angular.module('genquiz.familytree', ['genquizitive'])
.service('languageService', ['$filter',function($filter) {
	this.facts = {
		'http://gedcomx.org/Adoption':{ pastVerb: 'was adopted', order: 1 },
		'http://gedcomx.org/AdultChristening':{ pastVerb: 'was christened as an adult', label: 'Adult Christening', order: 5 },
		'http://gedcomx.org/Amnesty':{ pastVerb: 'was given amnesty', order: 5 },
		'http://gedcomx.org/Apprenticeship':{ pastVerb: 'served an apprenticeship', order: 4 },
		'http://gedcomx.org/Arrest':{ pastVerb: 'was arrested', order: 5 },
		'http://gedcomx.org/Baptism':{ pastVerb: 'was baptized', order: 4 },
		'http://gedcomx.org/BarMitzvah':{ pastVerb: 'had a Bar Mitzvah', order: 4 },
		'http://gedcomx.org/BatMitzvah':{ pastVerb: 'had a Bat Mitzvah', order: 4 },
		'http://gedcomx.org/Birth':{ pastVerb: 'was born', order: 0 },
		'http://gedcomx.org/Blessing':{ pastVerb: 'was blessed', order: 1 },
		'http://gedcomx.org/Burial':{ pastVerb: 'was buried', order: 10 },
		'http://gedcomx.org/Caste':{ order: 5 },
		'http://gedcomx.org/Census':{ pastVerb: 'was recorded in a census', order: 5 },
		'http://gedcomx.org/Christening':{ pastVerb: 'was christened', order: 1 },
		'http://gedcomx.org/Circumcision':{ pastVerb: 'was circumcized', order: 1 },
		'http://gedcomx.org/Clan':{ order: 5 },
		'http://gedcomx.org/Confirmation':{ pastVerb: 'had a confirmation', order:4 },
		'http://gedcomx.org/Cremation':{ pastVerb: 'was cremated', order: 11 },
		'http://gedcomx.org/Court':{ pastVerb: 'appeared in court', order: 5 },
		'http://gedcomx.org/Death':{ pastVerb: 'died', order: 8 },
		'http://gedcomx.org/Education':{ pastVerb: 'was educated', order: 5 },
		'http://gedcomx.org/EducationEnrollment':{ pastVerb: 'enrolled in an education', label: 'Education Enrollment', order: 4 },
		'http://gedcomx.org/Emigration':{ pastVerb: 'emigrated', order: 5 },
		'http://gedcomx.org/Ethnicity':{ order: 5 },
		'http://gedcomx.org/Excommunication':{ pastVerb: 'was excommunicated', order: 5 },
		'http://gedcomx.org/FirstCommunion':{ pastVerb: 'had first communion', order: 2 },
		'http://gedcomx.org/Funeral':{ pastVerb: 'had a funeral', order: 9 },
		'http://gedcomx.org/GenderChange':{ pastVerb: 'changed genders', order: 5 },
		'http://gedcomx.org/Graduation':{ pastVerb: 'graduated', order: 6 },
		'http://gedcomx.org/Immigration':{ pastVerb: 'immigrated', order: 5 },
		'http://gedcomx.org/Imprisonment':{ pastVerb: 'was imprisoned', order: 5 },
		'http://gedcomx.org/Inquest':{order: 5 },
		'http://gedcomx.org/LandTransaction':{ label: 'Land Transaction', order: 6},
		'http://gedcomx.org/Language':{ order: 5 },
		'http://gedcomx.org/Living':{ order: 5 },
		'http://gedcomx.org/MaritalStatus':{ label: 'Marital Status', order: 5 },
		'http://gedcomx.org/Medical':{ order: 5 },
		'http://gedcomx.org/MilitaryAward':{ pastVerb: 'received a military award', label: 'Military Award', order: 5 },
		'http://gedcomx.org/MilitaryDischarge':{ pastVerb: 'was discharged from the military', label: 'Military Discharge', order: 5 },
		'http://gedcomx.org/MilitaryDraftRegistration':{ pastVerb: 'was drafted into the military', label: 'Military Draft Registration', order: 5 },
		'http://gedcomx.org/MilitaryInduction':{ label: 'Military Induction', order: 5 },
		'http://gedcomx.org/MilitaryService':{ label: 'Military Service', order: 5 },
		'http://gedcomx.org/Mission':{ pastVerb: 'served a mission', order: 5 },
		'http://gedcomx.org/MoveFrom':{ pastVerb: 'moved from', label: 'Moved from', order: 5 },
		'http://gedcomx.org/MoveTo':{ pastVerb: 'moved to', label: 'Moved to', order: 5 },
		'http://gedcomx.org/MultipleBirth':{ label: 'Multiple Birth', order: 5 },
		'http://gedcomx.org/NationalId':{ label: 'National ID', order: 5 },
		'http://gedcomx.org/Nationality':{ order: 5 },
		'http://gedcomx.org/Naturalization':{ pastVerb: 'was naturalized', order: 5 },
		'http://gedcomx.org/NumberOfMarriages':{ label: 'Number of Marriages', order: 5 },
		'http://gedcomx.org/Obituary':{ pastVerb: 'appeared in an obituary', order: 10 },
		'http://gedcomx.org/Occupation':{ pastVerb: 'worked as', expectValue: true, order: 5},
		'http://gedcomx.org/Ordination':{ pastVerb: 'was ordained', order: 5 },
		'http://gedcomx.org/Pardon':{ pastVerb: 'was pardoned', order: 6 },
		'http://gedcomx.org/PhysicalDescription':{ label: 'Physical Description', order: 5 },
		'http://gedcomx.org/Probate':{ order: 5 },
		'http://gedcomx.org/Property':{ order: 6 },
		'http://gedcomx.org/Religion':{ pastVerb: 'was a', expectValue: true, order: 5 },
		'http://gedcomx.org/Residence':{ pastVerb: 'resided', order: 5 },
		'http://gedcomx.org/Retirement':{ pastVerb: 'retired', order: 7 },
		'http://gedcomx.org/Stillbirth':{ label: 'Still Birth', order: 0 },
		'http://gedcomx.org/TaxAssessment':{ label: 'Tax Assessment', order: 5 },
		'http://gedcomx.org/Will':{ order: 7 },
		'http://gedcomx.org/Visit':{ order: 5 },
		'http://gedcomx.org/Yahrzeit':{ order: 11 },
		'http://gedcomx.org/Annulment':{ order: 5 },
		'http://gedcomx.org/CommonLawMarriage':{ label: 'Common-law Marriage', order: 5 },
		'http://gedcomx.org/CivilUnion':{ pastVerb: 'entered a civil union', family: true, label: 'Civil Union', order: 5 },
		'http://gedcomx.org/Divorce':{ pastVerb: 'was divorced', family: true, order: 6 },
		'http://gedcomx.org/DivorceFiling':{ label: 'Divorce Filing', order: 6 },
		'http://gedcomx.org/DomesticPartnership':{ pastVerb: 'was in a domestic partnership', family: true, label: 'Domestic Partnership', order: 5 },
		'http://gedcomx.org/Engagement':{ pastVerb: 'was engaged', family: true, order: 4 },
		'http://gedcomx.org/Marriage':{ pastVerb: 'was married', family: true, order: 5 },
		'http://gedcomx.org/MarriageBanns':{ label: 'Marriage Banns', order: 5},
		'http://gedcomx.org/MarriageContract':{ label: 'Marriage Contract', order: 4 },
		'http://gedcomx.org/MarriageLicense':{ label: 'Marriage License', order: 4 },
		'http://gedcomx.org/MarriageNotice':{ label: 'Marriage Notice', order: 6},
		'http://gedcomx.org/NumberOfChildren':{ label: 'Number Of Children', order: 6 },
		'http://gedcomx.org/Separation':{ pastVerb: 'was separated', family: true, order: 6 }
	};
	
	this.months = {
		january: 0,
		february: 1,
		march: 2,
		april: 3,
		may: 4,
		june: 5,
		july: 6,
		august: 7,
		september: 8,
		october: 9,
		november: 10,
		december: 11,
		jan: 0,
		feb: 1,
		mar: 2,
		apr: 3,
		may: 4,
		jun: 5,
		jul: 6,
		aug: 7,
		sep: 8,
		oct: 9,
		nov: 10,
		dec: 11
	};
	this.monthShort = {
		0: 'Jan',
		1: 'Feb',
		2: 'Mar',
		3: 'Apr',
		4: 'May',
		5: 'Jun',
		6: 'Jul',
		7: 'Aug',
		8: 'Sep',
		9: 'Oct',
		10: 'Nov',
		11: 'Dec'
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
	
	this.parseDate = function(dateStr) {
		var day = null;
		var month = null;
		var year = null;
		var dateNums = dateStr.match(/\d+/g);
		if (dateNums) {
			for(var d=0; d<dateNums.length; d++) {
				if (dateNums[d].length > 0) {
					if (dateNums[d].length <=2) {
						if (!day) day = dateNums[d];
						else if (!year) year = dateNums[d];
					} else {
						if (!year) year = dateNums[d];
					}
				}
			}
		}
		var monthParts = dateStr.match(/(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/ig);
		if (monthParts) {
			for(var m=0; m<monthParts.length; m++) {
				if (!month) {
					var tm = monthParts[m].toLowerCase();
					if (this.months[tm]) month = this.months[tm];
					else {
						if (tm.length > 3) tm = tm.substring(0,3);
						if (this.months[tm]) month = this.months[tm];
					}
				}
			}
		}
		
		if (!year) return null;
		
		var date = new Date();
		date.setFullYear(year);
		if (!month) month = 0;
		date.setMonth(month);
		if (!day) day = 1;
		date.setDate(day);
		return date;
	};
	
	this.sortFacts = function(facts) {
		var datedFacts = [];
		var nonDatedFacts = [];
		for(var f=0; f<facts.length; f++) {
			var fact = facts[f];
			if (fact.date && fact.date.original) {
				var parsedDate = this.parseDate(fact.date.original);
				if (parsedDate) {
					fact.date.parsedDate = parsedDate;
					datedFacts.push(fact);
				} else {
					nonDatedFacts.push(fact);
				}
			}
			else nonDatedFacts.push(fact);
		}
		
		facts = [];
		datedFacts = $filter('orderBy')(datedFacts, function(fact) { return fact.date.parsedDate;});
		var temp=this;
		nonDatedFacts = $filter('orderBy')(nonDatedFacts, function(fact) { if (temp.facts[fact.type]) return temp.facts[fact.type].order; else return 100;});
		while(datedFacts.length > 0) {
			var df = datedFacts[0];
			if (nonDatedFacts.length==0) facts.push(datedFacts.shift());
			else {
				var nf = nonDatedFacts[0];
				var od = 100;
				var on = 100;
				if (temp.facts[df.type]) od = temp.facts[df.type].order;
				if (temp.facts[nf.type]) on = temp.facts[nf.type].order;
				if (od<=on) facts.push(datedFacts.shift());
				else facts.push(nonDatedFacts.shift());
			}
		}
		while(nonDatedFacts.length > 0) {
			facts.push(nonDatedFacts.shift());
		}
		
		return facts;
		
	};
}])
.filter('factlabel', function(languageService) {
	return function(factType) {
		if (languageService.facts[factType] && languageService.facts[factType].label) {
			return languageService.facts[factType].label;
		}
		else if (factType.indexOf("data:")==0) {
			factType = decodeURIComponent(factType);
			var label = factType.substring(5).trim();
			if (label.indexOf(",")==0) {
				label = label.substring(1);
			}
			return label;
		}
		return factType.replace("http://gedcomx.org/", "");
	}
})
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
				familysearchService.getPersonById(rel.person1.resourceId).then(function(person1) {
					if (person1.living) {
						rel.living==true;
						deferred.reject(path);
					} else {
						familysearchService.getPersonById(rel.person2.resourceId).then(function(person2) {
							if (person2.living) {
								rel.living==true;
								deferred.reject(path);
							} else {
								deferred.resolve(path);
							}
						}, function(error) {
							deferred.reject(error);
						});
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
				var pid2 = null;
				var isPerson1 = true;
				if (path[p].person1) {
					pid = path[p].person1.resourceId;
					pid2 = path[p].person2.resourceId;
				}
				else {
					isPerson1 = false;
				}
				if (pid==currentPerson.id) {
					pid = path[p].person2.resourceId;
					pid2 = path[p].person1.resourceId;
					isPerson1 = false;
				}
				var person = familysearchService.people[pid];
				var person2 = familysearchService.people[pid2];
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
				currentPerson = person;
			}
			deferred.resolve({person: currentPerson, text: pathText});
		},function(error) {
			deferred.reject(error);
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
	  //environment: 'beta',
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
			if (response && response.statusCode==200) {
				if (response.data) {
					temp.fsUser = response.data.persons[0];
					temp.people[temp.fsUser.id] = temp.fsUser;
					temp.usedPeople[temp.fsUser.id] = temp.fsUser;
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
			} else if (response && response.statusCode==401) {
				temp.fs.setAccessToken('');
				deferred.reject(response.body);
			} else {
				deferred.reject(response);
			}
		});
		return deferred.promise;
	};
	
	this.fsLogin = function() {
		this.fs.oauthRedirect();
	};
	
	this.fsLogout = function() {
		this.fs.logout();
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
	
	this.getPersonById = function(personId, useCache) {
		var deferred = $q.defer();
		var temp = this;
		if (personId) {
			if (useCache) {
				if (this.people[personId]) {
					deferred.resolve(this.people[personId]);
					return deferred.promise;
				}
			}
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
						deferred.resolve({id: personId, src: temp.people[personId].portrait});
					} else {
						deferred.resolve({id: personId, src: "fs-proxy.php?url="+encodeURIComponent(src)});
					}
				} else {
					deferred.reject(response.body);
				}
			});
		}
		
		return deferred.promise;
	};
	
	this.getPersonMemories = function(personId) {
		var deferred = $q.defer();	
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/memories?type=photo', function(response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				deferred.resolve(response.data.sourceDescriptions);
			} else {
				deferred.reject(response.body);
			}
		});
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
	
	this.markUsed = function(person) {
		this.usedPeople[person.id] = person;
	};
	
	this.clearUsed = function() {
		this.usedPeople = {};
		this.usedPeople[this.fsUser.id] = this.fsUser;
	};
}])
;