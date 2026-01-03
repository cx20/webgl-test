const { mat4, mat3, vec3, quat } = glMatrix;

// Maximum joints supported by the skinning shader (must match index.html)
const MAX_JOINTS = 180;

// Dummy buffers to avoid stale VAO state when a primitive lacks skinning data
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

// Compute flat shading normals (per-triangle)
function computeFlatNormals(positions, indices) {
    const normals = new Float32Array(positions.length);
    const vertexNormals = Array.from({ length: positions.length / 3 }, () => [0, 0, 0]);
    
    // Calculate face normals and accumulate to vertices
    if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
            const i0 = indices[i] * 3;
            const i1 = indices[i + 1] * 3;
            const i2 = indices[i + 2] * 3;
            
            const p0 = [positions[i0], positions[i0 + 1], positions[i0 + 2]];
            const p1 = [positions[i1], positions[i1 + 1], positions[i1 + 2]];
            const p2 = [positions[i2], positions[i2 + 1], positions[i2 + 2]];
            
            const v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
            const v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
            
            // Cross product
            const normal = [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
            
            // Accumulate to all three vertices of the triangle
            const vi0 = indices[i];
            const vi1 = indices[i + 1];
            const vi2 = indices[i + 2];
            
            vertexNormals[vi0][0] += normal[0];
            vertexNormals[vi0][1] += normal[1];
            vertexNormals[vi0][2] += normal[2];
            
            vertexNormals[vi1][0] += normal[0];
            vertexNormals[vi1][1] += normal[1];
            vertexNormals[vi1][2] += normal[2];
            
            vertexNormals[vi2][0] += normal[0];
            vertexNormals[vi2][1] += normal[1];
            vertexNormals[vi2][2] += normal[2];
        }
    } else {
        // Non-indexed geometry
        for (let i = 0; i < positions.length; i += 9) {
            const p0 = [positions[i], positions[i + 1], positions[i + 2]];
            const p1 = [positions[i + 3], positions[i + 4], positions[i + 5]];
            const p2 = [positions[i + 6], positions[i + 7], positions[i + 8]];
            
            const v1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
            const v2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
            
            const normal = [
                v1[1] * v2[2] - v1[2] * v2[1],
                v1[2] * v2[0] - v1[0] * v2[2],
                v1[0] * v2[1] - v1[1] * v2[0]
            ];
            
            for (let j = 0; j < 3; j++) {
                const vi = i / 3 + j;
                vertexNormals[vi][0] += normal[0];
                vertexNormals[vi][1] += normal[1];
                vertexNormals[vi][2] += normal[2];
            }
        }
    }
    
    // Normalize
    for (let i = 0; i < vertexNormals.length; i++) {
        const n = vertexNormals[i];
        const len = Math.sqrt(n[0] * n[0] + n[1] * n[1] + n[2] * n[2]);
        if (len > 0) {
            normals[i * 3] = n[0] / len;
            normals[i * 3 + 1] = n[1] / len;
            normals[i * 3 + 2] = n[2] / len;
        } else {
            normals[i * 3] = 0;
            normals[i * 3 + 1] = 1;
            normals[i * 3 + 2] = 0;
        }
    }
    
    return normals;
}

