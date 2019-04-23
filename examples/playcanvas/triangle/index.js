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

var Triangle = pc.createScript('triangle');
Triangle.prototype.initialize = function () {
    var node = new pc.scene.GraphNode();
    var positions = [
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ];
    var colors = [
        0.0, 0.0, 1.0, 1.0, // v0
        0.0, 0.0, 1.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0  // v2
    ];
    var indices = [ 0, 1, 2 ];
    var options = {
        indices: indices,
        colors: colors.map(function(value){ return value * 255; })
    };
    var mesh = pc.createMesh(app.graphicsDevice, positions, options);

    var material = new pc.StandardMaterial();
    material.diffuseVertexColor = true;

    var instance = new pc.scene.MeshInstance(node, mesh, material);

    var model = new pc.scene.Model();
    model.graph = node;
    model.meshInstances = [ instance ];

    this.entity.addChild(node);
    app.scene.addModel(model);
};

Triangle.prototype.update = function () {
};

var triangle = new pc.Entity();
app.root.addChild(triangle);
triangle.addComponent('script');
triangle.script.create('triangle');

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
