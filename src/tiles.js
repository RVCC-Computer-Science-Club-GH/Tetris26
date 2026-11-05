// Imports
import * as util from "./util";
const vec2 = util.vec2;

// Tetrominos
export const tetrominos = new Map([
  ["i", {
    color: util.colors.cyan,
    tiles: [
      vec2(-1, 0),
      vec2(0, 0),
      vec2(1, 0),
      vec2(2, 0),
    ]
  }],
  ["j", {
    color: util.colors.blue,
    tiles: [
      vec2(0, 1),
      vec2(1, 1),
      vec2(2, 1),
      vec2(0, 0),
    ]
  }],
  ["l", {
    color: util.colors.orange,
    tiles: [
      vec2(-1, 1),
      vec2(0, 1),
      vec2(1, 1),
      vec2(1, 0),
    ]
  }],
  ["o", {
    color: util.colors.yellow,
    tiles: [
      vec2(0, 1),
      vec2(1, 1),
      vec2(0, 0),
      vec2(1, 0),
    ]
  }],
  ["s", {
    color: util.colors.green,
    tiles: [
      vec2(0, 1),
      vec2(1, 1),
      vec2(1, 0),
      vec2(2, 0),
    ]
  }],
  ["z", {
    color: util.colors.red,
    tiles: [
      vec2(0, 1),
      vec2(1, 1),
      vec2(-1, 0),
      vec2(0, 0),
    ]
  }],
  ["t", {
    color: util.colors.purple,
    tiles: [
      vec2(1, 1),
      vec2(0, 0),
      vec2(1, 0),
      vec2(2, 0),
    ]
  }],
]);

// Tile class
export class Tile {
  // Fields
  color;
  pos;

  // Constructor
  constructor(color, pos) {
    this.color = color;
    this.pos = pos;
  }
}

// Tiles class
export class Tiles {
  // Fields
  #size;
  tiles;
  active;

  // Constructor
  constructor(size) {
    this.#size = size;
    this.tiles = Array(size.x * size.y);
    this.active = [];
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
          const current = this.#index(vec2(x, y));
          if (this.tiles[current] && this.tiles[current].color == color) {
            tiles.add(this.tiles[current].pos);
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
    const positions = tetromino.tiles.map((pos) => vec2(
      this.#size.x / 2 - 1 + pos.x + x,
      this.#size.y - 1 - pos.y
    ));

    let canSpawn = true;
    for (const pos of positions) {
      if (this.tiles[this.#index(pos)] != null) {
        canSpawn = false;
      }
    }

    if (canSpawn) {
      for (const pos of positions) {
        const tile = new Tile(tetromino.color, pos);
        this.tiles[this.#index(pos)] = tile;
        this.active.push(tile);
      }
    }
  }

  // Apply gravity to active tiles
  gravity() {
    let canFall = true;
    for (const tile of this.active) {
      try {
        const below = this.tiles[this.index(vec2(tile.pos.x, tile.pos.y - 1))]
        if (below != null && !this.active.find((otherTile) => below === otherTile)) {
          canFall = false;
        }
      } catch {
        canFall = false;
      }
    }

    if (canFall) {
      for (const tile of this.active) {
        const current = this.#index(tile.pos);
        const belowPos = vec2(tile.pos.x, tile.pos.y - 1);
        const below = this.#index(belowPos);
        this.tiles[below] = this.tiles[current];
        this.tiles[current] = null;
        this.tiles[below].pos = belowPos;
      }
    } else {
      this.active = [];
    }
  }
}
