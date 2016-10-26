var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    FPR.pass.lightAccumulation.init = function () {
        console.log("lightAccumulation pass init");

        // TODO:
    };
    

    FPR.pass.lightAccumulation.loadShaderProgramCallback = function (prog) {
        var gl = FPR.gl;

        // our current operating pass
        var p = FPR.pass.lightAccumulation;

        p.program = prog;

        // Retrieve the uniform and attribute locations

        p.u_modelViewMatrix = gl.getUniformLocation(prog, 'u_modelViewMatrix');
        p.u_inverseTransposeModelViewMatrix = gl.getUniformLocation(prog, 'u_inverseTransposeModelViewMatrix');
        p.u_projectionMatrix    = gl.getUniformLocation(prog, 'u_projectionMatrix');

        p.u_viewMatrix = gl.getUniformLocation(prog, 'u_viewMatrix');
        
        p.u_numLights = gl.getUniformLocation(prog, 'u_numLights');

        p.u_textureWidth = gl.getUniformLocation(prog, 'u_textureWidth');
        p.u_textureHeight = gl.getUniformLocation(prog, 'u_textureHeight');

        p.u_lightPositionTexture = gl.getUniformLocation(prog, 'u_lightPositionTexture');
        p.u_lightColorRadiusTexture = gl.getUniformLocation(prog, 'u_lightColorRadiusTexture');
        p.u_tileLightsTexture = gl.getUniformLocation(prog, 'u_tileLightsTexture');

        p.a_position  = gl.getAttribLocation(prog, 'a_position');
        p.a_normal    = gl.getAttribLocation(prog, 'a_normal');
        p.a_uv        = gl.getAttribLocation(prog, 'a_uv');

        console.log("Shader Loaded: lightAccumulation");
    };

    FPR.pass.lightAccumulation.fboBind = function () {
        var gl = FPR.gl;
        // TODO
        // gl.bindFramebuffer(gl.FRAMEBUFFER, FPR.pass.lightCulling.tileLightsFB);
    };


    var tmpMat4 = mat4.create();

    var uniformDirty = true;
    FPR.pass.lightAccumulation.uniformBind = function () {
        var gl = FPR.gl;

        gl.uniformMatrix4fv(this.u_viewMatrix, false, FPR.camera.matrixWorldInverse.elements);

        // // debug: test num of lights per tile
        // gl.uniformMatrix4fv(this.u_projectionMatrix, false, tmpMat4);
        // gl.uniformMatrix4fv(this.u_modelViewMatrix, false, tmpMat4);

        if (uniformDirty)
        {
            uniformDirty = false;

            // active and bind Textures
            gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.lightPosition);
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.positionTexture);

            gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.lightColorRadius);
            gl.bindTexture(gl.TEXTURE_2D, FPR.light.colorRadiusTexture);

            gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.tileLights);
            gl.bindTexture(gl.TEXTURE_2D, FPR.pass.lightCulling.tileLightsTexture);

            // assign one time static uniforms
            gl.uniform1i(this.u_lightPositionTexture, FPR.glTextureId.lightPosition);
            gl.uniform1i(this.u_lightColorRadiusTexture, FPR.glTextureId.lightColorRadius);
            gl.uniform1i(this.u_tileLightsTexture, FPR.glTextureId.tileLights);

            gl.uniform1i(this.u_textureWidth, FPR.width);
            gl.uniform1i(this.u_textureHeight, FPR.height);

            gl.uniform1i(this.u_numLights, FPR.NUM_LIGHTS);
        }
                
    };



    // FPR.pass.lightAccumulation.test = function() {
    //     this.uniformBind();
    // };


})();