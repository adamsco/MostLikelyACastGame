

function CurveGame(gameManager) {
	this.gameManager = gameManager;	
	this.lobbyList = [];
};

CurveGame.prototype.onPlayerAvailable = function(event) {
	console.log('Player ' + event.playerInfo.playerId + ' is available');	
	
	//If first player open lobby 
	//Else check if lobby is open, if it is then add player to the lobby if it is not then tell player to wait for the next round
	var availablePlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE);
	console.log('Available players: ' + availablePlayers);
	
	if(this.gameManager.getLobbyState()==cast.receiver.games.LobbyState.CLOSED){
		if(availablePlayers==1){//Player is first player in game so open lobby
			this.gameManager.updateLobbyState(cast.receiver.games.LobbyState.OPEN, true);
			this.gameManager.broadcastGameManagerStatus();
		}else{//A player tries to join when a game is running so tell the player to wait
			//Send message to player that it needs to wait for current game to end and join the next
			var playerId = event.playerInfo.playerId;
			var message = { message: 'LOBBY_closed' };
			this.gameManager.sendGameMessageToPlayer(playerId, message);
			this.gameManager.updatePlayerState(playerId,cast.receiver.games.PlayerState.IDLE, true);
		}		
	}
	
	if(this.gameManager.getLobbyState()==cast.receiver.games.LobbyState.OPEN){
		
		var playerId = event.playerInfo.playerId;
		var index = this.lobbyList.indexOf(playerId);
		
		if(index == -1){		
			var inMessage = event.requestExtraMessageData;
			var userName = '';
			if(inMessage !=undefined){
				userName = inMessage.username;
			}
			
			if(userName == ''){
				userName = 'Missing name '+playerId;
			}else if(userName == 'Malin'){
				userName = 'Pixel_babe_1337';
			}
			
			//add player to the lobby
			this.lobbyList.push(playerId);		
			joinGame(userName);
			//Send message to player that it has joined the lobby
			var message = { message: 'LOBBY_join' };
			this.gameManager.sendGameMessageToPlayer(playerId, message);
		}else{
			playerNotReady(index);
		}
	}	
	var message = { message: 'You are available' };
	this.gameManager.sendGameMessageToPlayer(playerId, message);
	this.gameManager.broadcastGameManagerStatus();
};

CurveGame.prototype.onPlayerReady = function(event) {
	console.log('Player ' + event.playerInfo.playerId + ' is ready');
	
	var playerId = event.playerInfo.playerId;
	var playerNumber = this.lobbyList.indexOf(playerId); 
	console.log('PLayer number: '+ playerNumber);
	playerReady(playerNumber);
	var message = { message: 'You are now ready' };
	this.gameManager.sendGameMessageToPlayer(playerId, message);	
	this.gameManager.broadcastGameManagerStatus();
	//Check if everyone is ready
	this.checkIfAllReady();
};
CurveGame.prototype.onPlayerIdle = function() {};
CurveGame.prototype.onPlayerPlaying = function(event) {	
	console.log('Player ' + event.playerInfo.playerId + ' is playing');
	// Tell player game is about to start
	var playerId = event.playerInfo.playerId;
	var playerNumber = this.lobbyList.indexOf(playerId); 
	var message = { message: 'You are now playing', PLAYER_color: colorTable[playerNumber] };
	this.gameManager.sendGameMessageToPlayer(playerId, message);	
	this.gameManager.broadcastGameManagerStatus();
};
CurveGame.prototype.onPlayerDropped = function(event) {
	//Remove player from lobby or game
	if(this.gameManager.getLobbyState()==cast.receiver.games.LobbyState.OPEN){		
		var playerId = event.playerInfo.playerId;
		var playerNumber = this.lobbyList.indexOf(playerId); 
		leaveGame(playerNumber);
		lobbyList.splice(playerNumber,1);
	}else{//If game is running
		
	}
	console.log('Player dropped');
};
CurveGame.prototype.onPlayerQuit = function(event) {
	//Remove player from lobby or game
	if(this.gameManager.getLobbyState()==cast.receiver.games.LobbyState.OPEN){		
		var playerId = event.playerInfo.playerId;
		var playerNumber = this.lobbyList.indexOf(playerId); 
		leaveGame(playerNumber);
		lobbyList.splice(playerNumber,1);
	}
	
	console.log('Player quit');
	if (window.castReceiverManager.getSenders().length == 0) {//If all player left close the app
			//window.close();
			console.log('App closed');
	}
};
CurveGame.prototype.onPlayerDataChanged = function(event) {
	
	
};
CurveGame.prototype.onGameStatusTextChanged = function() {};
CurveGame.prototype.onGameMessageReceived = function(event) {
	//Inputs from players
	var message = event.requestExtraMessageData;
	//var playingPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.PLAYING);
	
	//playerNumber = this.getPlayerNumber(event.playerInfo.playerId, playingPlayers);
	
	playerNumber = this.lobbyList.indexOf(event.playerInfo.playerId);
		
	inputFromMobile(message.direction, playerNumber);
};
CurveGame.prototype.onGameDataChanged = function() {};
CurveGame.prototype.onGameLoading = function() {};
CurveGame.prototype.onGameRunning = function() {};
CurveGame.prototype.onGamePaused = function() {};
CurveGame.prototype.onGameShowingInfoScreen = function() {};
CurveGame.prototype.onLobbyOpen = function(event) {	
	console.log('Lobby opened');
	
	//Send message to all idle players to let them know they can join the lobby
	var idlePlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.IDLE);
	for (var i = 0; i < idlePlayers.length; i++) {
		
		var playerId = idlePlayers[i].playerId;	
		var message = { message: 'LOBBY_opened' };
		this.gameManager.sendGameMessageToPlayer(playerId, message);
	}
	
	//Set all ready players to available
	var readyPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.READY);
	for (var i = 0; i < readyPlayers.length; i++) {
		var playerId = readyPlayers[i].playerId;	
		this.gameManager.updatePlayerState(playerId,cast.receiver.games.PlayerState.AVAILABLE, true);	
	}
	
	this.gameManager.broadcastGameManagerStatus();
	

};
CurveGame.prototype.onLobbyClosed = function(event) {
	console.log('Lobby closed');
	window.castReceiverManager.setApplicationState("A game is running");	
	this.gameManager.broadcastGameManagerStatus();
};

