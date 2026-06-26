import {
  createGLEngine, createEffect, isEffectReady,
  createVertexBuffer, createIndexBuffer, createMeshVao,
  resizeGLEngine, setViewport, clearEngine, setDepthState,
  loadTexture2D, useEffect, setEffectMatrix, setEffectTexture,
  drawMesh, runRenderLoop,
} from "@babylonjs/lite-gl";

const canvas = document.getElementById("c");
const engine = createGLEngine(canvas, { alpha: false, depth: true });
setDepthState(engine, { test: true, write: true });

const vertexSource = `#version 300 es
in vec3 position;
in vec2 uv;
uniform mat4 worldViewProjection;
out vec2 vTextureCoord;

void main() {
    vTextureCoord = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D texture_;
in vec2 vTextureCoord;
out vec4 glFragColor;

void main() {
    glFragColor = texture(texture_, vTextureCoord);
}`;

const effect = createEffect(engine, {
  name: "texture",
  vertexSource,
  fragmentSource,
  attributeNames: ["position", "uv"],
  uniformNames: ["worldViewProjection"],
  samplerNames: ["texture_"],
});

const positions = new Float32Array([
  // Front face
  -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
  // Back face
  -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5,  0.5, -0.5,  -0.5,  0.5, -0.5,
  // Top face
   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,
  // Bottom face
  -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5, -0.5, -0.5,  -0.5, -0.5, -0.5,
  // Right face
   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
  // Left face
  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5,  -0.5, -0.5, -0.5,
]);
const uvs = new Float32Array([
  1, 0,  0, 0,  0, 1,  1, 1, // Front
  1, 0,  0, 0,  0, 1,  1, 1, // Back
  1, 0,  0, 0,  0, 1,  1, 1, // Top
  1, 0,  0, 0,  0, 1,  1, 1, // Bottom
  1, 0,  0, 0,  0, 1,  1, 1, // Right
  1, 0,  0, 0,  0, 1,  1, 1, // Left
]);
const indices = new Uint16Array([
   0,  1,  2,    0,  2,  3,  // Front
   4,  5,  6,    4,  6,  7,  // Back
   8,  9, 10,    8, 10, 11,  // Top
  12, 13, 14,   12, 14, 15,  // Bottom
  16, 17, 18,   16, 18, 19,  // Right
  20, 21, 22,   20, 22, 23,  // Left
]);

const positionBuffer = createVertexBuffer(engine, positions);
const uvBuffer = createVertexBuffer(engine, uvs);
const indexBuffer = createIndexBuffer(engine, indices);

// 256x256
const texture = loadTexture2D(engine, "../../../assets/textures/frog.jpg", { invertY: true });

const projection = mat4.create();
const view = mat4.create();
const world = mat4.create();
const worldViewProjection = mat4.create();

mat4.lookAt(view, [0, 0, 3], [0, 0, 0], [0, 1, 0]);

let angle = 0;
let mesh = null;

runRenderLoop(engine, () => {
  if (!isEffectReady(engine, effect)) return;

  if (!mesh) {
    mesh = createMeshVao(engine, [
      { buffer: positionBuffer, computeStride: true, attributes: [{ name: "position", size: 3, divisor: 0 }] },
      { buffer: uvBuffer, computeStride: true, attributes: [{ name: "uv", size: 2, divisor: 0 }] },
    ], indexBuffer, effect);
  }

  resizeGLEngine(engine);
  setViewport(engine);
  clearEngine(engine, { color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }, depth: true });

  const aspect = canvas.width / canvas.height;
  mat4.perspective(projection, 0.8, aspect, 0.1, 100.0);

  angle += Math.PI / 180.0;
  mat4.identity(world);
  mat4.rotateX(world, world, angle);
  mat4.rotateY(world, world, angle);
  mat4.rotateZ(world, world, angle);

  mat4.multiply(worldViewProjection, view, world);
  mat4.multiply(worldViewProjection, projection, worldViewProjection);

  useEffect(engine, effect);
  setEffectMatrix(engine, effect, "worldViewProjection", worldViewProjection);
  setEffectTexture(engine, effect, "texture_", texture);
  drawMesh(engine, mesh);
});
