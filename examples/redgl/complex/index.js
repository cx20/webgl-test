let modelInfoSet = [
{
    name: "CesiumMilkTruck",
    scale: 0.4,
    rotation: [0, - Math.PI / 2, 0],
    position: [0, 0, -2],
    url: "https://cx20.github.io/gltf-test/sampleModels/CesiumMilkTruck/glTF/CesiumMilkTruck.gltf"
}, {
    name: "Fox",
    scale: 0.05,
    rotation: [0, - Math.PI / 2, 0],
    position: [0, 0, 0],
    url: "https://cx20.github.io/gltf-test/sampleModels/Fox/glTF/Fox.gltf"
}, {
    name: "Rex",
    scale: 1.0,
    rotation: [0, - Math.PI / 2, 0],
    position: [0, 0, 3],
    //url: "https://raw.githubusercontent.com/BabylonJS/Exporters/9bc140006be149687be045f60b4a25cdb45ce4fc/Maya/Samples/glTF 2.0/T-Rex/trex_running.gltf" // scale:0.01
    url: "https://raw.githubusercontent.com/BabylonJS/Exporters/d66db9a7042fef66acb62e1b8770739463b0b567/Maya/Samples/glTF%202.0/T-Rex/trex.gltf" // scale:1.0
}];

let canvas;
canvas = document.getElementById('canvas');
document.body.appendChild(canvas);
RedGL(canvas, function (v) {
    if (v) {
        let tWorld, tView, tScene, tController, tRenderer;
        this['world'] = tWorld = RedWorld();
        tScene = RedScene(this);
        tController = RedObitController(this);
        tController.pan = 30;
        tController.tilt = -30;
        tController.distance = 10;
        tRenderer = RedRenderer();
        tView = RedView(this, tScene, tController);
        tWorld.addView(tView, 'HelloRedGL');
        //tScene['grid'] = RedGrid(this);
        //tScene['axis'] = RedAxis(this);
        tScene.skyBox = RedSkyBox(this, [
/*
            'https://cx20.github.io/gltf-test/textures/cube/skybox/px.jpg',
            'https://cx20.github.io/gltf-test/textures/cube/skybox/nx.jpg',
            'https://cx20.github.io/gltf-test/textures/cube/skybox/py.jpg',
            'https://cx20.github.io/gltf-test/textures/cube/skybox/ny.jpg',
            'https://cx20.github.io/gltf-test/textures/cube/skybox/pz.jpg',
            'https://cx20.github.io/gltf-test/textures/cube/skybox/nz.jpg'
*/
            'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/px.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/nx.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/py.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/ny.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/pz.jpg',
            'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/nz.jpg'

/*
            'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_right_0.jpg',
            'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_left_0.jpg',
            'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_top_0.jpg',
            'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_bottom_0.jpg',
            'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_front_0.jpg',
            'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_back_0.jpg'
*/
        ]);
        let tDLight = RedDirectionalLight(this);
        tScene.addLight(tDLight);
        tDLight.x = 1;
        tDLight.y = 1;
        tDLight.z = -1;
        tRenderer.start(this, function (time) {
            //console.log(time)
        });
        //tRenderer.setDebugButton();
        console.log(this);
        
        var cubeTexture = RedBitmapCubeTexture(this, // environmentTexture
                [
/*
                    'https://cx20.github.io/gltf-test/textures/cube/skybox/px.jpg',
                    'https://cx20.github.io/gltf-test/textures/cube/skybox/nx.jpg',
                    'https://cx20.github.io/gltf-test/textures/cube/skybox/py.jpg',
                    'https://cx20.github.io/gltf-test/textures/cube/skybox/ny.jpg',
                    'https://cx20.github.io/gltf-test/textures/cube/skybox/pz.jpg',
                    'https://cx20.github.io/gltf-test/textures/cube/skybox/nz.jpg'
*/
                    'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/px.jpg',
                    'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/nx.jpg',
                    'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/py.jpg',
                    'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/ny.jpg',
                    'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/pz.jpg',
                    'https://raw.githubusercontent.com/mrdoob/three.js/3c13d929f8d9a02c89f010a487e73ff0e57437c4/examples/textures/cube/skyboxsun25deg/nz.jpg'

/*
                    'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_right_0.jpg',
                    'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_left_0.jpg',
                    'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_top_0.jpg',
                    'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_bottom_0.jpg',
                    'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_front_0.jpg',
                    'https://cx20.github.io/gltf-test/textures/papermill/specular/specular_back_0.jpg'
*/
                ]
            );

        for (let i = 0; i < modelInfoSet.length; i++) {
            let m = modelInfoSet[i];
            let url = m.url;
            let scale = m.scale;
            let base = url.substr(0, url.lastIndexOf("/") + 1);
            let file = url.substr(url.lastIndexOf("/") + 1);

            RedGLTFLoader(
                this, // redGL
                base, // assetRootPath
                file, // fileName
                function (v) { // callBack
                    if (file == "Fox.gltf") {
                    	v.stopAnimation();
                    	v.playAnimation(v.parsingResult.animations[2])
                    }

                    var mesh = v['resultMesh'];
                    mesh.scaleX = scale;
                    mesh.scaleY = scale;
                    mesh.scaleZ = scale;

                    mesh.rotationX = m.rotation[0] / (2 * Math.PI) * 360;
                    mesh.rotationY = m.rotation[1] / (2 * Math.PI) * 360;
                    mesh.rotationZ = m.rotation[2] / (2 * Math.PI) * 360;
                    
                    mesh.x = m.position[0];
                    mesh.y = m.position[1];
                    mesh.z = m.position[2];

                    tScene.addChild(mesh);
                },
                cubeTexture
            );
        }

        let tMaterial = RedColorMaterial(this, '#ffffff');
        let ground1 = RedMesh(this, RedPlane(this, 100, 0.1, 1, 1), tMaterial);
        ground1.rotationX = (Math.PI / 2) / (2 * Math.PI) * 360;
        ground1.x = -49.5;
        ground1.z = -1.6;
        tScene.addChild(ground1);

        let ground2 = RedMesh(this, RedPlane(this, 100, 0.1, 1, 1), tMaterial);
        ground2.rotationX = (Math.PI / 2) / (2 * Math.PI) * 360;
        ground2.x = -49.5;
        ground2.z = -2.35;
        tScene.addChild(ground2);
    }
});
