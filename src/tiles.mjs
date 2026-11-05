// Imports
import * as util from "./util.mjs";

// Tetrominos
export const tetrominos = new Map([
  ["i", {
    color: util.colors.cyan,
    tiles: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]
  }],
  ["j", {
    color: util.colors.blue,
    tiles: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
    ]
  }],
  ["l", {
    color: util.colors.orange,
    tiles: [
      { x: -1, y: 1 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
    ]
  }],
  ["o", {
    color: util.colors.yellow,
    tiles: [
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
    ]
  }],
  ["s", {
    color: util.colors.green,
    tiles: [
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
    ]
  }],
  ["z", {
    color: util.colors.red,
    tiles: [
      { x: -1, y: 0 },
      { x: 0, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
    ]
  }],
  ["t", {
    color: util.colors.purple,
    tiles: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 2, y: 0 },
    ]
  }],
]);

// Tile class
export class Tile {
  // Fields
  color;
  _pos;

  // Constructor
  constructor(color, pos) {
    this.color = color;
    this._pos = pos;
  }
}

// Tiles class
export class Tiles {
  // Fields
  #size;
  tiles;

  // Constructor
  constructor(size) {
    this.#size = size;
    this.tiles = Array(size.x * size.y);
  }

  // Get size
  get size() {
    return this.#size;
  }

  // Get index at position
  #index(pos) {
    return pos.y + this.#size.y * pos.x;
  }
  index(pos) {
    if (pos.x < 0 || pos.x >= this.#size.x || pos.y < 0 || pos.y >= this.#size.y) {
      throw new Error("Out of bounds tile position");
    } else {
      return this.#index(pos);
    }
  }

  // Yield every color and a set of positions for each tile of that color
  *render() {
    for (const color of util.tileColors.values()) {
      const tiles = new Set;
      for (let x = 0; x < this.#size.x; x++) {
        for (let y = 0; y < this.#size.y; y++) {
          const current = this.#index({ x, y });
          if (this.tiles[current] && this.tiles[current].color == color) {
            tiles.add(this.tiles[current]._pos);
          }
        }
      }
      yield { color: color, tiles: tiles };
    }
  }

  // Spawn a tetromino
  spawnTetromino(key) {
    const tetromino = tetrominos.get(key);
    const x = Math.round(6 * Math.random() - 3);
    for (const relPos of tetromino.tiles) {
      const pos = {
        x: this.#size.x / 2 - 1 + relPos.x + x,
        y: this.#size.y - 1 - relPos.y
      };
      const current = this.#index(pos);
      this.tiles[current] = new Tile(tetromino.color, pos);
    }
  }

  gravity() {
    for (let x = 0; x < this.#size.x; x++) {
      for (let y = 1; y < this.#size.y; y++) {
        const current = this.#index({ x, y });
        const below = this.#index({ x, y: y - 1 });
        if (this.tiles[current] != null && this.tiles[below] == null) {
          this.tiles[below] = this.tiles[current];
          this.tiles[current] = null;
          this.tiles[below]._pos.y -= 1;
        }
      }
    }
  }
}
