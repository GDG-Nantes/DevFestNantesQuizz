/**
* QuizzServices Module
*
* Description
*/
angular.module('QuizzServices', [])
.factory('WebSocketFactory', ['$rootScope', '$log','ModelFactory', function($rootScope, $log, model){

	var socket = io.connect("http://"+location.hostname+":80");

	socket.on('message', function (data) {
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
		loggedAdmin : loggedAdmin
	};
}]);;