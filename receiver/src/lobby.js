var colorTable =["#0C5DA5", "#C6F500", "#FF3D00", "#00A383", "#FF9500", "#AD009F", "#ED6B95", "#FFFC73"];
var nrPlayers = 0;

function joinGame(playerName){
   var tableRef = document.getElementById('board');
   console.log(tableRef.rows.length);
   // Insert a row in the table at row index 0
  var newRow   = tableRef.insertRow(tableRef.rows.length);

  // Insert a cell in the row at index 0
  var newCell  = newRow.insertCell(0);
  newCell.id = "td1";
  newCell.appendChild(document.createTextNode(playerName));
  var newCell2 = newRow.insertCell(1);
  newCell2.id = "td2";
  newCell2.style.backgroundColor = colorTable[nrPlayers % 8];
  var newCell3 = newRow.insertCell(2);
  newCell3.id = "td3";
  newCell3.appendChild(document.createTextNode("No"));

  nrPlayers ++;
  console.log('player added to lobby');
}

function leaveGame(playerNumber){
	document.getElementById("myTable").deleteRow(playerNumber+1);
}

function playerReady (playerNumber){
   var cell = document.getElementById('board').rows[playerNumber+1].cells[2];

   cell.innerHTML ="Yes";
   cell.style.color = "green";
}
function playerNotReady(playerNumber){
   var cell = document.getElementById('board').rows[playerNumber+1].cells[2];

   cell.innerHTML ="No";
   cell.style.color = "red";
}
