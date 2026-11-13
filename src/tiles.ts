// Imports
import * as util from "./util";
const { vec2 } = util;

// Tetromino class
export class Tetromino {
  // Fields
  color: util.Color;
  tiles: util.Vec2[];
  offset: util.Vec2;
  origin: util.Vec2;

  // Constructor
  constructor(
    color: util.Color,
    tiles: util.Vec2[],
    offset: util.Vec2,
    origin: util.Vec2
  ) {
    this.color = color;
    this.tiles = tiles;
    this.offset = offset;
    this.origin = origin;
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
    vec2(0, -0.5),
    vec2(1, 1)
  )],
  ["j", new Tetromino(
    util.colors.blue,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(3, 0),
      vec2(1, 1)
    ],
    vec2(-0.5, 0),
    vec2(2, 0)
  )],
  ["l", new Tetromino(
    util.colors.orange,
    [
      vec2(0, 0),
      vec2(1, 0),
      vec2(2, 0),
      vec2(2, 1)
    ],
    vec2(0.5, 0),
    vec2(1, 0)
  )],
  ["o", new Tetromino(
    util.colors.yellow,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(1, 1),
      vec2(2, 1)
    ],
    vec2(0, 0),
    vec2(1, 0)
  )],
  ["s", new Tetromino(
    util.colors.green,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(2, 1),
      vec2(3, 1)
    ],
    vec2(-0.5, 0),
    vec2(2, 0)
  )],
  ["z", new Tetromino(
    util.colors.red,
    [
      vec2(1, 0),
      vec2(2, 0),
      vec2(0, 1),
      vec2(1, 1)
    ],
    vec2(0.5, 0),
    vec2(1, 0)
  )],
  ["t", new Tetromino(
    util.colors.purple,
    [
      vec2(0, 0),
      vec2(1, 0),
      vec2(2, 0),
      vec2(1, 1)
    ],
    vec2(0.5, 0),
    vec2(1, 0)
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
  private origin?: util.Vec2;
  private changedLines: Set<number>;

  // Constructor
  constructor(size: util.Vec2) {
    this.size = size;
    this.tiles = Array(size.x * size.y);
    this.active = new Set;
    this.changedLines = new Set;
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
          const pos = vec2(x, y);
          const current = this.unsafeIndex(pos);
          if (this.tiles[current] != null && this.tiles[current].color == color)
            tiles.add(pos);
        }
      }
      yield { color: color, tiles: tiles };
    }
  }

  // Spawn a tetromino
  spawnTetromino(tetromino: Tetromino): boolean {
    // Transform
    const transform = (pos: util.Vec2) => vec2(
      this.size.x / 2 + pos.x - 2,
      this.size.y + pos.y - 2
    );

    // Check if can spawn
    const positions = tetromino.tiles.map(transform);
    for (const pos of positions) {
      try {
        if (this.tiles[this.index(pos)] != null)
          return false;
      } catch {
        return false;
      }
    }

    // Spawn
    for (const pos of positions) {
      const tile = new Tile(tetromino.color, pos);
      this.tiles[this.unsafeIndex(pos)] = tile;
      this.active.add(tile);
    }

    // Update origin
    this.origin = transform(tetromino.origin);
    return true;
  }

  // Move active tiles
  moveActive(offset: util.Vec2, rotation?: util.Vec2): boolean {
    // Check if should spawn and default rotation
    if (this.shouldSpawn())
      return false;
    rotation = rotation == null ? vec2(1, 0) : rotation;

    // Transform
    const transform = (pos: util.Vec2) => {
      const centered = vec2(pos.x - this.origin!.x, pos.y - this.origin!.y);
      return vec2(
        centered.x * rotation.x - centered.y * rotation.y + offset.x + this.origin!.x,
        centered.x * rotation.y + centered.y * rotation.x + offset.y + this.origin!.y
      );
    };

    // Check if can move
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

    // Move tile references in array and update positions
    for (const tile of this.active) {
      this.tiles[this.unsafeIndex(tile.pos)] = null;
      tile.pos = transform(tile.pos);
    }
    for (const tile of this.active)
      this.tiles[this.unsafeIndex(tile.pos)] = tile;

    // Transform origin
    this.origin = transform(this.origin!);
    return true;
  }

  // Check if a tetromino should spawn
  shouldSpawn(): boolean {
    return this.origin == null;
  }

  // Clear tiles
  clearTiles() {
    for (const i in this.tiles)
      this.tiles[i] = null;
  }

  // Lock the active tiles in place and mark changed lines
  lockActive() {
    if (this.origin != null) {
      for (const tile of this.active)
        this.changedLines.add(tile.pos.y);
      this.active.clear();
      this.origin = undefined;
    }
  }

  // Clear any completed lines that have been added to the changed lines set
  clearComplete() {
    if (this.changedLines.size != 0) {
      const lines = [...this.changedLines].sort();
      for (let i = 0; i < lines.length; i++) {
        let complete = true;
        for (let x = 0; complete && x < this.size.x; x++) {
          if (this.tiles[this.unsafeIndex(vec2(x, lines[i]))] == null)
            complete = false;
        }
        if (complete) {
          for (let x = 0; x < this.size.x; x++) {
            for (let y = lines[i] + 1; y < this.size.y; y++) {
              const current = this.unsafeIndex(vec2(x, y));
              const below = this.unsafeIndex(vec2(x, y - 1));
              this.tiles[below] = this.tiles[current];
              this.tiles[current] = null;
            }
          }
          for (let j = i + 1; j < lines.length; j++) {
            lines[j]--;
          }
        }
      }
      this.changedLines.clear();
    }
  }
}
