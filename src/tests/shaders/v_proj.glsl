#version 300 es

in vec2 aVertexPosition;

uniform mat4 uProjMat;

void main(void) {
    gl_Position = uProjMat * vec4(aVertexPosition, 0.0, 1.0);
}
