angular.module('blogApp').controller('loginController', ['$scope', '$http', '$window', function($scope, $http, $window) {

	$scope.submit = function() {
		// console.log($scope.user);
		$http
			.post('/api/auth', $scope.user)
			.success(function(data, status, headers, config) {
				if (data.token) {
					console.log(data.token);
					//save it to localstorage
				}
				else {
					console.log(data.message);
				}
			})
			.error(function(data, status, headers, config) {
				console.log("Error!");
			});
	}
}])