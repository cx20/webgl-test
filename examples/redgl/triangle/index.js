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
    interleaveData = new Float32Array(
        [
             0.0,  0.5, 0.0,
            -0.5, -0.5, 0.0,
             0.5, -0.5, 0.0
        ]
    );
    indexData = new Uint16Array(
        [0, 1, 2]
    );
    tInterleaveBuffer = RedBuffer(
        this, // RedGL Instance
        'tInterleaveBuffer',
        RedBuffer.ARRAY_BUFFER,
        interleaveData,
        [
            RedInterleaveInfo('aVertexPosition', 3)
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
        RedColorMaterial(this, '#0000ff')
    );
    tScene.addChild(tMesh);

    tRenderer.start(this, function (time) {
      //console.log(time)
    });
});