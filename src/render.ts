// Imports
import * as util from "./util";
const { vec2 } = util;

// Elements
const canvas = document.getElementById("canvas") as HTMLCanvasElement;

// WebGL context
const gl = canvas.getContext("webgl2", { antialias: true }) as WebGL2RenderingContext;
if (gl == null)
  throw new util.AlertError("Failed to get WebGL 2 context");

// Blending
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Shader compilation
function compileShader(type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
    throw new util.AlertError(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
  return shader;
}
import vertSource from "./shaders/transformVert.glsl";
const vertShader = compileShader(gl.VERTEX_SHADER, vertSource);
import fragSource from "./shaders/pixelArtFrag.glsl";
const fragShader = compileShader(gl.FRAGMENT_SHADER, fragSource);

// Shader linking
const program = gl.createProgram();
gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS))
  throw new util.AlertError(`Failed to link shaders: ${gl.getProgramInfoLog(program)}`);
gl.useProgram(program);
gl.deleteShader(vertShader);
gl.deleteShader(fragShader);
gl.deleteProgram(program);

// Locations
const scaleLocation = gl.getUniformLocation(program, "scale");
const translateLocation = gl.getUniformLocation(program, "translate");
const posLocation = gl.getAttribLocation(program, "posIn");
const uvLocation = gl.getAttribLocation(program, "uvIn");
const colorLocation = gl.getUniformLocation(program, "color");

// Resize canvas to fit page
window.addEventListener("resize", () => {
  canvas.width = window.devicePixelRatio * window.innerWidth;
  canvas.height = window.devicePixelRatio * window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  const minDimension = 2 * Math.min(
    canvas.width / util.worldSize.x,
    canvas.height / util.worldSize.y
  );
  gl.uniform2f(
    scaleLocation,
    minDimension / canvas.width,
    minDimension / canvas.height
  );
});
window.dispatchEvent(new Event("resize"));

// Texture loading
export function loadTexture(url: string): WebGLTexture {
  const image = new Image;
  const texture = gl.createTexture();
  image.addEventListener("load", () => {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
  }, { once: true });
  image.src = url;
  return texture;
}

// Mesh class
export class Mesh {
  // Fields
  protected vertexArray: WebGLVertexArrayObject;
  protected vertexCount: number;

  // Constructor
  constructor(vertices: number[], indices: number[]) {
    // Vertex array
    this.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(this.vertexArray);

    // Vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 4 * 4, 4 * 0);
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 4 * 4, 4 * 2);
    gl.enableVertexAttribArray(uvLocation);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    // Index Buffer
    this.vertexCount = indices.length;
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
  }

  // Render
  render() {
    gl.bindVertexArray(this.vertexArray);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_INT, 0);
  }
}

// Sprite mesh class
export class SpriteMesh extends Mesh {
  // Constructor
  constructor(size: util.Vec2) {
    super(
      [
        size.x / 2, size.y / 2, 1, 0,
        size.x / 2, -size.y / 2, 1, 1,
        -size.x / 2, size.y / 2, 0, 0,
        -size.x / 2, -size.y / 2, 0, 1,
      ],
      [0, 1, 2, 1, 2, 3]
    );
  }
}

// Tiles mesh class
export class TilesMesh extends Mesh {
  // Fields
  readonly size: util.Vec2;

  // Constructor
  constructor(size: util.Vec2, scale?: util.Vec2) {
    // Default scale
    scale = scale == null ? vec2(1, 1) : scale;

    // Generate vertices
    const vertices = [];
    for (let y = -size.y / 2; y < size.y / 2; y += scale.y) {
      for (let x = -size.x / 2; x < size.x / 2; x += scale.x) {
        vertices.push(x + scale.x, y + scale.y, 1, 0);
        vertices.push(x + scale.x, y, 1, 1);
        vertices.push(x, y + scale.y, 0, 0);
        vertices.push(x, y, 0, 1);
      }
    }

    // Mesh constructor
    super(vertices, []);
    this.size = size;
  }

  // Set tiles to render
  set tiles(tiles: Set<util.Vec2>) {
    // Generate indices
    const indices = [];
    for (const tile of tiles.values()) {
      const index = 4 * (tile.y * this.size.x + tile.x);
      indices.push(index, index + 1, index + 2);
      indices.push(index + 1, index + 2, index + 3);
    }
    this.vertexCount = indices.length;

    // Buffer indices
    gl.bindVertexArray(this.vertexArray);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.DYNAMIC_DRAW);
  }
}

// Number textures
import numImage0 from "./assets/0.webp";
import numImage1 from "./assets/1.webp";
import numImage2 from "./assets/2.webp";
import numImage3 from "./assets/3.webp";
import numImage4 from "./assets/4.webp";
import numImage5 from "./assets/5.webp";
import numImage6 from "./assets/6.webp";
import numImage7 from "./assets/7.webp";
import numImage8 from "./assets/8.webp";
import numImage9 from "./assets/9.webp";
const numTextures = [
  loadTexture(numImage0),
  loadTexture(numImage1),
  loadTexture(numImage2),
  loadTexture(numImage3),
  loadTexture(numImage4),
  loadTexture(numImage5),
  loadTexture(numImage6),
  loadTexture(numImage7),
  loadTexture(numImage8),
  loadTexture(numImage9)
];

// Numbers mesh class
export class NumbersMesh extends TilesMesh {
  // Fields
  private digitCount: number;

  // Constructor
  constructor(digitCount: number) {
    super(vec2(digitCount / 2, 1), vec2(0.5, 1));
    this.digitCount = digitCount;
  }

  // Render a number
  renderNumber(number: number) {
    const digits = Array(this.digitCount);
    for (let i = 0; i < this.digitCount; i++)
      digits[i] = Math.trunc(number / 10 ** (this.digitCount - i - 1)) % 10;
    for (let n = 0; n < 10; n++) {
      const tiles: Set<util.Vec2> = new Set;
      for (let i = 0; i < this.digitCount; i++) {
        if (digits[i] == n)
          tiles.add(vec2(i, 0));
      }
      if (tiles.size != 0) {
        setTexture(numTextures[n]);
        this.tiles = tiles;
        this.render();
      }
    }
  }
}

// Clear the screen
export function clearScreen() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// Set texture
export function setTexture(texture: WebGLTexture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

// Set color
export function setColor(color: util.Color) {
  gl.uniform3f(colorLocation, color.r, color.g, color.b);
}

// Set translate
export function setTranslate(translate: util.Vec2) {
  gl.uniform2f(translateLocation, translate.x, translate.y);
}
