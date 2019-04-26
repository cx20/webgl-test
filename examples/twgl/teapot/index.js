"use strict";
var m4 = twgl.m4;
var gl = twgl.getWebGLContext(document.getElementById("c"));
var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

resizeCanvas();
window.addEventListener("resize", function(){
    resizeCanvas();
});

function resizeCanvas() {
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}
var programInfo = twgl.createProgramInfo(gl, ["vs", "fs"]);
var uniforms = {};
var bufferInfo;

var projection = m4.perspective(45 * Math.PI / 180, gl.canvas.clientWidth / gl.canvas.clientHeight, 0.1, 1000);
var eye = [0, 0, -50];
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

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var arrays = {
        position: vertexPositions,
        normal: vertexNormals,
        texcoord: vertexTextureCoords,
        indices: indices
    };

    bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

    var tex = twgl.createTexture(gl, {
        crossOrigin: "anonymous",
        src: "https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/arroway.de_metal+structure+06_d100_flat.jpg"
    });

    uniforms = {
        u_texture: tex,
        u_directionLightingLocation: [1.0, 1.0, -1.0]
    };

    render();
});

