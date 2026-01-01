/*
// file : primitive.mat
// usage : matc -o primitive.filamat primitive.mat
material {
    name : texture,
    parameters : [
        {
           type : sampler2d,
           name : texture
        }
    ],
    requires : [
        uv0
    ],
    shadingModel : unlit,
    culling : none
}

fragment {
    void material(inout MaterialInputs material) {
        prepareMaterial(material);
        material.baseColor = texture(materialParams_texture, getUV0());
    }
}
*/

import Module from 'https://esm.run/manifold-3d';

const FILAMAT_URL = 'https://cx20.github.io/webgl-test/examples/filament/texture/texture.filamat';
const TEXTURE_URL = 'https://cx20.github.io/webgl-test/assets/textures/earth.jpg';

// ========== UV Mapping Functions ==========

// Spherical UV mapping
function sphericalUV(x, y, z) {
    const len = Math.hypot(x, y, z);
    if (len === 0) return [0.5, 0.5];
    const nx = x / len, ny = y / len, nz = z / len;
    const u = 0.5 - Math.atan2(nz, nx) / (2 * Math.PI);
    const v = 0.5 + Math.asin(Math.max(-1, Math.min(1, ny))) / Math.PI;
    return [u, v];
}

// Planar UV mapping (XY plane)
function planarUV(x, y, z, scale = 1) {
    return [(x * scale + 1) / 2, (y * scale + 1) / 2];
}

// Cylindrical UV mapping
function cylindricalUV(x, y, z, height = 1) {
    const u = 0.5 - Math.atan2(z, x) / (2 * Math.PI);
    const v = (y + height / 2) / height;
    return [u, v];
}

// Box UV mapping
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

// Fix UV seam
function fixSeamUVs(uv0, uv1, uv2) {
    let u0 = uv0[0], u1 = uv1[0], u2 = uv2[0];
    if (Math.abs(u0 - u1) > 0.5) { if (u0 < u1) u0 += 1.0; else u1 += 1.0; }
    if (Math.abs(u1 - u2) > 0.5) { if (u1 < u2) u1 += 1.0; else u2 += 1.0; }
    if (Math.abs(u0 - u2) > 0.5) { if (u0 < u2) u0 += 1.0; else u2 += 1.0; }
    return [[u0, uv0[1]], [u1, uv1[1]], [u2, uv2[1]]];
}

// ========== Manifold to Arrays Converter ==========

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

// ========== Custom Geometry Creators ==========

// Create plane geometry (not using Manifold - just 2 triangles)
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
            
            // Two triangles per segment
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

// Create circle geometry (disc)
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

// Create tetrahedron
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
    
    const faces = [
        [0, 1, 2],
        [0, 2, 3],
        [0, 3, 1],
        [1, 3, 2]
    ];
    
    const positions = [];
    const uvs = [];
    
    for (const face of faces) {
        for (const idx of face) {
            const v = vertices[idx];
            positions.push(...v);
            const uv = sphericalUV(...v);
            uvs.push(...uv);
        }
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

// Create octahedron
function createOctahedron(radius) {
    const vertices = [
        [0, radius, 0],   // top
        [0, -radius, 0],  // bottom
        [radius, 0, 0],   // +X
        [-radius, 0, 0],  // -X
        [0, 0, radius],   // +Z
        [0, 0, -radius]   // -Z
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
            const uv = sphericalUV(...v);
            uvs.push(...uv);
        }
    }
    
    return {
        positions: new Float32Array(positions),
        uvs: new Float32Array(uvs),
        vertexCount: positions.length / 3
    };
}

