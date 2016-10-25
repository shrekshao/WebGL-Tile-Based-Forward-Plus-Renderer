var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;
    FPR.shader = {};
    

    // TODO: didn't find Kai's code that is checking shaders are all loaded
    // Should add that

    var numRequest = 0;
    var numLoaded = 0;

    var loadShaderProgram = FPR.shader.loadShaderProgram = (function() {

        var gl = FPR.gl;

        var compileShader = function(gl, shaderSource, shaderType) {
            var shader = gl.createShader(shaderType);
            gl.shaderSource(shader, shaderSource);
            gl.compileShader(shader);
            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error(shaderSource);
                abort('shader compiler error:\n' + gl.getShaderInfoLog(shader));
            }

            return shader;
        };

        var linkShader = function(gl, vs, fs) {
            var prog = gl.createProgram();
            gl.attachShader(prog, vs);
            gl.attachShader(prog, fs);
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
                abort('shader linker error:\n' + gl.getProgramInfoLog(prog));
            }
            return prog;
        };

        return function(gl, urlVS, urlFS, callback) {
            return Promise.all([$.get(urlVS), $.get(urlFS)]).then(
                function(results) {
                    var vs = results[0], fs = results[1];
                    vs = compileShader(gl, vs, gl.VERTEX_SHADER);
                    fs = compileShader(gl, fs, gl.FRAGMENT_SHADER);
                    return linkShader(gl, vs, fs);
                }).then(callback).catch(abort);
        };
    })();
    

    FPR.shader.init = function () {
        var gl = FPR.gl;

        // Forward
        loadShaderProgram(gl, 'glsl/forward.vert.glsl', 'glsl/forward.frag.glsl',
            function(prog) {

                // our current operating pass
                var p = FPR.pass.forward;

                p.program = prog;

                // Retrieve the uniform and attribute locations
                p.u_modelViewMatrix = gl.getUniformLocation(prog, 'u_modelViewMatrix');
                p.u_inverseTransposeModelViewMatrix = gl.getUniformLocation(prog, 'u_inverseTransposeModelViewMatrix');
                p.u_projectionMatrix    = gl.getUniformLocation(prog, 'u_projectionMatrix');

                p.a_position  = gl.getAttribLocation(prog, 'a_position');
                p.a_normal    = gl.getAttribLocation(prog, 'a_normal');
                p.a_uv        = gl.getAttribLocation(prog, 'a_uv');

                console.log("Shader Loaded: Forward");

            });

        
        // Depth prepass
        loadShaderProgram(gl, 'glsl/depthPrepass.vert.glsl', 'glsl/depthPrepass.frag.glsl',
            function(prog) {

                // our current operating pass
                var p = FPR.pass.depthPrepass;

                p.program = prog;

                // Retrieve the uniform and attribute locations
                p.u_modelViewMatrix = gl.getUniformLocation(prog, 'u_modelViewMatrix');
                p.u_inverseTransposeModelViewMatrix = gl.getUniformLocation(prog, 'u_inverseTransposeModelViewMatrix');
                p.u_projectionMatrix    = gl.getUniformLocation(prog, 'u_projectionMatrix');

                p.a_position  = gl.getAttribLocation(prog, 'a_position');
                //p.a_normal    = gl.getAttribLocation(prog, 'a_normal');
                //p.a_uv        = gl.getAttribLocation(prog, 'a_uv');

                console.log("Shader Loaded: DepthPrepass");

            });

        // Depth debug
        loadShaderProgram(gl, 'glsl/depthDebug.vert.glsl', 'glsl/depthDebug.frag.glsl',
            function(prog) {

                // our current operating pass
                var p = FPR.pass.depthDebug;

                p.program = prog;

                // Retrieve the uniform and attribute locations
                
                p.u_sampler2D = gl.getUniformLocation(prog, 'u_depthTexture');
                // p.u_near = gl.getUniformLocation(prog, 'u_near');
                // p.u_far = gl.getUniformLocation(prog, 'u_far');

                p.a_position  = gl.getAttribLocation(prog, 'a_position');
                p.a_uv        = gl.getAttribLocation(prog, 'a_uv');

                console.log("Shader Loaded: DepthDebug");

            });


        // light Culling
        loadShaderProgram(gl, 'glsl/lightCulling.vert.glsl', 'glsl/lightCulling.frag.glsl',
            FPR.pass.lightCulling.loadShaderProgramCallback);

        // light Accumulation
        loadShaderProgram(gl, 'glsl/lightAccumulation.vert.glsl', 'glsl/lightAccumulation.frag.glsl',
            FPR.pass.lightAccumulation.loadShaderProgramCallback);

    }

})();