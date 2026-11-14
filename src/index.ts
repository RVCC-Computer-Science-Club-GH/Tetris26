// Imports
import * as render from "./render";
import * as util from "./util";
const { vec2 } = util;
import * as tiles from "./tiles";

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);

// State
const board = new tiles.Tiles(vec2(10, 20));
const updateTimer = new util.Timer(0, 0.2, true);
let nextTetromino: tiles.Tetromino;
let shouldStop = true;
let timeStopped = 0;
let timeOffset = 0;
let gracePeriod = 0;
let score = 4200;
let level = 18;

// Meshes
const backgroundMesh = new render.SpriteMesh(util.worldSize);
const tilesMesh = new render.TilesMesh(board.size);
const tilesTranslate = vec2(-util.worldSize.x / 2 + tilesMesh.size.x / 2 + 1, 0);
const nextMesh = new render.TilesMesh(vec2(4, 2));
const nextTranslate = vec2(
  util.worldSize.x / 2 - 3,
  util.worldSize.y / 2 - 2,
);
const scoreMesh = new render.NumbersMesh(6);
const scoreTranslate = vec2(
  util.worldSize.x / 2 - 3,
  util.worldSize.y / 2 - 4.5,
);
const levelMesh = new render.NumbersMesh(2);
const levelTranslate = vec2(
  util.worldSize.x / 2 - 3,
  util.worldSize.y / 2 - 6.5,
);

// Select a random next tetromino
function randomNextTetromino() {
  const keys = [...tiles.tetrominos.keys()];
  const key = keys[Math.trunc(keys.length * Math.random())];
  nextTetromino = tiles.tetrominos.get(key)!;
  nextMesh.tiles = new Set(nextTetromino.tiles);
}
randomNextTetromino();

// Try rotations that kick off other tiles
function tryRotations(rotation: util.Vec2) {
  board.moveActive(vec2(0, 0), rotation) ||
    board.moveActive(vec2(1, 0), rotation) ||
    board.moveActive(vec2(-1, 0), rotation) ||
    board.moveActive(vec2(0, 1), rotation) ||
    board.moveActive(vec2(0, -1), rotation) ||
    board.moveActive(vec2(2, 0), rotation) ||
    board.moveActive(vec2(-2, 0), rotation) ||
    board.moveActive(vec2(0, 2), rotation) ||
    board.moveActive(vec2(0, -2), rotation);
}

// Move active tiles with keyboard
document.addEventListener("keydown", (event) => {
  switch (event.code) {
    // Left
    case "KeyA":
    case "ArrowLeft":
      board.moveActive(vec2(-1, 0));
      break;
    // Right
    case "KeyD":
    case "ArrowRight":
      board.moveActive(vec2(1, 0));
      break;
    // Clockwise
    case "KeyW":
    case "ArrowUp":
      tryRotations(vec2(0, -1));
      break;
    // Counterclockwise
    case "KeyS":
    case "ArrowDown":
      tryRotations(vec2(0, 1));
      break;
    // Slam down
    case "Space":
      while (board.moveActive(vec2(0, -1)));
      board.lockActive();
  }
});

// Pause game
function pauseGame() {
  if (!shouldStop) {
    timeStopped = performance.now();
    shouldStop = true;
  }
}

// Resume game
function resumeGame() {
  if (shouldStop) {
    timeOffset -= performance.now() - timeStopped;
    shouldStop = false;
    window.requestAnimationFrame(gameLoop);
  }
}

// Game loop
function gameLoop(time: number) {
  // Request a new frame before any errors
  if (shouldStop)
    return;
  else
    window.requestAnimationFrame(gameLoop);

  // Time in seconds with offset
  time = (time + timeOffset) / 1000;

  // Update loop
  while (updateTimer.tick(time)) {
    // Apply gravity to active tiles
    if (!board.moveActive(vec2(0, -1))) {
      // Lock active tiles if can't fall after 4 "frame" grace period
      if (gracePeriod < 4) {
        gracePeriod++;
      } else {
        board.lockActive();
        gracePeriod = 0;
      }
    }

    // Clear any complete lines
    board.clearComplete();

    // Try to spawn a random tetromino
    if (board.shouldSpawn()) {
      // Select a random next tetromino if a tetromino was spawned and end game
      // if none could be spawned
      if (board.spawnTetromino(nextTetromino))
        randomNextTetromino();
      else
        board.clearTiles();
    }
  }

  // Clear screen
  render.clearScreen();

  // Draw background
  render.setTranslate(vec2(0, 0));
  render.setColor(util.colors.white);
  render.setTexture(backgroundTexture);
  backgroundMesh.render();

  // Draw score and level
  render.setTranslate(scoreTranslate);
  scoreMesh.renderNumber(score);
  render.setTranslate(levelTranslate);
  levelMesh.renderNumber(level);

  // Draw tiles
  render.setTranslate(tilesTranslate);
  render.setTexture(tileTexture);
  for (const { color, tiles: colorTiles } of board.renderData()) {
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
  if (document.hidden)
    pauseGame();
  else
    resumeGame();
});
window.addEventListener("blur", pauseGame);
window.addEventListener("focus", resumeGame);

// Start game loop
resumeGame();
