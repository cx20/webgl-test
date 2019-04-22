var camera = new Hilo3d.PerspectiveCamera();
var stage = new Hilo3d.Stage({
    container: document.getElementById('container'),
    camera: camera,
    clearColor: new Hilo3d.Color(1.0, 1.0, 1.0),
    width: innerWidth,
    height: innerHeight
});
var positions = new Float32Array([
     0.0, 0.5, 0.0, // v0
    -0.5,-0.5, 0.0, // v1
     0.5,-0.5, 0.0  // v2
]);
var geometry = new Hilo3d.Geometry({
    vertices:new Hilo3d.GeometryData(positions, 3)
});
var mesh = new Hilo3d.Mesh({
    geometry: geometry,
    material: new Hilo3d.ShaderMaterial({
        attributes:{
            a_position: 'POSITION',
        },
        fs: document.getElementById('fs').textContent,
        vs: document.getElementById('vs').textContent
    })
});
stage.addChild(mesh);

var ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.start(true);

