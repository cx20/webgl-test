var c, gl;
var aLoc = [];
var fps = 1000 / 30;

function initWebGL() {
    c = document.getElementById("c");
    gl = getWebGL1Context(c);
    resizeCanvas();
    window.addEventListener("resize", function(){
        resizeCanvas();
    });
}

function resizeCanvas() {
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    gl.viewport(0, 0, c.width, c.height);
}

function initShaders() {
    var vsText = document.getElementById("vs").textContent;
    var fsText = document.getElementById("fs").textContent;
    var p = setupShaderProgramFromSource(gl, vsText, fsText);

    gl.useProgram(p);
    aLoc[0] = gl.getAttribLocation(p, "position");
    gl.enableVertexAttribArray(aLoc[0]);
    aLoc[1] = gl.getAttribLocation(p, "color");
    gl.enableVertexAttribArray(aLoc[1]);
}

function initBuffers() {
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
    //        [0]------[1]
    //         |        |
    //         |        |
    //         |        |
    //        [2]------[3]
    //
    var positions = [ 
        -0.5, 0.5, 0.0, // v0
         0.5, 0.5, 0.0, // v1 
        -0.5,-0.5, 0.0, // v2
         0.5,-0.5, 0.0  // v3
    ];
    
    var colors = [ 
         1.0, 0.0, 0.0, 1.0, // v0
         0.0, 1.0, 0.0, 1.0, // v1
         0.0, 0.0, 1.0, 1.0, // v2
         1.0, 1.0, 0.0, 1.0  // v3
    ];
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aLoc[1], 4, gl.FLOAT, false, 0, 0);
}

function render() {
    draw();
    requestAnimationFrame(render);
}

function draw() {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.flush();
}

window.onload = function() {
    glTips(); // Set glTips to be global callable

    initWebGL();
    initShaders();
    initBuffers();
    render();
};
