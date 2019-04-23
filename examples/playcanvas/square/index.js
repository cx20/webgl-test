var canvas = document.getElementById('c');
var app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
app.start();

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
app.on("update", function (dt) {
});

var Square = pc.createScript('square');
Square.prototype.initialize = function () {
    var node = new pc.scene.GraphNode();
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
    var positions = [ 
        -0.5, 0.5, 0.0, // v0
         0.5, 0.5, 0.0, // v1 
        -0.5,-0.5, 0.0, // v2
         0.5,-0.5, 0.0  // v3
    ];
    var indices = [
         2, 0, 1, // v2-v0-v1
         2, 1, 3  // v2-v1-v3
    ];
    var colors = [ 
         1.0, 0.0, 0.0, 1.0, // v0
         0.0, 1.0, 0.0, 1.0, // v1
         0.0, 0.0, 1.0, 1.0, // v2
         1.0, 1.0, 0.0, 1.0  // v3
    ];
    var options = {
        indices: indices,
        colors: colors.map(function(value){ return value * 255; })
    };
    var mesh = pc.createMesh(app.graphicsDevice, positions, options);

    var material = new pc.StandardMaterial();
    material.diffuseVertexColor = true;
    material.cull = pc.CULLFACE_NONE;

    var instance = new pc.scene.MeshInstance(node, mesh, material);

    var model = new pc.scene.Model();
    model.graph = node;
    model.meshInstances = [ instance ];

    this.entity.addChild(node);
    app.scene.addModel(model);
};
Square.prototype.update = function () {
};

var square = new pc.Entity();
app.root.addChild(square);
square.addComponent('script');
square.script.create('square');

window.addEventListener("resize", function () {
    console.log('resize');
    //
    app.resizeCanvas(canvas.width, canvas.height);
});
