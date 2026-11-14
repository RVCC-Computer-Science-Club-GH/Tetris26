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
const board = new tiles.Tiles(vec2(10, 30));
const updateDelta = 0.2;
const slamUpdateDelta = 0.05;
const updateTimer = new util.Timer(0, updateDelta, true);
let nextTetromino: tiles.Tetromino;
let shouldStop = true;
let timeStopped = 0;
let timeOffset = 0;
let gracePeriod = 0;
let linesClearedTotal = 0;
let score = 0;
let level = 0;

// Calculate time
const calcTime = (time: number) => (time + timeOffset) / 1000;

// Meshes
const backgroundMesh = new render.SpriteMesh(util.worldSize);
const tilesMesh = new render.TilesMesh(board.size);
const tilesTranslate = vec2(-util.worldSize.x / 2 + tilesMesh.size.x / 2 + 1, 0);
const nextMesh = new render.TilesMesh(vec2(4, 2));
const nextTranslate = vec2(
  util.worldSize.x / 2 - 3,
  util.worldSize.y / 2 - 2,
);
const scoreMesh = new render.NumbersMesh(8);
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

// Try rotations that push off of walls and tiles
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

// Keydown
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
    // Start slamming down
    case "Space":
      updateTimer.duration = slamUpdateDelta;
  }
});

// Keyup
document.addEventListener("keyup", (event) => {
  switch (event.code) {
    // Stop slamming down
    case "Space":
      updateTimer.duration = updateDelta;
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

  // Calculate time
  time = calcTime(time);

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
    const linesCleared = board.clearComplete();
    if (linesCleared != 0) {
      linesClearedTotal += linesCleared;
      level = Math.trunc(linesClearedTotal / 10);
      let baseScore;
      switch (linesCleared) {
        case 1:
          baseScore = 40;
          break;
        case 2:
          baseScore = 100;
          break;
        case 3:
          baseScore = 300;
          break;
        default:
          baseScore = 1200;
      }
      score += baseScore * (level + 1);
    }

    // Try to spawn next tetromino
    if (board.shouldSpawn()) {
      // End game if none could spawn
      if (!board.spawnTetromino(nextTetromino)) {
        linesClearedTotal = 0;
        level = 0;
        score = 0;
        board.clearTiles();
      }

      // Select a random next tetromino
      randomNextTetromino();
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
