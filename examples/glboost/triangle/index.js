var canvas = document.getElementById("world");
var width = window.innerWidth;
var height = window.innerHeight;
var glBoostContext = new GLBoost.GLBoostMiddleContext(canvas);
var renderer = glBoostContext.createRenderer({ canvas: canvas, clearColor: {red:1, green:1, blue:1, alpha:1}});
renderer.resize(width, height);

var scene = glBoostContext.createScene();
var positions = [
    [ 0.0,  0.5, 0.0],
    [-0.5, -0.5, 0.0],
    [ 0.5, -0.5, 0.0]
];

var colors = [
    [0.0, 0.0, 1.0],
    [0.0, 0.0, 1.0],
    [0.0, 0.0, 1.0]
];

var geometry = glBoostContext.createGeometry();
geometry.setVerticesData({
    position: positions,
    color: colors
});
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
