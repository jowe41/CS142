'use strict';

cs142App.controller('UserPhotosController', ['$scope', '$routeParams', '$resource', '$http', '$rootScope',
  function($scope, $routeParams, $resource, $http, $rootScope) {
    /*
     * Since the route is specified as '/photos/:userId' in $routeProvider config the
     * $routeParams  should have the userId property set with the path from the URL.
     */
    var userId = $routeParams.userId;
    console.log('UserPhoto of ', $routeParams.userId);
    $scope.userPhotos = {};
    $scope.userPhotos.photos = [];
    $scope.userPhotos.comments = {};
    $scope.userPhotos.noPhoto = false;


    var photosRes = $resource('/photosOfUser/:userId');

    $scope.userPhotos.init = function (){
      photosRes.query({'userId':userId}, function(photos) {
        if (photos.length === 0) {
            $scope.userPhotos.noPhoto = true;
        }
        photos = photos.sort(function (photo1, photo2) {
          if(photo1.like.length === photo2.like.length) {
            var date1 = Date.parse(photo1.date_time.split(" "));
            var date2 = Date.parse(photo2.date_time.split(" "));
            return date2-date1
          }
          return photo2.like.length - photo1.like.length
        })
        $scope.userPhotos.photos = photos;
        
      })
    }

    $scope.userPhotos.init();

    $scope.userPhotos.addComment = function(photo){
      var data = JSON.stringify({comment: $scope.userPhotos.comments[photo._id]})
      $http.post('/commentsOfPhoto/' + photo._id, data).then(function successCallback(response){
        $rootScope.$broadcast('commentAdded')
        console.log(response.data)
      }, function errorCallback(response){
        console.log(response.data)
      });
      $scope.userPhotos.comments[photo._id] = "";

    }

    $scope.userPhotos.deleteComment = function(photo, comment) {
      if (!confirm('Are you sure you want to delete this comment?')) {
        return;
      }
      $http.post('/deleteComment', JSON.stringify({photo_id: photo._id, comment_id:comment._id})).then(function successCallback(response){
        $rootScope.$broadcast('commentDeleted')
      }, function errorCallback(response){
        console.log(response.data);
      });
    };

    $scope.userPhotos.hasAuthorityToComment = function(comment) {
      if ($scope.main.loggedInUser) {
        return $scope.main.loggedInUser._id === comment.user._id;
      }
    }

    $scope.userPhotos.deletePhoto = function(photo) {
      if(!confirm('Are you sure you want to delete this photo?')) {
        return;
      };
      $http.post('/deletePhoto', JSON.stringify({photo_id: photo._id})).then(function successCallback(response) {
        $rootScope.$broadcast('photoDeleted')
      }, function errorCallback(response){
        console.log(response.data)
      });
    };

    $scope.userPhotos.hasAuthorityToPhoto = function(photo) {
      if ($scope.main.loggedInUser) {
        return $scope.main.loggedInUser._id === photo.user_id;
      };
    };

    $scope.userPhotos.likePhoto = function(photo) {
      if (!$scope.main.loggedInUser) {
        return;
      }
      $http.post('/likePhoto/'+ photo._id, JSON.stringify({photo_id: photo._id})).then(function successCallback(response){
        $rootScope.$broadcast('photoLiked')
      }, function errorCallback(response){
        console.log(response.data)
      });
    };


    $scope.$on('commentAdded', $scope.userPhotos.init);
    $scope.$on('commentDeleted', $scope.userPhotos.init);
    $scope.$on('photoDeleted', $scope.userPhotos.init);
    $scope.$on('photoLiked', $scope.userPhotos.init);
  }]);
