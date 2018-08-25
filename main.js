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
// single hex value of background colour
const BGN = Number(window.getComputedStyle(
  document.getElementById("main-div"), null).getPropertyValue(
    "background-color").slice(4, 6));

// initated kontra engine
kontra.init();

// set canvas size
kontra.canvas.width = WIDTH;
kontra.canvas.height = HEIGHT;

var score = 0;  // players' score

/* helper functions */
function getRandomInt(max) {
  /* return random number between 0..max */
  return Math.floor(Math.random() * Math.floor(max));
}

function getRandomColour() {
  /* return random grayscale colour
   * Assumtion BGN > 20 and BGN < 215
   */
  var colour;
  var n = getRandomInt(256);
  if (n > BGN - 20 && n < BGN + 10) {
    // too close to background colour
    n += 40;
  }
  n = n.toString(16);
  colour = "#" + n + n + n;
  return colour;
}

function getCar() {
  /* return a default car */
  return kontra.sprite({
    color: "#000000",
    width: 40,
    height: 40,
  });
}

function updateScore(score) {
  /* update score */
  element = document.getElementById("score");
  element.innerText = score;
}


/* cars */
// players' car
var car = getCar();
car.x = 10;
car.y = 60;

// enermy car
var enermy = getCar();
enermy.x = WIDTH;
enermy.y = getRandomInt(HEIGHT - enermy.height);
enermy.dx = -MIN_SPEED -getRandomInt(MAX_SPEED_UP);

/* key bindings */
kontra.keys.bind("space", function() {
  // restart game by reloading page
  window.location.reload();
});

/* main game loop */
var loop = kontra.gameLoop({
  update() {
    // update score
    updateScore(score);

    // capture user input
    if (kontra.keys.pressed("up") || kontra.keys.pressed("k")) {
      car.y--;
    }
    if (kontra.keys.pressed("down") || kontra.keys.pressed("j")) {
      car.y++;
    }

    // update sprites
    car.update();
    enermy.update();

    // capture collision
    if (car.collidesWith(enermy)) {
      // car collision
      loop.stop();
    }

    // move sprites
    if (enermy.x+enermy.width < 0) {
      enermy.x = WIDTH;
      enermy.y = getRandomInt(HEIGHT - enermy.height);
      enermy.color = getRandomColour();
      enermy.dx = -MIN_SPEED - getRandomInt(MAX_SPEED_UP);
      score += 1;
    }
    if (car.y < 0) {
      car.y = 0;
    }
    if (car.y > HEIGHT - car.height) {
      car.y = HEIGHT - car.height;
    }
  },

  // render cars
  render() {
    car.render();
    enermy.render();
  }
});

// start game loop
loop.start();
