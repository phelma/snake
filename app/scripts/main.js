/* global: hammer */
'use strict';

var width = 20;
var height = 20;

var frameLength = 1000 / 10; // fps

var startX = 2;
var startY = 2;
var startLength = 80;

var throughWalls = true;

var snakeColour = '#2B3E51';

var SNAKE = {};

SNAKE.game = (function() {
  var ctx;
  var snake;

  function gameLoop() {
    ctx.clearRect(0, 0, width, height);
    snake.advance();
    if (snake.check()){
      init();
    } else {
      snake.draw(ctx);
      setTimeout(gameLoop, frameLength);
    }
  }

  function bindEvents() {
    var keysToDirections = {
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'
    };

    document.onkeydown = function(event) {
      var key = event.which;
      var direction = keysToDirections[key];

      if (direction) {
        snake.setDirection(direction);
        event.preventDefault();
      } else if (key === 32) {
        init();
      }
    };
  }

  function init() {
    var canvas = document.querySelector('canvas.snake');
    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    snake = SNAKE.snake();
    bindEvents();
    gameLoop();
  }

  return {
    init: init
  };

})();

SNAKE.snake = function() {
  var posArray = [];
  for (let i = 0; i < startLength; i++){
    posArray.push([startX, startY - i]);
  }

  var direction = 'right';
  var nextDirection = direction;
  var directionAfterThat = nextDirection;

  function setDirection(newDirection) {
    var allowedDirections;

    switch (direction) {
      case 'left':
      case 'right':
        allowedDirections = ['up', 'down'];
        break;
      case 'up':
      case 'down':
        allowedDirections = ['left', 'right'];
        break;
      default:
        throw ('Invalid direction');
    }
    if (allowedDirections.indexOf(newDirection) > -1) {
      nextDirection = newDirection;
    } else {
      directionAfterThat = newDirection;
    }
  }

  function drawSection(ctx, position) {
    var x = position[0];
    var y = position[1];
    ctx.fillRect(x, y, 1, 1);
  }

  function draw(ctx) {
    ctx.save();
    ctx.fillStyle = snakeColour;
    for (let i = 0; i < posArray.length; i++) {
      drawSection(ctx, posArray[i]);
    }
    ctx.restore();
  }

  function mod(a, b ){
    return ((a % b) + b) % b;
  }

  function advance() {
    var nextPosition = posArray[0].slice();
    direction = nextDirection;
    if (directionAfterThat) {
      nextDirection = directionAfterThat;
      directionAfterThat = undefined;
    }
    switch (direction) {
      case 'left':
        nextPosition[0] -= 1;
        break;
      case 'up':
        nextPosition[1] -= 1;
        break;
      case 'right':
        nextPosition[0] += 1;
        break;
      case 'down':
        nextPosition[1] += 1;
        break;
      default:
        throw ('Invalid direction');
    }

    if (throughWalls){
      nextPosition[0] = mod(nextPosition[0], width);
      nextPosition[1] = mod(nextPosition[1], height);
    }


    posArray.unshift(nextPosition);
    posArray.pop();


  }

  function arraysEqual(a, b) {
    var equal = a[0] === b[0] && a[1] === b[1];
    return equal;
  }

  function inArray (el, arr) {
    var isIn = false;
    arr.forEach( function(arrEl) {
      if (arraysEqual(el, arrEl)){
        isIn = true;
      }
    });
    return isIn;
  }

  function check(){
    var crash = false;
    var head = posArray[0];
    var body = posArray.slice(1, -1);
    var headX = head[0];
    var headY = head[1];

    if (!throughWalls && headX < 0 || headX >= width || headY < 0 || headY >= height) {
      crash = true || crash;
    } else {
      crash = false || crash;
    }

    if (inArray(head, body)){
      crash = true || crash;
    } else {
      crash = false || crash;
    }

    return crash;
  }

  return {
    draw: draw,
    advance: advance,
    setDirection: setDirection,
    check: check
  };
};

// var body = document.querySelector('body');
// var hammertime = new Hammer.Manager(body);
// hammertime.add( new Hammer.Swipe({direction: Hammer.DIRECTION_ALL}));
// hammertime.on('swipe', function (event) {
//   console.log('swipe', event);
// });




SNAKE.game.init();


