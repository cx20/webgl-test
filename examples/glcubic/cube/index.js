let mat4 = gl3.Math.Mat4;
let prg;
let mMatrix;
let vMatrix;
let pMatrix;
let vpMatrix;
let mvpMatrix;
let VBO;
let IBO;
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

let color = [ 
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 1.0, 0.0, 1.0, // Back face
    1.0, 1.0, 0.0, 1.0, // Back face
    1.0, 1.0, 0.0, 1.0, // Back face
    1.0, 1.0, 0.0, 1.0, // Back face
    0.0, 1.0, 0.0, 1.0, // Top face
    0.0, 1.0, 0.0, 1.0, // Top face
    0.0, 1.0, 0.0, 1.0, // Top face
    0.0, 1.0, 0.0, 1.0, // Top face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.0, 1.0, 1.0, // Right face
    1.0, 0.0, 1.0, 1.0, // Right face
    1.0, 0.0, 1.0, 1.0, // Right face
    1.0, 0.0, 1.0, 1.0, // Right face
    0.0, 0.0, 1.0, 1.0, // Left face
    0.0, 0.0, 1.0, 1.0, // Left face
    0.0, 0.0, 1.0, 1.0, // Left face
    0.0, 0.0, 1.0, 1.0  // Left face
];

let indices = [
     0,  1,  2,    0,  2 , 3,  // Front face
     4,  5,  6,    4,  6 , 7,  // Back face
     8,  9, 10,    8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15,  // Bottom face
    16, 17, 18,   16, 18, 19,  // Right face
    20, 21, 22,   20, 22, 23   // Left face
];

function init() {
    gl3.init('c');
    prg = gl3.createProgramFromId(
        'vs',
        'fs',
        ['position' ,'color'],
        [3, 4],
        ['mvpMatrix'],
        ['matrix4fv']
    );
    
    VBO = [
        gl3.createVbo(position), 
        gl3.createVbo(color)
    ];
    IBO = gl3.createIbo(indices);
    
    mMatrix = mat4.identity(mat4.create());
    vMatrix = mat4.identity(mat4.create());
    pMatrix = mat4.identity(mat4.create());
    vpMatrix = mat4.identity(mat4.create());
    mvpMatrix = mat4.identity(mat4.create());
    
    gl3.gl.enable(gl3.gl.DEPTH_TEST);

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
render();
