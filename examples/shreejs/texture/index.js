var container;
var camera, scene, renderer;
var mesh;

var img = new Image();
img.onload = function(event) {
    init();
    animate();
}
img.src = '../../../assets/textures/frog.jpg'; // 256x256

function init() {
    container = document.getElementById('container');
    camera = new SHREE.Camera();
    //camera.position.z = 2;
    camera.position.z = 1.5;
    scene = new SHREE.Scene();

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
    var vertexPositions = [
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
    
    var texcoord = new Float32Array([
        // Front face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Back face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Top face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Bottom face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Right face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Left face
        1, 0,
        0, 0,
        0, 1,
        1, 1
    ]);

    var geometry = new SHREE.Geometry();
    geometry.addAttribute('position', 3, vertexPositions);
    geometry.addAttribute('textureCoord', 2, texcoord);
    geometry.index = [
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ];
    var material = new SHREE.Material({
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
        uniforms: { texture: { type: 't', value: img } },
        side: 'SIDE_DOUBLE'
    });

    mesh = new SHREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new SHREE.Renderer();
    renderer.clearColor = [1.0, 1.0, 1.0, 1.0];
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

var rad = 0;
function render() {
    rad += Math.PI * 1.0 / 180.0
    mesh.rotation.x = rad;
    mesh.rotation.y = rad;
    mesh.rotation.z = rad;
    renderer.render(scene, camera);
}
