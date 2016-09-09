#version 100

precision highp float;
precision highp int;

varying vec2 v_uv;

uniform sampler2D u_lightIndexTexture;      //LUMINANCE
uniform sampler2D u_lightPositionTexture;   //RGB
uniform sampler2D u_lightColorRadiusTexture;    //RGBA

uniform sampler2D u_tileTexture;    // ? light

void main() {
    //vec2 tileIdx = v_uv;

    int lightIdx = v_uv.x; 

    vec2 tileInfo = texture2D(u_tileTexture, tileIdx).xy;  // [offset, size]


}