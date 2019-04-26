var c, gl;
var aLoc = [];
var uLoc = [];
var fps = 1000 / 30;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var vertexPositionBuffer;
var vertexColorBuffer;
var vertexIndexBuffer;

function initWebGL() {
    c = document.getElementById("c");
    gl = getWebGL1Context(c);
    gl.enable(gl.DEPTH_TEST);
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
    aLoc[1] = gl.getAttribLocation(p, "color");
    uLoc[0] = gl.getUniformLocation(p, "uPMatrix");
    uLoc[1] = gl.getUniformLocation(p, "uMVMatrix");
    gl.enableVertexAttribArray(aLoc[0]);
    gl.enableVertexAttribArray(aLoc[1]);
}

function initBuffers() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);

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
    var positions = [ 
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
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    vertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    var colors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [1.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 1.0, 0.0, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 0.0, 1.0, 1.0]  // Left face
    ];
    var unpackedColors = [];
    for (var i in colors) {
        var color = colors[i];
        for (var j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);

    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    var indices = [
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ];
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
}

function render() {
    draw();
    requestAnimationFrame(render);
}

var rad = 0;
function draw() {
    rad += Math.PI * 1.0 / 180.0;
    mat4.perspective(pMatrix, 45, c.width / c.height, 0.1, 100.0);
    mat4.identity(mvMatrix);
    var translation = vec3.create();
    vec3.set(translation, 0.0, 0.0, -3.0);
    mat4.translate(mvMatrix, mvMatrix, translation);
    mat4.rotate(mvMatrix, mvMatrix, rad, [1, 1, 1]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorBuffer);
    gl.vertexAttribPointer(aLoc[1], 4, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.uniformMatrix4fv(uLoc[0], false, pMatrix);
    gl.uniformMatrix4fv(uLoc[1], false, mvMatrix);
    
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    gl.flush();
}

window.onload = function() {
    glTips(); // Set glTips to be global callable

    initWebGL();
    initShaders();
    initBuffers();
    render();
};
