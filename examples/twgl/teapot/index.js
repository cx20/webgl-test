"use strict";
let m4 = twgl.m4;
let gl = twgl.getWebGLContext(document.getElementById("c"));
let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

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
let uniforms = {};
let bufferInfo;

let projection = m4.perspective(45 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000);
let eye = [0, 0, -50];
let target = [0, 0, 0];
let up = [0, 1, 0];

let camera = m4.lookAt(eye, target, up);
let view = m4.inverse(camera);
let viewProjection = m4.multiply(view, projection);

let rad = 0;
function render() {
    rad += Math.PI * 1.0 / 180.0;
    
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    let world = m4.create();
    //world = m4.rotateX(world, rad);
    world = m4.rotateY(world, rad);
    //world = m4.rotateZ(world, rad);
    
    uniforms.u_worldViewProjection = m4.multiply(world, viewProjection);
    
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.setUniforms(programInfo, uniforms);
    gl.drawElements(gl.TRIANGLES, bufferInfo.numElements, gl.UNSIGNED_SHORT, 0);
    
    requestAnimationFrame(render);
}

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    let arrays = {
        position: vertexPositions,
        normal: vertexNormals,
        texcoord: vertexTextureCoords,
        indices: indices
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    let tex = twgl.createTexture(gl, {
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        src: "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg"
    });

    uniforms = {
        u_texture: tex,
        u_pointLightingLocation: [100.0, 0.0, 100.0]
    };

    render();
});

