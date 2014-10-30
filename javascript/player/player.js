'use strict';
/**
* QuizzPlayer Module
*
* Description
*/
angular.module('QuizzPlayer', ['QuizzServices']).
controller('PlayerCtrl', ['$scope', '$rootScope', '$log', '$routeParams', '$location', '$timeout','WebSocketFactory', 'ModelFactory', 
	function($scope, $rootScope, $log, $routeParams, $location, $timeout, wsFactory, model){

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
		$scope.$apply(function(){
			$scope.player.load = false;
			$scope.player = data.player;
			if ($scope.player.unknown && $scope.player.gameStart){
				$scope.player.unknown = false;
				$scope.player.gameStart = true;
			}else if ($scope.player.unknown && $scope.player.gameFull){
				$scope.player.unknown = false;
				$scope.player.gameFull = true;
			}
		});
	});

	
	$rootScope.$on('clearScore', function(evt, data){
		window.location = "http://devfest.gdgnantes.com";
		//$location.path('/');
	});
}]);