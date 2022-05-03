const canvas = document.querySelector("#c");
const engine = new BABYLON.Engine(canvas);

const createScene = function() {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -50), scene);
    const light1 = new BABYLON.DirectionalLight("dir01", new BABYLON.Vector3(1.0, 0.0, 1.0), scene);
    scene.clearColor = new BABYLON.Color3(1, 1, 1);

    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
    $.getJSON("../../../assets/json/teapot.json", function (data) {
        const vertexPositions = data.vertexPositions;
        const vertexTextureCoords = data.vertexTextureCoords;
        const vertexNormals = data.vertexNormals;
        const indices = data.indices;

        const teapotMesh = new BABYLON.Mesh("teapot", scene);
        teapotMesh.setVerticesData(BABYLON.VertexBuffer.PositionKind, vertexPositions, false);
        teapotMesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, vertexNormals, false);
        teapotMesh.setVerticesData(BABYLON.VertexBuffer.UVKind, vertexTextureCoords, false);
        teapotMesh.setIndices(indices);

        const material = new BABYLON.StandardMaterial("material", scene);
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        material.diffuseTexture = new BABYLON.Texture("../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg", scene);
        teapotMesh.material = material;
        teapotMesh.material.backFaceCulling = false;

        scene.onBeforeRenderObservable.add(() => {
            teapotMesh.rotate(BABYLON.Axis.Y, -Math.PI * 1.0 / 180.0 * scene.getAnimationRatio(), BABYLON.Space.LOCAL);
        });
    });

    return scene;
};

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});

window.addEventListener('resize', () => {
    engine.resize();
});