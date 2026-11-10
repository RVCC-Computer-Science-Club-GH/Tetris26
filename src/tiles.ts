// Imports
import * as util from "./util";
const vec2 = util.vec2;

// Tetromino class
export class Tetromino {
  // Fields
  color: util.Color;
  tiles: util.Vec2[];
  offset: util.Vec2;

  // Constructor
  constructor(color: util.Color, tiles: util.Vec2[], offset: util.Vec2) {
    this.color = color;
    this.tiles = tiles;
    this.offset = offset;
  }
}

// Tetrominos
export const tetrominos = new Map([
  ["i", new Tetromino(
    util.colors.cyan,
    [
      vec2(0, 1),
      vec2(1, 1),
      vec2(2, 1),
      vec2(3, 1)
    ],
    vec2(0, -0.5)
  )],
  ["j", new Tetromino(
    util.colors.blue,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(3, 0),
      vec2(1, 1)
    ],
    vec2(-0.5, 0)
  )],
  ["l", new Tetromino(
    util.colors.orange,
    [
      vec2(0, 0),
      vec2(1, 0),
      vec2(2, 0),
      vec2(2, 1)
    ],
    vec2(0.5, 0)
  )],
  ["o", new Tetromino(
    util.colors.yellow,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(1, 1),
      vec2(2, 1)
    ],
    vec2(0, 0)
  )],
  ["s", new Tetromino(
    util.colors.green,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(2, 1),
      vec2(3, 1)
    ],
    vec2(-0.5, 0)
  )],
  ["z", new Tetromino(
    util.colors.red,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(0, 1),
      vec2(1, 1)
    ],
    vec2(0.5, 0)
  )],
  ["t", new Tetromino(
    util.colors.purple,
    [
      vec2(0, 0),
      vec2(1, 0),
      vec2(2, 0),
      vec2(1, 1)
    ],
    vec2(0.5, 0)
  )]
]);

// Tile class
export class Tile {
  // Fields
  color: util.Color;
  pos: util.Vec2;

  // Constructor
  constructor(color: util.Color, pos: util.Vec2) {
    this.color = color;
    this.pos = pos;
  }
}

// Tiles class
export class Tiles {
  // Fields
  readonly size: util.Vec2;
  private tiles: Array<Tile | null>;
  private active: Set<Tile>;
  private origin: util.Vec2 | undefined;

  // Constructor
  constructor(size: util.Vec2) {
    this.size = size;
    this.tiles = Array(size.x * size.y);
    this.active = new Set;
  }

  // Get index at position
  private unsafeIndex(pos: util.Vec2): number {
    return pos.y + this.size.y * pos.x;
  }
  private index(pos: util.Vec2): number {
    if (pos.x < 0 || pos.x >= this.size.x || pos.y < 0 || pos.y >= this.size.y)
      throw new Error("Out of bounds tile position");
    else
      return this.unsafeIndex(pos);
  }

  // Yield every color and a set of positions for each tile of that color
  *render(): Generator<{ color: util.Color, tiles: Set<util.Vec2> }> {
    for (const color of util.tileColors.values()) {
      const tiles = new Set<util.Vec2>;
      for (let x = 0; x < this.size.x; x++) {
        for (let y = 0; y < this.size.y; y++) {
          const current = this.unsafeIndex(vec2(x, y));
          if (this.tiles[current] != null && this.tiles[current].color == color)
            tiles.add(this.tiles[current].pos);
        }
      }
      yield { color: color, tiles: tiles };
    }
  }

  // Spawn a tetromino
  spawnTetromino(tetromino: Tetromino): boolean {
    const x = Math.round(this.size.x * Math.random() - this.size.x / 2);
    const transform = (pos: util.Vec2) => vec2(
      this.size.x / 2 + pos.x + x - 2,
      this.size.y + pos.y - 2
    );
    const positions = tetromino.tiles.map(transform);

    for (const pos of positions) {
      try {
        if (this.tiles[this.index(pos)] != null)
          return false;
      } catch {
        return false;
      }
    }

    for (const pos of positions) {
      const tile = new Tile(tetromino.color, pos);
      this.tiles[this.unsafeIndex(pos)] = tile;
      this.active.add(tile);
    }
    this.origin = transform(vec2(2, 1));
    return true;
  }

  // Move active tiles
  moveActive(offset: util.Vec2, rotation: util.Vec2): boolean {
    if (this.shouldSpawn())
      return false;

    const transform = (pos: util.Vec2) => {
      const centered = vec2(pos.x - this.origin!.x, pos.y - this.origin!.y);
      return vec2(
        centered.x * rotation.x - centered.y * rotation.y + offset.x + this.origin!.x,
        centered.x * rotation.y + centered.y * rotation.x + offset.y + this.origin!.y
      );
    };

    for (const tile of this.active) {
      try {
        const newPos = transform(tile.pos);
        const newTile = this.tiles[this.index(newPos)];
        if (!(newTile == null || this.active.has(newTile)))
          return false;
      } catch {
        return false;
      }
    }

    for (const tile of this.active) {
      const index = this.unsafeIndex(tile.pos);
      tile.pos = transform(tile.pos);
      const newIndex = this.unsafeIndex(tile.pos);
      const temp = this.tiles[index];
      this.tiles[index] = this.tiles[newIndex];
      this.tiles[newIndex] = temp;
    }
    this.origin = transform(this.origin!);
    return true;
  }

  // Check if a tetromino should spawn
  shouldSpawn(): boolean {
    return this.origin == null;
  }

  // Clear tiles
  clear() {
    for (const i in this.tiles)
      this.tiles[i] = null;
  }

  // Clear active tiles
  clearActive() {
    this.active.clear();
    this.origin = undefined;
  }
}
