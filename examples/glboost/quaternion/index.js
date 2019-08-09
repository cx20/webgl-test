// setup GLBoost renderer
let canvas = document.getElementById("world");
let width = window.innerWidth;
let height = window.innerHeight;
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);

let renderer = glBoostContext.createRenderer({
    clearColor: {
        red: 0.0,
        green: 0.0,
        blue: 0.0,
        alpha: 1
    }
});
renderer.resize(width, height);

// make a scene
let scene = glBoostContext.createScene();

// setup material
let material = glBoostContext.createClassicMaterial();
let texture = glBoostContext.createTexture('../../../assets/textures/frog.jpg'); // 256x256
material.setTexture(texture);
material.shaderClass = GLBoost.PhongShader;

// createCube(widthVector, vertexColor)
let geometryCube = glBoostContext.createCube(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector4(1, 1, 1, 1));
let meshCube1 = glBoostContext.createMesh(geometryCube, material);
let meshCube2 = glBoostContext.createMesh(geometryCube, material);
meshCube1.translate = new GLBoost.Vector3(-1.0, 0.0, 0.0);
meshCube2.translate = new GLBoost.Vector3(1.0, 0.0, 0.0);

scene.addChild(meshCube1);
scene.addChild(meshCube2);

let pointLight = glBoostContext.createPointLight(new GLBoost.Vector3(1.0, 1.0, 1.0));
pointLight.translate = new GLBoost.Vector3(10, 10, 10);
scene.addChild(pointLight);
let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(1, 1, 1));
scene.addChild( directionalLight );

let camera = glBoostContext.createPerspectiveCamera({
    eye: new GLBoost.Vector3(0.0, 1.0, 3.0),
    center: new GLBoost.Vector3(0.0, 0.0, 0.0),
    up: new GLBoost.Vector3(0.0, 1.0, 0.0)
}, {
    fovy: 45.0,
    aspect: 1.0,
    zNear: 0.1,
    zFar: 1000.0
});
camera.cameraController = glBoostContext.createCameraController();
scene.addChild(camera);

let expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

let angle = 0;
let axis = new GLBoost.Vector3(0, 1, 0);

let render = function() {
    renderer.clearCanvas();
    renderer.draw(expression);
    
    // radian to degree
    let degree = GLBoost.MathUtil.radianToDegree(angle);

    // rotate
    meshCube1.rotate = new GLBoost.Vector3(degree, degree, degree);

    // quaternion
    meshCube2.quaternion = GLBoost.Quaternion.axisAngle(axis, degree);

    angle += 0.02;

    requestAnimationFrame(render);
};

render();