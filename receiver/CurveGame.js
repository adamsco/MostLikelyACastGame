

CurveGame = function(gameManager) {
	this.gameManager = gameManager;
};

CurveGame.prototype.onPlayerAvailable = function(event) {
	console.log('Player ' + event.playerInfo.playerId + ' is available');
	//If first player open lobby 
	//Else check if lobby is open, if it is then add player to the lobby if it is not then tell player to wait for the next round
	var availablePlayers = gameManager.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE, true);
	
	
	if(gameManager.getLobbyState()==cast.receiver.games.LobbyState.CLOSED){
		if(availablePlayers==1){//Player is first player in game so open lobby
			gameManager.updateLobbyState(cast.receiver.games.LobbyState.OPEN, true);
			gameManager.broadcastGameManagerStatus();
		}else{//A player tries to join when a game is running so tell the player to wait
			//Send message to player that it needs to wait for current game to end and join the next
		}		
	}
	
	if(gameManager.getLobbyState()==cast.receiver.games.LobbyState.OPEN){
		//Send message to player that it has joined the lobby
		console.log('Lobby is open');
	}
	
};

CurveGame.prototype.onPlayerReady = function(event) {
	//Check if everyone is ready
	checkIfAllReady();
};
CurveGame.prototype.onPlayerIdle = function() {};
CurveGame.prototype.onPlayerPlaying = function() {};
CurveGame.prototype.onPlayerDropped = function() {};
CurveGame.prototype.onPlayerQuit = function() {};
CurveGame.prototype.onPlayerDataChanged = function(event) {
	//Updates from control goes here, I think
	console.log('Input from player ' + event.playerInfo.playerId + ': ' + event.requestExtraMessageData);
};
CurveGame.prototype.onGameStatusTextChanged = function() {};
CurveGame.prototype.onGameMessageReceived = function() {};
CurveGame.prototype.onGameDataChanged = function() {};
CurveGame.prototype.onGameLoading = function() {};
CurveGame.prototype.onGameRunning = function() {};
CurveGame.prototype.onGamePaused = function() {};
CurveGame.prototype.onGameShowingInfoScreen = function() {};
CurveGame.prototype.onLobbyOpen = function() {};
CurveGame.prototype.onLobbyClosed = function() {};

function checkIfAllReady(){
	var readyPlayers = gameManager.getPlayersInState(cast.receiver.games.PlayerState.READY, true);
	var availablePlayers = gameManager.getPlayersInState(cast.receiver.games.PlayerState.AVAILABLE, true);
	
	if(availablePlayers.length == 0 && readyPlayers > 1){ //If no player is available and we have 2 or more ready players we can start the game
		for (var i = 0; i <h; readyPlayers.length; i++) {
			gameManager.updatePlayerState(readyPlayers.playerId,cast.receiver.games.PlayerState.PLAYING, true);
		}
	}
	gameManager.broadcastGameManagerStatus();
	//Start game here
	//Tell all players that the game has started
};

