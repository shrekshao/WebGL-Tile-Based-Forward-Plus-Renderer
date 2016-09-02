var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;

    var pass = FPR.pass = {
        depthPrepass: {},
        lightCulling: {},
        lightAccumulation: {}, 

        forward: {}
    };

    var curPass = FPR.curPass = FPR.pass.forward;


    // var renderer;
    // var model;
    // var scene;

    // Use Three.js camera and controls implementation
    // grab
    var camera;
    var controls;

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
        width = canvas.width;
        height = canvas.height;

        gl = FPR.gl = canvas.getContext( 'webgl', { antialias: true } );

        gl.clearColor(0, 0, 0, 1);
        gl.enable(gl.DEPTH_TEST);

        FPR.initShaders();
        FPR.initStats();
        FPR.initLights();



        camera = new THREE.PerspectiveCamera(
            45,             // Field of view
            width / height, // Aspect ratio
            1.0,            // Near plane
            100             // Far plane
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
        var url = 'models/2_cylinder_engine/2_cylinder_engine.gltf';
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

            // draw
            gl.drawElements(p.gltf.mode, p.gltf.indices.length, p.gltf.indicesComponentType, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
        }
    }





    FPR.pass.depthPrepass.render = function () {

    }
    
    




    

    var update = function() {
        // get mouse input info from Three::Controls
        controls.update();

        // update camera 
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse(camera.matrixWorld);   // viewMatrix

        mat4.multiply(MV, viewMatrix, modelMatrix);
        

        //cameraMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);


        FPR.stats.end();
        FPR.stats.begin();

        //curPass.render();
        render(curPass);

        //if (!aborted) {
            requestAnimationFrame(update);
        //}
    };



    globalInitHandlers.push(FPR.init);

    //globalInitHandlers.push(FPR.render);
    
})();
