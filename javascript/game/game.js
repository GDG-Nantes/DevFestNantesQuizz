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
		player.score = Math.min(player.score - 1,0);
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

/*	
	var scoreMap = new Array();
    	var scoreArray = new Array();
    	var musicOn = true;
    	var curentPage = 0;
    	var limitResp = 20;
    	var limitBuzz = 10;
    	var nbResp = 0;
    	var nbBuzz = 0;
    	var couldTakeResp = false;
    
    	function hideBtns(){
            $(".btnPlayers").each(function(btn){
            	$(this).hide();
            })
        }
    	
    	function toggleMusic(){
    		musicOn = !musicOn;
    		if (musicOn){
    			$('#jeopardySong').get(0).play();
    		}else{
    			$('#jeopardySong').get(0).pause();
            	$('#jeopardySong').get(0).currentTime = 0;
    		}
    		$('#musicSwitch').removeClass().addClass(musicOn ? 'icon-volume-up' : 'icon-volume-off');
    	}
    	
    	function initPlayers(){
			 scoreMap = new Array();    			 
			 scoreArray = new Array();    			 
    		 @for(player <- players) {
    			 scoreMap['@player.id'] = {'pseudo' :'@player.pseudo', 'score':0};
    			 scoreArray.push('@player.id');
    		 }
    	}
    
	    function clickBtnValider(btn){
	    	$('#reponse').get(0).play();
	    	var id = btn.getAttribute("id").substring(3);
	    	var text = $('#pt'+id).text();
	    	var increment = 5; 
	    	if (curentPage <=5){
	    		increment = 1;
	    	}else if (curentPage <=10){
	    		increment = 3;
	    	}
	    	scoreMap[id].score = scoreMap[id].score+increment;
	    	$('#pt'+id).replaceWith('<p id="pt'+id+'">'+id+' : '+scoreMap[id].score+'</p>');
        	
			RAZReponses();        	
	    }
	    
	    function clickBtnRefuser(btn){
	    	var id = btn.getAttribute("id").substring(4);
	    	$('#btn'+id).hide();        	
	    	$('#btnR'+id).hide();        	
	    }
	    
	    function allowResp(){
	    	couldTakeResp = true;
	    	
	    }
	    
	    function RAZReponses(){
	    	var remplacementPlayerList = '';
	    	remplacementPlayerList += '<ul id="playersList" class="nav nav-pills">';
	    	remplacementPlayerList += '</ul>';
	    	$('#playersList').replaceWith(remplacementPlayerList);
	    	
	    	initScorePlayersArea();
	    	hideBtns();
	    	couldTakeResp = false;
	    	nbResp=0;
	    	nbBuzz=0;
	    	
	    }
	    
	    function sortScoreMap(){
	    	var permutation = false;
	    	do{
	    		permutation = false;
	    		for(var i = 0; i <= scoreArray.length -2; i++){
	    			if (scoreMap[scoreArray[i]].score < scoreMap[scoreArray[i+1]].score){
	    				var tmp = scoreArray[i];
	    				scoreArray[i] = scoreArray[i+1];
	    				scoreArray[i+1] = tmp;
	    				permutation = true;
	    			}
	    		}
	    		
	    	}while (permutation);
	    	
	    }
	    
	    function initPlayersArea(){
	    	var remplacementPlayerList = '';
	    	remplacementPlayerList += '<ul id="playersList" class="nav nav-pills">';
	    	for (var playerId in scoreMap){
	    		remplacementPlayerList += ' <li>';
	    		remplacementPlayerList += '   <div class="playerShow">';
	    		remplacementPlayerList += '      <div class="playerParent" id="'+playerId+'">';
	    		remplacementPlayerList += '        <div class="player" >';
	    		remplacementPlayerList += '          <p >'+scoreMap[playerId].pseudo+'</p>';
	    		remplacementPlayerList += '            <button class="btn danger btnPlayers" id="btn'+playerId+'" onclick="clickBtnValider(this);">Valider ?</button>';
	    		remplacementPlayerList += '            <button class="btn danger btnPlayers" id="btnR'+playerId+'" onclick="clickBtnRefuser(this);">Refuser ?</button>';
	    		remplacementPlayerList += '        </div>';
	    		remplacementPlayerList += '      </div>';
	    		remplacementPlayerList += '      <div>';
	    		remplacementPlayerList += '        <audio id="buzz'+playerId+'" src="@routes.Assets.at("media/buzz.mp3")" style="hidden"/>';
	    		remplacementPlayerList += '      </div>';
	    		remplacementPlayerList += '    </div>';
	    		remplacementPlayerList += '  </li>';
	    	}
	    	remplacementPlayerList += '</ul>';
	    	$('#playersList').replaceWith(remplacementPlayerList);
	    	hideBtns();
	    }
	    
	    function appendPlayerReponse(playerId){
	    	var remplacementPlayerList = '';
    		remplacementPlayerList += ' <li>';
    		remplacementPlayerList += '   <div class="playerShow">';
    		remplacementPlayerList += '      <div class="playerParent" id="'+playerId+'">';
    		remplacementPlayerList += '        <div class="player" >';
    		remplacementPlayerList += '          <p >'+scoreMap[playerId].pseudo+'</p>';
    		remplacementPlayerList += '            <button class="btn danger btnPlayers" id="btn'+playerId+'" onclick="clickBtnValider(this);">Valider ?</button>';
    		remplacementPlayerList += '            <button class="btn danger btnPlayers" id="btnR'+playerId+'" onclick="clickBtnRefuser(this);">Refuser ?</button>';
    		remplacementPlayerList += '        </div>';
    		remplacementPlayerList += '      </div>';
    		remplacementPlayerList += '      <div>';
    		remplacementPlayerList += '        <audio id="buzz'+playerId+'" src="@routes.Assets.at("media/buzz.mp3")" style="hidden"/>';
    		remplacementPlayerList += '      </div>';
    		remplacementPlayerList += '    </div>';
    		remplacementPlayerList += '  </li>';
	    	$('#playersList').append(remplacementPlayerList);
	    	$('#btn'+playerId).hide();
	    	$('#btnR'+playerId).hide();
	    }
	    
	    function initScorePlayersArea(){
	    	sortScoreMap();
	    	var remplacementPlayerList = '';
	    	remplacementPlayerList += '<ol id="playersListScore">';
	    	var compt = 0;
	    	var playerId = null;
	    	for (var index in scoreArray){
	    		playerId = scoreArray[index];
	    		remplacementPlayerList += ' <li>';
	    		remplacementPlayerList += '   <div class="playerScore">';
	    		remplacementPlayerList += '      <p id="pt'+playerId+'">'+scoreMap[playerId].pseudo+' : '+scoreMap[playerId].score+'</p>';
	    		remplacementPlayerList += '    </div>';
	    		remplacementPlayerList += '  </li>';
	    		compt+=1;
	    		if (compt >= 5){
	    			break;
	    		}
	    	}
	    	if (scoreArray.length > 5){
	    		remplacementPlayerList += ' <li>';
	    		remplacementPlayerList += '   <div class="playerScore">';
	    		remplacementPlayerList += '      <p>'+scoreArray.length+' joueurs en course</p>';
	    		remplacementPlayerList += '    </div>';
	    		remplacementPlayerList += '  </li>';
	    	}
	    	remplacementPlayerList += '</ol>';
	    	$('#playersListScore').replaceWith(remplacementPlayerList);
	    }
    
        $(function() {
            var WS = window['MozWebSocket'] ? MozWebSocket : WebSocket
	        var chatSocket = new WS("@routes.Application.initWebSocketGame().webSocketURL(request)")
            
            
            var receiveEvent = function(event) {
            	var data = JSON.parse(event.data);
            	if (data.type ==="response"){
            		
            		if (!couldTakeResp){
            			return;
            		}
            		
            		if (musicOn){
            			$('#jeopardySong').get(0).pause();
                    	$('#jeopardySong').get(0).currentTime = 0;
            		}
	            	var userId = data.id;
		            	//var user = event.data;
		            	if ($('#'+userId).length==0){
	            			if (nbResp < limitResp || limitResp == -1){
		            			appendPlayerReponse(userId);
			            	}
	            			nbResp+=1;
		            		if (nbBuzz < limitBuzz || limitBuzz == -1){
			            		$('#buzz'+userId).get(0).play();
		            		}
	            			nbBuzz+=1;
		            	}
		            	
		            	$('.playerParent').each(function(userDiv){
		            		
		            		if ($(this).attr("id") === userId){
		            			//$(this).addClass("playerAnswer");
		            			$(this).removeClass().addClass("playerParent animated flash");
		            			var el = $(this);
		            			var wait = window.setTimeout( function(){
		            				el.removeClass().addClass("playerParent");
		            				$('#btn'+userId).show();
		            				$('#btnR'+userId).show();
		            				},
		            				1300
		            			);
		            		}else{
		            			$(this).removeClass().addClass("playerParent");	
		            		}
		            	});
	            	
	            	
            	}else if (data.type ==="register"){
            		scoreMap[''+data.id] = {'pseudo':data.data, 'score':0};
            		scoreArray.push(''+data.id);
            		//initPlayersArea();
            		initScorePlayersArea();
            		var user = data.id;
            		chatSocket.send(JSON.stringify({type:"registerDone", id:user}))
            	}
            	
            }
                     
            
            chatSocket.onmessage = receiveEvent;
            initPlayers();
            initPlayersArea();
            initScorePlayersArea();
            hideBtns();
            
            $("#navStopMusic").show();
            $("#navRAZ").show();
            $("#navNext").show();
            $("#navPrev").show();
            $("#navAllowResp").show();
            
        });
        
        
        //PDF Configuration 
        
		var url = '@routes.Assets.at("files/KeyNote.pdf")';
    	
    	//
        // Disable workers to avoid yet another cross-origin issue (workers need the URL of
        // the script to be loaded, and currently do not allow cross-origin scripts)
        //
        PDFJS.disableWorker = true;
        
        var pdfDoc = null,
        pageNum = 1,
        scale = 0.9,
        canvas = document.getElementById('the-canvas'),
        ctx = canvas.getContext('2d');

    //
    // Get page info from document, resize canvas accordingly, and render page
    //
    function renderPage(num) {
      curentPage = num;
      RAZReponses();
      // Using promise to fetch the page
      pdfDoc.getPage(num).then(function(page) {
        var viewport = page.getViewport(scale);
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: ctx,
          viewport: viewport
        };
        page.render(renderContext);
      });

      // Update page counters
      document.getElementById('page_num').textContent = pageNum;
      document.getElementById('page_count').textContent = pdfDoc.numPages;
    }

    //
    // Go to previous page
    //
    function goPrevious() {
      if (pageNum <= 1)
        return;
      pageNum--;
      renderPage(pageNum);
    }

    //
    // Go to next page
    //
    function goNext() {
      if (pageNum >= pdfDoc.numPages)
        return;
      pageNum++;
      renderPage(pageNum);
      if (musicOn){
	      $('#jeopardySong').get(0).play();
      }
    	  
    }

    //
    // Asynchronously download PDF as an ArrayBuffer
    //
    PDFJS.getDocument(url).then(function getPdfHelloWorld(_pdfDoc) {
      pdfDoc = _pdfDoc;
      renderPage(pageNum);
    });
*/
}]);