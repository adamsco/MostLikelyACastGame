GAME_WIDTH = window.innerWidth;
GAME_HEIGHT = window.innerHeight;
var ms = 1.5;
var rs = 0.04
var scaleTrail = 0.8;

// create an new instance of a pixi stage
var stage = new PIXI.Container();

// create a renderer instance.
var renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
var renderCanvas = new PIXI.CanvasRenderer(GAME_WIDTH, GAME_HEIGHT);

//renderer.backgroundColor = 0xFFFFFF;
renderer.preserveDrawingBuffer = true;
console.log(renderer);
resize();

// add the renderer view element to the DOM
document.body.appendChild(renderer.view);

// Listen for and adapt to changes to the screen size, e.g.,
// user changing the window or rotating their device
window.addEventListener("resize", resize);
document.addEventListener('keydown', function(event) {
   inputController(event);
});
requestAnimationFrame( animate );
var playerList = [];
var bunny;
var view;
var ctx;
var isRunning = true;
//gameInit();

function gameInit(){
   createPlayer();
   createPlayer();
}
function createPlayer(){
   var tempPlayer = new PIXI.Sprite.fromImage('pixi_master/test/textures/bunny.png');
   playerList.push(tempPlayer);
   playerList[playerList.length-1].anchor.x = 0.5;
   playerList[playerList.length-1].anchor.y = 0.5;
   console.log(playerList.length + " - size");
   playerList[playerList.length-1].playerColor = Math.random() * 0xFFFFFF;
   playerList[playerList.length-1].tint = playerList[playerList.length-1].playerColor;
   playerList[playerList.length-1].position.x = (Math.random() * GAME_WIDTH*0.5)+GAME_WIDTH*0.5;
   playerList[playerList.length-1].position.y = (Math.random() * GAME_HEIGHT*0.5)+GAME_HEIGHT*0.5;
   stage.addChild(playerList[playerList.length-1]);

}
function inputController() {
   if(event.keyCode == 37 && isRunning) {
      playerList[0].rotation -= rs;
   }
   else if(event.keyCode == 39 && isRunning) {
      playerList[0].rotation += rs;
   }
   else if(event.keyCode == 38){
         console.log(playerList[0].position.x);
         console.log(playerList[0].position.y);
   }
   else if(event.keyCode ==40){
      console.log(playerList[0].rotation);
   }
   else if(event.keyCode == 65 && isRunning) {
      playerList[1].rotation -= rs;//p2 left
   }
   else if(event.keyCode == 83 && isRunning) {
      playerList[1].rotation += rs;//p2right
   }
}

function inputFromMobile(turnValue, playerNumber){
	playerList[playerNumber].rotation += turnValue; 
} 

function resize() {
   // Determine which screen dimension is most constrained
   ratio = Math.min(window.innerWidth/GAME_WIDTH,
                   window.innerHeight/GAME_HEIGHT);

   // Scale the view appropriately to fill that dimension
   stage.scale.x = stage.scale.y = ratio;

   // Update the renderer dimensions
   renderer.resize(Math.ceil(GAME_WIDTH * ratio),
                  Math.ceil(GAME_HEIGHT * ratio));
}
function didCollide(x,y,rot){
   var col = ctx.getImageData(x+20*Math.sin(rot), y-20*Math.cos(rot),1,1).data;
   if(col[0] > 0 || col[1] > 0 || col[2] > 0){
      console.log("Its a hit!");
      console.log(col);
      return true;
   }
   return false;
}
function animatePlayer( player ){
   if(player != undefined){
      //playercolission?
      if(didCollide(player.position.x, player.position.y, player.rotation)){
            isRunning = false;
      }
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
      stage.addChild(sprite);

      //then move player
      player.position.x += ms* Math.sin(player.rotation);
      player.position.y -= ms* Math.cos(player.rotation);
   }
}
function animate() {
   requestAnimationFrame( animate );
   //texture for collidecheck
   view = renderCanvas.view;
   renderCanvas.render(stage);
   ctx = view.getContext("2d");

   if(isRunning){
      playerList.forEach(function(player){
         animatePlayer(player);
      });
   }

    // render the stage
    renderer.render(stage);
}
