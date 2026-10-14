// Imports
import * as render from "./render.mjs";
import * as util from "./util.mjs";

// State
let updateTime = 0;
const tiles = Array(util.mainWidth).fill().map(() => []);

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// Meshes
const backgroundMesh = new render.Mesh(
  [
    util.worldWidth / 2, util.worldHeight / 2, 1, 0,
    util.worldWidth / 2, -util.worldHeight / 2, 1, 1,
    -util.worldWidth / 2, util.worldHeight / 2, 0, 0,
    -util.worldWidth / 2, -util.worldHeight / 2, 0, 1,
  ],
  [0, 1, 2, 1, 2, 3]
);
const mainTiles = new render.Tiles(
  { x: -util.mainWidth / 2, y: -util.mainHeight / 2 },
  { w: util.mainWidth, h: util.mainHeight }
);
const nextTiles = new render.Tiles(
  { x: util.mainWidth / 2 + 1, y: util.mainHeight / 2 - 2 },
  { w: util.nextWidth, h: util.nextHeight }
);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Random colors for each tile every 0.5 seconds
  for (; time > updateTime; updateTime += 0.5) {
    for (let x = 0; x < util.mainWidth; x++) {
      for (let y = 0; y < util.mainHeight; y++) {
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
    for (let x = 0; x < util.mainWidth; x++) {
      for (let y = 0; y < util.mainHeight; y++) {
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
