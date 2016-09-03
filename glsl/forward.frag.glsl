#version 100

precision highp float;
precision highp int;

varying vec3 v_normal;
varying vec2 v_uv;

void main() {
    //gl_FragColor = vec4 (v_uv, 1.0, 1.0);
    gl_FragColor = vec4 (v_normal, 0.5);
    //gl_FragColor = vec4 (1.0, 1.0, 1.0, 1.0);
}