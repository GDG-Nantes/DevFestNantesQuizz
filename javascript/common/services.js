/**
* QuizzServices Module
*
* Description
*/
angular.module('QuizzServices', [])
.factory('WebSocketFactory', ['$rootScope', '$log','ModelFactory', function($rootScope, $log, model){

	var socket = io.connect();//"http://"+location.hostname+":"+(window.location.port ? window.location.port : "80"));

	socket.on('message', function (data) {
    	//$rootScope.$apply(function(){
		    $log.info(data);
		    if (data.type === "registerDone"){
		    	model.addPlayer(data);
		    	if(data.id === model.singlePlayer.id){
		    		model.singlePlayer.register = true;
		    	}
		    	$rootScope.$broadcast('PlayerRegister', data);
	    	}else  if (data.type === "adminAuth"){
	    		model.loggedAdmin();
		    	$rootScope.$broadcast('adminAuth');	    	
	    	}else {
		    	$rootScope.$broadcast(data.type, data);
	    	}
    	//});
	});

	function sendData(type, data){
		socket.emit('message',{
			'type' : type,
			'data' : data
		});
	}

	function registerPlayer(player){
		socket.emit('message',{
			'type' : 'registerPlayer',
			'data' : player
		});	
	}

	function tryToLogAdmin(admin){
		socket.emit('message',{
			'type' : 'adminConnect',
			'data' : admin
		});		
	}

	function getPlayer(id){
		socket.emit('message',{
			'type' : 'getPlayer',
			'data' : id
		});		
	}

	function getPlayers(){
		socket.emit('message',{
			'type' : 'getPlayers'
		});		
	}

	return {
		sendData : sendData,
		registerPlayer : registerPlayer,
		tryToLogAdmin : tryToLogAdmin,
		getPlayer : getPlayer,
		getPlayers : getPlayers	
	};
}])
.factory('ModelFactory', [ function(){

	var singlePlayer = {};

	var adminLogged = false;

	var playerList = [];

	var NB_QUESTIONS = 5;

	function addPlayer(player){
		var found = false;
		for  (var i =0; i< playerList.length; i ++){
			if (playerList[i].id === player.id){
				found = true;
				break;
			}
		}
		if (!found){
			playerList.push(player);
		}
	}

	function setPlayer(player){
		singlePlayer.id = player.id;
		singlePlayer.pseudo = player.pseudo;
	}

	function isAdminLogged(){
		return adminLogged;
	}

	function loggedAdmin(){
		adminLogged = true;
	}

	return {
		singlePlayer : singlePlayer,
		setPlayer : setPlayer,
		addPlayer : addPlayer,
		isAdminLogged : isAdminLogged,
		loggedAdmin : loggedAdmin,
		NB_QUESTIONS : NB_QUESTIONS
	};
}])
.factory('AudioFactory', [ function(){

	var context = null;
	try{
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		context = new AudioContext();
	}catch(e){
		console.log("No WebAPI dectect");
	}

	var BUZZ = 1;
	var JEOPARDY = 2;
	var REPONSE = 3;
	var buzzBuffer = null;
	var jeopardyBuffer = null;
	var reponseBuffer = null;
	var sourceJeopardy = null;

	function loadSound(url, bufferToUse){
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';

		// Decode asynchronously
		request.onload = function() {
			context.decodeAudioData(request.response, function(buffer) {
				if (bufferToUse === BUZZ){
			  		buzzBuffer = buffer;
				}else if (bufferToUse === JEOPARDY){
			  		jeopardyBuffer = buffer;
				}else if (bufferToUse === REPONSE){
			  		reponseBuffer = buffer;
				}
			}, function(e){
				console.log('Error decoding file', e);
			});
		}
		request.send();
	}

	function loadBuzzSound(){
		loadSound("http://"+location.hostname+":"+(window.location.port ? window.location.port : "80")+"/assets/audio/buzz.mp3", BUZZ);
	}

	function loadJeopardySound(){
		loadSound("http://"+location.hostname+":"+(window.location.port ? window.location.port : "80")+"/assets/audio/Jeopardy.mp3", JEOPARDY);
	}

	function loadReponseSound(){
		loadSound("http://"+location.hostname+":"+(window.location.port ? window.location.port : "80")+"/assets/audio/reponse.mp3", REPONSE);
	}

	function playSound(buffer){
		var source = context.createBufferSource(); // creates a sound source
		source.buffer = buffer;                    // tell the source which sound to play
		source.connect(context.destination);       // connect the source to the context's destination (the speakers)
		source.start(0);                           // play the source now
		return source;
	}

	loadBuzzSound();
	loadJeopardySound();
	loadReponseSound();

	/*****************************
	******************************
	* Apis exposed
	******************************
	******************************
	*/
	
	function playBuzz(){
		playSound(buzzBuffer);
	}

	function playJeopardy(){
		sourceJeopardy = playSound(jeopardyBuffer);
	}

	function stopJeopardy(){
		if (sourceJeopardy && sourceJeopardy.stop){
			sourceJeopardy.stop(0);
		}
	}

	function playReponse(){
		playSound(reponseBuffer);
	}

	return{
		playBuzz : playBuzz,
		playJeopardy : playJeopardy,
		stopJeopardy : stopJeopardy,
		playReponse : playReponse
		
	}
}]);