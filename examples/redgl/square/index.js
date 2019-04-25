var canvas;
canvas = document.getElementById('canvas');
document.body.appendChild(canvas);
RedGL(canvas, function (v) {
    var tWorld, tView, tScene, tController, tRenderer;
    this['world'] = tWorld = RedWorld();
    tScene = RedScene(this);
    tScene.useBackgroundColor = true;
    tScene.backgroundColor = '#ffffff';

    tController = RedObitController(this);
    tController.distance = 1.8;
    tRenderer = RedRenderer();
    tView = RedView('HelloRedGL', this, tScene, tController);
    tWorld.addView(tView);
    
    var interleaveData;
    var indexData;
    var tInterleaveBuffer, tIndexBuffer;
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
    //         |      / |
    //         |    /   |
    //         |  /     |
    //        [2]------[3]
    //
    interleaveData = new Float32Array(
        [
            // x,   y,   z,    r,   g,   b,   a
            -0.5, 0.5, 0.0,  1.0, 0.0, 0.0, 1.0, // v0
             0.5, 0.5, 0.0,  0.0, 1.0, 0.0, 1.0, // v1
            -0.5,-0.5, 0.0,  0.0, 0.0, 1.0, 1.0, // v2
             0.5,-0.5, 0.0,  1.0, 1.0, 0.0, 1.0  // v3
        ]
    );
    indexData = new Uint16Array(
        [
            2, 1, 0, // v2-v1-v0
            2, 3, 1  // v2-v3-v1
        ]
    );
    tInterleaveBuffer = RedBuffer(
        this, // RedGL Instance
        'tInterleaveBuffer',
        RedBuffer.ARRAY_BUFFER,
        interleaveData,
        [
            RedInterleaveInfo('aVertexPosition', 3),
            RedInterleaveInfo('aVertexColor', 4)
        ]
    );
    tIndexBuffer = RedBuffer(
        this, // RedGL Instance
        'tIndexBuffer', // key
        RedBuffer.ELEMENT_ARRAY_BUFFER, // bufferType
        indexData  // data
    )

    tGeometry = RedGeometry(tInterleaveBuffer, tIndexBuffer);
    tMesh = RedMesh(
        this,
        tGeometry,
        RedGridMaterial(this) // TODO: correct method is unknown
    );
    tScene.addChild(tMesh);

    tRenderer.start(this, function (time) {
      //console.log(time)
    });
});