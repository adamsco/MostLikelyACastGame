var colorTable =["#0c5da5", "#c6f500", "#FF3d00", "#00A383", "#FF9500", "#Ad009f", "#ED6b95", "#FFFC73"];
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
}

function playerReady (playerNumber){
   var cell = document.getElementById('board').rows[playerNumber].cells[2];

   cell.innerHTML ="Yes";
   cell.innerHTML.style.color = "green";
}
function playerNotReady(playerNumber){
   var cell = document.getElementById('board').rows[playerNumber].cells[2].innerHTML;

   cell ="No";
   cell.style.color = "red";

}
