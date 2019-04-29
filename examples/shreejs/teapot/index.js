var container;
var camera, scene, renderer;
var mesh;

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

var img = new Image();
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

    var positions = new Float32Array(vertexPositions);
    var normals = new Float32Array(vertexNormals);
    var texcoord = new Float32Array(vertexTextureCoords);

    var geometry = new SHREE.Geometry();
    geometry.addAttribute('position', 3, positions);
    geometry.addAttribute('normal', 3, normals);
    geometry.addAttribute('textureCoord', 2, texcoord);
    geometry.index = indices;
    var material = new SHREE.Material({
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

var rad = 0;
function render() {
    rad += Math.PI * 1.0 / 180.0
    mesh.rotation.y = rad;
    renderer.render(scene, camera);
}
