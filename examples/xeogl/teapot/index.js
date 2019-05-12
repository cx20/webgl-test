// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    let geometry = new xeogl.Geometry({
        primitive: "triangles",
        positions: vertexPositions,
        normals: vertexNormals,
        uv: vertexTextureCoords,
        indices: indices
    });

    let material = new xeogl.PhongMaterial({
        ambient: [1.0, 1.0, 1.0],
        diffuse: [1, 1, 1],
        diffuseMap: new xeogl.Texture({
            // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
            src: "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg",
        })
    });

    let mesh = new xeogl.Mesh({
        geometry: geometry,
        material: material
    });

    mesh.scene.camera.view.eye = [0.0, 0.0, 30.0];

    mesh.scene.on("tick", function () {
        mesh.scene.camera.orbitYaw(-1.0);
        //mesh.scene.camera.orbitPitch(1.0);
    });
});




