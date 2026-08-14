import {
  createGLEngine, createEffect, isEffectReady,
  createVertexBuffer, createIndexBuffer, createMeshVao,
  resizeGLEngine, setViewport, clearEngine,
  useEffect, drawMesh, runRenderLoop,
} from "@babylonjs/lite-gl";

const canvas = document.getElementById("c");
const engine = createGLEngine(canvas, { alpha: false });

const vertexSource = document.getElementById("vs").textContent;
const fragmentSource = document.getElementById("fs").textContent;

const effect = createEffect(engine, {
  name: "square",
  vertexSource,
  fragmentSource,
  attributeNames: ["position", "color"],
  uniformNames: [],
  samplerNames: [],
});

// Square data
//        [0]------[1]
//         |      / |
//         |    /   |
//         |  /     |
//        [2]------[3]
//
const positions = new Float32Array([
  -0.5,  0.5, 0.0, // v0
   0.5,  0.5, 0.0, // v1
  -0.5, -0.5, 0.0, // v2
   0.5, -0.5, 0.0, // v3
]);
const colors = new Float32Array([
  1.0, 0.0, 0.0, 1.0, // v0
  0.0, 1.0, 0.0, 1.0, // v1
  0.0, 0.0, 1.0, 1.0, // v2
  1.0, 1.0, 0.0, 1.0, // v3
]);
const indices = new Uint16Array([
  2, 0, 1, // v2-v0-v1
  2, 1, 3, // v2-v1-v3
]);

const positionBuffer = createVertexBuffer(engine, positions);
const colorBuffer = createVertexBuffer(engine, colors);
const indexBuffer = createIndexBuffer(engine, indices);

let mesh = null;

runRenderLoop(engine, () => {
  if (!isEffectReady(engine, effect)) return;

  if (!mesh) {
    mesh = createMeshVao(engine, [
      { buffer: positionBuffer, computeStride: true, attributes: [{ name: "position", size: 3, divisor: 0 }] },
      { buffer: colorBuffer, computeStride: true, attributes: [{ name: "color", size: 4, divisor: 0 }] },
    ], indexBuffer, effect);
  }

  resizeGLEngine(engine);
  setViewport(engine);
  clearEngine(engine, { color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }, depth: true });

  useEffect(engine, effect);
  drawMesh(engine, mesh);
});
