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
		"logo" : "qui_veut_gagner_tsg.png", // Logo of game
		"ponderation" : [
			[0 , 0, 0], // Index <=0 => 0
			[10 , 1, 1], // Index <=10 => 1
			[20 , 2, 1], // Index <=20 => 2
			[30 , 4, 2], // Index <=30 => 4
			[40 , 6, 2], // Index <=30 => 10
			[50 , 8, 3], // Index <=30 => 10
			[100 , 10, 4] // Index <=30 => 10
		] // The ponderation of answer to the questions
	},
	// Authent part
	auth: {
		"login" : "admin",
		"pwd" : "@frenchio"
	}
};

module.exports = conf;