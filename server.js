// Configuration part
var conf = {port : 8080};

// Server part
var connect = require('connect');
    console.log(__dirname);
console.log(process.cwd());
var app = connect.createServer(
    connect.static(process.cwd())
).listen(conf.port);
console.log('Start server on port : '+conf.port);

// Define socket part
var io   = require('socket.io');
var wsServer = io.listen(app);

var playerList = [];

wsServer.sockets.on('connection', function(socket) {
    console.log('### connection');
    socket.on('message', function(message) {
        console.info(message);
        if (message.type === 'registerPlayer'){
            console.log('### registerAsk: ');
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
            }
            if (!found){
                playerList.push(data);
            }

            socket.emit('message',data);
            socket.broadcast.emit('message', data);
            console.log('### registerDone: ');
            console.info(data);

    	}else if (message.type === 'adminConnect'){
    		console.log('### adminConnect: ');
        	console.info(message);
    		socket.emit('message',{
    			type : (message.data.login === 'admin' && message.data.password === '@frenchio') ? 'adminAuth' : 'adminRefused'
    		});        	
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
            }
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
        }else if (message.type === 'clearScore'){
            console.log('### Clear Scores: ');
            socket.broadcast.emit('message',{
                type : 'clearScore'
            });
            playerList = [];
        }else{    		
	        console.log('### message: '+message);
	        socket.broadcast.emit('message', message);
    	}
    });    
});




// Service for rendering adresses
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