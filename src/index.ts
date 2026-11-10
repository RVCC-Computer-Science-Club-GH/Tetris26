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
const updateTimer = new util.Timer(0, 0.15, true);
let nextTetromino: tiles.Tetromino;
let shouldStop = false;
let timeStopped: number;
let timeOffset: number;

// Meshes
const backgroundMesh = new render.SpriteMesh(util.worldSize);
const tilesMesh = new render.TilesMesh(board.size);
const tilesTranslate = vec2(-util.worldSize.x / 2 + tilesMesh.size.x / 2 + 1, 0);
const nextMesh = new render.TilesMesh(vec2(4, 2));
const nextTranslate = vec2(
  util.worldSize.x / 2 - nextMesh.size.x / 2 - 1,
  util.worldSize.y / 2 - nextMesh.size.y / 2 - 1
);

// Select a random next tetromino
function randomNextTetromino() {
  const keys = [...tiles.tetrominos.keys()];
  const key = keys[Math.floor(keys.length * Math.random())];
  nextTetromino = tiles.tetrominos.get(key)!;
  nextMesh.tiles = new Set(nextTetromino.tiles);
}
randomNextTetromino();

// Game loop
function gameLoop(time: number) {
  // Request a new frame before any errors
  if (!shouldStop)
    window.requestAnimationFrame(gameLoop);
  else
    timeStopped = time;

  // Time in seconds
  time = (time + timeOffset) / 1000;

  // Update loop
  while (updateTimer.tick(time)) {
    // Try to spawn a random tetromino if none active and select a random next
    // tetromino if one was spawned
    for (let i = 0; board.shouldSpawn() && i < 100; i++) {
      if (board.spawnTetromino(nextTetromino))
        randomNextTetromino();
    }

    // Clear board if no tetromino could be spawned
    if (board.shouldSpawn())
      board.clear();

    // Apply gravity to active tiles
    if (!board.moveActive(vec2(0, -1)))
      board.clearActive();
  }

  // Clear screen
  render.clearScreen();

  // Draw background
  render.setTranslate(vec2(0, 0));
  render.setColor(util.colors.white);
  render.setTexture(backgroundTexture);
  backgroundMesh.render();

  // Draw tiles
  render.setTranslate(tilesTranslate);
  render.setTexture(tileTexture);
  for (const { color, tiles: colorTiles } of board.render()) {
    render.setColor(color);
    tilesMesh.tiles = colorTiles;
    tilesMesh.render();
  }

  // Draw next tetromino
  render.setTranslate(vec2(
    nextTranslate.x + nextTetromino.offset.x,
    nextTranslate.y + nextTetromino.offset.y
  ));
  render.setColor(nextTetromino.color);
  nextMesh.render();
}

// Pause and unpause on visibility change
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    shouldStop = true;
  } else if (shouldStop) {
    shouldStop = false;
    timeOffset -= performance.now() - timeStopped;
    window.requestAnimationFrame(gameLoop);
  }
});

// Start game loop
timeOffset = -performance.now();
window.requestAnimationFrame(gameLoop);
