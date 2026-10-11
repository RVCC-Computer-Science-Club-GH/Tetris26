// Imports
import { clearScreen, drawTiles } from "./render.js";
import { colors, worldWidth, worldHeight } from "./util.js";

// State
let updateTime = 0;
const tiles = Array(worldWidth).fill().map(() => []);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Random colors for each tile every 0.5 seconds
  for (; time > updateTime; updateTime += 0.5) {
    for (let x = 0; x < worldWidth; x++) {
      for (let y = 0; y < worldHeight; y++) {
        if (Math.random() < 0.5) {
          const keys = Object.keys(colors);
          tiles[x][y] = keys[Math.floor(keys.length * Math.random())];
        } else {
          tiles[x][y] = null;
        }
      }
    }
  }

  // Clear screen
  clearScreen();

  // 1 draw call for every color
  for (const color in colors) {
    const colorTiles = [];
    for (let x = 0; x < worldWidth; x++) {
      for (let y = 0; y < worldHeight; y++) {
        if (tiles[x][y] == color) {
          colorTiles.push({ x: x, y: y });
        }
      }
    }
    drawTiles(colors[color], colorTiles);
  }
});
