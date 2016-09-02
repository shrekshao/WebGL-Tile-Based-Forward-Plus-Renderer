#version 100

precision highp float;
precision highp int;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
//uniform mat3 u_inverseTransposeModelViewMatrix;

attribute vec3 a_position;

void main() {
	gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
}