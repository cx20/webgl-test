let canvas = document.getElementById('c');
let app = new pc.Application(canvas, {
    mouse: new pc.Mouse(document.body),
    touch: new pc.TouchDevice(document.body)
});
app.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
app.setCanvasResolution(pc.RESOLUTION_AUTO);
app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
app.start();

app.scene.ambientLight = new pc.Color(1, 1, 1);

let camera = new pc.Entity();
camera.addComponent('camera', {
    clearColor: new pc.Color(0, 0, 0),
    farClip: 1000,
    fov: 45
});

camera.translate(0,0,5);
camera.lookAt(0,0,0);
app.root.addChild(camera);

let material = createMaterial();

// plane
let meshPlane = new pc.Entity();
meshPlane.addComponent("model", {type: 'plane'});
meshPlane.model.material = material;
meshPlane.setLocalPosition(-1.5, 0.0, 0.0);
meshPlane.rotate(90, 0, 0);
app.root.addChild(meshPlane);

// cube
let meshCube = new pc.Entity();
meshCube.addComponent("model", {type: 'box'});
meshCube.model.material = material;
meshCube.setLocalPosition(0.0, 0.0, 0.0);
app.root.addChild(meshCube);

// sphere
let meshSphere = new pc.Entity();
meshSphere.addComponent("model", {type: 'sphere'});
meshSphere.model.material = material;
meshSphere.setLocalPosition(1.5, 0.0, 0.0);
app.root.addChild(meshSphere);

app.on("update", function (dt) {
    meshPlane.rotate(0, dt * 50, 0);
    meshCube.rotate(0, dt * 50, 0);
    meshSphere.rotate(0, dt * 50, 0);
});

function createMaterial() {
    let material = new pc.scene.PhongMaterial();
    material.diffuseMapTint = true;
    material.diffuseMap = getTexture("../../../assets/textures/earth.jpg");
    material.update()
    return material;
}

function getTexture(imageFile) {
    let texture = new pc.gfx.Texture(app.graphicsDevice);
    let img = new Image();
    img.onload = function() {
        texture.minFilter = pc.gfx.FILTER_LINEAR;
        texture.magFilter = pc.gfx.FILTER_LINEAR;
        texture.addressU = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
        texture.addressV = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
        texture.setSource(img);
    };
    img.src = imageFile;
    return texture;
}

window.addEventListener("resize", function () {
    app.resizeCanvas(canvas.width, canvas.height);
});
