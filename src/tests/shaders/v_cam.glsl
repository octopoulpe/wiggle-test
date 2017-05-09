#version 300 es

in vec2 aVertexPosition;

uniform mat4 uProjMat;
uniform mat4 uViewMat;

void main(void) {
    gl_Position = uProjMat * uViewMat * vec4(aVertexPosition, 0.0, 1.0);
}
