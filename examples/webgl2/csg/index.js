import Module from 'https://esm.run/manifold-3d';

const { mat4, mat3 } = glMatrix;

function createShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(shader));
    return null;
  }
  return shader;
}

function createProgram(gl, vsSource, fsSource) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  return program;
}

function loadTexture(gl, url) {
  return new Promise((resolve) => {
    const texture = gl.createTexture();
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      resolve(texture);
    };
    image.src = url;
  });
}

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
  if (Math.abs(u0 - u1) > 0.5) { if (u0 < u1) u0 += 1.0; else u1 += 1.0; }
  if (Math.abs(u1 - u2) > 0.5) { if (u1 < u2) u1 += 1.0; else u2 += 1.0; }
  if (Math.abs(u0 - u2) > 0.5) { if (u0 < u2) u0 += 1.0; else u2 += 1.0; }
  return [[u0, uv0[1]], [u1, uv1[1]], [u2, uv2[1]]];
}

function computeSmoothNormal(x, y, z) {
  const len = Math.hypot(x, y, z);
  if (len === 0) return [0, 1, 0];
  return [x / len, y / len, z / len];
}

function manifoldToArrays(manifold, needsUV) {
  const mesh = manifold.getMesh();
  const vertProps = mesh.vertProperties;
  const triVerts = mesh.triVerts;
  
  const positions = [], normals = [], texcoords = [];
  
  for (let i = 0; i < triVerts.length; i += 3) {
    const i0 = triVerts[i], i1 = triVerts[i + 1], i2 = triVerts[i + 2];
    const p0 = [vertProps[i0 * 3], vertProps[i0 * 3 + 1], vertProps[i0 * 3 + 2]];
    const p1 = [vertProps[i1 * 3], vertProps[i1 * 3 + 1], vertProps[i1 * 3 + 2]];
    const p2 = [vertProps[i2 * 3], vertProps[i2 * 3 + 1], vertProps[i2 * 3 + 2]];
    
    const n0 = computeSmoothNormal(...p0);
    const n1 = computeSmoothNormal(...p1);
    const n2 = computeSmoothNormal(...p2);
    
    positions.push(...p0, ...p1, ...p2);
    normals.push(...n0, ...n1, ...n2);
    
    if (needsUV) {
      let uv0 = computeSphericalUV(...p0);
      let uv1 = computeSphericalUV(...p1);
      let uv2 = computeSphericalUV(...p2);
      [uv0, uv1, uv2] = fixSeamUVs(uv0, uv1, uv2);
      texcoords.push(...uv0, ...uv1, ...uv2);
    }
  }
  
  const result = {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    vertexCount: positions.length / 3
  };
  
  if (needsUV) {
    result.texcoords = new Float32Array(texcoords);
  }
  
  return result;
}

function createCutSphere(Manifold, diameter, innerDiameter, boxSize, scale) {
  const radius = (diameter / 2) * scale;
  let shape = Manifold.sphere(radius, 48);
  
  if (innerDiameter != null) {
    const innerRadius = (innerDiameter / 2) * scale;
    const innerSphere = Manifold.sphere(innerRadius, 48);
    const hollowShape = shape.subtract(innerSphere);
    shape.delete();
    innerSphere.delete();
    shape = hollowShape;
  }
  
  if (boxSize !== null) {
    const size = boxSize * scale;
    const offset = (boxSize / 2) * scale;
    const box = Manifold.cube([size, size, size], true).translate([offset, offset, offset]);
    const result = shape.subtract(box);
    shape.delete();
    box.delete();
    return result;
  }
  return shape;
}

