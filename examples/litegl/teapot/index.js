//create the rendering context
var container = document.body;
var gl = GL.create({width: 465, height: 465});
resizeCanvas();
window.addEventListener("resize", function(){
    resizeCanvas();
});

function resizeCanvas() {
    gl.canvas.width = window.innerWidth;
    gl.canvas.height = window.innerHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

container.appendChild(gl.canvas);

var shader = new GL.Shader(
    document.getElementById("vs").textContent,
    document.getElementById("fs").textContent
);

var mode = gl.TRIANGLES;
var mesh;
var texture;

var vertexPositions;
var vertexNormals;
var vertexTextureCoords;
var indices;

//create basic matrices for cameras and transformation
var persp = mat4.create();
var view = mat4.create();
var model = mat4.create();
var mvp = mat4.create();
var temp = mat4.create();
var identity = mat4.create();

//set the camera position
mat4.perspective(persp, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.1, 1000);
mat4.lookAt(view, [0,1,50], [0,0,0], [0,1,0]);

var rad = 0;
gl.ondraw = function() {
    
    //create modelview and projection matrices
    mat4.multiply(temp, view, model);
    mat4.multiply(mvp, persp, temp);

    texture.bind(0);
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    shader.uniforms({
        u_mvp: mvp,
        u_texture: 0,
        u_lightvector: vec3.normalize(vec3.create(),[1,1,1]),
        u_model: model
    }).draw(mesh, mode);
}

//update loop
gl.onupdate = function(dt)
{
    mat4.rotateY(model,model, dt * 0.5);
};

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    mesh = GL.Mesh.load({vertices: vertexPositions, coords: vertexTextureCoords, normals: vertexNormals, triangles: indices});
    var options = {
        magFilter: gl.LINEAR,
        minFilter: gl.NEAREST_MIPMAP_LINEAR,
        wrapS: gl.REPEAT,
        wrapT: gl.REPEAT
    };

    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
    texture = GL.Texture.fromURL("../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg", options);

    gl.animate();

});
