'use strict';
/**
* QuizzAdmin Module
*
* Description
*/
angular.module('QuizzAdmin', ['QuizzServices']).
controller('AdminCtrl', ['$scope', '$rootScope', '$log', '$location','WebSocketFactory', 'ModelFactory',  
	function($scope, $rootScope, $log, $location, wsFactory, model){

	$scope.$log = $log;

	$scope.connect = function(){
		wsFactory.tryToLogAdmin($scope.admin);
	};

	var unregisterAuth = $rootScope.$on('adminAuth', function(){
		$log.info("adminAuth");
		$location.path('/game');
	});

	var unregisterRefused = $rootScope.$on('adminRefused', function(){
		$log.info("adminRefused");
		$location.path('/main');
	});

	$scope.$on('$routeChangeSuccess', function(next, current) { 
		if (current.$$route.controller != 'AdminCtrl'){
			unregisterAuth();
	   		unregisterRefused();
		}
 	});
	
}]);