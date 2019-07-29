let gl = GL.create();
let meshPlane = new GL.Mesh.plane({coords: true});
let meshCube = new GL.Mesh.cube({coords: true});
let meshSphere = new GL.Mesh.sphere({coords: true});
let texture = GL.Texture.fromURL('../../../assets/textures/earth.jpg');    // 256x256

let shader = new GL.Shader(
    document.getElementById("vs").textContent,
    document.getElementById("fs").textContent
);

let angle = 0;
gl.onupdate = function(seconds) {
    angle += 1.0;
};

gl.ondraw = function() {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    gl.loadIdentity();
    gl.translate(-3, 0, -10);
    gl.rotate(angle, 0, angle, 0);
    texture.bind(0);
    shader.uniforms({
        texture: 0
    }).draw(meshPlane);

    gl.loadIdentity();
    gl.translate(0, 0, -10);
    gl.rotate(angle, 0, angle, 0);
    texture.bind(0);
    shader.uniforms({
        texture: 0
    }).draw(meshCube);

    gl.loadIdentity();
    gl.translate(3, 0, -10);
    gl.rotate(angle, 0, angle, 0);
    texture.bind(0);
    shader.uniforms({
        texture: 0
    }).draw(meshSphere);
}

gl.fullscreen();
gl.animate();
