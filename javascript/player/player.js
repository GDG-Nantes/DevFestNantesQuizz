'use strict';
/**
* QuizzPlayer Module
*
* Description
*/
angular.module('QuizzPlayer', ['QuizzServices']).
controller('PlayerCtrl', ['$scope', '$rootScope', '$log', '$routeParams', '$location','WebSocketFactory', 'ModelFactory', 
	function($scope, $rootScope, $log, $routeParams, $location, wsFactory, model){

	$scope.player = model.singlePlayer;
	$scope.player.id = $routeParams.playerId;
	$scope.player.load = true;
	$scope.proximityCompat = window.DeviceProximityEvent;

	$scope.reponse = function(){
		wsFactory.sendData('response',{
			id: $scope.player.id,
			data : $scope.player.pseudo
		});
	};

	wsFactory.getPlayer($scope.player.id);

	$rootScope.$on('playerInfo', function(evt, data){
		$scope.player.load = false;
		$scope.player = data.player;
	});

	$rootScope.$on('clearScore', function(evt, data){
		$location.path('/');
	});
}]);