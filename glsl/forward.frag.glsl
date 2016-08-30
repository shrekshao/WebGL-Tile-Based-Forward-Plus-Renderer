#version 100

precision highp float;
precision highp int;

varying vec3 v_normal;
varying vec3 v_uv;

void main() {
    gl_FragColor = vec4 (v_normal, 1.0);
    //gl_FragColor = vec4 (1.0, 1.0, 1.0, 1.0);
}