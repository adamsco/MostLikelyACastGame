CurveGame = function(gameManager) {
	this.gameManager = gameManager;
};

CurveGame.prototype.onPlayerAvailable = function(event) {
	console.log('Player ' + event.playerInfo.playerId + ' is available');
};

CurveGame.prototype.onPlayerReady = function() {};
CurveGame.prototype.onPlayerIdle = function() {};
CurveGame.prototype.onPlayerPlaying = function() {};
CurveGame.prototype.onPlayerDropped = function() {};
CurveGame.prototype.onPlayerQuit = function() {};
CurveGame.prototype.onPlayerDataChanged = function(event) {
	//Updates from control goes here, I think
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

