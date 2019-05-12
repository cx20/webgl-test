let container;
let camera, scene, renderer;
let mesh;
let rad = 0;

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

let img = new Image();
img.onload = function(event) {
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
    $.getJSON("../../../assets/json/teapot.json", function (data) {
        vertexPositions = data.vertexPositions;
        vertexTextureCoords = data.vertexTextureCoords;
        vertexNormals = data.vertexNormals;
        indices = data.indices;

        init();
        animate();
    });
}
// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
img.src = '../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg';

function init() {
    container = document.getElementById('container');
    camera = new SHREE.Camera();
    camera.position.z = 30;
    scene = new SHREE.Scene();

    let positions = new Float32Array(vertexPositions);
    let normals = new Float32Array(vertexNormals);
    let texcoord = new Float32Array(vertexTextureCoords);

    let geometry = new SHREE.Geometry();
    geometry.addAttribute('position', 3, positions);
    geometry.addAttribute('normal', 3, normals);
    geometry.addAttribute('textureCoord', 2, texcoord);
    geometry.index = indices;
    let material = new SHREE.Material({
        vertexShader: document.getElementById('vs').textContent,
        fragmentShader: document.getElementById('fs').textContent,
        uniforms: { 
            texture: { type: 't', value: img }
        },
        side: 'SIDE_DOUBLE'
    });

    mesh = new SHREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new SHREE.Renderer();
    renderer.clearColor = [0.0, 0.0, 0.0, 1.0];
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    rad += Math.PI * 1.0 / 180.0
    mesh.rotation.y = rad;
    renderer.render(scene, camera);
}
