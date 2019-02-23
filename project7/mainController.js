'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial', 'ngResource']);

cs142App.config(['$routeProvider',
    function ($routeProvider) {
        $routeProvider.
            when('/users', {
                templateUrl: 'components/user-list/user-listTemplate.html',
                controller: 'UserListController'
            }).
            when('/users/:userId', {
                templateUrl: 'components/user-detail/user-detailTemplate.html',
                controller: 'UserDetailController'
            }).
            when('/photos/:userId', {
                templateUrl: 'components/user-photos/user-photosTemplate.html',
                controller: 'UserPhotosController'
            }).
            when('/login-register', {
                templateUrl: 'components/login-register/login-registerTemplate.html',
                controller: 'LoginRegisterController'
            }).
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$mdSidenav', '$resource', '$location', '$rootScope', '$http',
    function ($scope, $mdSidenav, $resource, $location, $rootScope, $http) {
        $scope.main = {};
        $scope.main.title = 'Photo Sharing App';
        $scope.main.author = 'Yumeng Yue'
        $scope.main.loggedInUser = undefined;
        $scope.main.selectedPhotoFile = undefined;

        $rootScope.$on( "$routeChangeStart", function(event, next, current) {
            if ($scope.main.loggedInUser === undefined) {
                var requestObject = {login_name: "session"};
                $http.post('/admin/login', JSON.stringify(requestObject)).then(function successCallback(response){
                    if (response) {
                        $scope.main.loggedInUser = response.data;
                        $location.path('/users/' + $scope.main.loggedInUser._id)
                    }
                }, function errorCallback(response) {
                    console.log(response.data);
                });
                // no logged user, redirect to /login-register unless already there
                if (next.templateUrl !== "components/login-register/login-registerTemplate.html") {
                    $location.path("/login-register");
                }
            }
        });

        $scope.showUserList = function(){
            $mdSidenav("users").toggle()
        };

        $scope.main.logout = function(){
            $http.post('/admin/logout', '').then(function successCallback(response) {
                $scope.main.loggedInUser = undefined;
                $location.path('/login-register');
            }, function errorCallback(response) {
                console.log(response.data);
            });
        };

        // Called on file selection - we simply save a reference to the file in selectedPhotoFile
        $scope.main.inputFileNameChanged = function (element) {
            $scope.main.selectedPhotoFile = element.files[0];
        };

        // Has the user selected a file?
        $scope.main.inputFileNameSelected = function () {
            return !!$scope.main.selectedPhotoFile;
        };
    
        $scope.main.uploadPhoto = function () {
            if (!$scope.main.inputFileNameSelected()) {
                console.error("uploadPhoto called will no selected file");
            return;
        }
            console.log('fileSubmitted', $scope.main.selectedPhotoFile);

            // Create a DOM form and add the file to it under the name uploadedphoto
            var domForm = new FormData();
            domForm.append('uploadedphoto', $scope.main.selectedPhotoFile);

            // Using $http to POST the form
            $http.post('/photos/new', domForm, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            }).then(function successCallback(response){
                $rootScope.$broadcast("photoUploaded")
                $location.path('/photos/' + $scope.main.loggedInUser._id)
                console.log(response.data);
            }, function errorCallback(response){
                console.error('ERROR uploading photo', response);
            });

        };
        $scope.main.getVersionNumber = function(){
            var infoResource = $resource('/test/info');
            var info = infoResource.get({}, function(){
                $scope.main.versionNumber = info.__v;
            });
        };

        $scope.main.getVersionNumber();

        
    }]);

