'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', 
  function($scope, $routeParams) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log('UserPhoto of ', $routeParams.userId);
    $scope.userPhotos = {};
    
    $scope.userPhotos.getUserPhotos = function(userId){
        $scope.FetchModel('/photosOfUser/' + userId, $scope.userPhotos.processUserPhotos);
    };

    $scope.userPhotos.processUserPhotos = function(userPhotos){
        $scope.$apply(function(){
            $scope.userPhotos.photos = userPhotos;
        });
    };

    $scope.userPhotos.getUserPhotos(userId);
  }]);
