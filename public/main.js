// Imports
import { worldWidth, worldHeight, drawTiles, clearScreen } from "./render.js";
import { colors } from "./util.js";

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Clear screen
  clearScreen();

  // Alternating color tiles
  const positions = [];
  for (let y = 0; y < worldHeight; y++) {
    for (let x = 0; x < worldWidth; x += 2) {
      positions.push({ x: x, y: y });
    }
  }
  if (time % 3 < 1.5) {
    drawTiles(colors.cyan, positions);
  } else {
    drawTiles(colors.orange, positions);
  }

  // Flashing tiles
  if (time % 6 < 3) {
    const positions = [];
    for (let y = 0; y < worldHeight; y++) {
      for (let x = 1; x < worldWidth; x += 2) {
        positions.push({ x: x, y: y });
      }
    }
    drawTiles(colors.purple, positions);
  }
});
