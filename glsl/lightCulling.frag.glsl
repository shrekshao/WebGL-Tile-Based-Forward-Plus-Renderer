#version 100

// precision highp vec4;
precision highp float;
precision highp int;

#define TILE_SIZE 16
#define LIGHT_LOOP_MAX 32

varying vec2 v_uv;

// uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

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
    

    // vec2 tileInfo = texture2D(u_tileTexture, tileIdx).xy;  // [offset, size]


    // // debug, render u_lightPositionTexture --------------------
    // float threadIdx = ((gl_FragCoord.y - 0.5) * float(u_textureWidth) + (gl_FragCoord.x - 0.5));
    // if (threadIdx < float(u_numLights))
    // {
    //     vec3 lightPos = texture2D(u_lightPositionTexture, vec2((threadIdx) / float(u_numLights) , 0.5)).xyz;
        
    //     gl_FragColor = vec4(lightPos, 1.0);
    //     // gl_FragColor = vec4(vec3(lightPos.y), 1.0);
    // }
    // // -------------------------------------



    // find current threadIdx and tileIdx
    ivec2 pixelIdx = ivec2(gl_FragCoord.xy);    //floor
    ivec2 tileIdx = pixelIdx / TILE_SIZE;
    ivec2 tileSideNum = ivec2(u_textureWidth + TILE_SIZE - 1, u_textureHeight + TILE_SIZE - 1) / TILE_SIZE;

    // use exact one thread per tile to gather lights (kind of difficult...)
    if ( pixelIdx == tileIdx * TILE_SIZE)
    {
        // working thread for this tile

        // get min and max of depth
        float minDepth = 99999.0;
        float maxDepth = - 99999.0;
        for (int x = 0; x < TILE_SIZE; x++)
        {
            for (int y = 0; y < TILE_SIZE; y++)
            {
                ivec2 pid = pixelIdx + ivec2(x, y);
                vec2 uv = (vec2(pid) + vec2(0.5, 0.5)) / vec2(u_textureWidth, u_textureHeight);
                float d = texture2D(u_depthTexture, uv).r;
                // transform depth value to view space
                // d = (0.5 * u_projectionMatrix[3][2]) / (d + 0.5 * u_projectionMatrix[2][2] - 0.5);
                d = 2.0 * d - 1.0;  //(0, 1) => (-1, 1)
                d = - u_projectionMatrix[3][2] / (d + u_projectionMatrix[2][2]);

                minDepth = min(d, minDepth);
                maxDepth = max(d, maxDepth);
            }
        }

        // // min depth test output
        gl_FragColor = vec4(vec3(-minDepth) * 0.001, 1.0);


        // calculate the frustum box in view space first, then transform to ndc space
        vec2 floorCoord = vec2(1.0) - (2.0 * vec2(tileIdx)) / (vec2(tileSideNum));
        vec2 ceilCoord = vec2(1.0) - (2.0 * vec2(tileIdx + ivec2(1, 1))) / (vec2(tileSideNum));

        vec4 frustumPlanes[6];
        frustumPlanes[0] = vec4(-1.0, 0.0, 0.0, floorCoord.x);       // left
        frustumPlanes[1] = vec4(1.0, 0.0, 0.0, ceilCoord.x);        // right
        frustumPlanes[2] = vec4(0.0, -1.0, 0.0, floorCoord.y);        // bottom
        frustumPlanes[3] = vec4(0.0, 1.0, 0.0, ceilCoord.y);           // up
        frustumPlanes[4] = vec4(0.0, 0.0, -1.0, -minDepth);    // near
        frustumPlanes[5] = vec4(0.0, 0.0, 1.0, -maxDepth);    // far

        // frustumPlanes[0] = vec4(1.0, 0.0, 0.0, floorCoord.x);       // left
        // frustumPlanes[1] = vec4(-1.0, 0.0, 0.0, -ceilCoord.x);        // right
        // frustumPlanes[2] = vec4(0.0, 1.0, 0.0, floorCoord.y);        // bottom
        // frustumPlanes[3] = vec4(0.0, -1.0, 0.0, -ceilCoord.y);           // up
        // frustumPlanes[4] = vec4(0.0, 0.0, -1.0, -minDepth);    // near
        // frustumPlanes[5] = vec4(0.0, 0.0, 1.0, maxDepth);    // far

        // // transform to NDC space?
        // for (int i = 0; i < 4; i++)
        // {
        //     frustumPlanes[i] = u_projectionMatrix * u_viewMatrix * frustumPlanes[i];
        //     frustumPlanes[i] /= length
        // }

        // frustumPlanes[4] *= u_viewMatrix;
        // frustumPlanes[4] /= length(frustumPlanes[4].xyz);
        // frustumPlanes[5] *= u_viewMatrix;
        // frustumPlanes[5] /= length(frustumPlanes[5].xyz);


        
        // for each light
        //  if it overlap with current tile frustum box
        //      write to tileLightsTexture store light idx

        vec2 lightIdx = vec2(0.0, 0.5);

        // NOTE: loop i can only compare to constant
        for (int i = 0; i < LIGHT_LOOP_MAX; i++)
        {
            if (i == u_numLights) break; 

            lightIdx.x = float(i) / float(u_numLights);

            vec4 lightPos = vec4(texture2D(u_lightPositionTexture, lightIdx).xyz, 1.0);
            vec4 lightColorRadius = texture2D(u_lightColorRadiusTexture, lightIdx);

            // // overlapping test
            // float distance = 0.0;
            // for (int j = 0; j < 6; j++)
            // {
            //     distance = dot(lightPos, frustumPlanes[j]) + lightColorRadius.w;

            //     if (distance <= 0.0) break;
            // }

            // // visible light
            // if (distance > 0.0)
            // {

            // }

        }


    }
    else
    {
        // other idle threads
        // should not operate to avoid race conditions
        
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }


    // for loop light
    //  if pass frustum hit test
    //      write to tileLightsTexture store light idx




}