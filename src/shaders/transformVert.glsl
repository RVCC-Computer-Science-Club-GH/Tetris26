#version 300 es

// Precision
precision highp float;

// Uniforms
uniform vec2 scale;
uniform vec2 translate;

// Inputs
in vec2 posIn;
in vec2 uvIn;

// Outputs
out vec2 uv;

// Main function
void main() {
    // Pass uv
    uv = uvIn;

    // Scale and translate position
    gl_Position = vec4(scale * (posIn + translate), 0, 1);
}
