let createScene = function(engine) {
    let scene = new BABYLON.Scene(engine);
    let camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -5), scene);
    let triangle = new BABYLON.Mesh('triangle', scene);
    scene.clearColor = new BABYLON.Color3(1, 1, 1);

    let positions = [
         0.0,  0.5, 0.0, // v0
        -0.5, -0.5, 0.0, // v1
         0.5, -0.5, 0.0  // v2
    ];
    let indices = [0, 1, 2];

    triangle.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
    triangle.setIndices(indices);

    let material = new BABYLON.ShaderMaterial("material", scene, {
        vertexElement: "vs",
        fragmentElement: "fs",
    }, {
        attributes: ["position"]
    });

    triangle.material = material;

    return scene;
}

let canvas = document.querySelector("#c");
let engine = new BABYLON.Engine(canvas, true);
let scene = createScene(engine);

engine.runRenderLoop(function () {
    scene.render();
});
