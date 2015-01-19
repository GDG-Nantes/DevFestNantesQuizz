'use strict';
/**
* QuizzPlayer Module
*
* Description
*/
angular.module('QuizzPlayer', ['QuizzServices']).
controller('PlayerCtrl', ['$scope', '$rootScope', '$log', '$routeParams', '$location', '$timeout','WebSocketFactory', 'ModelFactory', 'AudioFactory', 
	function($scope, $rootScope, $log, $routeParams, $location, $timeout, wsFactory, model, audio){

	$scope.player = model.singlePlayer;
	$scope.player.id = $routeParams.playerId;
	$scope.player.load = true;
	$scope.proximityCompat = window.DeviceProximityEvent;
	$scope.modeFifo = false;
	$scope.modeRumble = false;
	$scope.canShow = false;
	$scope.classAnswer1 = '';
	$scope.classAnswer2 = '';
	$scope.classAnswer3 = '';
	$scope.classAnswer4 = '';
	$scope.alreadyAnwser = false;
	$scope.indexQuestion = 0;

	$scope.reponse = function(choice){
		if (!$scope.alreadyAnwser){
			if (choice === 0){
				$scope.classAnswer1 = 'btn-success';
			}else if (choice === 1){
				$scope.classAnswer2 = 'btn-success';
			}else if (choice === 2){
				$scope.classAnswer3 = 'btn-success';
			}else{
				$scope.classAnswer4 = 'btn-success';
			}
		}
		$scope.alreadyAnwser = true;
		wsFactory.sendData('response',{
			id: $scope.player.id,
			data : $scope.player.pseudo,
			answer : choice
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
			}else if ($scope.player.unknown && $scope.player.usePseudo){
				$scope.player.unknown = false;
				$scope.player.usePseudo = true;
			}else if (!$scope.player.unknown){
				$scope.modeFifo = model.config().mode === model.MODE_FIFO;
				$scope.modeRumble = model.config().mode === model.MODE_RUMBLE;				
			}
		});
	});


	$rootScope.$on('showResp', function(evt,data){
		$scope.$apply(function(){
			$scope.canShow = false;
		});
	});

	$rootScope.$on('goNext', function(evt, data){
		$scope.$apply(function(){
			$scope.canShow = true;
			$scope.classAnswer1 = '';
			$scope.classAnswer2 = '';
			$scope.classAnswer3 = '';
			$scope.classAnswer4 = '';
			$scope.alreadyAnwser = false;
		});
	});

	$rootScope.$on('currentQuestion', function(evt, data){
		$scope.$apply(function(){
			$scope.indexQuestion = data.data.index;
		});
	});
	
	$rootScope.$on('clearScore', function(evt, data){
		window.location = "http://devfest.gdgnantes.com";
		//$location.path('/');
	});

	$rootScope.$on('winnerEvt', function(evt, data){
		if (data.data === $scope.player.id){
			audio.playDonuts();
		}
	});

	$rootScope.$on('looserEvt', function(evt, data){
		if (data.data === $scope.player.id){
			audio.playDoh();
		}
	});

	
}]);