let canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

let app = PicoGL.createApp(canvas)
    .clearColor(0.0, 0.0, 0.0, 1.0)
    .depthTest();

let vsSource = document.getElementById("vs").textContent;
let fsSource = document.getElementById("fs").textContent;

let program = app.createProgram(vsSource, fsSource);

let image = new Image();
// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
image.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
image.onload = function() {

    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
    $.getJSON("../../../assets/json/teapot.json", function (data) {
        vertexPositions = data.vertexPositions;
        vertexTextureCoords = data.vertexTextureCoords;
        vertexNormals = data.vertexNormals;
        indices = data.indices;

        let texture = app.createTexture2D(image);

        let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array(vertexPositions));
        let textureCoords = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array(vertexTextureCoords));
        let normals = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array(vertexNormals));
        let indices_ = app.createIndexBuffer(PicoGL.UNSIGNED_SHORT, 3, new Uint16Array(indices));

        let vertexArray = app.createVertexArray()
            .vertexAttributeBuffer(0, positions)
            .vertexAttributeBuffer(1, textureCoords)
            .vertexAttributeBuffer(2, normals)
            .indexBuffer(indices_);

        let drawCall = app.createDrawCall(program, vertexArray)
            .texture("texture", texture);

        window.onresize = function() {
            app.resize(window.innerWidth, window.innerHeight);
        };

        let mvMatrix = mat4.create();
        let pMatrix = mat4.create();

        let rad = 0;
        function draw() {
            rad += Math.PI * 1.0 / 180.0;
            mat4.perspective(pMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 1000.0);
            mat4.identity(mvMatrix);
            let translation = vec3.create();
            vec3.set(translation, 0.0, 0.0, -30.0);
            mat4.translate(mvMatrix, mvMatrix, translation);
            mat4.rotate(mvMatrix, mvMatrix, rad, [0, 1, 0]);

            drawCall.uniform("uPMatrix", pMatrix);
            drawCall.uniform("uMVMatrix", mvMatrix);
            drawCall.uniform("uPointLightingLocation", [100.0, 0.0, 100.0]);

            app.clear();
            drawCall.draw();
            requestAnimationFrame(draw);
        }

        draw();
    });
}
