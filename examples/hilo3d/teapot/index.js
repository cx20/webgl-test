var camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 1000,
    near: 0.1,
    z: 50
});
var stage = new Hilo3d.Stage({
    container: document.getElementById('container'),
    camera: camera,
    clearColor: new Hilo3d.Color(0.0, 0.0, 0.0),
    width: innerWidth,
    height: innerHeight
});

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    var geometry = new Hilo3d.Geometry({
        vertices: new Hilo3d.GeometryData(new Float32Array(vertexPositions), 3),
        uvs: new Hilo3d.GeometryData(new Float32Array(vertexTextureCoords), 2),
        normals: new Hilo3d.GeometryData(new Float32Array(vertexNormals), 3),
        indices: new Hilo3d.GeometryData(new Uint16Array(indices), 1)
    });

    var mesh = new Hilo3d.Mesh({
        rotationX: 0,
        rotationY: 0,
        rotationZ: 0,
        geometry: geometry,
        material: new Hilo3d.ShaderMaterial({
            cullFace: false,
            diffuse: new Hilo3d.LazyTexture({
                src: '../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg'
            }),
            uniforms:{
                u_modelViewProjectionMatrix: 'MODELVIEWPROJECTION',
                u_modelViewMatrix: 'MODELVIEW',
                u_diffuse: 'DIFFUSE',
            },
            attributes:{
                a_position: 'POSITION',
                a_normal: 'NORMAL',
                a_texcoord0: 'TEXCOORD_0'
            },
            fs: document.getElementById('fs').textContent,
            vs: document.getElementById('vs').textContent
        }),
        onUpdate: function() {
           //this.rotationX += 0.5;
           this.rotationY += 0.5;
           //this.rotationZ += 0.5;
        }
    });

    stage.addChild(mesh);

    var ticker = new Hilo3d.Ticker(60);
    ticker.addTick(stage);
    ticker.start(true);

});