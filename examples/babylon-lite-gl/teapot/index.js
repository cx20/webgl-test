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
in vec3 normal;
in vec2 uv;
uniform mat4 worldViewProjection;
uniform mat4 world;
out vec3 vNormal;
out vec2 vTextureCoord;

void main() {
    vNormal = mat3(world) * normal;
    vTextureCoord = uv;
    gl_Position = worldViewProjection * vec4(position, 1.0);
}`;

const fragmentSource = `#version 300 es
precision highp float;
uniform sampler2D texture_;
in vec3 vNormal;
in vec2 vTextureCoord;
out vec4 glFragColor;

void main() {
    vec3 lightDir = normalize(vec3(1.0, 0.0, 1.0));
    float diffuse = max(dot(normalize(vNormal), lightDir), 0.0);
    float lighting = 0.3 + 0.7 * diffuse;
    vec4 baseColor = texture(texture_, vTextureCoord);
    glFragColor = vec4(baseColor.rgb * lighting, baseColor.a);
}`;

const effect = createEffect(engine, {
  name: "teapot",
  vertexSource,
  fragmentSource,
  attributeNames: ["position", "normal", "uv"],
  uniformNames: ["worldViewProjection", "world"],
  samplerNames: ["texture_"],
});

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
// The teapot UVs exceed the 0..1 range to tile the texture, so REPEAT wrapping is required.
const gl = engine.gl;
const texture = loadTexture2D(engine, "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg", {
  invertY: true,
  wrapS: gl.REPEAT,
  wrapT: gl.REPEAT,
});

const projection = mat4.create();
const view = mat4.create();
const world = mat4.create();
const worldViewProjection = mat4.create();

mat4.lookAt(view, [0, 0, 50], [0, 0, 0], [0, 1, 0]);

let angle = 0;
let mesh = null;
let indexCount = 0;

fetch("../../../assets/json/teapot.json")
  .then((response) => response.json())
  .then((data) => {
    const positionBuffer = createVertexBuffer(engine, new Float32Array(data.vertexPositions));
    const normalBuffer = createVertexBuffer(engine, new Float32Array(data.vertexNormals));
    const uvBuffer = createVertexBuffer(engine, new Float32Array(data.vertexTextureCoords));
    const indexBuffer = createIndexBuffer(engine, new Uint16Array(data.indices));
    indexCount = data.indices.length;

    const build = () => {
      if (!isEffectReady(engine, effect)) {
        requestAnimationFrame(build);
        return;
      }
      mesh = createMeshVao(engine, [
        { buffer: positionBuffer, computeStride: true, attributes: [{ name: "position", size: 3, divisor: 0 }] },
        { buffer: normalBuffer, computeStride: true, attributes: [{ name: "normal", size: 3, divisor: 0 }] },
        { buffer: uvBuffer, computeStride: true, attributes: [{ name: "uv", size: 2, divisor: 0 }] },
      ], indexBuffer, effect);
    };
    build();
  });

runRenderLoop(engine, () => {
  resizeGLEngine(engine);
  setViewport(engine);
  clearEngine(engine, { color: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 }, depth: true });

  if (!mesh || !isEffectReady(engine, effect)) return;

  const aspect = canvas.width / canvas.height;
  mat4.perspective(projection, 0.8, aspect, 1.0, 1000.0);

  angle -= Math.PI / 180.0;
  mat4.identity(world);
  mat4.rotateY(world, world, angle);

  mat4.multiply(worldViewProjection, view, world);
  mat4.multiply(worldViewProjection, projection, worldViewProjection);

  useEffect(engine, effect);
  setEffectMatrix(engine, effect, "worldViewProjection", worldViewProjection);
  setEffectMatrix(engine, effect, "world", world);
  setEffectTexture(engine, effect, "texture_", texture);
  drawMesh(engine, mesh);
});
