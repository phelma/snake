/* global Firebase */
'use strict';

var LEADERBOARD_SIZE = 20;

var scoreListRef = new Firebase('https://snake-scores-dev.firebaseio.com/dev');

// var htmlForPath = {};

var table = document.querySelector('.leaderboard-table');

function addRow(data){
  var row = document.createElement('tr');
  var user = document.createElement('td');
  user.innerHTML = data.key().toUpperCase();
  var score = document.createElement('td');
  score.innerHTML = data.val();
  row.appendChild(score);
  row.appendChild(user);

  table.insertBefore(row, table.firstChild);
}

scoreListRef.orderByValue().limitToLast(LEADERBOARD_SIZE).on('value', function(snapshot){
  table.innerHTML = '';
  snapshot.forEach(addRow);
});

