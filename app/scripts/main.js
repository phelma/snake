/* global Hammer */
'use strict';

var width = 20;
var height = 20;

var fps = 10;
var frameLength = 1000 / fps;

var startX = 2;
var startY = 2;
var startLength = 10;

var throughWalls = true;

var bgColour = '#ECF0F1';
var snakeColour = '#2B3E51';
var deadColour = '#C23824';
var foodColour = '#1FCE6D';
var scoreColour = '#F2C500';

var SNAKE = {};

var touchEl = document.querySelector('.touch');
var hammertime = new Hammer.Manager(touchEl);
hammertime.add( new Hammer.Swipe({direction: Hammer.DIRECTION_ALL}));

SNAKE.game = (function() {
  var ctx;
  var snake;

  function gameLoop() {
    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, width, height);
    snake.drawScore(ctx);
    snake.advance();
    if (snake.check().crash){
      snake.draw(ctx, true);
    } else {
      if (snake.check().food){
        snake.eat();
        snake.longer(1);
        snake.speedup();
      }
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

    var swipeToDirections = {
      2: 'left',
      4: 'right',
      8: 'up',
      16: 'down'
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

    hammertime.on('swipe', function (event) {
      event.preventDefault();
      var direction = swipeToDirections[event.direction];
      if (direction) {
        snake.setDirection(direction);
      }
    });

  }

  function init() {
    var canvas = document.querySelector('canvas.snake');
    let deviceWidth = document.querySelector('.touch').clientWidth;
    let deviceHeight = document.querySelector('.touch').clientHeight;

    let canvasSize = Math.min(deviceWidth, deviceHeight);
    canvas.style.width = canvasSize * 0.9 + 'px';
    canvas.style.height = canvasSize * 0.9 + 'px';


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
  var foodPos = [2, 10];
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

  function drawScore (ctx) {
    ctx.save();
    ctx.fillStyle = scoreColour;
    ctx.font = '20px courier';
    var score = posArray.length - startLength;
    ctx.fillText(score, 0, 20, width);
  }

  function drawSection(ctx, position) {
    var x = position[0];
    var y = position[1];
    ctx.fillRect(x, y, 1, 1);
  }

  function draw(ctx, dead) {
    ctx.save();
    ctx.fillStyle = dead ? deadColour : snakeColour;
    for (let i = 0; i < posArray.length; i++) {
      drawSection(ctx, posArray[i]);
    }

    ctx.fillStyle = foodColour;

    drawSection(ctx, foodPos);

    ctx.restore();
  }

  function mod(a, b ){
    return ((a % b) + b) % b;
  }

  function advance() {
    var nextPosition = posArray[0].slice();
    direction = nextDirection;
    if (directionAfterThat) {
      setDirection(directionAfterThat);
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
    if (this.extend > 0){
      this.extend --;
    } else {
      posArray.pop();
    }
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
    var food = false;

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

    if (arraysEqual(foodPos, head)){
      food = true || food;
    }

    var out = {};
    out.crash = crash;
    out.crashHead = head;
    out.food = food;

    return out;
  }

  function longer(a){
    this.extend = a;
  }

  function eat(){
    let x = Math.floor(Math.random() * width);
    let y = Math.floor(Math.random() * height);
    var newFoodPos = [x, y];

    if (inArray(newFoodPos, posArray)){
      eat();
    } else {
      foodPos = newFoodPos;
    }

  }

  function speedup(){
    fps++;
    frameLength = 1000 / fps;
  }

  return {
    draw: draw,
    advance: advance,
    setDirection: setDirection,
    check: check,
    longer: longer,
    eat: eat,
    drawScore: drawScore,
    speedup: speedup
  };
};

SNAKE.game.init();
