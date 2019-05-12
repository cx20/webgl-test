let geometry = new xeogl.Geometry({
    primitive: "triangles",
    // Cube data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //         [7]------[6]
    //        / |      / |
    //      [3]------[2] |
    //       |  |     |  |
    //       | [4]----|-[5]
    //       |/       |/
    //      [0]------[1]
    //
    positions: [
        // Front face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        // Back face
        -0.5, -0.5, -0.5, // v4
        -0.5,  0.5, -0.5, // v7
         0.5,  0.5, -0.5, // v6
         0.5, -0.5, -0.5, // v5
        // Top face
        -0.5,  0.5, -0.5, // v7
        -0.5,  0.5,  0.5, // v3
         0.5,  0.5,  0.5, // v2
         0.5,  0.5, -0.5, // v6
        // Bottom face
        -0.5, -0.5, -0.5, // v4
         0.5, -0.5, -0.5, // v5
         0.5, -0.5,  0.5, // v1
        -0.5, -0.5,  0.5, // v0
         // Right face
         0.5, -0.5, -0.5, // v5
         0.5,  0.5, -0.5, // v6
         0.5,  0.5,  0.5, // v2
         0.5, -0.5,  0.5, // v1
         // Left face
        -0.5, -0.5, -0.5, // v4
        -0.5, -0.5,  0.5, // v0
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5  // v7
    ],

    normals: [
        // Front face
        0, 0, 1,  // v0
        0, 0, 1,  // v1
        0, 0, 1,  // v2
        0, 0, 1,  // v3
        // Back face
        0, 0, -1, // v4
        0, 0, -1, // v5
        0, 0, -1, // v6
        0, 0, -1, // v7
        // Top face
        0, 1, 0,  // v2
        0, 1, 0,  // v3
        0, 1, 0,  // v7
        0, 1, 0,  // v6
        // Bottom face
        0, -1, 0, // v0
        0, -1, 0, // v1
        0, -1, 0, // v5
        0, -1, 0, // v4
         // Right face
        1, 0, 0,  // v1
        1, 0, 0,  // v2
        1, 0, 0,  // v6
        1, 0, 0,  // v5
         // Left face
        -1, 0, 0, // v0
        -1, 0, 0, // v3
        -1, 0, 0, // v7
        -1, 0, 0, // v4
    ],
    // UV coords
    uv: [
        // Front face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Back face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Top face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Bottom face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Right face
        1, 0,
        0, 0,
        0, 1,
        1, 1,
        // Left face
        1, 0,
        0, 0,
        0, 1,
        1, 1
    ],
    // Color for each vertex
    colors: [
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 0.0, 0.0, 1.0, // Front face
        1.0, 1.0, 0.0, 1.0, // Back face
        1.0, 1.0, 0.0, 1.0, // Back face
        1.0, 1.0, 0.0, 1.0, // Back face
        1.0, 1.0, 0.0, 1.0, // Back face
        0.0, 1.0, 0.0, 1.0, // Top face
        0.0, 1.0, 0.0, 1.0, // Top face
        0.0, 1.0, 0.0, 1.0, // Top face
        0.0, 1.0, 0.0, 1.0, // Top face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.5, 0.5, 1.0, // Bottom face
        1.0, 0.0, 1.0, 1.0, // Right face
        1.0, 0.0, 1.0, 1.0, // Right face
        1.0, 0.0, 1.0, 1.0, // Right face
        1.0, 0.0, 1.0, 1.0, // Right face
        0.0, 0.0, 1.0, 1.0, // Left face
        0.0, 0.0, 1.0, 1.0, // Left face
        0.0, 0.0, 1.0, 1.0, // Left face
        0.0, 0.0, 1.0, 1.0  // Left face
    ],

    indices: [
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
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

mesh.scene.on("tick", function () {
    mesh.scene.camera.orbitYaw(1.0);
    mesh.scene.camera.orbitPitch(1.0);
});
