const renderer = new CZPG.Renderer('c').setSize('100%', '100%');
const context = renderer.context;
const scene = new CZPG.Scene(renderer);

let camera = new CZPG.PerspectiveCamera(45, context.canvas.width/context.canvas.height, 0.01, 2000);
camera.transform.position = [0, 1, 3];
camera.updateViewMatrix();

// 立方体の座標データを用意
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
const positions = [
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
const textureCoords = [
    // Front face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,

    // Back face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Top face
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,

    // Bottom face
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,
    1.0, 0.0,

    // Right face
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
    0.0, 0.0,

    // Left face
    0.0, 0.0,
    1.0, 0.0,
    1.0, 1.0,
    0.0, 1.0,
];
const indices = [
     0,  1,  2,    0,  2 , 3,  // Front face
     4,  5,  6,    4,  6 , 7,  // Back face
     8,  9, 10,    8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15,  // Bottom face
    16, 17, 18,   16, 18, 19,  // Right face
    20, 21, 22,   20, 22, 23   // Left face
];

const attribArrays = {
    indices: { data: indices },
};
const textures = CZPG.createTextures(context, {pic: {
    src:"../../../assets/textures/frog.jpg", // 256x256
    min : context.LINEAR_MIPMAP_LINEAR,
    mag : context.LINEAR}});

attribArrays['a_position'] = { data: positions, numComponents: 3 };
attribArrays['a_textureCoord'] = { data: textureCoords, numComponents: 2 };
var mesh = new CZPG.Mesh('quad', attribArrays, {cullFace: false});
var model = new CZPG.Model(mesh);
var shader = new CZPG.Shader(context, 'vs', 'fs').setCamera(camera).setUniformObj({u_texture: textures.pic});

scene.add({shader: shader, model: model});

let resized = false;
let rad = 0;
let loop = new CZPG.Render(function(timespan) {
    resized = renderer.clear(1.0, 1.0, 1.0, 1.0).fixCanvasToDisplay(window.devicePixelRatio);
    if(resized) camera.updateProjMatrix( context.canvas.width / context.canvas.height );
    rad += Math.PI * 1 / 180;
    model.rotation = [rad, rad, rad];
    scene.render();
}).start();
