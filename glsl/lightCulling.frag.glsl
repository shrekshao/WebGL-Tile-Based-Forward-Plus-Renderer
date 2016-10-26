#version 100

// precision highp vec4;
precision highp float;
precision highp int;

#define TILE_SIZE 16
// #define LIGHT_LOOP_MAX 32

#define CAMERA_NEAR = 1.0
#define CAMERA_FAR = 1000.0

varying vec2 v_uv;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

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

    ivec2 pixelIdx = ivec2(gl_FragCoord.xy);    // floored
    ivec2 tileIdx = pixelIdx / TILE_SIZE;
    ivec2 tilePixel0Idx = tileIdx * TILE_SIZE;  // bottom-left pixelId of this tile

    ivec2 deltaIdx = pixelIdx - tilePixel0Idx;
    int lightIdx = deltaIdx.y * TILE_SIZE + deltaIdx.x;

    // TODO: unwrap the rgba (one pixel handle 4 lights) 



    // get min and max depth
    float farDepth = 999999.0;
    float nearDepth = -999999.0;
    for (int y = 0; y < TILE_SIZE; y++)
    {
        for (int x = 0; x < TILE_SIZE; x++)
        {
            ivec2 pid = tilePixel0Idx + ivec2(x, y);
            vec2 uv = (vec2(pid) + vec2(0.5, 0.5)) / vec2(u_textureWidth, u_textureHeight);

            float d = texture2D(u_depthTexture, uv).r;
            // transform depth value to view space
            
            d = 2.0 * d - 1.0;  //(0, 1) => (-1, 1)
            d = - u_projectionMatrix[3][2] / (d + u_projectionMatrix[2][2]);

            farDepth = min(d, farDepth);
            nearDepth = max(d, nearDepth);
        }
    }



    if (lightIdx < u_numLights)
    {
        vec2 lightUV = vec2( (float(lightIdx) + 0.5 ) / float(u_numLights) , 0.5); 

        vec4 lightPos = vec4(texture2D(u_lightPositionTexture, lightUV).xyz, 1.0);
        float lightRadius = texture2D(u_lightColorRadiusTexture, lightUV).w;

        // Test if light overlap with this tile (lightCulling)
        
        // calculate the frustum box in view space
        // credit: http://www.txutxi.com/?p=444

        mat4 M = u_projectionMatrix;


        // ivec2 tileSideNum = ivec2(u_textureWidth + TILE_SIZE - 1, u_textureHeight + TILE_SIZE - 1) / TILE_SIZE;
        // vec2 floorCoord = (2.0 * vec2(tileIdx)) / (vec2(tileSideNum)) - vec2(1.0);  // -1, 1
        // vec2 ceilCoord = (2.0 * vec2(tileIdx + ivec2(1, 1))) / (vec2(tileSideNum)) - vec2(1.0);
        
        vec2 fullScreenSize = vec2(u_textureWidth, u_textureHeight);

        // tile position in NDC space
        vec2 floorCoord = 2.0 * vec2(tilePixel0Idx) / fullScreenSize - vec2(1.0);  // -1, 1
        vec2 ceilCoord = 2.0 * vec2(tilePixel0Idx + ivec2(TILE_SIZE)) / fullScreenSize - vec2(1.0);  // -1, 1

        float viewNear = - M[3][2] / ( -1.0 + M[2][2]);
        float viewFar = - M[3][2] / (1.0 + M[2][2]);
        // float viewNear = -1.0;
        // float viewFar = -1000.0;
        vec2 viewFloorCoord = vec2( (- viewNear * floorCoord.x - M[2][0] * viewNear) / M[0][0] , (- viewNear * floorCoord.y - M[2][1] * viewNear) / M[1][1] );
        vec2 viewCeilCoord = vec2( (- viewNear * ceilCoord.x - M[2][0] * viewNear) / M[0][0] , (- viewNear * ceilCoord.y - M[2][1] * viewNear) / M[1][1] );



        // calculate frustumPlanes for each tile in view space
        vec4 frustumPlanes[6];
        // actually frustumPlanes.w = 0 for left, right, top, bottom?

        // frustumPlanes[0] = vec4(M[0][0] + M[3][0], M[0][1] + M[3][1], M[0][2] + M[3][2], M[0][3] + M[3][3]);       // left
        // frustumPlanes[1] = vec4(-M[0][0] + M[3][0], -M[0][1] + M[3][1], -M[0][2] + M[3][2], -M[0][3] + M[3][3]);   // right
        // frustumPlanes[2] = vec4(M[1][0] + M[3][0], M[1][1] + M[3][1], M[1][2] + M[3][2], M[1][3] + M[3][3]);       // bottom
        // frustumPlanes[3] = vec4(-M[1][0] + M[3][0], -M[1][1] + M[3][1], -M[1][2] + M[3][2], -M[1][3] + M[3][3]);   // top

        // float A = 2.0 * viewNear / (viewCeilCoord.x - viewFloorCoord.x);
        // float B = 2.0 * viewNear / (viewCeilCoord.y - viewFloorCoord.y);
        // float C = - 2.0 * viewNear * viewFar / (viewFar - viewNear);
        // frustumPlanes[0] = vec4(A, 0.0, C, 0.0);       // left
        // frustumPlanes[1] = vec4(-A, 0.0, C, 0.0);   // right
        // frustumPlanes[2] = vec4(0.0, B, C, 0.0);       // bottom
        // frustumPlanes[3] = vec4(0.0, -B, C, 0.0);   // top


        // frustumPlanes[0] = vec4(- viewNear / viewFloorCoord.x, 0.0, 1.0, 0.0);       // left
        // frustumPlanes[1] = vec4(- viewNear / viewCeilCoord.x, 0.0, 1.0, 0.0);   // right
        // frustumPlanes[2] = vec4(0.0, - viewNear / viewFloorCoord.y, 1.0, 0.0);       // bottom
        // frustumPlanes[3] = vec4(0.0, - viewNear / viewCeilCoord.y, 1.0, 0.0);   // top

        frustumPlanes[0] = vec4(1.0, 0.0, - viewFloorCoord.x / viewNear, 0.0);       // left
        frustumPlanes[1] = vec4(-1.0, 0.0, viewCeilCoord.x / viewNear, 0.0);   // right
        frustumPlanes[2] = vec4(0.0, 1.0, - viewFloorCoord.y / viewNear, 0.0);       // bottom
        frustumPlanes[3] = vec4(0.0, -1.0, viewCeilCoord.y / viewNear, 0.0);   // top



        // frustumPlanes[4] = vec4(0.0, 0.0, -1.0, -nearDepth);    // near
        // frustumPlanes[5] = vec4(0.0, 0.0, 1.0, -farDepth);    // far


        // transform lightPos to view space
        lightPos = u_viewMatrix * lightPos;
        lightPos /= lightPos.w;

        // vec4 box[2];
        // box[0] = lightPos - vec4( vec3(lightRadius), 0.0);
        // box[1] = lightPos + vec4( vec3(lightRadius), 0.0);

        
        vec4 boxMin = lightPos - vec4( vec3(lightRadius), 0.0);
        vec4 boxMax = lightPos + vec4( vec3(lightRadius), 0.0);


        float dp = 0.0;     //dot product

        for (int i = 0; i < 4; i++)
        {
            dp += min(0.0, dot(
                vec4( 
                    frustumPlanes[i].x > 0.0 ? boxMax.x : boxMin.x, 
                    frustumPlanes[i].y > 0.0 ? boxMax.y : boxMin.y, 
                    frustumPlanes[i].z > 0.0 ? boxMax.z : boxMin.z, 
                    1.0), 
                frustumPlanes[i]));

            // dp += max(0.0, dot(
            //     vec4( 
            //         frustumPlanes[i].x > 0.0 ? boxMax.x : boxMin.x, 
            //         frustumPlanes[i].y > 0.0 ? boxMax.y : boxMin.y, 
            //         frustumPlanes[i].z > 0.0 ? boxMax.z : boxMin.z, 
            //         1.0), 
            //     frustumPlanes[i]));
        }


        if (dp < 0.0) 
        {
            // exists some of the plane fails the test
            // no overlapping

            gl_FragColor = vec4(0.0, 0.0, 0.5, 1.0);
            // gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
        }
        else
        {
            // overlapping
            gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        }


        // gl_FragColor = vec4(frustumPlanes[0].x / 10.0, 0.0, 0.0, 1.0);
        // gl_FragColor = vec4(viewFloorCoord*2.0 - 0.1, 0.0, 1.0);
        // gl_FragColor = vec4(vec3(-viewNear * 0.5), 1.0);
        // gl_FragColor = vec4(vec3(-viewFar / 2000.0), 1.0);
        // gl_FragColor = vec4(vec3(-nearDepth)/20.0, 1.0);
        // gl_FragColor = vec4( 0.5 * (lightPos.xy + 1.0), 0.0, 1.0);
        // gl_FragColor = vec4(vec2(tilePixel0Idx) / fullScreenSize, 0.0 , 1.0);
        // gl_FragColor = vec4(vec3(1.0 - lightRadius), 1.0);
        // gl_FragColor = vec4(vec3(lightRadius), 1.0);
        // gl_FragColor = vec4(vec3(radiusHorizontalNDC), 1.0);

        // gl_FragColor = vec4(vec3(1.0 - 0.0), 1.0);
        // gl_FragColor = vec4(floorCoord.xy, 0.0, 1.0);
        // gl_FragColor = vec4(ceilCoord.xy, 0.0, 1.0);
        // gl_FragColor = vec4(radiusHorizontalNDC, radiusVerticalNDC, 0.0, 1.0);
        


        // uv that we are going to write 1/0 for u_tileLightsTexture
        // vec2 uv = (vec2(pixelIdx) + vec2(0.5, 0.5)) / vec2(u_textureWidth, u_textureHeight);
        

        // // Debug output: lightPos
        // gl_FragColor = vec4(0.0, lightPos.y / 18.0, 0.0, 1.0);
    }
    else
    {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    }




    // // debug, render u_lightPositionTexture --------------------
    // float threadIdx = ((gl_FragCoord.y - 0.5) * float(u_textureWidth) + (gl_FragCoord.x - 0.5));
    // if (threadIdx < float(u_numLights))
    // {
    //     vec3 lightPos = texture2D(u_lightPositionTexture, vec2((threadIdx) / float(u_numLights) , 0.5)).xyz;
        
    //     // gl_FragColor = vec4(lightPos, 1.0);
    //     // gl_FragColor = vec4(vec3(lightPos.y), 1.0);

    //     if (lightPos.y > 9.0)
    //     {
    //         gl_FragColor = vec4(1.0);
    //     }
    //     else
    //     {
    //         gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    //     }
    // }
    // // -------------------------------------

}