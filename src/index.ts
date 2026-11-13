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
import numImage0 from "./assets/0.webp";
import numImage1 from "./assets/1.webp";
import numImage2 from "./assets/2.webp";
import numImage3 from "./assets/3.webp";
import numImage4 from "./assets/4.webp";
import numImage5 from "./assets/5.webp";
import numImage6 from "./assets/6.webp";
import numImage7 from "./assets/7.webp";
import numImage8 from "./assets/8.webp";
import numImage9 from "./assets/9.webp";
const numTextures = [
  render.loadTexture(numImage0),
  render.loadTexture(numImage1),
  render.loadTexture(numImage2),
  render.loadTexture(numImage3),
  render.loadTexture(numImage4),
  render.loadTexture(numImage5),
  render.loadTexture(numImage6),
  render.loadTexture(numImage7),
  render.loadTexture(numImage8),
  render.loadTexture(numImage9)
];

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
const scoreMesh = new render.TilesMesh(vec2(3, 1), vec2(0.5, 1));
const scoreTranslate = vec2(
  util.worldSize.x / 2 - 3,
  util.worldSize.y / 2 - 4.5,
);
const levelMesh = new render.TilesMesh(vec2(1, 1), vec2(0.5, 1));
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

  // Draw score
  render.setTranslate(scoreTranslate);
  const scoreDigits = [];
  for (let i = 6; i > 0; i--)
    scoreDigits.push(Math.trunc(score / 10 ** (i - 1)) % 10);
  for (let n = 0; n < 10; n++) {
    const scoreTiles: Set<util.Vec2> = new Set;
    for (let i = 0; i < 6; i++) {
      if (scoreDigits[i] == n)
        scoreTiles.add(vec2(i, 0));
    }
    if (scoreTiles.size != 0) {
      render.setTexture(numTextures[n]);
      scoreMesh.tiles = scoreTiles;
      scoreMesh.render();
    }
  }

  // Draw level
  render.setTranslate(levelTranslate);
  const levelDigits = [];
  for (let i = 2; i > 0; i--)
    levelDigits.push(Math.trunc(level / 10 ** (i - 1)) % 10);
  for (let n = 0; n < 10; n++) {
    const levelTiles: Set<util.Vec2> = new Set;
    for (let i = 0; i < 2; i++) {
      if (levelDigits[i] == n)
        levelTiles.add(vec2(i, 0));
    }
    if (levelTiles.size != 0) {
      render.setTexture(numTextures[n]);
      levelMesh.tiles = levelTiles;
      levelMesh.render();
    }
  }

  // Draw tiles
  render.setTranslate(tilesTranslate);
  render.setTexture(tileTexture);
  for (const { color, tiles: colorTiles } of board.render()) {
    if (colorTiles.size != 0) {
      render.setColor(color);
      tilesMesh.tiles = colorTiles;
      tilesMesh.render();
    }
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
