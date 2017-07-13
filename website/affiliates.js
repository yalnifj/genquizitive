angular.module('genquiz-affiliates', [])
.service('affiliateService', ['$rootScope','$uibModal',function($rootScope, $uibModal) {
    this.banners = [
        {name: "littleFamilyTree", template: "/affiliates/lft-banner.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'}
    ];

    this.largeAds = [
        {name: "littleFamilyTree", template: "/affiliates/lft-large.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'}
    ];

    this.getRandomBanner = function() {
        var q = Math.floor (Math.random () * this.banners.length);
		return this.banners[q];
    };

    this.getRandomLargeAd = function() {
        var q = Math.floor (Math.random () * this.largeAds.length);
		return this.largeAds[q];
    };

    this.showLargeAd = function() {
		var modalScope = $rootScope.$new(true);
        var options = {
			scope: modalScope,
			template: '<div class="modal-body live-modal-body clickable" ng-click="adClicked()"><ng-include src="ad.template" /></div>\
                <div class="modal-footer live-modal-footer">\
                    <div class="clickable neonbutton" ng-click="close()">\
			        <img src="/live/continue_button_off.png" neon-image="" delay="200" />\
		        </div></div>'
		}

		modalScope.ad = this.getRandomLargeAd();

		modalScope.adClicked = function() {
			window.open(modalScope.ad.clickUrl, "_blank");
		};

        modalwin = $uibModal.open(options);

        modalScope.close = function() {
            modalwin.close();
            modalScope.$destroy();
        };
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