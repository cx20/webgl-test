var canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var app = PicoGL.createApp(canvas)
.clearColor(1.0, 1.0, 1.0, 1.0);

var vsSource = document.getElementById("vs").textContent;
var fsSource = document.getElementById("fs").textContent;

var program = app.createProgram(vsSource, fsSource);

var positions = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
     0.0, 0.5, 0.0, 
    -0.5,-0.5, 0.0, 
     0.5,-0.5, 0.0
]));

var vertexArray = app.createVertexArray().vertexAttributeBuffer(0, positions);

var drawCall = app.createDrawCall(program, vertexArray)

window.onresize = function() {
    app.resize(window.innerWidth, window.innerHeight);
};

app.clear();
drawCall.draw();
