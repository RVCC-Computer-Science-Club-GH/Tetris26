#version 300 es

// Precision
precision highp float;

// Uniforms
uniform sampler2D tile;
uniform vec3 color;

// Inputs
in vec2 uv;

// Outputs
out vec4 colorOut;

// Main function
void main() {
    // Sample texture using pixel art anti-aliasing
    vec2 textureDims = vec2(textureSize(tile, 0));
    vec2 boxSize = clamp(fwidth(uv) * textureDims, vec2(1e-5), vec2(1));
    vec2 tx = uv * textureDims - 0.5 * boxSize;
    vec2 txOffset = smoothstep(1.0 - boxSize, vec2(1), fract(tx));
    vec2 newUv = (floor(tx) + 0.5 + txOffset) / textureDims;
    vec4 txColor = textureGrad(tile, newUv, dFdx(uv), dFdy(uv));

    // Multiply texture sample by color
    colorOut = vec4(color * txColor.rgb, txColor.a);
}
