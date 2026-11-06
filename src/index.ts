// Imports
import * as render from "./render";
import * as util from "./util";
const vec2 = util.vec2;
import * as tiles from "./tiles";

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// State
const board = new tiles.Tiles(vec2(10, 20));
const initUpdateDelta = 0.1;
const updateTimer = new util.Timer(0, initUpdateDelta, true);
let nextTetromino = tiles.tetrominos.get("o")!;

// Meshes
const backgroundSpriteMesh = new render.SpriteMesh(util.worldSize);
const mainTilesMesh = new render.TilesMesh(board.size);
const mainTilesTranslate = vec2(-util.worldSize.x / 2 + mainTilesMesh.size.x / 2 + 1, 0);
const nextTilesMesh = new render.TilesMesh(vec2(4, 2));
const nextTilesTranslate = vec2(
  util.worldSize.x / 2 - nextTilesMesh.size.x / 2 - 1,
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
    board.gravity();

    // Try to spawn a random tetromino if none active and select a random next
    // tetromino if one was spawned
    for (let i = 0; !board.anyActive() && i < 100; i++) {
      if (board.spawnTetromino(nextTetromino)) {
        const keys = [...tiles.tetrominos.keys()];
        const key = keys[Math.floor(keys.length * Math.random())];
        nextTetromino = tiles.tetrominos.get(key)!;
        nextTilesMesh.tiles = new Set(nextTetromino.tiles);
      }
    }

    // Clear board if no tetromino could be spawned and speed up
    if (!board.anyActive()) {
      if (updateTimer.duration < initUpdateDelta / 2)
        updateTimer.duration = initUpdateDelta;
      else
        updateTimer.duration *= 3 / 4;
      board.clear();
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
  for (const { color, tiles: colorTiles } of board.render()) {
    render.setColor(color);
    mainTilesMesh.tiles = colorTiles;
    mainTilesMesh.render();
  }

  // Draw next tiles
  render.setTranslate(vec2(
    nextTilesTranslate.x + nextTetromino.offset.x,
    nextTilesTranslate.y + nextTetromino.offset.y
  ));
  render.setColor(nextTetromino.color);
  nextTilesMesh.render();
});
