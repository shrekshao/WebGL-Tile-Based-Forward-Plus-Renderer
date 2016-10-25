var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    var lightPositionBuffer;

    FPR.pass.lightDebug.init = function () {
        var gl = FPR.gl;

        lightPositionBuffer = FPR.pass.lightDebug.lightPositionBuffer = gl.createBuffer();
        // gl.bindBuffer(gl.ARRAY_BUFFER, lightPositionBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER, lightPositionBuffer, gl.DYNAMIC_DRAW);
        // gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };


    FPR.pass.lightDebug.loadShaderProgramCallback = function (prog) {
        var gl = FPR.gl;

        // our current operating pass
        var p = FPR.pass.lightDebug;

        p.program = prog;

        // Retrieve the uniform and attribute locations

        p.u_viewMatrix = gl.getUniformLocation(prog, 'u_viewMatrix');
        p.u_projectionMatrix = gl.getUniformLocation(prog, 'u_projectionMatrix');

        p.a_position  = gl.getAttribLocation(prog, 'a_position');

        console.log("Shader Loaded: lightDebug");
    };


    FPR.pass.lightDebug.render = function () {
        var gl = FPR.gl;

        gl.useProgram(this.program);
        gl.disable(gl.DEPTH_TEST);

        gl.uniformMatrix4fv(this.u_viewMatrix, false, FPR.camera.matrixWorldInverse.elements);
        gl.uniformMatrix4fv(this.u_projectionMatrix, false, FPR.camera.projectionMatrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, lightPositionBuffer);

        gl.bufferData(gl.ARRAY_BUFFER, FPR.light.position, gl.DYNAMIC_DRAW);

        gl.enableVertexAttribArray(this.a_position);
        gl.vertexAttribPointer(this.a_position, 3, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.POINTS, 0, FPR.NUM_LIGHTS);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.enable(gl.DEPTH_TEST);
    };
    
})();