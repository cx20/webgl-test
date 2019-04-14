"use strict";
var m4 = twgl.m4;
var gl = twgl.getWebGLContext(document.getElementById("c"));
var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);

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
var arrays = {
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

var bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

var uniforms = {
};

var projection = m4.perspective(30 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.5, 10);
var eye = [0, 0, -4];
var target = [0, 0, 0];
var up = [0, 1, 0];

var camera = m4.lookAt(eye, target, up);
var view = m4.inverse(camera);
var viewProjection = m4.multiply(view, projection);

var rad = 0;
function render() {
    rad += Math.PI * 1.0 / 180.0;
    
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    var world = m4.create();
    world = m4.rotateX(world, rad);
    world = m4.rotateY(world, rad);
    world = m4.rotateZ(world, rad);
    
    uniforms.u_worldViewProjection = m4.multiply(world, viewProjection);
    
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(render);
}

render();