async function processMesh(gl, extVAO, gltf, buffers, baseUrl, meshIndex) {
    const mesh = gltf.meshes[meshIndex];
    const primitives = [];
    
    for (const primitive of mesh.primitives) {
        const attrs = primitive.attributes;
        const positions = getAccessorData(gltf, buffers, attrs.POSITION);
        const hasNormals = attrs.NORMAL !== undefined;
        let normals = hasNormals ? getAccessorData(gltf, buffers, attrs.NORMAL) : null;
        // Compute flat shading normals if not provided
        if (!normals) {
            normals = computeFlatNormals(positions, primitive.indices !== undefined ? getAccessorData(gltf, buffers, primitive.indices) : null);
        }
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
        
        if (joints) {
            const jointAccessor = gltf.accessors[attrs.JOINTS_0];
            const jointType = jointAccessor.componentType === 5121 ? gl.UNSIGNED_BYTE : gl.UNSIGNED_SHORT; // glTF spec allows UBYTE or USHORT
            const jointsBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, jointsBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, joints, gl.STATIC_DRAW);
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, 4, jointType, false, 0, 0);
        } else {
            if (!dummyJointsBuffer) {
                dummyJointsBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, dummyJointsBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(4), gl.STATIC_DRAW);
            } else {
                gl.bindBuffer(gl.ARRAY_BUFFER, dummyJointsBuffer);
            }
            gl.enableVertexAttribArray(3);
            gl.vertexAttribPointer(3, 4, gl.UNSIGNED_SHORT, false, 0, 0);
        }
        
        if (weights) {
            const weightAccessor = gltf.accessors[attrs.WEIGHTS_0];
            const compType = weightAccessor.componentType;
            let glType = gl.FLOAT;
            let normalized = false;
            if (compType === 5121) { // UNSIGNED_BYTE
                glType = gl.UNSIGNED_BYTE;
                normalized = true;
            } else if (compType === 5123) { // UNSIGNED_SHORT
                glType = gl.UNSIGNED_SHORT;
                normalized = true;
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
        const hasSkinning = joints !== null && weights !== null;
        
        primitives.push({ vao, indexCount, indexType, hasIndices: indices !== null, texture, baseColor, bbox, hasSkinning, hasNormals });
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
            for (let i = 0; i < skin.joints.length; i++) matrices.push(mat4.create());
        }

        return {
            joints: skin.joints,
            inverseBindMatrices: matrices,
            jointMatrices: skin.joints.map(() => mat4.create())
        };
    });
}

