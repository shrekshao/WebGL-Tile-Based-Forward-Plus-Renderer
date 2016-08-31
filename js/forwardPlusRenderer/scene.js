var ForwardPlusRenderer = ForwardPlusRenderer || {};
(function() {
    'use strict';

    var FPR = ForwardPlusRenderer;
    var scene = ForwardPlusRenderer.scene = {};
    var primitives = scene.primitives = [];

    var glTFLoader;

    scene.loadGLTF = function (url, callback) {

        var gl = FPR.gl;

        glTFLoader = new MinimalGLTFLoader.glTFLoader(gl);

        glTFLoader.loadGLTF(url, function (glTF) {
            var curScene = glTF.scenes[glTF.defaultScene];

            var webGLTextures = {};

            // temp var
            var i,len;
            var primitiveOrderID;

            var mesh;
            var primitive;
            var vertexBuffer;
            var indicesBuffer;


            // textures setting
            var textureID = 0;
            var textureInfo;
            var samplerInfo;
            var target, format, internalFormat, type;   // texture info
            var magFilter, minFilter, wrapS, wrapT;
            var image;
            var texture;


            // temp
            var colorTextureID;

            // textures
            for (var tid in glTF.json.textures) {

                //temp
                colorTextureID = tid;

                textureInfo = glTF.json.textures[tid];
                target = textureInfo.target || gl.TEXTURE_2D;
                format = textureInfo.format || gl.RGBA;
                internalFormat = textureInfo.format || gl.RGBA;
                type = textureInfo.type || gl.UNSIGNED_BYTE;

                image = glTF.images[textureInfo.source];

                texture = gl.createTexture();
                gl.activeTexture(gl.TEXTURE0 + textureID);
                gl.bindTexture(target, texture);

                // TODO: use handler to store this kind of functions
                // {TEXTURE_2D: gl.texImage2D}
                switch(target) {
                    case 3553: // gl.TEXTURE_2D
                    gl.texImage2D(target, 0, internalFormat, format, type, image);
                    break;
                    // TODO
                }

                // !! Sampler
                // raw WebGL 1, no sampler object, set magfilter, wrapS, etc
                samplerInfo = glTF.json.samplers[textureInfo.sampler];
                minFilter = samplerInfo.minFilter || gl.NEAREST_MIPMAP_LINEAR;
                magFilter = samplerInfo.magFilter || gl.LINEAR;
                wrapS = samplerInfo.wrapS || gl.REPEAT;
                wrapT = samplerInfo.wrapT || gl.REPEAT;
                gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, magFilter);
                gl.texParameteri(target, gl.TEXTURE_WRAP_S, wrapS);
                gl.texParameteri(target, gl.TEXTURE_WRAP_T, wrapT);
                if (minFilter == gl.NEAREST_MIPMAP_NEAREST || 
                    minFilter == gl.NEAREST_MIPMAP_LINEAR || 
                    minFilter == gl.LINEAR_MIPMAP_NEAREST ||
                    minFilter == gl.LINEAR_MIPMAP_LINEAR ) {
                        gl.generateMipmap(target);
                }


                gl.bindTexture(target, null);

                webGLTextures[tid] = {
                    texture: texture,
                    target: target,
                    id: textureID
                };

                textureID++;
            }


            // vertex attributes
            for (var mid in curScene.meshes) {
                mesh = curScene.meshes[mid];

                for (i = 0, len = mesh.primitives.length; i < len; ++i) {
                    primitive = mesh.primitives[i];

                    // assume interleaved, has element buffer
                    vertexBuffer = gl.createBuffer();
                    indicesBuffer = gl.createBuffer();

                    // initialize buffer
                    var vertices = primitive.vertexBuffer;
                    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
                    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);

                    var indices = primitive.indices;
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesBuffer);
                    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
                    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

                    // assume they all has such properties
                    var posInfo = primitive.attributes[primitive.technique.parameters['position'].semantic];
                    var norInfo = primitive.attributes[primitive.technique.parameters['normal'].semantic];
                    //var uvInfo = primitive.attributes[primitive.technique.parameters['texcoord0'].semantic];
                    var uvInfo = primitive.technique.parameters['texcoord0'] 
                        ? primitive.attributes[primitive.technique.parameters['texcoord0'].semantic] 
                        : {size: 3, type: posInfo.type, stride: 0, offset: 0};

                    var colmap = webGLTextures[colorTextureID] ? webGLTextures[colorTextureID].texture : null;

                    primitives.push({
                        gltf: primitive,

                        indicesBuffer: indicesBuffer,
                        numIndices: indices.length,


                        attributesBuffer: vertexBuffer,
                        // posInfo: {size: posInfo.size, type: posInfo.type, stride: posInfo.stride, offset: posInfo.offset},
                        // norInfo: {size: norInfo.size, type: norInfo.type, stride: norInfo.stride, offset: norInfo.offset},
                        // uvInfo: {size: uvInfo.size, type: uvInfo.type, stride: uvInfo.stride, offset: uvInfo.offset},
                        posInfo: posInfo,
                        norInfo: norInfo, 
                        uvInfo: uvInfo,

                        // specific textures temp test
                        //colmap: webGLTextures[colorTextureID].texture,
                        colmap: colmap,
                        //,normap: tex2

                        matrix: primitive.matrix
                    });

                }

            }


            callback(glTF);
        });

    }


})();