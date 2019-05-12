let c = document.getElementById("c");
let gl = twgl.getWebGLContext(c);
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

let arrays = {
    position: [ 
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ]
};

let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render() {
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.drawBufferInfo(gl, gl.TRIANGLES, bufferInfo);
    requestAnimationFrame(render);
}

render();
