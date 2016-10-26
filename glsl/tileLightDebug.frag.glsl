#version 100

precision highp float;
precision highp int;

#define TILE_SIZE 16

uniform int u_numLights;

// size of screen fb, texture
uniform int u_textureWidth;
uniform int u_textureHeight;

uniform sampler2D u_tileLightsTexture;

void main() {
    
    ivec2 pixelIdx = ivec2(gl_FragCoord.xy);    //floored
    ivec2 tileIdx = pixelIdx / TILE_SIZE;
    ivec2 tilePixel0Idx = tileIdx * TILE_SIZE;  // first pixel idx of this tile

    int lightIdx = 0;

    vec3 color = vec3(0.0, 0.0, 0.0);

    int numVisibleLights = 0;

    for (int y = 0; y < TILE_SIZE; y++)
    {
        if (lightIdx >= u_numLights) break;

        for (int x = 0; x < TILE_SIZE; x++)
        {
            if (lightIdx >= u_numLights) break;

            ivec2 pid = tilePixel0Idx + ivec2(x, y);
            vec2 uv = (vec2(pid) + vec2(0.5, 0.5)) / vec2(u_textureWidth, u_textureHeight);
            bool visible = (texture2D(u_tileLightsTexture, uv).r) > 0.5;

            if (visible)
            {
                // // debug: num of lights
                numVisibleLights++;
            }

            lightIdx++;
        }
    }


    // debug: num of lights
    float t = float(numVisibleLights) / float(u_numLights);
    color = vec3(4.0 * t - 2.0, t < 0.5 ? 4.0 * t: 4.0 - 4.0 * t , 2.0 - 4.0 * t);

    gl_FragColor = vec4(color, 1.0);
}