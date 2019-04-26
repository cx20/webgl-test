var container;
var camera, scene, renderer;

init();
animate();

function init() {
    container = document.getElementById('container');
    camera = new SHREE.Camera();
    camera.position.z = 2;
    scene = new SHREE.Scene();

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
        -0.5, 0.5, 0.0, // v0
         0.5, 0.5, 0.0, // v1 
        -0.5,-0.5, 0.0, // v2
         0.5,-0.5, 0.0  // v3
    ];
    
    var vertexColors = [
        1.0, 0.0, 0.0, 1.0, // v0
        0.0, 1.0, 0.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0, // v2
        1.0, 1.0, 0.0, 1.0  // v3
    ];

    var geometry = new SHREE.Geometry();
    geometry.addAttribute('position', 3, vertexPositions);
    geometry.addAttribute('color', 4, vertexColors);
    geometry.index = [
        2, 0, 1, // v2-v0-v1
        2, 1, 3  // v2-v1-v3
    ];
    
    var material = new SHREE.Material({
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
        side: 'SIDE_DOUBLE'
   });

    var mesh = new SHREE.Mesh(geometry, material);
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

function render() {
    renderer.render(scene, camera);
}
