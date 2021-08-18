let modelInfoSet = [
{
    name: "CesiumMilkTruck",
    scale: 0.4,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, -2],
    url: "https://cx20.github.io/gltf-test/sampleModels/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf"
}, {
    name: "Fox",
    scale: 0.05,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, 0],
    url: "https://cx20.github.io/gltf-test/sampleModels/Fox/glTF/Fox.gltf"
}, {
    name: "Rex",
    scale: 1.0,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, 3],
    //url: "https://rawcdn.githack.com/BabylonJS/Exporters/9bc140006be149687be045f60b4a25cdb45ce4fc/Maya/Samples/glTF 2.0/T-Rex/trex_running.gltf" // scale:0.01
    url: "https://rawcdn.githack.com/BabylonJS/Exporters/d66db9a7042fef66acb62e1b8770739463b0b567/Maya/Samples/glTF%202.0/T-Rex/trex.gltf" // scale:1.0
}];

let decoderModule;

var getAbsolutePathFromRelativePath = function(href) {
    var link = document.createElement("a");
    link.href = href;
    return link.href;
}

var Viewer = function (canvas) {

    var self = this;

    // create the application
    var app = new pc.Application(canvas, {
        mouse: new pc.Mouse(canvas),
        touch: new pc.TouchDevice(canvas)
    });
    
    var getCanvasSize = function () {
        return {
            width: window.innerWidth,
            height: window.innerHeight
        };
    };

    app.graphicsDevice.maxPixelRatio = window.devicePixelRatio;

    // Set the canvas to fill the window and automatically change resolution to be the same as the canvas size
    var canvasSize = getCanvasSize();
    app.setCanvasFillMode(pc.FILLMODE_NONE, canvasSize.width, canvasSize.height);
    app.setCanvasResolution(pc.RESOLUTION_AUTO);
    window.addEventListener("resize", function () {
        var canvasSize = getCanvasSize();
        app.resizeCanvas(canvasSize.width, canvasSize.height);
    });

    // set a prefiltered cubemap as the skybox
    // Please refer to the following when setting a 6-sided texture different from the prefiltered texture
    // 
    // How to dynamically configure Skybox with JavaScript?
    // https://forum.playcanvas.com/t/how-to-dynamically-configure-skybox-with-javascript/12980
    // 
    // 1. rgbm specification of cubemap is changed to default
    // 2. After constructing the cubemap asset, do cubemapAsset.loadFaces = true; then kick off asset load.
    // 3. Leave resource[0] as `default` and set the rest (resource[1]...resource[6]) to `rgbm`.
    // 
    let cubemapAsset = new pc.Asset('papermill', 'cubemap', {
        url: "https://cx20.github.io/gltf-test/textures/dds/papermill.dds"
    }, {
        "textures": [
/*
            "https://cx20.github.io/gltf-test/textures/papermill/specular/specular_right_0.jpg",
            "https://cx20.github.io/gltf-test/textures/papermill/specular/specular_left_0.jpg",
            "https://cx20.github.io/gltf-test/textures/papermill/specular/specular_top_0.jpg",
            "https://cx20.github.io/gltf-test/textures/papermill/specular/specular_bottom_0.jpg",
            "https://cx20.github.io/gltf-test/textures/papermill/specular/specular_front_0.jpg",
            "https://cx20.github.io/gltf-test/textures/papermill/specular/specular_back_0.jpg",
*/
/*
            "https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/px.jpg",
            "https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/nx.jpg",
            "https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/py.jpg",
            "https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/ny.jpg",
            "https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/pz.jpg",
            "https://rawcdn.githack.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/nz.jpg",
*/
            "https://cx20.github.io/gltf-test/textures/cube/skybox/px.jpg",
            "https://cx20.github.io/gltf-test/textures/cube/skybox/nx.jpg",
            "https://cx20.github.io/gltf-test/textures/cube/skybox/py.jpg",
            "https://cx20.github.io/gltf-test/textures/cube/skybox/ny.jpg",
            "https://cx20.github.io/gltf-test/textures/cube/skybox/pz.jpg",
            "https://cx20.github.io/gltf-test/textures/cube/skybox/nz.jpg",
        ],
        "magFilter": 1,
        "minFilter": 5,
        "anisotropy": 1,
        "name": "Papermill",
        // 1. rgbm specification of cubemap is changed to default
        // https://forum.playcanvas.com/t/how-to-dynamically-configure-skybox-with-javascript/12980/8
        //"rgbm": true,
        "prefiltered": "papermill.dds"
    });
    cubemapAsset.ready(function () {
        app.scene.gammaCorrection = pc.GAMMA_SRGB;
        app.scene.toneMapping = pc.TONEMAP_ACES;
        app.scene.skyboxMip = 0;
        // 3. Leave resource[0] as `default` and set the rest (resource[1]...resource[6]) to `rgbm`.
        // https://forum.playcanvas.com/t/how-to-dynamically-configure-skybox-with-javascript/12980/10
        for (let i = 1; i < cubemapAsset.resources.length; i++ ) {
            cubemapAsset.resources[i].type = "rgbm";
        }
        app.scene.setSkybox(cubemapAsset.resources);
    });
    app.assets.add(cubemapAsset);
    // 2. After constructing the cubemap asset, do cubemapAsset.loadFaces = true; then kick off asset load.
    // https://forum.playcanvas.com/t/how-to-dynamically-configure-skybox-with-javascript/12980/6
    cubemapAsset.loadFaces = true;
    app.assets.load(cubemapAsset);

    // create the orbit camera
    var camera = new pc.Entity("Camera");
    camera.addComponent("camera", {
        fov: 60,
        clearColor: new pc.Color(0.4, 0.45, 0.5)
    });

    // load orbit script
    app.assets.loadFromUrl(
        "https://cx20.github.io/gltf-test/libs/playcanvas/v1.46.1/orbit-camera.js",
        "script",
        function (err, asset) {
            // setup orbit script component
            camera.addComponent("script");
            camera.script.create("orbitCamera", {
                attributes: {
                    inertiaFactor: 0.1
                }
            });
            camera.script.create("orbitCameraInputMouse");
            camera.script.create("orbitCameraInputTouch");
            app.root.addChild(camera);

            for (let i = 0; i < modelInfoSet.length; i++) {
                let m = modelInfoSet[i];
                let url = m.url;
                var filename = url.split('/').pop();
                self.load(url, filename);
            }

            // start the application
            app.start();
        });

    // create the light
    var light = new pc.Entity();
    light.addComponent("light", {
        type: "directional",
        color: new pc.Color(1, 1, 1),
        castShadows: true,
        intensity: 2,
        shadowBias: 0.2,
        shadowDistance: 5,
        normalOffsetBias: 0.05,
        shadowResolution: 2048
    });
    light.setLocalEulerAngles(45, 30, 0);
    app.root.addChild(light);

    let material = createMaterial();

    let ground1 = new pc.Entity();
    ground1.addComponent("model", {type: 'plane'});
    ground1.model.material = material;
    ground1.setLocalPosition(-49.5, 0.0, -1.6);
    ground1.rotate(0, 0, 0);
    var scale = ground1.getLocalScale();
    scale.x = 100.0;
    scale.y = 0.1;
    scale.z = 0.1;
    ground1.setLocalScale(scale);
    app.root.addChild(ground1);

    let ground2 = new pc.Entity();
    ground2.addComponent("model", {type: 'plane'});
    ground2.model.material = material;
    ground2.setLocalPosition(-49.5, 0.0, -2.35);
    ground2.rotate(0, 0, 0);
    var scale = ground2.getLocalScale();
    scale.x = 100.0;
    scale.y = 0.1;
    scale.z = 0.1;
    ground2.setLocalScale(scale);
    app.root.addChild(ground2);

    // disable autorender
    app.autoRender = false;
    self.prevCameraMat = new pc.Mat4();
    app.on('update', self.update.bind(self));

    // store things
    this.app = app;
    this.camera = camera;
    this.light = light;
    this.entity = null;

};

