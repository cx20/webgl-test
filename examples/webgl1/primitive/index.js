import Module from 'https://esm.run/manifold-3d';

const TEXTURE_URL = 'https://cx20.github.io/webgl-test/assets/textures/earth.jpg';

// gl-matrix 3.x uses glMatrix global object
const { mat4 } = glMatrix;

// ========== Shader Sources (from script tags) ==========

const vsSource = document.getElementById('vs').textContent;
const fsSource = document.getElementById('fs').textContent;

// ========== WebGL Helper Functions ==========

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
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
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

function loadTexture(gl, url) {
    return new Promise((resolve) => {
        const texture = gl.createTexture();
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            resolve(texture);
        };
        image.src = url;
    });
}

// ========== UV Mapping Functions ==========

function sphericalUV(x, y, z) {
    const len = Math.hypot(x, y, z);
    if (len === 0) return [0.5, 0.5];
    const nx = x / len, ny = y / len, nz = z / len;
    const u = 0.5 - Math.atan2(nz, nx) / (2 * Math.PI);
    const v = 0.5 - Math.asin(Math.max(-1, Math.min(1, ny))) / Math.PI;
    return [u, v];
}

function cylindricalUV(x, y, z, height = 1) {
    const u = 0.5 - Math.atan2(z, x) / (2 * Math.PI);
    const v = (y + height / 2) / height;
    return [u, v];
}

function boxUV(x, y, z) {
    const ax = Math.abs(x), ay = Math.abs(y), az = Math.abs(z);
    if (ax >= ay && ax >= az) {
        return [(z / ax + 1) / 2, (y / ax + 1) / 2];
    } else if (ay >= ax && ay >= az) {
        return [(x / ay + 1) / 2, (z / ay + 1) / 2];
    } else {
        return [(x / az + 1) / 2, (y / az + 1) / 2];
    }
}

function fixSeamUVs(uv0, uv1, uv2) {
    let u0 = uv0[0], u1 = uv1[0], u2 = uv2[0];
    if (Math.abs(u0 - u1) > 0.5) { if (u0 < u1) u0 += 1.0; else u1 += 1.0; }
    if (Math.abs(u1 - u2) > 0.5) { if (u1 < u2) u1 += 1.0; else u2 += 1.0; }
    if (Math.abs(u0 - u2) > 0.5) { if (u0 < u2) u0 += 1.0; else u2 += 1.0; }
    return [[u0, uv0[1]], [u1, uv1[1]], [u2, uv2[1]]];
}

// ========== Manifold to Arrays ==========

