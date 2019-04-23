var canvas = document.getElementById('c');
var app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
app.start();
app.on("update", function (dt) {
});

app.scene.ambientLight = new pc.Color(1, 1, 1);

var camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(1, 1, 1),
    farClip: 1000,
    fov: 45
});

camera.translate(0,0,2.5);
camera.lookAt(0,0,0);
app.root.addChild(camera);

var Cube = pc.createScript('cube');
Cube.prototype.initialize = function () {
    var node = new pc.scene.GraphNode();
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
    var positions = [ 
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
    ];
    var textureCoords = [
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
    ];
    var indices = [
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ];
    var options = {
        indices: indices,
        uvs: textureCoords
    };
    var mesh = pc.createMesh(app.graphicsDevice, positions, options);

    var material = new pc.StandardMaterial();
    material.diffuseMap = getTexture();
    material.cull = pc.CULLFACE_NONE;

    function getTexture () {
        var texture = new pc.gfx.Texture(app.graphicsDevice);
        
        var img = new Image();
        img.onload = function () {
            texture.minFilter = pc.gfx.FILTER_LINEAR;
            texture.magFilter = pc.gfx.FILTER_LINEAR;
            texture.addressU = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
            texture.addressV = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
            texture.setSource(img);
        };
        img.src = "../../../assets/textures/frog.jpg";  // 256x256
        return texture;
    }

    var instance = new pc.scene.MeshInstance(node, mesh, material);

    var model = new pc.scene.Model();
    model.graph = node;
    model.meshInstances = [ instance ];

    this.entity.addChild(node);
    app.scene.addModel(model);
};

Cube.prototype.update = function (deltaTime) {
    this.entity.rotate(deltaTime * 50, deltaTime * 50, deltaTime * 50);
};

var cube = new pc.Entity();
app.root.addChild(cube);
cube.addComponent('script');
cube.script.create('cube');

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
