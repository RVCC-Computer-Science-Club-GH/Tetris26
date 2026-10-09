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
let pixelRatio;
const worldScale = 20;
window.addEventListener("resize", (event) => {
  pixelRatio = event.target.devicePixelRatio;
  canvas.width = pixelRatio * event.target.innerWidth;
  canvas.height = pixelRatio * event.target.innerHeight;
  const minDimension = Math.min(canvas.width, canvas.height);
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.uniform2f(scaleLocation, minDimension / (worldScale * canvas.width), minDimension / (worldScale * canvas.height));
});
window.dispatchEvent(new Event("resize"));

// Vertex array
const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

// Position buffer
const positionSize = 2;
const positions = new Float32Array([
  1, 1,
  1, -1,
  -1, 1,
  -1, -1,
]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(positionLocation, positionSize, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(positionLocation);

// UV buffer
const uvSize = 2;
const uvs = new Float32Array([
  1, 1,
  1, 0,
  0, 1,
  0, 0,
]);
const uvBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW);
gl.vertexAttribPointer(uvLocation, uvSize, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(uvLocation);

// Index buffer
const indices = new Uint32Array([0, 1, 2, 1, 2, 3]);
const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

// Create tile texture sampler
const tileUnit = 0;
gl.uniform1i(tileLocation, tileUnit);
const tileSampler = gl.createSampler();
gl.samplerParameteri(tileSampler, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
gl.bindSampler(tileUnit, tileSampler);
const tileTexture = gl.createTexture();
gl.activeTexture(gl.TEXTURE0 + tileUnit);
gl.bindTexture(gl.TEXTURE_2D, tileTexture);

// Load tile texture
const tileImage = new Image();
tileImage.src = "tile.png";
tileImage.addEventListener("load", () => {
  gl.bindTexture(gl.TEXTURE_2D, tileTexture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tileImage);
  gl.generateMipmap(gl.TEXTURE_2D);
});

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Clear screen and draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.uniform3f(colorLocation, 1, 0, 0.8);
  gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
});
