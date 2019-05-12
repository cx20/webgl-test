let canvas;
canvas = document.getElementById('canvas');
document.body.appendChild(canvas);
RedGL(canvas, function (v) {
    let tWorld, tView, tScene, tController, tRenderer, tTexture, tMaterial
    this['world'] = tWorld = RedWorld();
    tScene = RedScene(this);
    tScene.useBackgroundColor = true;
    tScene.backgroundColor = '#ffffff';

    tController = RedObitController(this);
    tController.distance = 2;
    tRenderer = RedRenderer();
    tView = RedView('HelloRedGL', this, tScene, tController);
    tWorld.addView(tView);
    
    let interleaveData;
    let indexData;
    let tInterleaveBuffer, tIndexBuffer;
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
    interleaveData = new Float32Array(
        [
            // Front face
            -0.5, -0.5,  0.5,   0.0, 0.0, // v0
             0.5, -0.5,  0.5,   1.0, 0.0, // v1
             0.5,  0.5,  0.5,   1.0, 1.0, // v2
            -0.5,  0.5,  0.5,   0.0, 1.0, // v3
            // Back face
            -0.5, -0.5, -0.5,   1.0, 0.0, // v4
             0.5, -0.5, -0.5,   1.0, 1.0, // v5
             0.5,  0.5, -0.5,   0.0, 1.0, // v6
            -0.5,  0.5, -0.5,   0.0, 0.0, // v7
            // Top face
             0.5,  0.5,  0.5,   0.0, 1.0, // v2
            -0.5,  0.5,  0.5,   0.0, 0.0, // v3
            -0.5,  0.5, -0.5,   1.0, 0.0, // v7
             0.5,  0.5, -0.5,   1.0, 1.0, // v6
            // Bottom face
            -0.5, -0.5,  0.5,   1.0, 1.0, // v0
             0.5, -0.5,  0.5,   0.0, 1.0, // v1
             0.5, -0.5, -0.5,   0.0, 0.0, // v5
            -0.5, -0.5, -0.5,   1.0, 0.0, // v4
            // Right face
             0.5, -0.5,  0.5,   1.0, 0.0, // v1
             0.5,  0.5,  0.5,   1.0, 1.0, // v2
             0.5,  0.5, -0.5,   0.0, 1.0, // v6
             0.5, -0.5, -0.5,   0.0, 0.0, // v5
            // Left face
            -0.5, -0.5,  0.5,   0.0, 0.0, // v0
            -0.5,  0.5,  0.5,   1.0, 0.0, // v3
            -0.5,  0.5, -0.5,   1.0, 1.0, // v7
            -0.5, -0.5, -0.5,   0.0, 1.0, // v4
        ]
    );
    indexData = new Uint16Array(
        [
             0,  1,  2,    0,  2 , 3,  // Front face
             4,  5,  6,    4,  6 , 7,  // Back face
             8,  9, 10,    8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15,  // Bottom face
            16, 17, 18,   16, 18, 19,  // Right face
            20, 21, 22,   20, 22, 23   // Left face
        ]
    );
    tInterleaveBuffer = RedBuffer(
        this, // RedGL Instance
        'tInterleaveBuffer',
        RedBuffer.ARRAY_BUFFER,
        interleaveData,
        [
            RedInterleaveInfo('aVertexPosition', 3),
            RedInterleaveInfo('aTexcoord', 2)
        ]
    );
    tIndexBuffer = RedBuffer(
        this, // RedGL Instance
        'tIndexBuffer', // key
        RedBuffer.ELEMENT_ARRAY_BUFFER, // bufferType
        indexData  // data
    );
    
    let tTexture = RedBitmapTexture(this, '../../../assets/textures/frog.jpg'); // 256x256
    let tMaterial = RedBitmapMaterial(this, tTexture);
    
    tGeometry = RedGeometry(tInterleaveBuffer, tIndexBuffer);
    tMesh = RedMesh(
        this,
        tGeometry,
        tMaterial
    );
    tMesh['useCullFace'] = false;
    tScene.addChild(tMesh);

    tRenderer.start(this, function (time) {
      //console.log(time)
        tMesh.rotationX += 1;
        tMesh.rotationY += 1;
        tMesh.rotationZ += 1;
    });
});
