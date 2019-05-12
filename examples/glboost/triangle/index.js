let canvas = document.getElementById("world");
let width = window.innerWidth;
let height = window.innerHeight;
let glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
let renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:1, green:1, blue:1, alpha:1}});
renderer.resize(width, height);

let scene = glBoostContext.createScene();
let positions = [
    [ 0.0,  0.5, 0.0],
    [-0.5, -0.5, 0.0],
    [ 0.5, -0.5, 0.0]
];

let colors = [
    [0.0, 0.0, 1.0],
    [0.0, 0.0, 1.0],
    [0.0, 0.0, 1.0]
];

let geometry = glBoostContext.createGeometry();
geometry.setVerticesData({
    position: positions,
    color: colors
});
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
