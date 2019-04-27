var gl = GL.create();

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

var mesh = new GL.Mesh({coords: true});
var options = {
    magFilter: gl.LINEAR,
    minFilter: gl.NEAREST_MIPMAP_LINEAR,
    wrapS: gl.REPEAT,
    wrapT: gl.REPEAT
};
//var texture = GL.Texture.fromURL('https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/arroway.de_metal+structure+06_d100_flat.jpg');
var texture = GL.Texture.fromURL('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg', options);
var vs = document.getElementById("vs").textContent;
var fs = document.getElementById("fs").textContent;
var shader = new GL.Shader(vs, fs);

var angle = 0;
gl.onupdate = function(seconds) {
    angle += 1.0;
};

gl.ondraw = function() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.loadIdentity();
    gl.translate(0, 0, -50);
    gl.rotate(angle, 0, angle, 0);
    texture.bind(0);
    shader.uniforms({
        texture: 0
    }).draw(mesh);
}


$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    mesh.vertices = [];
    mesh.coords = [];
    mesh.normals = [];
    mesh.triangles = [];

    for (var i = 0; i < vertexPositions.length; i += 3 ) {
        mesh.vertices.push( [vertexPositions[i+0], vertexPositions[i+1], vertexPositions[i+2] ]);
    }
    for (var i = 0; i < vertexTextureCoords.length; i += 2 ) {
        mesh.coords.push( [vertexTextureCoords[i+0], vertexTextureCoords[i+1] ]);
    }
    for (var i = 0; i < vertexNormals.length; i += 3 ) {
        mesh.normals.push( [vertexNormals[i+0], vertexNormals[i+1], vertexNormals[i+2] ]);
    }
    for (var i = 0; i < indices.length; i += 3 ) {
        mesh.triangles.push( [indices[i+0], indices[i+1], indices[i+2] ]);
    }
    mesh.compile();

    gl.fullscreen();
    gl.animate();
});
