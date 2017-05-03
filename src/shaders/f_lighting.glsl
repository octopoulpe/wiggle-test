#version 300 es

precision mediump float;

in vec3 vColor;
in float vIntensity;
in vec2 vTextureCoord;

out vec4 outputColor;

uniform sampler2D uSampler;

void main(void) {
    vec4 fragColor = texture(uSampler, vTextureCoord);
    outputColor = fragColor * vec4(vColor * vIntensity, 1.0);
}
