let xgl;
let program;
let uMVMatrix;
let uPMatrix;
let uTexture;

function initWebGL() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    xgl = new XenoGL.WebGL2(canvas);
    xgl.enable(XenoGL.DEPTH_TEST);
}

function initShaders() {
    const vertexShaderSource = document.getElementById("vs").textContent;
    const fragmentShaderSource = document.getElementById("fs").textContent;

    const vertexShader = new XenoGL.VertexShader(vertexShaderSource);
    const fragmentShader = new XenoGL.FragmentShader(fragmentShaderSource);
     
    program = new XenoGL.Program({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    
    xgl.addProgram(program);
}

async function initBuffers() {

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
    const positions = new Float32Array([ 
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
    ]);

    const textureCoords = new Float32Array([ 
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
    ]);
    
    const positionAttribute = new XenoGL.Attribute('position', 3);
    const positionBuffer = new XenoGL.ArrayBuffer({
        dataOrLength: positions,
        attributes: [positionAttribute],
        dataType: XenoGL.FLOAT
    });
    program.addBuffer(positionBuffer);

    const textureCoordAttribute = new XenoGL.Attribute('textureCoord', 2);
    const textureCoordBuffer = new XenoGL.ArrayBuffer({
        dataOrLength: textureCoords,
        attributes: [textureCoordAttribute],
        dataType: XenoGL.FLOAT
    });
    program.addBuffer(textureCoordBuffer);


    const indices = new Uint16Array([
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ]);
    const indexBuffer = new XenoGL.ElementArrayBuffer({
        dataOrLength: indices,
        dataType: XenoGL.UNSIGNED_SHORT,
        usage: XenoGL.DYNAMIC_DRAW
    });
    
    program.addBuffer(indexBuffer);

    const textureSource = await fetch('../../../assets/textures/frog.jpg')
        .then((res) => res.blob())
        .then((blob) => createImageBitmap(blob));
    const texture = new XenoGL.Texture2D(textureSource);
    xgl.addTexture(texture);
    
    uMVMatrix = new XenoGL.Uniform('uMVMatrix');
    uPMatrix = new XenoGL.Uniform('uPMatrix');
    uTexture = new XenoGL.Uniform('uTexture');
    
    program.addUniform(uMVMatrix);
    program.addUniform(uPMatrix);
    program.addUniform(uTexture);
}


function animate() {
    draw();
    requestAnimationFrame(animate);
}

let rad = 0;
async function draw() {

    rad += Math.PI * 1.0 / 180.0;

    const camera = new Vector3(0, 0, 2);
    const lookAt = new Vector3(0, 0, 0);
    const cameraUpDirection = new Vector3(0, 1, 0);
    const view = Matrix4.lookAt(camera, lookAt, cameraUpDirection);

    const pMatrix = Matrix4.perspective({fovYRadian: 60 * Math.PI/180, aspectRatio: window.innerWidth / window.innerHeight, near: 0.1, far: 1000});
    const identity = Matrix4.identity();
    const translation = Matrix4.translation(0, 0, 0);
    const axis = new Vector3(1, 1, 1).normalize();
    const q = Quaternion.rotationAround(axis, rad);
    const rotation = q.toRotationMatrix4();
    const mvMatrix = identity.mulByMatrix4(translation)
                             .mulByMatrix4(view)
                             .mulByMatrix4(rotation)

    if ( uMVMatrix !== undefined ) uMVMatrix.setMatrix(mvMatrix.values);
    if ( uPMatrix !== undefined ) uPMatrix.setMatrix(pMatrix.values);

    xgl.draw(XenoGL.TRIANGLES);
}

initWebGL();
initShaders();
initBuffers();
animate();
