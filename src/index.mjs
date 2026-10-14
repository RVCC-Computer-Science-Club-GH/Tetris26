// Imports
import * as render from "./render.mjs";
import * as util from "./util.mjs";

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// Meshes
const backgroundMesh = new render.Mesh(
  [
    util.worldSize.w / 2, util.worldSize.h / 2, 1, 0,
    util.worldSize.w / 2, -util.worldSize.h / 2, 1, 1,
    -util.worldSize.w / 2, util.worldSize.h / 2, 0, 0,
    -util.worldSize.w / 2, -util.worldSize.h / 2, 0, 1,
  ],
  [0, 1, 2, 1, 2, 3]
);
const mainTiles = new render.Tiles(
  { x: -5, y: -10 },
  { w: 10, h: 20 }
);
const nextTiles = new render.Tiles(
  { x: mainTiles.size.w / 2 + 1, y: mainTiles.size.h / 2 - 2 },
  { w: 4, h: 2 }
);

// State
let updateTime = 0;
const tiles = Array(mainTiles.size.w).fill().map(() => []);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Random colors for each tile every 0.5 seconds
  for (; time > updateTime; updateTime += 0.5) {
    for (let x = 0; x < mainTiles.size.w; x++) {
      for (let y = 0; y < mainTiles.size.h; y++) {
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
  render.setColor({ r: 1, g: 1, b: 1 });
  render.setTexture(backgroundTexture);
  backgroundMesh.render();

  // 1 draw call for every color of the main tiles
  render.setTexture(tileTexture);
  for (const color in util.colors) {
    const colorTiles = [];
    for (let x = 0; x < mainTiles.size.w; x++) {
      for (let y = 0; y < mainTiles.size.h; y++) {
        if (tiles[x][y] == color) {
          colorTiles.push({ x: x, y: y });
        }
      }
    }
    render.setColor(util.colors[color]);
    mainTiles.render(colorTiles);
  }

  // Draw next tiles
  render.setColor(util.colors.green);
  nextTiles.render([
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 2, y: 1 }
  ]);
});
