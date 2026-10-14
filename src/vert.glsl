#version 300 es

precision highp float;

uniform vec2 scale;
uniform vec2 translate;

in vec2 positionIn;
in vec2 uvIn;

out vec2 uv;

void main() {
    uv = uvIn;
    gl_Position = vec4(scale * (positionIn + translate), 0, 1);
}
