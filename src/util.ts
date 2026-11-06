// Error class that also shows an alert
export class AlertError extends Error {
  // Constructor
  constructor(message: string) {
    alert(message);
    super(message);
  }
}

// Color class
export class Color {
  // Fields
  r: number;
  g: number;
  b: number;

  // Constructor from hex color code
  constructor(colorCode: number) {
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

// 2D vector class
export class Vec2 {
  // Fields
  x: number;
  y: number;

  // Constructor
  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

// 2D vector helper
export function vec2(x: number, y: number) {
  return new Vec2(x, y);
}

// World size
export const worldSize = vec2(17, 22);

// Timer class
export class Timer {
  // Fields
  private time: number;
  public duration: number;
  public resets: boolean;

  // Constructor
  constructor(time: number, duration: number, resets: boolean) {
    this.time = time + duration;
    this.duration = duration;
    this.resets = resets;
  }

  // Tick
  tick(time: number) {
    const finished = time > this.time;
    if (finished) {
      if (this.resets) {
        this.time += this.duration;
      } else {
        this.time = Infinity;
      }
    }
    return finished;
  }

  // Reset
  reset(time: number) {
    this.time = time + this.duration;
  }
}
