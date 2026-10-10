// Error class that also shows an alert
class AlertError extends Error {
  constructor(message) {
    alert(message);
    super(message);
  }
}

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
const worldScale = 0.1;
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
const indices = [];
let vertexCount = 0;

for (let x = -5; x < 5; x++) {
  for (let y = -10; y < 10; y++) {
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

    indices.push(vertexCount, vertexCount + 1, vertexCount + 2);
    indices.push(vertexCount + 1, vertexCount + 2, vertexCount + 3);
    vertexCount += 4;
  }
}

gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.STATIC_DRAW);
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.DYNAMIC_DRAW);

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

  // Clear screen and draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3f(colorLocation, 1, 0, 0.8);
  gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_INT, 0);
});
