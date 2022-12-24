const load = async function () {
    await Rn.ModuleManager.getInstance().loadModule('webgl');
    await Rn.ModuleManager.getInstance().loadModule('pbr');
    const c = document.getElementById('world');
    const gl = await Rn.System.init({
        approach: Rn.ProcessApproach.DataTexture,
        canvas: c,
    });

    resizeCanvas();
    
    window.addEventListener("resize", function(){
        resizeCanvas();
    });
    
    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        gl.viewport(0, 0, c.width, c.height);
    }
    
    Rn.MeshRendererComponent.manualTransparentSids = [];

    const group = Rn.EntityHelper.createGroupEntity();

    const entities = [];

    const texture = new Rn.Texture();
    texture.generateTextureFromUri('../../../assets/textures/frog.jpg');
    
    const material = Rn.MaterialHelper.createClassicUberMaterial();
    material.setTextureParameter(Rn.ShaderSemantics.DiffuseColorTexture, texture);

    const cube1 = Rn.MeshHelper.createCube({widthVector: Rn.Vector3.fromCopyArray([1, 1, 1]), material: material});
    cube1.localScale = Rn.Vector3.fromCopyArray([0.5, 0.5, 0.5]);
    cube1.getTransform().localPosition = Rn.Vector3.fromCopyArray([-1.0, 0, 0]);

    const cube2 = Rn.MeshHelper.createCube({widthVector: Rn.Vector3.fromCopyArray([1, 1, 1]), material: material});
    cube2.localScale = Rn.Vector3.fromCopyArray([0.5, 0.5, 0.5]);
    cube2.getTransform().localPosition = Rn.Vector3.fromCopyArray([1.0, 0, 0]);

    entities.push(cube1);
    entities.push(cube2);
    
    group.getSceneGraph().addChild(cube1.getSceneGraph());
    group.getSceneGraph().addChild(cube2.getSceneGraph());

    const startTime = Date.now();
    let count = 0

    // camera
    const cameraEntity = Rn.EntityHelper.createCameraControllerEntity();
    cameraEntity.localPosition = Rn.Vector3.fromCopyArray([0, 0, 5]);
    const cameraComponent = cameraEntity.getCamera();
    cameraComponent.zNear = 0.1;
    cameraComponent.zFar = 1000;
    cameraComponent.setFovyAndChangeFocalLength(45);
    cameraComponent.aspect = window.innerWidth / window.innerHeight;

    cameraEntity.getCameraController().controller.setTarget(group);

    // renderPass
    const renderPass = new Rn.RenderPass();
    renderPass.cameraComponent = cameraComponent;
    renderPass.toClearColorBuffer = true;
    renderPass.clearColor = Rn.Vector4.fromCopyArray4([0, 0, 0, 1]);
    renderPass.addEntities(entities);

    // expression
    const expression = new Rn.Expression();
    expression.addRenderPasses([renderPass]);

    let axis = Rn.Vector3.fromCopyArray3([1, 1, 1]);

    const draw = function(time) {

        const date = new Date();
        const rotation = 0.001 * (date.getTime() - startTime);

        // Rotation by Euler angles
        cube1.getTransform().localEulerAngles = Rn.Vector3.fromCopyArray([rotation, rotation, rotation]);
        
        // Rotation by Qaternions
        cube2.getTransform().localRotation = Rn.MutableQuaternion.axisAngle(axis, rotation);

        Rn.System.processAuto();

        count++;
        requestAnimationFrame(draw);
    }

    draw();
}

document.body.onload = load;
