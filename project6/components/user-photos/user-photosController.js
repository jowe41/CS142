'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource',
  function($scope, $routeParams, $resource) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log('UserPhoto of ', $routeParams.userId);
    $scope.userPhotos = {};
    
    $scope.userPhotos.getUserPhotos = function(userId){
      var photoResource = $resource('/photosOfUser/'+userId);
      var userPhotos = photoResource.query({'userId':userId}, function(){
            $scope.userPhotos.photos = userPhotos;
        });
    };

    $scope.userPhotos.getUserPhotos(userId);
  }]);
