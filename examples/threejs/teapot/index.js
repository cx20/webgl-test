import * as THREE from 'https://cx20.github.io/gltf-test/libs/three.js/r129/build/three.module.js';

let container;
let camera, scene, renderer;
let mesh;
let angle = 0;

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

function init() {
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 35;
    scene = new THREE.Scene();

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
    directionalLight.position.set( 1, 0, 1 );
    scene.add( directionalLight );

    let geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertexPositions), 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(vertexNormals), 3));
    geometry.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(vertexTextureCoords), 2));
    geometry.setIndex(new THREE.BufferAttribute(new Uint16Array(indices),1));
    
    let loader = new THREE.TextureLoader();
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
    let texture = loader.load('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    let material = new THREE.MeshLambertMaterial({
        map: texture
    });

    mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    let axis = new THREE.Vector3(0, 1, 0).normalize();
    angle += Math.PI / 180;
    let q = new THREE.Quaternion();
    q.setFromAxisAngle(axis,angle);
    mesh.quaternion.copy(q);
    
    renderer.render(scene, camera);
}

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;
    init();
    animate();
});
