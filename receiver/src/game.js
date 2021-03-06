
var colorTable =["#0C5DA5", "#C6F500", "#FF3D00", "#00A383", "#FF9500", "#AD009F", "#ED6B95", "#FFFC73"];
var dRatio = 0.96;
GAME_WIDTH = window.innerWidth*dRatio;
GAME_HEIGHT = window.innerHeight*dRatio;
var ms = 7;
var rs = 0.15;
var scaleTrail = 1.2;
var scalePlayer = 1.0;
var enabled = false;
// create an new instance of a pixi stage
var stage;
var winCondition = 10;
// create a renderer instance.
var renderer;
var renderCanvas;
var pauseTime = 500;
var runTimeBase = 1500;
var runTimeMax = 2500;
var playerList;
var alive = [];
var bunny;
var view;
var ctx;
var loader;
var isRunning = true;
var curveGame;
//gameInit();
var tails = [];

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
      tails =[];
      playerList = [];
      isRunning = true;
      stage = new PIXI.Container();
      //stage.cacheAsBitMap = true;

      // create a renderer instance.
      renderer = PIXI.autoDetectRenderer(GAME_WIDTH, GAME_HEIGHT);
      renderCanvas = new PIXI.CanvasRenderer(GAME_WIDTH, GAME_HEIGHT);
      if(loader == undefined){

      loader = PIXI.loader
         .add('image1', 'img2/0C5DA5.png')
         .add('image2', 'img2/C6F500.png')
         .add('image3', 'img2/FF3D00.png')
         .add('image4', 'img2/00A383.png')
         .add('image5', 'img2/FF9500.png')
         .add('image6', 'img2/AD009F.png')
         .add('image7', 'img2/ED6B95.png')
         .add('image8', 'img2/FFFC73.png')
         .once('complete', function(loader, resources){
            requestAnimationFrame( animate );
         })
         .load();
      }
      else{
         requestAnimationFrame( animate );
      }
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
         stage.addChild(tails[i-1]);
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
      score: 0,
      draw: false,
      timer: false,
      getTimer: null
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
   playerList[playerList.length-1].texture.rotation = Math.random() * 6.2;
   //each player needs a particleContainer
   tails.push(new PIXI.ParticleContainer());

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
function didCollide(pos,rot){
   var col = ctx.getImageData(pos.x+24*Math.sin(rot), pos.y-24*Math.cos(rot),1,1).data;
   if(col[0] > 0 || col[1] > 0 || col[2] > 0 || col[3] == 0){
      console.log("Its a hit!");
      console.log(col);
      return true;
   }
   return false;
}
function drawTimer(pNr){
   playerList[pNr].draw = !playerList[pNr].draw;
   if(playerList[pNr].draw){
      playerList[pNr].getTimer = setTimeout(function(){
         drawTimer(pNr);
      }, runTimeBase+Math.random()*runTimeMax);
   }
   else{
      playerList[pNr].getTimer = setTimeout(function(){
         drawTimer(pNr);
      }, pauseTime);
   }
}

