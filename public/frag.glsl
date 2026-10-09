#version 300 es

precision highp float;

in vec2 uv;

out vec4 colorOut;

uniform sampler2D tile;
uniform vec3 color;

void main() {
    colorOut = vec4(color, 1) * texture(tile, uv);
}
