// Configuration part
var conf = require('./assets/conf/config.js');;

// Server part
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || conf.server.port;

// Routing
app.get('/assets/conf/config.js', function(req, res){
    res.send('bien tenté');
});
app.use(express.static(__dirname));
// Listen
server.listen(port, function(){
  console.log('Server listening at port %d', port);
});


// Game Part
var playerList = [];
var rejectPlayers = [];
var gameStart = false;

// Web Socket Part
io.on('connection', function(socket) {    
    console.log('### connection');
    socket.on('message', function(message) {
        console.info(message);
        if (message.type === 'registerPlayer'){
            console.log('### registerAsk: ');
            if ( (conf.game.allowUserDuringGame || (!conf.game.allowUserDuringGame  && !gameStart))
                && (playerList.length < conf.game.NB_PLAYERS
                    || conf.game.NB_PLAYERS === -1)){                
                var data = {
                    type: 'registerDone',
                    pseudo : message.data.pseudo,
                    score : 0,
                    id : message.data.id
                };

                var found = false;
                for (var i = 0;i < playerList.length; i++){
                    if (playerList[i].id === data.id){
                        found = true;
                        break; 
                    }
                    if (playerList[i].pseudo.toLowerCase() === data.pseudo.toLowerCase()){
                        found = true;
                        rejectPlayers.push(data);
                        break;    
                    }
                }
                if (!found){
                    playerList.push(data);
                }

               

                // We send the information to all the players
                socket.emit('message',data);
                socket.broadcast.emit('message', data);
                console.log('### registerDone: ');
                console.info(data);
            }

    	}else if (message.type === 'adminConnect'){
    		console.log('### adminConnect: ');
        	console.info(message);
            var adminAuth = (message.data.login === conf.auth.login && message.data.password === conf.auth.pwd);
    		socket.emit('message',{
    			type : adminAuth ? 'adminAuth' : 'adminRefused'
    		});        	

            if (adminAuth){                
                socket.emit('message',{
                    type : 'config',
                    'conf' : conf.game
                });         
            }
    	}else if (message.type === 'getPlayer'){
            console.log('### getPlayer: ');

            var player = null;
            for (var i = 0;i < playerList.length; i++){
                if (playerList[i].id === message.data){
                    player = playerList[i];
                    break; 
                }
            }
            if (player){
                player.register = true;
            }else{
                player =  {
                    id : message.data,
                    unknown : true
                };
                // We search for similars pseudo in order 
                for (var i = 0;i < rejectPlayers.length; i++){
                    if (rejectPlayers[i].id === message.data){
                        player.usePseudo = true;
                        break; 
                    }
                }
                if (gameStart){
                    player.gameStart = true;
                }else if (playerList.length === 4){
                    player.gameFull = true;
                }
            }
            // We send the configuration to the player
            socket.emit('message',{
                type : 'config',
                'conf' : conf.game
                });

            socket.emit('message',{
                type : 'playerInfo',
                player : player
            });         
        }else if (message.type === 'getPlayers'){
            console.log('### getPlayers: ');
            socket.emit('message',{
                type : 'getPlayers',
                'playerList' : playerList
            });
        }else if (message.type === 'startGame'){
            gameStart = true;
            socket.broadcast.emit('message', message);
        }else if (message.type === 'clearScore'){
            console.log('### Clear Scores: ');
            gameStart = false;
            socket.broadcast.emit('message',{
                type : 'clearScore'
            });
            playerList = [];
            rejectPlayers = [];
        }else if (message.type === 'getConfig'){
            socket.emit('message',{
                type : 'config',
                'conf' : conf.game
            });     
        }else if (message.type === 'updateScore'){
            for (var i = 0; i < message.data.length; i++){
                lblPlayers: for (var j = 0; j < playerList.length; j++){
                    if (message.data[i].id === playerList[j].id){
                        playerList[j].score = message.data[i].score;
                        break lblPlayers;
                    }
                }
            }
        }else{    		
	        console.log('### message: '+message);
	        socket.broadcast.emit('message', message);
    	}
    });    

 socket.on('disconnect', function(){
    socket.disconnect();
    console.log('quit !');
  });
});




// Service for rendering adresses (qrcode)
var os = require('os');
var ifaces=os.networkInterfaces();
var jsonNetWork = [];
var index = 0;
for (var dev in ifaces) {
  var alias=0;
  ifaces[dev].forEach(function(details){
    if (details.family=='IPv4') {
        jsonNetWork.push({
            id: index,
            name:dev,
            ip : details.address
        });
      console.log(dev+(alias?':'+alias:''),details.address);
      index++;
      ++alias;
    }
  });
}


// Write the ip file
var fs = require('fs');
function writeFile(){
    console.log('Write ip file');
    fs.writeFile('./assets/json/ips.json', JSON.stringify(jsonNetWork), function(err) {
        if(err) {
            console.log(err);
        } else {
            console.log('The file was saved!');
        }
        
        console.log('Finish server loading');
    }); 
}
writeFile();