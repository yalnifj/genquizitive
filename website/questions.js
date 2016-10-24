angular.module('genquiz.questions', ['genquizitive', 'ui.bootstrap'])
.service ('QuestionService', ['familysearchService', '$http', '$sce', '$q', '$templateCache', function(familysearchService, $http, $sce, $q, $templateCache) {
	this.questions = [
		{name: 'photo1', difficulty: 1}
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
}])
.directive('question', ['QuestionService', '$compile', function (QuestionService, $compile) {
	return {
		scope: {
			question: '='
		},
		restrict: 'A',
		link ($scope, $element, $attr) {
			$scope.loadQuestion = function () {
				$scope.$emit('changeBackground', 'questions/'+$scope.question.name+'/background.jpg');
				
				var templateUrl = 'questions/'+$scope.question.name+'/question.html';
				QuestionService.getDeferredTemplate(templateUrl).then(function(template) {
					if (template) { 
						var $t = $(template);
						var qel = $compile($t)($scope);
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
.controller('photo1Controller', function($scope, familysearchService) {
	console.log($scope.question);
})
;