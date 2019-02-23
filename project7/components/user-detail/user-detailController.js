'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource',
  function ($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log('UserDetail of ', userId);
    
    $scope.userDetail = {}
    var userDetail = $resource('/user/:userId');

    userDetail.get({'userId':userId}, function(user) {
      $scope.userDetail.user = user;
      $scope.userDetail.fullName = user.first_name + ' ' + user.last_name;
    });

  }]);
