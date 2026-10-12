// Imports
import { AlertError, worldWidth, worldHeight } from "./util.js";

// WebGL context
const gl = canvas.getContext("webgl2", { antialias: true });
if (gl === null) {
  throw new AlertError("Failed to get WebGL context");
}

// Blending
gl.enable(gl.BLEND);
gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

// Shader compilation
async function loadShader(type, url) {
  const source = await (await fetch(url)).text();
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new AlertError(`Failed to compile shader: ${gl.getShaderInfoLog(shader)}`);
  }
  return shader;
}
const [vertShader, fragShader] = await Promise.all([
  loadShader(gl.VERTEX_SHADER, "assets/vert.glsl"),
  loadShader(gl.FRAGMENT_SHADER, "assets/frag.glsl")
]);

// Shader linking
const program = gl.createProgram();
gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new AlertError(`Failed to link shaders: ${gl.getProgramInfoLog(program)}`);
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
const worldScale = 1.8 / Math.max(worldWidth, worldHeight);
window.addEventListener("resize", (event) => {
  const pixelRatio = event.target.devicePixelRatio;
  canvas.width = pixelRatio * event.target.innerWidth;
  canvas.height = pixelRatio * event.target.innerHeight;
  const minDimension = Math.min(canvas.width, canvas.height);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(
    scaleLocation,
    worldScale * minDimension / canvas.width,
    worldScale * minDimension / canvas.height
  );
});
window.dispatchEvent(new Event("resize"));

// Tile texture
const tileTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tileTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tileImage);
gl.generateMipmap(gl.TEXTURE_2D);

// Next texture
const nextTexture = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, nextTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, nextImage);
gl.generateMipmap(gl.TEXTURE_2D);

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
const nextIndexBuffer = gl.createBuffer();

// Populate buffers
const positions = [];
const uvs = [];

for (let y = -worldHeight / 2; y < worldHeight / 2; y++) {
  for (let x = -worldWidth / 2; x < worldWidth / 2; x++) {
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

const nextIndex = positions.length / 2;
const nextBox = { x: 5, y: 7, w: 6, h: 4 };
positions.push(nextBox.x + nextBox.w, nextBox.y + nextBox.h);
uvs.push(1, 0);
positions.push(nextBox.x + nextBox.w, nextBox.y);
uvs.push(1, 1);
positions.push(nextBox.x, nextBox.y + nextBox.h);
uvs.push(0, 0);
positions.push(nextBox.x, nextBox.y);
uvs.push(0, 1);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nextIndexBuffer);
gl.bufferData(
  gl.ELEMENT_ARRAY_BUFFER,
  new Uint32Array(Array(4).keys().map((i) => i + nextIndex)),
  gl.STATIC_DRAW
);

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

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
      throw new AlertError("Non-integer tile position");
    }
    if (tile.x < 0 || tile.x >= worldWidth || tile.y < 0 || tile.y >= worldHeight) {
      throw new AlertError("Out of bounds tile position");
    }
    const index = 4 * (tile.y * worldWidth + tile.x);
    indices.push(index, index + 1, index + 2);
    indices.push(index + 1, index + 2, index + 3);
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, tileIndexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STREAM_DRAW);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
}

// Draw next UI
function drawNext() {
  gl.bindTexture(gl.TEXTURE_2D, nextTexture);
  gl.uniform3f(colorLocation, 1, 1, 1);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, nextIndexBuffer);
  gl.drawElements(gl.TRIANGLE_STRIP, 4, gl.UNSIGNED_INT, 0);
}

// Exports
export { clearScreen, drawTiles, drawNext };
