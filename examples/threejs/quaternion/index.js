import * as THREE from 'https://cx20.github.io/gltf-test/libs/three.js/r119/build/three.module.js';

let renderer, scene, camera, mesh1, mesh2, material;
let angle = 0;

init();
animate();

function init() {

    // dom
    let container = document.getElementById( 'container' );

    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    container.appendChild( renderer.domElement );
    
    // scene
    scene = new THREE.Scene();

    //camera
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 400;

    // particle system geometry
    let geometry = new THREE.CubeGeometry(80, 80, 80);

    material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });
    //material = new THREE.MeshLambertMaterial({ color: 0xff0000, wireframe: true });
    mesh1 = new THREE.Mesh(geometry, material);
    mesh2 = new THREE.Mesh(geometry, material);
    mesh1.position.x = -80.0;
    mesh2.position.x = +80.0;
    
    scene.add( mesh1 );
    scene.add( mesh2 );

    let axis1 =  new THREE.AxesHelper(160);
    let axis2 =  new THREE.AxesHelper(160);
    mesh1.add(axis1);
    mesh2.add(axis2);

    let directionalLight = new THREE.DirectionalLight( 0xffffff, 3 );
    directionalLight.position.z = 3;
    scene.add( directionalLight );
}

function animate() {

    requestAnimationFrame( animate );

    render();

}

function render() {

    // rotate
    mesh1.rotation.x += Math.PI / 180;
    mesh1.rotation.y += Math.PI / 180;
    mesh1.rotation.z += Math.PI / 180;
    
    // quaternion
    let axis = new THREE.Vector3(1,1,1).normalize();
    angle += Math.PI / 180;
    let q = new THREE.Quaternion();
    q.setFromAxisAngle(axis,angle);
    mesh2.quaternion.copy(q);

    // render
    renderer.render( scene, camera );

}
