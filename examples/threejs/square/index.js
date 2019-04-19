var container;
var camera, scene, renderer;

init();
animate();

function init() {
    container = document.getElementById('container');
    //camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 10);
    camera = new THREE.PerspectiveCamera(30, 465/465, 1, 10);
    camera.position.z = 2;
    scene = new THREE.Scene();

    // Square data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //        [0]------[1]
    //         |      / |
    //         |    /   |
    //         |  /     |
    //        [2]------[3]
    //
    var vertexPositions = [
        [-0.5, 0.5, 0.0], // v0
        [ 0.5, 0.5, 0.0], // v1 
        [-0.5,-0.5, 0.0], // v2
        [ 0.5,-0.5, 0.0]  // v3
    ];
    var vertices = new Float32Array(vertexPositions.length * 3);
    for (var i = 0; i < vertexPositions.length; i++) {
        vertices[i * 3 + 0] = vertexPositions[i][0];
        vertices[i * 3 + 1] = vertexPositions[i][1];
        vertices[i * 3 + 2] = vertexPositions[i][2];
    }

    var vertexColors = [
        [1.0, 0.0, 0.0, 1.0], // v0
        [0.0, 1.0, 0.0, 1.0], // v1
        [0.0, 0.0, 1.0, 1.0], // v2
        [1.0, 1.0, 0.0, 1.0]  // v3
    ];
    var colors = new Float32Array(vertexColors.length * 4);
    for (var i = 0; i < vertexColors.length; i++) {
        colors[i * 4 + 0] = vertexColors[i][0];
        colors[i * 4 + 1] = vertexColors[i][1];
        colors[i * 4 + 2] = vertexColors[i][2];
        colors[i * 4 + 3] = vertexColors[i][3];
    }
    
    var indices = new Uint16Array([
        2, 0, 1, // v2-v0-v1
        2, 1, 3  // v2-v1-v3
    ]);
    
    var geometry = new THREE.BufferGeometry();
    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4));
    geometry.addAttribute('index', new THREE.BufferAttribute(indices, 1));
    
    var material = new THREE.RawShaderMaterial({
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });

    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    renderer.render(scene, camera);
}
