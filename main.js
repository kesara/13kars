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
const WIDTH = 600;      // canvas width
const HEIGHT = 400;     // canvas height
const MIN_SPEED = 5;    // minimum speed of enermy cars
const MAX_SPEED_UP = 6; // maximum speed up attribute
// single hex value of background color
const BGN = Number(window.getComputedStyle(
  document.getElementById("main-div"), null).getPropertyValue(
    "background-color").slice(4, 6));
const LOW_GAS_MARK = 200;    // low gas notification
const FUEL_CELL_MARK = 100;  // value in which fuel cell gets discharged
const FUEL_CELL_SPEED = 5;   // fuel cell speed
// messages
const DEFAULT = "Drive safe!";
const LOW_GAS = "Running out of gas!";
const GAME_OVER = "Press [SPACE] to restart.";
const GAME_OVER_COLLISION = "Collision! " + GAME_OVER;
const GAME_OVER_NOFUEL = "Ran out of fuel! " + GAME_OVER;

// initated kontra engine
kontra.init();

// set canvas size
kontra.canvas.width = WIDTH;
kontra.canvas.height = HEIGHT;

var score = 0;            // players' score
var gas = 1000;           // how much gas player got
var fuel_cell_gauge = 0;  // fuel cell gauge

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

function getFuelCell() {
  /* return a fuel cell */
  return kontra.sprite({
    dx: -FUEL_CELL_SPEED,
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

function updateGas(gas) {
  /* update gas */
  element = document.getElementById("gas");
  if (gas < 0) {
    gas = 0;
  }
  element.innerText = gas;
}

function updateHud(message) {
  /* show hud message */
  element = document.getElementById("hud");
  element.innerText = message;
}

/* sprites */
// players' car
var car = getCar();
car.x = 10;
car.y = 60;

// enermy car
var enermy = getCar();
enermy.x = WIDTH;
enermy.y = getRandomInt(HEIGHT - enermy.height);
enermy.dx = -MIN_SPEED -getRandomInt(MAX_SPEED_UP);

// fuel cell
var fuel_cell = getFuelCell();

/* key bindings */
kontra.keys.bind("space", function() {
  // restart game by reloading page
  window.location.reload();
});

/* update display */
updateScore(score);
updateGas(gas);
updateHud(DEFAULT);

/* main game loop */
var loop = kontra.gameLoop({
  update() {
    // update score
    updateScore(score);

    // capture user input
    if (kontra.keys.pressed("up") || kontra.keys.pressed("k") ||
        kontra.keys.pressed("w")) {
      car.y--;
      gas--;
    }
    if (kontra.keys.pressed("down") || kontra.keys.pressed("j") ||
        kontra.keys.pressed("s")) {
      car.y++;
      gas--;
    }

    // update gas
    updateGas(gas);

    // update sprites
    car.update();
    enermy.update();
    if (fuel_cell.active === true) {
      fuel_cell.update();
    }

    // capture collision
    if (car.collidesWith(enermy)) {
      // car collision
      updateHud(GAME_OVER_COLLISION);
      loop.stop();
    }

    if (fuel_cell.active === true && car.collidesWith(fuel_cell)) {
      // refill fuel
      gas += fuel_cell.fuel;
      fuel_cell.active = false;
      fuel_cell.update();
    }

    // check fuel
    if (gas < 0) {
      // ran out of fuel
      updateHud(GAME_OVER_NOFUEL);
      loop.stop();
    } else if (gas <= LOW_GAS_MARK) {
      // low on fuel
      updateHud(LOW_GAS);
    }

    // fuel cell distribution
    if (fuel_cell_gauge >= FUEL_CELL_MARK && fuel_cell.active === false) {
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
    if (enermy.x + enermy.width < 0) {
      enermy.x = WIDTH;
      enermy.y = getRandomInt(HEIGHT - enermy.height);
      enermy.color = getRandomcolor();
      enermy.dx = -MIN_SPEED - getRandomInt(MAX_SPEED_UP);
      score += 1;
    }
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
    enermy.render();
    if (fuel_cell.active === true) {
      fuel_cell.render();
    }
  }
});

// start game loop
loop.start();
