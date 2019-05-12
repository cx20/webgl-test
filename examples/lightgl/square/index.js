let gl = GL.create();
let mesh = new GL.Mesh({colors:true});

// Square data
//             1.0 y 
//              ^  -1.0 
//              | / z
//              |/       x
// -1.0 -----------------> +1.0
//            / |
//      +1.0 /  |
//           -1.0
// 
//        [0]------[1]
//         |        |
//         |        |
//         |        |
//        [2]------[3]
//
mesh.vertices = [
    [-0.5, 0.5, 0.0], // v0
    [ 0.5, 0.5, 0.0], // v1 
    [-0.5,-0.5, 0.0], // v2
    [ 0.5,-0.5, 0.0]  // v3
];

mesh.colors = [
    [1.0, 0.0, 0.0, 1.0], // v0
    [0.0, 1.0, 0.0, 1.0], // v1
    [0.0, 0.0, 1.0, 1.0], // v2
    [1.0, 1.0, 0.0, 1.0]  // v3
];

mesh.triangles = [[2, 0, 1], [2, 3, 1]];
mesh.compile();

let shader = new GL.Shader(
    document.getElementById("vs").textContent,
    document.getElementById("fs").textContent
);

gl.ondraw = function() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    shader.draw(mesh);
}

gl.fullscreen();
gl.animate();
