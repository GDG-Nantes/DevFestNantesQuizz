var conf = {
	// Server Config
	server : {
		"port":"8080"
	},
	// Game config
	game : {
		"mode":"rumble", // fifo or ramble : fifo = first to anwser block other player / rumble = wait for response of everyone
		"timeout" : 30 * 1000, // Timeout before considering a player has not anwser
		"uniqLogin" : true, // If true, there can be only one player with a login (in lowercase), if false, you
		"allowUserDuringGame" : true, // If true, new players can join the game during the game
		"NB_QUESTIONS" : -1, // Number of questions (-1 mean that you will follow the order of questions from csv)
		"NB_PLAYERS" : -1, // Number of users accepted (-1 for unlimeted)
		"NB_PODIUM" : 5, // Number of person in podium
		"csv"  : "questionsTSG_SLE_final.csv", // CSV file to use
		"ponderation" : [
			[0 , 0], // Index <=0 => 0
			[3 , 1], // Index <=3 => 1
			[6 , 2], // Index <=6 => 2
			[10 , 3], // Index <=10 => 3
			[15 , 4], // Index <=15 => 4
			[25 , 6], // Index <=25 => 6
			[30 , 10] // Index <=30 => 10
		] // The ponderation of answer to the questions
	},
	// Authent part
	auth: {
		"login" : "admin",
		"pwd" : "@frenchio"
	}
};

module.exports = conf;