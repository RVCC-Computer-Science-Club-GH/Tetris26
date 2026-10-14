// Imports
import * as util from "./util.mjs";
import vertSource from "./vert.glsl";
import fragSource from "./frag.glsl";

// WebGL context
const gl = canvas.getContext("webgl2", { antialias: true });
if (gl === null) {
  throw new util.AlertError("Failed to get WebGL context");
}

// Blending
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Shader compilation
function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new util.AlertError(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}
const vertShader = compileShader(gl.VERTEX_SHADER, vertSource);
const fragShader = compileShader(gl.FRAGMENT_SHADER, fragSource);

// Shader linking
const program = gl.createProgram();
gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new util.AlertError(`Failed to link shaders: ${gl.getProgramInfoLog(program)}`);
}
gl.useProgram(program);
gl.deleteShader(vertShader);
gl.deleteShader(fragShader);
gl.deleteProgram(program);

// Locations
const scaleLocation = gl.getUniformLocation(program, "scale");
const positionLocation = gl.getAttribLocation(program, "positionIn");
const uvLocation = gl.getAttribLocation(program, "uvIn");
const colorLocation = gl.getUniformLocation(program, "color");

// Resize canvas to fit page
window.addEventListener("resize", (event) => {
  const pixelRatio = event.target.devicePixelRatio;
  canvas.width = pixelRatio * event.target.innerWidth;
  canvas.height = pixelRatio * event.target.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
  const minDimension = 2 * Math.min(
    canvas.width / util.worldSize.w,
    canvas.height / util.worldSize.h
  );
  gl.uniform2f(
    scaleLocation,
    minDimension / canvas.width,
    minDimension / canvas.height
  );
});
window.dispatchEvent(new Event("resize"));

// Texture loading
function loadTexture(url) {
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
class Mesh {
  // Constructor
  constructor(vertices, indices) {
    // Vertex array
    this.vertexArray = gl.createVertexArray();
    gl.bindVertexArray(this.vertexArray);

    // Vertex buffer
    const vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);
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

// Sprite class
class Sprite extends Mesh {
  // Constructor
  constructor(pos, size) {
    super(
      [
        pos.x + size.w, pos.y + size.h, 1, 0,
        pos.x + size.w, pos.y, 1, 1,
        pos.x, pos.y + size.h, 0, 0,
        pos.x, pos.y, 0, 1,
      ],
      [0, 1, 2, 1, 2, 3]
    );
  }
}

// Tiles class
class Tiles extends Mesh {
  // Constructor
  constructor(pos, size) {
    // Generate vertices
    const vertices = [];
    for (let y = pos.y; y < pos.y + size.h; y++) {
      for (let x = pos.x; x < pos.x + size.w; x++) {
        vertices.push(x + 1, y + 1, 1, 0);
        vertices.push(x + 1, y, 1, 1);
        vertices.push(x, y + 1, 0, 0);
        vertices.push(x, y, 0, 1);
      }
    }

    // Mesh constructor
    super(vertices, []);
    this.size = size;
  }

  // Render
  render(tiles) {
    // Generate indices
    const indices = [];
    for (const tile of tiles) {
      if (!Number.isInteger(tile.x) || !Number.isInteger(tile.y)) {
        throw new util.AlertError("Non-integer tile position");
      }
      if (tile.x < 0 || tile.x >= this.size.w || tile.y < 0 || tile.y >= this.size.h) {
        throw new util.AlertError("Out of bounds tile position");
      }
      const index = 4 * (tile.y * this.size.w + tile.x);
      indices.push(index, index + 1, index + 2);
      indices.push(index + 1, index + 2, index + 3);
    }
    this.vertexCount = indices.length;

    // Buffer indices and draw
    gl.bindVertexArray(this.vertexArray);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.DYNAMIC_DRAW);
    gl.drawElements(gl.TRIANGLES, this.vertexCount, gl.UNSIGNED_INT, 0);
  }
}

// Clear the screen
function clearScreen() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// Set texture
function setTexture(texture) {
  gl.bindTexture(gl.TEXTURE_2D, texture);
}

// Set color
function setColor(color) {
  gl.uniform3f(colorLocation, color.r, color.g, color.b);
}

// Exports
export {
  loadTexture,
  Sprite,
  Tiles,
  clearScreen,
  setTexture,
  setColor
};
