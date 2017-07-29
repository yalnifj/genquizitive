angular.module('genquiz.familytree', [])
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
		'data:,census':{ pastVerb: 'was recorded in a census', order: 5, label: 'Census' },
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
		'http://gedcomx.org/Separation':{ pastVerb: 'was separated', family: true, order: 6 },
		'http://familysearch.org/v1/TribeName':{ label: 'Tribe', order: 6 }
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
	
	this.getOrdinalAbbr = function(num) {
		if (num==1) return "st";
		if (num==2) return "nd";
		if (num==3) return "rd";
		if (num>3 && num<=20) return "th";
		return "";
	};

	this.shortenName = function(name) {
		var arr = name.split(" ");
		var shortName = arr[0];
		if (arr.length > 1) {
			var last = arr[arr.length-1];
			var check = last.toLowerCase();
			if (check.indexOf("jr") >=0 || check.indexOf("sr") >= 0) {
				last = arr[arr.length-2];
			}
			shortName = shortName + " " + last.substr(0,1);
		}
		return shortName;
	};

	this.fitName = function(name, length) {
		if (!name || name.length <= length) {
			return name;
		}
		var arr = name.split(" ");
		var shortName = arr[0];
		if (arr.length > 1) {
			var last = arr[arr.length-1];
			var check = last.toLowerCase();
			if (check.indexOf("jr") >=0 || check.indexOf("sr") >= 0) {
				last = arr[arr.length-2];
			}
			var temp = shortName + " " + last;
			if (temp.length < length) {
				var middle = "";
				for(var i=1; i<arr.length-1; i++) {
					var mid = arr[i];
					if (mid != last) {
						if (temp.length + middle.length + mid.length < length) {
							middle += " " + mid;
							temp = shortName + middle + " " + last;
						} else if (temp.length + middle.length + 2 < length) {
							middle += " " + mid.substr(0,1);
							temp = shortName + middle + " " + last;
						} else {
							break;
						}
					}
				}
			}
			shortName = temp;
		}
		return shortName;
	};

	this.getDateYear = function(date) {
		var yearPatt = new RegExp(/\d\d\d\d/);
		var year = yearPatt.exec(date);
		if (year && year.length > 0) {
			return year[0];
		}
		return "";
	};
	
	this.parseDate = function(dateStr) {
		var day = null;
		var month = null;
		var year = null;
		var isymd = /(\d\d\d\d)(\d\d)(\d\d)/.exec(dateStr);
		if (isymd) {
			year = isymd[1];
			month = isymd[2] - 1;
			day = isymd[3];
		} else {
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
		if (!facts) {
			return [];
		}
		var temp = this;
		facts = $filter('orderBy')(facts, function(fact) { if (temp.facts[fact.type]) return temp.facts[fact.type].order; else return 100;});
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
		if (!factType) return "";
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
		} else if (factType.indexOf("http://familysearch.org/v1/")>=0) {
			return factType.replace("http://familysearch.org/v1/", "");
		}
		return factType.replace("http://gedcomx.org/", "");
	}
})
.filter('valueSizeFilter', function() {
	return function(value) {
		var val = value;
		if (val && val.length && val.length > 200) {
			val = val.substr(0, 200)+'...';
		}
		return val;
	}
})
.service('relationshipService', ['$q', 'familysearchService', 'languageService', function($q, familysearchService, languageService) {

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

	this.processRelationships = function(deferred, relationships, personId, path, length, useLiving, relationshipType) {
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
		temp.recursivePath(nextPerson, path, length, useLiving, relationshipType).then(function(newpath) {
			if (!maxPath || maxPath.length < newpath.length) maxPath = newpath.slice();
			if (maxPath.length >= length) {
				deferred.resolve(maxPath);
			}
			else if (relationships.length==0) {
				deferred.reject(maxPath);
			}
			else {
				newpath.pop();
				temp.processRelationships(deferred, relationships, personId, newpath, length, useLiving, relationshipType);
			}
		}, function(newpath) {
			var lastRel = newpath[newpath.length-1];
			if (lastRel && lastRel.living) {
				newpath.pop();
				if (!maxPath || maxPath.length < newpath.length) maxPath = newpath.slice();
				temp.processRelationships(deferred, relationships, personId, newpath, length, useLiving, relationshipType);
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
					temp.processRelationships(deferred, relationships, personId, newpath, length, useLiving, relationshipType);
				}
			}
		});
	}

	this.recursivePath = function(personId, path, length, useLiving, relationshipType) {
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
						rel.living=true;
						deferred.reject(path);
					} else {
						familysearchService.getPersonById(rel.person2.resourceId).then(function(person2) {
							if (person2.living) {
								rel.living=true;
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
			if (relationshipType=='parents') {
				promise = familysearchService.getPersonParents(personId, true);
			} else if (relationshipType=='children') {
				promise = familysearchService.getPersonChildrenRelationships(personId);
			} else {
				promise = familysearchService.getPersonRelationships(personId);
			}
			promise.then(function(relationships) {
				temp.processRelationships(deferred, relationships, personId, path, length, useLiving, relationshipType);
			}, function(error) { 
				familysearchService.getPersonParents(personId, true).then(function(relationships) {
					temp.processRelationships(deferred, relationships, personId, path, length, useLiving, relationshipType);
				}, function(error) {
					deferred.reject(path);
				});
			});
		}
		return deferred.promise;
	};

	this.getRandomRelationshipPath = function(personId, length, useLiving, relationshipType) {
		var path = [];
		var deferred = $q.defer();
		
		if (!relationshipType) {
			relationshipType = 'all';
		}
		if (relationshipType != 'all' && relationshipType != 'parents' && relationshipType != 'children') {
			relationshipType = 'all';
		}
		this.recursivePath(personId, path, length, useLiving, relationshipType).then(function(path) {
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
	
	this.getAscendancyPath = function(ahnen, ascendancyNumber) {
		var a = ascendancyNumber;
		if (a>1) {
			var path = [ahnen[a]];
			a = Math.floor(a / 2);
			while(a > 1) {
				path.push(ahnen[a]);
				a = Math.floor(a / 2);
			}
		}
		path.push(ahnen[1]);
		return path;
	};
	
	this.relationshipMatrix = [
		[
			{M:"You", F:"You"},
			{M:"Son", F:"Daughter"},
			{M:"Grandson", F:"Granddaughter"},
			{M:"Great Grandson", F:"Great Granddaughter", prefix: function(up, down) { if (down>3) return (down-2)+languageService.getOrdinalAbbr(down-2); return "";} }
		],
		[
			{M:"Father", F:"Mother"},
			{M:"Brother", F:"Sister"},
			{M:"Nephew", F:"Niece"},
			{M:"Grand Nephew", F:"Grand Niece"},
			{M:"Great Grand Nephew", F:"Great Grand Niece", prefix: function(up, down) { if (down>4) return (down-3)+languageService.getOrdinalAbbr(down-3); return "";} }
		],
		[
			{M:"Grandfather", F:"Grandmother"},
			{M:"Uncle", F:"Aunt"},
			{M:"1st Cousin", F:"1st Cousin", suffix: function(up, down) { if (down > 2) return (down-2)+" removed"; return ""; } }
		],
		[
			{M:"Great Grandfather", F:"Great Grandmother"},
			{M:"Great Uncle", F:"Great Aunt"},
			{M:"2nd Cousin 1 removed", F:"2nd Cousin 1 removed", suffix: function(up, down) { if (down > 2) return (down-2)+" removed"; return ""; } },
			{M:"2nd Cousin", F:"2nd Cousin", suffix: function(up, down) { if (down > 3) return (down-3)+" removed"; return ""; } }
		],
		[
			{M:"Great Grandfather", F:"Great Grandmother", prefix: function(up, down) { if (up>3) return (up-2)+languageService.getOrdinalAbbr(up-2); return "";} },
			{M:"Great Uncle", F:"Great Aunt", prefix: function(up, down) { if (up>3) return (up-3)+languageService.getOrdinalAbbr(up-3); return "";} },
			{M:"Cousin", F:"Cousin", 
				prefix: function(up, down) { if (up>3) return (up-1)+languageService.getOrdinalAbbr(up-3); return "";} , 
				suffix: function(up, down) { if (down != up) return Math.abs(down-up)+" removed"; return ""; } 
			}
		]
	];
	
	this.getRelationshipLabel = function(up, down, person) {
		var code = "F";
		if (person.gender.type=="http://gedcomx.org/Male") {
			code = "M";
		}
		
		var u = up;
		if (u > this.relationshipMatrix.length-1) u = this.relationshipMatrix.length-1;
		
		var relUp = this.relationshipMatrix[u];
		if (relUp) {
			var d = down;
			if (d > relUp.length-1) d = relUp.length-1;
			
			var relDown = relUp[d];
			if (relDown) {
				var relationship = "";
				if (relDown.prefix) relationship = relDown.prefix(up, down)+" ";
				relationship += relDown[code];
				if (relDown.suffix) relationship += " "+relDown.suffix(up, down);
				return relationship;
			}
		}
		
		return "";
	};
	
	this.getRelationship = function(personId1, personId2) {
		var deferred = $q.defer();
		
		var result = {path1: [], path2: [], relationship: "" };
		if (personId1==personId2) {
			familysearchService.getPersonById(personId1).then(function(person) {
				result.path1.push(person);
				result.path2.push(person);
				result.relationship="You";
				deferred.resolve(result);
			});
			return deferred.promise;
		}
		var treePeople1 = [];
		var treePeople2 = [];
		var temp = this;
		var promise1 = familysearchService.getAncestorTree(personId1, 8).then(function(data) {
			treePeople1 = data.persons;
			var hash = {};
			var ahnen1 = {};
			var ahnen2 = {};
			for(var p=0; p<treePeople1.length; p++) {
				hash[treePeople1[p].id] = treePeople1[p];
				ahnen1[treePeople1[p].display.ascendancyNumber] = treePeople1[p];
			}
			
			if (hash[personId2]) {
				if (hash[personId2].display.ascendancyNumber.indexOf("S")>0) {
					result.path1.push(hash[personId1]);
					result.path2.push(hash[personId2]);
					result.relationship="Wife";
					if (hash[personId2].gender.type=="http://gedcomx.org/Male") {
						result.relationship="Husband";
					}
					deferred.resolve(result);
					return;
				} else {
					var path1 = temp.getAscendancyPath(ahnen1, hash[personId2].display.ascendancyNumber);
					result.path1 = path1;
					result.relationship = temp.getRelationshipLabel(path1.length-1, 0, hash[personId2]);
					deferred.resolve(result);
					return;
				}
			}
			
			var promise2 = familysearchService.getAncestorTree(personId2, 8).then(function(data) {
				treePeople2 = data.persons;
				for(var p=0; p<treePeople2.length; p++) {
					ahnen2[treePeople2[p].display.ascendancyNumber] = treePeople2[p];
					if (hash[treePeople2[p].id]) {
						var commonAncestor1 = hash[treePeople2[p].id];
						var commonAncestor2 = treePeople2[p];
						var path1 = temp.getAscendancyPath(ahnen1, commonAncestor1.display.ascendancyNumber);
						var path2 = temp.getAscendancyPath(ahnen2, commonAncestor2.display.ascendancyNumber);

						result.path1 = path1;
						result.path2 = path2;
						result.relationship = temp.getRelationshipLabel(path1.length-1, path2.length-1, commonAncestor2);
						
						deferred.resolve(result);
						return;
					}
				}
				
				deferred.reject('no relationship');
			});
		});
		
		return deferred.promise;
	};
}])
.service('familysearchService', ['$q','$cookies', '$interval', '$http', '$sce', '$filter', function($q, $cookies, $interval, $http, $sce, $filter) {
	this.fsUser = null;
	this.currentUser = null;
	
	this.people = {};
	this.portraitPeople = {};
	this.usedPeople = {};
	this.backgroundQueue = [];
	
	this.fs = new FamilySearch({
	  environment: 'production',
	  //environment: 'beta',
	  //environment: 'integration',
	  appKey: 'a02j000000JERmSAAX',
	  redirectUri: FS_REDIRECT_URL,
	  saveAccessToken: true,
	  tokenCookie: 'FS_AUTH_TOKEN',
	  maxThrottledRetries: 10
	});

	if (!this.fs.getAccessToken()) {
		var token = $cookies.get(this.fs.tokenCookie);
		if (token) {
			console.log('set access token from cookie');
			this.fs.setAccessToken(token);
		} else {
			var familysearchService = this;
			/*
			$.get('/fs-proxy.php?getToken=true', function(data){
				if (data) {
					token = data.trim();
					console.log('set access token from session '+token);
					familysearchService.fs.setAccessToken(token);
				}
			});
			*/
		}
	}
	
	this.fsLoginStatus = function() {
		var deferred = $q.defer();
		var temp = this;
		if (!this.fs.getAccessToken()) {
			deferred.reject("Not authenticated");
		} else {
			this.fs.get('/platform/users/current', function(error, response) {
				if (response && (response.statusCode==200 || response.statusCode == 307)) {
					if (response.data && response.data.users) {
						temp.currentUser = response.data.users[0];
						temp.getPersonById(temp.currentUser.personId).then(function(person) {
							temp.fsUser = person;
							temp.startBackgroundQueue();
							var token = $cookies.get(temp.fs.tokenCookie);
							$.post('/fs-proxy.php', {'FS_AUTH_TOKEN': token});
							deferred.resolve(temp.fsUser);
						}, function(error) {
							deferred.reject("Unable to read your main person data from your family tree.  Please try again later.");
						});
					} else {
						deferred.reject(response.body);
					}
				} else if (response && response.statusCode==401) {
					temp.fs.setAccessToken('');
					deferred.reject(response.data);
					return;
				} else {
					deferred.reject(response);
					return;
				}
			});
		}
		return deferred.promise;
	};
	
	this.loadInitialData = function(personId, generations, descendants) {
		var temp = this;
		temp.getAncestorTree(personId, generations, true).then(function(data) {
			angular.forEach(data.persons, function(person) {
				if (descendants && person.display.ascendancyNumber <= 5 ) {
					temp.backgroundQueue.push(function(){ temp.getDescendancyTree(person.id, descendants, true); });
				}
			});
			
			temp.getPersonSpouses(personId).then(function(spouses) {
			if (spouses) {
				if (Object.keys(temp.people).length < generations * 4) {
					angular.forEach(spouses, function(spouse) {
						temp.backgroundQueue.push(function(){ temp.getAncestorTree(spouse.id, generations, true); });
					});
				}
			}
		});
		});
		temp.getPersonPortrait(personId);
	};

	this.clearCache = function() {
		this.people = {};
		this.portraitPeople = {};
		this.usedPeople = {};
		this.backgroundQueue = [];
	};
	
	this.fsLogin = function() {
		this.fs.oauthRedirect();
	};
	
	this.fsLogout = function() {
		this.currentUser = null;
		this.fsUser = null;
		this.fs.deleteAccessToken();
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
		this.fs.get(url, function(error, response) {
			if (details && !noCache) {
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
		this.fs.get(url, function(error, response) {
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
	
	this.search = function(start, count, searchParams, exact) {
		var deferred = $q.defer();
		var temp = this;
		var url = '/platform/tree/search?start='+start+'&count='+count+'&q=';
		var q = '';
		var i = 0;
		angular.forEach(searchParams, function(value, key) {
			if (i>0) q += '+';
			q += key + ':' + encodeURIComponent(value);
			if (!exact || key!='gender') q += '~';
			i++;
		});
		this.fs.get(url+q, { headers: { Accept: 'application/x-gedcomx-atom+json' } }, function(error, response) {
			if (response.statusCode>=300 || !response.data) {
				deferred.reject(response);
				return;
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
			this.fs.get('/platform/tree/persons/'+personId, function(error, response) {
				if (response && response.data && response.data.persons) {
					for(var p=0; p < response.data.persons.length; p++) {
						var person = response.data.persons[p];
						temp.people[person.id] = person;
						temp.backgroundQueue.push(function(){temp.getPersonPortrait(person.id)});
					}
					deferred.resolve(temp.people[personId]);
				} else {
					deferred.reject(response);
				}
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
			this.fs.get('/platform/tree/persons?pids='+ids, function(error, response) {
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
		this.fs.get('/platform/tree/persons/'+personId+'/families', function(error, response) {
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
			this.fs.get('/platform/tree/persons/'+personId+'/families', function(error, response) {
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
		this.fs.get('/platform/tree/persons/'+personId+'/parents', function(error, response) {
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
		this.fs.get('/platform/tree/persons/'+personId+'/spouses', function(error, response) {
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
	
	this.getPersonChildrenRelationships = function(personId) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/children', function(error, response) {
			if (response.statusCode!=200 || !response.data) {
				deferred.reject(response);
				return;
			}
			deferred.resolve(response.data.relationships);
		});
		return deferred.promise;
	};
	
	this.getPersonPortrait = function(personId) {
		var deferred = $q.defer();
		if (this.people[personId] && this.people[personId].portrait) {
			deferred.resolve({id: personId, src: this.people[personId].portrait});
		} else {		
			var temp = this;
			this.fs.get('/platform/tree/persons/'+personId+'/portrait', {headers: {'X-Expect-Override':'200-ok'}}, function(error, response) {
				if (response.statusCode==200 || response.statusCode == 307) {
					var src = response.headers.location;
					if (temp.people[personId]) {
						temp.people[personId].portrait = "/fs-proxy.php?url="+encodeURIComponent(src);
						temp.portraitPeople[personId] = true;
						deferred.resolve({id: personId, src: temp.people[personId].portrait});
					} else {
						deferred.resolve({id: personId, src: "/fs-proxy.php?url="+encodeURIComponent(src)});
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
		this.fs.get('/platform/tree/persons/'+personId+'/memories?type=photo', function(error, response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				deferred.resolve(response.data.sourceDescriptions);
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.difficultyLevels = [8, 16, 32, 64, 128];
	this.getRandomPersonWithPortrait = function(useLiving, difficulty) {
		var deferred = $q.defer();
		var keys = Object.keys(this.portraitPeople);
		if (keys.length > 0) {
			var count = 0;
			var person = null;
			var max = keys.length;
			if (difficulty < 5) {
				if (max > this.difficultyLevels[difficulty]) max = this.difficultyLevels[difficulty];
			}
			while(count < 5 && person == null) {
				var rand = Math.floor(Math.random() * max);
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
			var keys = Object.keys(this.people);
			var max = keys.length;
			if (difficulty < 5) {
				if (max > this.difficultyLevels[difficulty]) max = this.difficultyLevels[difficulty];
			}
			while(count < 5 && person == null) {
				var rand = Math.floor(Math.random() * max);
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
	
	this.getRandomPerson = function(useLiving, difficulty) {
		var keys = Object.keys(this.people);
		if (keys.length > 0) {
			var count = 0;
			var person = null;
			var max = keys.length;
			if (difficulty < 5) {
				if (max > this.difficultyLevels[difficulty]) max = this.difficultyLevels[difficulty];
			}
			while(count < 5 && person == null) {
				var rand = Math.floor(Math.random() * max);
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

	this.getRandomPeopleNear = function(person, num, useLiving, ignoreGender) {
		var deferred = $q.defer();
		var persons = [];
		var temp = this;
		this.getPersonRelatives(person.id).then(function(relatives) {
			var personCount = 0;
			var loopCount = 0;
			if (num<=0) num = relatives.length;
			while(loopCount < num-1) {
				var rand = Math.floor(Math.random() * relatives.length);
				var rPerson = relatives[rand];
				if (rPerson.id != person.id && rPerson.gender && (ignoreGender || rPerson.gender.type == person.gender.type) && !temp.arrayContainsPerson(persons, rPerson) && (useLiving || !rPerson.living)) {
					persons.push(rPerson);
					personCount++;
				}
				loopCount++;
			}
			
			while(personCount < num && loopCount < num * 4) {
				var rPerson = temp.getRandomPerson(useLiving);
				if (rPerson && rPerson.id != person.id && rPerson.gender && (ignoreGender || rPerson.gender.type == person.gender.type) && !temp.arrayContainsPerson(persons, rPerson) && (useLiving || !rPerson.living)) {
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
					if (randomId != person.id && rPerson.gender && (ignoreGender || rPerson.gender.type == person.gender.type) && !temp.arrayContainsPerson(persons, rPerson) && (useLiving || !rPerson.living)) {
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
		if (this.fsUser) {
			this.usedPeople[this.fsUser.id] = this.fsUser;
		}
	};
	
	this.getUserHistory = function() {
		var deferred = $q.defer();
		var temp = this;
		
		this.fs.get('/platform/users/current/history', { headers: { Accept: 'application/x-gedcomx-atom+json' }}, function(error, response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				deferred.resolve(response.data.entries);
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.getPersonChanges = function(personId) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/tree/persons/'+personId+'/changes', { headers: { Accept: 'application/x-gedcomx-atom+json' }}, function(error, response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				deferred.resolve(response.data.entries);
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
	
	this.searchPlace = function(place) {
		var deferred = $q.defer();
		var temp = this;
		this.fs.get('/platform/places/search?q=name:"'+encodeURIComponent(place)+'"', { headers: { Accept: 'application/x-gedcomx-atom+json' }}, function(error, response) {
			if (response.statusCode==200 || response.statusCode == 307) {
				deferred.resolve({place: place, entries: response.data.entries});
			} else {
				deferred.reject(response.body);
			}
		});
		return deferred.promise;
	};
}])
;