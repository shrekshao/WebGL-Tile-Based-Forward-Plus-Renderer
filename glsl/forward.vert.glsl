#version 100

precision highp float;
precision highp int;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;

// TODO: MVNormal

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec3 a_uv;

varying vec3 v_normal;
varying vec3 v_uv;

void main() {
    v_normal = a_normal;
    v_uv = a_uv;

    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
}