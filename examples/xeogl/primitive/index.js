var material = new xeogl.PhongMaterial({
    diffuseMap: new xeogl.Texture({
        src: "../../../assets/textures/earth.jpg"
    }),
    backfaces: true
});

var meshPlane = new xeogl.Mesh({
    geometry: new xeogl.PlaneGeometry({
        primitive: "triangles",
        xSize: 1,
        zSize: 1,
        xSegments: 1,
        zSegments: 1
    }),
    material: material,
    position: [-1.5, 0, 0],
    rotation: [90, 0, 0]
});

var meshCube = new xeogl.Mesh({
    geometry: new xeogl.BoxGeometry({
        xSize: 0.5,
        ySize: 0.5,
        zSize: 0.5
    }),
    material: material,
    position: [0, 0, 0]
});

var meshSphere = new xeogl.Mesh({
    geometry: new xeogl.SphereGeometry({
        radius: 0.5,
        heightSegments: 24,
        widthSegments: 24
    }),
    material: material,
    position: [1.5, 0, 0]
});
var scene = xeogl.getDefaultScene();
var camera = scene.camera;
camera.zoom(-5);
scene.on("tick", function () {
    meshPlane.rotateZ(-0.6);
    meshCube.rotateY(0.6);
    meshSphere.rotateY(0.6);
});
