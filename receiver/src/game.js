
var colorTable =["#0c5da5", "#c6f500", "#FF3d00", "#00A383", "#FF9500", "#Ad009f", "#ED6b95", "#FFFC73"];
var dRatio = 0.96;
GAME_WIDTH = window.innerWidth*dRatio;
GAME_HEIGHT = window.innerHeight*dRatio;
var ms = 3;
var rs = 0.1;
var scaleTrail = 0.4;
var scalePlayer = 0.5;
var enabled = false;
// create an new instance of a pixi stage
var stage;

var renderCount = 0;
//2 = every 2nd trail is rendered
var renderIntensity = 1;
// create a renderer instance.
var renderer;
var renderCanvas;

var playerList;
var alive = [];
var bunny;
var view;
var ctx;
var isRunning = true;
var curveGame;
//gameInit();

function switchState(){
   if(document.getElementById('board').rows.length >1){
      enabled = !enabled;
      if(enabled){
         document.getElementById('lobby').style.display = 'none';
      }
      else{
         document.getElementById('lobby').style.display = 'inline';
      }
      gameInit();
      resize();
      gameStop();
   }
}
function gameInit(){
   if(enabled){
      alive = [];
      playerList = [];
      isRunning = true;
      stage = new PIXI.Container();
      stage.cacheAsBitMap = true;

      // create a renderer instance.
      renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
      renderCanvas = new PIXI.CanvasRenderer(GAME_WIDTH, GAME_HEIGHT);

      requestAnimationFrame( animate );
      //renderer.backgroundColor = 0xFFFFFF;
      renderer.preserveDrawingBuffer = true;
      resize();

      // add the renderer view element to the DOM
      document.body.appendChild(renderer.view);

      window.addEventListener("resize", resize);
      document.addEventListener('keydown', function(event) {
         inputController(event);
      });
      for(var i = 1; i< document.getElementById('board').rows.length; i++){
         createPlayer();
      }

   }
}
function gameStop(){
   if(!enabled){
      //document.body.removeChild(document.getElementById("game"));
      stage = new PIXI.Container();
      playerList = [];
      var tempDiv = document.body;
      tempDiv.removeChild(tempDiv.lastChild);

   }

}
function createPlayer(){
   var text = new PIXI.Sprite.fromImage('pixi_master/test/textures/bunny.png');
   var player ={
      texture: text,
      turn: 0,
      score: 0
   };
   playerList.push(player);
   playerList[playerList.length-1].texture.scale.x = scalePlayer;
   playerList[playerList.length-1].texture.scale.y = scalePlayer;
   playerList[playerList.length-1].texture.anchor.x = 0.5;
   playerList[playerList.length-1].texture.anchor.y = 0.5;
   playerList[playerList.length-1].texture.playerColor =   parseCol(colorTable[playerList.length-1], true);
   playerList[playerList.length-1].texture.tint = playerList[playerList.length-1].texture.playerColor;
   playerList[playerList.length-1].texture.position.x = (Math.random() * GAME_WIDTH);
   playerList[playerList.length-1].texture.position.y = (Math.random() * GAME_HEIGHT*0.5)+GAME_HEIGHT*0.5;

   stage.addChild(playerList[playerList.length-1].texture);
   alive.push(true);
}

function inputController() {
   if(event.keyCode == 37 && isRunning) {
      playerList[0].turn = -1;
   }
   else if(event.keyCode == 39 && isRunning) {
      playerList[0].turn = 1;
   }
   else if(event.keyCode == 38){
         console.log(playerList[0].texture.position.x);
         console.log(playerList[0].texture.position.y);
         playerList[0].turn = 0;
   }
   else if(event.keyCode ==40){
      console.log(playerList[0].texture.rotation);
   }
   else if(event.keyCode == 65 && isRunning) {
      playerList[1].texture.rotation -= rs;//p2 left
   }
   else if(event.keyCode == 83 && isRunning) {
      playerList[1].texture.rotation += rs;//p2right
   }
}

function inputFromMobile(turnValue, playerNumber){
	playerList[playerNumber].turn = turnValue; 
} 

function resize() {

   GAME_WIDTH = window.innerWidth*dRatio;
   GAME_HEIGHT = window.innerHeight*dRatio;
   // Determine which screen dimension is most constrained
   ratio = Math.min(window.innerWidth*dRatio/GAME_WIDTH,
                   window.innerHeight*dRatio/GAME_HEIGHT);

   // Scale the view appropriately to fill that dimension
   stage.scale.x = stage.scale.y = ratio;

   // Update the renderer dimensions
   renderer.resize(Math.ceil(GAME_WIDTH * ratio),
                  Math.ceil(GAME_HEIGHT * ratio));
}
function didCollide(x,y,rot){
   var col = ctx.getImageData(x+20*Math.sin(rot), y-20*Math.cos(rot),1,1).data;
   if(col[0] > 0 || col[1] > 0 || col[2] > 0 || col[3] == 0){
      console.log("Its a hit!");
      console.log(col);
      return true;
   }
   return false;
}
function animatePlayer( player , count ){
   if(player != undefined && alive[count]){
      //playercolission?
      if(didCollide(player.position.x, player.position.y, player.rotation)){
            alive[count] = false;
            var keepGoing = 0;
            for(var i = 0; i < playerList.length ; i++ ){
               if(alive[i] == true)
                  keepGoing ++;
            }
            if(keepGoing < 2)
               isRunning = false;
      }
      if(renderCount == 0){
         //add trail
         var sprite = new PIXI.Sprite.fromImage('img/trail.png');
         sprite.anchor = player.anchor;
         //clone
         var tempPos = JSON.parse(JSON.stringify(player.position));
         sprite.position.x = tempPos.x;
         sprite.position.y = tempPos.y;
         sprite.scale.x = scaleTrail;
         sprite.scale.y = scaleTrail;
         sprite.tint = player.playerColor;
		 sprite.cashAsBitmap = true;
         stage.addChild(sprite);
      }

      //then move player
      player.position.x += ms* Math.sin(player.rotation);
      player.position.y -= ms* Math.cos(player.rotation);
   }
}
function animate() {
   if(enabled){
      renderCount = (renderCount+1) % renderIntensity;
      requestAnimationFrame( animate );
      //texture for collidecheck
      view = renderCanvas.view;
      renderCanvas.render(stage);
      ctx = view.getContext("2d");

      if(isRunning){
         var count = 0;
         playerList.forEach(function(player){
            animatePlayer(player.texture, count);
            if(alive[count]){
               rotatePlayer(player);
            }
            count ++;
         });
      }
      // render the stage
      renderer.render(stage);
   }
}
function rotatePlayer(player){
   player.texture.rotation += player.turn*rs;
}

function setCurveGame(cg){
	curveGame = cg;
}

function parseCol(color, toNumber) {
  if (toNumber === true) {
    if (typeof color === 'number') {
      return (color | 0); //chop off decimal
    }
    if (typeof color === 'string' && color[0] === '#') {
      color = color.slice(1);
    }
    return window.parseInt(color, 16);
  } else {
    if (typeof color === 'number') {
      //make sure our hexadecimal number is padded out
      color = '#' + ('00000' + (color | 0).toString(16)).substr(-6);
    }

    return color;
  }
};
