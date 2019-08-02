let camera = new Hilo3d.PerspectiveCamera({
    aspect: innerWidth / innerHeight,
    far: 1000,
    near: 0.1,
    z: 5
});
let stage = new Hilo3d.Stage({
    container: document.getElementById('container'),
    camera: camera,
    clearColor: new Hilo3d.Color(0.0, 0.0, 0.0),
    width: innerWidth,
    height: innerHeight
});

let material = new Hilo3d.BasicMaterial({
    diffuse: new Hilo3d.LazyTexture({
        src: '../../../assets/textures/earth.jpg'
    })
});

let angle = 0;
let axis = new Hilo3d.Vector3(0, 1, 0).normalize();

let planeGeometry = new Hilo3d.PlaneGeometry();
let boxGeometry = new Hilo3d.BoxGeometry();
boxGeometry.setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]]);
let sphereGeometry = new Hilo3d.SphereGeometry({
    radius: 0.5,
    heightSegments: 24,
    widthSegments: 24,
});

let meshPlane = new Hilo3d.Mesh({
    geometry: planeGeometry,
    material: material,
    x: -1.5,
    onUpdate: function() {
        angle += Hilo3d.math.DEG2RAD;
        this.quaternion.setAxisAngle(axis, angle);
    }
});

let meshCube = new Hilo3d.Mesh({
    geometry: boxGeometry,
    material: material,
    x: 0.0,
    onUpdate: function() {
        this.quaternion.setAxisAngle(axis, angle);
    }
});

let meshSphere = new Hilo3d.Mesh({
    geometry: sphereGeometry,
    material: material,
    x: 1.5,
    onUpdate: function() {
        this.quaternion.setAxisAngle(axis, angle);
    }
});

stage.addChild(meshPlane);
stage.addChild(meshCube);
stage.addChild(meshSphere);

let ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.start(true);
