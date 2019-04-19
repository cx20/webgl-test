var gl = GL.create({width: 465, height:465});
document.body.appendChild(gl.canvas);

var vertices = [
     0.0, 0.5, 0.0, // v0
    -0.5,-0.5, 0.0, // v1
     0.5,-0.5, 0.0  // v2
];

var mesh = GL.Mesh.load({vertices: vertices});

var shader = new GL.Shader(
    document.getElementById("vs").textContent,
    document.getElementById("fs").textContent
);

var mode = gl.TRIANGLES;

gl.ondraw = function() {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    shader.draw(mesh, mode);
}

gl.animate();
