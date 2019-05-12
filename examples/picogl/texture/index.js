let canvas = document.getElementById("c");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let app = PicoGL.createApp(canvas)
    .clearColor(1.0, 1.0, 1.0, 1.0)
    .depthTest();

let vsSource = document.getElementById("vs").textContent;
let fsSource = document.getElementById("fs").textContent;

let program = app.createProgram(vsSource, fsSource);

let image = new Image();
image.src = "../../../assets/textures/frog.jpg"; // 256x256

image.onload = function() {
    let texture = app.createTexture2D(image);

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
    let positions = app.createVertexBuffer(PicoGL.FLOAT, 3, new Float32Array([
        // Front face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        // Back face
        -0.5, -0.5, -0.5, // v4
        -0.5,  0.5, -0.5, // v7
         0.5,  0.5, -0.5, // v6
         0.5, -0.5, -0.5, // v5
        // Top face
        -0.5,  0.5, -0.5, // v7
        -0.5,  0.5,  0.5, // v3
         0.5,  0.5,  0.5, // v2
         0.5,  0.5, -0.5, // v6
        // Bottom face
        -0.5, -0.5, -0.5, // v4
         0.5, -0.5, -0.5, // v5
         0.5, -0.5,  0.5, // v1
        -0.5, -0.5,  0.5, // v0
        // Right face
         0.5, -0.5, -0.5, // v5
         0.5,  0.5, -0.5, // v6
         0.5,  0.5,  0.5, // v2
         0.5, -0.5,  0.5, // v1
        // Left face
        -0.5, -0.5, -0.5, // v4
        -0.5, -0.5,  0.5, // v0
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5  // v7
    ]));

    let textureCoords = app.createVertexBuffer(PicoGL.FLOAT, 2, new Float32Array([
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,

        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,

        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,

        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,

        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
    ]));

    let indices = app.createIndexBuffer(PicoGL.UNSIGNED_BYTE, 3, new Uint8Array([
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ]));

    let vertexArray = app.createVertexArray()
        .vertexAttributeBuffer(0, positions)
        .vertexAttributeBuffer(1, textureCoords)
        .indexBuffer(indices);

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
        mat4.perspective(pMatrix, 45, window.innerWidth / window.innerHeight, 0.1, 100.0);
        mat4.identity(mvMatrix);
        let translation = vec3.create();
        vec3.set(translation, 0.0, 0.0, -2.0);
        mat4.translate(mvMatrix, mvMatrix, translation);
        mat4.rotate(mvMatrix, mvMatrix, rad, [1, 1, 1]);

        drawCall.uniform("uPMatrix", pMatrix);
        drawCall.uniform("uMVMatrix", mvMatrix);

        app.clear();
        drawCall.draw();
        requestAnimationFrame(draw);
    }

    draw();

}
