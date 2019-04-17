var canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var app = PicoGL.createApp(canvas)
.clearColor(1.0, 1.0, 1.0, 1.0);

var vsSource = document.getElementById("vs").textContent;
var fsSource = document.getElementById("fs").textContent;

var program = app.createProgram(vsSource, fsSource);

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
var positions = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
    -0.5, 0.5, 0.0, // v0
     0.5, 0.5, 0.0, // v1 
    -0.5,-0.5, 0.0, // v2
     0.5,-0.5, 0.0  // v3
]));

var colors = app.createVertexBuffer(PicoGL.FLOAT, 4, new Float32Array([
     1.0, 0.0, 0.0, 1.0, // v0
     0.0, 1.0, 0.0, 1.0, // v1
     0.0, 0.0, 1.0, 1.0, // v2
     1.0, 1.0, 0.0, 1.0  // v3
]));
var indices = app.createIndexBuffer(PicoGL.UNSIGNED_BYTE, 3, new Uint8Array([
    2, 0, 1, // v2-v0-v1
    2, 1, 3  // v2-v1-v3
]));


var vertexArray = app.createVertexArray()
    .vertexAttributeBuffer(0, positions)
    .vertexAttributeBuffer(1, colors)
    .indexBuffer(indices);

var drawCall = app.createDrawCall(program, vertexArray)

window.onresize = function() {
    app.resize(window.innerWidth, window.innerHeight);
};

app.clear();
drawCall.draw();
