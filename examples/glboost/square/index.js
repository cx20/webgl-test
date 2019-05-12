let canvas = document.getElementById("world");
let width = window.innerWidth;
let height = window.innerHeight;
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:1, green:1, blue:1, alpha:1}});
renderer.resize(width, height);

let scene = glBoostContext.createScene();

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
let positions = [
    [-0.5,  0.5, 0.0], // v0
    [ 0.5,  0.5, 0.0], // v1
    [-0.5, -0.5, 0.0], // v2
    [ 0.5, -0.5, 0.0]  // v3
];

let colors = [
    [1.0, 0.0, 0.0],  // v0
    [0.0, 1.0, 0.0],  // v1
    [0.0, 0.0, 1.0],  // v2
    [1.0, 1.0, 0.0]   // v3
];

let indices = [
    0, 2, 1, 3
];

let geometry = glBoostContext.createGeometry();
geometry.setVerticesData({
    position: positions,
    color: colors
}, [indices], GLBoost.TRIANGLE_STRIP);

let mesh = glBoostContext.createMesh(geometry);

scene.addChild(mesh);

let expression = glBoostContext.createExpressionAndRenderPasses(1);
expression.renderPasses[0].scene = scene;
expression.prepareToRender();

(function(){
    renderer.clearCanvas();
    renderer.draw(expression);
    requestAnimationFrame(arguments.callee);
})();

function draw(canvas) {
    let domElement = canvas;
    canvas.context.drawImage(domElement, 0, 0, domElement.width, domElement.height);
}
