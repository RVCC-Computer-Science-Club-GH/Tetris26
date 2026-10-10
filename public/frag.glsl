#version 300 es

precision highp float;

in vec2 uv;

out vec4 colorOut;

uniform sampler2D tile;
uniform vec3 color;

void main() {
    vec2 textureDims = vec2(textureSize(tile, 0));
    vec2 boxSize = clamp(fwidth(uv) * textureDims, vec2(1e-5), vec2(1));
    vec2 tx = uv * textureDims - 0.5 * boxSize;
    vec2 txOffset = smoothstep(1.0 - boxSize, vec2(1), fract(tx));
    vec2 newUv = (floor(tx) + 0.5 + txOffset) / textureDims;
    colorOut = min(vec4(color, 1), textureGrad(tile, newUv, dFdx(uv), dFdy(uv)));
}
