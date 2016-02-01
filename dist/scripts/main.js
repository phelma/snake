/* global Hammer Firebase Cookies ga */
'use strict';

var width = 10;
var height = 10;

var startFps = 5;
var fps = startFps;
var frameLength = 1000 / fps;

var startX = 2;
var startY = 2;
var startLength = 10;

var throughWalls = true;

var bgColour = '#ECF0F1';
var snakeHeadColour = '#2B3E51';
var snakeColour = '#305791';
var deadColour = '#C23824';
var foodColour = '#1AAF5D';
var scoreColour = '#F2C500';

var SNAKE = {};

// var APP_VERSION = 0.1;

var touchEl = document.querySelector('.touch');
var nameEl = document.querySelector('input.username');
var hammertime = new Hammer.Manager(touchEl);
hammertime.add(new Hammer.Swipe({ direction: Hammer.DIRECTION_ALL }));
hammertime.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));

SNAKE.game = function () {
  var ctx;
  var snake;
  var initialized = false;
  var scoreListRef;

  function gameLoop() {
    ctx.fillStyle = bgColour;
    ctx.fillRect(0, 0, width, height);
    snake.drawScore(ctx);
    snake.advance();
    if (snake.check().crash) {
      snake.die();
      addScore();
      snake.draw(ctx, true);
    } else {
      if (snake.check().food) {
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
      // arrow keys
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down'

      // //WASD
      // 65: 'left',
      // 87: 'up',
      // 68: 'right',
      // 83: 'down',

      // //HJKL
      // 72: 'left',
      // 74: 'down',
      // 75: 'up',
      // 76: 'right'
    };

    var swipeToDirections = {
      2: 'left',
      4: 'right',
      8: 'up',
      16: 'down'
    };

    function restart() {
      if (snake.isDead()) {
        snake.reset();
        gameLoop();
      }
    }

    document.onkeydown = function (event) {
      var key = event.which;
      var direction = keysToDirections[key];

      if (direction) {
        snake.setDirection(direction);
        event.preventDefault();
      } else if (key === 32) {
        restart();
      }
    };

    hammertime.on('swipe', function (event) {
      event.preventDefault();
      var direction = swipeToDirections[event.direction];
      if (direction) {
        snake.setDirection(direction);
      }
    });

    hammertime.on('doubletap', function (event) {
      event.preventDefault();
      restart();
    });
  }

  function init() {
    if (initialized) {
      console.error('Dont init twice');
      return;
    }
    initialized = true;
    var canvas = document.querySelector('canvas.snake');
    var deviceWidth = document.querySelector('.touch').clientWidth;
    var deviceHeight = document.querySelector('.touch').clientHeight;

    var canvasSize = Math.min(deviceWidth, deviceHeight);
    canvas.style.width = canvasSize * 0.9 + 'px';
    canvas.style.height = canvasSize * 0.9 + 'px';

    canvas.width = width;
    canvas.height = height;
    ctx = canvas.getContext('2d');
    snake = SNAKE.snake();
    bindEvents();
    gameLoop();

    scoreListRef = new Firebase('https://snake-scores.firebaseio.com/main');
  }

  function getUsername() {
    return nameEl.value.toUpperCase();
  }

  function addScore() {
    var name = getUsername() || 'ANON';
    var score = snake.getScore();

    scoreListRef.child('aasd').once('value', function (snapshot) {
      var prevScore = snapshot.val();
      if (!prevScore || score > prevScore) {
        scoreListRef.child(name).setWithPriority(score, score);
      }
    });

    ga('send', 'event', 'game', 'over', name, score);
  }

  function saveUserName() {
    var userName = getUsername();
    Cookies.set('username', userName, { expires: Infinity });
  }

  function setUsername(username) {
    nameEl.value = username;
  }

  var cookieName = Cookies.get('username');
  if (cookieName) {
    setUsername(cookieName);
  } else {
    nameEl.focus();
  }

  nameEl.addEventListener('change', saveUserName);

  return {
    init: init
  };
}();

SNAKE.snake = function () {
  this.dead = false;
  var posArray = [];
  var foodPos = [2, 6];
  for (var i = 0; i < startLength; i++) {
    posArray.push([startX, startY - i]);
  }

  var direction = 'right';
  var nextDirection = direction;
  var directionAfterThat = nextDirection;

  function reset() {
    this.dead = false;
    fps = startFps;
    frameLength = 1000 / fps;
    posArray = [];
    foodPos = [2, 6];
    for (var i = 0; i < startLength; i++) {
      posArray.push([startX, startY - i]);
    }
    direction = 'right';
    nextDirection = direction;
    directionAfterThat = nextDirection;
  }

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
        throw 'Invalid direction';
    }
    if (allowedDirections.indexOf(newDirection) > -1) {
      nextDirection = newDirection;
    } else {
      directionAfterThat = newDirection;
    }
  }

  function getScore() {
    return posArray.length - startLength;
  }

  function drawScore(ctx) {
    ctx.save();
    ctx.fillStyle = scoreColour;
    ctx.font = '8px "5x5 Pixel"';
    ctx.fillText(getScore(), 1, height);
  }

  function drawSection(ctx, position) {
    var x = position[0];
    var y = position[1];
    ctx.fillRect(x, y, 1, 1);
  }

  function draw(ctx, dead) {
    ctx.save();
    for (var i = 0; i < posArray.length; i++) {
      if (i === 0) {
        ctx.fillStyle = snakeHeadColour;
      } else {
        ctx.fillStyle = dead ? deadColour : snakeColour;
      }
      drawSection(ctx, posArray[i]);
    }

    ctx.fillStyle = foodColour;

    drawSection(ctx, foodPos);

    ctx.restore();
  }

  function mod(a, b) {
    return (a % b + b) % b;
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
        throw 'Invalid direction';
    }

    if (throughWalls) {
      nextPosition[0] = mod(nextPosition[0], width);
      nextPosition[1] = mod(nextPosition[1], height);
    }

    posArray.unshift(nextPosition);
    if (this.extend > 0) {
      this.extend--;
    } else {
      posArray.pop();
    }
  }

  function arraysEqual(a, b) {
    var equal = a[0] === b[0] && a[1] === b[1];
    return equal;
  }

  function inArray(el, arr) {
    var isIn = false;
    arr.forEach(function (arrEl) {
      if (arraysEqual(el, arrEl)) {
        isIn = true;
      }
    });
    return isIn;
  }

  function check() {
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

    if (inArray(head, body)) {
      crash = true || crash;
    } else {
      crash = false || crash;
    }

    if (arraysEqual(foodPos, head)) {
      food = true || food;
    }

    var out = {};
    out.crash = crash;
    out.crashHead = head;
    out.food = food;

    return out;
  }

  function longer(a) {
    this.extend = a;
  }

  function eat() {
    var x = Math.floor(Math.random() * width);
    var y = Math.floor(Math.random() * height);
    var newFoodPos = [x, y];

    if (inArray(newFoodPos, posArray)) {
      eat();
    } else {
      foodPos = newFoodPos;
    }
  }

  function speedup() {
    fps += 0.1;
    frameLength = 1000 / fps;
  }

  function die() {
    this.dead = true;
  }

  function isDead() {
    return this.dead;
  }

  return {
    draw: draw,
    advance: advance,
    setDirection: setDirection,
    check: check,
    longer: longer,
    eat: eat,
    drawScore: drawScore,
    speedup: speedup,
    die: die,
    isDead: isDead,
    reset: reset,
    getScore: getScore
  };
};

window.onload = SNAKE.game.init();
//# sourceMappingURL=main.js.map
