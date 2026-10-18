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
  index(pos) {
    if (pos.x < 0 || pos.x >= this.#size.x || pos.y < 0 || pos.y >= this.#size.y) {
      throw new Error("Out of bounds tile position");
    } else {
      return pos.y + this.#size.y * pos.x;
    }
  }
}