function manifoldToArrays(manifold, uvFunc, fixSeam = false) {
    const mesh = manifold.getMesh();
    const vertProps = mesh.vertProperties;
    const triVerts = mesh.triVerts;
    
    const positions = [];
    const uvs = [];
    
    for (let i = 0; i < triVerts.length; i += 3) {
        const i0 = triVerts[i], i1 = triVerts[i + 1], i2 = triVerts[i + 2];
        
        const p0 = [vertProps[i0 * 3], vertProps[i0 * 3 + 1], vertProps[i0 * 3 + 2]];
        const p1 = [vertProps[i1 * 3], vertProps[i1 * 3 + 1], vertProps[i1 * 3 + 2]];
        const p2 = [vertProps[i2 * 3], vertProps[i2 * 3 + 1], vertProps[i2 * 3 + 2]];
        
        positions.push(...p0, ...p1, ...p2);
        
        let uv0 = uvFunc(...p0);
        let uv1 = uvFunc(...p1);
        let uv2 = uvFunc(...p2);
        
        if (fixSeam) {
            [uv0, uv1, uv2] = fixSeamUVs(uv0, uv1, uv2);
        }
        
        uvs.push(...uv0, ...uv1, ...uv2);
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

// ========== Geometry Creators ==========

function createPlane(width, height, segments = 1) {
    const positions = [];
    const uvs = [];
    
    const hw = width / 2, hh = height / 2;
    const segW = width / segments, segH = height / segments;
    
    for (let j = 0; j < segments; j++) {
        for (let i = 0; i < segments; i++) {
            const x0 = -hw + i * segW, x1 = x0 + segW;
            const y0 = -hh + j * segH, y1 = y0 + segH;
            const u0 = i / segments, u1 = (i + 1) / segments;
            const v0 = j / segments, v1 = (j + 1) / segments;
            
            positions.push(x0, y0, 0, x1, y0, 0, x1, y1, 0);
            positions.push(x0, y0, 0, x1, y1, 0, x0, y1, 0);
            uvs.push(u0, v0, u1, v0, u1, v1);
            uvs.push(u0, v0, u1, v1, u0, v1);
        }
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

function createCircle(radius, segments = 32) {
    const positions = [];
    const uvs = [];
    
    for (let i = 0; i < segments; i++) {
        const a0 = (i / segments) * Math.PI * 2;
        const a1 = ((i + 1) / segments) * Math.PI * 2;
        
        const x0 = Math.cos(a0) * radius, z0 = Math.sin(a0) * radius;
        const x1 = Math.cos(a1) * radius, z1 = Math.sin(a1) * radius;
        
        positions.push(0, 0, 0, x0, 0, z0, x1, 0, z1);
        uvs.push(0.5, 0.5);
        uvs.push((x0 / radius + 1) / 2, (z0 / radius + 1) / 2);
        uvs.push((x1 / radius + 1) / 2, (z1 / radius + 1) / 2);
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

function createTetrahedron(radius) {
    const a = radius * Math.sqrt(8 / 9);
    const b = radius * Math.sqrt(2 / 9);
    const c = radius * Math.sqrt(2 / 3);
    const d = radius / 3;
    
    const vertices = [
        [0, radius, 0],
        [-c, -d, -b],
        [c, -d, -b],
        [0, -d, a]
    ];
    
    const faces = [[0, 1, 2], [0, 2, 3], [0, 3, 1], [1, 3, 2]];
    
    const positions = [];
    const uvs = [];
    
    for (const face of faces) {
        for (const idx of face) {
            const v = vertices[idx];
            positions.push(...v);
            uvs.push(...sphericalUV(...v));
        }
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

function createOctahedron(radius) {
    const vertices = [
        [0, radius, 0], [0, -radius, 0],
        [radius, 0, 0], [-radius, 0, 0],
        [0, 0, radius], [0, 0, -radius]
    ];
    
    const faces = [
        [0, 4, 2], [0, 2, 5], [0, 5, 3], [0, 3, 4],
        [1, 2, 4], [1, 5, 2], [1, 3, 5], [1, 4, 3]
    ];
    
    const positions = [];
    const uvs = [];
    
    for (const face of faces) {
        for (const idx of face) {
            const v = vertices[idx];
            positions.push(...v);
            uvs.push(...sphericalUV(...v));
        }
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

function createTorus(majorRadius, minorRadius, majorSegments = 32, minorSegments = 16) {
    const positions = [];
    const uvs = [];
    
    function torusPoint(theta, phi) {
        const x = (majorRadius + minorRadius * Math.cos(phi)) * Math.cos(theta);
        const y = minorRadius * Math.sin(phi);
        const z = (majorRadius + minorRadius * Math.cos(phi)) * Math.sin(theta);
        return [x, y, z];
    }
    
    for (let j = 0; j < majorSegments; j++) {
        const u0 = j / majorSegments, u1 = (j + 1) / majorSegments;
        const theta0 = u0 * Math.PI * 2, theta1 = u1 * Math.PI * 2;
        
        for (let i = 0; i < minorSegments; i++) {
            const v0 = i / minorSegments, v1 = (i + 1) / minorSegments;
            const phi0 = v0 * Math.PI * 2, phi1 = v1 * Math.PI * 2;
            
            const p00 = torusPoint(theta0, phi0);
            const p10 = torusPoint(theta1, phi0);
            const p01 = torusPoint(theta0, phi1);
            const p11 = torusPoint(theta1, phi1);
            
            positions.push(...p00, ...p10, ...p11);
            positions.push(...p00, ...p11, ...p01);
            uvs.push(u0, v0, u1, v0, u1, v1);
            uvs.push(u0, v0, u1, v1, u0, v1);
        }
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

// ========== Main Application ==========

async function main() {
    const canvas = document.getElementById('c');
    
    // Initialize WebGL (WebGL1)
    const gl = canvas.getContext('webgl');
    
    // Setup canvas size
    function resize() {
        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);
    
    // Create shader program
    const program = createProgram(gl, vsSource, fsSource);
    const aPosition = gl.getAttribLocation(program, 'aPosition');
    const aTexCoord = gl.getAttribLocation(program, 'aTexCoord');
    const uModelViewMatrix = gl.getUniformLocation(program, 'uModelViewMatrix');
    const uProjectionMatrix = gl.getUniformLocation(program, 'uProjectionMatrix');
    const uTexture = gl.getUniformLocation(program, 'uTexture');
    
    // Load texture
    const texture = await loadTexture(gl, TEXTURE_URL);
    
    // Load Manifold
    const wasm = await Module();
    wasm.setup();
    const { Manifold } = wasm;
    
    // Create primitives
    
    const spacing = 2.5;
    const meshes = [];
    let totalTriangles = 0;
    
    const primitives = [
        // Row 1
        { name: 'Plane', pos: [-spacing, spacing, 0], data: createPlane(1.5, 1.5, 4) },
        { name: 'Cube', pos: [0, spacing, 0], data: (() => {
            const cube = Manifold.cube([1.2, 1.2, 1.2], true);
            const data = manifoldToArrays(cube, boxUV);
            cube.delete();
            return data;
        })() },
        { name: 'Sphere', pos: [spacing, spacing, 0], data: (() => {
            const sphere = Manifold.sphere(0.8, 48);
            const data = manifoldToArrays(sphere, sphericalUV, true);
            sphere.delete();
            return data;
        })() },
        
        // Row 2
        { name: 'Circle', pos: [-spacing, 0, 0], data: createCircle(0.8, 32), rotateX: -Math.PI / 2 },
        { name: 'Cylinder', pos: [0, 0, 0], data: (() => {
            const cyl = Manifold.cylinder(1.2, 0.6, 0.6, 32);
            const data = manifoldToArrays(cyl, (x, y, z) => cylindricalUV(x, y, z, 1.2), true);
            cyl.delete();
            return data;
        })() },
        { name: 'Cone', pos: [spacing, 0, 0], data: (() => {
            const cone = Manifold.cylinder(1.2, 0.7, 0.0, 32);
            const data = manifoldToArrays(cone, (x, y, z) => cylindricalUV(x, y, z, 1.2), true);
            cone.delete();
            return data;
        })() },
        
        // Row 3
        { name: 'Tetra', pos: [-spacing, -spacing, 0], data: createTetrahedron(0.8) },
        { name: 'Octa', pos: [0, -spacing, 0], data: createOctahedron(0.8) },
        { name: 'Torus', pos: [spacing, -spacing, 0], data: createTorus(0.5, 0.25, 32, 16) }
    ];
    
    // Create buffers for each primitive (WebGL1: no VAO)
    for (const prim of primitives) {
        // Position buffer
        const posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, prim.data.positions, gl.STATIC_DRAW);
        
        // UV buffer
        const uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, prim.data.uvs, gl.STATIC_DRAW);
        
        meshes.push({
            posBuffer,
            uvBuffer,
            vertexCount: prim.data.vertexCount,
            position: prim.pos,
            rotateX: prim.rotateX || 0
        });
        
        totalTriangles += prim.data.vertexCount / 3;
    }
    
    // Setup matrices
    const projectionMatrix = mat4.create();
    const viewMatrix = mat4.create();
    const modelViewMatrix = mat4.create();
    
    // Setup GL state
    gl.enable(gl.DEPTH_TEST);
    // Disable culling for double-sided rendering
    gl.disable(gl.CULL_FACE);
    
    // Render loop
    function render() {
        const time = Date.now() / 1000;
        
        gl.clearColor(0.0, 0.0, 0.02, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        // Update projection matrix
        const aspect = canvas.width / canvas.height;
        mat4.perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 100);
        
        // View matrix (camera)
        mat4.lookAt(viewMatrix, [0, 0, 10], [0, 0, 0], [0, 1, 0]);
        
        gl.useProgram(program);
        gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
        
        // Bind texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uTexture, 0);
        
        // Draw each mesh
        for (const mesh of meshes) {
            mat4.copy(modelViewMatrix, viewMatrix);
            mat4.translate(modelViewMatrix, modelViewMatrix, mesh.position);
            mat4.rotateY(modelViewMatrix, modelViewMatrix, time * 0.5);
            if (mesh.rotateX) {
                mat4.rotateX(modelViewMatrix, modelViewMatrix, mesh.rotateX);
            }
            
            gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
            
            // Bind position buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.posBuffer);
            gl.enableVertexAttribArray(aPosition);
            gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
            
            // Bind UV buffer
            gl.bindBuffer(gl.ARRAY_BUFFER, mesh.uvBuffer);
            gl.enableVertexAttribArray(aTexCoord);
            gl.vertexAttribPointer(aTexCoord, 2, gl.FLOAT, false, 0, 0);
            
            gl.drawArrays(gl.TRIANGLES, 0, mesh.vertexCount);
        }
        
        requestAnimationFrame(render);
    }
    
    render();
}

main();
