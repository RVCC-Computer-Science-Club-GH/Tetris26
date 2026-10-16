// Imports
import * as render from "./render.mjs";
import * as util from "./util.mjs";

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// Meshes
const backgroundSpriteMesh = new render.SpriteMesh(util.worldSize);
const mainTilesMesh = new render.TilesMesh({ x: 10, y: 20 });
const nextTilesMesh = new render.TilesMesh({ x: 4, y: 2 });
nextTilesMesh.tiles = new Set([
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
]);

// State
const tiles = Array(mainTilesMesh.size.x).fill().map(() => []);
let resetTimer = new util.Timer(-2, 2, true);
let gravityTimer = new util.Timer(0, 0.1, true);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Gravity
  while (gravityTimer.tick(time)) {
    for (let x = 0; x < mainTilesMesh.size.x; x++) {
      for (let y = 1; y < mainTilesMesh.size.y; y++) {
        if (tiles[x][y - 1] == null) {
          tiles[x][y - 1] = tiles[x][y];
          tiles[x][y] = undefined;
        }
      }
    }
  }

  // Reset to random colors
  while (resetTimer.tick(time)) {
    for (let x = 0; x < mainTilesMesh.size.x; x++) {
      for (let y = 0; y < mainTilesMesh.size.y; y++) {
        if (Math.random() < 0.75 * y / mainTilesMesh.size.y) {
          const values = [...util.tileColors.values()];
          tiles[x][y] = {
            color: values[Math.floor(values.length * Math.random())],
          };
        } else {
          tiles[x][y] = undefined;
        }
      }
    }
  }

  // Clear screen
  render.clearScreen();

  // Draw background
  render.setTranslate({ x: 0, y: 0 });
  render.setColor(util.colors.white);
  render.setTexture(backgroundTexture);
  backgroundSpriteMesh.render();

  // 1 draw call for every color of the main tiles
  render.setTranslate({
    x: -util.worldSize.x / 2 + mainTilesMesh.size.x / 2 + 1,
    y: 0
  });
  render.setTexture(tileTexture);
  for (const color of util.tileColors.values()) {
    const colorTiles = new Set;
    for (let x = 0; x < mainTilesMesh.size.x; x++) {
      for (let y = 0; y < mainTilesMesh.size.y; y++) {
        if (tiles[x][y] && tiles[x][y].color == color) {
          colorTiles.add({ x: x, y: y });
        }
      }
    }
    render.setColor(color);
    mainTilesMesh.tiles = colorTiles;
    mainTilesMesh.render();
  }

  // Draw next tiles
  render.setTranslate({
    x: util.worldSize.x / 2 - nextTilesMesh.size.x / 2 - 0.5,
    y: util.worldSize.y / 2 - nextTilesMesh.size.y / 2 - 1,
  });
  render.setColor(util.colors.green);
  nextTilesMesh.render();
});
