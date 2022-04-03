import * as THREE from 'three';

let container;
let camera, scene, renderer;
let mesh;
let angle = 0;

init();
animate();

function init() {
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 5;
    scene = new THREE.Scene();

    // Cube data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //         [7]------[6]
    //        / |      / |
    //      [3]------[2] |
    //       |  |     |  |
    //       | [4]----|-[5]
    //       |/       |/
    //      [0]------[1]
    //
    let vertexPositions = [
            // Front face
            [-0.5, -0.5,  0.5], // v0
            [ 0.5, -0.5,  0.5], // v1
            [ 0.5,  0.5,  0.5], // v2
            [-0.5,  0.5,  0.5], // v3
            // Back face
            [-0.5, -0.5, -0.5], // v4
            [ 0.5, -0.5, -0.5], // v5
            [ 0.5,  0.5, -0.5], // v6
            [-0.5,  0.5, -0.5], // v7
            // Top face
            [ 0.5,  0.5,  0.5], // v2
            [-0.5,  0.5,  0.5], // v3
            [-0.5,  0.5, -0.5], // v7
            [ 0.5,  0.5, -0.5], // v6
            // Bottom face
            [-0.5, -0.5,  0.5], // v0
            [ 0.5, -0.5,  0.5], // v1
            [ 0.5, -0.5, -0.5], // v5
            [-0.5, -0.5, -0.5], // v4
            // Right face
            [ 0.5, -0.5,  0.5], // v1
            [ 0.5,  0.5,  0.5], // v2
            [ 0.5,  0.5, -0.5], // v6
            [ 0.5, -0.5, -0.5], // v5
            // Left face
            [-0.5, -0.5,  0.5], // v0
            [-0.5,  0.5,  0.5], // v3
            [-0.5,  0.5, -0.5], // v7
            [-0.5, -0.5, -0.5]  // v4
    ];
    let vertices = new Float32Array(vertexPositions.length * 3);
    for (let i = 0; i < vertexPositions.length; i++) {
        vertices[i * 3 + 0] = vertexPositions[i][0];
        vertices[i * 3 + 1] = vertexPositions[i][1];
        vertices[i * 3 + 2] = vertexPositions[i][2];
    }

    let vertexColors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0], // Left face
            [0.0, 0.0, 1.0, 1.0], // Left face
            [0.0, 0.0, 1.0, 1.0], // Left face
            [0.0, 0.0, 1.0, 1.0]  // Left face
    ];
    let colors = new Float32Array(vertexColors.length * 4);
    for (let i = 0; i < vertexColors.length; i++) {
        colors[i * 4 + 0] = vertexColors[i][0];
        colors[i * 4 + 1] = vertexColors[i][1];
        colors[i * 4 + 2] = vertexColors[i][2];
        colors[i * 4 + 3] = vertexColors[i][3];
    }
    
    let indices = new Uint16Array([
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ]);
    
    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 4));
    geometry.setIndex(new THREE.BufferAttribute(indices, 1));

    let material = new THREE.RawShaderMaterial({
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function animate(timestamp) {
    requestAnimationFrame(animate);
    render(timestamp);
}

function render(timestamp) {
    //angle += Math.PI / 180;
    angle = timestamp / 1000; // Seconds since the first requestAnimationFrame (ms)
    let axis = new THREE.Vector3(1,1,1).normalize();
    let q = new THREE.Quaternion();
    q.setFromAxisAngle(axis,angle);
    mesh.quaternion.copy(q);
    
    renderer.render(scene, camera);
}
