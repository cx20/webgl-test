//import * as THREE from 'https://cx20.github.io/gltf-test/libs/three.js/r122/build/three.module.js';
//import { OrbitControls } from 'https://cx20.github.io/gltf-test/libs/three.js/r122/examples/jsm/controls/OrbitControls.js';
//import { GLTFLoader } from 'https://cx20.github.io/gltf-test/libs/three.js/r122/examples/jsm/loaders/GLTFLoader.js';

let modelInfoSet = [
{
    name: "CesiumMilkTruck",
    scale: 0.4,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, -2],
    url: "https://cx20.github.io/gltf-test/sampleModels/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf"
}, {
    name: "Fox",
    scale: 0.05,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, 0],
    url: "https://cx20.github.io/gltf-test/sampleModels/Fox/glTF/Fox.gltf"
}, {
    name: "Rex",
    scale: 0.01,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, 3],
    url: "https://rawcdn.githack.com/BabylonJS/Exporters/9bc140006be149687be045f60b4a25cdb45ce4fc/Maya/Samples/glTF 2.0/T-Rex/trex_running.gltf"
}];

let mixers = [];
let clock = new THREE.Clock();
let scene;
let camera;
let renderer;
let controls;
let emitter, particleGroup;
let emitters = [];
let loader = new THREE.TextureLoader();
let width;
let height;

init();
animate();

function initParticles() {
    var texture = loader.load('../../../assets/textures/smokeparticle.png');

    particleGroup = new SPE.Group({
        texture: {
            value: texture
        },
        maxParticleCount: 1000, 
        blending: THREE.NormalBlending,
        transparent: true
    });
    
    var resolution = width / 1920;

    var emitterRightFront = new SPE.Emitter({
        maxAge:       { value: 0.1 },
        position:     { value: new THREE.Vector3(0.5, 0, -1.6),   spread: new THREE.Vector3( 0.5, 0.0, 0.0 ) },
        acceleration: { value: new THREE.Vector3(-5, 3, 0),    spread: new THREE.Vector3( -5, 1, 0 ) },
        velocity:     { value: new THREE.Vector3(0, 1, 0),    spread: new THREE.Vector3( 1, 1, 0 ) },
        color:        { value: [ new THREE.Color('#D0D0D0') ] },
        opacity:      { value: 0.5 },
        size:         { value: 1.0 * resolution},
        particleCount: 50
    });
    var emitterLeftFront = new SPE.Emitter({
        maxAge:       { value: 0.1 },
        position:     { value: new THREE.Vector3(0.5, 0, -2.35),   spread: new THREE.Vector3( 0.5, 0.0, 0.0 ) },
        acceleration: { value: new THREE.Vector3(-5, 3, 0),    spread: new THREE.Vector3( -5, 1, 0 ) },
        velocity:     { value: new THREE.Vector3(0, 1, 0),    spread: new THREE.Vector3( 1, 1, 0 ) },
        color:        { value: [ new THREE.Color('#D0D0D0') ] },
        opacity:      { value: 0.5 },
        size:         { value: 1.0 * resolution},
        particleCount: 50
    });
    var emitterRightBack = new SPE.Emitter({
        maxAge:       { value: 0.3 },
        position:     { value: new THREE.Vector3(-0.8, 0, -1.6),   spread: new THREE.Vector3( 0.5, 0.0, 0.0 ) },
        acceleration: { value: new THREE.Vector3(-5, 0, 0),    spread: new THREE.Vector3( -5, 1, 2 ) },
        velocity:     { value: new THREE.Vector3(0, 1, 0),    spread: new THREE.Vector3( 1, 1, 0 ) },
        color:        { value: [ new THREE.Color('#D0D0D0') ] },
        opacity:      { value: 0.5 },
        size:         { value: 1.0 * resolution},
        particleCount: 50
    });
    var emitterLeftBack = new SPE.Emitter({
        maxAge:       { value: 0.3 },
        position:     { value: new THREE.Vector3(-0.8, 0, -2.35),   spread: new THREE.Vector3( 0.5, 0.0, 0.0 ) },
        acceleration: { value: new THREE.Vector3(-5, 0, 0),    spread: new THREE.Vector3( -5, 1, 2 ) },
        velocity:     { value: new THREE.Vector3(0, 1, 0),    spread: new THREE.Vector3( 1, 1, 0 ) },
        color:        { value: [ new THREE.Color('#D0D0D0') ] },
        opacity:      { value: 0.5 },
        size:         { value: 1.0 * resolution},
        particleCount: 50
    });
    	
    emitters.push( emitterRightFront );
    emitters.push( emitterLeftFront );
    emitters.push( emitterRightBack );
    emitters.push( emitterLeftBack );
}

