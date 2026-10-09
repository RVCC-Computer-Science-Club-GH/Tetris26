#version 300 es

precision highp float;

layout(location = 0) in vec2 inPosition;
layout(location = 1) in vec3 inColor;
layout(location = 2) in vec2 inUv;

out vec3 color;
out vec2 uv;

void main() {
    color = inColor;
    uv = inUv;
    gl_Position = vec4(inPosition, 0.0, 1.0);
}
