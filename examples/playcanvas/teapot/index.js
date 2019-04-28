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

//app.scene.ambientLight = new pc.Color(1, 1, 1);

var camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(0, 0, 0),
    farClip: 1000,
    fov: 45
});

camera.translate(0,0,50);
camera.lookAt(0,0,0);
app.root.addChild(camera);

var light = new pc.Entity();
light.addComponent('light', {
    type: "directional",
    color: new pc.Color(1, 1, 1),
});
light.rotate(90, 30, 0);
app.root.addChild(light);

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var Teapot = pc.createScript('teapot');
    Teapot.prototype.initialize = function () {
        var node = new pc.scene.GraphNode();
        var options = {
            indices: indices,
            normals: vertexNormals,
            uvs: vertexTextureCoords
        };
        var mesh = pc.createMesh(app.graphicsDevice, vertexPositions, options);

        var material = new pc.StandardMaterial();
        material.diffuseMap = getTexture();
        material.cull = pc.CULLFACE_NONE;

        function getTexture () {
            var texture = new pc.gfx.Texture(app.graphicsDevice);
            
            var img = new Image();
            img.onload = function () {
                texture.minFilter = pc.gfx.FILTER_LINEAR;
                texture.magFilter = pc.gfx.FILTER_LINEAR;
                texture.addressU = pc.gfx.ADDRESS_REPEAT;
                texture.addressV = pc.gfx.ADDRESS_REPEAT;
                texture.setSource(img);
            };
            img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
            return texture;
        }

        var instance = new pc.scene.MeshInstance(node, mesh, material);

        var model = new pc.scene.Model();
        model.graph = node;
        model.meshInstances = [ instance ];

        this.entity.addChild(node);
        app.scene.addModel(model);
    };

    Teapot.prototype.update = function (deltaTime) {
        this.entity.rotate(0, deltaTime * 50, 0);
    };

    var teapot = new pc.Entity();
    app.root.addChild(teapot);
    teapot.addComponent('script');
    teapot.script.create('teapot');

});

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
