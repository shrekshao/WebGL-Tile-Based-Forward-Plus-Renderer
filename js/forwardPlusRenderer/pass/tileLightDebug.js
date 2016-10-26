var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    FPR.pass.tileLightDebug.init = function () {
        console.log("tileLightDebug Init");

        // TODO:
    };
    
    FPR.pass.tileLightDebug.loadShaderProgramCallback = function (prog) {
        var gl = FPR.gl;

        // our current operating pass
        var p = FPR.pass.tileLightDebug;

        p.program = prog;

        // Retrieve the uniform and attribute locations
        
        p.u_numLights = gl.getUniformLocation(prog, 'u_numLights');

        p.u_textureWidth = gl.getUniformLocation(prog, 'u_textureWidth');
        p.u_textureHeight = gl.getUniformLocation(prog, 'u_textureHeight');

        p.u_tileLightsTexture = gl.getUniformLocation(prog, 'u_tileLightsTexture');

        p.a_position  = gl.getAttribLocation(prog, 'a_position');

        console.log("Shader Loaded: tileLightDebug");
    };

    var uniformDirty = true;
    FPR.pass.tileLightDebug.uniformBind = function () {
        var gl = FPR.gl;

        gl.uniformMatrix4fv(this.u_viewMatrix, false, FPR.camera.matrixWorldInverse.elements);

        if (uniformDirty)
        {
            uniformDirty = false;

            // active and bind Textures

            gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.tileLights);
            gl.bindTexture(gl.TEXTURE_2D, FPR.pass.lightCulling.tileLightsTexture);

            // assign one time static uniforms
            gl.uniform1i(this.u_tileLightsTexture, FPR.glTextureId.tileLights);

            gl.uniform1i(this.u_textureWidth, FPR.width);
            gl.uniform1i(this.u_textureHeight, FPR.height);

            gl.uniform1i(this.u_numLights, FPR.NUM_LIGHTS);
        }
                
    };

})();