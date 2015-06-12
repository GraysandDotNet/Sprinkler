var app = angular.module('sprinklerApp', []);

app.controller('ZoneListCtrl', function ($scope) {
	$scope.zones = [];
	$scope.newZone = {index: '', name: '', duration: ''}

	$scope.createZone = function(identity){
			$scope.newZone.index = $scope.zones.length + 1;
			$scope.zones.push($scope.newZone);
			$scope.newZone = {index: '', name: '', duration: ''};
			disable_visibility(identity);

	}

});