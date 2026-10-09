#version 300 es

precision highp float;

in vec3 color;
in vec2 uv;

out vec4 outColor;

uniform sampler2D tile;

void main() {
    outColor = vec4(color, 1.0) * texture(tile, uv);
}
