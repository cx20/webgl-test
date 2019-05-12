let geometry = new xeogl.Geometry({
    primitive: "triangle-strip",
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
    //         |     /  |
    //         |   /    |
    //         | /      |
    //        [2]------[3]
    //
    positions: [
       -0.5, 0.5, 0.0, // v0
        0.5, 0.5, 0.0, // v1 
       -0.5,-0.5, 0.0, // v2
        0.5,-0.5, 0.0  // v3
    ],
    normals: [
        0.0, 0.0, 1.0, // v0
        0.0, 0.0, 1.0, // v1
        0.0, 0.0, 1.0, // v2
        0.0, 0.0, 1.0  // v3
    ],
    colors: [
        1.0, 0.0, 0.0, 1.0, // v0
        0.0, 1.0, 0.0, 1.0, // v1
        0.0, 0.0, 1.0, 1.0, // v2
        1.0, 1.0, 0.0, 1.0  // v3
    ],
    indices: [
        2, 0, 1, // v2-v0-v1
        2, 1, 3, // v2-v1-v3
    ]
});

let material = new xeogl.PhongMaterial({
    ambient: [1.0, 1.0, 1.0],
    diffuse: [1, 1, 1]
});

let ambientLight = new xeogl.AmbientLight({
    color: [1.0, 1.0, 1.0]
});

let mesh = new xeogl.Mesh({
    geometry: geometry,
    material: material
});

mesh.scene.camera.view.eye = [0.0, 0.0, 2.0];
