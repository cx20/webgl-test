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
app.on("update", function (dt) {
});

let Square = pc.createScript('square');
Square.prototype.initialize = function () {
    const device = this.app.graphicsDevice;

    const mesh = new pc.Mesh(device);
    
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
    const positions = new Float32Array([
        -0.5,  0.5, 0.0, // v0
         0.5,  0.5, 0.0, // v1 
        -0.5, -0.5, 0.0, // v2
         0.5, -0.5, 0.0  // v3
    ]);

    const colors = new Float32Array([
        1.0, 0.0, 0.0, 1.0, // v0
        0.0, 1.0, 0.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0, // v2
        1.0, 1.0, 0.0, 1.0  // v3
    ]);

    const indices = new Uint16Array([
        2, 0, 1, // v2-v0-v1
        2, 1, 3  // v2-v1-v3
    ]);

    mesh.setPositions(positions);
    mesh.setColors(colors);
    mesh.setIndices(indices);
    mesh.update();

    const material = new pc.StandardMaterial();
    material.diffuseVertexColor = true;
    material.cull = pc.CULLFACE_NONE;
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

Square.prototype.update = function () {
};

let square = new pc.Entity();
app.root.addChild(square);
square.addComponent('script');
square.script.create('square');

window.addEventListener("resize", function () {
    console.log('resize');
    //
    app.resizeCanvas(canvas.width, canvas.height);
});
