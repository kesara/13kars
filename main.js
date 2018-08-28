/*
 * 13Kars
 * ======
 *
 * Simple car game
 *
 * Copyright (C) 2018 Kesara Rathnayake
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

/* configuration */
const WIDTH = 600;          // canvas width
const HEIGHT = 400;         // canvas height
const MIN_SPEED = 4;        // minimum speed of enemy cars
const MAX_SPEED_UP = 6;     // maximum speed up attribute
const LEVEL_THRESHOLD = 15; // score at which level increase
// single hex value of background color
const BGN = Number(window.getComputedStyle(
  document.getElementById("main-div"), null).getPropertyValue(
    "background-color").slice(4, 6));
const LOW_FUEL_TRESHOLD = 200;  // low fuel notification
const FUEL_CELL_TRESHOLD = 100; // value in which fuel cell gets discharged
const FUEL_CELL_SPEED = 5;   // fuel cell speed
// messages
const DEFAULT = "Going againts incoming traffic. Drive safe!";
const LOW_FUEL = "Running out of fuel!";
const TWEET = "<a href=\"https://twitter.com/intent/tweet?" +
              "text=I scored <SCORE> on 13kars&" +
              "url=https://13kars.fq.nz\">Share on Twitter</a>";
const GAME_OVER = "Press [SPACE] to restart. " + TWEET;
const GAME_OVER_COLLISION = "Collision! " + GAME_OVER;
const GAME_OVER_NOFUEL = "Ran out of fuel! " + GAME_OVER;

// audio
var audio_fuel_cell = new Audio("audio/fuel_cell.wav");
var audio_no_fuel = new Audio("audio/no_fuel.wav");
var audio_low_fuel = new Audio("audio/low_fuel.wav");
var audio_collision = new Audio("audio/collision.wav");
var audio_pass = new Audio("audio/pass.wav");
var audio_level_up = new Audio("audio/level_up.wav");

// initated kontra engine
kontra.init();

// set canvas size
kontra.canvas.width = WIDTH;
kontra.canvas.height = HEIGHT;

var score = 0;            // players' score
var fuel = 1000;          // how much fuel player got
var fuel_cell_gauge = 0;  // fuel cell gauge
var level = 1;            // user level

