//create the rendering context
let container = document.body;

let gl = GL.create({width: 465, height: 465});
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
//          7]------[6]
//        / |      / |
//       3]------[2] |
//       |  |     |  |
//       | [4]----|-[5]
//       |/       |/
//       0]------[1]
//
let vertices = [
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

let colors = [
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

let triangles = [
      0,  1,  2,   0,  2 , 3,  // Front face
      4,  5,  6,   4,  6 , 7,  // Back face
      8,  9, 10,   8, 10, 11,  // Top face
     12, 13, 14,  12, 14, 15,  // Bottom face
     16, 17, 18,  16, 18, 19,  // Right face
     20, 21, 22,  20, 22, 23   // Left face
];

let mesh = GL.Mesh.load({vertices: vertices, colors: colors, triangles: triangles});

let shader = new GL.Shader(
    document.getElementById("vs").textContent,
    document.getElementById("fs").textContent
);

let mode = gl.TRIANGLES;

//create basic matrices for cameras and transformation
let persp = mat4.create();
let view = mat4.create();
let model = mat4.create();
let mvp = mat4.create();
let temp = mat4.create();
let identity = mat4.create();

//set the camera position
mat4.perspective(persp, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.1, 1000);
mat4.lookAt(view, [0,1,3], [0,0,0], [0,1,0]);

let rad = 0;
gl.ondraw = function() {
    
    //create modelview and projection matrices
    mat4.multiply(temp, view, model);
    mat4.multiply(mvp, persp, temp);

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    shader.uniforms({
        u_mvp: mvp
    }).draw(mesh, mode);
}

//update loop
gl.onupdate = function(dt)
{
    //rotate cube
    mat4.rotateX(model,model, dt * 0.5);
    mat4.rotateY(model,model, dt * 0.5);
    mat4.rotateZ(model,model, dt * 0.5);
};

gl.animate();
