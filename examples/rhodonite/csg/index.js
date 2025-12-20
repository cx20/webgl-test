import Rn from 'rhodonite';
import Module from 'manifold-3d';

const BASE_ASSETS_URL = "https://cx20.github.io/jsdo.it-archives/assets/";
const TEXTURE_URLS = {
  earth:     BASE_ASSETS_URL + "o/p/2/8/op288.jpg",
  mantle:    BASE_ASSETS_URL + "A/r/o/W/AroWN.jpg",
  outerCore: BASE_ASSETS_URL + "c/C/I/q/cCIqn.jpg",
  innerCore: BASE_ASSETS_URL + "g/I/9/t/gI9tJ.png"
};

const LAYERS = [
  { name: 'earth',     diameter: 100, boxSize: 50.0 },
  { name: 'mantle',    diameter: 97,  boxSize: 49.8 },
  { name: 'outerCore', diameter: 80,  boxSize: 49.6 },
  { name: 'innerCore', diameter: 60,  boxSize: null }
];

const SCALE = 0.02;

function computeTriangleNormal(p0, p1, p2) {
  const e1 = [p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]];
  const e2 = [p2[0] - p0[0], p2[1] - p0[1], p2[2] - p0[2]];
  const n = [
    e1[1] * e2[2] - e1[2] * e2[1],
    e1[2] * e2[0] - e1[0] * e2[2],
    e1[0] * e2[1] - e1[1] * e2[0]
  ];
  const len = Math.hypot(...n);
  return len > 0 ? n.map(v => v / len) : [0, 1, 0];
}

function computeSphericalUV(x, y, z) {
  const len = Math.hypot(x, y, z);
  if (len === 0) return [0.5, 0.5];
  const nx = x / len, ny = y / len, nz = z / len;
  const u = 0.5 + Math.atan2(nz, nx) / (2 * Math.PI);
  const v = 0.5 + Math.asin(Math.max(-1, Math.min(1, ny))) / Math.PI;
  return [u, v];
}

function fixSeamUVs(uv0, uv1, uv2) {
  let u0 = uv0[0], u1 = uv1[0], u2 = uv2[0];
  
  if (Math.abs(u0 - u1) > 0.5) {
    if (u0 < u1) u0 += 1.0; else u1 += 1.0;
  }
  if (Math.abs(u1 - u2) > 0.5) {
    if (u1 < u2) u1 += 1.0; else u2 += 1.0;
  }
  if (Math.abs(u0 - u2) > 0.5) {
    if (u0 < u2) u0 += 1.0; else u2 += 1.0;
  }
  
  return [
    [u0, uv0[1]],
    [u1, uv1[1]],
    [u2, uv2[1]]
  ];
}

function manifoldToPrimitive(engine, manifold, material) {
  const mesh = manifold.getMesh();
  const vertProps = mesh.vertProperties;
  const triVerts = mesh.triVerts;
  
  const positions = [];
  const normals = [];
  const texcoords = [];
  
  for (let i = 0; i < triVerts.length; i += 3) {
    const i0 = triVerts[i];
    const i1 = triVerts[i + 1];
    const i2 = triVerts[i + 2];
    
    const p0 = [vertProps[i0 * 3], vertProps[i0 * 3 + 1], vertProps[i0 * 3 + 2]];
    const p1 = [vertProps[i1 * 3], vertProps[i1 * 3 + 1], vertProps[i1 * 3 + 2]];
    const p2 = [vertProps[i2 * 3], vertProps[i2 * 3 + 1], vertProps[i2 * 3 + 2]];
    
    const normal = computeTriangleNormal(p0, p1, p2);
    
    let uv0 = computeSphericalUV(...p0);
    let uv1 = computeSphericalUV(...p1);
    let uv2 = computeSphericalUV(...p2);
    [uv0, uv1, uv2] = fixSeamUVs(uv0, uv1, uv2);
    
    positions.push(...p0, ...p1, ...p2);
    normals.push(...normal, ...normal, ...normal);
    texcoords.push(...uv0, ...uv1, ...uv2);
  }
  
  const posArray = new Float32Array(positions);
  const normArray = new Float32Array(normals);
  const uvArray = new Float32Array(texcoords);
  
  const indices = new Uint32Array(positions.length / 3);
  for (let i = 0; i < indices.length; i++) indices[i] = i;
  
  const primitive = Rn.Primitive.createPrimitive(engine, {
    indices: indices,
    attributeSemantics: [
      Rn.VertexAttribute.Position.XYZ,
      Rn.VertexAttribute.Normal.XYZ,
      Rn.VertexAttribute.Texcoord0.XY
    ],
    attributes: [posArray, normArray, uvArray],
    material: material,
    primitiveMode: Rn.PrimitiveMode.Triangles
  });
  
  return primitive;
}

