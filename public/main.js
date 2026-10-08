// Error class that also shows an alert
class AlertError extends Error {
  constructor(message) {
    alert(message);
    super(message);
  }
}

// Resize canvas to fit page
let pixel_ratio;
window.addEventListener("resize", (event) => {
  pixel_ratio = event.target.devicePixelRatio;
  canvas.width = pixel_ratio * event.target.innerWidth;
  canvas.height = pixel_ratio * event.target.innerHeight;
});
window.dispatchEvent(new Event("resize"));

// WebGL context
const gl = canvas.getContext("webgl2");
if (gl === null) {
  throw new AlertError("Failed to get WebGL context");
}

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

// Game loop
window.requestAnimationFrame(function loop(time) {
  // Request a new frame before any errors
  window.requestAnimationFrame(loop);

  // Time in seconds
  time *= 0.001;

  // Clear screen
  gl.clearColor(1.0, 0.0, 0.0, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT);
});
