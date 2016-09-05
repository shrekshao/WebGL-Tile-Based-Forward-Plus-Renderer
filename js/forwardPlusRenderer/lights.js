var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;
    FPR.light = {};

    // Lights

    // TODO: Edit if you want to change the light initial positions
    var lights = FPR.light.lights = [];

    var light_min = [-14, 0, -6];
    var light_max = [14, 18, 6];
    var light_dt = -0.03;
    var LIGHT_RADIUS = 4.0;
    var NUM_LIGHTS = 20; // TODO: test with MORE lights!
    
    FPR.light.init = function () {
        Math.seedrandom(0);

        var posfn = function() {
            var r = [0, 0, 0];
            for (var i = 0; i < 3; i++) {
                var mn = light_min[i];
                var mx = light_max[i];
                r[i] = Math.random() * (mx - mn) + mn;
            }
            return r;
        };

        for (var i = 0; i < NUM_LIGHTS; i++) {
            lights.push({
                pos: posfn(),
                col: [
                    1 + Math.random(),
                    1 + Math.random(),
                    1 + Math.random()],
                rad: LIGHT_RADIUS
            });
        }

        //var lightUniformBuffer = FPR.lightUniformBuffer = gl.createBuffer();

    }

    FPR.light.update = function () {

    }



    


})();