function updateSkinMatrices(skin, nodes) {
    const jointCount = Math.min(skin.joints.length, MAX_JOINTS);
    for (let i = 0; i < jointCount; i++) {
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
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    const extVAO = gl.getExtension('OES_vertex_array_object');
    if (!extVAO) { alert('OES_vertex_array_object not supported'); return; }
    
    const extUint = gl.getExtension('OES_element_index_uint');
    if (!extUint) { console.warn('OES_element_index_uint not supported. Large meshes may fail.'); }
    
    // Enable derivatives for flat shading in fragment shader
    const extDerivatives = gl.getExtension('OES_standard_derivatives');
    if (!extDerivatives) { console.warn('OES_standard_derivatives not supported. Flat shading may not work.'); }
    
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

    const trackLength = 100;
    const trackWidth = 0.1;
    const trackVertices = new Float32Array([
        -trackLength / 2, 0, -trackWidth / 2,
         trackLength / 2, 0, -trackWidth / 2,
         trackLength / 2, 0,  trackWidth / 2,
        -trackLength / 2, 0, -trackWidth / 2,
         trackLength / 2, 0,  trackWidth / 2,
        -trackLength / 2, 0,  trackWidth / 2,
    ]);

    const trackVao = extVAO.createVertexArrayOES();
    extVAO.bindVertexArrayOES(trackVao);
    const trackBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, trackBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, trackVertices, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(trackLoc.aPosition);
    gl.vertexAttribPointer(trackLoc.aPosition, 3, gl.FLOAT, false, 0, 0);
    extVAO.bindVertexArrayOES(null);

    const trackColor = [255 / 255, 255 / 255, 255 / 255, 1.0];

    // ----------------------------------------------------------------
    // Load Resources
    // ----------------------------------------------------------------
    let sceneBbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
    
    // Load Skybox Texture
    const skyboxPath = 'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/';
    const skyboxFormat = '.jpg';
    const skyboxUrls = [
        skyboxPath + 'px' + skyboxFormat, skyboxPath + 'nx' + skyboxFormat,
        skyboxPath + 'py' + skyboxFormat, skyboxPath + 'ny' + skyboxFormat,
        skyboxPath + 'pz' + skyboxFormat, skyboxPath + 'nz' + skyboxFormat
    ];
    
    const skyboxTexture = await loadCubeMap(gl, skyboxUrls);
    console.log("Skybox loaded");
    
    const loadedModels = [];

    // Load Models with node hierarchy
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
                const { primitives, bbox } = await processMesh(gl, extVAO, gltf, buffers, baseUrl, i);
                meshes.push({ primitives, bbox });
            }
        }

        const skins = loadSkins(gltf, buffers);
        const animations = loadAnimations(gltf, buffers);

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

    const startTime = Date.now() / 1000;
    
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

        // ----------------------------------------------------------------
        // Draw Tire Tracks
        // ----------------------------------------------------------------
        gl.useProgram(trackProgram);
        gl.uniformMatrix4fv(trackLoc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(trackLoc.uViewMatrix, false, viewMatrix);
        gl.uniform4fv(trackLoc.uColor, trackColor);
        extVAO.bindVertexArrayOES(trackVao);

        const track1Matrix = mat4.create();
        mat4.translate(track1Matrix, track1Matrix, [-49.5, 0, -1.6]);
        mat4.rotateX(track1Matrix, track1Matrix, Math.PI);
        gl.uniformMatrix4fv(trackLoc.uModelMatrix, false, track1Matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);

        const track2Matrix = mat4.create();
        mat4.translate(track2Matrix, track2Matrix, [-49.5, 0, -2.35]);
        mat4.rotateX(track2Matrix, track2Matrix, Math.PI);
        gl.uniformMatrix4fv(trackLoc.uModelMatrix, false, track2Matrix);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        extVAO.bindVertexArrayOES(null);
        
        // ----------------------------------------------------------------
        // Draw Models
        // ----------------------------------------------------------------
        gl.useProgram(program);
        gl.uniformMatrix4fv(loc.uProjectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(loc.uViewMatrix, false, viewMatrix);
        gl.uniform3fv(loc.uLightDir, [1, 1, 1]);
        
        const updateWorldMatrices = (model, nodeIndex, parentMatrix) => {
            const node = model.nodes[nodeIndex];
            mat4.fromRotationTranslationScale(node.matrix, node.rotation, node.translation, node.scale);
            mat4.multiply(node.worldMatrix, parentMatrix, node.matrix);
            for (const childId of node.children) {
                updateWorldMatrices(model, childId, node.worldMatrix);
            }
        };

        const drawHierarchy = (model, nodeIndex) => {
            const node = model.nodes[nodeIndex];

            if (node.meshIndex !== undefined) {
                const mesh = model.meshes[node.meshIndex];
                const nodeSkin = node.skinIndex !== null ? model.skins[node.skinIndex] : null;
                const hasSkinning = mesh.primitives.some(p => p.hasSkinning);
                const modelMatrix = hasSkinning ? mat4.create() : node.worldMatrix;

                mat3.normalFromMat4(normalMatrix, modelMatrix);
                gl.uniformMatrix4fv(loc.uModelMatrix, false, modelMatrix);
                gl.uniformMatrix3fv(loc.uNormalMatrix, false, normalMatrix);

                for (const prim of mesh.primitives) {
                    extVAO.bindVertexArrayOES(prim.vao);

                    if (prim.hasSkinning && nodeSkin) {
                        gl.uniform1i(loc.uHasSkinning, 1);
                        const jointCount = Math.min(nodeSkin.jointMatrices.length, MAX_JOINTS);
                        const jointMatrixArray = new Float32Array(jointCount * 16);
                        for (let j = 0; j < jointCount; j++) {
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
                }
            }

            for (const childId of node.children) {
                drawHierarchy(model, childId);
            }
        };
        
        for (const model of loadedModels) {
            if (model.currentAnimation) {
                updateAnimation(model.currentAnimation, model.nodes, time);
            }

            for (const rootNodeId of model.rootNodes) {
                updateWorldMatrices(model, rootNodeId, model.baseTransform);
            }

            for (const skin of model.skins) {
                updateSkinMatrices(skin, model.nodes);
            }

            for (const rootNodeId of model.rootNodes) {
                drawHierarchy(model, rootNodeId);
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
