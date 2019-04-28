var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var app = clay.application.create('#viewport', {
        init: function (app) {
            app.renderer.clearColor = [0, 0, 0, 1];
            var camera = app.createCamera(null, null, 'perspective');
            camera.position.set(0, 0, 50);
            var geometry = new clay.StaticGeometry();
            geometry.attributes.position.fromArray(vertexPositions);
            geometry.attributes.normal.fromArray(vertexNormals);
            geometry.attributes.texcoord0.fromArray(vertexTextureCoords);
            geometry.initIndicesFromArray(indices);

            var vs = document.getElementById('vs').textContent;
            var fs = document.getElementById('fs').textContent;
            var material= new clay.Material({
                shader: new clay.Shader(vs, fs)
            });
            var diffuse = new clay.Texture2D;
            diffuse.load("../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg");
            material.set('texture', diffuse);
            this._mesh = app.createMesh(geometry, material);
            this._mesh.culling = false;
        },

        loop: function () {
            //this._mesh.rotation.rotateX(app.frameTime / 1000);
            this._mesh.rotation.rotateY(app.frameTime / 1000);
            //this._mesh.rotation.rotateZ(app.frameTime / 1000);
        }
    });
});

