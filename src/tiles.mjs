// Imports
import * as util from "./util.mjs";

// Tile class
export class Tile {
  // Fields
  color;

  // Constructor
  constructor(color) {
    this.color = color;
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
            tiles.add({ x, y });
          }
        }
      }
      yield { color: color, tiles: tiles };
    }
  }
}
