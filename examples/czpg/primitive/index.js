const renderer = new CZPG.Renderer('c').setSize('100%', '100%');
const context = renderer.context;
const scene = new CZPG.Scene(renderer);

let camera = new CZPG.PerspectiveCamera(45, context.canvas.width/context.canvas.height, 0.01, 2000);
camera.transform.position = [0, 1, 3];
camera.updateViewMatrix();

const textures = CZPG.createTextures(context, {pic: {
    src: "../../../assets/textures/earth.jpg",
    min : context.LINEAR_MIPMAP_LINEAR,
    mag : context.LINEAR}});

let shader = new CZPG.PhongLightShader(context).setCamera(camera).setUniformObj({u_texture: textures.pic, position: [1, 1, 1]});

// plane
var planeAttribArrays = CZPG.Quad.createVertices();
let meshPlane = new CZPG.Mesh('plane', planeAttribArrays, {cullFace: false});
let modelPlane = new CZPG.Model(meshPlane);
modelPlane.position = [-1.5, 0, 0];
scene.add({shader: shader, model: modelPlane});

// cube
var cubeAttribArrays = CZPG.Cube.createVertices();
let meshCube = new CZPG.Mesh('cube', cubeAttribArrays, {cullFace: false});
let modelCube = new CZPG.Model(meshCube);
modelCube.position = [0, 0, 0];
scene.add({shader: shader, model: modelCube});

// sphere
var sphereAttribArrays = CZPG.Sphere.createVertices();
let meshSphere = new CZPG.Mesh('sphere', sphereAttribArrays, {cullFace: false});
let modelSphere = new CZPG.Model(meshSphere);
modelSphere.position = [1.5, 0, 0];
scene.add({shader: shader, model: modelSphere});

let resized = false;
let rad = 0;
let loop = new CZPG.Render(function(timespan) {
    resized = renderer.clear(0.0, 0.0, 0.0, 1.0).fixCanvasToDisplay(window.devicePixelRatio);
    if(resized) camera.updateProjMatrix( context.canvas.width / context.canvas.height );
    rad += Math.PI * 1 / 180;
    modelPlane.rotation = [0, rad, 0];
    modelCube.rotation = [0, rad, 0];
    modelSphere.rotation = [0, rad, 0];
    scene.render();
}).start();
