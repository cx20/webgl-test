const { mat4, mat3, vec3 } = glMatrix;

// Load glTF/GLB
const modelInfoSet = [
    {
        name: "CesiumMilkTruck",
        scale: 0.4,
        rotation: [0, Math.PI / 2, 0],
        position: [0, 0, -2],
        url: "https://cx20.github.io/gltf-test/sampleModels/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf"
    }, {
        name: "Fox",
        scale: 0.05,
        rotation: [0, Math.PI / 2, 0],
        position: [0, 0, 0],
        url: "https://cx20.github.io/gltf-test/sampleModels/Fox/glTF/Fox.gltf"
    }, {
        name: "Rex",
        scale: 1.0,
        rotation: [0, Math.PI / 2, 0],
        position: [0, 0, 3],
        url: "https://raw.githubusercontent.com/BabylonJS/Exporters/d66db9a7042fef66acb62e1b8770739463b0b567/Maya/Samples/glTF%202.0/T-Rex/trex.gltf"
    }
];

// ========== WebGL Helpers ==========

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader error:', gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

function createProgram(gl, vsSource, fsSource) {
    const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// ========== CubeMap Loader ==========

function loadCubeMap(gl, urls) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);

    const faces = [
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_X, url: urls[0] },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_X, url: urls[1] },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Y, url: urls[2] },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, url: urls[3] },
        { target: gl.TEXTURE_CUBE_MAP_POSITIVE_Z, url: urls[4] },
        { target: gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, url: urls[5] },
    ];

    faces.forEach(face => {
        gl.texImage2D(face.target, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    });

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    const promises = faces.map(face => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                resolve();
            };
            img.onerror = reject;
            img.src = face.url;
        });
    });

    return Promise.all(promises).then(() => texture);
}

// ========== glTF/GLB Loader (変更なし) ==========
async function loadGLTF(url) {
    const response = await fetch(url);
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    
    const contentType = response.headers.get('content-type');
    const isGLB = url.endsWith('.glb') || (contentType && contentType.includes('model/gltf-binary'));
    
    if (isGLB) {
        const buffer = await response.arrayBuffer();
        return parseGLB(buffer, baseUrl);
    } else {
        const gltf = await response.json();
        return parseGLTF(gltf, baseUrl);
    }
}

async function parseGLTF(gltf, baseUrl) {
    const buffers = [];
    if (gltf.buffers) {
        for (const buffer of gltf.buffers) {
            if (buffer.uri) {
                const bufferUrl = new URL(buffer.uri, baseUrl).href;
                const response = await fetch(bufferUrl);
                const arrayBuffer = await response.arrayBuffer();
                buffers.push(new Uint8Array(arrayBuffer));
            }
        }
    }
    return { gltf, buffers, baseUrl };
}

function parseGLB(buffer, baseUrl) {
    const dataView = new DataView(buffer);
    const magic = dataView.getUint32(0, true);
    const version = dataView.getUint32(4, true);
    const length = dataView.getUint32(8, true);
    
    if (magic !== 0x46546C67) throw new Error('Invalid GLB file');
    
    let offset = 12;
    const jsonChunkLength = dataView.getUint32(offset, true);
    offset += 8;
    const jsonData = new Uint8Array(buffer, offset, jsonChunkLength);
    const jsonStr = new TextDecoder().decode(jsonData);
    const gltf = JSON.parse(jsonStr);
    offset += jsonChunkLength;
    
    const buffers = [];
    if (offset < length) {
        const binChunkLength = dataView.getUint32(offset, true);
        offset += 8;
        buffers.push(new Uint8Array(buffer, offset, binChunkLength));
    }
    return { gltf, buffers, baseUrl };
}

