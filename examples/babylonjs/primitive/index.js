const canvas = document.querySelector("#c");
const engine = new BABYLON.Engine(canvas);

const createScene = function() {
    const scene = new BABYLON.Scene(engine);
    const camera = new BABYLON.ArcRotateCamera("camera", 0, 1, 5, BABYLON.Vector3.Zero(), scene);
    camera.setPosition( new BABYLON.Vector3(0, 0, -6) );
    camera.attachControl(canvas, false, false);
    scene.activeCamera = camera;

    scene.clearColor = new BABYLON.Color3(0, 0, 0);

    const plane = BABYLON.MeshBuilder.CreatePlane('plane', {size: 1.0}, scene);
    plane.position = new BABYLON.Vector3(-1.5, 1.5, 0); 

    const cube = BABYLON.MeshBuilder.CreateBox('cube', {size: 1.0}, scene);
    cube.position = new BABYLON.Vector3(0, 1.5, 0); 

    const sphere = BABYLON.MeshBuilder.CreateSphere('sphere', {segments: 24.0, diameter: 1.0}, scene);
    sphere.position = new BABYLON.Vector3(1.5, 1.5, 0); 
    
    const circle = BABYLON.MeshBuilder.CreateDisc("disc", {radius: 0.5, tessellation: 24}, scene);
    circle.position = new BABYLON.Vector3(-1.5, 0, 0); 
    
    const cylinder = BABYLON.MeshBuilder.CreateCylinder("Cylinder", {height: 1, diameterTop: 1, diameterBottom: 1, tessellation: 32}, scene);
    cylinder.position = new BABYLON.Vector3(0, 0, 0); 

    const cone = BABYLON.MeshBuilder.CreateCylinder("Cone", {height: 1, diameterTop: 0, diameterBottom: 1, tessellation: 32}, scene);
    cone.position = new BABYLON.Vector3(1.5, 0, 0); 
    
    const knot = BABYLON.MeshBuilder.CreateTorusKnot("knot", {radius: 0.3, tube: 0.1, radialSegments: 128, tubularSegments: 64, p: 2, q: 3}, scene);
    knot.position = new BABYLON.Vector3(-1.5, -1.5, 0); 

    const torus = BABYLON.MeshBuilder.CreateTorus("torus", {diameter: 1.0, thickness: 0.2, tessellation: 10}, scene);
    torus.position = new BABYLON.Vector3(0, -1.5, 0); 
    
    const octa = BABYLON.MeshBuilder.CreatePolyhedron("oct", {type: 1, size: 0.5}, scene);
    octa.position = new BABYLON.Vector3(1.5, -1.5, 0); 

    const materialA = new BABYLON.StandardMaterial("materialA", scene);
    materialA.diffuseTexture = new BABYLON.Texture("../../../assets/textures/earth.jpg", scene);
    materialA.emissiveColor = new BABYLON.Color3(1, 1, 1);

    const materialB = new BABYLON.StandardMaterial("materialB", scene);
    materialB.diffuseTexture = new BABYLON.Texture("../../../assets/textures/earth_reverse_left_right_up_down.jpg", scene);
    materialB.emissiveColor = new BABYLON.Color3(1, 1, 1);
    
    plane.material    = materialA;
    cube.material     = materialA;
    sphere.material   = materialB;
    circle.material   = materialA;
    cylinder.material = materialA;
    cone.material     = materialA;
    knot.material     = materialA;
    torus.material    = materialA;
    octa.material     = materialA;

    let rad = 0.0;
    scene.onBeforeRenderObservable.add(() => {
        rad += Math.PI * 1.0 / 180.0 * scene.getAnimationRatio();

        plane.rotation.y = rad;
        cube.rotation.y = rad;
        sphere.rotation.y = rad;
        circle.rotation.y = rad;
        cylinder.rotation.y = rad;
        cone.rotation.y = rad;
        knot.rotation.y = rad;
        torus.rotation.y = rad;
        octa.rotation.y = rad;
    });

    return scene;
}

const scene = createScene();

engine.runRenderLoop(() => {
    scene.render();
});
