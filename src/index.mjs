// Imports
import * as render from "./render.mjs";
import * as util from "./util.mjs";
import * as _tiles from "./tiles.mjs";

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// State
const tiles = new _tiles.Tiles({ x: 10, y: 20 });
let resetTimer = new util.Timer(-2, 2, true);
let gravityTimer = new util.Timer(0, 0.1, true);

// Meshes
const backgroundSpriteMesh = new render.SpriteMesh(util.worldSize);
const mainTilesMesh = new render.TilesMesh(tiles.size);
const mainTilesTranslate = {
  x: -util.worldSize.x / 2 + mainTilesMesh.size.x / 2 + 1,
  y: 0,
};
const nextTilesMesh = new render.TilesMesh({ x: 4, y: 2 });
nextTilesMesh.tiles = new Set([
  { x: 0, y: 0 },
  { x: 1, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 1 },
]);
const nextTilesTranslate = {
  x: util.worldSize.x / 2 - nextTilesMesh.size.x / 2 - 0.5,
  y: util.worldSize.y / 2 - nextTilesMesh.size.y / 2 - 1,
};

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Gravity
  while (gravityTimer.tick(time)) {
    for (let x = 0; x < tiles.size.x; x++) {
      for (let y = 1; y < tiles.size.y; y++) {
        const current = tiles.index({ x: x, y: y });
        const below = tiles.index({ x: x, y: y - 1 });
        if (tiles.tiles[below] == null) {
          tiles.tiles[below] = tiles.tiles[current];
          tiles.tiles[current] = null;
        }
      }
    }
  }

  // Reset to random colors
  while (resetTimer.tick(time)) {
    for (let x = 0; x < tiles.size.x; x++) {
      for (let y = 0; y < tiles.size.y; y++) {
        const current = tiles.index({ x: x, y: y });
        if (Math.random() < 0.75 * y / tiles.size.y) {
          const values = [...util.tileColors.values()];
          tiles.tiles[current] = new _tiles.Tile(
            values[Math.floor(values.length * Math.random())]
          );
        } else {
          tiles.tiles[current] = null;
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

  // Draw main tiles
  render.setTranslate(mainTilesTranslate);
  render.setTexture(tileTexture);
  for (const { color, tiles: colorTiles } of tiles.render()) {
    render.setColor(color);
    mainTilesMesh.tiles = colorTiles;
    mainTilesMesh.render();
  }

  // Draw next tiles
  render.setTranslate(nextTilesTranslate);
  render.setColor(util.colors.green);
  nextTilesMesh.render();
});