// ========== glTF Data Extraction ==========
function getAccessorData(gltf, buffers, accessorIndex) {
    const accessor = gltf.accessors[accessorIndex];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const bufferIndex = bufferView.buffer || 0;
    const binData = buffers[bufferIndex];
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const count = accessor.count;
    
    const componentTypes = {
        5120: Int8Array, 5121: Uint8Array, 5122: Int16Array,
        5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array
    };
    const numComponents = { 'SCALAR': 1, 'VEC2': 2, 'VEC3': 3, 'VEC4': 4, 'MAT4': 16 };
    
    const TypedArray = componentTypes[accessor.componentType];
    const components = numComponents[accessor.type];
    const byteStride = bufferView.byteStride || 0;
    
    if (byteStride && byteStride !== components * TypedArray.BYTES_PER_ELEMENT) {
        const result = new TypedArray(count * components);
        const elementSize = TypedArray.BYTES_PER_ELEMENT;
        for (let i = 0; i < count; i++) {
            const srcOffset = byteOffset + i * byteStride;
            for (let j = 0; j < components; j++) {
                const view = new DataView(binData.buffer, binData.byteOffset + srcOffset + j * elementSize, elementSize);
                if (TypedArray === Float32Array) result[i * components + j] = view.getFloat32(0, true);
                else if (TypedArray === Uint16Array) result[i * components + j] = view.getUint16(0, true);
                else if (TypedArray === Uint32Array) result[i * components + j] = view.getUint32(0, true);
            }
        }
        return result;
    }
    return new TypedArray(binData.buffer, binData.byteOffset + byteOffset, count * components);
}

function isPowerOf2(value) {
    return (value & (value - 1)) === 0;
}

function loadTextureFromGLTF(gl, gltf, buffers, baseUrl, textureIndex) {
    const texture = gltf.textures[textureIndex];
    const image = gltf.images[texture.source];
    
    const glTexture = gl.createTexture();
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    return new Promise((resolve) => {
        img.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            
            if (isPowerOf2(img.width) && isPowerOf2(img.height)) {
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            } else {
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            resolve(glTexture);
        };
        
        if (image.uri) {
            img.src = new URL(image.uri, baseUrl).href;
        } else if (image.bufferView !== undefined) {
            const bufferView = gltf.bufferViews[image.bufferView];
            const bufferIndex = bufferView.buffer || 0;
            const binData = buffers[bufferIndex];
            const byteOffset = bufferView.byteOffset || 0;
            const byteLength = bufferView.byteLength;
            const imageData = new Uint8Array(binData.buffer, binData.byteOffset + byteOffset, byteLength);
            const blob = new Blob([imageData], { type: image.mimeType });
            img.src = URL.createObjectURL(blob);
        }
    });
}

// ========== Mesh Processing & Helpers (変更なし) ==========
function calculateBoundingBox(positions) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < positions.length; i += 3) {
        min[0] = Math.min(min[0], positions[i]);
        min[1] = Math.min(min[1], positions[i + 1]);
        min[2] = Math.min(min[2], positions[i + 2]);
        max[0] = Math.max(max[0], positions[i]);
        max[1] = Math.max(max[1], positions[i + 1]);
        max[2] = Math.max(max[2], positions[i + 2]);
    }
    return { min, max };
}

function mergeBoundingBoxes(a, b) {
    return {
        min: [Math.min(a.min[0], b.min[0]), Math.min(a.min[1], b.min[1]), Math.min(a.min[2], b.min[2])],
        max: [Math.max(a.max[0], b.max[0]), Math.max(a.max[1], b.max[1]), Math.max(a.max[2], b.max[2])]
    };
}

