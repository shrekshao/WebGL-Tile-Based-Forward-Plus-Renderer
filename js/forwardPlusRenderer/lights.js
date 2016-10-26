var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;
    FPR.light = {};

    // Lights

    // TODO: Edit if you want to change the light initial positions
    
    var lightPos = FPR.light.lightPos;

    var lightPosMin = [-2, -2, -1.5];
    var lightPosMax = [2, 4, 1.5];
    // var lightPosMin = [0, 0, 0];
    // var lightPosMax = [1, 1, 1];
    //var lightVelMax = [0, -1, 0];
    var lightVelY = -0.03;
    // var LIGHT_RADIUS = 5.0;
    var LIGHT_RADIUS = 1;
    // var LIGHT_RADIUS = 10000.0;
    var NUM_LIGHTS = FPR.NUM_LIGHTS = 10; // TODO: test with MORE lights!

    // var lightTextureSideLength = 32;
    // var lightTextureSize = lightTextureSideLength * lightTextureSideLength;

    var lightIndex = FPR.light.index = new Float32Array(NUM_LIGHTS);    // WebGL 1 doesn't support integer texture
    var lightPosition = FPR.light.position = new Float32Array(NUM_LIGHTS * 3);
    var lightColorRadius = FPR.light.colorRadius = new Float32Array(NUM_LIGHTS * 4);
    // var lightIndex = FPR.light.index = new Float32Array(lightTextureSize);    // WebGL 1 doesn't support integer texture
    // var lightPosition = FPR.light.position = new Float32Array(lightTextureSize * 3);
    // var lightColorRadius = FPR.light.colorRadius = new Float32Array(lightTextureSize * 4);

    
    FPR.light.init = function () {
        Math.seedrandom(0);

        var posfn = function(i) {
            var mn = lightPosMin[i];
            var mx = lightPosMax[i];
            return Math.random() * (mx - mn) + mn;
        };

        var b;
        for (var i = 0; i < NUM_LIGHTS; i++) {
            // index
            lightIndex[i] = i;

            b = 3 * i;

            // pos
            lightPosition[b + 0] = posfn(0);
            lightPosition[b + 1] = posfn(1);
            lightPosition[b + 2] = posfn(2);

            // lightPosition[b + 0] = (b - 10) / 10 * 3;
            // lightPosition[b + 1] = (b - 10) / 10 * 5;
            // lightPosition[b + 2] = (b - 10) / 10* 2;
            // lightPosition[b + 0] = 10;
            // lightPosition[b + 1] = 10;
            // lightPosition[b + 2] = 10;

            // rgb
            // lightColorRadius[b + 0] = 1 + Math.random();
            // lightColorRadius[b + 1] = 1 + Math.random();
            // lightColorRadius[b + 2] = 1 + Math.random();

            lightColorRadius[b + 0] = 0.5 + Math.random();
            lightColorRadius[b + 1] = 0.5 + Math.random();
            lightColorRadius[b + 2] = 0.5 + Math.random();

            // radius
            lightColorRadius[b + 3] = LIGHT_RADIUS;
        }
        // for (var i = 0; i < lightTextureSize; i++) {
        //     if (i >= NUM_LIGHTS) {
        //         break;
        //     }

        //     // index
        //     lightIndex[i] = i;

        //     b = 3 * i;

        //     // pos
        //     lightPosition[b + 0] = posfn(0);
        //     lightPosition[b + 1] = posfn(1);
        //     lightPosition[b + 2] = posfn(2);

        //     // rgb
        //     lightColorRadius[b + 0] = 1 + Math.random();
        //     lightColorRadius[b + 1] = 1 + Math.random();
        //     lightColorRadius[b + 2] = 1 + Math.random();
        //     // radius
        //     lightColorRadius[b + 3] = Math.random();
        // }


        var gl = FPR.gl;

        //var lightUniformBuffer = FPR.lightUniformBuffer = gl.createBuffer();
        if (FPR.useWebGL2) {
            // WebGL 2
            // TODO: use uniform buffer to store lights 
        } else {
            // WebGL 1
            // use Texture to store lights info

            var lightIndexTexId = FPR.glTextureId.lightIndex;
            // gl.activeTexture(gl.TEXTURE0 + lightIndexTexId);
            FPR.light.indexTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.indexTexture);
            gl.texImage2D(gl.TEXTURE_2D, 
                            0, 
                            gl.LUMINANCE, 
                            NUM_LIGHTS, 
                            1,
                            // lightTextureSideLength, 
                            // lightTextureSideLength, 
                            0, 
                            gl.LUMINANCE, 
                            gl.FLOAT, 
                            lightIndex);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            var lightPositionTexId = FPR.glTextureId.lightPosition;
            // gl.activeTexture(gl.TEXTURE0 + lightPositionTexId);
            FPR.light.positionTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.positionTexture);
            gl.texImage2D(gl.TEXTURE_2D, 
                            0, 
                            gl.RGB, 
                            NUM_LIGHTS, 
                            1, 
                            0, 
                            gl.RGB, 
                            gl.FLOAT, 
                            lightPosition);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            var lightColorRadiusTexId = FPR.glTextureId.lightColorRadius;
            // gl.activeTexture(gl.TEXTURE0 + lightColorRadiusTexId);
            FPR.light.colorRadiusTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.colorRadiusTexture);
            gl.texImage2D(gl.TEXTURE_2D, 
                            0, 
                            gl.RGBA, 
                            NUM_LIGHTS, 
                            1, 
                            0, 
                            gl.RGBA, 
                            gl.FLOAT, 
                            lightColorRadius);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);




            gl.bindTexture(gl.TEXTURE_2D, null);
        }

    }

    FPR.light.update = function () {
        var b;
        for (var i = 0; i < NUM_LIGHTS; i++) {
            b = 3 * i;

            // pos.y
            var mn = lightPosMin[1];
            var mx = lightPosMax[1];
            // lightPosition[b + 1] = (lightPosition[b + 1] + lightVelY - mn + mx) % mx + mn;
        }

        var gl = FPR.gl;

        if (FPR.useWebGL2) {
            // WebGL 2
            // TODO: use uniform buffer to store lights 
        } else {
            // WebGL 1
            // use texuture as uniform buffer
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.positionTexture);
            gl.texSubImage2D(gl.TEXTURE_2D, 
                            0, 
                            0,
                            0, 
                            NUM_LIGHTS, 
                            1, 
                            gl.RGB, 
                            gl.FLOAT, 
                            lightPosition);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }



    


})();