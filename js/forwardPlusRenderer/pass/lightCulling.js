var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    var tileSideLength = 16;
    var numTileWidth;
    var numTileHeight;
    var numTile;


    FPR.pass.lightCulling.init = function () {
        console.log("lightCulling pass init");

        var gl = FPR.gl;

        // canvas pixel size
        var width = FPR.width;
        var height = FPR.height;
        numTileWidth = Math.ceil(width / tileSideLength);
        numTileHeight = Math.ceil(height / tileSideLength);
        numTile = numTileWidth * numTileHeight;

        var self = FPR.pass.lightCulling;

        // using gathering approach ("launch threads" against tile)
        // store light idx. Texcoord indicates which tile it belongs to 
        // for a 8x8 tile, it can store at most 3 * 8 * 8 = 192 lights for each tile
        var tileLightsTexture = self.tileLightsTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tileLightsTexture); 
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, numTileWidth, numTileHeight, 0, gl.RGB, gl.FLOAT, new Float32Array(numTile * 3));
        // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        //gl.uniform1i(gl.getUniformLocation(program, "u_LightGridtex"),4); 
        gl.bindTexture(gl.TEXTURE_2D, null); 

        // left, right, up, bottom, frust near and far plane depth
        // each is a vec4 representing a plane
        var tileFrustumPlanesTexture = self.tileFrustumPlanesTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tileFrustumPlanesTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, numTileWidth, numTileHeight, 0, gl.RGB, gl.FLOAT, new Float32Array(numTile * 3));       
        //gl.uniform1i(gl.getUniformLocation(program, "u_LightGridFrustumPlanes"),5); 
        gl.bindTexture(gl.TEXTURE_2D, null);


        // bind texture to framebuffer

        var tileLightsFB = self.tileLightsFB = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, tileLightsFB);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileLightsTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        var tileFrustumPlanesFB = self.tileFrustumPlanesFB = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, tileFrustumPlanesFB);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tileFrustumPlanesTexture, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    };


    // per frame update
    
    FPR.pass.lightCulling.fboBind = function () {
        var gl = FPR.gl;
        // TODO
        // gl.bindFramebuffer(gl.FRAMEBUFFER, FPR.pass.lightCulling.tileLightsFB);
    };


    FPR.pass.lightCulling.loadShaderProgramCallback = function (prog) {
        var gl = FPR.gl;

        // our current operating pass
        var p = FPR.pass.lightCulling;

        p.program = prog;

        // Retrieve the uniform and attribute locations

        p.u_projectionMatrix = gl.getUniformLocation(prog, 'u_projectionMatrix');
        
        p.u_numLights = gl.getUniformLocation(prog, 'u_numLights');

        p.u_textureWidth = gl.getUniformLocation(prog, 'u_textureWidth');
        p.u_textureHeight = gl.getUniformLocation(prog, 'u_textureHeight');

        p.u_lightIndexTexture = gl.getUniformLocation(prog, 'u_lightIndexTexture');
        p.u_lightPositionTexture = gl.getUniformLocation(prog, 'u_lightPositionTexture');
        p.u_lightColorRadiusTexture = gl.getUniformLocation(prog, 'u_lightColorRadiusTexture');
        p.u_tileLightsTexture = gl.getUniformLocation(prog, 'u_tileLightsTexture');
        p.u_tileFrustumPlanesTexture = gl.getUniformLocation(prog, 'u_tileFrustumPlanesTexture');
        p.u_depthTexture = gl.getUniformLocation(prog, 'u_depthTexture');


        p.a_position  = gl.getAttribLocation(prog, 'a_position');
        p.a_uv        = gl.getAttribLocation(prog, 'a_uv');

        console.log("Shader Loaded: lightCulling");
    };

    

    var uniformDirty = true;
    FPR.pass.lightCulling.execute = function () {
        var gl = FPR.gl;

        gl.useProgram(this.program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // active and bind Textures

        gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.depth);
        gl.bindTexture(gl.TEXTURE_2D, FPR.pass.depthPrepass.depthTexture);

        gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.lightIndex);
        gl.bindTexture(gl.TEXTURE_2D, FPR.light.indexTexture);

        gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.lightPosition);
        gl.bindTexture(gl.TEXTURE_2D, FPR.light.positionTexture);

        gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.lightColorRadius);
        gl.bindTexture(gl.TEXTURE_2D, FPR.light.colorRadiusTexture);

        gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.tileLights);
        gl.bindTexture(gl.TEXTURE_2D, this.tileLightsTexture);

        gl.activeTexture(gl.TEXTURE0 + FPR.glTextureId.tileFrustumPlanes);
        gl.bindTexture(gl.TEXTURE_2D, this.tileFrustumPlanesTexture);


        gl.uniformMatrix4fv(this.u_projectionMatrix, false, FPR.camera.projectionMatrix.elements);

        if (uniformDirty) {
            uniformDirty = false;

            // assign one time static uniforms
            gl.uniform1i(this.u_depthTexture, FPR.glTextureId.depth);
            gl.uniform1i(this.u_lightIndexTexture, FPR.glTextureId.lightIndex);
            gl.uniform1i(this.u_lightPositionTexture, FPR.glTextureId.lightPosition);
            gl.uniform1i(this.u_lightColorRadiusTexture, FPR.glTextureId.lightColorRadius);
            gl.uniform1i(this.u_tileLightsTexture, FPR.glTextureId.tileLights);
            gl.uniform1i(this.u_tileFrustumPlanesTexture, FPR.glTextureId.tileFrustumPlanes);

            gl.uniform1i(this.u_textureWidth, FPR.width);
            gl.uniform1i(this.u_textureHeight, FPR.height);

            gl.uniform1i(this.u_numLights, FPR.NUM_LIGHTS);
        }
        


        gl.bindBuffer(gl.ARRAY_BUFFER, FPR.quadPositionBuffer);
        if (this.a_position !== undefined) {
            gl.enableVertexAttribArray(this.a_position);
            gl.vertexAttribPointer(this.a_position, 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, FPR.quadUVBuffer);
        if (this.a_uv !== undefined) {
            gl.enableVertexAttribArray(this.a_uv);
            gl.vertexAttribPointer(this.a_uv, 2, gl.FLOAT, false, 0, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };


    
    






})();