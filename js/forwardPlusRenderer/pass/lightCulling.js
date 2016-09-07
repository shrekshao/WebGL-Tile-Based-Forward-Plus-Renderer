var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;


    FPR.pass.lightCulling.init = function () {
        console.log("lightCulling pass setup init");

        var gl = FPR.gl;
        var width = FPR.width;
        var height = FPR.height;

        var self = FPR.pass.lightCulling;

        var scatterTexture = FPR.pass.lightCulling.scatterTexture = gl.createTexture();
    }






    FPR.pass.lightCulling.fboInit = function () {
        console.log("lightCulling FBO Init");

        var gl = FPR.gl;
        var width = FPR.width;
        var height = FPR.height;

        var self = FPR.pass.lightCulling;

        
    }
    
    FPR.pass.lightCulling.fboBind = function () {
        var gl = FPR.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, FPR.pass.depthPrepass.framebuffer);
    }

    


})();