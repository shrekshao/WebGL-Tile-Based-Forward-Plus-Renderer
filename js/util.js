var glTFLoader = new THREE.glTFLoader;

function loadGLTF(url, callback) {
    glTFLoader.load(url, callback);
}