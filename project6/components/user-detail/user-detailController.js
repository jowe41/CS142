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

    $scope.userDetail.getUserData = function(){
        var userDetailResouce = $resource('/user/'+userId);
        var userData = userDetailResouce.get({'userId': userId}, function() {
          $scope.userDetail.userData = userData;
          $scope.userDetail.fullName = userData.first_name + ' ' + userData.last_name;
      });
    };

    $scope.userDetail.getUserData(userId);
  }]);
