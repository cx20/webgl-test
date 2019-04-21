var TRIANGLE_POSITIONS = [
    [-0.5, -0.5, 0.0], // v0
    [ 0.5, -0.5, 0.0], // v1
    [ 0.0,  0.5, 0.0]  // v2
];

var app = clay.application.create('#viewport', {
    init: function (app) {
        var camera = app.createCamera(null, null, 'orthographic');
        var geometry = new clay.StaticGeometry();
        geometry.attributes.position.fromArray(TRIANGLE_POSITIONS);

        var mesh = app.createMesh(geometry, {
            shader: 'clay.basic'
        });
        mesh.material.set('color', 'blue');
    },

    loop: function () {}
});