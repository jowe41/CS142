'use strict';

cs142App.controller('UserListController', ['$scope', '$resource',
    function ($scope, $resource) {
        $scope.main.title = 'Users';
		$scope.userList = {};

		$scope.userList.users = [];
		var userList = $resource('/user/list');
		$scope.userList.init = function() {
			userList.query({}, function(users) {
				$scope.userList.users = users;
			});
		};

		$scope.userList.init();

 }]);

