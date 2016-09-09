var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;
    FPR.light = {};

    // Lights

    // TODO: Edit if you want to change the light initial positions
    
    var lightPos = FPR.light.lightPos 

    var lightPosMin = [-14, 0, -6];
    var lightPosMax = [14, 18, 6];
    //var lightVelMax = [0, -1, 0];
    var lightVelY = -0.03;
    var LIGHT_RADIUS = 4.0;
    var NUM_LIGHTS = 20; // TODO: test with MORE lights!

    var lightIndex = FPR.light.index = new Float32Array(NUM_LIGHTS);    // WebGL 1 doesn't support integer texture
    var lightPosition = FPR.light.position = new Float32Array(NUM_LIGHTS * 3);
    var lightColorRadius = FPR.light.colorRadius = new Float32Array(NUM_LIGHTS * 4);
    
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

            // rgb
            lightColorRadius[b + 0] = 1 + Math.random();
            lightColorRadius[b + 1] = 1 + Math.random();
            lightColorRadius[b + 2] = 1 + Math.random();
            // radius
            lightColorRadius[b + 3] = Math.random();
        }


        var gl = FPR.gl;

        //var lightUniformBuffer = FPR.lightUniformBuffer = gl.createBuffer();
        if (FPR.useWebGL2) {
            // WebGL 2
            // TODO: use uniform buffer to store lights 
        } else {
            // WebGL 1
            // use Texture to store lights info

            var lightIndexTexId = FPR.glTextureId.lightIndex;
            gl.activeTexture(gl.TEXTURE0 + lightIndexTexId);
            FPR.light.indexTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.indexTexture);
            gl.texImage2D(gl.TEXTURE_2D, 
                            0, 
                            gl.LUMINANCE, 
                            NUM_LIGHTS, 
                            1, 
                            0, 
                            gl.LUMINANCE, 
                            gl.FLOAT, 
                            lightIndex);

            var lightPositionTexId = FPR.glTextureId.lightPosition;
            gl.activeTexture(gl.TEXTURE0 + lightPositionTexId);
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

            var lightColorRadiusTexId = FPR.glTextureId.lightColorRadius;
            gl.activeTexture(gl.TEXTURE0 + lightColorRadiusTexId);
            FPR.light.colorRadiusTexture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.colorRadiusTexture);
            gl.texImage2D(gl.TEXTURE_2D, 
                            0, 
                            gl.RGBA, 
                            NUM_LIGHTS, 
                            1.0, 
                            0, 
                            gl.RGBA, 
                            gl.FLOAT, 
                            lightColorRadius);




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
            lightPosition[b + 1] = (lightPosition[b + 1] + lightVelY - mn + mx) % mx + mn;
        }

        var gl = FPR.gl;

        if (FPR.useWebGL2) {
            // WebGL 2
            // TODO: use uniform buffer to store lights 
        } else {
            // WebGL 1
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