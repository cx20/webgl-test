import {
  createGLEngine, createEffect, isEffectReady,
  createVertexBuffer, createIndexBuffer, createMeshVao,
  resizeGLEngine, setViewport, clearEngine,
  useEffect, drawMesh, runRenderLoop,
} from "@babylonjs/lite-gl";

const canvas = document.getElementById("c");
const engine = createGLEngine(canvas, { alpha: false });

const vertexSource = `#version 300 es
in vec3 position;

void main() {
    gl_Position = vec4(position, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
out vec4 glFragColor;

void main() {
    glFragColor = vec4(0.0, 0.0, 1.0, 1.0);
}`;

const effect = createEffect(engine, {
  name: "triangle",
  vertexSource,
  fragmentSource,
  attributeNames: ["position"],
  uniformNames: [],
  samplerNames: [],
});

const positions = new Float32Array([
   0.0,  0.5, 0.0, // v0
  -0.5, -0.5, 0.0, // v1
   0.5, -0.5, 0.0, // v2
]);
const indices = new Uint16Array([0, 1, 2]);

const vertexBuffer = createVertexBuffer(engine, positions);
const indexBuffer = createIndexBuffer(engine, indices);

let mesh = null;

runRenderLoop(engine, () => {
  // The effect compiles asynchronously; wait until it is ready.
  if (!isEffectReady(engine, effect)) return;

  // The mesh VAO needs a ready effect to resolve attribute locations.
  if (!mesh) {
    mesh = createMeshVao(engine, [{
      buffer: vertexBuffer,
      computeStride: true,
      attributes: [{ name: "position", size: 3, divisor: 0 }],
    }], indexBuffer, effect);
  }

  resizeGLEngine(engine);
  setViewport(engine);
  clearEngine(engine, { color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }, depth: true });

  useEffect(engine, effect);
  drawMesh(engine, mesh);
});
