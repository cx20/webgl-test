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
    [-0.5, 0.5, 0.0], // v0
    [ 0.5, 0.5, 0.0], // v1 
    [-0.5,-0.5, 0.0], // v2
    [ 0.5,-0.5, 0.0]  // v3
];

let colors = [ 
    [1.0, 0.0, 0.0, 1.0], // v0
    [0.0, 1.0, 0.0, 1.0], // v1
    [0.0, 0.0, 1.0, 1.0], // v2
    [1.0, 1.0, 0.0, 1.0]  // v3
];

let indices = [
    2, 0, 1, // v2-v0-v1
    2, 1, 3  // v2-v1-v3
];

let app = clay.application.create('#viewport', {
    init: function (app) {
        let camera = app.createCamera(null, null, 'orthographic');
        let geometry = new clay.StaticGeometry();
        geometry.attributes.position.fromArray(positions);
        geometry.attributes.color.fromArray(colors);
        geometry.initIndicesFromArray(indices);

        let vs = document.getElementById('vs').textContent;
        let fs = document.getElementById('fs').textContent;
        let material= new clay.Material({
            shader: new clay.Shader(vs, fs)
        });
        this._mesh = app.createMesh(geometry, material);
        this._mesh.culling = false;
    },

    loop: function () {}
});