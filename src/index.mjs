// Imports
import * as render from "./render.mjs";
import * as util from "./util.mjs";

// State
let updateTime = 0;
const tiles = Array(util.width).fill().map(() => []);

// Textures
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Random colors for each tile every 0.5 seconds
  for (; time > updateTime; updateTime += 0.5) {
    for (let x = 0; x < util.width; x++) {
      for (let y = 0; y < util.height; y++) {
        if (Math.random() < 0.5) {
          const keys = Object.keys(util.colors);
          tiles[x][y] = keys[Math.floor(keys.length * Math.random())];
        } else {
          tiles[x][y] = null;
        }
      }
    }
  }

  // Clear screen
  render.clearScreen();

  // Draw background
  render.drawBackground(backgroundTexture);

  // 1 draw call for every color of the main tiles
  for (const color in util.colors) {
    const colorTiles = [];
    for (let x = 0; x < util.width; x++) {
      for (let y = 0; y < util.height; y++) {
        if (tiles[x][y] == color) {
          colorTiles.push({ x: x, y: y });
        }
      }
    }
    render.drawTiles(
      util.colors[color],
      util.width,
      util.height,
      render.mainIndex,
      tileTexture,
      colorTiles
    );
  }

  // Draw next tiles
  render.drawTiles(
    util.colors.green,
    util.nextWidth,
    util.nextHeight,
    render.nextIndex,
    tileTexture,
    [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 1 }
    ]
  );
});
