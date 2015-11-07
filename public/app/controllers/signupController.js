angular.module('blogApp').controller('signupController', ['$scope', '$http', function($scope, $http) {
	$scope.register = function(user) {
		console.log(user);
	}
}]);