var teapotMesh;

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

var createScene = function(engine) {
    var scene = new BABYLON.Scene(engine);
    var camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -50), scene);
    var light1 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1.0, 0.0, 1.0), scene);
    scene.clearColor = new BABYLON.Color3(0, 0, 0);
    var material = new BABYLON.StandardMaterial("material", scene);
    material.diffuseTexture = new BABYLON.Texture("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/arroway.de_metal+structure+06_d100_flat.jpg", scene);
    teapotMesh = new BABYLON.Mesh("teapot", scene);
    teapotMesh.material = material;
    teapotMesh.material.backFaceCulling = false;
    teapotMesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, vertexPositions, false);
    teapotMesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, vertexNormals, false);
    teapotMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, vertexTextureCoords, false);
    teapotMesh.setIndices(indices);

    return scene;
};

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;
    var canvas = document.querySelector("#c");
    var engine = new BABYLON.Engine(canvas, true);
    var scene = createScene(engine);

    engine.runRenderLoop(function () {
        teapotMesh.rotate(BABYLON.Axis.Y, -Math.PI * 1.0 / 180.0, BABYLON.Space.LOCAL);
        scene.render();
    });
});

