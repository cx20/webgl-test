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

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    let Teapot = pc.createScript('teapot');
    Teapot.prototype.initialize = function () {
        let node = new pc.scene.GraphNode();
        let options = {
            indices: indices,
            normals: vertexNormals,
            uvs: vertexTextureCoords
        };
        let mesh = pc.createMesh(app.graphicsDevice, vertexPositions, options);

        let material = new pc.StandardMaterial();
        material.diffuseMap = getTexture();
        material.cull = pc.CULLFACE_NONE;

        function getTexture () {
            let texture = new pc.gfx.Texture(app.graphicsDevice, {
                width: 1024,
                height: 512
            });
            
            let img = new Image();
            img.onload = function () {
                texture.minFilter = pc.gfx.FILTER_LINEAR;
                texture.magFilter = pc.gfx.FILTER_LINEAR;
                texture.addressU = pc.gfx.ADDRESS_REPEAT;
                texture.addressV = pc.gfx.ADDRESS_REPEAT;
                texture.setSource(img);
            };
            // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
            img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
            return texture;
        }

        let instance = new pc.scene.MeshInstance(node, mesh, material);

        let model = new pc.scene.Model();
        model.graph = node;
        model.meshInstances = [ instance ];

        this.entity.addChild(node);
        app.scene.addModel(model);
    };

    Teapot.prototype.update = function (deltaTime) {
        this.entity.rotate(0, deltaTime * 50, 0);
    };

    let teapot = new pc.Entity();
    app.root.addChild(teapot);
    teapot.addComponent('script');
    teapot.script.create('teapot');

});

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
