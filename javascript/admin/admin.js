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
	$scope.logo = "";

	

	$scope.connect = function(){
		wsFactory.tryToLogAdmin($scope.admin);
	};

	var unregisterReadyEvt = $rootScope.$on('readyEvt', function(evt, data){
		$scope.$apply(function(){
			$scope.logo = model.config().logo;
		});
	});

	var unregisterAuth = $rootScope.$on('adminAuth', function(){
		$scope.$apply(function(){
			$log.info("adminAuth");
			$scope.validUser = true;
		});
		//$location.path('/game');
	});

	var unregisterRefused = $rootScope.$on('adminRefused', function(){
		$scope.$apply(function(){
			$log.info("adminRefused");
			$scope.validUser = false;
			$location.path('/main');
		});
	});

	var unregisterReady = $rootScope.$on('controlReady', function(){
		$scope.$apply(function(){
			$log.info("controlReady");
			$location.path('/game');
		});
	});

	$scope.$on('$routeChangeSuccess', function(next, current) { 
		if (current.$$route.controller != 'AdminCtrl'){
			unregisterAuth();
	   		unregisterRefused();
	   		unregisterReady();
	   		unregisterReadyEvt(); 
		}
 	});

 	wsFactory.getConfig();
	
}])
.controller('ControlCtrl', ['$scope', '$rootScope', 'WebSocketFactory', 'ModelFactory',
	function($scope, $rootScope, wsFacotry, model){


	var musicOn = true,
		index = 0,
		indexQuestions = 0,
		allowResp = false,
		NB_QUESTIONS = -1;
	$scope.gameInProgress = false;
	$scope.playerArray = [];
	$scope.textToggleMusic = "Stopper la musique";
	$scope.currentQuestion = null;
	$scope.gameFinish = false;
	$scope.modeFifo = false;
	$scope.modeRumble = false;
	$scope.indexQuestion = 0;
	
	wsFacotry.getPlayers();

	wsFacotry.sendData('controlReady',{});

	// On restore l'état précédent
	if (localStorage['stateControl']){
		var state = JSON.parse(localStorage['stateControl']);
		$scope.playerArray = state.playerList;
		$scope.gameInProgress = state.gameInProgress;
		$scope.currentQuestion = 	state.currentQuestion;
		indexQuestions = state.indexQuestions; 
	}


	function saveState(){
		localStorage['stateControl'] = JSON.stringify({
			playerList : $scope.playerArray,
			gameInProgress : $scope.gameInProgress,
			currentQuestion : $scope.currentQuestion,
			'indexQuestions' : indexQuestions
		});
	}

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
			$scope.indexQuestion = data.data.index;		
		});
	});

	var unregisterNbQuestions = $rootScope.$on('configEvt', function(evt, data){
		NB_QUESTIONS = data.data.nbQuestions;
		$scope.modeFifo = data.data.mode === model.MODE_FIFO;
		$scope.modeRumble = data.data.mode === model.MODE_RUMBLE;
	});

	$scope.$on('$routeChangeSuccess', function(next, current) { 
		if (current.$$route.controller != 'ControlCtrl'){
			unregisterPlayers();
	   		unregisterPlayer();
	   		unregisterResponse();
	   		unregisterNbQuestions();
		}
 	});

	/*
	* Actions
	*/

	$scope.startGame = function(){
		$scope.gameFinish = false;
		indexQuestions = 0;
		$scope.gameInProgress = true;
		$scope.currentQuestion = null;
		wsFacotry.sendData('startGame',{});
	}

	$scope.allowResp = function(){
		// Permet de prendre en compte les réponses
		allowResp = true;
		wsFacotry.sendData('allowResp',{});
	};

	$scope.showResp = function(){
		wsFacotry.sendData('showResp',{});	
		saveState();
	};

	$scope.clickBtnValider = function(player){
		wsFacotry.sendData('clickBtnValider',player);
		angular.forEach($scope.playerArray, 
		//_.map($scope.playerArray, 
			function(player){			
			player.answerTreat = true;
			return player;
		});
		saveState();
	};

	$scope.clickBtnRefuser = function(player){
		wsFacotry.sendData('clickBtnRefuser',player);
		player.answerTreat = true;
		saveState();
	};

	$scope.goNext = function(){
		if (indexQuestions <= NB_QUESTIONS){
			indexQuestions++;
			wsFacotry.sendData('goNext',{});
			allowResp = false;
			$scope.RAZReponses();		
			$scope.allowResp();
			if (indexQuestions > NB_QUESTIONS){
				$scope.gameFinish = true;
			}
		}else{
			$scope.gameFinish = true;
		}
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
		angular.forEach($scope.playerArray,
		//_.map($scope.playerArray, 
			function(player){
			player.answer = false;
			player.answerTreat = false;
			player.index = 100;
			player.choice = null;
			return player;
		});
		wsFacotry.sendData('RAZReponses',{});
	};
	
	$scope.RAZUtilisateurs = function(){
		indexQuestions = 0;
		$scope.gameFinish = false;
		$scope.gameInProgress = false;
		wsFacotry.sendData('RAZUtilisateurs',{});
		$scope.playerArray = [];
		localStorage.clear();
	};

}]);