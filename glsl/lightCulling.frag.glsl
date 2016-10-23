#version 100

// precision highp vec4;
precision highp float;
precision highp int;

varying vec2 v_uv;

uniform int u_numLights; 

// size of screen fb
uniform int u_textureWidth;
uniform int u_textureHeight;

uniform sampler2D u_lightIndexTexture;      //LUMINANCE (may be is not needed cuz we never sort)
uniform sampler2D u_lightPositionTexture;   //RGB
uniform sampler2D u_lightColorRadiusTexture;    //RGBA

uniform sampler2D u_tileLightsTexture;    // RGB, store light indices in a tile
uniform sampler2D u_tileFrustumPlanesTexture;   // RGB, store frustum planes of tile

uniform sampler2D u_depthTexture;

void main() {
    vec2 tileIdx = v_uv; 

    // vec2 tileInfo = texture2D(u_tileTexture, tileIdx).xy;  // [offset, size]


    // // debug, render u_lightPositionTexture --------------------
    // // float lightIdx = v_uv.y * float(u_textureWidth) + v_uv.x;
    float threadIdx = ((gl_FragCoord.y - 0.5) * float(u_textureWidth) + (gl_FragCoord.x- 0.5));
    // float lightIdx = texture2D(u_lightIndexTexture, vec2(threadIdx, 0.0));



    // float lightIdx = texture2D(u_lightIndexTexture, vec2(v_uv.y * float(u_textureWidth) + v_uv.x, 0.0));
    if (threadIdx < float(u_numLights))
    // if (threadIdx < 1000.0)
    // if (threadIdx < 1.0)
    {
    //     // vec3 lightPos = texture2D(u_lightPositionTexture, vec2(lightIdx / float(u_numLights))).xyz;
    //     vec3 lightPos = texture2D(u_lightPositionTexture, vec2(0.5, 2)).xyz;
        vec3 lightPos = texture2D(u_lightPositionTexture, vec2(threadIdx / float(u_numLights), 0.0)).xyz;

    //     // if (lightPos.y > 0.5)
    //     // {
    //     //     gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
    //     // }
    //     // else
    //     // {
    //     //     gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
    //     // }
    //     gl_FragColor = vec4(lightPos, 1.0);
        
        gl_FragColor = vec4(lightPos, 1.0);
        // gl_FragColor = vec4(threadIdx, 0.0, 0.0, 1.0);
        // gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
        
    }

    // gl_FragColor = vec4(v_uv, 0.0, 1.0);
    // gl_FragColor = vec4(
    //         gl_FragCoord.x / float(u_textureWidth), 
    //         gl_FragCoord.y / float(u_textureHeight), 
    //         0.0, 
    //         1.0);
    


    // find current threadIdx and tileIdx

    // for loop light
    //  if pass frustum hit test
    //      write to tileLightsTexture store light idx




}