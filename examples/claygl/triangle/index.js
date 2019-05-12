let TRIANGLE_POSITIONS = [
    [-0.5, -0.5, 0.0], // v0
    [ 0.5, -0.5, 0.0], // v1
    [ 0.0,  0.5, 0.0]  // v2
];

let app = clay.application.create('#viewport', {
    init: function (app) {
        let camera = app.createCamera(null, null, 'orthographic');
        let geometry = new clay.StaticGeometry();
        geometry.attributes.position.fromArray(TRIANGLE_POSITIONS);

        let mesh = app.createMesh(geometry, {
            shader: 'clay.basic'
        });
        mesh.material.set('color', 'blue');
    },

    loop: function () {}
});