import * as twgl from 'twgl';

let m4 = twgl.m4;
let gl = twgl.getWebGLContext(document.getElementById("c"));
resizeCanvas();
window.addEventListener("resize", function(){
    resizeCanvas();
});

function resizeCanvas() {
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
let programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

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
let arrays = {
    position: [ 
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
    ],
    color: [
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
    ],
    indices: [ 
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ]
};

let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

let uniforms = {
};

let projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 10);
let eye = [0, 0, -4];
let target = [0, 0, 0];
let up = [0, 1, 0];

let camera = m4.lookAt(eye, target, up);
let view = m4.inverse(camera);
let viewProjection = m4.multiply(projection, view);

let rad = 0;
function render() {
    rad += Math.PI * 1.0 / 180.0;
    
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let world = m4.identity();
	world = m4.rotateX(world, rad);
    world = m4.rotateY(world, rad);
    world = m4.rotateZ(world, rad);

    uniforms.u_worldViewProjection = m4.multiply(viewProjection, world);
    
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(render);
}

render();
