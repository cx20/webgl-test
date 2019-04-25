var canvas = document.getElementById("world");
var width = window.innerWidth;
var height = window.innerHeight;
var glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
var renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:1, green:1, blue:1, alpha:1}});
renderer.resize(width, height);

var scene = glBoostContext.createScene();

// Square data
//             1.0 y 
//              ^  -1.0 
//              | / z
//              |/       x
// -1.0 -----------------> +1.0
//            / |
//      +1.0 /  |
//           -1.0
// 
//        [0]------[1]
//         |        |
//         |        |
//         |        |
//        [2]------[3]
//
var positions = [
    [-0.5,  0.5, 0.0], // v0
    [ 0.5,  0.5, 0.0], // v1
    [-0.5, -0.5, 0.0], // v2
    [ 0.5, -0.5, 0.0]  // v3
];

var colors = [
    [1.0, 0.0, 0.0],  // v0
    [0.0, 1.0, 0.0],  // v1
    [0.0, 0.0, 1.0],  // v2
    [1.0, 1.0, 0.0]   // v3
];

var indices = [
    0, 2, 1, 3
];

var geometry = glBoostContext.createGeometry();
geometry.setVerticesData({
    position: positions,
    color: colors
}, [indices], GLBoost.TRIANGLE_STRIP);

var mesh = glBoostContext.createMesh(geometry);

scene.addChild(mesh);

var expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

(function(){
    renderer.clearCanvas();
    renderer.draw(expression);
    requestAnimationFrame(arguments.callee);
})();

function draw(canvas) {
    var domElement = canvas;
    canvas.context.drawImage(domElement, 0, 0, domElement.width, domElement.height);
}
