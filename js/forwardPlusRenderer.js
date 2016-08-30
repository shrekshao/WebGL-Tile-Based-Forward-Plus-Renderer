var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;


    var renderer;
    var model;
    var scene;
    var camera;
    var controls;

    var width;
    var height;

    var resize = FPR.resize = function() {
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        render();
    };

    var stats;
    function _initStats() {
        stats = new Stats();
        stats.setMode(0); // 0: fps, 1: ms, 2: mb
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }


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

    var defaultVS = "\
        void main() {\
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);\
        }\
    ";

    var testFS = "\
        void main() {\
            gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\
        }\
    ";

    
    /**
     * 
     */
    var init = FPR.init = function (params) {

        console.log("Forward+ Renderer init");

        _initStats();

        // use static canvas size for uniform profiling results on different screen size
        var canvas = document.getElementById('canvas');
        width = canvas.width;
        height = canvas.height;

        renderer = new THREE.WebGLRenderer({
            antialias: true, 
            canvas: canvas
        });

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(
            45,             // Field of view
            width / height, // Aspect ratio
            1.0,            // Near plane
            100             // Far plane
        );
        camera.position.set(-15.5, 1, -1);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.enableZoom = true;
        controls.target.set(0, 4, 0);
        controls.rotateSpeed = 0.3;
        controls.zoomSpeed = 1.0;
        controls.panSpeed = 2.0;


        // TEMP TEST: lights
        var testLight = new THREE.PointLight(0xff0000, 2, 100);
        testLight.position.set(1, 1.5, 2);
        scene.add(testLight);


        // TEST: custom program (default vertex + custom fragment)
        var material = new THREE.ShaderMaterial({
            vertexShader: defaultVS,
            fragmentShader: testFS
        });



        // init scene with gltf model
        var url = "models/glTF-duck-MaterialsCommon/duck.gltf";
        //var url = "models/glTF-duck/duck.gltf";
        glTFLoader.load(url, function (gltf) {
            scene.add(gltf.scene);


            //render();
            update();
        });
    };

    var render = FPR.render = function () {
        //if (renderer) {
            renderer.render(scene, camera);
        //}
        
    };

    var update = function() {
        controls.update();

        //THREE.glTFShaders.update(scene, camera);

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