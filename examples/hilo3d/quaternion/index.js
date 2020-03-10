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

let ambientLight = new Hilo3d.AmbientLight({
    color: new Hilo3d.Color(1, 1, 1),
    amount: 1.0
}).addTo(stage);

let geometry = new Hilo3d.BoxGeometry();
geometry.setAllRectUV([[0, 1], [1, 1], [1, 0], [0, 0]]);

let mesh1 = new Hilo3d.Mesh({
    x: -0.7,
    scaleX: 0.8,
    scaleY: 0.8,
    scaleZ: 0.8,
    geometry: geometry,
    material: new Hilo3d.BasicMaterial({
        diffuse:new Hilo3d.LazyTexture({
            src:'../../../assets/textures/frog.jpg'
        })
    }),
    onUpdate: function() {
       this.rotationX += 1.0;
       this.rotationY += 1.0;
       this.rotationZ += 1.0;
    }
});
mesh1.addChild(new Hilo3d.AxisHelper());
stage.addChild(mesh1);

let angle = 0;
let mesh2 = new Hilo3d.Mesh({
    x: 0.7,
    scaleX: 0.8,
    scaleY: 0.8,
    scaleZ: 0.8,
    geometry: geometry,
    material: new Hilo3d.BasicMaterial({
        diffuse:new Hilo3d.LazyTexture({
            src:'../../../assets/textures/frog.jpg'
        })
    }),
    onUpdate: function() {
        let axis = new Hilo3d.Vector3(1,1,1).normalize();
        angle += Math.PI / 180;
        let q = new Hilo3d.Quaternion();
        q.setAxisAngle(axis, angle);
        this.quaternion.copy(q);
    }
});
mesh2.addChild(new Hilo3d.AxisHelper());
stage.addChild(mesh2);

let ticker = new Hilo3d.Ticker(60);
ticker.addTick(stage);
ticker.start(true);
