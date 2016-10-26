#version 100

precision highp float;
precision highp int;

#define TILE_SIZE 16

varying vec3 v_normal;
varying vec2 v_uv;

varying vec3 v_eyePosition;

uniform mat4 u_viewMatrix;

uniform int u_numLights;

// size of screen fb, texture
uniform int u_textureWidth;
uniform int u_textureHeight;

uniform sampler2D u_lightPositionTexture;   //xyz
uniform sampler2D u_lightColorRadiusTexture;    //rgba

uniform sampler2D u_tileLightsTexture;      // 


uniform sampler2D u_diffuse;

void main() {
    
    ivec2 pixelIdx = ivec2(gl_FragCoord.xy);    //floored
    ivec2 tileIdx = pixelIdx / TILE_SIZE;
    ivec2 tilePixel0Idx = tileIdx * TILE_SIZE;  // first pixel idx of this tile

    int lightIdx = 0;

    vec3 color = vec3(0.0, 0.0, 0.0);

    

    // vec3 diffuseColor = vec3(1.0, 1.0, 1.0);
    vec3 diffuseColor = texture2D(u_diffuse, v_uv).rgb;
    vec3 ambientColor = diffuseColor * 0.2;
    vec3 diffuseLight = vec3(0.0);


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
                vec2 lightUV = vec2( (float(lightIdx) + 0.5 ) / float(u_numLights) , 0.5);
                vec4 lightPos = vec4(texture2D(u_lightPositionTexture, lightUV).xyz, 1.0);
                // float lightRadius = texture2D(u_lightColorRadiusTexture, lightUV).w;
                vec4 lightColorRadius = texture2D(u_lightColorRadiusTexture, lightUV);

                // shading
                lightPos = u_viewMatrix * lightPos;
                vec3 l = lightPos.xyz - v_eyePosition;
                float dist = length(l);
                l /= dist;
                float attenuation = max(0.0, 1.0 - dist / lightColorRadius.w);
                diffuseLight += attenuation * lightColorRadius.rgb * max(0.0, dot(v_normal, l));


            }

            lightIdx++;
        }
    }

    color += ambientColor;

    diffuseColor *= diffuseLight;
    color += diffuseColor;

    gl_FragColor = vec4(color, 1.0);
    // gl_FragColor = vec4(v_normal, 1.0);
    // gl_FragColor = vec4(v_uv, 0.0, 1.0);
    // gl_FragColor = vec4(texture2D(u_diffuse, v_uv).rgb, 1.0);
}