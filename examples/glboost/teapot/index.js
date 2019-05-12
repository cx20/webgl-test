let canvas = document.getElementById("world");
let width = window.innerWidth;
let height = window.innerHeight;
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:0, green:0, blue:0, alpha:1}});
renderer.resize(width, height);

let scene = glBoostContext.createScene();

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

    let positions = [];
    let textureCoords = [];
    let normals = [];

    for (let i = 0; i < vertexPositions.length; i += 3 ) {
        positions.push( [vertexPositions[i+0], vertexPositions[i+1], vertexPositions[i+2] ]);
    }
    for (let i = 0; i < vertexTextureCoords.length; i += 2 ) {
        textureCoords.push( [vertexTextureCoords[i+0], vertexTextureCoords[i+1] ]);
    }
    for (let i = 0; i < vertexNormals.length; i += 3 ) {
        normals.push( [vertexNormals[i+0], vertexNormals[i+1], vertexNormals[i+2] ]);
    }

    let geometry = glBoostContext.createGeometry();
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
    let texture = glBoostContext.createTexture('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg');
    let material = glBoostContext.createClassicMaterial();
    material.setTexture(texture);
    material.shaderClass = GLBoost.PhongShader;
    geometry.setVerticesData({
        position: positions,
        normal: normals,
        texcoord: textureCoords
    }, [indices], GLBoost.TRIANGLE);

    let mesh = glBoostContext.createMesh(geometry, material);
    scene.addChild(mesh);
    
    let pointLight = glBoostContext.createPointLight(new GLBoost.Vector3(1.0, 1.0, 1.0));
    pointLight.translate = new GLBoost.Vector3(100, 0, 100);
    scene.addChild(pointLight);

    let camera = glBoostContext.createPerspectiveCamera({
        eye: new GLBoost.Vector3(0.0, 0.0, 50.0),
        center: new GLBoost.Vector3(0.0, 0.0, 0.0),
        up: new GLBoost.Vector3(0.0, 1.0, 0.0)
    }, {
        fovy: 45.0,
        aspect: 1.0,
        zNear: 0.1,
        zFar: 1000.0
    });

    scene.addChild(camera);

    let expression = glBoostContext.createExpressionAndRenderPasses(1);
    expression.renderPasses[0].scene = scene;
    expression.prepareToRender();

    (function(){
        renderer.clearCanvas();
        renderer.draw(expression);
        let rotateMatrixX = GLBoost.Matrix33.rotateX(0);
        let rotateMatrixY = GLBoost.Matrix33.rotateY(-1);
        let rotatedVector = rotateMatrixX.multiplyVector(camera.eye);
        rotatedVector = rotateMatrixY.multiplyVector(rotatedVector);
        camera.eye = rotatedVector;

        requestAnimationFrame(arguments.callee);
    })();

    function draw(canvas) {
        let domElement = canvas;
        canvas.context.drawImage(domElement, 0, 0, domElement.width, domElement.height);
    }
});
