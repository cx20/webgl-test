let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    let app = clay.application.create('#viewport', {
        init: function (app) {
            app.renderer.clearColor = [0, 0, 0, 1];
            let camera = app.createCamera(null, null, 'perspective');
            camera.position.set(0, 0, 50);
            let geometry = new clay.StaticGeometry();
            geometry.attributes.position.fromArray(vertexPositions);
            geometry.attributes.normal.fromArray(vertexNormals);
            geometry.attributes.texcoord0.fromArray(vertexTextureCoords);
            geometry.initIndicesFromArray(indices);

            let vs = document.getElementById('vs').textContent;
            let fs = document.getElementById('fs').textContent;
            let material= new clay.Material({
                shader: new clay.Shader(vs, fs)
            });
            let diffuse = new clay.Texture2D;
            // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
            diffuse.load("../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg");
            material.set('texture', diffuse);
            material.set('uPointLightingLocation', [100.0, 0.0, 100.0]);
            this._mesh = app.createMesh(geometry, material);
            this._mesh.culling = false;
        },

        loop: function () {
            this._mesh.rotation.rotateY(app.frameTime / 1000);
        }
    });
});

