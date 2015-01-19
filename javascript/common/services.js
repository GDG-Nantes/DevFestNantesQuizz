/**
* QuizzServices Module
*
* Description
*/
angular.module('QuizzServices', [])
.factory('WebSocketFactory', ['$rootScope', '$log','ModelFactory', function($rootScope, $log, model){

	var socket = io.connect();

	socket.on('message', function (data) {
	    $log.info(data);
	    if (data.type === "registerDone"){
	    	model.addPlayer(data);
	    	if(data.id === model.singlePlayer.id){
	    		model.singlePlayer.register = true;
	    	}
	    	$rootScope.$broadcast('PlayerRegister', data);
    	}else if (data.type === "adminAuth"){
    		model.loggedAdmin();
	    	$rootScope.$broadcast('adminAuth');	    	
    	}else if (data.type === "config"){
    		model.setConfig(data.conf);
	    	$rootScope.$broadcast('readyEvt');	    	
    	}else {
	    	$rootScope.$broadcast(data.type, data);
    	}
	});

	function getConfig(){
		socket.emit('message',{
			'type' : 'getConfig'
		});
	}

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
		getConfig : getConfig,
		registerPlayer : registerPlayer,
		tryToLogAdmin : tryToLogAdmin,
		getPlayer : getPlayer,
		getPlayers : getPlayers	
	};
}])
.factory('ModelFactory', [ function(){

	var singlePlayer = {}, // Current Player
		adminLogged = false, // Use to know if we are authenticate
		playerList = [], // The list of other player
		URL = 'http://'+location.hostname+':'+(location.port ? location.port : '80'), // The Url of server
		// Game Modes
		MODE_FIFO = 'fifo', 
		MODE_RUMBLE = 'rumble',
		// Game Config
		config = {			
			NB_QUESTIONS : -1, // The number of questions
			NB_PODIUM : 5, // Length of podium
			csv : 'openquizzdb_fr.csv', // The path of csv question file
			ponderation : [[-1, 1, 1]], // The ponderation of each questions
			mode : MODE_FIFO,
			timeout : -1
		};

 

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

	function setConfig(configuration){
		config = configuration;		
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

	function getConfig(){
		return config;
	}

	function getPonderation(index){		
		for (var compt = 0; compt < config.ponderation.length; compt++){
			var number = config.ponderation[compt][0];
			var value = config.ponderation[compt][1];
			var add = config.ponderation[compt][2];
			if (number === -1 || index <= number){
				return [value, add];
			}
		}
		return [1, 1];
	}

	return {
		singlePlayer : singlePlayer,
		setPlayer : setPlayer,
		addPlayer : addPlayer,
		isAdminLogged : isAdminLogged,
		loggedAdmin : loggedAdmin,
		setConfig : setConfig,
		getPonderation : getPonderation,		
		config : getConfig,
		URL : URL,
		MODE_FIFO : MODE_FIFO,
		MODE_RUMBLE : MODE_RUMBLE
	};
}])
.factory('AudioFactory', ['ModelFactory', function(model){

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
	var DOH = 4;
	var DONUTS = 5;
	var buzzBuffer = null;
	var jeopardyBuffer = null;
	var reponseBuffer = null;
	var dohBuffer = null;
	var donutsBuffer = null;
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
				}else if (bufferToUse === DOH){
			  		dohBuffer = buffer;
				}else if (bufferToUse === DONUTS){
			  		donutsBuffer = buffer;
				}
			}, function(e){
				console.log('Error decoding file', e);
			});
		}
		request.send();
	}

	function loadBuzzSound(){
		loadSound(model.URL+"/assets/audio/buzz.mp3", BUZZ);
	}

	function loadJeopardySound(){
		loadSound(model.URL+"/assets/audio/Jeopardy.mp3", JEOPARDY);
	}

	function loadReponseSound(){
		loadSound(model.URL+"/assets/audio/reponse.mp3", REPONSE);
	}

	function loadDohSound(){
		loadSound(model.URL+"/assets/audio/Doh.wav", DOH);
	}

	function loadDonutsSound(){
		loadSound(model.URL+"/assets/audio/Mmmm_donuts.wav", DONUTS);
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
	loadDohSound();
	loadDonutsSound();

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

	function playDoh(){
		playSound(dohBuffer);
	}

	function playDonuts(){
		playSound(donutsBuffer);
	}

	return{
		playBuzz : playBuzz,
		playJeopardy : playJeopardy,
		stopJeopardy : stopJeopardy,
		playReponse : playReponse,
		playDoh : playDoh,
		playDonuts : playDonuts
		
	}
}]);