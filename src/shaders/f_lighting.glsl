precision mediump float;

varying vec2 vTextureCoord;

uniform sampler2D uSampler;

void main(void) {
    vec4 fragColor = texture2D(uSampler, vTextureCoord);

    gl_FragColor =  vec4(0.2, 0.2, 0.2, 0.2) + fragColor;
}