async function main() {
  const canvas = document.getElementById('c');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const gl = canvas.getContext('webgl2');
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.0, 0.0, 0.02, 1.0);
  
  const textureProgram = createProgram(gl, 
    document.getElementById("vs-texture").textContent,
    document.getElementById("fs-texture").textContent
  );
  const solidProgram = createProgram(gl,
    document.getElementById("vs-solid").textContent,
    document.getElementById("fs-solid").textContent
  );
  
  const texLoc = {
    aPosition: gl.getAttribLocation(textureProgram, 'aPosition'),
    aNormal: gl.getAttribLocation(textureProgram, 'aNormal'),
    aTexCoord: gl.getAttribLocation(textureProgram, 'aTexCoord'),
    uModelViewMatrix: gl.getUniformLocation(textureProgram, 'uModelViewMatrix'),
    uProjectionMatrix: gl.getUniformLocation(textureProgram, 'uProjectionMatrix'),
    uNormalMatrix: gl.getUniformLocation(textureProgram, 'uNormalMatrix'),
    uTexture: gl.getUniformLocation(textureProgram, 'uTexture')
  };
  
  const solidLoc = {
    aPosition: gl.getAttribLocation(solidProgram, 'aPosition'),
    aNormal: gl.getAttribLocation(solidProgram, 'aNormal'),
    uModelViewMatrix: gl.getUniformLocation(solidProgram, 'uModelViewMatrix'),
    uProjectionMatrix: gl.getUniformLocation(solidProgram, 'uProjectionMatrix'),
    uNormalMatrix: gl.getUniformLocation(solidProgram, 'uNormalMatrix'),
    uColor: gl.getUniformLocation(solidProgram, 'uColor')
  };
  
  const BASE_URL = "https://cx20.github.io/jsdo.it-archives/assets/";
  const TEXTURE_URLS = {
    earth: BASE_URL + "o/p/2/8/op288.jpg",
    mantle: BASE_URL + "A/r/o/W/AroWN.jpg",
    outerCore: BASE_URL + "c/C/I/q/cCIqn.jpg"
  };
  
  const TEXTURE_LAYERS = [
    { name: 'earth',     diameter: 100, boxSize: 50.0 },
    { name: 'mantle',    diameter: 97,  boxSize: 49.8 },
    { name: 'outerCore', diameter: 80,  boxSize: 49.6 }
  ];
  
  const SOLID_LAYER = { name: 'innerCore', diameter: 55, boxSize: null, color: [1.0, 1.0, 1.0] };
  
  const SCALE = 0.02;
  
  console.log('Loading textures...');
  const textures = {};
  for (const layer of TEXTURE_LAYERS) {
    textures[layer.name] = await loadTexture(gl, TEXTURE_URLS[layer.name]);
  }
  console.log('Textures loaded!');
  
  console.log('Initializing Manifold...');
  const wasm = await Module();
  wasm.setup();
  const { Manifold } = wasm;
  console.log('Manifold ready!');
  
  console.log('Creating CSG layers...');
  
  const textureLayerData = [];
  for (let i = 0; i < TEXTURE_LAYERS.length; i++) {
    const layer = TEXTURE_LAYERS[i];
    const nextLayer = TEXTURE_LAYERS[i + 1] || SOLID_LAYER;
    const innerDiameter = nextLayer.diameter;
    
    console.log(`Creating ${layer.name}... (diameter: ${layer.diameter}, inner: ${innerDiameter})`);
    const manifold = createCutSphere(Manifold, layer.diameter, innerDiameter, layer.boxSize, SCALE);
    const arrays = manifoldToArrays(manifold, true);
    
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, arrays.positions, gl.STATIC_DRAW);
    
    const normBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, arrays.normals, gl.STATIC_DRAW);
    
    const texBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, arrays.texcoords, gl.STATIC_DRAW);
    
    textureLayerData.push({
      name: layer.name,
      posBuffer,
      normBuffer,
      texBuffer,
      vertexCount: arrays.vertexCount,
      texture: textures[layer.name]
    });
    
    console.log(`${layer.name} - Triangles: ${manifold.numTri()}`);
    manifold.delete();
  }
  
  console.log(`Creating ${SOLID_LAYER.name}... (diameter: ${SOLID_LAYER.diameter})`);
  const innerManifold = createCutSphere(Manifold, SOLID_LAYER.diameter, null, SOLID_LAYER.boxSize, SCALE);
  const innerArrays = manifoldToArrays(innerManifold, false);
  
  const innerPosBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, innerPosBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, innerArrays.positions, gl.STATIC_DRAW);
  
  const innerNormBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, innerNormBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, innerArrays.normals, gl.STATIC_DRAW);
  
  const solidLayerData = {
    name: SOLID_LAYER.name,
    posBuffer: innerPosBuffer,
    normBuffer: innerNormBuffer,
    vertexCount: innerArrays.vertexCount,
    color: SOLID_LAYER.color
  };
  
  console.log(`${SOLID_LAYER.name} - Triangles: ${innerManifold.numTri()}`);
  innerManifold.delete();
  
  console.log('All layers created!');
  
  const projMatrix = mat4.create();
  const viewMatrix = mat4.create();
  const modelViewMatrix = mat4.create();
  const normalMatrix = mat3.create();
  
  mat4.perspective(projMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 1000);
  mat4.lookAt(viewMatrix, [0, 0, 4], [0, 0, 0], [0, 1, 0]);
  
  let angle = 0;
  
  function render() {
    angle += 0.005;
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    mat4.rotateY(modelViewMatrix, viewMatrix, angle);
    mat3.normalFromMat4(normalMatrix, modelViewMatrix);
    
    gl.useProgram(textureProgram);
    gl.uniformMatrix4fv(texLoc.uProjectionMatrix, false, projMatrix);
    gl.uniformMatrix4fv(texLoc.uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix3fv(texLoc.uNormalMatrix, false, normalMatrix);
    
    for (const layer of textureLayerData) {
      gl.bindBuffer(gl.ARRAY_BUFFER, layer.posBuffer);
      gl.enableVertexAttribArray(texLoc.aPosition);
      gl.vertexAttribPointer(texLoc.aPosition, 3, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, layer.normBuffer);
      gl.enableVertexAttribArray(texLoc.aNormal);
      gl.vertexAttribPointer(texLoc.aNormal, 3, gl.FLOAT, false, 0, 0);
      
      gl.bindBuffer(gl.ARRAY_BUFFER, layer.texBuffer);
      gl.enableVertexAttribArray(texLoc.aTexCoord);
      gl.vertexAttribPointer(texLoc.aTexCoord, 2, gl.FLOAT, false, 0, 0);
      
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, layer.texture);
      gl.uniform1i(texLoc.uTexture, 0);
      
      gl.drawArrays(gl.TRIANGLES, 0, layer.vertexCount);
    }
    
    gl.disableVertexAttribArray(texLoc.aTexCoord);
    
    gl.useProgram(solidProgram);
    gl.uniformMatrix4fv(solidLoc.uProjectionMatrix, false, projMatrix);
    gl.uniformMatrix4fv(solidLoc.uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix3fv(solidLoc.uNormalMatrix, false, normalMatrix);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, solidLayerData.posBuffer);
    gl.enableVertexAttribArray(solidLoc.aPosition);
    gl.vertexAttribPointer(solidLoc.aPosition, 3, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, solidLayerData.normBuffer);
    gl.enableVertexAttribArray(solidLoc.aNormal);
    gl.vertexAttribPointer(solidLoc.aNormal, 3, gl.FLOAT, false, 0, 0);
    
    gl.uniform3fv(solidLoc.uColor, solidLayerData.color);
    
    gl.drawArrays(gl.TRIANGLES, 0, solidLayerData.vertexCount);
    
    requestAnimationFrame(render);
  }
  
  render();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
    mat4.perspective(projMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 1000);
  });
}

main();