function createEntityFromManifold(engine, manifold, material) {
  const primitive = manifoldToPrimitive(engine, manifold, material);
  const mesh = new Rn.Mesh(engine);
  mesh.addPrimitive(primitive);
  
  const entity = Rn.createMeshEntity(engine);
  entity.getMesh().setMesh(mesh);
  
  return entity;
}

function createCutSphere(Manifold, diameter, innerDiameter, boxSize) {
  const radius = (diameter / 2) * SCALE;
  
  let shape = Manifold.sphere(radius, 48);
  
  if (innerDiameter != null) {
    const innerRadius = (innerDiameter / 2) * SCALE;
    const innerSphere = Manifold.sphere(innerRadius, 48);
    
    const hollowShape = shape.subtract(innerSphere);
    
    shape.delete();
    innerSphere.delete();
    
    shape = hollowShape;
  }
  
  if (boxSize !== null) {
    const size = boxSize * SCALE;
    const offset = (boxSize / 2) * SCALE;
    const box = Manifold.cube([size, size, size], true)
      .translate([offset, offset, offset]);
    
    const result = shape.subtract(box);
    
    shape.delete();
    box.delete();
    return result;
  }
  
  return shape;
}

const load = async function () {
  const c = document.getElementById('world');

  const engine = await Rn.Engine.init({
    approach: Rn.ProcessApproach.DataTexture,
    canvas: c,
  });

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  function resizeCanvas() {
    engine.resizeCanvas(window.innerWidth, window.innerHeight);
  }

  const sampler = new Rn.Sampler(engine, {
    magFilter: Rn.TextureParameter.Linear,
    minFilter: Rn.TextureParameter.Linear,
    wrapS: Rn.TextureParameter.Repeat,
    wrapT: Rn.TextureParameter.Repeat,
  });
  sampler.create();

  console.log('Loading textures...');
  const textureAssets = await Rn.defaultAssetLoader.load({
    earth:     Rn.Texture.loadFromUrl(engine, TEXTURE_URLS.earth),
    mantle:    Rn.Texture.loadFromUrl(engine, TEXTURE_URLS.mantle),
    outerCore: Rn.Texture.loadFromUrl(engine, TEXTURE_URLS.outerCore),
    innerCore: Rn.Texture.loadFromUrl(engine, TEXTURE_URLS.innerCore)
  });
  console.log('Textures loaded!');

  const materials = {};
  for (const layer of LAYERS) {
    const material = Rn.MaterialHelper.createClassicUberMaterial(engine);
    material.setTextureParameter('diffuseColorTexture', textureAssets[layer.name], sampler);
    materials[layer.name] = material;
  }

  console.log('Initializing Manifold...');
  const wasm = await Module();
  wasm.setup();
  const { Manifold } = wasm;
  console.log('Manifold ready!');

  console.log('Creating CSG layers...');
  const entities = [];
  const manifolds = [];

  for (let i = 0; i < LAYERS.length; i++) {
    const layer = LAYERS[i];
    const nextLayer = LAYERS[i + 1];
    
    console.log(`Creating ${layer.name}...`);
    
    const innerDiameter = nextLayer ? nextLayer.diameter : null;

    const manifold = createCutSphere(Manifold, layer.diameter, innerDiameter, layer.boxSize);
    
    const entity = createEntityFromManifold(engine, manifold, materials[layer.name]);
    entities.push(entity);
    manifolds.push(manifold);
    console.log(`${layer.name} - Triangles: ${manifold.numTri()}`);
  }

  manifolds.forEach(m => m.delete());
  console.log('All layers created!');

  const cameraEntity = Rn.createCameraControllerEntity(engine);
  cameraEntity.localPosition = Rn.Vector3.fromCopyArray([0, 0, 4.0]);
  const cameraComponent = cameraEntity.getCamera();
  cameraComponent.zNear = 0.1;
  cameraComponent.zFar = 1000;
  cameraComponent.setFovyAndChangeFocalLength(45);
  cameraComponent.aspect = window.innerWidth / window.innerHeight;

  const renderPass = new Rn.RenderPass(engine);
  renderPass.cameraComponent = cameraComponent;
  renderPass.toClearColorBuffer = true;
  renderPass.clearColor = Rn.Vector4.fromCopyArray4([0.0, 0.0, 0.02, 1]);
  renderPass.addEntities(entities);

  const expression = new Rn.Expression(engine);
  expression.addRenderPasses([renderPass]);

  const startTime = Date.now();

  const draw = function() {
    const elapsed = (Date.now() - startTime) * 0.0003;

    entities.forEach(entity => {
      entity.localEulerAngles = Rn.Vector3.fromCopyArray([0, elapsed, 0]);
    });

    engine.process([expression]);
    requestAnimationFrame(draw);
  };

  draw();
};

document.body.onload = load;
