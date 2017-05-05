#version 300 es

in vec2 aVertexPosition;
in vec3 aVertexColor;
in vec2 aTextureCoord;

out vec3 vColor;
out float vIntensity;
out vec2 vTextureCoord;

uniform mat4 uProjMat;
uniform mat4 uViewMat;
uniform mat4 uModelMat;
uniform vec2 uPlayerPos;

void main(void) {
    gl_Position = uProjMat * uViewMat * uModelMat * vec4(aVertexPosition, 0.0, 1.0);
    vColor = aVertexColor;
    vTextureCoord = aTextureCoord;
    vIntensity = 1.0 / (distance(aVertexPosition, uPlayerPos) + 1.0);
}
