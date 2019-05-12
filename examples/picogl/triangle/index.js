let canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let app = PicoGL.createApp(canvas)
.clearColor(1.0, 1.0, 1.0, 1.0);

let vsSource = document.getElementById("vs").textContent;
let fsSource = document.getElementById("fs").textContent;

let program = app.createProgram(vsSource, fsSource);

let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
     0.0, 0.5, 0.0, // v0
    -0.5,-0.5, 0.0, // v1
     0.5,-0.5, 0.0  // v2
]));

let vertexArray = app.createVertexArray().vertexAttributeBuffer(0, positions);

let drawCall = app.createDrawCall(program, vertexArray)

window.onresize = function() {
    app.resize(window.innerWidth, window.innerHeight);
};

app.clear();
drawCall.draw();
