let width = window.innerWidth;
let height = window.innerHeight;

let canvas = document.getElementById("c");
canvas.width = width;
canvas.height = height;

document.body.appendChild( canvas );
let renderer = new zen3d.Renderer(canvas);
renderer.glCore.state.colorBuffer.setClear(1.0, 1.0, 1.0, 1.0);
renderer.glCore.gl.disable(renderer.glCore.gl.CULL_FACE);

let scene = new zen3d.Scene();
let texture = zen3d.Texture2D.fromSrc("../../../assets/textures/frog.jpg"); // 256x256
let shader = {
    vertexShader: document.getElementById('vs').textContent,
    fragmentShader: document.getElementById('fs').textContent,
    uniforms: {
        diffuseMap: texture,
    }
};
let material = new zen3d.ShaderMaterial(shader);
let geometry = new zen3d.Geometry();

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
let positions = [ 
    // Front face
    -0.5, -0.5,  0.5, // v0
     0.5, -0.5,  0.5, // v1
     0.5,  0.5,  0.5, // v2
    -0.5,  0.5,  0.5, // v3
    // Back face
    -0.5, -0.5, -0.5, // v4
     0.5, -0.5, -0.5, // v5
     0.5,  0.5, -0.5, // v6
    -0.5,  0.5, -0.5, // v7
    // Top face
     0.5,  0.5,  0.5, // v2
    -0.5,  0.5,  0.5, // v3
    -0.5,  0.5, -0.5, // v7
     0.5,  0.5, -0.5, // v6
    // Bottom face
    -0.5, -0.5,  0.5, // v0
     0.5, -0.5,  0.5, // v1
     0.5, -0.5, -0.5, // v5
    -0.5, -0.5, -0.5, // v4
     // Right face
     0.5, -0.5,  0.5, // v1
     0.5,  0.5,  0.5, // v2
     0.5,  0.5, -0.5, // v6
     0.5, -0.5, -0.5, // v5
     // Left face
    -0.5, -0.5,  0.5, // v0
    -0.5,  0.5,  0.5, // v3
    -0.5,  0.5, -0.5, // v7
    -0.5, -0.5, -0.5  // v4
];

let textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];
let indices = [
     0,  1,  2,    0,  2 , 3,  // Front face
     4,  5,  6,    4,  6 , 7,  // Back face
     8,  9, 10,    8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15,  // Bottom face
    16, 17, 18,   16, 18, 19,  // Right face
    20, 21, 22,   20, 22, 23   // Left face
];

geometry.setIndex(indices);
geometry.addAttribute('a_Position', new zen3d.BufferAttribute(new Float32Array(positions), 3));
geometry.addAttribute('a_Uv', new zen3d.BufferAttribute(new Float32Array(textureCoords), 2));

let cube = new zen3d.Mesh(geometry, material);
scene.add(cube);

let camera = new zen3d.Camera();
camera.position.set(0, 2, 3);
camera.lookAt(new zen3d.Vector3(0, 0, 0), new zen3d.Vector3(0, 1, 0));
camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);
scene.add(camera);

let lastCount = 0;
function loop(count) {

    requestAnimationFrame(loop);

    let delta = count - lastCount;
    lastCount = count;

    // rotate camera
    camera.position.x = - 3 * Math.sin(count / 1000);
    camera.position.z = 3 * Math.cos(count / 1000);
    camera.lookAt(new zen3d.Vector3(0, 0, 0), new zen3d.Vector3(0, 1, 0));

    renderer.render(scene, camera);
}

loop(0);

function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);

    renderer.backRenderTarget.resize(width, height);
}

window.addEventListener("resize", onWindowResize, false);
