"use strict";function addRow(e){var t=document.createElement("tr"),a=document.createElement("td");a.innerHTML=e.key().toUpperCase();var r=document.createElement("td");r.innerHTML=e.val(),t.appendChild(r),t.appendChild(a),table.insertBefore(t,table.firstChild)}var LEADERBOARD_SIZE=20,scoreListRef=new Firebase("https://snake-scores.firebaseio.com/main"),table=document.querySelector(".leaderboard-table");scoreListRef.orderByValue().limitToLast(LEADERBOARD_SIZE).on("value",function(e){table.innerHTML="",e.forEach(addRow)});