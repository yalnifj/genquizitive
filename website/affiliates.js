angular.module('genquiz-affiliates', [])
.service('affiliateService', [function() {
    this.banners = [
        {name: "littleFamilyTree", template: "/affiliates/lft-banner.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'}
    ];

    this.getRandomBanner = function() {
        var q = Math.floor (Math.random () * this.banners.length);
		return this.banners[q];
    };
}])
.directive('bannerAd', function(affiliateService) {
    return {
        restrict: 'A',
        template: '<ng-include src="adTemplate" />',
        link: function($scope, $element, $attr) {
            $scope.banner = affiliateService.getRandomBanner();
            $scope.adTemplate = $scope.banner.template;

            $scope.adClicked = function() {
                window.open($scope.banner.clickUrl, "_blank");
            };
        }
    }
})
;