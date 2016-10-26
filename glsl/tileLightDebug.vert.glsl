#version 100

precision highp float;
precision highp int;

attribute vec2 a_position;

void main() {
	gl_Position = vec4(a_position, 0.999, 1.0);
}