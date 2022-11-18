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
}
];

//const env = 'syferfontein_18d_clear_2k';
const env = 'papermill';
const ibl_url = `https://cx20.github.io/gltf-test/textures/ktx/${env}/${env}_ibl.ktx`;
const sky_url = `https://cx20.github.io/gltf-test/textures/ktx/${env}/${env}_skybox.ktx`;

function getPathNameFromUrl(path) {
    let result = path.replace(/\\/g, '/').replace(/\/[^/]*$/, '');
    if (result.match(/^[^/]*\.[^/\.]*$/)) {
        result = '';
    }
    return result;
}

function convertRelativeToAbsUrl(relativePath) {
    let anchor = document.createElement("a");
    anchor.href = relativePath;
    return anchor.href;
}

var urls = [modelInfoSet[0].url, modelInfoSet[1].url, modelInfoSet[2].url, ibl_url, sky_url];
Filament.init(urls, () => {
    window.gltfio = Filament.gltfio;
    window.Fov = Filament.Camera$Fov;
    window.LightType = Filament.LightManager$Type;
    window.app = new App(document.getElementsByTagName('canvas')[0]);
});

class App {
    constructor(canvas) {
        this.canvas = canvas;
        const engine = this.engine = Filament.Engine.create(this.canvas);
        const scene = this.scene = engine.createScene();
        //this.trackball = new Trackball(canvas, {startSpin: 0.006});
        this.trackball = new Trackball(canvas, {startSpin: 0.000});
        const sunlight = Filament.EntityManager.get().create();
        Filament.LightManager.Builder(LightType.SUN)
            .color([0.98, 0.92, 0.89])
            .intensity(50000.0)
            .direction([0.6, -1.0, -0.8])
            .sunAngularRadius(1.9)
            .sunHaloSize(10.0)
            .sunHaloFalloff(80.0)
            .build(engine, sunlight);
        this.scene.addEntity(sunlight);

        const indirectLight = this.ibl = engine.createIblFromKtx1(ibl_url);
        this.scene.setIndirectLight(indirectLight);
        indirectLight.setIntensity(50000);

        const skybox = engine.createSkyFromKtx1(sky_url);
        this.scene.setSkybox(skybox);
        this.assets = [];
        this.animators = [];
        this.animationStartTimes = [];

        for (let i = 0; i < modelInfoSet.length; i++) {
            let m = modelInfoSet[i];
            let url = m.url;
            let basePath = convertRelativeToAbsUrl(getPathNameFromUrl(url)) + "/";

            const loader = engine.createAssetLoader();
            this.assets.push( loader.createAsset(url) );
            const asset = this.assets[i];
            this.instance = asset.getInstance();
            const instance = this.instance;
            const messages = document.getElementById('messages');

            // Crudely indicate progress by printing the URI of each resource as it is loaded.
            const onFetched = (uri) => messages.innerText += `Downloaded ${uri}\n`;
            const onDone = () => {
                // Destroy the asset loader.
                loader.delete();
                const entities = asset.getEntities();
                scene.addEntities(entities);
                //messages.remove();
                this.animators.push( instance.getAnimator() );
                this.animationStartTimes.push( Date.now() );
            };
            asset.loadResources(onDone, onFetched, basePath);
        }

        this.swapChain = engine.createSwapChain();
        this.renderer = engine.createRenderer();
        this.camera = engine.createCamera(Filament.EntityManager.get().create());
        this.view = engine.createView();
        this.view.setCamera(this.camera);
        this.view.setScene(this.scene);
        this.renderer.setClearOptions({clearColor: [0.6, 0.6, 0.6, 1.0], clear: true}); // Clearing process suppresses glitching issues on certain GPUs
        this.resize();
        this.render = this.render.bind(this);
        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        window.requestAnimationFrame(this.render);
    }

    render() {
        for (let i = 0; i < modelInfoSet.length; i++) {
            let model = modelInfoSet[i];
            let scale = model.scale;

            const tcm = this.engine.getTransformManager();
            const inst = tcm.getInstance(this.assets[i].getRoot());
            let m = mat4.create();
            let s = vec3.create();
            let t = vec3.create();
            
            vec3.set(t, model.position[0], model.position[1] - 2, model.position[2]);
            mat4.translate(m, m, t);
            
            vec3.set(s, scale, scale, scale);
            mat4.scale(m, m, s);

            mat4.rotateY(m, m, model.rotation[1]);

            tcm.setTransform(inst, m);
            inst.delete();

            if (this.animators[i]) {
                const ms = Date.now() - this.animationStartTimes[i];
                for (let j = 0; j < this.assets[i].getInstance().getAnimator().getAnimationCount(); j++ ) {
                    //this.animators[i].applyAnimation(j, (ms / 1000) % 1.0); // TODO: not animated correctly
                    this.animators[i].applyAnimation(j, ms / 1000);
                    this.animators[i].updateBoneMatrices();
                }
            }
        }
        const eye = [0, 0, 20];
        const center = [0, 0, 0];
        const up = [0, 1, 0];
        const radians = - Date.now() / 2000;
        vec3.rotateY(eye, eye, center, radians);
        vec3.transformMat4(eye, eye, this.trackball.getMatrix());
        this.camera.lookAt(eye, center, up);
        this.renderer.render(this.swapChain, this.view);
        window.requestAnimationFrame(this.render);
    }

    resize() {
        const dpr = window.devicePixelRatio;
        const width = this.canvas.width = window.innerWidth * dpr;
        const height = this.canvas.height = window.innerHeight * dpr;
        this.view.setViewport([0, 0, width, height]);
        const eye = [0, 0, 10];
        const center = [0, 0, 0];
        const up = [0, 1, 0];
        this.camera.lookAt(eye, center, up);
        const aspect = width / height;
        const fov = aspect < 1 ? Fov.HORIZONTAL : Fov.VERTICAL;
        this.camera.setProjectionFov(30, aspect, 0.01, 10000.0, fov);
    }
}
