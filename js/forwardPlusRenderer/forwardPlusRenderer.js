var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    var pass = FPR.pass = FPR.pass || {
        depthPrepass: {},
        depthDebug: {},
        lightCulling: {},
        lightAccumulation: {}, 

        forward: {}
    };

    FPR.glTextureId = {
        depth: 4, 

        lightIndex: 5,
        lightPosition: 6,
        lightColorRadius: 7,

        tileLights: 8,
        tileFrustumPlanes: 9
    };

    // // var curPass = FPR.curPass = FPR.pass.forward;
    // var modes = ["forward", "depth-debug", "forward+"];
    // var mode = "depth-debug"; 

    

    var quadPositions = new Float32Array([
        -1.0, -1.0,
        1.0, -1.0,
        1.0,  1.0,
        1.0,  1.0,
        -1.0,  1.0,
        -1.0, -1.0
    ]);

    var quadUVs = new Float32Array([
        // 0.0, 1.0,
        // 1.0, 1.0,
        // 1.0, 0.0,
        // 1.0, 0.0,
        // 0.0, 0.0,
        // 0.0, 1.0
        
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0, 
        1.0, 1.0, 
        0.0, 1.0, 
        0.0, 0.0
    ]);

    var quadPositionBuffer;
    var quadUVBuffer;


    // var renderer;
    // var model;
    // var scene;

    // Use Three.js camera and controls implementation
    // grab
    var camera;
    var controls;

    var near = 1;
    var far = 1000;

    var projectionMatrix;
    var viewMatrix;
    var modelMatrix = mat4.create();

    var MV = mat4.create();
    var MVNormal = mat3.create();

    // temp test
    modelMatrix[0] = 0.01;
    modelMatrix[5] = 0.01;
    modelMatrix[10] = 0.01;


    var canvas;
    var width;
    var height;

    var gl;

    var resize = FPR.resize = function() {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        //renderer.setSize(width, height);
        render();
    };

    // stats.js
    var stats;


    
    /**
     * Global init
     */
    var init = FPR.init = function (params) {

        console.log("Forward+ Renderer init");

        // use static canvas size for uniform profiling results on different screen size
        canvas = document.getElementById('canvas');
        width = FPR.width = canvas.width;
        height = FPR.height = canvas.height;
        
        // static, shouldn't change 
        //var useWebGL2 = FPR.useWebGL2 = true;
        var useWebGL2 = FPR.useWebGL2 = false;

        if (useWebGL2) {
            gl = FPR.gl = canvas.getContext( 'webgl2', { antialias: true } );
        } else {
            gl = FPR.gl = canvas.getContext( 'webgl', { antialias: true } );
        }
        

        if (!useWebGL2) {
            // get WEBGL_Depth_Texture extension
            var depthTextureExt = gl.getExtension("WEBKIT_WEBGL_depth_texture");

            if(!depthTextureExt) { 
                abort("depth texture not supported in current browser!");
                return; 
            }

            gl.getExtension('OES_texture_float_linear');
            gl.getExtension('OES_texture_float');
        }


        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);
        
        // // test alpha blend
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE);


        FPR.shader.init();
        FPR.stats.init();
        FPR.light.init();

        FPR.pass.depthPrepass.init();
        FPR.pass.lightCulling.init();


        // renderFullQuad buffer init
        quadPositionBuffer = FPR.quadPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, quadPositions, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        quadUVBuffer = FPR.quadUVBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, quadUVBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, quadUVs, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);



        // Three.js camera and control module init
        // We only borrow its mouse control input and camera transformation matrix
        // We are not using the Three.js scene for rendering

        camera = FPR.camera = new THREE.PerspectiveCamera(
            45,             // Field of view
            width / height, // Aspect ratio
            near,            // Near plane
            far             // Far plane
        );
        camera.position.set(-15.5, 1, -1);
        projectionMatrix = camera.projectionMatrix.elements;
        viewMatrix = camera.matrixWorldInverse.elements;


        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.enableZoom = true;
        controls.target.set(0, 0, 0);
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 1.0;
        controls.panSpeed = 2.0;


        // init scene with gltf model
        //var url = "models/glTF-duck-MaterialsCommon/duck.gltf";
        //var url = "models/glTF-duck/duck.gltf";
        // var url = 'models/2_cylinder_engine/2_cylinder_engine.gltf';
        var url = 'models/gltf-sponza-ao/separate/sponza.gltf';
        FPR.scene.loadGLTF(url, function (gltf) {


            update();
        });


    };


    var localMV = mat4.create();


    var render = FPR.render = function (pass) {
        // use program
        gl.useProgram(pass.program);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // uniform: projection Matrix
        gl.uniformMatrix4fv(pass.u_projectionMatrix, false, projectionMatrix);

        var i, p;
        var scene = FPR.scene;

        for (i = 0; i < scene.primitives.length; i++) {
            p = scene.primitives[i];

            // TODO: optimize for only one primitive: bind buffer only once

            // model matrix for multi hierachy glTF
            mat4.multiply(localMV, MV, p.matrix);
            gl.uniformMatrix4fv(pass.u_modelViewMatrix, false, localMV);

            mat3.fromMat4(MVNormal, localMV);
            mat3.invert(MVNormal, MVNormal);
            mat3.transpose(MVNormal, MVNormal);
            gl.uniformMatrix3fv(pass.u_inverseTransposeModelViewMatrix, false, MVNormal);



            // bind buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, p.attributesBuffer);

            if (pass.a_position !== undefined) {
                gl.enableVertexAttribArray(pass.a_position);
                gl.vertexAttribPointer(pass.a_position, p.posInfo.size, p.posInfo.type, false, p.posInfo.stride, p.posInfo.offset);
            }
            
            if (pass.a_normal !== undefined) {
                gl.enableVertexAttribArray(pass.a_normal);
                gl.vertexAttribPointer(pass.a_normal, p.norInfo.size, p.norInfo.type, false, p.norInfo.stride, p.norInfo.offset);
            }
            
            if (pass.a_uv !== undefined) {
                gl.enableVertexAttribArray(pass.a_uv);
                gl.vertexAttribPointer(pass.a_uv, p.uvInfo.size, p.uvInfo.type, false, p.uvInfo.stride, p.uvInfo.offset);
            }


            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.indicesBuffer);


            if (pass.fboBind !== undefined) {
                pass.fboBind();
            }

            // draw
            gl.drawElements(p.gltf.mode, p.gltf.indices.length, p.gltf.indicesComponentType, 0);

            if (pass.fboBind !== undefined) {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    };

    var uniformDirty = true;
    var renderFullQuad = FPR.renderFullQuad = function (pass, texture, tid) {
        // use program
        gl.useProgram(pass.program);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.activeTexture(gl.TEXTURE0 + tid);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (uniformDirty) {
            uniformDirty = false;

            if (pass.u_sampler2D !== undefined) {
                gl.uniform1i(pass.u_sampler2D, tid);
            }

            // if (pass.u_near !== undefined) {
            //     gl.uniform1f(pass.u_near, near);
            // }

            // if (pass.u_far !== undefined) {
            //     gl.uniform1f(pass.u_far, far);
            // }
        }
        


        gl.bindBuffer(gl.ARRAY_BUFFER, quadPositionBuffer);
        if (pass.a_position !== undefined) {
            gl.enableVertexAttribArray(pass.a_position);
            gl.vertexAttribPointer(pass.a_position, 2, gl.FLOAT, false, 0, 0);
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, quadUVBuffer);
        if (pass.a_uv !== undefined) {
            gl.enableVertexAttribArray(pass.a_uv);
            gl.vertexAttribPointer(pass.a_uv, 2, gl.FLOAT, false, 0, 0);
        }

        gl.drawArrays(gl.TRIANGLES, 0, 6);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    };




    // ------ Render pipeline function objects ---------------

    var depthDebugPipeline = function() {
        gl.bindFramebuffer(gl.FRAMEBUFFER, FPR.pass.depthPrepass.framebuffer);
        render(FPR.pass.depthPrepass);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        renderFullQuad(FPR.pass.depthDebug, FPR.pass.depthPrepass.depthTexture, FPR.glTextureId.depth);
    };

    var forwardPipeline = function() {
        render(FPR.pass.forward);
    };

    var forwardPlusPipeline = function() {

        // depth prepass
        gl.bindFramebuffer(gl.FRAMEBUFFER, FPR.pass.depthPrepass.framebuffer);
        render(FPR.pass.depthPrepass);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        FPR.pass.lightCulling.execute();

        // render(FPR.pass.lightAccumulation);
    };

    // pipeline function handler
    // var curPipeline = forwardPlusPipeline;
    var curPipeline = forwardPipeline;

    // ----------------------------------------------------


    var update = function() {

        FPR.stats.end();

        // get mouse input info from Three::Controls
        controls.update();

        // update camera 
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse(camera.matrixWorld);   // viewMatrix
        mat4.multiply(MV, viewMatrix, modelMatrix);
        
        // update lights and light buffers (Texture if using WebGL 1)
        FPR.light.update();

        // execute render pipeline
        curPipeline();

        FPR.stats.begin();

        //if (!aborted) {
            requestAnimationFrame(update);
        //}
    };



    globalInitHandlers.push(FPR.init);

    //globalInitHandlers.push(FPR.render);
    
})();
