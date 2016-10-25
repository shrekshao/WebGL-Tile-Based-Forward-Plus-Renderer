#version 100

precision highp float;
precision highp int;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

attribute vec3 a_position;

void main() {
	gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1.0);
	// gl_Position = vec4(a_position, 1.0);
	// gl_Position = vec4(a_position.x/2.0, a_position.y/5.0, a_position.z, 1.0);
    gl_PointSize = 10.0;
}