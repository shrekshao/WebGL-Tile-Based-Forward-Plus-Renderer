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


    // var renderer;
    // var model;
    // var scene;

    // Use Three.js camera and controls implementation
    // grab
    var camera;
    var controls;

    var canvas;
    var width;
    var height;

    var gl;

    var resize = FPR.resize = function() {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        render();
    };

    // stats.js
    var stats = FPR.stats;


    // Lights

    // TODO: Edit if you want to change the light initial positions
    var light = FPR.lights = [];

    FPR.light_min = [-14, 0, -6];
    FPR.light_max = [14, 18, 6];
    FPR.light_dt = -0.03;
    FPR.LIGHT_RADIUS = 4.0;
    FPR.NUM_LIGHTS = 20; // TODO: test with MORE lights!
    
    function _initLights() {
        Math.seedrandom(0);

        var posfn = function() {
            var r = [0, 0, 0];
            for (var i = 0; i < 3; i++) {
                var mn = FPR.light_min[i];
                var mx = FPR.light_max[i];
                r[i] = Math.random() * (mx - mn) + mn;
            }
            return r;
        };

        for (var i = 0; i < FPR.NUM_LIGHTS; i++) {
            lights.push({
                pos: posfn(),
                col: [
                    1 + Math.random(),
                    1 + Math.random(),
                    1 + Math.random()],
                rad: FPR.LIGHT_RADIUS
            });
        }
    }


    
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

        FPR.initShaders();
        FPR.initStats();

        

        camera = new THREE.PerspectiveCamera(
            45,             // Field of view
            width / height, // Aspect ratio
            1.0,            // Near plane
            100             // Far plane
        );
        camera.position.set(-15.5, 1, -1);

        controls = new THREE.OrbitControls(camera, canvas);
        controls.enableDamping = true;
        controls.enableZoom = true;
        controls.target.set(0, 0, 0);
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 1.0;
        controls.panSpeed = 2.0;



        // init scene with gltf model
        //var url = "models/glTF-duck-MaterialsCommon/duck.gltf";
        var url = "models/glTF-duck/duck.gltf";
        FPR.scene.loadGLTF(url, function (gltf) {


            update();
        });




        // load shaders

    };

    var render = FPR.render = function () {

    };

    var update = function() {
        // get mouse input info from Three::Controls
        controls.update();

        // update camera 
        camera.updateMatrixWorld();
        camera.matrixWorldInverse.getInverse(camera.matrixWorld);   // viewMatrix
        cameraMat.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);


        stats.end();
        stats.begin();

        render();

        //if (!aborted) {
            requestAnimationFrame(update);
        //}
    };



    globalInitHandlers.push(FPR.init);

    //globalInitHandlers.push(FPR.render);
    
})();
