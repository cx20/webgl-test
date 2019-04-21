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
    [-0.5, 0.5, 0.0], // v0
    [ 0.5, 0.5, 0.0], // v1 
    [-0.5,-0.5, 0.0], // v2
    [ 0.5,-0.5, 0.0]  // v3
];

var colors = [ 
    [1.0, 0.0, 0.0, 1.0], // v0
    [0.0, 1.0, 0.0, 1.0], // v1
    [0.0, 0.0, 1.0, 1.0], // v2
    [1.0, 1.0, 0.0, 1.0]  // v3
];

var indices = [
    2, 0, 1, // v2-v0-v1
    2, 1, 3  // v2-v1-v3
];

var app = clay.application.create('#viewport', {
    init: function (app) {
        var camera = app.createCamera(null, null, 'orthographic');
        var geometry = new clay.StaticGeometry();
        geometry.attributes.position.fromArray(positions);
        geometry.attributes.color.fromArray(colors);
        geometry.initIndicesFromArray(indices);

        var mesh = app.createMesh(geometry, {
            shader: new clay.Shader({
                vertex: document.getElementById('vs').textContent,
                fragment: document.getElementById('fs').textContent
            })
        });
    },

    loop: function () {}
});