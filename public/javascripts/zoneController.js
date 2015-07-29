var app = angular.module("sprinklerApp", [ "xeditable", "ngResource" ]);


app.factory("ZoneApi", function ($resource)
{
    return $resource("/api/zone/:id",

        {
        'save': { method: 'POST' },
        'getAll': { method: 'GET', isArray: true },
        'get': { method: 'GET', isArray: false },
        'update': { method: 'PUT' },
        'remove': { method: 'DELETE' }
        } );
});


app.controller("zoneCtrl", function ($scope, ZoneApi) {
	$scope.zoneList = swigTemplateData().zones;
	$scope.zoneNew = {name: '', vis: false}
    $scope.zoneAddVis = false;
    
    $scope.programList = [];
    $scope.programNew = {name: '', groups: [], vis: false}

	$scope.zoneCreate = function(identity){
		$scope.zoneList.push($scope.zoneNew);
		$scope.zoneNew = {name: '', vis: false};
		$scope.zoneAddVis = false;
	}

	$scope.delete = function(index){
		$scope.zoneList.splice(index, 1);
	}

	$scope.startEdit = function(index){
		$scope.zoneList[index].vis = true;
	}

	$scope.endEdit = function(identity, index){
	    ZoneApi.save({ id: index }, { number: index , name: $scope.zoneNew.name },
            function () {
                $scope.zoneList[index].name = $scope.zoneNew.name;
                $scope.zoneNew = { name: '', duration: '', vis: false };
                $scope.zoneList[index].vis = false;
            }, function () { alert('Yipes!'); }
        );
	}

	$scope.startAdd = function(){
		$scope.zoneAddVis = true;
    }

    $scope.programCreate = function (identity) {
        $scope.programList.push($scope.programNew);
        $scope.programNew = { name: '', vis: false };
        $scope.zoneAddVis = false;
    }

});