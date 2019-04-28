$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var geometry = new xeogl.Geometry({
        primitive: "triangles",
        positions: vertexPositions,
        normals: vertexNormals,
        uv: vertexTextureCoords,
        indices: indices
    });

    var material = new xeogl.PhongMaterial({
        ambient: [1.0, 1.0, 1.0],
        diffuse: [1, 1, 1],
        diffuseMap: new xeogl.Texture({
            src: "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg",
        })
    });

    var ambientLight = new xeogl.AmbientLight({
        color: [0.0, 0.0, 0.0]
    });

    var mesh = new xeogl.Mesh({
        geometry: geometry,
        material: material
    });

    mesh.scene.camera.view.eye = [0.0, 0.0, 30.0];

    mesh.scene.on("tick", function () {
        mesh.scene.camera.orbitYaw(-1.0);
        //mesh.scene.camera.orbitPitch(1.0);
    });
});




