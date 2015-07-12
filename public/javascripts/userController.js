var app = angular.module("sprinklerApp", []);

app.controller( "userCtrl", function( $scope ) 
{
	var data = swigTemplateData( );

	$scope.userList = data.users;
	$scope.userNew = {name: '', vis: false}
    $scope.userAddVis = false;
    
	$scope.userCreate = function( identity )
	{
		$scope.userList.push($scope.userNew);
		$scope.userNew = {name: '', vis: false};
		$scope.userAddVis = false;
	}

	$scope.delete = function( index )
	{
		$scope.userList.splice(index, 1);
	}

	$scope.startEdit = function(index){
		$scope.userList[index].vis = true;
	}

	$scope.endEdit = function( identity, index )
	{
		$scope.userList[index].name = $scope.userNew.name;
		$scope.userNew = {name: '', duration: '', vis: false};
		$scope.userList[index].vis = false;
	}

	$scope.startAdd = function()
	{
		$scope.userAddVis = true;
    }


});