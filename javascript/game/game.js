'use strict';
/**
* QuizzGame Module
*
* Description
*/
angular.module('QuizzGame', ['QuizzServices']).
controller('GameCtrl', ['$scope', '$rootScope', '$location', 'ModelFactory', 'WebSocketFactory', 'AudioFactory',
	function($scope, $rootScope,$location, model, wsFacotry, audio){


	var index = 0;
	var allowResp = false;
	var musicOn = true;
	$scope.curentPage = 1;
	$scope.nbPages = 1;
	$scope.playerArray = [];
	$scope.textToggleMusic = "Stopper la musique";
	$scope.order = 'score';

	/*if (!model.isAdminLogged()){
		$location.path('/main');
	}*/

	wsFacotry.getPlayers();

	$rootScope.$on('getPlayers', function(evt, data){
		$scope.$apply(function(){
			$scope.playerArray = data.playerList;
		});
	});
	
	$rootScope.$on('PlayerRegister', function(evt, player){
		$scope.$apply(function(){
			$scope.playerArray.push(player);
		});
	});

	$rootScope.$on('response', function(evt, data){
		if (!allowResp){
			return;
		}
		$scope.$apply(function(){
			var playerFound = _.find($scope.playerArray, {id : data.data.id});
			if (playerFound && !playerFound.answer){
				playerFound.index = index;
				playerFound.answer = true;
				index++;
				if (index <= 5 && musicOn){
					audio.stopJeopardy();
					audio.playBuzz();
				}
				// TODO Jouer un son à limiter à 20
			}
		});
	});

	$scope.allowResp = function(){
		// Permet de prendre en compte les réponses
		allowResp = true;
		if (musicOn){
			audio.stopJeopardy();
			audio.playJeopardy();
		}
	};

	$scope.clickBtnValider = function(player){
		$scope.order = 'id';
		$scope.order = 'score';
		var scoreToAdd = $scope.curentPage < 3 ? 5 : ($scope.curentPage < 6 ? 7 : 12);
		player.score += scoreToAdd;
		allowResp = false;
		_.map($scope.playerArray, function(player){
			player.anwserTreat = true;
			return player;
		});
		if (musicOn){
			audio.playReponse();
		}
	};

	$scope.clickBtnRefuser = function(player){
		$scope.order = 'id';
		$scope.order = 'score';
		player.score = Math.max(player.score - 1,0);
		player.anwserTreat = true;
	};

	$scope.goNext = function(){
		allowResp = false;		
		if ($scope.curentPage >= $scope.nbPages)
        	return;
      	$scope.curentPage++;
	};

	$scope.goPrevious = function(){
		allowResp = false;
		if ($scope.curentPage <= 1)
        	return;
      	$scope.curentPage--;
	};
	
	$scope.toggleMusic = function(){
		musicOn = !musicOn;
		$scope.textToggleMusic = musicOn ? "Stopper la musique" : "Remettre la musique";
		if (!musicOn){
			audio.stopJeopardy();
		}
	};

	$scope.RAZReponses = function(){
		// Normallement remet les compteurs à zéro pour la prochaine question
		index = 0;
		_.map($scope.playerArray, function(player){
			player.answer = false;
			player.anwserTreat = false;
			player.index = 0;
			return player;
		});
	};
	
	$scope.RAZUtilisateurs = function(){
		$scope.playerArray = [];
		wsFacotry.sendData('clearScore');
	};

}]);