#version 100

precision highp float;
precision highp int;

uniform mat4 u_modelViewMatrix;
uniform mat4 u_projectionMatrix;
uniform mat3 u_inverseTransposeModelViewMatrix;


// TODO: MVNormal

attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_uv;

varying vec3 v_normal;
varying vec2 v_uv;

void main() {
    v_normal = normalize(u_inverseTransposeModelViewMatrix * a_normal);
    //v_normal = a_normal;
    v_uv = a_uv;

    gl_Position = u_projectionMatrix * u_modelViewMatrix * vec4(a_position, 1.0);
}