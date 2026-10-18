// Error class that also shows an alert
export class AlertError extends Error {
  // Constructor
  constructor(message) {
    alert(message);
    super(message);
  }
}

// Color class
export class Color {
  // Fields
  r;
  g;
  b;

  // Constructor from hex color code
  constructor(colorCode) {
    this.r = (colorCode >> 8 * 2) / 255;
    this.g = (colorCode >> 8 & 0xFF) / 255;
    this.b = (colorCode & 0xFF) / 255;
  }
}

// Colors
export const colors = {
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
export const tileColors = new Map([
  ["cyan", colors.cyan],
  ["yellow", colors.yellow],
  ["purple", colors.purple],
  ["green", colors.green],
  ["red", colors.red],
  ["blue", colors.blue],
  ["orange", colors.orange],
]);

// World size
export const worldSize = { x: 17, y: 22 };

// Timer class
export class Timer {
  // Fields
  #time;
  duration;
  resets;

  // Constructor
  constructor(time, duration, resets) {
    this.#time = time + duration;
    this.duration = duration;
    this.resets = resets;
  }

  // Tick
  tick(time) {
    let finished = time > this.#time;
    if (finished) {
      if (this.resets) {
        this.#time += this.duration;
      } else {
        this.#time = Infinity;
      }
    }
    return finished;
  }

  // Reset
  reset(time) {
    this.#time = time + this.duration;
  }
}
