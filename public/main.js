// Error class that also shows an alert
class AlertError extends Error {
  constructor(message) {
    alert(message);
    super(message);
  }
}

// Colors
const cyan = { r: 0x00 / 255, g: 0xFF / 255, b: 0xFF / 255 };
const yellow = { r: 0xFF / 255, g: 0xFF / 255, b: 0x00 / 255 };
const purple = { r: 0x80 / 255, g: 0x00 / 255, b: 0x80 / 255 };
const green = { r: 0x00 / 255, g: 0xFF / 255, b: 0x00 / 255 };
const red = { r: 0xFF / 255, g: 0x00 / 255, b: 0x00 / 255 };
const blue = { r: 0x00 / 255, g: 0x00 / 255, b: 0xFF / 255 };
const orange = { r: 0xFF / 255, g: 0x7F / 255, b: 0x00 / 255 };

// Dimensions
const worldWidth = 10;
const worldHeight = 20;

// WebGL context
const gl = canvas.getContext("webgl2", { antialias: true });
if (gl === null) {
  throw new AlertError("Failed to get WebGL context");
}

// Background color
gl.clearColor(0.4, 0.3, 0.3, 1.0);

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
const vertShader = await loadShader(gl.VERTEX_SHADER, "vert.glsl");
const fragShader = await loadShader(gl.FRAGMENT_SHADER, "frag.glsl");

// Shader linking
const program = gl.createProgram();
gl.attachShader(program, vertShader);
gl.attachShader(program, fragShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new AlertError(`Failed to link shaders: ${gl.getProgramInfoLog(program)}`);
}
gl.useProgram(program);

// Locations
const scaleLocation = gl.getUniformLocation(program, "scale");
const positionLocation = gl.getAttribLocation(program, "positionIn");
const uvLocation = gl.getAttribLocation(program, "uvIn");
const tileLocation = gl.getUniformLocation(program, "tile");
const colorLocation = gl.getUniformLocation(program, "color");

// Resize canvas to fit page
const worldScale = 2 / Math.max(worldWidth, worldHeight);
window.addEventListener("resize", (event) => {
  const pixelRatio = event.target.devicePixelRatio;
  canvas.width = pixelRatio * event.target.innerWidth;
  canvas.height = pixelRatio * event.target.innerHeight;
  const minDimension = Math.min(canvas.width, canvas.height);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(scaleLocation, worldScale * minDimension / canvas.width, worldScale * minDimension / canvas.height);
});
window.dispatchEvent(new Event("resize"));

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

// Index buffer
const indexBuffer = gl.createBuffer();

// Populate buffers
const positions = [];
const uvs = [];
for (let y = -worldHeight / 2; y < worldHeight / 2; y++) {
  for (let x = -worldWidth / 2; x < worldWidth / 2; x++) {
    // 0
    positions.push(x + 1, y + 1);
    uvs.push(1, 0);
    // 1
    positions.push(x + 1, y);
    uvs.push(1, 1);
    // 2
    positions.push(x, y + 1);
    uvs.push(0, 0);
    // 3
    positions.push(x, y);
    uvs.push(0, 1);
  }
}
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);

// Add the index of a tile at x and y
function addTile(indices, x, y) {
  const index = 4 * (y * worldWidth + x);
  indices.push(index, index + 1, index + 2);
  indices.push(index + 1, index + 2, index + 3);
}

// Tile texture
const tileUnit = 0;
gl.uniform1i(tileLocation, tileUnit);
const tileSampler = gl.createSampler();
gl.bindSampler(tileUnit, tileSampler);
const tileTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + tileUnit);
gl.bindTexture(gl.TEXTURE_2D, tileTexture);
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tileImage);
gl.generateMipmap(gl.TEXTURE_2D);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Clear screen
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Draw call per color
  gl.uniform3f(colorLocation, cyan.r, cyan.g, cyan.b);
  let indices = [];
  for (let y = 0; y < worldHeight; y++) {
    for (let x = y % 2; x < worldWidth; x += 2) {
      addTile(indices, x, y);
    }
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STREAM_DRAW);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);

  gl.uniform3f(colorLocation, purple.r, purple.g, purple.b);
  indices = [];
  for (let y = 0; y < worldHeight; y++) {
    for (let x = (y + 1) % 2; x < worldWidth; x += 2) {
      addTile(indices, x, y);
    }
  }
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STREAM_DRAW);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
});
