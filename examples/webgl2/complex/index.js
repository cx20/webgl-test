const { mat4, mat3, vec3, quat } = glMatrix;

// Maximum joints supported by the skinning shader (keep in sync with index.html uJointMatrices size)
const MAX_JOINTS = 180;

// Dummy buffers to bind when a mesh has no skinning data, avoiding stale VAO state issues
let dummyJointsBuffer = null;
let dummyWeightsBuffer = null;

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
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

    const promises = faces.map(face => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => {
                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.texImage2D(face.target, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                resolve();
            };
            img.onerror = (error) => {
                console.error(`Failed to load cubemap face: ${face.url}`, error);
                reject(error);
            };
            img.src = face.url;
        });
    });

    return Promise.all(promises).then(() => {
        console.log('Cubemap loaded successfully');
        return texture;
    }).catch(error => {
        console.error('Error loading cubemap:', error);
        return texture;
    });
}

// ========== glTF/GLB Loader & Data Extraction ==========
async function loadGLTF(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Failed to fetch glTF: ${url} status=${response.status}`);
        throw new Error(`fetch failed: ${url}`);
    }
    const baseUrl = url.substring(0, url.lastIndexOf('/') + 1);
    const contentType = response.headers.get('content-type');
    const isGLB = url.endsWith('.glb') || (contentType && contentType.includes('model/gltf-binary'));
    if (isGLB) {
        const buffer = await response.arrayBuffer();
        console.log(`Loaded GLB: ${url}`);
        return parseGLB(buffer, baseUrl);
    } else {
        const gltf = await response.json();
        console.log(`Loaded glTF JSON: ${url}`);
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
    if (magic !== 0x46546C67) throw new Error('Invalid GLB file');
    const length = dataView.getUint32(8, true);
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

function getAccessorData(gltf, buffers, accessorIndex) {
    const accessor = gltf.accessors[accessorIndex];
    const bufferView = gltf.bufferViews[accessor.bufferView];
    const bufferIndex = bufferView.buffer || 0;
    const binData = buffers[bufferIndex];
    const byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
    const count = accessor.count;
    const componentTypes = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
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
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
            resolve(glTexture);
        };
        if (image.uri) { img.src = new URL(image.uri, baseUrl).href; }
        else if (image.bufferView !== undefined) {
            const bufferView = gltf.bufferViews[image.bufferView];
            const bufferIndex = bufferView.buffer || 0;
            const binData = buffers[bufferIndex];
            const byteOffset = bufferView.byteOffset || 0;
            const byteLength = bufferView.byteLength;
            const blob = new Blob([new Uint8Array(binData.buffer, binData.byteOffset + byteOffset, byteLength)], { type: image.mimeType });
            img.src = URL.createObjectURL(blob);
        }
    });
}

// ========== Mesh Processing ==========
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

async function processMesh(gl, gltf, buffers, baseUrl, meshIndex) {
    const mesh = gltf.meshes[meshIndex];
    const primitives = [];
    for (const primitive of mesh.primitives) {
        const attrs = primitive.attributes;
        const positions = getAccessorData(gltf, buffers, attrs.POSITION);
        const normals = attrs.NORMAL !== undefined ? getAccessorData(gltf, buffers, attrs.NORMAL) : null;
        const texCoords = attrs.TEXCOORD_0 !== undefined ? getAccessorData(gltf, buffers, attrs.TEXCOORD_0) : null;
        const joints = attrs.JOINTS_0 !== undefined ? getAccessorData(gltf, buffers, attrs.JOINTS_0) : null;
        const weights = attrs.WEIGHTS_0 !== undefined ? getAccessorData(gltf, buffers, attrs.WEIGHTS_0) : null;
        let indices = null;
        let indexType = gl.UNSIGNED_SHORT;
        if (primitive.indices !== undefined) {
            indices = getAccessorData(gltf, buffers, primitive.indices);
            const indexAccessor = gltf.accessors[primitive.indices];
            if (indexAccessor.componentType === 5121) indexType = gl.UNSIGNED_BYTE;      // UNSIGNED_BYTE
            else if (indexAccessor.componentType === 5123) indexType = gl.UNSIGNED_SHORT; // UNSIGNED_SHORT
            else if (indexAccessor.componentType === 5125) indexType = gl.UNSIGNED_INT;   // UNSIGNED_INT
        }
        const bbox = calculateBoundingBox(positions);
        
        const vao = gl.createVertexArray();
        gl.bindVertexArray(vao);
        
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
        
        if (joints) {
            const jointAccessor = gltf.accessors[attrs.JOINTS_0];
            const jointType = jointAccessor.componentType === 5121 ? gl.UNSIGNED_BYTE : gl.UNSIGNED_SHORT; // 5121: UBYTE, 5123: USHORT
            const jointsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, jointsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, joints, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(3);
            gl.vertexAttribIPointer(3, 4, jointType, 0, 0);
        } else {
            if (!dummyJointsBuffer) {
                dummyJointsBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, dummyJointsBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(4), gl.STATIC_DRAW);
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, dummyJointsBuffer);
            }
            gl.enableVertexAttribArray(3);
            gl.vertexAttribIPointer(3, 4, gl.UNSIGNED_SHORT, 0, 0);
        }
        
        if (weights) {
            const weightAccessor = gltf.accessors[attrs.WEIGHTS_0];
            const compType = weightAccessor.componentType;
            let glType = gl.FLOAT;
            let normalized = false;
            if (compType === 5121) { // UNSIGNED_BYTE
                glType = gl.UNSIGNED_BYTE;
                normalized = true; // normalize 0..255 to 0..1
            } else if (compType === 5123) { // UNSIGNED_SHORT
                glType = gl.UNSIGNED_SHORT;
                normalized = true; // normalize 0..65535 to 0..1
            } else if (compType === 5126) { // FLOAT
                glType = gl.FLOAT;
                normalized = false;
            }
            const weightsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, weightsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, weights, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, 4, glType, normalized, 0, 0);
        } else {
            if (!dummyWeightsBuffer) {
                dummyWeightsBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, dummyWeightsBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1]), gl.STATIC_DRAW);
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, dummyWeightsBuffer);
            }
            gl.enableVertexAttribArray(4);
            gl.vertexAttribPointer(4, 4, gl.FLOAT, false, 0, 0);
        }
        
        let indexCount = positions.length / 3;
        if (indices) {
            const indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
            indexCount = indices.length;
        }
        
        gl.bindVertexArray(null);
        
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
        const hasSkinning = joints !== null && weights !== null;
        const hasNormals = normals !== null;
        primitives.push({ vao, indexCount, indexType, hasIndices: indices !== null, texture, baseColor, bbox, hasSkinning, hasNormals });
        console.debug('Primitive loaded', {
            meshIndex,
            hasSkinning,
            hasNormals,
            indexType,
            indexCount,
            positions: positions.length / 3,
            hasTexture: !!texture,
            baseColor,
            jointsCompType: joints ? gltf.accessors[attrs.JOINTS_0].componentType : null,
            weightsCompType: weights ? gltf.accessors[attrs.WEIGHTS_0].componentType : null
        });
    }
    
    let combinedBbox = primitives[0].bbox;
    for (let i = 1; i < primitives.length; i++) combinedBbox = mergeBoundingBoxes(combinedBbox, primitives[i].bbox);
    return { primitives, bbox: combinedBbox };
}

// ========== Skinning Processing ==========

function loadSkins(gltf, buffers) {
    if (!gltf.skins) return [];
    
    return gltf.skins.map(skin => {
        if (skin.joints.length > MAX_JOINTS) {
            console.warn(`Skin joints (${skin.joints.length}) exceed MAX_JOINTS (${MAX_JOINTS}). Some bones may be ignored.`);
        }
        const inverseBindMatrices = skin.inverseBindMatrices !== undefined
            ? getAccessorData(gltf, buffers, skin.inverseBindMatrices)
            : null;
        
        const matrices = [];
        if (inverseBindMatrices) {
            for (let i = 0; i < skin.joints.length; i++) {
                matrices.push(mat4.clone(inverseBindMatrices.subarray(i * 16, i * 16 + 16)));
            }
        } else {
            for (let i = 0; i < skin.joints.length; i++) {
                matrices.push(mat4.create());
            }
        }
        
        return {
            joints: skin.joints,
            inverseBindMatrices: matrices,
            jointMatrices: skin.joints.map(() => mat4.create())
        };
    });
}

function updateSkinMatrices(skin, nodes) {
    for (let i = 0; i < skin.joints.length; i++) {
        const jointNode = nodes[skin.joints[i]];
        mat4.multiply(skin.jointMatrices[i], jointNode.worldMatrix, skin.inverseBindMatrices[i]);
    }
}

// ========== Animation Processing ==========

function loadAnimations(gltf, buffers) {
    if (!gltf.animations) return [];

    return gltf.animations.map(anim => {
        const channels = anim.channels.map(channel => {
            const sampler = anim.samplers[channel.sampler];
            const inputData = getAccessorData(gltf, buffers, sampler.input);
            const outputData = getAccessorData(gltf, buffers, sampler.output);
            
            return {
                targetNode: channel.target.node,
                targetPath: channel.target.path, // 'translation', 'rotation', 'scale'
                input: inputData,   // 時間 (Times)
                output: outputData, // 値 (Values)
                interpolation: sampler.interpolation || 'LINEAR'
            };
        });
        
        let maxTime = 0;
        channels.forEach(ch => {
            if (ch.input.length > 0) {
                maxTime = Math.max(maxTime, ch.input[ch.input.length - 1]);
            }
        });

        return {
            name: anim.name,
            channels: channels,
            duration: maxTime
        };
    });
}

function updateAnimation(animation, nodes, time) {
    const t = time % animation.duration;

    animation.channels.forEach(channel => {
        const node = nodes[channel.targetNode];
        const times = channel.input;
        const values = channel.output;
        
        let prevIndex = 0;
        let nextIndex = 0;
        
        for (let i = 0; i < times.length - 1; i++) {
            if (t >= times[i] && t < times[i + 1]) {
                prevIndex = i;
                nextIndex = i + 1;
                break;
            }
        }
        
        const startTime = times[prevIndex];
        const endTime = times[nextIndex];
        const factor = (t - startTime) / (endTime - startTime);
        
        if (channel.targetPath === 'rotation') {
            const prev = values.subarray(prevIndex * 4, prevIndex * 4 + 4);
            const next = values.subarray(nextIndex * 4, nextIndex * 4 + 4);
            quat.slerp(node.rotation, prev, next, factor);
        } else if (channel.targetPath === 'translation') {
            const prev = values.subarray(prevIndex * 3, prevIndex * 3 + 3);
            const next = values.subarray(nextIndex * 3, nextIndex * 3 + 3);
            vec3.lerp(node.translation, prev, next, factor);
        } else if (channel.targetPath === 'scale') {
            const prev = values.subarray(prevIndex * 3, prevIndex * 3 + 3);
            const next = values.subarray(nextIndex * 3, nextIndex * 3 + 3);
            vec3.lerp(node.scale, prev, next, factor);
        }
    });
}

// ========== Main ==========

async function main() {
    const canvas = document.getElementById('c');
    const gl = canvas.getContext('webgl2');
    
    function resize() {
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);
    
    const vsSource = document.getElementById('vs').textContent;
    const fsSource = document.getElementById('fs').textContent;
    const program = createProgram(gl, vsSource, fsSource);
    
    const loc = {
        aPosition: gl.getAttribLocation(program, 'aPosition'),
        aNormal: gl.getAttribLocation(program, 'aNormal'),
        aTexCoord: gl.getAttribLocation(program, 'aTexCoord'),
        aJoints: gl.getAttribLocation(program, 'aJoints'),
        aWeights: gl.getAttribLocation(program, 'aWeights'),
        uModelMatrix: gl.getUniformLocation(program, 'uModelMatrix'),
        uViewMatrix: gl.getUniformLocation(program, 'uViewMatrix'),
        uProjectionMatrix: gl.getUniformLocation(program, 'uProjectionMatrix'),
        uNormalMatrix: gl.getUniformLocation(program, 'uNormalMatrix'),
        uTexture: gl.getUniformLocation(program, 'uTexture'),
        uHasTexture: gl.getUniformLocation(program, 'uHasTexture'),
        uHasNormals: gl.getUniformLocation(program, 'uHasNormals'),
        uBaseColor: gl.getUniformLocation(program, 'uBaseColor'),
        uLightDir: gl.getUniformLocation(program, 'uLightDir'),
        uJointMatrices: gl.getUniformLocation(program, 'uJointMatrices'),
        uHasSkinning: gl.getUniformLocation(program, 'uHasSkinning')
    };

    let sceneBbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    
    const loadedModels = [];

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

    // Skybox Cube (Positions only) - 1x1x1 cube centered at origin
    const skyboxVertices = new Float32Array([
        -1,  1, -1, -1, -1, -1,  1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1, -1,
        -1, -1,  1, -1, -1, -1, -1,  1, -1, -1,  1, -1, -1,  1,  1, -1, -1,  1,
         1, -1, -1,  1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1, -1,  1, -1, -1,
        -1, -1,  1, -1,  1,  1,  1,  1,  1,  1,  1,  1,  1, -1,  1, -1, -1,  1,
        -1,  1, -1,  1,  1, -1,  1,  1,  1,  1,  1,  1, -1,  1,  1, -1,  1, -1,
        -1, -1, -1, -1, -1,  1,  1, -1, -1,  1, -1, -1, -1, -1,  1,  1, -1,  1
    ]);
    
    const sbVao = gl.createVertexArray();
    gl.bindVertexArray(sbVao);
    const sbBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sbBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, skyboxVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(sbLoc.aPosition);
    gl.vertexAttribPointer(sbLoc.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // ----------------------------------------------------------------
    // Setup Tire Track Program & Geometry
    // ----------------------------------------------------------------
    const trackVsSource = document.getElementById('vs-track').textContent;
    const trackFsSource = document.getElementById('fs-track').textContent;
    const trackProgram = createProgram(gl, trackVsSource, trackFsSource);

    const trackLoc = {
        aPosition: gl.getAttribLocation(trackProgram, 'aPosition'),
        uModelMatrix: gl.getUniformLocation(trackProgram, 'uModelMatrix'),
        uViewMatrix: gl.getUniformLocation(trackProgram, 'uViewMatrix'),
        uProjectionMatrix: gl.getUniformLocation(trackProgram, 'uProjectionMatrix'),
        uColor: gl.getUniformLocation(trackProgram, 'uColor')
    };

    // Create tire track geometry (100 x 0.1 plane)
    const trackLength = 100;
    const trackWidth = 0.1;
    const trackVertices = new Float32Array([
        -trackLength/2, 0, -trackWidth/2,
        trackLength/2, 0, -trackWidth/2,
        trackLength/2, 0, trackWidth/2,
        -trackLength/2, 0, -trackWidth/2,
        trackLength/2, 0, trackWidth/2,
        -trackLength/2, 0, trackWidth/2
    ]);

    const trackVao = gl.createVertexArray();
    gl.bindVertexArray(trackVao);
    const trackBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trackVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(trackLoc.aPosition);
    gl.vertexAttribPointer(trackLoc.aPosition, 3, gl.FLOAT, false, 0, 0);
    gl.bindVertexArray(null);

    // Tire track color (brownish)
    //const trackColor = [197/255, 134/255, 111/255, 1.0];
    const trackColor = [255/255, 255/255, 255/255, 1.0];

    // ----------------------------------------------------------------
    // Load Resources (GLTF & CubeMap)
    // ----------------------------------------------------------------
    const allMeshData = [];

    // Load Skybox Texture
    const skyboxPath = 'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/';
    const skyboxFormat = '.jpg';
    const skyboxUrls = [
        skyboxPath + 'px' + skyboxFormat, skyboxPath + 'nx' + skyboxFormat,
        skyboxPath + 'py' + skyboxFormat, skyboxPath + 'ny' + skyboxFormat,
        skyboxPath + 'pz' + skyboxFormat, skyboxPath + 'nz' + skyboxFormat
    ];
    
    const skyboxTexture = await loadCubeMap(gl, skyboxUrls);
    for (const modelInfo of modelInfoSet) {
        console.log(`Loading ${modelInfo.name}...`);
        const { gltf, buffers, baseUrl } = await loadGLTF(modelInfo.url);
        
        const nodes = gltf.nodes.map(node => {
            return {
                translation: node.translation ? vec3.clone(node.translation) : vec3.fromValues(0, 0, 0),
                rotation: node.rotation ? quat.clone(node.rotation) : quat.fromValues(0, 0, 0, 1),
                scale: node.scale ? vec3.clone(node.scale) : vec3.fromValues(1, 1, 1),
                matrix: mat4.create(),       
                worldMatrix: mat4.create(),  
                meshIndex: node.mesh,
                skinIndex: node.skin !== undefined ? node.skin : null,
                children: node.children || []
            };
        });

        const meshes = [];
        if (gltf.meshes) {
            for (let i = 0; i < gltf.meshes.length; i++) {
                const { primitives, bbox } = await processMesh(gl, gltf, buffers, baseUrl, i);
                meshes.push({ primitives, bbox });
            }
        }

        const skins = loadSkins(gltf, buffers);
        const animations = loadAnimations(gltf, buffers);

        // Choose animation: prefer 'Run' for Fox, otherwise first
        let currentAnimation = null;
        if (animations.length > 0) {
            if (modelInfo.name === 'Fox') {
                currentAnimation = animations.find(a => a.name === 'Run') || animations[0];
            } else {
                currentAnimation = animations[0];
            }
        }

        const scene = gltf.scenes[gltf.scene || 0];
        
        const baseTransform = mat4.create();
        mat4.translate(baseTransform, baseTransform, modelInfo.position);
        mat4.rotateY(baseTransform, baseTransform, modelInfo.rotation[1]);
        mat4.rotateX(baseTransform, baseTransform, modelInfo.rotation[0]);
        mat4.rotateZ(baseTransform, baseTransform, modelInfo.rotation[2]);
        mat4.scale(baseTransform, baseTransform, [modelInfo.scale, modelInfo.scale, modelInfo.scale]);

        loadedModels.push({
            nodes,
            meshes,
            skins,
            animations,
            currentAnimation,
            rootNodes: scene.nodes,
            baseTransform
        });

        console.log('Model loaded summary', {
            name: modelInfo.name,
            nodes: nodes.length,
            meshes: meshes.length,
            skins: skins.length,
            animations: animations.length,
            rootNodes: scene.nodes.length
        });

        for (const nodeIndex of scene.nodes) {
            function traverseBBox(idx, parentMat) {
                const node = nodes[idx];
                const localMat = mat4.create();
                mat4.fromRotationTranslationScale(localMat, node.rotation, node.translation, node.scale);
                const worldMat = mat4.create();
                mat4.multiply(worldMat, parentMat, localMat);

                if (node.meshIndex !== undefined) {
                    const mesh = meshes[node.meshIndex];
                    const corners = [
                        [mesh.bbox.min[0], mesh.bbox.min[1], mesh.bbox.min[2]],
                        [mesh.bbox.max[0], mesh.bbox.min[1], mesh.bbox.min[2]],
                        [mesh.bbox.min[0], mesh.bbox.max[1], mesh.bbox.min[2]],
                        [mesh.bbox.max[0], mesh.bbox.max[1], mesh.bbox.min[2]],
                        [mesh.bbox.min[0], mesh.bbox.min[1], mesh.bbox.max[2]],
                        [mesh.bbox.max[0], mesh.bbox.min[1], mesh.bbox.max[2]],
                        [mesh.bbox.min[0], mesh.bbox.max[1], mesh.bbox.max[2]],
                        [mesh.bbox.max[0], mesh.bbox.max[1], mesh.bbox.max[2]]
                    ];
                    for (const corner of corners) {
                        const t = vec3.transformMat4(vec3.create(), corner, worldMat);
                        sceneBbox.min[0] = Math.min(sceneBbox.min[0], t[0]);
                        sceneBbox.min[1] = Math.min(sceneBbox.min[1], t[1]);
                        sceneBbox.min[2] = Math.min(sceneBbox.min[2], t[2]);
                        sceneBbox.max[0] = Math.max(sceneBbox.max[0], t[0]);
                        sceneBbox.max[1] = Math.max(sceneBbox.max[1], t[1]);
                        sceneBbox.max[2] = Math.max(sceneBbox.max[2], t[2]);
                    }
                }
                for (const childId of node.children) traverseBBox(childId, worldMat);
            }
            traverseBBox(nodeIndex, baseTransform);
        }
    }

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
    const normalMatrix = mat3.create();

    const startTime = Date.now() / 1000;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    function render() {
        const time = Date.now() / 1000 - startTime;

        gl.clearColor(0.2, 0.2, 0.2, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const aspect = canvas.width / canvas.height;
        mat4.perspective(projectionMatrix, Math.PI / 4, aspect, cameraDistance * 0.01, cameraDistance * 10);
        
        const cameraX = center[0] - Math.sin(time * 0.5) * cameraDistance;
        const cameraY = center[1] + cameraDistance * 0.3;
        const cameraZ = center[2] + Math.cos(time * 0.5) * cameraDistance;
        mat4.lookAt(viewMatrix, [cameraX, cameraY, cameraZ], center, [0, 1, 0]);

        // Draw Skybox
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(sbProgram);
        const skyboxView = mat4.clone(viewMatrix);
        skyboxView[12] = 0; skyboxView[13] = 0; skyboxView[14] = 0; // Remove translation
        gl.uniformMatrix4fv(sbLoc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(sbLoc.uViewMatrix, false, skyboxView);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, skyboxTexture);
        gl.uniform1i(sbLoc.uSkybox, 0);
        gl.bindVertexArray(sbVao);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
        gl.depthFunc(gl.LESS);

        // Draw Tire Tracks
        gl.useProgram(trackProgram);
        gl.uniformMatrix4fv(trackLoc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(trackLoc.uViewMatrix, false, viewMatrix);
        gl.uniform4fv(trackLoc.uColor, trackColor);
        gl.bindVertexArray(trackVao);

        // Track 1 (left tire track)
        const track1Matrix = mat4.create();
        mat4.translate(track1Matrix, track1Matrix, [-49.5, 0, -1.6]);
        mat4.rotateX(track1Matrix, track1Matrix, Math.PI);
        gl.uniformMatrix4fv(trackLoc.uModelMatrix, false, track1Matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Track 2 (right tire track)
        const track2Matrix = mat4.create();
        mat4.translate(track2Matrix, track2Matrix, [-49.5, 0, -2.35]);
        mat4.rotateX(track2Matrix, track2Matrix, Math.PI);
        gl.uniformMatrix4fv(trackLoc.uModelMatrix, false, track2Matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        // Draw Models
        gl.useProgram(program);
        gl.uniformMatrix4fv(loc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(loc.uViewMatrix, false, viewMatrix);
        gl.uniform3fv(loc.uLightDir, [1, 1, 1]);

        for (const model of loadedModels) {
            if (model.currentAnimation) {
                updateAnimation(model.currentAnimation, model.nodes, time);
            }

            const updateHierarchy = (nodeIndex, parentMatrix) => {
                const node = model.nodes[nodeIndex];
                
                mat4.fromRotationTranslationScale(node.matrix, node.rotation, node.translation, node.scale);
                
                mat4.multiply(node.worldMatrix, parentMatrix, node.matrix);

                if (node.meshIndex !== undefined) {
                    const nodeSkin = node.skinIndex !== null ? model.skins[node.skinIndex] : null;
                    const mesh = model.meshes[node.meshIndex];
                    
                    const hasSkinning = mesh.primitives.some(p => p.hasSkinning);
                    const modelMatrix = hasSkinning ? mat4.create() : node.worldMatrix;
                    
                    mat3.normalFromMat4(normalMatrix, modelMatrix);
                    gl.uniformMatrix4fv(loc.uModelMatrix, false, modelMatrix);
                    gl.uniformMatrix3fv(loc.uNormalMatrix, false, normalMatrix);

                    for (const prim of mesh.primitives) {
                        gl.bindVertexArray(prim.vao);
                        
                        if (prim.hasSkinning && nodeSkin) {
                            gl.uniform1i(loc.uHasSkinning, 1);
                            const jointMatrixArray = new Float32Array(nodeSkin.jointMatrices.length * 16);
                            for (let j = 0; j < nodeSkin.jointMatrices.length; j++) {
                                jointMatrixArray.set(nodeSkin.jointMatrices[j], j * 16);
                            }
                            gl.uniformMatrix4fv(loc.uJointMatrices, false, jointMatrixArray);
                        } else {
                            gl.uniform1i(loc.uHasSkinning, 0);
                        }
                        gl.uniform1i(loc.uHasNormals, prim.hasNormals ? 1 : 0);
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

                        const err = gl.getError();
                        if (err !== gl.NO_ERROR) {
                            console.error('GL error after draw', {
                                model: modelInfoSet[loadedModels.indexOf(model)].name,
                                meshIndex: node.meshIndex,
                                hasSkinning: prim.hasSkinning,
                                indexType: prim.indexType,
                                indexCount: prim.indexCount,
                                error: err
                            });
                            return;
                        }
                    }
                }

                for (const childId of node.children) {
                    updateHierarchy(childId, node.worldMatrix);
                }
            };

            for (const rootNodeId of model.rootNodes) {
                updateHierarchy(rootNodeId, model.baseTransform);
            }
            
            for (const skin of model.skins) {
                updateSkinMatrices(skin, model.nodes);
            }
        }

        requestAnimationFrame(render);
    }
    render();
}

main();