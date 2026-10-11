// Error class that also shows an alert
class AlertError extends Error {
  constructor(message) {
    alert(message);
    super(message);
  }
}

// Colors
const colors = {
  cyan: { r: 0x00 / 255, g: 0xFF / 255, b: 0xFF / 255 },
  yellow: { r: 0xFF / 255, g: 0xFF / 255, b: 0x00 / 255 },
  purple: { r: 0xFF / 255, g: 0x00 / 255, b: 0xFF / 255 },
  green: { r: 0x00 / 255, g: 0xFF / 255, b: 0x00 / 255 },
  red: { r: 0xFF / 255, g: 0x00 / 255, b: 0x00 / 255 },
  blue: { r: 0x00 / 255, g: 0x00 / 255, b: 0xFF / 255 },
  orange: { r: 0xFF / 255, g: 0x60 / 255, b: 0x00 / 255 }
};

// Dimensions
const worldWidth = 10;
const worldHeight = 20;

// Exports
export { AlertError, colors, worldWidth, worldHeight };
