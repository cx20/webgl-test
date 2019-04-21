var geometry = new xeogl.Geometry({
    primitive: "triangles",
    positions: [
        0.0,  0.5, 0.0, // v0
       -0.5, -0.5, 0.0, // v1
        0.5, -0.5, 0.0  // v2
    ],
    normals: [
        0.0,  0.0, 1.0, // v0
        0.0,  0.0, 1.0, // v1
        0.0,  0.0, 1.0, // v2
    ],
    colors: [
        0.0, 0.0, 1.0, 1.0, // v0
        0.0, 0.0, 1.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0, // v2
    ],
    indices: [
        0, 1, 2, // v0-v1-v2
    ]
});

var material = new xeogl.PhongMaterial({
    ambient: [1.0, 1.0, 1.0],
    diffuse: [1, 1, 1]
});

var ambientLight = new xeogl.AmbientLight({
    color: [1.0, 1.0, 1.0]
});

var mesh = new xeogl.Mesh({
    geometry: geometry,
    material: material
});

mesh.scene.camera.view.eye = [0.0, 0.0, 2.0];
