// setup GLBoost renderer
let canvas = document.getElementById("world");
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);

let renderer = glBoostContext.createRenderer({
  clearColor: {
    red: 0.0,
    green: 0.0,
    blue: 0.0,
    alpha: 1
  }
});

// make a scene
let scene = glBoostContext.createScene();

// setup material
let material = glBoostContext.createClassicMaterial();
let texture = glBoostContext.createTexture('../../../assets/textures/earth.jpg');
material.setTexture(texture);
material.shaderClass = GLBoost.PhongShader;

// createPlane(width, height, uSpan, vSpan, customVertexAttributes, isUVRepeat
let geometryPlane = glBoostContext.createPlane(1, 1, 1, 1);
let meshPlane = glBoostContext.createMesh(geometryPlane, material);
meshPlane.translate = new GLBoost.Vector3(-1.5, 1.5, 0.0);

// createCube(widthVector, vertexColor)
let geometryCube = glBoostContext.createCube(new GLBoost.Vector3(1,1,1), new GLBoost.Vector4(1,1,1,1));
let meshCube = glBoostContext.createMesh(geometryCube, material);
meshCube.translate = new GLBoost.Vector3(0.0, 1.5, 0.0);

// createSphere(radius, widthSegments, heightSegments, vertexColor)
let geometrySphere = glBoostContext.createSphere(0.5, 24, 24, null);
let meshSphere = glBoostContext.createMesh(geometrySphere, material);
meshSphere.translate = new GLBoost.Vector3(1.5, 1.5, 0.0);

// createAxisGizmo(length)
let meshAxis = glBoostContext.createAxisGizmo(0.5);
meshAxis.translate = new GLBoost.Vector3(-1.5, -0.5, 0.0);

// createGridGizmo(length, division, isXZ, isXY, isYZ, colorVec)
let meshGrid = glBoostContext.createGridGizmo(0.5, 2, true, true, false, new GLBoost.Vector4(1, 1, 1, 1));
meshGrid.translate = new GLBoost.Vector3(0.0, -0.5, 0.0);

let materialB = glBoostContext.createClassicMaterial();
let textureB = glBoostContext.createTexture('../../../assets/textures/earth.jpg');
materialB.setTexture(textureB);
materialB.shaderClass = GLBoost.PhongShader;


let wide = 1.0;
let particlesPosition = [];
for (let i=0; i<100; i++) {
  particlesPosition.push([(Math.random() - 0.5)*wide, (Math.random() - 0.5)*wide, (Math.random() - 0.5)*wide]);
}
// createParticle(centerPointData, particleWidth, particleHeight, customVertexAttributes, performanceHint)
let geometryParticle = glBoostContext.createParticle({position: particlesPosition}, 0.1, 0.1, null, GLBoost.DYNAMIC_DRAW);
let meshParticle = glBoostContext.createMesh(geometryParticle, materialB);
meshParticle.translate = new GLBoost.Vector3(1.5, -0.5, 0.0);

scene.addChild(meshPlane);
scene.addChild(meshSphere);
scene.addChild(meshCube);
scene.addChild(meshAxis);
scene.addChild(meshGrid);
scene.addChild(meshParticle);

let pointLight = glBoostContext.createPointLight(new GLBoost.Vector3(1.0, 1.0, 1.0));
pointLight.translate = new GLBoost.Vector3(10, 10, 10);
scene.addChild(pointLight);
/*
let directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(1, 1, 1));
scene.addChild( directionalLight );
*/

let camera = glBoostContext.createPerspectiveCamera({
  eye: new GLBoost.Vector3(0.0, 0.0, 3.0),
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
let axis = new GLBoost.Vector3(0,1,0);

let render = function() {
  renderer.clearCanvas();
  renderer.draw(expression);

  //meshPlane.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshPlane.rotate = new GLBoost.Vector3(90, 0, GLBoost.MathUtil.radianToDegree(-angle));
  meshSphere.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshCube.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshAxis.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshGrid.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));
  meshParticle.quaternion = GLBoost.Quaternion.axisAngle(axis, GLBoost.MathUtil.radianToDegree(angle));

  angle += 0.02;
    
  requestAnimationFrame(render);
};

render();
