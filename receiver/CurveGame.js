

function CurveGame(gameManager) {
	this.gameManager = gameManager;
	console.log('game manager set' + this.gameManager);
};

CurveGame.prototype.onPlayerAvailable = function(event) {
	console.log('Player ' + event.playerInfo.playerId + ' is available');
	console.log('game manager in available' + this.gameManager);
	
	
	
	//If first player open lobby 
	//Else check if lobby is open, if it is then add player to the lobby if it is not then tell player to wait for the next round
	var availablePlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE);
	console.log('Vailable players: ' + availablePlayers);
	
	if(this.gameManager.getLobbyState()==cast.receiver.games.LobbyState.CLOSED){
		if(availablePlayers==1){//Player is first player in game so open lobby
			this.gameManager.updateLobbyState(cast.receiver.games.LobbyState.OPEN, true);
			this.gameManager.broadcastGameManagerStatus();
		}else{//A player tries to join when a game is running so tell the player to wait
			//Send message to player that it needs to wait for current game to end and join the next
		}		
	}
	
	if(this.gameManager.getLobbyState()==cast.receiver.games.LobbyState.OPEN){
		//add player to the lobby
		joinGame('Player' + event.playerINfo.playerId);
		//Send message to player that it has joined the lobby
		console.log('Lobby is open');
	}
	
};

CurveGame.prototype.onPlayerReady = function(event) {
	console.log('Player ' + event.playerInfo.playerId + ' is ready');
	//Check if everyone is ready
	this.checkIfAllReady();
};
CurveGame.prototype.onPlayerIdle = function() {};
CurveGame.prototype.onPlayerPlaying = function(event) {
	// Tell player game is about to start
};
CurveGame.prototype.onPlayerDropped = function(event) {
	//Remove player from lobby or game
};
CurveGame.prototype.onPlayerQuit = function(event) {
	//Remove player from lobby or game
};
CurveGame.prototype.onPlayerDataChanged = function(event) {
	
	
};
CurveGame.prototype.onGameStatusTextChanged = function() {};
CurveGame.prototype.onGameMessageReceived = function(event) {
	//Updates from control goes here, I think
	console.log('Input from player ' + event.playerInfo.playerId + ': ' + event.requestExtraMessageData);
	var message = event.requestExtraMessageData;
	var readyPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.PLAYING);
	var playerNumber = parseInt(event.playerInfo.playerId.substring(2,1));
	
	console.log('Player number: '+playerNumber);
	console.log('Turning value '+message.direction);
	
	inputFromMobile(message.direction, playerNumber);
};
CurveGame.prototype.onGameDataChanged = function() {};
CurveGame.prototype.onGameLoading = function() {};
CurveGame.prototype.onGameRunning = function() {};
CurveGame.prototype.onGamePaused = function() {};
CurveGame.prototype.onGameShowingInfoScreen = function() {};
CurveGame.prototype.onLobbyOpen = function(event) {
	
	console.log('Lobby opened');
};
CurveGame.prototype.onLobbyClosed = function(event) {
	console.log('Lobby closed');
};

CurveGame.prototype.checkIfAllReady = function(){
	var readyPlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.READY);
	var availablePlayers = this.gameManager.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE);
	
	console.log('ready players: '+ readyPlayers.length);
	console.log('available players' + availablePlayers.lenght);
	
	if(availablePlayers==undefined && readyPlayers >= 1){ //If no player is available and we have 2 or more ready players we can start the game
		for (var i = 0; i < readyPlayers.length; i++) {
			this.gameManager.updatePlayerState(readyPlayers.playerId,cast.receiver.games.PlayerState.PLAYING, true);
		}
		
		//Start game here
		
		console.log('Game started');
		gameInit();
		
	}
	this.gameManager.broadcastGameManagerStatus();
};

