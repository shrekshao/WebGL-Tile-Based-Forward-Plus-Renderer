var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    var tileSize = 32;
    var numTileWidth;
    var numTileHeight;
    var numTile;


    FPR.pass.lightCulling.init = function () {
        console.log("lightCulling pass init");

        var gl = FPR.gl;

        // canvas pixel size
        var width = FPR.width;
        var height = FPR.height;
        numTileWidth = Math.ceil(width / tileSize);
        numTileHeight = Math.ceil(height / tileSize);
        numTile = numTileWidth * numTileHeight;

        var self = FPR.pass.lightCulling;

        var tileLightsTexture = self.tileLightsTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, tileLightsTexture); 
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, numTileWidth, numTileHeight, 0, gl.RGB, gl.FLOAT, new Float32Array(numTile * 3));       
        //gl.uniform1i(gl.getUniformLocation(program, "u_LightGridtex"),4); 
        gl.bindTexture(gl.TEXTURE_2D, null); 

        var tileFrustumPlanesTexture = self.tileFrustumPlanesTexture = gl.createTexture();
    };


    // per frame update
    
    FPR.pass.lightCulling.fboBind = function () {
        var gl = FPR.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, FPR.pass.depthPrepass.framebuffer);
    };

    


})();