/* helper functions */
function getRandomInt(max) {
  /* return random number between 0..max */
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomcolor() {
  /* return random grayscale color
   * Assumtion BGN > 20 and BGN < 215
   */
  var color;
  var n = getRandomInt(256);
  if (n > BGN - 20 && n < BGN + 10) {
    // too close to background color
    n += 40;
  }
  n = n.toString(16);
  color = "#" + n + n + n;
  return color;
}

function getCar() {
  /* return a default car */
  return kontra.sprite({
    color: "#000000",
    width: 40,
    height: 40,
  });
}

function getEnemyCar() {
  /* return enemy car */
  var enemy = getCar();
  enemy.x = WIDTH;
  enemy.y = getRandomInt(HEIGHT - enemy.height);
  enemy.dx = -MIN_SPEED -getRandomInt(MAX_SPEED_UP);
  return enemy;
}


function getFuelCell() {
  /* return a fuel cell */
  return kontra.sprite({
    dx: -FUEL_CELL_SPEED,
    width: 40,
    height: 40,
    radius: 20,
    color_index: 255,
    color_asc: false,
    fuel: 200,
    active: false,
    render: function() {
      if (this.color_asc == true) {
        this.color_index++;
        if (this.color_index > 255) {
          this.color_index = 255;
          this.color_asc = false;
        }
      } else {
        this.color_index--;
        if (this.color_index < 0) {
          this.color_index = 0
          this.color_asc = true;
        }
      }
      var n = this.color_index.toString(16);
      this.context.fillStyle = "#" + n + n + n;
      this.context.beginPath();
      this.context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
      this.context.fill();
    },
  });
}

function updateScore(score) {
  /* update score */
  element = document.getElementById("score");
  element.innerText = score;
}

function updateFuel(fuel) {
  /* update fuel */
  element = document.getElementById("fuel");
  if (fuel < 0) {
    fuel = 0;
  }
  element.innerText = fuel;
}

function updateHud(message) {
  /* show hud message */
  element = document.getElementById("hud");
  element.innerHTML = message.replace("<SCORE>", score);
}

function updateLevel(message) {
  /* show level */
  element = document.getElementById("level");
  element.innerText = level;
}

function pauseAnimation() {
  /* pause CSS animations */
  document.querySelector(".gutter-top").classList.add("paused");
  document.querySelector(".gutter-bottom").classList.add("paused");
}

/* sprites */
// players' car
var car = getCar();
car.x = 10;
car.y = 60;

// enemy cars
var enemies = [];
enemies.push(getEnemyCar());

// fuel cell
var fuel_cell = getFuelCell();

/* key bindings */
kontra.keys.bind("space", function() {
  // restart game by reloading page
  window.location.reload();
});

/* update display */
updateScore(score);
updateFuel(fuel);
updateHud(DEFAULT);

/* main game loop */
var loop = kontra.gameLoop({
  update() {
    // update score
    updateScore(score);

    // add new enemies on level ups
    if (score > 0 &&
        score % (
          LEVEL_THRESHOLD + LEVEL_THRESHOLD * (enemies.length -1))  == 0) {
      // level up: add another car
      audio_level_up.play();
      score++;
      level++;
      // add new enemy car
      var new_enemy = getEnemyCar();
      enemies.push(new_enemy);
    }

    // update level
    updateLevel(level);

    // capture user input
    if (kontra.keys.pressed("up") || kontra.keys.pressed("k") ||
        kontra.keys.pressed("w")) {
      car.y--;
      fuel--;
    }
    if (kontra.keys.pressed("down") || kontra.keys.pressed("j") ||
        kontra.keys.pressed("s")) {
      car.y++;
      fuel--;
    }

    // update fuel
    updateFuel(fuel);

    // update sprites
    car.update();
    for (i in enemies) {
      var enemy = enemies[i];
      enemy.update();
      if (fuel_cell.active === true) {
        fuel_cell.update();
      }

      // capture collision
      if (car.collidesWith(enemy)) {
        // car collision
        audio_collision.play();
        loop.stop();
        pauseAnimation();
        updateHud(GAME_OVER_COLLISION);
      }

      if (enemy.x + enemy.width < 0) {
        // spawn enemy car
        audio_pass.play();
        enemy.x = WIDTH;
        enemy.y = getRandomInt(HEIGHT - enemy.height);
        enemy.color = getRandomcolor();
        enemy.dx = -MIN_SPEED - getRandomInt(MAX_SPEED_UP);
        score += 1;
      }
    }

    if (fuel_cell.active === true && car.collidesWith(fuel_cell)) {
      // refill fuel
      audio_fuel_cell.play();
      fuel += fuel_cell.fuel;
      fuel_cell.active = false;
      fuel_cell.update();
      // update hud
      updateHud(DEFAULT);
    }

    // check fuel
    if (fuel < 0) {
      // ran out of fuel
      audio_no_fuel.play();
      updateHud(GAME_OVER_NOFUEL);
      loop.stop();
      pauseAnimation();
    } else if (fuel <= LOW_FUEL_TRESHOLD) {
      // low on fuel
      audio_low_fuel.play();
      updateHud(LOW_FUEL);
    }

    // fuel cell distribution
    if (fuel_cell_gauge >= FUEL_CELL_TRESHOLD && fuel_cell.active === false) {
      // dispatch fuel cell
      fuel_cell.x = WIDTH;
      fuel_cell.y = getRandomInt(HEIGHT - fuel_cell.radius);
      fuel_cell.active = true;
      // reset fuel cell gauge
      fuel_cell_gauge = 0;
    } else {
      // update fuel cell gauge
      fuel_cell_gauge += getRandomInt(2);
    }

    // move sprites
    if (car.y < 0) {
      car.y = 0;
    }
    if (car.y > HEIGHT - car.height) {
      car.y = HEIGHT - car.height;
    }
    if (fuel_cell.active === true) {
      if (fuel_cell.x + fuel_cell.radius < 0) {
        // deactivate fuel cell
        fuel_cell.active = false;
      }
    }
  },

  // render cars
  render() {
    car.render();
    for (i in enemies) {
      var enemy = enemies[i];
      enemy.render();
    }
    if (fuel_cell.active === true) {
      fuel_cell.render();
    }
  }
});

// start game loop
loop.start();
