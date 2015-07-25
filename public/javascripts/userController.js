var app = angular.module("sprinklerApp", [ "xeditable", "ngResource" ]);


app.factory( "UserApi", function( $resource )
{
	return $resource(	"/api/user/:id",
						{ id: "@_id" },	//	auto-extract _id from given data, and insert into url
	   {
	   	'save': { method: 'POST' },
	   	'getAll': { method: 'GET', isArray: true },
	   	'get': { method: 'GET', isArray: false },
	   	'update': { method: 'PUT' },
	   	'remove': { method: 'DELETE' }
	   } );
} );

app.controller( "userCtrl", function( $scope, UserApi )
{
	$scope.authEnum =	[
							{ value: 0, text: 'View-Only' },
							{ value: 1, text: 'User' },
							{ value: 2, text: 'Administrator' }
						];


	var data = swigTemplateData( );

	$scope.userList = data.users;
	
	//	function used in ng-show, with user provider, to determine which provider img tag to show
	$scope.providerIs = function( user, providerToMatch )
	{
		return (user._id == 0 ) || ( providerToMatch == user.provider );
	};
	
	//	return validated string corresponding to user priv,
	$scope.userPriv = function( user )
	{
		var index = user.priv;
		if ( index >= 0 && index < $scope.authEnum.length )
			return ($scope.authEnum[ user.priv ].text);
		return "Not set";
	};
	
	
	/* private */ function removeRow( $scope, index ) 
	{
		//	if it succeeds, splice out the index:
		$scope.userList.splice(index, 1);
	}
	

	$scope.delete = function( user, index )
	{
		if (user._id == 0) 
		{
			removeRow( $scope, index);
		}	
		//	should do an are-you-sure dialog here...
		if( confirm( "Remove " + user.name + "?" ) )
			//	invoke the factory delete method, passing in just the mongo db _id for this user, onsuccess remove row
			//	http DELETE /api/user/:id 
			UserApi.remove( { id: user._id }, function() { removeRow( $scope, index ); } );
	};
	
	$scope.submit = function( user, index ) 
	{
		//	send post to server.
		if( user._id == 0 )
			//	invoke the factory create method
			//	http POST /api/user/  
		UserApi.save( { id: '' }, 
						user, 
						function() { alert( 'worked' ); }, 
						function() { alert( 'failed' ); }
					);
		else
			//	invoke the factory update method
			//	http PUT /api/user/:id
			UserApi.update( { id: user._id }, user, function(res) { alert( 'success' ) }, alert('error') );
	}

	$scope.endRowEdit = function( identity, index )
	{
		$scope.userList[index].name = $scope.userNew.name;
		$scope.userNew = {name: '', duration: '', vis: false};
		$scope.userList[index].vis = false;
	};

	$scope.startAdd = function()
	{
		$scope.newUser = {
			_id : 0,
			priv : 1,
			provider : 'local',
			username : 'username',
			password : 'password'
		};
		$scope.userList.push($scope.newUser);
    }


});