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
app.on("update", function (dt) {
});

let camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(0, 0, 0),
    farClip: 1000,
    fov: 45
});

camera.translate(0,0,50);
camera.lookAt(0,0,0);
app.root.addChild(camera);

let light = new pc.Entity();
light.addComponent('light', {
    type: "directional",
    color: new pc.Color(1, 1, 1),
});
light.rotate(90, 30, 0);
app.root.addChild(light);

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    const vertexPositions = new Float32Array(data.vertexPositions);
    const vertexTextureCoords = new Float32Array(data.vertexTextureCoords);
    const vertexNormals = new Float32Array(data.vertexNormals);
    const indices = new Uint16Array(data.indices);

    let Teapot = pc.createScript('teapot');
    Teapot.prototype.initialize = function () {
        const device = this.app.graphicsDevice;

        const mesh = new pc.Mesh(device);

        mesh.setPositions(vertexPositions);
        mesh.setUvs(0, vertexTextureCoords);
        mesh.setNormals(vertexNormals);
        mesh.setIndices(indices);
        mesh.update();

        const material = new pc.StandardMaterial();
        material.diffuseMap = getTexture();
        material.cull = pc.CULLFACE_NONE;
        material.update();

        function getTexture() {
            const texture = new pc.Texture(device, { width: 1024, height: 512 });
            
            const img = new Image();
            img.onload = function () {
                texture.minFilter = pc.FILTER_LINEAR;
                texture.magFilter = pc.FILTER_LINEAR;
                texture.addressU = pc.ADDRESS_REPEAT;
                texture.addressV = pc.ADDRESS_REPEAT;
                texture.setSource(img);
            };
            // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
            img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
            return texture;
        };

        const node = new pc.GraphNode();
        const instance = new pc.MeshInstance(mesh, material);
        instance.node = node;

        const model = new pc.Model();
        model.graph = node;
        model.meshInstances = [instance];

        this.entity.addComponent("model");
        this.entity.model.model = model;
    };

    Teapot.prototype.update = function (deltaTime) {
        this.entity.rotate(0, deltaTime * 50, 0);
    };

    const teapot = new pc.Entity();
    app.root.addChild(teapot);
    teapot.addComponent('script');
    teapot.script.create('teapot');
});

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
