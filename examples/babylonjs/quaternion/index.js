function init() {
    const canvas = document.querySelector("#c");
    const engine = new BABYLON.Engine(canvas);
    let cube1, cube2;

    const createScene = function() {
        const scene = new BABYLON.Scene(engine);
        const camera = new BABYLON.FreeCamera("camera", new BABYLON.Vector3(0, 0, -5), scene);
        cube1 = new BABYLON.Mesh('cube1', scene);
        cube2 = new BABYLON.Mesh('cube2', scene);
        scene.clearColor = new BABYLON.Color3(1, 1, 1);

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
        const positions = [
                // Front face
                -0.5, -0.5,  0.5, // v0
                 0.5, -0.5,  0.5, // v1
                 0.5,  0.5,  0.5, // v2
                -0.5,  0.5,  0.5, // v3
                // Back face
                -0.5, -0.5, -0.5, // v4
                 0.5, -0.5, -0.5, // v5
                 0.5,  0.5, -0.5, // v6
                -0.5,  0.5, -0.5, // v7
                // Top face
                 0.5,  0.5,  0.5, // v2
                -0.5,  0.5,  0.5, // v3
                -0.5,  0.5, -0.5, // v7
                 0.5,  0.5, -0.5, // v6
                // Bottom face
                -0.5, -0.5,  0.5, // v0
                 0.5, -0.5,  0.5, // v1
                 0.5, -0.5, -0.5, // v5
                -0.5, -0.5, -0.5, // v4
                // Right face
                 0.5, -0.5,  0.5, // v1
                 0.5,  0.5,  0.5, // v2
                 0.5,  0.5, -0.5, // v6
                 0.5, -0.5, -0.5, // v5
                // Left face
                -0.5, -0.5,  0.5, // v0
                -0.5,  0.5,  0.5, // v3
                -0.5,  0.5, -0.5, // v7
                -0.5, -0.5, -0.5  // v4
        ];
        const colors = [
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
        ];
        const uv = [
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
        ];
        const indices = [
             0,  1,  2,    0,  2 , 3,  // Front face
             4,  5,  6,    4,  6 , 7,  // Back face
             8,  9, 10,    8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15,  // Bottom face
            16, 17, 18,   16, 18, 19,  // Right face
            20, 21, 22,   20, 22, 23   // Left face
        ];

        cube1.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
        cube1.setVerticesData(BABYLON.VertexBuffer.UVKind, uv);
        cube1.setIndices(indices);

        cube2.setVerticesData(BABYLON.VertexBuffer.PositionKind, positions, true);
        cube2.setVerticesData(BABYLON.VertexBuffer.UVKind, uv);
        cube2.setIndices(indices);

        const material = new BABYLON.ShaderMaterial("material", scene, {
            vertexElement: "vs",
            fragmentElement: "fs",
        }, {
            attributes: ["position", "uv"],
            uniforms: ["worldViewProjection"]
        });
        
        material.setTexture("texture_", new BABYLON.Texture("../../../assets/textures/frog.jpg", scene)); // 256x256

        cube1.material = material;
        cube1.material.backFaceCulling = false;

        cube2.material = material;
        cube2.material.backFaceCulling = false;
        
        cube1.position.x = -1;
        cube2.position.x =  1;

        return scene;
    };

    const scene = createScene();

    let rad = 0;
    engine.runRenderLoop(function () {
        // rotate
        rad += Math.PI * 1.0 / 180.0;
        cube1.rotation.x = rad;
        cube1.rotation.y = rad;
        cube1.rotation.z = rad;

        // quaternion
        cube2.rotate(BABYLON.Axis.X, Math.PI * 1.0 / 180.0, BABYLON.Space.LOCAL);
        cube2.rotate(BABYLON.Axis.Y, Math.PI * 1.0 / 180.0, BABYLON.Space.LOCAL);
        cube2.rotate(BABYLON.Axis.Z, Math.PI * 1.0 / 180.0, BABYLON.Space.LOCAL);

        scene.render();
    });
}

init();
