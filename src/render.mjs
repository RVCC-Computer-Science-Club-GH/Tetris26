// Imports
import * as util from "./util.mjs";
import vertSource from "./vert.glsl";
import fragSource from "./frag.glsl";
import tileImage from "./assets/tile.webp";
import uiImage from "./assets/ui.webp";

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
    canvas.width / util.uiWidth,
    canvas.height / util.uiHeight
  );
  gl.uniform2f(
    scaleLocation,
    minDimension / canvas.width,
    minDimension / canvas.height
  );
});
window.dispatchEvent(new Event("resize"));

// Textures
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
const tileTexture = loadTexture(tileImage);
const uiTexture = loadTexture(uiImage);

// Vertex array
const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

// Position buffer
const positionSize = 2;
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.vertexAttribPointer(positionLocation, positionSize, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

// UV buffer
const uvSize = 2;
const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.vertexAttribPointer(uvLocation, uvSize, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(uvLocation);

// Index buffers
const tileIndexBuffer = gl.createBuffer();
const uiIndexBuffer = gl.createBuffer();

// Main tile vertices
let positions = [];
let uvs = [];
for (let y = -util.height / 2; y < util.height / 2; y++) {
  for (let x = -util.width / 2; x < util.width / 2; x++) {
    positions.push(x + 1, y + 1);
    uvs.push(1, 0);
    positions.push(x + 1, y);
    uvs.push(1, 1);
    positions.push(x, y + 1);
    uvs.push(0, 0);
    positions.push(x, y);
    uvs.push(0, 1);
  }
}

// UI vertices
const uiIndex = positions.length / 2;
positions.push(util.uiWidth / 2, util.uiHeight / 2);
uvs.push(1, 0);
positions.push(util.uiWidth / 2, -util.uiHeight / 2);
uvs.push(1, 1);
positions.push(-util.uiWidth / 2, util.uiHeight / 2);
uvs.push(0, 0);
positions.push(-util.uiWidth / 2, -util.uiHeight / 2);
uvs.push(0, 1);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, uiIndexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint32Array(Array(4).keys().map((i) => i + uiIndex)),
  gl.STATIC_DRAW
);

// Buffer vertices
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
positions = null;
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
uvs = null;

// Clear the screen
function clearScreen() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

// Draw multiple tiles of 1 color
function drawTiles(color, tiles) {
  gl.bindTexture(gl.TEXTURE_2D, tileTexture);
  gl.uniform3f(colorLocation, color.r, color.g, color.b);
  const indices = [];
  for (const tile of tiles) {
    if (!Number.isInteger(tile.x) || !Number.isInteger(tile.y)) {
      throw new util.AlertError("Non-integer tile position");
    }
    if (tile.x < 0 || tile.x >= util.width || tile.y < 0 || tile.y >= util.height) {
      throw new util.AlertError("Out of bounds tile position");
    }
    const index = 4 * (tile.y * util.width + tile.x);
    indices.push(index, index + 1, index + 2);
    indices.push(index + 1, index + 2, index + 3);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tileIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STREAM_DRAW);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
}

// Draw UI
function drawUi() {
  gl.bindTexture(gl.TEXTURE_2D, uiTexture);
  gl.uniform3f(colorLocation, 1, 1, 1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, uiIndexBuffer);
  gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_INT, 0);
}

// Exports
export { clearScreen, drawTiles, drawUi };
