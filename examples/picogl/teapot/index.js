var canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

var app = PicoGL.createApp(canvas)
    .clearColor(0.0, 0.0, 0.0, 1.0)
    .depthTest();

var vsSource = document.getElementById("vs").textContent;
var fsSource = document.getElementById("fs").textContent;

var program = app.createProgram(vsSource, fsSource);

var image = new Image();
image.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var texture = app.createTexture2D(image);

    var positions = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array(vertexPositions));
    var textureCoords = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array(vertexTextureCoords));
    var normals = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array(vertexNormals));
    var indices_ = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, new Uint16Array(indices));

    var vertexArray = app.createVertexArray()
        .vertexAttributeBuffer(0, positions)
        .vertexAttributeBuffer(1, textureCoords)
        .vertexAttributeBuffer(2, normals)
        .indexBuffer(indices_);

    var drawCall = app.createDrawCall(program, vertexArray)
        .texture("texture", texture);

    window.onresize = function() {
        app.resize(window.innerWidth, window.innerHeight);
    };

    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();

    var rad = 0;
    function draw() {
        rad += Math.PI * 1.0 / 180.0;
        mat4.perspective(pMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 100.0);
        mat4.identity(mvMatrix);
        var translation = vec3.create();
        vec3.set(translation, 0.0, 0.0, -30.0);
        mat4.translate(mvMatrix, mvMatrix, translation);
        mat4.rotate(mvMatrix, mvMatrix, rad, [0, 1, 0]);

        drawCall.uniform("uPMatrix", pMatrix);
        drawCall.uniform("uMVMatrix", mvMatrix);

        app.clear();
        drawCall.draw();
        requestAnimationFrame(draw);
    }

    draw();
});
