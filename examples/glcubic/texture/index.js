let prg;
let VBO;
let IBO;
let mat4 = gl3.Math.Mat4;
let mMatrix;
let vMatrix;
let pMatrix;
let vpMatrix;
let mvpMatrix;
let rad = 0;

// Cube data
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
let position = [ 
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

let texcoord = [
    // Front face
    1, 0,
    0, 0,
    0, 1,
    1, 1,
    // Back face
    1, 0,
    0, 0,
    0, 1,
    1, 1,
    // Top face
    1, 0,
    0, 0,
    0, 1,
    1, 1,
    // Bottom face
    1, 0,
    0, 0,
    0, 1,
    1, 1,
    // Right face
    1, 0,
    0, 0,
    0, 1,
    1, 1,
    // Left face
    1, 0,
    0, 0,
    0, 1,
    1, 1
];

let indices = [
     0,  1,  2,    0,  2 , 3,  // Front face
     4,  5,  6,    4,  6 , 7,  // Back face
     8,  9, 10,    8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15,  // Bottom face
    16, 17, 18,   16, 18, 19,  // Right face
    20, 21, 22,   20, 22, 23   // Left face
];

function init(){
    gl3.init('c');
    VBO = [
        gl3.createVbo(position), 
        gl3.createVbo(texcoord)
    ];
    IBO = gl3.createIbo(indices);
    gl3.createTextureFromFile('../../../assets/textures/frog.jpg',  0, initShader);  // 256x256

    resizeCanvas();

    window.addEventListener("resize", function(){
        resizeCanvas();
    });
}

function resizeCanvas() {
    gl3.canvas.width = window.innerWidth;
    gl3.canvas.height = window.innerHeight;
    gl3.gl.viewport(0, 0, gl3.canvas.width, gl3.canvas.height);
}

function initShader() {
    prg = gl3.createProgramFromId(
        'vs',
        'fs',
        ['position' ,'texcoord'],
        [3, 2],
        ['mvpMatrix', 'texture'],
        ['matrix4fv', '1i']
    );
    gl3.gl.activeTexture(gl3.gl.TEXTURE0);
    gl3.gl.bindTexture(gl3.gl.TEXTURE_2D, gl3.textures[0].texture);

    mMatrix = mat4.identity(mat4.create());
    vMatrix = mat4.identity(mat4.create());
    pMatrix = mat4.identity(mat4.create());
    vpMatrix = mat4.identity(mat4.create());
    mvpMatrix = mat4.identity(mat4.create());

    gl3.gl.enable(gl3.gl.DEPTH_TEST);

    render();
}

function render(){
    rad += Math.PI * 1.0 / 180.0;

    prg.useProgram();
    prg.setAttribute(VBO, IBO);
    let cameraPosition = [0.0, 0.0, 4.0];
    let centerPoint    = [0.0, 0.0, 0.0];
    let cameraUp       = [0.0, 1.0, 0.0];
    mat4.lookAt(cameraPosition, centerPoint, cameraUp, vMatrix);

    let fovy = 30;
    let aspect = gl3.canvas.width / gl3.canvas.height;
    let near = 0.1;
    let far = 5.0;
    mat4.perspective(fovy, aspect, near, far, pMatrix);

    let axis = [1.0, 1.0, 1.0];
    mat4.identity(mMatrix);
    mat4.rotate(mMatrix, rad, axis, mMatrix);
    mat4.multiply(pMatrix, vMatrix, vpMatrix);
    mat4.multiply(vpMatrix, mMatrix, mvpMatrix);

    prg.pushShader([mvpMatrix]);

    gl3.drawElements(gl3.gl.TRIANGLES, indices.length);

    requestAnimationFrame(render);
}

init();