function init() {
    width = window.innerWidth;
    height = window.innerHeight;

    scene = new THREE.Scene();
    scene.position.y = -2;

    camera = new THREE.PerspectiveCamera(60, width / height, 0.01, 10000);
    camera.position.set(0, 2, 10);

    let geometry = new THREE.PlaneGeometry(100,0.1);
    let material = new THREE.MeshLambertMaterial({
        color: "#c5866F"
    });

    let ground1 = new THREE.Mesh(geometry, material);
    ground1.rotation.x = -Math.PI / 2;
    ground1.position.x = -49.5;
    ground1.position.z = -1.6;
    scene.add(ground1);

    let ground2 = new THREE.Mesh(geometry, material);
    ground2.rotation.x = -Math.PI / 2;
    ground2.position.x = -49.5;
    ground2.position.z = -2.35;
    scene.add(ground2);
    
    let ambient = new THREE.AmbientLight(0xdddddd);
    scene.add(ambient);

    const light = new THREE.SpotLight(0xFFFFFF, 2, 100, Math.PI / 4, 8);
    light.position.set(10, 25, -25);
    light.castShadow = true;
    scene.add(light);

    let loader = new THREE.GLTFLoader();
    loader.setCrossOrigin('anonymous');
    var envMap = getEnvMap();
    scene.background = envMap;

    for (let i = 0; i < modelInfoSet.length; i++) {
        let m = modelInfoSet[i];
        let url = m.url;
        let scale = m.scale;
        loader.load(url, function(data) {
            let gltf = data;
            let object = gltf.scene;
            object.scale.set(scale, scale, scale);
            object.rotation.set(m.rotation[0], m.rotation[1], m.rotation[2]);
            object.position.set(m.position[0], m.position[1], m.position[2]);

            let animations = gltf.animations;
            if (animations && animations.length) {
                let mixer = new THREE.AnimationMixer(object);
                if (m.name == "Fox") {
                    let animation = animations[2]; // 0:Survey, 1:Walk, 2:Run
                    mixer.clipAction(animation).play();
                } else {
                    for (let j = 0; j < animations.length; j++) {
                        let animation = animations[j];
                        mixer.clipAction(animation).play();
                    }
                }
                mixers.push(mixer);
            }

            object.traverse(function(node) {
                if (node.material) {
                    node.material.envMap = envMap;
                    node.material.needsUpdate = true;
                }
            });

            scene.add(object);
        });
    }

    initParticles();

    for ( var i = 0; i < emitters.length; i++ ) {
        particleGroup.addEmitter( emitters[i] );
    }
    scene.add( particleGroup.mesh );

    renderer = new THREE.WebGLRenderer();
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.userPan = false;
    controls.userPanSpeed = 0.0;
    controls.maxDistance = 5000.0;
    controls.maxPolarAngle = Math.PI * 0.495;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 4.0;

    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);
}

function getEnvMap() {
    //let path = 'https://rawcdn.githack.com/cx20/gltf-test/c479d543/textures/cube/skybox/';
    let path = 'https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/';
    let format = '.jpg';
    let urls = [
        path + 'px' + format, path + 'nx' + format,
        path + 'py' + format, path + 'ny' + format,
        path + 'pz' + format, path + 'nz' + format
    ];
    let loader = new THREE.CubeTextureLoader();
    loader.setCrossOrigin('anonymous');
    let envMap = loader.load(urls);
    envMap.format = THREE.RGBFormat;
    return envMap;
}

function animate() {
    let delta = clock.getDelta();
    if (mixers.length > 0) {
        for (let i = 0; i < mixers.length; i++) {
            let mixer = mixers[i];
            mixer.update(delta);
        }
    }
    particleGroup.tick( delta );
    controls.update();
    render();
    requestAnimationFrame(animate);
}

function render() {
    renderer.render(scene, camera);
}
