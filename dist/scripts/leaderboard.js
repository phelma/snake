/* global Firebase */
'use strict';

var LEADERBOARD_SIZE = 20;

var scoreListRef = new Firebase('https://snake-scores.firebaseio.com/');

// var htmlForPath = {};

var table = document.querySelector('.leaderboard-table');

function addRow(val) {
  var row = document.createElement('tr');
  var user = document.createElement('td');
  user.innerHTML = val.name.toUpperCase();
  var score = document.createElement('td');
  score.innerHTML = val.score;
  row.appendChild(score);
  row.appendChild(user);

  table.insertBefore(row, table.firstChild);
}

scoreListRef.orderByChild('score').limitToLast(LEADERBOARD_SIZE).on('value', function (snapshot) {
  table.innerHTML = '';
  snapshot.forEach(function (data) {
    var val = data.val();
    addRow(val);
  });
});
//# sourceMappingURL=leaderboard.js.map
