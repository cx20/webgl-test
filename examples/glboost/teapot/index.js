var canvas = document.getElementById("world");
var width = window.innerWidth;
var height = window.innerHeight;
var glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
var renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:0, green:0, blue:0, alpha:1}});
renderer.resize(width, height);

var scene = glBoostContext.createScene();

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var positions = [];
    var textureCoords = [];
    var normals = [];

    for (var i = 0; i < vertexPositions.length; i += 3 ) {
        positions.push( [vertexPositions[i+0], vertexPositions[i+1], vertexPositions[i+2] ]);
    }
    for (var i = 0; i < vertexTextureCoords.length; i += 2 ) {
        textureCoords.push( [vertexTextureCoords[i+0], vertexTextureCoords[i+1] ]);
    }
    for (var i = 0; i < vertexNormals.length; i += 3 ) {
        normals.push( [vertexNormals[i+0], vertexNormals[i+1], vertexNormals[i+2] ]);
    }

    var geometry = glBoostContext.createGeometry();
    var texture = glBoostContext.createTexture('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg');
    var material = glBoostContext.createClassicMaterial();
    material.setTexture(texture);
    material.shaderClass = GLBoost.PhongShader;
    geometry.setVerticesData({
        position: positions,
        normal: normals,
        texcoord: textureCoords
    }, [indices], GLBoost.TRIANGLE);

    var mesh = glBoostContext.createMesh(geometry, material);
    scene.addChild(mesh);
    
    var directionalLight = glBoostContext.createDirectionalLight(new GLBoost.Vector3(1, 1, 1), new GLBoost.Vector3(100, 0, -100));
    scene.addChild( directionalLight );

    var camera = glBoostContext.createPerspectiveCamera({
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

    var expression = glBoostContext.createExpressionAndRenderPasses(1);
    expression.renderPasses[0].scene = scene;
    expression.prepareToRender();

    (function(){
        renderer.clearCanvas();
        renderer.draw(expression);
        var rotateMatrixX = GLBoost.Matrix33.rotateX(0);
        var rotateMatrixY = GLBoost.Matrix33.rotateY(-1);
        var rotatedVector = rotateMatrixX.multiplyVector(camera.eye);
        rotatedVector = rotateMatrixY.multiplyVector(rotatedVector);
        camera.eye = rotatedVector;

        requestAnimationFrame(arguments.callee);
    })();

    function draw(canvas) {
        var domElement = canvas;
        canvas.context.drawImage(domElement, 0, 0, domElement.width, domElement.height);
    }
});
