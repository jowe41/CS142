'use strict';

cs142App.controller('UserDetailController', ['$scope', '$routeParams', '$resource', '$http','$rootScope', '$location',
  function ($scope, $routeParams, $resource, $http, $rootScope, $location) {
    /*
     * Since the route is specified as '/users/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log('UserDetail of ', userId);
    
    $scope.userDetail = {}
    var userDetail = $resource('/user/:userId');
    var userPhoto = $resource ('/userPhoto/:userId')

    userDetail.get({'userId':userId}, function(user) {
      $scope.userDetail.user = user;
      $scope.userDetail.fullName = user.first_name + ' ' + user.last_name;
    });

    userPhoto.get({'userId':userId}, function(photo){
      $scope.userDetail.mostRecentlyPhoto = photo.mostRecentlyPhoto;
      $scope.userDetail.mostCommentedPhoto = photo.mostCommentedPhoto;
    })

    $scope.userDetail.showDetail = function(photo){
      $location.path('/photos/' + photo.user_id);
      $rootScope.$broadcast('bottom');
    }

    $scope.userDetail.hasAuthority = function(){
      if ($scope.main.loggedInUser){
        return $scope.main.loggedInUser._id === userId;
      }
    }

    $scope.userDetail.deleteUser = function(err, user){
      if (!$scope.userDetail.hasAuthority) {
        return;
      };
      if (!confirm('Are you sure you want to delete this account?')){
        return;
      };
      $http.post('/deleteUser', JSON.stringify({user: $scope.main.loggedInUser})).then(function successCallback(response){
        $scope.main.loggedInUser = undefined;
        $rootScope.$broadcast('userDeleted');
        $location.path('/login-register');
      }, function errorCallback(response){
        console.log(response.data);
      });
    };


  }]);
