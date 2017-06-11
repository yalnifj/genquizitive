angular.module('genquiz-components', ['ngAnimate','ui.bootstrap'])
.directive('backgrounds', [function() {
	return {
		link: function($scope, $element, $attrs) {
			$scope.$on('changeBackground', function(event, background) {
				$element.css('background-image', "url('"+background+"')");
			});
		}
	}
}])
.service('notificationService', ['$rootScope', '$compile', '$q', '$sce', function($rootScope, $compile, $q, $sce){
	this.showNotification = function(options) {
		var $scope = $rootScope.$new();
		$scope.title = options.title;
		$scope.message = $sce.trustAsHtml(options.message);
		$scope.options = options;
		var template = '<div class="notification"><div class="title">{{title}}</div><div class="message">{{message}}</div>\
			<button ng-if="options.closable" ng-click="close()" class="btn btn-default closebutton">Close</button></div>';
		$scope.element = $compile(template)($scope);
		$('body').append($scope.element);
		
		$scope.show = function() {
			var left = ($(window).width() - $scope.element.width()) / 2;
			$scope.element.css('left', left + 'px');
			$scope.element.animate({top: '20px'}, 1000);
		};
		
		$scope.close = function() {
			$scope.element.animate({top: '-500px'}, {duration: 700, complete: function() { $scope.element.remove(); } });
		};
		
		return $scope;
	};
	
	this.showConfirmation = function(options) {
		var deferred = $q.defer();
		var $scope = $rootScope.$new();
		$scope.title = options.title;
		$scope.message = $sce.trustAsHtml(options.message);
		$scope.options = options;
		var template = '<div class="notification"><div class="title">{{title}}</div><div class="message">{{message}}</div>\
			<div class="closebutton"><button ng-click="confirm()" class="btn btn-default">Yes</button>\
			<button ng-click="cancel()" class="btn btn-default">No</button></div></div>';
		$scope.element = $compile(template)($scope);
		$('body').append($scope.element);
		
		$scope.show = function() {
			var left = ($(window).width() - $scope.element.width()) / 2;
			$scope.element.css('left', left + 'px');
			$scope.element.animate({top: '20px'}, 1000);
		};
		
		$scope.close = function() {
			$scope.element.animate({top: '-500px'}, {duration: 700, complete: function() { $scope.element.remove(); } });
		};
		
		$scope.cancel = function() {
			$scope.close();
			deferred.reject('cancelled');
		};
		
		$scope.confirm = function() {
			$scope.close();
			deferred.resolve('resolved');
		};
		
		$scope.show();
		
		return deferred.promise;
	};
	
	this.showHintWon = function(options) {
		var $scope = $rootScope.$new();
		$scope.title = options.title;
		$scope.message = options.message;
		$scope.options = options;
		var template = '<div class="notification"><div class="title">{{title}}</div><div class="message">{{message}}\
			<div class="text-center" hint-spinner="" hint-won="options.hint"></div></div>\
			<button ng-if="options.closable" ng-click="close()" class="btn btn-default closebutton">Close</button></div>';
		$scope.element = $compile(template)($scope);
		$('body').append($scope.element);
		
		$scope.show = function() {
			var left = ($(window).width() - $scope.element.width()) / 2;
			$scope.element.css('left', left + 'px');
			$scope.element.animate({top: '20px'}, 800);
		};
		
		$scope.close = function() {
			$scope.element.animate({top: '-500px'}, {duration: 800, complete: function() { $scope.element.remove(); } });
		};
		
		return $scope;
	};
}])
.directive('countdown', ['$interval', '$timeout', function($interval, $timeout) {
	return {
		restrict: 'C',
		scope: {
			callback: '&',
			remove: '=',
			delayStart: '='
		},
		link: function($scope, $element, $attr) {
			$scope.numberElement = $('<div style="position: absolute;top: 40px;left: 150px;width: 100px;height: 110px; color: white; font-size: 35px; font-family: monospace; line-height: 110px;"></div>');
			$element.append($scope.numberElement);
			$scope.number = 4;
			if (!$scope.delayStart) {
				$scope.delayStart = 1000;
			}
			
			if ($scope.delayStart > 0) {
				$scope.timeout = $timeout(function() {
					$scope.start();
				}, $scope.delayStart);
			} else {
				$scope.numberElement.text('START');
				$scope.numberElement.on('click', function() {
					if (!$scope.timer) {
						$scope.start();
					}
				});
			}
			
			$scope.start = function() {
				$scope.numberElement.text('');
				$scope.number = 3;
				$scope.numberElement.css('background-image', "url('/images/number"+$scope.number+".png')");
				$scope.timer = $interval(function() {
					$scope.number--;
					if ($scope.number>0) {
						$scope.numberElement.css('background-image', "url('/images/number"+$scope.number+".png')");
					} else {
						if ($scope.remove && $scope.remove!='false') {
							$element.remove();
						}
						$scope.callback();
					}
				}, 1000);
			};
			
			$element.on('$destroy', function() {
				$timeout.cancel($scope.timeout);
				$interval.cancel($scope.timer);
			});
		}
	}
}])
.directive('avatarBadge', [function() {
	return {
		scope: {
			src: '=',
			label: '='
		},
		template: '<img ng-src="{{src}}" ng-if="src" /><div class="avatar-label" ng-if="label">{{label}}</div>',
		replace: false,
		link: function($scope) {
			if (!$scope.src) {
				$scope.src = '/images/unknown_sil.png';
			}
		}
	}
}])
.directive('timelineFact', ['languageService',function(languageService) {
	return {
		scope: {
			fact: '=',
			person: '='
		},
		template: '<div class="fact-circle"><span class="fact-month-day">{{monthDay}}</span><br /><span class="fact-year">{{year}}</span></div>\
			<div class="fact-details"><div class="fact-age"><span ng-hide="!age">Age<br /><span class="age">{{age}}</span></span></div>\
			<div class="fact-place"><span class="fact-type">{{fact.type | factlabel}}</span><br />{{fact.value | valueSizeFilter}}<br ng-if="value"/>{{fact.place.original}}</div></div>',
		link: function($scope, $element, $attr) {
			$($element).data('fact', $scope.fact);
		},
		controller: ['$scope', 'languageService', function($scope, languageService) {
			if ($scope.fact.date) {
				if (!$scope.fact.date.parsedDate) {
					if ($scope.fact.date.original) {
						$scope.fact.date.parsedDate = languageService.parseDate($scope.fact.date.original);
					}
				}
				if ($scope.fact.date.parsedDate) {
					var date = new Date($scope.fact.date.parsedDate);
					$scope.year = date.getFullYear();
					if ($scope.fact.date.original.length > 4) {
						$scope.monthDay = date.getDate() +" "+languageService.monthShort[date.getMonth()];
					}
					
					if ($scope.person && $scope.person.display && $scope.person.display.birthDate) {
						if (!$scope.person.display.parsedBirthDate) {
							$scope.person.display.parsedBirthDate = languageService.parseDate($scope.person.display.birthDate);
						}
						$scope.age = $scope.fact.date.parsedDate.getFullYear() - $scope.person.display.parsedBirthDate.getFullYear();
						var bmonth = $scope.person.display.parsedBirthDate.getMonth();
						var fmonth = $scope.fact.date.parsedDate.getMonth();
						if (fmonth < bmonth) {
							$scope.age -= 1;
						} else if (fmonth==bmonth) {
							var bday = $scope.person.display.parsedBirthDate.getDate();
							var fday = $scope.fact.date.parsedDate.getDate();
							if (fday < bday) {
								$scope.age -= 1;
							}
						}
					}
				}
			}
			
		}]
	}
}])
.directive('answerButton', [function() {
	return {
		scope: {
			label: '=',
			background: '@',
			incorrect: '='
		},
		template: '<div class="answer-button" ng-style="answerStyle">{{label}}</div>',
		link: function($scope, $element, $attr) {
			$scope.updateStyle = function() {
				$scope.answerStyle = {
					background: "url('"+$scope.background+"')",
					opacity: $scope.incorrect ? '0.7':'1.0'
				};
			};
			$scope.$watch('background', function() {
				$scope.updateStyle();
			});
			$scope.$watch('incorrect', function() {
				$scope.updateStyle();
			});
		}
	}
}])
.directive('proxyImg', [function() {
	return {
		scope: {
			src: '@'
		},
		link: function($scope, $element, $attr) {
			$scope.setProxyUrl = function() {
				if ($scope.src) {
					var src = "/fs-proxy.php?url=" + encodeURIComponent($scope.src);
					$element.attr('src', src);
				}
			}
			$scope.setProxyUrl();
			$scope.$watch('src', function() {
				$scope.setProxyUrl();
			});
		}
	}
}])
.directive('guage', ['$interval', function($interval) {
	return {
		scope: {
			min: '=',
			max: '=',
			value: '=',
			label: '@'
		},
		template: '<img src="/images/guage_hand.png" /><div ng-if="label" class="guage-label">{{label}}</div>',
		link: function($scope, $element, $attr) {
			if (!$scope.min) $scope.min = 0;
			if (!$scope.max) $scope.max = 100;
			if (!$scope.value) $scope.value = $scope.min;
			
			$scope.rotate = function() {
				$scope.currDeg = $scope.targetDeg;
				if (!$scope.currDeg) $scope.currDeg = 0;
				
				var perc = ($scope.value - $scope.min) / ($scope.max - $scope.min);
				$scope.targetDeg = Math.floor(perc * 270);
				
				$scope.degStep = ($scope.targetDeg - $scope.currDeg) / 10;
				$scope.rotStep = 0;
				
				if (!$scope.interval) {
					$scope.interval = $interval(function() {
						$scope.currDeg += $scope.degStep;
						$element.children('img').css('transform', 'rotate('+$scope.currDeg+'deg)');
						$scope.rotStep++;
						if ($scope.rotStep==10) {
							$interval.cancel($scope.interval);
							$scope.interval = null;
						}
					}, 100);
				}
			};
			
			$scope.$watch('value', function(newval, oldval) {
				if (newval!=oldval) {
					if ($scope.value < $scope.min) {
						$scope.value = $scope.min;
					}
					if ($scope.value > $scope.max) {
						$scope.value = $scope.max;
					}
					$scope.rotate();
				}
			});
		}
	}
}])
.directive('light', [function() {
	return {
		scope: {
			on: '=',
			color: '@'
		},
		template: '<img ng-src="{{imgUrl}}" />',
		link: function($scope, $element, $attr) {
			$scope.setImgUrl = function() {
				$scope.imgUrl = '/images/'+$scope.color+"_light_";
				if ($scope.on===true) $scope.imgUrl+="on";
				else $scope.imgUrl+="off";
				$scope.imgUrl+=".png";
			}
			$scope.setImgUrl();
			
			$scope.$watch('on', function() {
				$scope.setImgUrl();
			});
			$scope.$watch('color', function() {
				$scope.setImgUrl();
			});
		}
	}
}])
.directive('animatedTimer', ['$interval', function($interval) {
	return {
		scope: {
			time: '='
		},
		template: '{{display}}',
		link: function($scope, $element, $attr) {
			if (!$scope.time) $scope.time=0;
			$scope.curVal = 0;
			$scope.display = "0:00";
			
			$scope.animate = function() {				
				$scope.interval = $interval(function() {
					$scope.step = ($scope.time - $scope.curVal) / 2.0; 
					if ($scope.step > 5) $scope.step = 5;
					if ($scope.step > 0 && $scope.step < 0.05) $scope.curVal = $scope.time;
					if ($scope.step < -5) $scope.step = -5;
					if ($scope.step < 0 && $scope.step > -0.05) $scope.curVal = $scope.time;
					$scope.curVal += $scope.step;
					$scope.curVal = Math.round($scope.curVal);
					
					var minutes = Math.floor($scope.curVal / 60.0);
					$scope.display = minutes + ":";
					var seconds = $scope.curVal - (minutes * 60);
					if (seconds < 10) $scope.display += "0";
					$scope.display += seconds;
					
					if ($scope.curVal==$scope.time) {
						$interval.cancel($scope.interval);
						$scope.interval = null;
					}
				}, 50);
			};
			$scope.animate();
			
			$scope.$watch('value', function(newval, oldval) {
				if (newval!=oldval) {
					if (!$scope.interval) $scope.animate();
				}
			});
		}
	}
}])
.directive('loadingSign', ['$interval', function($interval) {
	return {
		link: function($scope, $element, $attr) {
			$scope.count = 1;
			$scope.step = 1;
			
			$scope.images = [];
			var img = new Image();
			img.src = "/images/loading1.png";
			$scope.images.push(img);
			img = new Image();
			img.src = "/images/loading2.png";
			$scope.images.push(img);
			img = new Image();
			img.src = "/images/loading3.png";
			$scope.images.push(img);
			
			$scope.setBackground = function() {
				$element.css('background-image', 'url("/images/loading'+$scope.count+'.png")');
			};
			
			$scope.setBackground();
			$scope.interval = $interval(function() {
				$scope.count+=$scope.step;
				if ($scope.count > 3) {
					$scope.count = 2;
					$scope.step = -1;
				}
				if ($scope.count < 1) {
					$scope.count = 2;
					$scope.step = 1;
				}
				$scope.setBackground();
			}, 750);
			
			$scope.$on('$destroy', function() {
				$interval.cancel($scope.interval);
			});
		}
	}
}])
.directive('zoomToFit', [function() {
	return {
		link: function($scope, $element, $attr) {
			var h = $attr.zoomMaxHeight;
			if (h && h>0) {
				var wh = $(window).height();
				if (h > wh) {
					var zoom=wh/h;
					$element.css('zoom', zoom);
				}
			}
		}
	}
}])
.directive('hint', [function() {
	return {
		scope: {
			hint: '='
		},
		template: '<img ng-src="{{hint.img}}" class="image-responsive" /><div class="hint-count">{{hint.userCount}}</div>'
	}
}])
.component('personDetails', {
	templateUrl: '/personDetails.html',
	bindings: {
		person: '<',
		resolve: '<',
		close: '&',
		dismiss: '&'
	},
	controller: function(familysearchService, relationshipService, languageService, NgMap, $q, $filter) {
		var $ctrl = this;
		$ctrl.active = 0;
		$ctrl.$onInit = function () {
			if (!$ctrl.person) {
				$ctrl.person = $ctrl.resolve.person;
			}
			if ($ctrl.person) {
				$ctrl.facts = languageService.sortFacts($ctrl.person.facts);
				$ctrl.poleStyle = {height: (($ctrl.facts.length - 1)*70)+'px'};
				
				angular.forEach($ctrl.facts, function(fact) {
					if (fact.type.indexOf("LifeSketch") >=0) {
						$ctrl.lifeSketch = fact;
					}
				});
				
				//-- mini-tree
				$ctrl.ancestors = [];
				var hash = {};
				familysearchService.getAncestorTree($ctrl.person.id, 2, false).then(function(tree) {
					$ctrl.parents = [];
					$ctrl.gParents = [];
					if (tree.persons) {
						var lastIndex = 1;
						angular.forEach(tree.persons, function(person) {
							if (person.display.ascendancyNumber.indexOf("S")<0 && person.display.ascendancyNumber > 1) {
								if (person.display.ascendancyNumber < 4) {
									while(lastIndex < person.display.ascendancyNumber - 1) {
										$ctrl.parents.push("spacer");
										lastIndex++;
									}
									$ctrl.parents.push(person);
								} else {
									while(lastIndex < 3) {
										$ctrl.parents.push("spacer");
										lastIndex++;
									}
									while(lastIndex < person.display.ascendancyNumber - 1) {
										$ctrl.gParents.push("spacer");
										lastIndex++;
									}
									$ctrl.gParents.push(person);
								}
								lastIndex = person.display.ascendancyNumber;
							}
							hash[person.id] = person;
							familysearchService.getPersonPortrait(person.id).then(function(details) {
								hash[details.id].portrait = details.src;
							});
						});
						while(lastIndex < 3) {
							$ctrl.parents.push("spacer");
							lastIndex++;
						}
						while(lastIndex < 7) {
							$ctrl.gParents.push("spacer");
							lastIndex++;
						}
					}
				});
				$ctrl.spouseTrees = {};
				$ctrl.hasSpouses = false;
				familysearchService.getDescendancyTree($ctrl.person.id, 1, false).then(function(tree) {
					if (tree.persons) {
						angular.forEach(tree.persons, function(person) {
							if (person.display.descendancyNumber!="1") {
								var dnums = person.display.descendancyNumber.split(".");
								if (dnums[0]=="1") dnums[0]="1-S";
								if (!$ctrl.spouseTrees[dnums[0]]) {
									$ctrl.hasSpouses = true;
									$ctrl.spouseTrees[dnums[0]] = { children: [], lines: [], lineOffset: 0 };
								}
								if (dnums.length==1) {
									$ctrl.spouseTrees[dnums[0]].spouse = person;
								} else if (dnums[1].indexOf("S")<0) {
									$ctrl.spouseTrees[dnums[0]].children.push(person);
									if ($ctrl.spouseTrees[dnums[0]].children.length > 3) $ctrl.spouseTrees[dnums[0]].lineOffset += 26;
								}
								hash[person.id] = person;
								familysearchService.getPersonPortrait(person.id).then(function(details) {
									hash[details.id].portrait = details.src;
								});
							}
						});
						angular.forEach($ctrl.spouseTrees, function(spouseTree) {
							if (spouseTree.children.length > 2) {
								for(var l=0; l<spouseTree.children.length; l++) {
									spouseTree.lines.push(40 + 61*l);
								}
							} else {
								for(var l=0; l<spouseTree.children.length; l++) {
									spouseTree.lines.push(120 + 61*l);
								}
							}
						});
					}
				});
				
				//-- memories
				familysearchService.getPersonMemories($ctrl.person.id).then(function(memories) {
					$ctrl.memories = [];
					angular.forEach(memories, function(memory) {
						if (memory.links && memory.links['image-thumbnail'] && memory.links['image-thumbnail'].href) {
							//if (!$ctrl.active) $ctrl.active = memory.id;
							memory.src = 'fs-proxy.php?url='+encodeURIComponent(memory.links['image-thumbnail'].href);
							$ctrl.memories.push(memory);
						}
					});
				});
				
				/*
				//-- map the facts
				$ctrl.places = [];
				var placeFacts = {};
				var promises = [];
				for(var f=0; f<$ctrl.facts.length; f++) {
					var fact = $ctrl.facts[f];
					if (fact.place) {
						var place = "";
						if (fact.place.normalized && fact.place.normalized.value) {
							place = fact.place.normalized.value;
						} else if (fact.place.original) {
							place = fact.place.original;
						}
						
						if (place!="") {
							fact.factLabel = $filter('factlabel')(fact.type);
							if (placeFacts[place]) placeFacts[place].push(fact);
							else {
								placeFacts[place] = [fact];
								var promise = familysearchService.searchPlace(place).then(function(response) {
									if (response.entries && response.entries.length>0) {
										var responsePlace = response.place;
										var entry = response.entries[0];
										if (entry.content && entry.content.gedcomx && entry.content.gedcomx.places && entry.content.gedcomx.places.length>0) {
											var placeAuthority = entry.content.gedcomx.places[0];
											if (placeAuthority.latitude) {
												placeAuthority.facts = placeFacts[responsePlace];
												placeAuthority.pos = [placeAuthority.latitude, placeAuthority.longitude];
												$ctrl.places.push(placeAuthority);
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
				}
				//-- wait for all place searches to complete
				if (promises.length>0) {
					$q.all(promises).then(function() {
						//map is ready
						$ctrl.dynMarkers = [];
						NgMap.getMap().then(function(map) {
							setTimeout(function() {
								$ctrl.map = map;
								for (var k in map.customMarkers) {
									var cm = map.customMarkers[k];
									$ctrl.dynMarkers.push(cm);
								}
								if ($ctrl.markerClusterer) {
									$ctrl.markerClusterer.clearMarkers();
									$ctrl.markerClusterer.addMarkers($ctrl.dynMarkers);
								} else {
									$ctrl.markerClusterer = new MarkerClusterer(map, $ctrl.dynMarkers, {styles: [{url: 'map_cluster.png', gridSize: 200, width: 100, height: 58, textSize: 16}]}); 
								}
								$ctrl.markerClusterer.fitMapToMarkers();
								google.maps.event.trigger(map, 'resize');
							}, 400);
						});
					}, function(error) {
						console.log("unable to resolve all promises "+error);
					});
				}
				*/
				
				//-- relationship
				relationshipService.getRelationship(familysearchService.fsUser.id, $ctrl.person.id).then(function(result) {
					$ctrl.relationship = result;
					angular.forEach($ctrl.relationship.path1, function(person) {
						if (!hash[person.id]) {
							hash[person.id] = person;
							familysearchService.getPersonPortrait(person.id).then(function(details) {
								hash[details.id].portrait = details.src;
							});
						}
					});
					angular.forEach($ctrl.relationship.path2, function(person) {
						if (!hash[person.id]) {
							hash[person.id] = person;
							familysearchService.getPersonPortrait(person.id).then(function(details) {
								hash[details.id].portrait = details.src;
							});
						}
					});
				}, function() {
					familysearchService.getPersonSpouses($ctrl.person.id).then(function(spouses) {
						if (spouses && spouses.length >0) {
							relationshipService.getRelationship(familysearchService.fsUser.id, spouses[0].id).then(function(result) {
								result.spouse = spouses[0];
								result.relationship = "Wife's "+result.relationship;
								$ctrl.relationship = result;
								angular.forEach($ctrl.relationship.path1, function(person) {
									if (!hash[person.id]) {
										hash[person.id] = person;
										familysearchService.getPersonPortrait(person.id).then(function(details) {
											hash[details.id].portrait = details.src;
										});
									}
								});
								angular.forEach($ctrl.relationship.path2, function(person) {
									if (!hash[person.id]) {
										hash[person.id] = person;
										familysearchService.getPersonPortrait(person.id).then(function(details) {
											hash[details.id].portrait = details.src;
										});
									}
								});
							});
						}
					});
				});
			}
		};
		
		/*
		$ctrl.$onDestroy = function() {
			if ($ctrl.map) {
				$ctrl.markerClusterer.clearMarkers();
				google.maps.event.clearInstanceListeners($ctrl.map);
			}
		};
		*/
		
		$ctrl.ok = function () {
			$ctrl.close();
		};

		$ctrl.cancel = function () {
			$ctrl.dismiss();
		};
	}
})
.controller('testQuestionController', function($scope, notificationService, QuestionService, familysearchService) {
	$scope.$emit('changeBackground', '/images/home_background.jpg');
	
	$scope.questions = QuestionService.questions;
	$scope.question = $scope.questions[0];
	$scope.difficulty = 1;
	$scope.useLiving = true;
	
	familysearchService.fsLoginStatus().then(function(fsUser) {
		familysearchService.clearUsed();
		familysearchService.getAncestorTree(fsUser.id, 6, true).then(function() {
			$scope.question.setup(1, true);
		});
	});

	$scope.tries = 0;
	$scope.setupQuestion = function() {
		$scope.tries++;
		console.log('trying question '+$scope.question.name+' setup again '+$scope.tries);
		$scope.question.error = null;
		$scope.question.setup($scope.difficulty, $scope.useLiving).then(function() {
			console.log('successfully setup question '+$scope.question.name);
		}, function(error) {
			familysearchService.clearUsed();
			window.setTimeout(function() {
				$scope.setupQuestion();
			}, 1500);
		});

	};
	
	$scope.$watch('question', function(newval, oldval) {
		$scope.setupQuestion();
	});

	$scope.$watch('difficulty', function(newval, oldval) {
		$scope.setupQuestion();
	});

	$scope.$watch('useLiving', function(newval, oldval) {
		$scope.setupQuestion();
	});
})
.controller('testPersonController', function($scope, familysearchService, $uibModal) {
	
	if (!familysearchService.fsUser) {
		familysearchService.fsLoginStatus().then(function(fsUser) {
			familysearchService.clearUsed();
			familysearchService.getAncestorTree(fsUser.id, 6, true).then(function() {
				$scope.people = familysearchService.people;
			});
		});
	} else {
		$scope.people = familysearchService.people;
	}

	$scope.showPersonDetails = function(person) {
		if (familysearchService.fsUser) {
			var modalInstance = $uibModal.open({
				component: 'personDetails',
				//size: 'lg',
				resolve: {
					person: function () {
						return person;
					}
				}
			});
		} else {
			var notif = notificationService.showNotification({title: 'Family Tree Required', 
				message: 'This feature requires a connection to a Family Tree. Please connect to FamilySearch and try again.', 
				closable: true});
			notif.show();
		}
	};	
})
;