// Create torus using Manifold's revolve (or manual)
function createTorus(majorRadius, minorRadius, majorSegments = 32, minorSegments = 16) {
    const positions = [];
    const uvs = [];
    
    for (let j = 0; j < majorSegments; j++) {
        const u0 = j / majorSegments;
        const u1 = (j + 1) / majorSegments;
        const theta0 = u0 * Math.PI * 2;
        const theta1 = u1 * Math.PI * 2;
        
        for (let i = 0; i < minorSegments; i++) {
            const v0 = i / minorSegments;
            const v1 = (i + 1) / minorSegments;
            const phi0 = v0 * Math.PI * 2;
            const phi1 = v1 * Math.PI * 2;
            
            // Four corners of quad
            const p00 = torusPoint(majorRadius, minorRadius, theta0, phi0);
            const p10 = torusPoint(majorRadius, minorRadius, theta1, phi0);
            const p01 = torusPoint(majorRadius, minorRadius, theta0, phi1);
            const p11 = torusPoint(majorRadius, minorRadius, theta1, phi1);
            
            // Two triangles
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

function torusPoint(R, r, theta, phi) {
    const x = (R + r * Math.cos(phi)) * Math.cos(theta);
    const y = r * Math.sin(phi);
    const z = (R + r * Math.cos(phi)) * Math.sin(theta);
    return [x, y, z];
}

// ========== Main Application ==========

class App {
    constructor(Manifold) {
        this.canvas = document.getElementById('canvas');
        this.info = document.getElementById('info');
        const engine = this.engine = Filament.Engine.create(this.canvas);
        this.scene = engine.createScene();
        this.meshes = [];

        // Create texture
        const texture = engine.createTextureFromJpeg(TEXTURE_URL, { nomips: true });

        const spacing = 2.5;
        let totalTriangles = 0;

        // Row 1: Plane, Cube, Sphere
        // Row 2: Circle, Cylinder, Cone
        // Row 3: Tetra, Octa, Torus

        const primitives = [
            // Row 1
            { name: 'Plane', pos: [-spacing, spacing, 0], create: () => createPlane(1.5, 1.5, 4) },
            { name: 'Cube', pos: [0, spacing, 0], create: () => {
                const cube = Manifold.cube([1.2, 1.2, 1.2], true);
                const data = manifoldToArrays(cube, (x, y, z) => boxUV(x, y, z));
                cube.delete();
                return data;
            }},
            { name: 'Sphere', pos: [spacing, spacing, 0], create: () => {
                const sphere = Manifold.sphere(0.8, 48);
                const data = manifoldToArrays(sphere, sphericalUV, true);
                sphere.delete();
                return data;
            }},
            
            // Row 2
            { name: 'Circle', pos: [-spacing, 0, 0], create: () => createCircle(0.8, 32), rotateX: -Math.PI / 2 },
            { name: 'Cylinder', pos: [0, 0, 0], create: () => {
                const cyl = Manifold.cylinder(1.2, 0.6, 0.6, 32);
                const data = manifoldToArrays(cyl, (x, y, z) => cylindricalUV(x, y, z, 1.2), true);
                cyl.delete();
                return data;
            }},
            { name: 'Cone', pos: [spacing, 0, 0], create: () => {
                const cone = Manifold.cylinder(1.2, 0.7, 0.0, 32);
                const data = manifoldToArrays(cone, (x, y, z) => cylindricalUV(x, y, z, 1.2), true);
                cone.delete();
                return data;
            }},
            
            // Row 3
            { name: 'Tetra', pos: [-spacing, -spacing, 0], create: () => createTetrahedron(0.8) },
            { name: 'Octa', pos: [0, -spacing, 0], create: () => createOctahedron(0.8) },
            { name: 'Torus', pos: [spacing, -spacing, 0], create: () => createTorus(0.5, 0.25, 32, 16) }
        ];

        for (const prim of primitives) {
            console.log(`Creating ${prim.name}...`);
            const data = prim.create();
            totalTriangles += data.vertexCount / 3;
            
            const mesh = this.createMesh(engine, data, texture, prim.pos, prim.rotateX || 0);
            this.meshes.push(mesh);
        }

        this.info.innerHTML = `<b>Filament + Manifold-3D Primitives</b><br>
            Shapes: ${primitives.length}<br>
            Triangles: ${totalTriangles.toLocaleString()}`;

        // Setup rendering
        this.swapChain = engine.createSwapChain();
        this.renderer = engine.createRenderer();
        this.camera = engine.createCamera(Filament.EntityManager.get().create());
        this.view = engine.createView();
        this.view.setCamera(this.camera);
        this.view.setScene(this.scene);
        this.renderer.setClearOptions({ clearColor: [0.0, 0.0, 0.02, 1.0], clear: true });
        
        this.resize();
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        window.requestAnimationFrame(this.render);
    }

    createMesh(engine, data, texture, position, rotateX = 0) {
        const entity = Filament.EntityManager.get().create();
        this.scene.addEntity(entity);

        const VertexAttribute = Filament.VertexAttribute;
        const AttributeType = Filament.VertexBuffer$AttributeType;
        
        const vb = Filament.VertexBuffer.Builder()
            .vertexCount(data.vertexCount)
            .bufferCount(2)
            .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT3, 0, 12)
            .attribute(VertexAttribute.UV0, 1, AttributeType.FLOAT2, 0, 8)
            .build(engine);

        vb.setBufferAt(engine, 0, data.positions);
        vb.setBufferAt(engine, 1, data.uvs);

        const indices = new Uint16Array(data.vertexCount);
        for (let i = 0; i < data.vertexCount; i++) indices[i] = i;
        
        const ib = Filament.IndexBuffer.Builder()
            .indexCount(data.vertexCount)
            .bufferType(Filament.IndexBuffer$IndexType.USHORT)
            .build(engine);
        ib.setBuffer(engine, indices);

        const mat = engine.createMaterial(FILAMAT_URL);
        const matinst = mat.createInstance();

        const sampler = new Filament.TextureSampler(
            Filament.MinFilter.LINEAR,
            Filament.MagFilter.LINEAR,
            Filament.WrapMode.REPEAT
        );
        matinst.setTextureParameter('texture', texture, sampler);

        Filament.RenderableManager.Builder(1)
            .boundingBox({ center: [0, 0, 0], halfExtent: [1, 1, 1] })
            .material(0, matinst)
            .geometry(0, Filament.RenderableManager$PrimitiveType.TRIANGLES, vb, ib)
            .culling(false)
            .build(engine, entity);

        return { entity, position, rotateX };
    }

    render() {
        const time = Date.now() / 1000;
        const tcm = this.engine.getTransformManager();
        
        for (const mesh of this.meshes) {
            const transform = mat4.create();
            mat4.translate(transform, transform, mesh.position);
            mat4.rotateY(transform, transform, time * 0.5);
            if (mesh.rotateX) {
                mat4.rotateX(transform, transform, mesh.rotateX);
            }
            
            const inst = tcm.getInstance(mesh.entity);
            tcm.setTransform(inst, transform);
            inst.delete();
        }

        this.renderer.render(this.swapChain, this.view);
        window.requestAnimationFrame(this.render);
    }

    resize() {
        const dpr = window.devicePixelRatio;
        const width = this.canvas.width = window.innerWidth * dpr;
        const height = this.canvas.height = window.innerHeight * dpr;
        this.view.setViewport([0, 0, width, height]);

        const Fov = Filament.Camera$Fov;
        this.camera.setProjectionFov(45, width / height, 0.1, 100.0, Fov.VERTICAL);
        
        const eye = [0, 0, 10], center = [0, 0, 0], up = [0, 1, 0];
        this.camera.lookAt(eye, center, up);
    }
}

async function main() {
    const info = document.getElementById('info');
    
    info.textContent = 'Loading Manifold-3D...';
    const wasm = await Module();
    wasm.setup();
    const { Manifold } = wasm;
    console.log('Manifold-3D ready!');
    
    info.textContent = 'Loading Filament...';

    Filament.init([FILAMAT_URL, TEXTURE_URL], () => {
        console.log('Filament ready!');
        window.app = new App(Manifold);
    });
}

main();
