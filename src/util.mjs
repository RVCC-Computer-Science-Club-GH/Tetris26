// Error class that also shows an alert
class AlertError extends Error {
  constructor(message) {
    alert(message);
    super(message);
  }
}

// Color class
class Color {
  constructor(colorCode) {
    this.r = (colorCode >> 8 * 2) / 255;
    this.g = (colorCode >> 8 & 0xFF) / 255;
    this.b = (colorCode & 0xFF) / 255;
  }
}

// Colors
const colors = {
  white: new Color(0xFFFFFF),
  black: new Color(0x000000),
  cyan: new Color(0x00FFFF),
  yellow: new Color(0xFFFF00),
  purple: new Color(0xFF00FF),
  green: new Color(0x00FF00),
  red: new Color(0xFF0000),
  blue: new Color(0x0000FF),
  orange: new Color(0xFF8000),
};
const tileColors = new Map([
  ["cyan", cyan],
  ["yellow", yellow],
  ["purple", purple],
  ["green", green],
  ["red", red],
  ["blue", blue],
  ["orange", orange],
]);

// World size
const worldSize = { x: 17, y: 22 };

// Timer class
class Timer {
  // Constructor
  constructor(time, duration, reset) {
    this.time = time + duration;
    this.duration = duration;
    this.reset = reset;
  }

  // Tick
  tick(time) {
    let finished = time > this.time;
    if (finished) {
      if (this.reset) {
        this.time += this.duration;
      } else {
        this.time = Infinity;
      }
    }
    return finished;
  }

  // Reset
  reset(time) {
    this.time = time + this.duration;
  }
}

// Exports
export {
  AlertError,
  colors,
  tileColors,
  worldSize,
  Timer
};
