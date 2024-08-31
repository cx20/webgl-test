import * as pc from 'playcanvas';

let canvas = document.getElementById('c');
let app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
app.start();

app.scene.ambientLight = new pc.Color(1, 1, 1);

let camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(1, 1, 1),
    farClip: 1000,
    fov: 45
});

camera.translate(0,0,2.5);
camera.lookAt(0,0,0);
app.root.addChild(camera);

let Triangle = pc.createScript('triangle');
Triangle.prototype.initialize = function () {
    let node = new pc.scene.GraphNode();
    let positions = [
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ];
    let colors = [
        0.0, 0.0, 1.0, 1.0, // v0
        0.0, 0.0, 1.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0  // v2
    ];
    let indices = [ 0, 1, 2 ];
    let options = {
        indices: indices,
        colors: colors.map(function(value){ return value * 255; })
    };
    let mesh = pc.createMesh(app.graphicsDevice, positions, options);

    let material = new pc.StandardMaterial();
    material.diffuseVertexColor = true;

    let instance = new pc.scene.MeshInstance(node, mesh, material);

    let model = new pc.scene.Model();
    model.graph = node;
    model.meshInstances = [ instance ];

    this.entity.addChild(node);
    app.scene.addModel(model);
};

Triangle.prototype.update = function () {
};

let triangle = new pc.Entity();
app.root.addChild(triangle);
triangle.addComponent('script');
triangle.script.create('triangle');

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
