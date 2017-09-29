angular.module('genquiz-affiliates', [])
.service('affiliateService', ['$rootScope','$uibModal', '$q', function($rootScope, $uibModal, $q) {
    this.banners = [
        {name: "littleFamilyTree", template: "/affiliates/lft-banner.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'},
        {name: "livingdna", template: "/affiliates/ldna-banner.html", clickUrl: 'http://www.tkqlhce.com/click-8388174-12747569'},
        {name: "gqmerch", template: "/affiliates/gq-merch.html", clickUrl: "https://yellowfork.threadless.com/designs/genquizitive-logo/mens/t-shirt?color=heather_grey"},
        {name: "ftdna", template: "/affiliates/ftdna-banner.html", clickUrl: "https://affiliate.familytreedna.com/idevaffiliate.php?id=1883_1_1_40"},
        {name: "fhfamazon", template: "/affiliates/fhf-banner.html", clickUrl: "https://www.amazon.com/gp/product/1542619351/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1542619351&linkCode=as2&tag=elloorkech-20&linkId=88f6bde10f60bd6b8e930b34f7057d7c"},
        {name: "fhfamazon2", template: "/affiliates/fhf-banner2.html", clickUrl: "https://www.amazon.com/gp/product/1547053518/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1547053518&linkCode=as2&tag=elloorkech-20&linkId=9a441e7f95066c577a9e82819aec4ebb"},
        {name: "amazon3", template: "/affiliates/mce-banner.html", clickUrl: "https://www.amazon.com/gp/product/1523266961/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=1523266961&linkCode=as2&tag=elloorkech-20&linkId=9cc4152676954afe1ed547d6401d891c"},
        {name: "amazon4", template: "/affiliates/mce-banner2.html", clickUrl: "https://www.amazon.com/gp/product/B014RXIPR0/ref=as_li_tl?ie=UTF8&camp=1789&creative=9325&creativeASIN=B014RXIPR0&linkCode=as2&tag=elloorkech-20&linkId=fc4509d06713b06f576b097dd877eb40"},
        {name: "newspapers", template: "/affiliates/newspapers.html", clickUrl: "http://www.kqzyfj.com/click-8388174-11504315"},
        {name: "fold3", template: "/affiliates/fold3-banner.html", clickUrl: "http://www.anrdoezrs.net/click-8388174-10929639"},
        {name: "findmypast", template: "/affiliates/fmp-banner.html", clickUrl: "https://www.awin1.com/cread.php?s=266154&v=2114&q=127007&r=414197"},
        {name: "findmypastlg", template: "/affiliates/fmp-large-banner.html", clickUrl: "https://www.awin1.com/cread.php?s=265539&v=2114&q=126750&r=414197"}
        //{name: "macamazon", template: "/affiliates/mac-banner.html", clickUrl: ""}
    ];

    this.vbanners = [

    ];

    this.largeAds = [
        {name: "littleFamilyTree", template: "/affiliates/lft-large.html", clickUrl: 'http://www.littlefamilytree.com/?affiliateId=1'},
        {name: "livingdna", template: "/affiliates/ldna-large.html", clickUrl: 'http://www.tkqlhce.com/click-8388174-12747562'},
        {name: "amazonmerch", template: "/affiliates/amerch.html", clickUrl: "https://www.amazon.com/dp/B072QN3717"},
        {name: "ftdna", template: "/affiliates/ftdna-large.html", clickUrl: "https://affiliate.familytreedna.com/idevaffiliate.php?id=1883_2_1_44"},
        {name: "newslarge", template: "/affiliates/news-large.html", clickUrl: "http://www.tkqlhce.com/click-8388174-11504321"},
        {name: "fold3large", template: "/affiliates/fold3-large.html", clickUrl: "http://www.tkqlhce.com/click-8388174-10929309"},
        {name: "fmplarge", template: "/affiliates/fmp-large.html", clickUrl: "https://www.awin1.com/cread.php?s=649130&v=2114&q=312354&r=414197"},
        {name: "fmplarge2", template: "/affiliates/fmp-large2.html", clickUrl: "https://www.awin1.com/cread.php?s=265552&v=2114&q=126764&r=414197"}
        //{name: "fhfamazon", template: "/affiliates/fhf-large.html", clickUrl: ""},
        //{name: "macamazon", template: "/affiliates/mac-large.html", clickUrl: ""}
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
            if (modalScope.ad.clickUrl) {
                window.open(modalScope.ad.clickUrl, "_blank");
            }
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
        template: '<div style="float: left; display: inline-block;" ng-style="styleWidth" ng-click="adClicked(banner1)" ng-include="adTemplate1" />\
                <div ng-if="banner2" style="width: 400px; float: left; margin-left: 10px; display: inline-block;" ng-click="adClicked(banner2)" ng-include="adTemplate2" />',
        link: function($scope, $element, $attr) {
            $scope.banner1 = affiliateService.getRandomBanner();
            $scope.adTemplate1 = $scope.banner1.template;
            $scope.styleWidth = {"width": "100%"};
            $scope.portrait = window.portrait;
            $scope.largeBanners = ["newspapers","fold3","findmypastlg"]
            if (!window.portrait) {
                $scope.styleWidth = {"width": "400px"};
                if ($scope.largeBanners.indexOf($scope.banner1.name) >= 0) {
                    $scope.styleWidth = {"width": "100%"};
                } else {
                    var count = 0;
                    $scope.banner2 = affiliateService.getRandomBanner();
                    while(count < 5 && ($scope.banner1.name == $scope.banner2.name || $scope.largeBanners.indexOf($scope.banner2.name) >= 0)) {
                        count++;
                        $scope.banner2 = affiliateService.getRandomBanner();
                    }
                    if (count>=5) {
                        $scope.banner2 = null;
                    } else {
                        $scope.adTemplate2 = $scope.banner2.template;
                    }
                }
            }

            $scope.adClicked = function(banner) {
                if (banner.clickUrl) {
                    window.open(banner.clickUrl, "_blank");
                }
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
            }, 4000);

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
            }, 4000);

            $scope.$on('$destroy', function() {
                $interval.cancel(interval);
            });
        }
    }
})
;