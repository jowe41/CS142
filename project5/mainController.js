'use strict';

var cs142App = angular.module('cs142App', ['ngRoute', 'ngMaterial']);

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
            otherwise({
                redirectTo: '/users'
            });
    }]);

cs142App.controller('MainController', ['$scope', '$mdSidenav',
    function ($scope, $mdSidenav) {
        $scope.main = {};
        $scope.main.title = 'Users';


        $scope.toggleUserList = function(){
            $mdSidenav("users").toggle()
        };

        $scope.FetchModel = function(url, doneCallback){
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function(){
                if (this.readyState === 4 && this.status === 200){
                    doneCallback(JSON.parse(this.responseText));
                }
            };
            xhr.open("GET", url, true);
            xhr.send();
        };

        $scope.main.getVersionNumber = function(){
            $scope.FetchModel('/test/info', $scope.main.processVersionNumber);
        };

        $scope.main.processVersionNumber = function(info){
            $scope.$apply(function() {
                $scope.main.versionNumber = info.__v;
            });
        };

        $scope.main.getVersionNumber();
    }]);

