var app = angular.module("sprinklerApp", []);

app.controller("zoneCtrl", function ($scope) {
	$scope.zoneList = [];
	$scope.zoneNew = {name: '', vis: false}
	$scope.zoneAddVis = false;

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
		$scope.zoneList[index].name = $scope.zoneNew.name;
		$scope.zoneNew = {name: '', duration: '', vis: false};
		$scope.zoneList[index].vis = false;
	}

	$scope.startAdd = function(){
		$scope.zoneAddVis = true;
	}

});