var app = angular.module('awsConsoleModApp', ['ui.bootstrap', 'ui.sortable', 'colorpicker.module']);

//directive
app.directive('fileModel',function($parse){
    return{
        restrict: 'A',
        link: function(scope,element,attrs) {
            var model = $parse(attrs.fileModel);
            element.bind('change',function(){
                scope.$apply(function(){
                    model.assign(scope,element[0].files[0]);
                });
            });
        }
    };
});

// translate filter
app.filter('translate', function() {
    return function(key) {
        var res = chrome.i18n.getMessage(key.replace(/-/g, '_'));
        return res != '' ? res : key;
    }
});

app.controller('appCtrl', ['$scope', '$filter', function ($scope, $filter) {

    var DEFAULT_COLOR = "#232f3e";

    // region list
    $scope.regions = [
        { value: "all-region", label: "All Region" },
        { value: "us-east-2", label: "US East (Ohio)" },
        { value: "us-east-1", label: "US East (N. Virginia)" },
        { value: "us-west-1", label: "US West (N. California)" },
        { value: "us-west-2", label: "US West (Oregon)" },
        { value: "af-south-1", label: "Africa (Cape Town)" },
        { value: "ap-east-1", label: "Asia Pacific (Hong Kong)" },
        { value: "ap-south-1", label: "Asia Pacific (Mumbai)" },
        { value: "ap-northeast-3", label: "Asia Pacific (Osaka)" },
        { value: "ap-northeast-2", label: "Asia Pacific (Seoul)" },
        { value: "ap-southeast-1", label: "Asia Pacific (Singapore)" },
        { value: "ap-southeast-2", label: "Asia Pacific (Sydney)" },
        { value: "ap-northeast-1", label: "Asia Pacific (Tokyo)" },
        { value: "ca-central-1", label: "Canada (Central)" },
        { value: "cn-north-1", label: "China (Beijing)" },
        { value: "cn-northwest-1", label: "China (Ningxia)" },
        { value: "eu-central-1", label: "Europe (Frankfurt)" },
        { value: "eu-west-1", label: "Europe (Ireland)" },
        { value: "eu-west-2", label: "Europe (London)" },
        { value: "eu-south-1", label: "Europe (Milan)" },
        { value: "eu-west-3", label: "Europe (Paris)" },
        { value: "eu-north-1", label: "Europe (Stockholm)" },
        { value: "me-south-1", label: "Middle East (Bahrain)" },
        { value: "sa-east-1", label: "South America (São Paulo)" }
    ];

    // translate message
    $scope.translate = function(key) {
        return $filter('translate')(key);
    }

    angular.forEach($scope.regions, region => region['label'] = $scope.translate(region.value));

    var defaultRule = { label: "", user: "", region: "all-region", color: DEFAULT_COLOR, enableRule: true, showLabel: true };

    $scope.previewRule = defaultRule;

    $scope.ruleList = [];

    //$scope.orgRulelist = [];
    //$scope.prevIdx = -99;

    $scope.loadSetting = function() {
        //console.log("loadSetting...");

        chrome.storage.sync.get(['awsconsole'], function(result) {
           $scope.ruleList = result.awsconsole || [];
           if ($scope.ruleList.length == 0) {
                $scope.ruleList.push(angular.copy(defaultRule));
           }
           //$scope.orgRulelist = angular.copy($scope.ruleList);
           $scope.$applyAsync();
        });
    }

    // check modified rule
    $scope.checkModified = function() { 
    }

    // add rule.
    $scope.addRule = function() {
        $scope.ruleList.push(angular.copy(defaultRule));
    }

    // remove rule.
    $scope.removeRule = function (index) {
        $scope.ruleList.splice(index, 1);
        $scope.previewRule = defaultRule;
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

    // save rule.
    $scope.apply = function() {
        chrome.storage.sync.set({ awsconsole: angular.copy($scope.ruleList) }, function() {
        });
    }

    // export rule.
    $scope.exportRule = function() {
        var resultJson = JSON.stringify($scope.ruleList, null, 2);
        var downLoadLink = document.createElement("a");
        downLoadLink.download = formatDate(new Date(), "yyyyMMdd-HHmm_export.json");
        downLoadLink.href = URL.createObjectURL(new Blob([resultJson], {type: "application/json"}));
        downLoadLink.dataset.downloadurl = ["application/json", downLoadLink.download, downLoadLink.href].join(":");
        downLoadLink.click();
    }

    // import rule.
    $scope.importRule = function() {
        // open file dialog
        document.getElementById("importFile").click();
    }

    $scope.$watch('importFile', function(file) {
        if (file != undefined) {
            // import rules
            var reader = new FileReader();
            reader.onload = function() {
                // handle parse error
                var rules = JSON.parse(reader.result);
                if (Array.isArray(rules)) {
                    // TODO validate format
                    rules.forEach(rule => $scope.ruleList.push(rule));
                    $scope.importFile = undefined;
                    $scope.$applyAsync();
                }
            }
            reader.readAsText(file);
        }
    });

    $scope.preview = function(idx) {
        if ($scope.ruleList.length > 0 && idx >= 0) {
            $scope.previewRule = $scope.ruleList[idx];
        } else {
            $scope.previewRule = defaultRule;
        }
        // check modified
        //if (idx != $scope.prevIdx) {
        //    console.log("check modify. [" + idx + "]");
        //    $scope.prevIdx = idx;
        //}
    }
    
    $scope.sortableOptions = {
        'handle' : '[data-js=drag_handle]',
        'axis '  : 'y',
    }

    // format date
    function formatDate (date, format) {
        format = format.replace(/yyyy/g, date.getFullYear());
        format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
        format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
        format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
        format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
        format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
        format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
        return format;
      };
}]);
