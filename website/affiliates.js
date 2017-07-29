angular.module('genquiz-affiliates', [])
.service('affiliateService', ['$rootScope','$uibModal', '$q', function($rootScope, $uibModal, $q) {
    this.banners = [
        {name: "littleFamilyTree", template: "/affiliates/lft-banner.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'},
        {name: "livingdna", template: "/affiliates/ldna-banner.html", clickUrl: 'http://www.tkqlhce.com/click-8388174-12747569'},
        {name: "gqmerch", template: "/affiliates/gq-merch.html", clickUrl: "https://yellowfork.threadless.com/designs/genquizitive-logo/mens/t-shirt?color=heather_grey"}
    ];

    this.vbanners = [

    ];

    this.largeAds = [
        {name: "littleFamilyTree", template: "/affiliates/lft-large.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'},
        {name: "livingdna", template: "/affiliates/ldna-large.html", clickUrl: 'http://www.tkqlhce.com/click-8388174-12747562'},
        {name: "amazonmerch", template: "/affiliates/amerch.html", clickUrl: "https://www.amazon.com/dp/B072QN3717"}
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
        var deferred = $q.defer();
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
            modalScope.close();
		};

        modalwin = $uibModal.open(options);

        modalScope.close = function() {
            modalwin.close();
            modalScope.$destroy();
            deferred.resolve();
        };

        return deferred.promise;
	};
}])
.directive('bannerAd', function(affiliateService) {
    return {
        restrict: 'A',
        template: '<div style="width: 400px; float: left; display: inline-block;" ng-click="adClicked(banner1)" ng-include="adTemplate1" />\
                <div ng-if="banner2" style="width: 400px; float: left; margin-left: 10px; display: inline-block;" ng-click="adClicked(banner2)" ng-include="adTemplate2" />',
        link: function($scope, $element, $attr) {
            $scope.banner1 = affiliateService.getRandomBanner();
            $scope.adTemplate1 = $scope.banner1.template;
            if (!window.portrait) {
                var count = 0;
                $scope.banner2 = affiliateService.getRandomBanner();
                while(count < 5 && $scope.banner1.name == $scope.banner2.name) {
                    count++;
                    $scope.banner2 = affiliateService.getRandomBanner();
                }
                if (count>=5) {
                    $scope.banner2 = null;
                } else {
                    $scope.adTemplate2 = $scope.banner2.template;
                }
            }

            $scope.adClicked = function(banner) {
                window.open(banner.clickUrl, "_blank");
            };
        }
    }
})
.directive('ldnaRotate', function($interval) {
    return {
        restrict: 'A',
        link: function($scope, $element) {
            var images = [
                "http://www.ftjcfx.com/image-8388174-12747568",
                "http://www.tqlkg.com/image-8388174-12747569",
                "http://www.tqlkg.com/image-8388174-12747570"
            ];
            var curimage = 0;
            var interval = $interval(function() {
                curimage++;
                if (curimage >= images.length) {
                    curimage = 0;
                }
                $element.attr('src', images[curimage]);
            }, 3000);

            $scope.$on('$destroy', function() {
                $interval.cancel(interval);
            });
        }
    }
})
.directive('ldnaRotateLarge', function($interval) {
    return {
        restrict: 'A',
        link: function($scope, $element) {
            var images = [
                "http://www.lduhtrp.net/image-8388174-12747563",
                "http://www.awltovhc.com/image-8388174-12747564",
                "http://www.ftjcfx.com/image-8388174-12747562"
            ];
            var curimage = 0;
            var interval = $interval(function() {
                curimage++;
                if (curimage >= images.length) {
                    curimage = 0;
                }
                $element.attr('src', images[curimage]);
            }, 3000);

            $scope.$on('$destroy', function() {
                $interval.cancel(interval);
            });
        }
    }
})
;