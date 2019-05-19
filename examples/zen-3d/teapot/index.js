let width = window.innerWidth;
let height = window.innerHeight;

let canvas = document.getElementById("c");
canvas.width = width;
canvas.height = height;

document.body.appendChild( canvas );
let renderer = new zen3d.Renderer(canvas);
renderer.glCore.state.colorBuffer.setClear(0.0, 0.0, 0.0, 1.0);
renderer.glCore.gl.disable(renderer.glCore.gl.CULL_FACE);

let scene = new zen3d.Scene();
// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
let texture = zen3d.Texture2D.fromSrc("../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg");
texture.wrapS = renderer.glCore.gl.REPEAT;
texture.wrapT = renderer.glCore.gl.REPEAT;
let shader = {
    vertexShader: document.getElementById('vs').textContent,
    fragmentShader: document.getElementById('fs').textContent,
    uniforms: {
        diffuseMap: texture,
        u_PointLightingLocation: [100.0, 0.0, 100.0]
    }
};
let material = new zen3d.ShaderMaterial(shader);
let geometry = new zen3d.Geometry();

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

let camera = new zen3d.Camera();
camera.position.set(0, 2, 50);
camera.lookAt(new zen3d.Vector3(0, 0, 0), new zen3d.Vector3(0, 1, 0));
camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);
scene.add(camera);

let lastCount = 0;
function loop(count) {

    requestAnimationFrame(loop);

    let delta = count - lastCount;
    lastCount = count;

    // rotate camera
    camera.position.x = - 50 * Math.sin(count / 1000);
    camera.position.z = 50 * Math.cos(count / 1000);
    camera.lookAt(new zen3d.Vector3(0, 0, 0), new zen3d.Vector3(0, 1, 0));

    renderer.render(scene, camera);
}

loop(0);

function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;

    camera.setPerspective(45 / 180 * Math.PI, width / height, 1, 1000);

    renderer.backRenderTarget.resize(width, height);
}

window.addEventListener("resize", onWindowResize, false);

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    geometry.setIndex(indices);
    geometry.addAttribute('a_Position', new zen3d.BufferAttribute(new Float32Array(vertexPositions), 3));
    geometry.addAttribute('a_Normal', new zen3d.BufferAttribute(new Float32Array(vertexNormals), 3));
    geometry.addAttribute('a_Uv', new zen3d.BufferAttribute(new Float32Array(vertexTextureCoords), 2));

    let teapot = new zen3d.Mesh(geometry, material);
    scene.add(teapot);
});
