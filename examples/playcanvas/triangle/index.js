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
    const device = this.app.graphicsDevice;

    const mesh = new pc.Mesh(device);
    
    const positions = new Float32Array([
        0.0,  0.5, 0.0, // v0
       -0.5, -0.5, 0.0, // v1
        0.5, -0.5, 0.0  // v2
    ]);
    const colors = new Float32Array([
        0.0, 0.0, 1.0, 1.0, // v0
        0.0, 0.0, 1.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0  // v2
    ]);

	const indices = new Uint16Array([0, 1, 2]);
    mesh.setPositions(positions);
    mesh.setColors(colors);
    mesh.setIndices(indices);
    mesh.update();

    const material = new pc.StandardMaterial();
    material.diffuseVertexColor = true;
    material.update();

    const node = new pc.GraphNode();
    const instance = new pc.MeshInstance(mesh, material);
    instance.node = node;

    const model = new pc.Model();
    model.graph = node;
    model.meshInstances = [instance];

    this.entity.addComponent("model");
    this.entity.model.model = model;
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