function animatePlayer( player , count ){
   if(player.texture != undefined && alive[count]){
      //playercolission?
      if(didCollide(player.texture.position, player.texture.rotation)){
            alive[count] = false;
            addPoints();//add points to all players still alive
            var keepGoing = 0;
            for(var i = 0; i < playerList.length ; i++ ){
               if(alive[i] == true)
                  keepGoing ++;
            }
            if(keepGoing < 2){
               isRunning = false;
               roundEnd();
            }
      }
         //init timer
         if(player.timer == false){
            console.log("init timer for: "+ count)
            player.timer = true;
            drawTimer(count);
         }
         if(player.draw){
            //add trail
            str = "img/"+ colorTable[count % 8].slice(1) + ".png";
            //console.log(str);
            var sprite = getTexture(count % 8);
            sprite.anchor = player.texture.anchor;
            //clone
            var tempRot = {rotation: player.texture.rotation};
            var tempPos = {x: player.texture.position.x, y: player.texture.position.y};

            sprite.rotation = tempRot.rotation;
            sprite.position = tempPos;
            sprite.scale.x = scaleTrail;
            sprite.scale.y = scaleTrail;
            //sprite.tint = player.playerColor;
            tails[count].addChild(sprite);
         }

      //then move player
      player.texture.position.x += ms* Math.sin(player.texture.rotation);
      player.texture.position.y -= ms* Math.cos(player.texture.rotation);
   }
}
function animate() {
   if(enabled){

      //texture for collidecheck
      view = renderCanvas.view;
      renderCanvas.render(stage);
      ctx = view.getContext("2d");

      if(isRunning){
         var count = 0;
         playerList.forEach(function(player){
            animatePlayer(player, count);
            if(alive[count]){
               rotatePlayer(player);
            }
            count ++;
         });
      }
      // render the stage
      renderer.render(stage);
      //save tails as 1 img

      requestAnimationFrame( animate );

   }
}
//returns the preloaded texture as a texture object
//nr = player nr
function getTexture(nr){
   if(nr == 0){ return new PIXI.Sprite( PIXI.loader.resources.image1.texture)  }
   else if(nr == 1){ return new PIXI.Sprite( PIXI.loader.resources.image2.texture) }
   else if(nr == 2){ return new PIXI.Sprite( PIXI.loader.resources.image3.texture) }
   else if(nr == 3){ return new PIXI.Sprite( PIXI.loader.resources.image4.texture) }
   else if(nr == 4){ return new PIXI.Sprite( PIXI.loader.resources.image5.texture) }
   else if(nr == 5){ return new PIXI.Sprite( PIXI.loader.resources.image6.texture) }
   else if(nr == 6){ return new PIXI.Sprite( PIXI.loader.resources.image7.texture) }
   else if(nr == 7){ return new PIXI.Sprite( PIXI.loader.resources.image8.texture) }
   else{return 0/*error*/}
}
function rotatePlayer(player){
   player.texture.rotation += player.turn*rs;
}

function setCurveGame(cg){
	curveGame = cg;
}

function addPoints() {
   var count = 0;
   playerList.forEach(function(player){
      if(alive[count]){
         player.score += 1;
      }
      console.log(player.score);
      count ++;
   });
}
function getScore() {
   var score = [];
   playerList.forEach(function(player){
      score.push(player.score);
   });
   return score;
}
function roundEnd(){

   var text;
   var gameOver = false;
   var count = 0;
   playerList.forEach(function(player){
      if (player.score >= winCondition){
         text = new PIXI.Text("Mr. "+ document.getElementById('board').rows[count+1].cells[0].innerHTML +" wins!", {font:"50px Arial", fill:"white"});
         text.position = {x: GAME_WIDTH/2, y: GAME_HEIGHT/2}
         text.anchor = {x: 0.5, y:0.5};
         stage.addChild(text);
         gameOver = true;
         count++;
      }
   });
   if(!gameOver){

      setTimeout(function(){
         text = new PIXI.Text("3", {font:"100px Arial", fill:"white"});
         text.position = {x: GAME_WIDTH/2, y: GAME_HEIGHT/2}
         text.anchor = {x: 0.5, y:0.5};
         stage.addChild(text);//console.log("3");
      }, 1000);
      setTimeout(function(){
         stage.removeChild(text);
         text.text = "2";
         stage.addChild(text);
      }, 2000);
      setTimeout(function(){
         stage.removeChild(text);
         text.text = "1";
         stage.addChild(text);
      }, 3000);
      setTimeout(function(){
         stage.removeChild(text);
         text.text = "Go!";
         stage.addChild(text);
      }, 4000);
      setTimeout(function(){
         stage.removeChild(text);
         resetGameBoard();
      }, 4500);
   }
	var leaderScore = 0;
	var leader = "";
	playerList.forEach(function(player){
		if (player.score >= leaderScore){
			leaderScore = player.score;
			leader = document.getElementById('board').rows[count+1].cells[0].innerHTML;
		}
	}
	curveGame.updateScore(leader,leaderScore);
   //setTimeout(countdown(), 3000);
}
function countdown(){
   console.log("3 sec l8r");
}
function resetGameBoard() {
   var count = 0;
   stage = new PIXI.Container();
   playerList.forEach(function(player){
      alive[count] = true;
      resetPlayer(player, count);
      tails[count] = new PIXI.ParticleContainer();
      stage.addChild(tails[count]);
      if(player.getTimer != null){
         clearTimeout(player.getTimer);
      }

      count ++;
   });

   isRunning = true;
}
function resetPlayer(player, count){
   player.texture.position.x = 0.2*GAME_WIDTH + (Math.random() * GAME_WIDTH*0.6);
   player.texture.position.y =  0.2*GAME_HEIGHT + (Math.random() * GAME_HEIGHT*0.6);
   player.turn = 0;
   player.texture.rotation = Math.random() * 6.2;
   player.draw = false;
   player.timer = false;
   stage.addChild(player.texture);
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
