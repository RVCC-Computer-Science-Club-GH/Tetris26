// Imports
import * as render from "./render";
import * as util from "./util";
const vec2 = util.vec2;
import * as _tiles from "./tiles";

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// State
const tiles = new _tiles.Tiles(vec2(10, 20));
const updateTimer = new util.Timer(0, 0.1, true);

// Meshes
const backgroundSpriteMesh = new render.SpriteMesh(util.worldSize);
const mainTilesMesh = new render.TilesMesh(tiles.size);
const mainTilesTranslate = vec2(-util.worldSize.x / 2 + mainTilesMesh.size.x / 2 + 1, 0);
const nextTilesMesh = new render.TilesMesh(vec2(4, 2));
nextTilesMesh.tiles = new Set([
  vec2(0, 0),
  vec2(1, 0),
  vec2(1, 1),
  vec2(2, 1),
]);
const nextTilesTranslate = vec2(
  util.worldSize.x / 2 - nextTilesMesh.size.x / 2 - 0.5,
  util.worldSize.y / 2 - nextTilesMesh.size.y / 2 - 1
);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Update loop
  while (updateTimer.tick(time)) {
    // Apply gravity to active tiles
    tiles.gravity();

    // Spawn a random tetromino if none active
    if (tiles.active.size == 0) {
      const keys = [..._tiles.tetrominos.keys()];
      tiles.spawnTetromino(keys[Math.floor(keys.length * Math.random())]);
    }
  }

  // Clear screen
  render.clearScreen();

  // Draw background
  render.setTranslate(vec2(0, 0));
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
