#version 100

// precision highp vec4;
precision highp float;
precision highp int;

varying vec2 v_uv;

uniform int u_numLights; 

// size of screen fb
uniform int u_textureWidth;
uniform int u_textureHeight;

// uniform sampler2D u_lightIndexTexture;      //LUMINANCE (may be is not needed cuz we never sort)
uniform sampler2D u_lightPositionTexture;   //RGB
uniform sampler2D u_lightColorRadiusTexture;    //RGBA

uniform sampler2D u_tileLightsTexture;    // RGB, store light indices in a tile
uniform sampler2D u_tileFrustumPlanesTexture;   // RGB, store frustum planes of tile

uniform sampler2D u_depthTexture;

void main() {
    vec2 tileIdx = v_uv; 

    // vec2 tileInfo = texture2D(u_tileTexture, tileIdx).xy;  // [offset, size]


    // debug, render u_lightPositionTexture --------------------
    float lightIdx = v_uv.y * float(u_textureWidth) + v_uv.x;
    if (lightIdx < float(u_numLights))
    {
        vec3 lightPos = texture2D(u_lightPositionTexture, vec2(lightIdx,1)).xyz;
        if (lightPos.x > 0.0)
        {
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        }
        // gl_FragColor = vec4(lightPos, 1.0);
        
    }
    


}