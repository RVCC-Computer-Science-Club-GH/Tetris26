// Resize canvas to size of page
let pixel_ratio;
window.addEventListener("resize", function(event) {
  pixel_ratio = event.target.devicePixelRatio;
  const res = {
    x: pixel_ratio * event.target.innerWidth,
    y: pixel_ratio * event.target.innerHeight,
  };
  canvas.width = res.x;
  canvas.height = res.y;
});
window.dispatchEvent(new Event("resize"));

// WebGL context
const gl = canvas.getContext("webgl");

// Clear screen
gl.clearColor(1.0, 0.0, 0.0, 1.0);
gl.clear(gl.COLOR_BUFFER_BIT);