CurveGame.prototype.checkIfAllReady = function(){
	var readyPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.READY);
	var availablePlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE);
	
	console.log('ready players: '+ readyPlayers.length);
	console.log('available players' + availablePlayers.length);
	
	if(availablePlayers.length==0 && readyPlayers.length >= 1){ //If no player is available and we have 2 or more ready players we can start the game
		for (var i = 0; i < readyPlayers.length; i++) {
			this.gameManager.updatePlayerState(readyPlayers[i].playerId,cast.receiver.games.PlayerState.PLAYING, true);
		}
		
		//Start game here
		this.gameManager.updateLobbyState(cast.receiver.games.LobbyState.CLOSED, true);
		console.log('Game started');
		switchState();
		
		//Change application message
		window.castReceiverManager.setApplicationState("Game is available to join");
	}
	this.gameManager.broadcastGameManagerStatus();
};

CurveGame.prototype.openLobby = function(){// Call this when a game is done to begin setting up the next game
	this.gameManager.updateLobbyState(cast.receiver.games.LobbyState.OPEN, true);
	this.gameManager.broadcastGameManagerStatus();
};

CurveGame.prototype.updateScore = function(leaderName, score){
	
	score.sort();
	score.reverse();
	
	var idlePlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.IDLE);
	for (var i = 0; i < idlePlayers.length; i++) {
		var playerId = idlePlayers[i].playerId;
		var message = { message: 'SCORE_update', leader: ''+ leaderName, leader_score: score[0], goal_score: 10};
		this.gameManager.sendGameMessageToPlayer(playerId, message);
	}
};

CurveGame.prototype.getPlayerNumber = function(playerId, playerList){
	var playerNumber = -1;
		//var playerNumber = parseInt(event.playerInfo.playerId.substring(2,1));
	for (var i = 0; i < playerList.length; i++) {
		if(playerList[i].playerId == playerId){
			playerNumber = i;
		}
	}
	
	return playerNumber;
};
CurveGame.prototype.updateLobbyList = function(){
	var droppedPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.DROPPED);
	var quitPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.QUIT);
	
	for (var i = 0; i < this.lobbyList.length; i++){
		for (var j = 0; j < droppedPlayers.length; j++) {
			index = lobbyList.indexOf(droppedPlayers[j].playerId);
			
			lobbyList.splice(index,1);
			leaveGame(index);
		}
		for (var j = 0; j < quitPlayers.length; j++) {
			index = lobbyList.indexOf(quitPlayers[j].playerId);
			
			lobbyList.splice(index,1);
			leaveGame(index);
		}
	}
	

};

