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
    // Square data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //        [0]------[1]
    //         |        |
    //         |        |
    //         |        |
    //        [2]------[3]
    //
    position: [ 
        -0.5, 0.5, 0.0, // v0
         0.5, 0.5, 0.0, // v1 
        -0.5,-0.5, 0.0, // v2
         0.5,-0.5, 0.0  // v3
    ],
    color: [ 
         1.0, 0.0, 0.0, 1.0, // v0
         0.0, 1.0, 0.0, 1.0, // v1
         0.0, 0.0, 1.0, 1.0, // v2
         1.0, 1.0, 0.0, 1.0  // v3
    ]
};
let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays);

function render() {
    twgl.resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(programInfo.program);
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo);
    twgl.drawBufferInfo(gl, gl.TRIANGLE_STRIP, bufferInfo);
    requestAnimationFrame(render);
}

render();
