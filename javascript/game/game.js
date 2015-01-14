'use strict';
/**
* QuizzGame Module
*
* Description
*/
angular.module('QuizzGame', ['QuizzServices']).
controller('GameCtrl', ['$scope', '$rootScope', '$location', 'ModelFactory', 'WebSocketFactory', 'AudioFactory',
	function($scope, $rootScope,$location, model, wsFacotry, audio){


	var NB_QUESTIONS = model.config().NB_QUESTIONS;
	var index = 0;
	var allowResp = false;
	var musicOn = true;
	$scope.startGame = false;
	$scope.curentPage = 1;
	$scope.nbPages = 1;
	$scope.playerArray = [];
	$scope.podium = [];
	$scope.textToggleMusic = "Stopper la musique";
	$scope.order = 'score';
	$scope.questionsPlayed = {};
	$scope.logo = "";
	$scope.currentGame = {
		question : null,
		index : 0,
		canShow : true,
		questions : []
	}

	// On charge les questions
	$scope.questions = [];
	function readyToPlay(){
		$scope.logo = model.config().logo;
		NB_QUESTIONS = model.config().NB_QUESTIONS;		
		Papa.parse(model.URL+'/assets/csv/'+model.config().csv, {
			download: true,
			delimiter : ';',
			complete: function(results){
				$scope.questions = results.data;
				if (model.config().NB_QUESTIONS === -1){
					NB_QUESTIONS = results.data.length;
				}
				sendConfig(); 
			}
		});
	}

	wsFacotry.getPlayers();
	wsFacotry.getConfig();

	// On restore l'état précédent
	if (localStorage['stateGame']){
		var state = JSON.parse(localStorage['stateGame']);
		$scope.playerArray = state.playerList;
		$scope.currentGame = state.currentGame;
		$scope.startGame = 	state.startGame;
		$scope.questionsPlayed = state.questionsPlayed; 
		wsFacotry.sendData('currentQuestion', $scope.currentGame.question);	     
	}

	/*
	* Utilities
	*/

	function getScoreToAdd(){
		return model.getPonderation($scope.currentGame.index);
	}

	function getUser(userTmp){
		for (var i = 0; i < $scope.playerArray.length; i++){
			if (userTmp.id === $scope.playerArray[i].id){
				return $scope.playerArray[i];
			}
		}
		return null;
	}

	function getNextQuestion(){
		var found = false;
		var index = -1;
		// On cherche une question non exploitée
		while (!found){
			if (model.config().mode === model.MODE_FIFO){ // En mode Fifo, on renvoie dans l'ordre
				index = Math.floor(Math.random() * $scope.questions.length);
			}else{
				index++;
			}
			if (!$scope.questionsPlayed['q'+index]){
				found = true;
				break;
			}

			if (index >= $scope.questions.length){
				found = true;
				index = -1;
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
			question.classAnswer0 = 'btn-warning';
			question.classAnswer1 = 'btn-warning';
			question.classAnswer2 = 'btn-warning';
			question.classAnswer3 = 'btn-warning';

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

	function sendConfig(){
		wsFacotry.sendData('configEvt', {
			nbQuestions : NB_QUESTIONS,
			mode : model.config().mode
		});

	}

	function sendScores(){
		var listScores = [];
		for (var i = 0; i < $scope.playerArray.length; i++){
			listScores.push({
				id : $scope.playerArray[i].id,
				score : $scope.playerArray[i].score
			});
		}
		wsFacotry.sendData('updateScore', listScores);

		localStorage['stateGame'] = JSON.stringify({
			playerList : $scope.playerArray,
			currentGame : $scope.currentGame,
			startGame : $scope.startGame,
			questionsPlayed : $scope.questionsPlayed
		});
	}

	/*
	* Datas From Ws
	*/

	$rootScope.$on('controlReady', function(evt, data){
		if (NB_QUESTIONS != -1){
			sendConfig();
		}
	});

	$rootScope.$on('readyEvt', function(evt, data){
		$scope.$apply(readyToPlay);
	});

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
			$scope.currentGame.canShow = model.config().mode === model.MODE_FIFO ? false : true;
			var playerFound = _.find($scope.playerArray, {id : data.data.id});
			if (playerFound && !playerFound.answer){
				playerFound.index = index;
				playerFound.answer = true;
				playerFound.choice = data.data.answer;
				playerFound.timestamp = new Date().getTime();
				index++;
				if (index <= 5 && musicOn){
					audio.stopJeopardy();
					audio.playBuzz();
				}
				// TODO Jouer un son à limiter à 20
			}
		});
	});

	$rootScope.$on('showResp', function(evt,data){
		$scope.$apply(function(){
			var question = $scope.currentGame.question;
			var rightAnswer = 0;
			if (question.answer === question.answer0){
				question.classAnswer0 = 'btn-success';
			}else if (question.answer === question.answer1){
				rightAnswer = 1;
				question.classAnswer1 = 'btn-success';
			}else if (question.answer === question.answer2){
				rightAnswer = 2;
				question.classAnswer2 = 'btn-success';
			}else if (question.answer === question.answer3){
				rightAnswer = 3;
				question.classAnswer3 = 'btn-success';
			}

			// Pour le bonnes réponses on ajoute les bons points			
			_.forEach(
				_.sortBy(
					_.filter(
						_.reject($scope.playerArray,{timestamp : 0}), // On rejete les gens qui n'ont pas répondus
						function(playerTmp){return playerTmp.choice === rightAnswer}) // On ne prend que ceux qui ont eu bon
					, 'timestamp'), // On trie dans l'ordre
				function(playerTmp, index){
					var scoreToAdd = getScoreToAdd();					
					playerTmp.score += index ===0 ? scoreToAdd : (scoreToAdd - 1 > 0 ? scoreToAdd - 1 : 1);
					for (var i = 0; i < $scope.playerArray.length; i++){
						if ($scope.playerArray[i].id === playerTmp.id){
							$scope.playerArray[i].score = playerTmp.score;
							$scope.playerArray[i].answerTreat = true;
							console.log($scope.playerArray[i].score);
							break;
						}
					}
			});
			// On filtre les mauvaises réponses et on retire -1
			_.forEach(
				_.filter(
					_.reject($scope.playerArray,{timestamp : 0}),  // On rejete les gens qui n'ont pas répondus
					function(playerTmp){return playerTmp.choice != rightAnswer}), // On ne prend que ceux qui ont eu tord
				function(playerTmp){
					playerTmp.score = Math.max(playerTmp.score - 1,0);
					for (var i = 0; i < $scope.playerArray.length; i++){
						if ($scope.playerArray[i].id === playerTmp.id){
							$scope.playerArray[i].score = playerTmp.score;
							$scope.playerArray[i].answerTreat = true;
							console.log($scope.playerArray[i].score);
							break;
						}
					}
			});

			sendScores();
		});
	});


	/*
	* Datas From Admin
	*/

	$rootScope.$on('startGame', function(evt, data){
		$scope.$apply(function(){
			$scope.startGame = true;
			$scope.winner = null;
			$scope.currentGame.question = null;
			$scope.currentGame.index = 0;
			$scope.currentGame.questions = [];
		});
	});

	$rootScope.$on('allowResp', function(evt, data){
		$scope.$apply(function(){
			// Permet de prendre en compte les réponses
			allowResp = true;
			index = 0;
			$scope.currentGame.canShow = true;
			angular.forEach($scope.playerArray,
			//_.map($scope.playerArray, 
				function(player){

				// Si des joueurs ont déjà répondu on leur permet pas de répondre à nouveau sur la question
				if (!player.answerTreat){
					player.answer = false;
				}
				player.index = 100;
				player.choice = null;
				player.timestamp = 0;
				return player;
			});
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
					console.log($scope.playerArray[i].score);
					break;
				}
			}
			allowResp = false;
			for (var i = 0; i < $scope.playerArray.length; i++){
				$scope.playerArray[i].answerTreat = true;				
			}
			if (musicOn){
				audio.playReponse();
			}		

			sendScores();

			try{
				$scope.$digest();
				$rootScope.$digest();
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
			player.answerTreat = true;
			player.index = 100;
			player.choice = null;
			player.timestamp = 0;

			sendScores();
		});
	});

	$rootScope.$on('goNext', function(evt, data){
		$scope.$apply(function(){
			allowResp = false;				
			/*if ($scope.curentPage >= $scope.nbPages)
	        	return;
	      	$scope.curentPage++;*/
	      	if ($scope.currentGame.index > NB_QUESTIONS){
	      		return;
	      	}
	      	$scope.winner = null;
	      	$scope.currentGame.index++;
	      	if ($scope.currentGame.index === NB_QUESTIONS){
	      		var max = 0;
	      		$scope.winner = null;
	      		/*for (var i = 0; i < $scope.playerArray.length; i++){
					if ($scope.playerArray[i].score > max){
						$scope.winner = $scope.playerArray[i];
						max = $scope.winner.score;
					}
				}*/
				$scope.winner = _.max($scope.playerArray, function(playerTmp){return playerTmp.score});
				if (model.config().mode === model.MODE_RUMBLE) {					
					$scope.podium = _.filter(_.sortBy($scope.playerArray,'score').reverse(),function(playerTmp, index){return index>0 && index < 4 && index < $scope.playerArray.length -1});
					$scope.looser = _.min($scope.playerArray, function(playerTmp){return playerTmp.score});
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
			angular.forEach($scope.playerArray,
			//_.map($scope.playerArray, 
				function(player){
				player.answer = false;
				player.answerTreat = false;
				player.index = 100;
				player.choice = null;
				player.timestamp = 0;
				return player;
			});
		});
	});
	
	$rootScope.$on('RAZUtilisateurs', function(evt, data){
		$scope.$apply(function(){
			$scope.startGame = false;
			$scope.playerArray = [];
			wsFacotry.sendData('clearScore');
			localStorage.clear();
		});
	});

}]);