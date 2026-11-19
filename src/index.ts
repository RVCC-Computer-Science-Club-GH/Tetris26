// Imports
import * as render from "./render";
import * as util from "./util";
const { vec2 } = util;
import * as tiles from "./tiles";

// State
const board = new tiles.Tiles(vec2(10, 30));
const updateDelta = 0.2;
const slamUpdateDelta = 0.05;
const updateTimer = new util.Timer(0, updateDelta, true);
let nextTetromino: tiles.Tetromino;
let gracePeriod = 0;
let linesClearedTotal: number;
let score: number;
let level: number;
let canRestart = true;

// Time state
let shouldPause = true;
let timePaused = 0;
let timeOffset = 0;

// Calculate time
const calcTime = (time: number) => (time + timeOffset) / 1000;

// Pause game
function pauseGame() {
  if (!shouldPause) {
    timePaused = performance.now();
    shouldPause = true;
  }
}

// Resume game
function resumeGame() {
  if (shouldPause) {
    timeOffset -= performance.now() - timePaused;
    shouldPause = false;
    window.requestAnimationFrame(gameLoop);
  }
}

// Restart game
function restartGame() {
  if (canRestart) {
    linesClearedTotal = 0;
    score = 0;
    level = 0;
    canRestart = false;
    board.reset();
    randomNextTetromino();
    updateTimer.reset(calcTime(performance.now()));
  }
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

// Meshes
const backgroundMesh = new render.SpriteMesh(util.worldSize);
const backgroundTranslate = vec2(0, 0);
const tilesMesh = new render.TilesMesh(board.size);
const tilesTranslate = vec2(-util.worldSize.x / 2 + tilesMesh.size.x / 2 + 2, 0);
const nextMesh = new render.TilesMesh(vec2(4, 2));
const nextTranslate = vec2(
  util.worldSize.x / 2 - 4,
  util.worldSize.y / 2 - 2,
);
const scoreMesh = new render.NumbersMesh(8);
const scoreTranslate = vec2(
  util.worldSize.x / 2 - 4,
  util.worldSize.y / 2 - 4.5,
);
const levelMesh = new render.NumbersMesh(2);
const levelTranslate = vec2(
  util.worldSize.x / 2 - 4,
  util.worldSize.y / 2 - 6.5,
);
const gameOverMesh = new render.SpriteMesh(vec2(6, 3));
const gameOverTranslate = vec2(-2.5, 0.5);

// Textures
import backgroundImage from "./assets/background.webp";
const backgroundTexture = render.loadTexture(backgroundImage);
import tileImage from "./assets/tile.webp";
const tileTexture = render.loadTexture(tileImage);
import gameOverImage from "./assets/game_over.webp";
const gameOverTexture = render.loadTexture(gameOverImage);

// Select a random next tetromino
function randomNextTetromino() {
  const keys = [...tiles.tetrominos.keys()];
  const key = keys[Math.trunc(keys.length * Math.random())];
  nextTetromino = tiles.tetrominos.get(key)!;
  nextMesh.tiles = new Set(nextTetromino.tiles);
}

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
  // Any key restarts
  if (!event.repeat)
    restartGame();

  // Per key
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
      if (!event.repeat) {
        updateTimer.duration = slamUpdateDelta;
        updateTimer.reset(calcTime(performance.now()));
      }
  }
});

// Keyup
document.addEventListener("keyup", (event) => {
  switch (event.code) {
    // Stop slamming down
    case "Space":
      if (!event.repeat) {
        updateTimer.duration = updateDelta;
        updateTimer.reset(calcTime(performance.now()))
      }
  }
});

// Restart on click
document.addEventListener("click", restartGame);

// Game loop
function gameLoop(time: number) {
  // Request a new frame before any errors
  if (shouldPause)
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
      if (board.spawnTetromino(nextTetromino)) {
        // Random next tetromino if could spawn
        randomNextTetromino();
      } else {
        // Mark for restart if not
        canRestart = true;
      }
    }
  }

  // Clear screen
  render.clearScreen();

  // Draw background
  render.setTranslate(backgroundTranslate);
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

  // Draw game over screen
  if (canRestart) {
    render.setTranslate(gameOverTranslate);
    render.setColor(util.colors.white);
    render.setTexture(gameOverTexture);
    gameOverMesh.render();
  }
}

// Start game loop
resumeGame();
restartGame();
