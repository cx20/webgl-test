import * as pc from 'playcanvas';

let canvas = document.getElementById('c');
let app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
app.start();
app.on("update", function (dt) {
});

app.scene.ambientLight = new pc.Color(1, 1, 1);

let camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(1, 1, 1),
    farClip: 1000,
    fov: 45
});

camera.translate(0,0,2.5);
camera.lookAt(0,0,0);
app.root.addChild(camera);

let Cube = pc.createScript('cube');
Cube.prototype.initialize = function () {
    const device = this.app.graphicsDevice;

	const mesh = new pc.Mesh(device);
    
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
    const positions = new Float32Array([
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
    ]);

    const textureCoords = new Float32Array([
        // Front face
        0.0, 0.0, 
		1.0, 0.0, 
		1.0, 1.0, 
		0.0, 1.0,
        // Back face
        1.0, 0.0, 
		1.0, 1.0, 
		0.0, 1.0, 
		0.0, 0.0,
        // Top face
        0.0, 1.0, 
		0.0, 0.0, 
		1.0, 0.0, 
		1.0, 1.0,
        // Bottom face
        1.0, 1.0, 
		0.0, 1.0, 
		0.0, 0.0, 
		1.0, 0.0,
        // Right face
        1.0, 0.0, 
		1.0, 1.0, 
		0.0, 1.0, 
		0.0, 0.0,
        // Left face
        0.0, 0.0, 
		1.0, 0.0, 
		1.0, 1.0, 
		0.0, 1.0
    ]);

    const indices = new Uint16Array([
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ]);

    mesh.setPositions(positions);
    mesh.setUvs(0, textureCoords);
    mesh.setIndices(indices);
    mesh.update();

    const material = new pc.StandardMaterial();
    material.diffuseMap = getTexture();
    material.cull = pc.CULLFACE_NONE;
    material.update();

    function getTexture() {
        const texture = new pc.Texture(device, { width: 256, height: 256 });
        
        const img = new Image();
        img.onload = function () {
            texture.minFilter = pc.FILTER_LINEAR;
            texture.magFilter = pc.FILTER_LINEAR;
            texture.addressU = pc.ADDRESS_CLAMP_TO_EDGE;
            texture.addressV = pc.ADDRESS_CLAMP_TO_EDGE;
            texture.setSource(img);
        };
        img.src = "../../../assets/textures/frog.jpg";  // 256x256
        return texture;
    };

    const node = new pc.GraphNode();
    const instance = new pc.MeshInstance(mesh, material);
    instance.node = node;

    const model = new pc.Model();
    model.graph = node;
    model.meshInstances = [instance];

    this.entity.addComponent("model");
    this.entity.model.model = model;
};

Cube.prototype.update = function (deltaTime) {
    this.entity.rotate(deltaTime * 50, deltaTime * 50, deltaTime * 50);
};

let cube = new pc.Entity();
app.root.addChild(cube);
cube.addComponent('script');
cube.script.create('cube');

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
