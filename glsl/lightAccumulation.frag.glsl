#version 100

precision highp float;
precision highp int;

#define TILE_SIZE 16

varying vec3 v_normal;
varying vec2 v_uv;

varying vec3 v_eyePosition;

uniform mat4 v_viewMatrix;

uniform sampler2D u_lightPositionTexture;   //xyz
uniform sampler2D u_lightColorRadiusTexture;    //rgba

uniform sampler2D u_tileNumLightsTexture;   // num of lights in each tile
uniform sampler2D u_tileLightsTexture;      // light idx, luminance

// offset numlights lightIdx

void main() {
    
    ivec2 pixelIdx = ivec2(gl_FragCoord.xy);    //floored
    ivec2 tileIdx = pixelIdx / TILE_SIZE;
    ivec2 tilePixel0Idx = tileIdx * TILE_SIZE;  // first pixel idx of this tile

    // vec2 uvNumTileLights = (vec2(tilePixel0Idx) + vec2(0.5, 0.5)) / vec2(u_textureWidth, u_textureHeight);
    int numTileLight = texture2D(u_depthTexture, uv).r;
    int countLights = 0;

    // for (int x = 0; x < TILE_SIZE; x++)
    // {
    //     for (int y = 0; y < TILE_SIZE; y++)
    //     {
    //         ivec2 pid = tilePixel0Idx + ivec2(x, y);
    //         vec2 uv = (vec2(pid) + vec2(0.5, 0.5)) / vec2(u_textureWidth, u_textureHeight);

            
    //         int lightIdx = int(texture2D(u_tileLightsTexture, uv).r);
    //         vec3 lightPos = texture;
            
            
            

    //         // countLights +=
    //     }
    // }


    gl_FragColor = vec4 (v_normal, 0.5);
}