async function processMesh(gl, extVAO, gltf, buffers, baseUrl, meshIndex) {
    const mesh = gltf.meshes[meshIndex];
    const primitives = [];
    
    for (const primitive of mesh.primitives) {
        const attrs = primitive.attributes;
        const positions = getAccessorData(gltf, buffers, attrs.POSITION);
        const normals = attrs.NORMAL !== undefined ? getAccessorData(gltf, buffers, attrs.NORMAL) : null;
        const texCoords = attrs.TEXCOORD_0 !== undefined ? getAccessorData(gltf, buffers, attrs.TEXCOORD_0) : null;
        const indices = primitive.indices !== undefined ? getAccessorData(gltf, buffers, primitive.indices) : null;
        const bbox = calculateBoundingBox(positions);
        
        const vao = extVAO.createVertexArrayOES();
        extVAO.bindVertexArrayOES(vao);
        
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
        
        if (normals) {
            const normBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(1);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
        }
        
        if (texCoords) {
            const uvBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(2);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 0, 0);
        }
        
        let indexCount = positions.length / 3;
        let indexType = gl.UNSIGNED_SHORT;
        if (indices) {
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            indexCount = indices.length;
            indexType = indices instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT;
        }
        
        extVAO.bindVertexArrayOES(null);
        
        let texture = null;
        let baseColor = [1, 1, 1, 1];
        if (primitive.material !== undefined) {
            const material = gltf.materials[primitive.material];
            if (material.pbrMetallicRoughness) {
                const pbr = material.pbrMetallicRoughness;
                if (pbr.baseColorTexture) {
                    texture = await loadTextureFromGLTF(gl, gltf, buffers, baseUrl, pbr.baseColorTexture.index);
                }
                if (pbr.baseColorFactor) {
                    baseColor = pbr.baseColorFactor;
                }
            }
        }
        
        primitives.push({ vao, indexCount, indexType, hasIndices: indices !== null, texture, baseColor, bbox });
    }
    
    let combinedBbox = primitives[0].bbox;
    for (let i = 1; i < primitives.length; i++) combinedBbox = mergeBoundingBoxes(combinedBbox, primitives[i].bbox);
    return { primitives, bbox: combinedBbox };
}

function getNodeTransform(node) {
    const matrix = mat4.create();
    if (node.matrix) {
        mat4.copy(matrix, node.matrix);
    } else {
        const translation = node.translation || [0, 0, 0];
        const rotation = node.rotation || [0, 0, 0, 1];
        const scale = node.scale || [1, 1, 1];
        mat4.fromRotationTranslationScale(matrix, rotation, translation, scale);
    }
    return matrix;
}

// ========== Main ==========

