'use strict';

cs142App.controller('LoginRegisterController', ['$scope', '$resource','$location', '$http', '$rootScope', 
	function($scope, $resource, $location,$http, $rootScope){
		$scope.login = {};
		$scope.login.loginName = "";
		$scope.login.password = "";
		$scope.login.errorMessage = "";
		$scope.register = {};
		$scope.register.userName = "";
		$scope.register.password1 = "";
		$scope.register.password2 = "";
		$scope.register.firstName = "";
        $scope.register.lastName = "";
        $scope.register.description = "";
        $scope.register.occupation = "";
        $scope.register.location = "";
        $scope.register.errorMessage = "";


		$scope.login.submit = function(isValid) {
			if (!isValid) {
                $scope.login.errorMessage = "The password length should exceed 6!";
                return ;
            }

            if (!!$scope.login.loginName && !!$scope.login.password){
                var requestObject = {
                    login_name: $scope.login.loginName,
                    password: $scope.login.password
                };
                $http.post('/admin/login', JSON.stringify(requestObject)).then(function successCallback(response) {
                    $scope.main.loggedInUser = response.data;
                    $rootScope.$broadcast('loggedIn');
                    $location.path("/users/" + $scope.main.loggedInUser._id);
                }, function errorCallback(response) {
                    $scope.login.errorMessage = response.data;
                    console.log(response.data);
                });
            } else {
                $scope.login.errorMessage = "Please complete the form!";
            }
        };

		$scope.register.newUser = function(isValid) {
			if (!isValid) {
				$scope.register.errorMessage = "The length of password is incorrect.";
				return;
			}
			if ($scope.register.userName === "" || $scope.register.password1 === "" || $scope.register.password2 === "" 
                || $scope.register.firstName === "" || $scope.register.lastName === "" || $scope.register.description === ""
                || $scope.register.location === "" || $scope.register.occupation === "") {
				$scope.register.errorMessage = "Please complete the register form.";
				return;
			}

			if ($scope.register.password1 !== $scope.register.password2) {
				$scope.register.errorMessage = "The passwords are not matched, enter again.";
				return;
			}

			var newUser = {
				login_name: $scope.register.userName,
				first_name: $scope.register.firstName,
				last_name: $scope.register.lastName,
				description: $scope.register.description,
                location: $scope.register.location,
                occupation :$scope.register.occupation,
                password: $scope.register.password1
			};
			$http.post('/user', JSON.stringify(newUser)).then(function successCallback(response) {
                $scope.main.loggedInUser = response.data;
                $rootScope.$broadcast('loggedIn');
                $location.path("/users/" + $scope.main.loggedInUser._id);
                $scope.register.reset();
            }, function errorCallback(response) {
                console.log(response.data);
                $scope.register.errorMessage = response.data;
            });
			
		}

		$scope.login.reset = function() {
			$scope.login.loginName = "";
			$scope.login.password = "";
			$scope.login.errorMessage = "";
		}

		$scope.register.reset = function () {
            $scope.register.userName = "";
            $scope.register.firstName = "";
            $scope.register.lastName = "";
            $scope.register.description = "";
            $scope.register.occupation = "";
            $scope.register.location = "";
            $scope.register.password1 = "";
            $scope.register.password2 = "";
            $scope.register.errorMessage = "";
        };

	}]);