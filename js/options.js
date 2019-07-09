var app = angular.module('awsConsoleModApp', ['ui.bootstrap', 'ui.sortable', 'colorpicker.module']);

app.filter('translate', function() {
    return function(key) {
        var res = chrome.i18n.getMessage(key.replace(/-/g, '_'));
        return res != '' ? res : key;
    }
});

app.controller('appCtrl', ['$scope', '$filter', /*'$translate',*/ function ($scope, $filter) {

    var DEFAuLT_COLOR = "#232f3e";

    // region list (not support multi lannguages)
    $scope.regions = [

        { value: "all-region", label: "All Region" },
        { value: "us-east-1", label: "US East (N. Virginia)" },
        { value: "us-east-2", label: "US East (Ohio)" },
        { value: "us-west-1", label: "US West (N. California)" },
        { value: "us-west-2", label: "US West (Oregon)" },
        { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
        { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
        { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
        { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
        { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
        { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
        { value: "ca-central-1", label: "Canada (Central)" },
        { value: "eu-central-1", label: "EU (Frankfurt)" },
        { value: "eu-west-1", label: "EU (Ireland)" },
        { value: "eu-west-2", label: "EU (London)" },
        { value: "eu-west-3", label: "EU (Paris)" },
        { value: "eu-north-1", label: "EU (Stockholm)" },
        { value: "sa-east-1", label: "South America (São Paulo)" }
    ];

    // translate message
    $scope.translate = function(key) {
        return $filter('translate')(key);
    }

    angular.forEach($scope.regions, region => region['label'] = $scope.translate(region.value));

    var defaultRule = { label: "", user: "", region: "all-region", color: DEFAuLT_COLOR, enableRule: true, showLabel: true };

    $scope.ruleList = [];

    $scope.loadSetting = function() {
        //console.log("loadSetting...");

        chrome.storage.sync.get(['awsconsole'], function(result) {
           $scope.ruleList = result.awsconsole || [];
           if ($scope.ruleList.length == 0) {
                $scope.ruleList.push(angular.copy(defaultRule));
           }
           console.log('Value currently is ', result.awsconsole);
           $scope.$applyAsync();
        });
    }

    // add rule.
    $scope.addRule = function() {
        $scope.ruleList.push(angular.copy(defaultRule));
    }

    // remove rule.
    $scope.removeRule = function (index) {
        $scope.ruleList.splice(index, 1);
    }

    // copy rule.
    $scope.copyRule = function(index) {
        $scope.ruleList.push(angular.copy($scope.ruleList[index]));
    }

    // enable all rule.
    $scope.enableAll = function () {
        $scope.ruleList.forEach(rule => rule.enableRule = true);
    }

    // disable all rule.
    $scope.disableAll = function () {
        $scope.ruleList.forEach(rule => rule.enableRule = false);
    }

    $scope.apply = function() {
       chrome.storage.sync.set({ awsconsole: angular.copy($scope.ruleList) }, function() {
        });
    }

    $scope.sortableOptions = {
        'handle' : '[data-js=drag_handle]',
        'axis '  : 'y',
    }
}]);
