let c, gl;
let aLoc = [];
let fps = 1000 / 30;

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
    let vsText = document.getElementById("vs").textContent;
    let fsText = document.getElementById("fs").textContent;
    let p = setupShaderProgramFromSource(gl, vsText, fsText);

    gl.useProgram(p);
    aLoc[0] = gl.getAttribLocation(p, "position");
    gl.enableVertexAttribArray(aLoc[0]);
}

function initBuffers() {
    let positions = [ 
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ];
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);
}

function render() {
    draw();
    requestAnimationFrame(render);
}

function draw() {
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 3);
    gl.flush();
}

window.onload = function() {
    glTips(); // Set glTips to be global callable

    initWebGL();
    initShaders();
    initBuffers();
    render();
};
