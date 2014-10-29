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
	$scope.validUser = false;

	$scope.connect = function(){
		wsFactory.tryToLogAdmin($scope.admin);
	};

	var unregisterAuth = $rootScope.$on('adminAuth', function(){
		$log.info("adminAuth");
		$scope.validUser = true;
		//$location.path('/game');
	});

	var unregisterRefused = $rootScope.$on('adminRefused', function(){
		$log.info("adminRefused");
		$scope.validUser = false;
		$location.path('/main');
	});

	var unregisterReady = $rootScope.$on('controlReady', function(){
		$log.info("controlReady");
		$location.path('/game');
	});

	$scope.$on('$routeChangeSuccess', function(next, current) { 
		if (current.$$route.controller != 'AdminCtrl'){
			unregisterAuth();
	   		unregisterRefused();
	   		unregisterReady();
		}
 	});
	
}])
.controller('ControlCtrl', ['$scope', '$rootScope', 'WebSocketFactory',
	function($scope, $rootScope, wsFacotry){


	var musicOn = true;
	var index = 0;
	var allowResp = false;
	$scope.gameInProgress = false;
	$scope.playerArray = [];
	$scope.textToggleMusic = "Stopper la musique";
	$scope.currentQuestion = null;
	
	wsFacotry.getPlayers();

	wsFacotry.sendData('controlReady',{});

	/*
	* Datas from WebSockets
	*/

	var unregisterPlayers = $rootScope.$on('getPlayers', function(evt, data){
		$scope.$apply(function(){
			$scope.playerArray = data.playerList;
		});
	});
	
	var unregisterPlayer = $rootScope.$on('PlayerRegister', function(evt, player){
		$scope.$apply(function(){
			$scope.playerArray.push(player);
		});
	});

	var unregisterResponse = $rootScope.$on('response', function(evt, data){
		$scope.$apply(function(){
			if (!allowResp){
				return;
			}
			var playerFound = _.find($scope.playerArray, {id : data.data.id});
			if (playerFound && !playerFound.answer){
				playerFound.index = index;
				playerFound.answer = true;
				index++;
			}
		});
	});

	var unregisterCurrentQuestion = $rootScope.$on('currentQuestion', function(evt,data){
		$scope.$apply(function(){
			$scope.currentQuestion = data.data;
		});
	});

	$scope.$on('$routeChangeSuccess', function(next, current) { 
		if (current.$$route.controller != 'ControlCtrl'){
			unregisterPlayers();
	   		unregisterPlayer();
	   		unregisterResponse();
		}
 	});

	/*
	* Actions
	*/

	$scope.startGame = function(){
		$scope.gameInProgress = true;
		$scope.currentQuestion = null;
		wsFacotry.sendData('startGame',{});
	}

	$scope.allowResp = function(){
		// Permet de prendre en compte les réponses
		allowResp = true;
		wsFacotry.sendData('allowResp',{});
	};

	$scope.clickBtnValider = function(player){
		wsFacotry.sendData('clickBtnValider',player);
		_.map($scope.playerArray, function(player){
			player.anwserTreat = true;
			return player;
		});
	};

	$scope.clickBtnRefuser = function(player){
		wsFacotry.sendData('clickBtnRefuser',player);
	};

	$scope.goNext = function(){
		wsFacotry.sendData('goNext',{});
		allowResp = false;		
	};

	$scope.goPrevious = function(){
		wsFacotry.sendData('goPrevious',{});
		allowResp = false;
	};
	
	$scope.toggleMusic = function(){
		wsFacotry.sendData('toggleMusic',{});
		musicOn = !musicOn;
		$scope.textToggleMusic = musicOn ? "Stopper la musique" : "Remettre la musique";
	};

	$scope.RAZReponses = function(){
		index = 0;
		_.map($scope.playerArray, function(player){
			player.answer = false;
			player.anwserTreat = false;
			player.index = 0;
			return player;
		});
		wsFacotry.sendData('RAZReponses',{});
	};
	
	$scope.RAZUtilisateurs = function(){
		$scope.gameInProgress = false;
		wsFacotry.sendData('RAZUtilisateurs',{});
		$scope.playerArray = [];
	};

}]);