async function main() {
    const canvas = document.getElementById('c');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    const extVAO = gl.getExtension('OES_vertex_array_object');
    if (!extVAO) { alert('OES_vertex_array_object not supported'); return; }
    
    const extUint = gl.getExtension('OES_element_index_uint');
    if (!extUint) { console.warn('OES_element_index_uint not supported. Large meshes may fail.'); }
    
    function resize() {
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);
    
    // ----------------------------------------------------------------
    // Setup Standard Model Program
    // ----------------------------------------------------------------
    const vsSource = document.getElementById('vs').textContent;
    const fsSource = document.getElementById('fs').textContent;
    const program = createProgram(gl, vsSource, fsSource);
    
    const loc = {
        aPosition: gl.getAttribLocation(program, 'aPosition'),
        aNormal: gl.getAttribLocation(program, 'aNormal'),
        aTexCoord: gl.getAttribLocation(program, 'aTexCoord'),
        uModelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
        uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
        uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        uNormalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
        uTexture: gl.getUniformLocation(program, 'uTexture'),
        uHasTexture: gl.getUniformLocation(program, 'uHasTexture'),
        uBaseColor: gl.getUniformLocation(program, 'uBaseColor'),
        uLightDir: gl.getUniformLocation(program, 'uLightDir')
    };

    // ----------------------------------------------------------------
    // Setup Skybox Program & Geometry
    // ----------------------------------------------------------------
    const sbVsSource = document.getElementById('vs-skybox').textContent;
    const sbFsSource = document.getElementById('fs-skybox').textContent;
    const sbProgram = createProgram(gl, sbVsSource, sbFsSource);

    const sbLoc = {
        aPosition: gl.getAttribLocation(sbProgram, 'aPosition'),
        uProjectionMatrix: gl.getUniformLocation(sbProgram, 'uProjectionMatrix'),
        uViewMatrix: gl.getUniformLocation(sbProgram, 'uViewMatrix'),
        uSkybox: gl.getUniformLocation(sbProgram, 'uSkybox'),
    };

    // Skybox Geometry
    const skyboxVertices = new Float32Array([
        -1,  1, -1, -1, -1, -1,  1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1,
        -1, -1,  1, -1, -1, -1, -1,  1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1,
         1, -1, -1,  1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1, -1,  1, -1, -1,
        -1, -1,  1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1, -1,  1, -1, -1,  1,
        -1,  1, -1,  1,  1, -1,  1,  1,  1,  1,  1,  1, -1,  1,  1, -1,  1, -1,
        -1, -1, -1, -1, -1,  1,  1, -1, -1,  1, -1, -1, -1, -1,  1,  1, -1,  1
    ]);
    
    const sbVao = extVAO.createVertexArrayOES();
    extVAO.bindVertexArrayOES(sbVao);
    const sbBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sbBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(sbLoc.aPosition);
    gl.vertexAttribPointer(sbLoc.aPosition, 3, gl.FLOAT, false, 0, 0);
    extVAO.bindVertexArrayOES(null);

    // ----------------------------------------------------------------
    // Load Resources
    // ----------------------------------------------------------------
    const allMeshData = [];
    let sceneBbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    
    // Load Skybox Texture
    const skyboxPath = 'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/';
    const skyboxFormat = '.jpg';
    const skyboxUrls = [
        skyboxPath + 'px' + skyboxFormat, skyboxPath + 'nx' + skyboxFormat,
        skyboxPath + 'py' + skyboxFormat, skyboxPath + 'ny' + skyboxFormat,
        skyboxPath + 'pz' + skyboxFormat, skyboxPath + 'nz' + skyboxFormat
    ];
    
    const skyboxTexturePromise = loadCubeMap(gl, skyboxUrls);

    // Load Models (as before)
    for (const modelInfo of modelInfoSet) {
        console.log(`Loading ${modelInfo.name}...`);
        const { gltf, buffers, baseUrl } = await loadGLTF(modelInfo.url);
        
        const scene = gltf.scenes[gltf.scene || 0];
        
        async function processNode(nodeIndex, parentMatrix) {
            const node = gltf.nodes[nodeIndex];
            const localMatrix = getNodeTransform(node);
            const worldMatrix = mat4.create();
            mat4.multiply(worldMatrix, parentMatrix, localMatrix);
            
            if (node.mesh !== undefined) {
                const { primitives, bbox } = await processMesh(gl, extVAO, gltf, buffers, baseUrl, node.mesh);
                
                const finalMatrix = mat4.create();
                mat4.translate(finalMatrix, finalMatrix, modelInfo.position);
                mat4.rotateY(finalMatrix, finalMatrix, modelInfo.rotation[1]);
                mat4.rotateX(finalMatrix, finalMatrix, modelInfo.rotation[0]);
                mat4.rotateZ(finalMatrix, finalMatrix, modelInfo.rotation[2]);
                mat4.scale(finalMatrix, finalMatrix, [modelInfo.scale, modelInfo.scale, modelInfo.scale]);
                mat4.multiply(finalMatrix, finalMatrix, worldMatrix);
                
                allMeshData.push({ primitives, matrix: finalMatrix });
                
                const corners = [
                    [bbox.min[0], bbox.min[1], bbox.min[2]], [bbox.max[0], bbox.min[1], bbox.min[2]],
                    [bbox.min[0], bbox.max[1], bbox.min[2]], [bbox.max[0], bbox.max[1], bbox.min[2]],
                    [bbox.min[0], bbox.min[1], bbox.max[2]], [bbox.max[0], bbox.min[1], bbox.max[2]],
                    [bbox.min[0], bbox.max[1], bbox.max[2]], [bbox.max[0], bbox.max[1], bbox.max[2]]
                ];
                for (const corner of corners) {
                    const transformed = vec3.transformMat4(vec3.create(), corner, finalMatrix);
                    sceneBbox.min[0] = Math.min(sceneBbox.min[0], transformed[0]);
                    sceneBbox.min[1] = Math.min(sceneBbox.min[1], transformed[1]);
                    sceneBbox.min[2] = Math.min(sceneBbox.min[2], transformed[2]);
                    sceneBbox.max[0] = Math.max(sceneBbox.max[0], transformed[0]);
                    sceneBbox.max[1] = Math.max(sceneBbox.max[1], transformed[1]);
                    sceneBbox.max[2] = Math.max(sceneBbox.max[2], transformed[2]);
                }
            }
            if (node.children) {
                for (const childIndex of node.children) await processNode(childIndex, worldMatrix);
            }
        }
        
        const rootMatrix = mat4.create();
        for (const nodeIndex of scene.nodes) await processNode(nodeIndex, rootMatrix);
    }
    
    const skyboxTexture = await skyboxTexturePromise;
    console.log("Skybox loaded");
            
    // Camera
    const center = [
        (sceneBbox.min[0] + sceneBbox.max[0]) / 2,
        (sceneBbox.min[1] + sceneBbox.max[1]) / 2,
        (sceneBbox.min[2] + sceneBbox.max[2]) / 2
    ];
    const size = [
        sceneBbox.max[0] - sceneBbox.min[0],
        sceneBbox.max[1] - sceneBbox.min[1],
        sceneBbox.max[2] - sceneBbox.min[2]
    ];
    const maxSize = Math.max(size[0], size[1], size[2]);
    const cameraDistance = maxSize * 1.5;
    
    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const modelMatrix = mat4.create();
    const normalMatrix = mat3.create();
    const viewMatrixNoTranslation = mat4.create();

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    
    function render() {
        const time = Date.now() / 1000;
        
        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        const aspect = canvas.width / canvas.height;
        mat4.perspective(projectionMatrix, Math.PI / 4, aspect, cameraDistance * 0.01, cameraDistance * 10);
        
        const cameraX = center[0] + Math.sin(time * 0.5) * cameraDistance;
        const cameraY = center[1] + cameraDistance * 0.3;
        const cameraZ = center[2] + Math.cos(time * 0.5) * cameraDistance;
        mat4.lookAt(viewMatrix, [cameraX, cameraY, cameraZ], center, [0, 1, 0]);
        
        // ----------------------------------------------------------------
        // Draw Models
        // ----------------------------------------------------------------
        gl.useProgram(program);
        gl.uniformMatrix4fv(loc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(loc.uViewMatrix, false, viewMatrix);
        gl.uniform3fv(loc.uLightDir, [1, 1, 1]);
        
        for (const mesh of allMeshData) {
            mat4.copy(modelMatrix, mesh.matrix);
            mat3.normalFromMat4(normalMatrix, modelMatrix);
            
            gl.uniformMatrix4fv(loc.uModelMatrix, false, modelMatrix);
            gl.uniformMatrix3fv(loc.uNormalMatrix, false, normalMatrix);
            
            for (const prim of mesh.primitives) {
                extVAO.bindVertexArrayOES(prim.vao);
                
                if (prim.texture) {
                    gl.activeTexture(gl.TEXTURE0);
                    gl.bindTexture(gl.TEXTURE_2D, prim.texture);
                    gl.uniform1i(loc.uTexture, 0);
                    gl.uniform1i(loc.uHasTexture, 1);
                } else {
                    gl.uniform1i(loc.uHasTexture, 0);
                }
                gl.uniform4fv(loc.uBaseColor, prim.baseColor);
                
                if (prim.hasIndices) {
                    gl.drawElements(gl.TRIANGLES, prim.indexCount, prim.indexType, 0);
                } else {
                    gl.drawArrays(gl.TRIANGLES, 0, prim.indexCount);
                }
            }
        }

        // ----------------------------------------------------------------
        // Draw Skybox
        // ----------------------------------------------------------------
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(sbProgram);
        
        mat4.copy(viewMatrixNoTranslation, viewMatrix);
        viewMatrixNoTranslation[12] = 0;
        viewMatrixNoTranslation[13] = 0;
        viewMatrixNoTranslation[14] = 0;
        
        gl.uniformMatrix4fv(sbLoc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(sbLoc.uViewMatrix, false, viewMatrixNoTranslation);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.uniform1i(sbLoc.uSkybox, 0);
        
        extVAO.bindVertexArrayOES(sbVao);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        extVAO.bindVertexArrayOES(null);
        
        gl.depthFunc(gl.LESS);
        
        requestAnimationFrame(render);
    }
    
    render();
}

main();
