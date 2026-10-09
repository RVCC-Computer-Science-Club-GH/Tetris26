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

// Resize canvas to fit page
let pixel_ratio;
window.addEventListener("resize", (event) => {
  pixel_ratio = event.target.devicePixelRatio;
  canvas.width = pixel_ratio * event.target.innerWidth;
  canvas.height = pixel_ratio * event.target.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
});
window.dispatchEvent(new Event("resize"));

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

// Vertex array
const vertexArray = gl.createVertexArray();
gl.bindVertexArray(vertexArray);

// Position buffer
const position_index = 0;
const positions = new Float32Array([
  1.0, -1.0,
  -1.0, -1.0,
  0.0, 1.0
]);
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
gl.vertexAttribPointer(position_index, 2, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(position_index);

// Color buffer
const color_index = 1;
const colors = new Float32Array([
  0.0, 1.0, 1.0, 1.0,
  1.0, 0.0, 1.0, 1.0,
  1.0, 1.0, 0.0, 1.0
]);
const colorBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
gl.vertexAttribPointer(color_index, 4, gl.FLOAT, false, 0, 0);
gl.enableVertexAttribArray(color_index);

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Clear screen and draw
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
});