Object.assign(Viewer.prototype, {
    // reset the viewer, unloading resources
    resetScene: function () {
        var app = this.app;

        var entity = this.entity;
        if (entity) {
            app.root.removeChild(entity);
            entity.destroy();
            this.entity = null;
        }

        if (this.asset) {
            app.assets.remove(this.asset);
            this.asset.unload();
            this.asset = null;
        }

        this.animationMap = { };
        //onAnimationsLoaded([]);
    },

    // move the camera to view the loaded object
    focusCamera: function () {
        var entity = this.entity;
        if (entity) {
            var camera = this.camera;

            var orbitCamera = camera.script.orbitCamera;
            orbitCamera.focus(entity);

            var distance = orbitCamera.distance;
            camera.camera.nearClip = distance / 10;
            camera.camera.farClip = distance * 10;

            var light = this.light;
            light.light.shadowDistance = distance * 2;
        }
    },

    // load model at the url
    load: function(url, filename) {
        this.app.assets.loadFromUrlAndFilename(url, filename, "container", this._onLoaded.bind(this));
    },

    // play the animation
    play: function (animationName) {
        if (this.entity && this.entity.animation) {
            if (animationName) {
                this.entity.animation.play(this.animationMap[animationName], 1);
            } else {
                this.entity.animation.playing = true;
            }
        }
    },

    // stop playing animations
    stop: function () {
        if (this.entity && this.entity.animation) {
            this.entity.animation.playing = false;
        }
    },

    setSpeed: function (speed) {
        if (this.entity && this.entity.animation) {
            var entity = this.entity;
            if (entity) {
                entity.animation.speed = speed;
            }
        }
    },
    update: function () {
        // if the camera has moved since the last render
        var cameraWorldTransform = this.camera.getWorldTransform();
        if (!this.prevCameraMat.equals(cameraWorldTransform)) {
            this.prevCameraMat.copy(cameraWorldTransform);
            this.app.renderNextFrame = true;
        }
        // or an animation is loaded and we're animating
        if (this.entity && this.entity.animation && this.entity.animation.playing) {
            this.app.renderNextFrame = true;
        }
    },

    _onLoaded: function (err, asset) {
        if (!err) {

            //this.resetScene();

            var resource = asset.resource;

            // create entity and add model
            var entity = new pc.Entity();
            entity.addComponent("model", {
                type: "asset",
                asset: resource.model,
                castShadows: true
            });
            	
            if (resource.model.name == "CesiumMilkTruck.gltf/model/0") {
                let m = modelInfoSet[0];
                applyModelInfoToEntity(m, entity);
            } else if (resource.model.name == "Fox.gltf/model/0") {
                let m = modelInfoSet[1];
                applyModelInfoToEntity(m, entity);
            } else if (resource.model.name == "trex_running.gltf/model/0") {
                let m = modelInfoSet[2];
                applyModelInfoToEntity(m, entity);
            }
            function applyModelInfoToEntity(m, entity) { 
                var s = entity.getLocalScale();
                var r = entity.getLocalRotation();
                var p = entity.getLocalPosition();
                s.x = s.x * m.scale;
                s.y = s.y * m.scale;
                s.z = s.z * m.scale;
                r.setFromEulerAngles(
                    m.rotation[0] / (2 * Math.PI) * 360,
                    m.rotation[1] / (2 * Math.PI) * 360,
                    m.rotation[2] / (2 * Math.PI) * 360);
                p.x = p.x + m.position[0];
                p.y = p.y + m.position[1];
                p.z = p.z + m.position[2];
                entity.setLocalScale(s);
                entity.setLocalRotation(r);
                entity.setLocalPosition(p);
            }

            // create animations
            if (resource.animations && resource.animations.length > 0) {
                entity.addComponent('animation', {
                    assets: resource.animations.map(function (asset) {
                        return asset.id;
                    }),
                    speed: 1
                });

                var animationMap = {};
                for (var i = 0; i < resource.animations.length; ++i) {
                    var animAsset = resource.animations[i];
                    animationMap[animAsset.resource.name] = animAsset.name;
                }

                this.animationMap = animationMap;
                //onAnimationsLoaded(Object.keys(this.animationMap));
            }

            this.app.root.addChild(entity);
            this.entity = entity;
            this.asset = asset;

            if (resource.model.name == "Fox.gltf/model/0") {
                this.focusCamera();
                this.play("Run");
            }
        }
    }
});

function createMaterial() {
    let material = new pc.scene.PhongMaterial();
    material.diffuseMapTint = true;
    material.update()
    return material;
}

var viewer;

function main() {
    viewer = new Viewer(document.getElementById("application"));
}

main();
