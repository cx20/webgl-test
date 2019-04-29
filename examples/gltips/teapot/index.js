var c, gl;
var aLoc = [];
var uLoc = [];
var fps = 1000 / 30;

var mvMatrix = mat4.create();
var pMatrix = mat4.create();

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

var vertexPositionBuffer;
var vertexNormalBuffer;
var vertexCoordBuffer;
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
    aLoc[1] = gl.getAttribLocation(p, "normal");
    aLoc[2] = gl.getAttribLocation(p, "textureCoord");
    uLoc[0] = gl.getUniformLocation(p, "pjMatrix");
    uLoc[1] = gl.getUniformLocation(p, "mvMatrix");
    uLoc[2]  = gl.getUniformLocation(p, "texture");
    uLoc[3]  = gl.getUniformLocation(p, "uPointLightingLocation");
    gl.enableVertexAttribArray(aLoc[0]);
    gl.enableVertexAttribArray(aLoc[1]);
    gl.enableVertexAttribArray(aLoc[2]);
}

function initBuffers() {
    vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);

    vertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexNormals), gl.STATIC_DRAW);

    vertexCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
    
    vertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    var img = new Image();
    var texture;
    img.onload = function(){
        texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        gl.generateMipmap(gl.TEXTURE_2D);
        render();
    };
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
    img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
}

function render() {
    draw();
    requestAnimationFrame(render);
}

var rad = 0;
function draw() {
    rad += Math.PI * 1.0 / 180.0;
    mat4.perspective(pMatrix, 45, c.width / c.height, 0.1, 1000.0);
    mat4.identity(mvMatrix);
    var translation = vec3.create();
    vec3.set(translation, 0.0, 0.0, -30.0);
    mat4.translate(mvMatrix, mvMatrix, translation);
    mat4.rotate(mvMatrix, mvMatrix, rad, [0, 1, 0]);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer);
    gl.vertexAttribPointer(aLoc[0], 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexNormalBuffer);
    gl.vertexAttribPointer(aLoc[1], 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexCoordBuffer);
    gl.vertexAttribPointer(aLoc[2], 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer);
    gl.uniformMatrix4fv(uLoc[0], false, pMatrix);
    gl.uniformMatrix4fv(uLoc[1], false, mvMatrix);
    
    gl.uniform1i(uLoc[2], 0);
    
    var pointLightingLocation = [100.0, 0.0, 100.0];
    gl.uniform3fv(uLoc[3], pointLightingLocation);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
    gl.flush();
}

window.onload = function() {
    glTips(); // Set glTips to be global callable

    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
    $.getJSON("../../../assets/json/teapot.json", function (data) {
        vertexPositions = data.vertexPositions;
        vertexTextureCoords = data.vertexTextureCoords;
        vertexNormals = data.vertexNormals;
        indices = data.indices;

        initWebGL();
        initShaders();
        initBuffers();
    });
};
