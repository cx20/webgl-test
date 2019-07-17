let width = window.innerWidth;
let height = window.innerHeight;

let canvas = document.getElementById("c");
canvas.width = width;
canvas.height = height;

document.body.appendChild( canvas );
let renderer = new zen3d.Renderer(canvas);
renderer.glCore.state.colorBuffer.setClear(1.0, 1.0, 1.0, 1.0);
renderer.glCore.gl.disable(renderer.glCore.gl.CULL_FACE);

let scene = new zen3d.Scene();
let shader = {
    vertexShader: document.getElementById('vs').textContent,
    fragmentShader: document.getElementById('fs').textContent,
    uniforms: {}
};
let material = new zen3d.ShaderMaterial(shader);
let geometry = new zen3d.Geometry();

const positions = [
    -0.5, 0.5, 0.0, // v0
     0.5, 0.5, 0.0, // v1 
    -0.5,-0.5, 0.0, // v2
     0.5,-0.5, 0.0  // v3
];
const colors = [
     1.0, 0.0, 0.0, 1.0, // v0
     0.0, 1.0, 0.0, 1.0, // v1
     0.0, 0.0, 1.0, 1.0, // v2
     1.0, 1.0, 0.0, 1.0  // v3
];
const indices = [
    2, 0, 1, // v2-v0-v1
    2, 1, 3  // v2-v1-v3
];

geometry.setIndex(indices);
geometry.addAttribute('a_Position', new zen3d.BufferAttribute(new Float32Array(positions), 3));
geometry.addAttribute('a_Color', new zen3d.BufferAttribute(new Float32Array(colors), 4));

let square = new zen3d.Mesh(geometry, material);
scene.add(square);

let camera = new zen3d.Camera();
scene.add(camera);

let lastCount = 0;
function loop(count) {
    requestAnimationFrame(loop);
    renderer.render(scene, camera);
}

loop(0);

function onWindowResize() {
    width = window.innerWidth;
    height = window.innerHeight;
    renderer.backRenderTarget.resize(width, height);
}

window.addEventListener("resize", onWindowResize, false);
