let canvas;
canvas = document.getElementById('canvas');
document.body.appendChild(canvas);
RedGL(canvas, function (v) {
    let tWorld, tView, tScene, tController, tRenderer, tTexture, tMaterial
    this['world'] = tWorld = RedWorld();
    tScene = RedScene(this);
    tScene.useBackgroundColor = true;
    tScene.backgroundColor = '#000000';

    tController = RedObitController(this);
    tController.distance = 50;
    tRenderer = RedRenderer();
    tView = RedView('HelloRedGL', this, tScene, tController);
    tWorld.addView(tView);
    
    let interleaveData;
    let indexData;
    let tInterleaveBuffer, tIndexBuffer;
    let self = this;

    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
    $.getJSON("../../../assets/json/teapot.json", function (data) {
        vertexPositions = data.vertexPositions;
        vertexTextureCoords = data.vertexTextureCoords;
        vertexNormals = data.vertexNormals;
        indices = data.indices;

        let interleaveDataBuffer = [];
        let len = vertexPositions.length / 3;
        for (let i = 0; i < len; i++ ) {
            interleaveDataBuffer.push(vertexPositions[i*3+0]);
            interleaveDataBuffer.push(vertexPositions[i*3+1]);
            interleaveDataBuffer.push(vertexPositions[i*3+2]);
            interleaveDataBuffer.push(vertexNormals[i*3+0]);
            interleaveDataBuffer.push(vertexNormals[i*3+1]);
            interleaveDataBuffer.push(vertexNormals[i*3+2]);
            interleaveDataBuffer.push(vertexTextureCoords[i*2+0]);
            interleaveDataBuffer.push(vertexTextureCoords[i*2+1]);
        }
        interleaveData = new Float32Array(interleaveDataBuffer);
        indexData = new Uint16Array(indices);

        tInterleaveBuffer = RedBuffer(
            self, // RedGL Instance
            'tInterleaveBuffer',
            RedBuffer.ARRAY_BUFFER,
            interleaveData,
            [
                RedInterleaveInfo('aVertexPosition', 3),
                RedInterleaveInfo('aVertexNormal', 3),
                RedInterleaveInfo('aTexcoord', 2),
            ]
        );
        tIndexBuffer = RedBuffer(
            self, // RedGL Instance
            'tIndexBuffer', // key
            RedBuffer.ELEMENT_ARRAY_BUFFER, // bufferType
            indexData  // data
        );
        
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        let tTexture = RedBitmapTexture(self, '../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg');
        let tMaterial = RedStandardMaterial(self, tTexture);
        
        let tDLight = RedDirectionalLight(self);
        tDLight.x = 1;
        tDLight.y = 0;
        tDLight.z = 1;
        tScene.addLight(tDLight);

        tGeometry = RedGeometry(tInterleaveBuffer, tIndexBuffer);
        tMesh = RedMesh(
            self,
            tGeometry,
            tMaterial
        );
        tMesh['useCullFace'] = false;
        tScene.addChild(tMesh);

        tRenderer.start(self, function (time) {
            tMesh.rotationY -= 1;
        });
    });
});
