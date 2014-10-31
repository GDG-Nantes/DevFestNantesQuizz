'use strict';
/**
* QuizzGame Module
*
* Description
*/
angular.module('QuizzGame', ['QuizzServices']).
controller('GameCtrl', ['$scope', '$rootScope', '$location', 'ModelFactory', 'WebSocketFactory', 'AudioFactory',
	function($scope, $rootScope,$location, model, wsFacotry, audio){


	var NB_QUESTIONS = model.NB_QUESTIONS;
	var index = 0;
	var allowResp = false;
	var musicOn = true;
	$scope.startGame = false;
	$scope.curentPage = 1;
	$scope.nbPages = 1;
	$scope.playerArray = [];
	$scope.textToggleMusic = "Stopper la musique";
	$scope.order = 'score';
	$scope.questionsPlayed = {};
	$scope.currentGame = {
		question : null,
		index : 0,
		questions : []
	}

	// On charge les questions
	$scope.questions = [];
	Papa.parse('http://'+location.hostname+':'+(location.port ? location.port : '80')+'/assets/csv/openquizzdb_fr.csv', {
		download: true,
		delimiter : ';',
		complete: function(results){
			$scope.questions = results.data;
		}
	});

	wsFacotry.getPlayers();

	/*
	* Utilities
	*/

	function getScoreToAdd(){
		return $scope.currentGame.index === 0 ? 0 : $scope.currentGame.index < 3 ? 5 : ($scope.currentGame.index < 6 ? 7 : 12);
	}

	function getUser(userTmp){
		for (var i = 0; i < $scope.playerArray.length; i++){
			if (userTmp.id === $scope.playerArray[i].id){
				return $scope.playerArray[i];
			}
		}
	}

	function getNextQuestion(){
		var found = false;
		var index = -1;
		// On cherche une question non exploitée
		while (!found){
			index = Math.floor(Math.random() * $scope.questions.length);
			if (!$scope.questionsPlayed['q'+index]){
				found = true;
				break;
			}
		}
		// si on en trouve pas c'est qu'on a tout exploité, alors, on repart de zéro
		if (index === -1){
			$scope.questionsPlayed = {};
			return getNextQuestion();
		}else{
			$scope.questionsPlayed['q'+index] = true;
			$scope.currentGame.questions.push(index);
			var questionToUse = $scope.questions[index];
			var question = {
				title : questionToUse[2], // La question est toujours là
				answer : questionToUse[3] // La réponse est toujours là
			};
			// On fait une répartition des questions
			var indexes = [-1,-1,-1,-1];
			found = false;
			while (!found){
				var indexTmp = Math.floor(Math.random()*4);		
				for (var i = 0; i < 4; i++){
					found = found || indexes[i] === indexTmp;						
				}
				if (!found){
					count: for (var i = 0; i< 4; i++){
						if (indexes[i] === -1){
							indexes[i] = indexTmp;
							break count;
						}
					}
				}

				found = true;
				for (var i = 0; i < 4; i++){
					found = found && indexes[i] != -1;
				}

			}
			question.answer0 = questionToUse[3+indexes[0]];
			question.answer1 = questionToUse[3+indexes[1]];
			question.answer2 = questionToUse[3+indexes[2]];
			question.answer3 = questionToUse[3+indexes[3]];

			return question;
		}
	}

	function getPreviousQuestion(){
		if ($scope.currentGame.index < $scope.currentGame.questions.length){
			return $scope.questions[$scope.currentGame.questions[$scope.currentGame.index]];
		}else{
			return null;
		}
	}

	/*
	* Datas From Ws
	*/

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
		$scope.$apply(function(){
			if (!allowResp){
				return;
			}
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


	/*
	* Datas From Admin
	*/

	$rootScope.$on('startGame', function(evt, data){
		$scope.$apply(function(){
			$scope.startGame = true;
			$scope.currentGame.question = null;
			$scope.currentGame.index = 0;
			$scope.currentGame.questions = [];
		});
	});

	$rootScope.$on('allowResp', function(evt, data){
		$scope.$apply(function(){
			// Permet de prendre en compte les réponses
			allowResp = true;
			if (musicOn){
				audio.stopJeopardy();
				//audio.playJeopardy();
			}
		});
	});

	$rootScope.$on('clickBtnValider', function(evt, data){
		$scope.$apply(function(){
			var playerTmp = getUser(data.data);
			$scope.order = 'id';
			$scope.order = 'score';
			playerTmp.score += getScoreToAdd();
			console.log(playerTmp.score);
			for (var i = 0; i < $scope.playerArray.length; i++){
				if ($scope.playerArray[i].id === playerTmp.id){
					$scope.playerArray[i].score = playerTmp.score;
					break;
				}
			}
			allowResp = false;
			/*_.map($scope.playerArray, function(player){
				player.anwserTreat = true;
				return player;
			});*/
			for (var i = 0; i < $scope.playerArray.length; i++){
				$scope.playerArray[i].anwserTreat = true;				
			}
			if (musicOn){
				audio.playReponse();
			}		

			try{
				$scope.$digest();
			}catch(e){}
		});
	});

	$rootScope.$on('clickBtnRefuser', function(evt, data){
		$scope.$apply(function(){
			var playerTmp = data.data;
			var player = null;
			for (var i = 0; i < $scope.playerArray.length; i++){
				if ($scope.playerArray[i].id === playerTmp.id){
					player = $scope.playerArray[i];
					break;
				}
			}
			if (!player){
				return;
			}
			$scope.order = 'id';
			$scope.order = 'score';
			player.score = Math.max(player.score - 2,0);
			player.anwserTreat = true;
		});
	});

	$rootScope.$on('goNext', function(evt, data){
		$scope.$apply(function(){
			allowResp = false;				
			/*if ($scope.curentPage >= $scope.nbPages)
	        	return;
	      	$scope.curentPage++;*/
	      	if ($scope.currentGame.index >= NB_QUESTIONS){
	      		return;
	      	}
	      	$scope.winner = null;
	      	$scope.currentGame.index++;
	      	if ($scope.currentGame.index === NB_QUESTIONS){
	      		var max = 0;
	      		$scope.winner = null;
	      		for (var i = 0; i < $scope.playerArray.length; i++){
					if ($scope.playerArray[i].score > max){
						$scope.winner = $scope.playerArray[i];
						max = $scope.winner.score;
					}
				}
	      		return;
	      	}else{
		      	$scope.currentGame.question = getNextQuestion();
		      	wsFacotry.sendData('currentQuestion', $scope.currentGame.question);	      		
	      	}
	    });
	});

	$rootScope.$on('goPrevious', function(evt, data){
		$scope.$apply(function(){
			allowResp = false;
			/*if ($scope.curentPage <= 1)
	        	return;
	      	$scope.curentPage--;*/
	      	if ($scope.currentGame.index <=0)
	      		return;
	      	$scope.currentGame.index--;
	      	$scope.currentGame.question = getPreviousQuestion();
	      	wsFacotry.sendData('currentQuestion', $scope.currentGame.question);
	      });
	});
	
	$rootScope.$on('toggleMusic', function(evt, data){
		$scope.$apply(function(){
			musicOn = !musicOn;
			$scope.textToggleMusic = musicOn ? "Stopper la musique" : "Remettre la musique";
			if (!musicOn){
				audio.stopJeopardy();
			}
		});
	});

	$rootScope.$on('RAZReponses', function(evt, data){
		$scope.$apply(function(){
			// Normallement remet les compteurs à zéro pour la prochaine question
			index = 0;
			_.map($scope.playerArray, function(player){
				player.answer = false;
				player.anwserTreat = false;
				player.index = 10;
				return player;
			});
		});
	});
	
	$rootScope.$on('RAZUtilisateurs', function(evt, data){
		$scope.$apply(function(){
			$scope.startGame = false;
			$scope.playerArray = [];
			wsFacotry.sendData('clearScore');
		});
	});

}]);