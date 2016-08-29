var globalInitHandlers = [];

(function() {
    'use strict';

    window.onload = function() {
        for (var i = 0; i < globalInitHandlers.length; i++) {
            globalInitHandlers[i]();
        }
    };
})();