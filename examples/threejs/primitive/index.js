import * as THREE from 'https://cx20.github.io/gltf-test/libs/three.js/r128/build/three.module.js';
import { OrbitControls } from 'https://cx20.github.io/gltf-test/libs/three.js/r128/examples/jsm/controls/OrbitControls.js';

let container;
let camera, scene, renderer;
let controls;
let meshPlane;
let meshCube;
let meshSphere;
let meshCircle;
let meshCylinder;
let meshCone;
let meshTetra;
let meshOcta;
let meshTorus;
let rad = 0.0;

init();
animate();

function init() {
    container = document.getElementById('container');
    camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 9;
    scene = new THREE.Scene();
    let loader = new THREE.TextureLoader();
    let texture = loader.load('../../../assets/textures/earth.jpg');
    
    let material = new THREE.MeshBasicMaterial({
        map: texture
    });

    // PlaneGeometry(width, height, segmentsWidth, segmentsHeight)
    let geometryPlane = new THREE.PlaneGeometry(1, 1, 10, 10);
    meshPlane = new THREE.Mesh(geometryPlane, material);
    meshPlane.position.set(-1.5, 1.5, 0);

    // BoxGeometry(width, height, depth, widthSegments, heightSegments, depthSegments)
    let geometryCube = new THREE.BoxGeometry(1, 1, 1);
    meshCube = new THREE.Mesh(geometryCube, material);
    meshCube.position.set(0, 1.5, 0);

    // SphereGeometry(radius, segmentsWidth, segmentsHeight, phiStart, phiLength, thetaStart, thetaLength)
    let geometrySphere = new THREE.SphereGeometry(0.5, 24, 24);
    meshSphere = new THREE.Mesh(geometrySphere, material);
    meshSphere.position.set(1.5, 1.5, 0);
    
    // CircleGeometry(radius, segments, thetaStart, thetaLength)
    let geometryCircle = new THREE.CircleGeometry(0.5, 24);
    meshCircle = new THREE.Mesh(geometryCircle, material);
    meshCircle.position.set(-1.5, 0, 0);

    // CylinderGeomtry(radiusTop, radiusBottom, height, segmentRadius, segmentHeight, openEnded)
    let geometryCylinder = new THREE.CylinderGeometry(0.5, 0.5, 1, 24, 24);
    meshCylinder = new THREE.Mesh(geometryCylinder, material);
    meshCylinder.position.set(0, 0, 0);

    // CylinderGeomtry(radiusTop, radiusBottom, height, segmentRadius, segmentHeight, openEnded)
    let geometryCone = new THREE.CylinderGeometry(0.0, 0.5, 1, 24, 24);
    meshCone = new THREE.Mesh(geometryCone, material);
    meshCone.position.set(1.5, 0, 0);

    // TetrahedronGeometry(radius, detail)
    let geometryTetra = new THREE.TetrahedronGeometry(0.5, 0);
    meshTetra = new THREE.Mesh(geometryTetra, material);
    meshTetra.position.set(-1.5, -1.5, 0);

    // OctahedronGeometry(radius, detail)
    let geometryOcta = new THREE.OctahedronGeometry(0.5, 0);
    meshOcta = new THREE.Mesh(geometryOcta, material);
    meshOcta.position.set(0, -1.5, 0);

    // TorusGeometry(radius, tube, radialSegments, tubularSegments, arc)
    let geometryTorus = new THREE.TorusGeometry(0.4, 0.2, 16, 100);
    meshTorus = new THREE.Mesh(geometryTorus, material);
    meshTorus.position.set(1.5, -1.5, 0);

    scene.add(meshPlane);
    scene.add(meshCube);
    scene.add(meshSphere);
    scene.add(meshCircle);
    scene.add(meshCylinder);
    scene.add(meshCone);
    scene.add(meshTetra);
    scene.add(meshOcta);
    scene.add(meshTorus);

    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    controls = new OrbitControls( camera, renderer.domElement );
    controls.userPan = false;
    controls.userPanSpeed = 0.0;
    controls.maxDistance = 5000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 10.0;

}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {
    rad += Math.PI * 1.0 / 180.0

    meshPlane.rotation.y = rad;
    meshCube.rotation.y = rad;
    meshSphere.rotation.y = rad;
    meshCircle.rotation.y = rad;
    meshCylinder.rotation.y = rad;
    meshCone.rotation.y = rad;
    meshTetra.rotation.y = rad;
    meshOcta.rotation.y = rad;
    meshTorus.rotation.y = rad;

    renderer.render(scene, camera);

    controls.update();
}
