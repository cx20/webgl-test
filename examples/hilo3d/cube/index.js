let camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 100,
    near: 0.1,
    z: 3
});
let stage = new Hilo3d.Stage({
    container: document.getElementById('container'),
    camera: camera,
    clearColor: new Hilo3d.Color(1.0, 1.0, 1.0),
    width: innerWidth,
    height: innerHeight
});

// Cube data
//             1.0 y 
//              ^  -1.0 
//              | / z
//              |/       x
// -1.0 -----------------> +1.0
//            / |
//      +1.0 /  |
//           -1.0
// 
//         [7]------[6]
//        / |      / |
//      [3]------[2] |
//       |  |     |  |
//       | [4]----|-[5]
//       |/       |/
//      [0]------[1]
//
let positions = [
    // Front face
    -0.5, -0.5,  0.5, // v0
     0.5, -0.5,  0.5, // v1
     0.5,  0.5,  0.5, // v2
    -0.5,  0.5,  0.5, // v3
    // Back face
    -0.5, -0.5, -0.5, // v4
     0.5, -0.5, -0.5, // v5
     0.5,  0.5, -0.5, // v6
    -0.5,  0.5, -0.5, // v7
    // Top face
     0.5,  0.5,  0.5, // v2
    -0.5,  0.5,  0.5, // v3
    -0.5,  0.5, -0.5, // v7
     0.5,  0.5, -0.5, // v6
    // Bottom face
    -0.5, -0.5,  0.5, // v0
     0.5, -0.5,  0.5, // v1
     0.5, -0.5, -0.5, // v5
    -0.5, -0.5, -0.5, // v4
    // Right face
     0.5, -0.5,  0.5, // v1
     0.5,  0.5,  0.5, // v2
     0.5,  0.5, -0.5, // v6
     0.5, -0.5, -0.5, // v5
    // Left face
    -0.5, -0.5,  0.5, // v0
    -0.5,  0.5,  0.5, // v3
    -0.5,  0.5, -0.5, // v7
    -0.5, -0.5, -0.5  // v4
];
let colors = [
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 0.0, 0.0, 1.0, // Front face
    1.0, 1.0, 0.0, 1.0, // Back face
    1.0, 1.0, 0.0, 1.0, // Back face
    1.0, 1.0, 0.0, 1.0, // Back face
    1.0, 1.0, 0.0, 1.0, // Back face
    0.0, 1.0, 0.0, 1.0, // Top face
    0.0, 1.0, 0.0, 1.0, // Top face
    0.0, 1.0, 0.0, 1.0, // Top face
    0.0, 1.0, 0.0, 1.0, // Top face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.5, 0.5, 1.0, // Bottom face
    1.0, 0.0, 1.0, 1.0, // Right face
    1.0, 0.0, 1.0, 1.0, // Right face
    1.0, 0.0, 1.0, 1.0, // Right face
    1.0, 0.0, 1.0, 1.0, // Right face
    0.0, 0.0, 1.0, 1.0, // Left face
    0.0, 0.0, 1.0, 1.0, // Left face
    0.0, 0.0, 1.0, 1.0, // Left face
    0.0, 0.0, 1.0, 1.0  // Left face
];
let indices = [
     0,  1,  2,    0,  2 , 3,  // Front face
     4,  5,  6,    4,  6 , 7,  // Back face
     8,  9, 10,    8, 10, 11,  // Top face
    12, 13, 14,   12, 14, 15,  // Bottom face
    16, 17, 18,   16, 18, 19,  // Right face
    20, 21, 22,   20, 22, 23   // Left face
];

let geometry = new Hilo3d.Geometry({
    vertices: new Hilo3d.GeometryData(new Float32Array(positions), 3),
    colors: new Hilo3d.GeometryData(new Float32Array(colors), 4),
    indices: new Hilo3d.GeometryData(new Uint16Array(indices), 1)
});

let mesh = new Hilo3d.Mesh({
    rotationX: 0,
    rotationY: 0,
    rotationZ: 0,
    geometry: geometry,
    material: new Hilo3d.ShaderMaterial({
        cullFace: false,
        uniforms:{
            u_modelViewProjectionMatrix: 'MODELVIEWPROJECTION'
        },
        attributes:{
            a_position: 'POSITION',
            a_color: 'COLOR_0'
        },
        fs: document.getElementById('fs').textContent,
        vs: document.getElementById('vs').textContent
    }),
    onUpdate: function() {
       this.rotationX += 0.5;
       this.rotationY += 0.5;
       this.rotationZ += 0.5;
    }
});

stage.addChild(mesh);

let ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.start(true);
