function readyPlaneVerticesData() {
    let modelMaterial = Rn.MaterialHelper.createClassicUberMaterial();
    const primitive = new Rn.Plane();
    primitive.generate({ width: 2, height: 2, uSpan: 1, vSpan: 1, isUVRepeat: false, flipTextureCoordinateY: false, material: modelMaterial });

    const texture = new Rn.Texture();
    texture.generateTextureFromUri('../../../assets/textures/earth.jpg');
    primitive.material.setTextureParameter(Rn.ShaderSemantics.DiffuseColorTexture, texture);

    return primitive;
}

function readySphereVerticesData() {
    let modelMaterial = Rn.MaterialHelper.createClassicUberMaterial();
    const primitive = new Rn.Sphere();
    primitive.generate({ radius: 1, widthSegments: 40, heightSegments: 40, material: modelMaterial });

    const texture = new Rn.Texture();
    texture.generateTextureFromUri('../../../assets/textures/earth.jpg');
    primitive.material.setTextureParameter(Rn.ShaderSemantics.DiffuseColorTexture, texture);

    return primitive;
}

function readyCubeVerticesData() {
    let modelMaterial = Rn.MaterialHelper.createClassicUberMaterial();
    const primitive = new Rn.Cube();
    //primitive.generate({ radius: 1, widthSegments: 40, heightSegments: 40, material: modelMaterial });
    primitive.generate({ widthVector: Rn.Vector3.fromCopy3(1, 1, 1) });

    const texture = new Rn.Texture();
    texture.generateTextureFromUri('../../../assets/textures/earth.jpg');
    primitive.material.setTextureParameter(Rn.ShaderSemantics.DiffuseColorTexture, texture);

    return primitive;
}


const load = async function () {
    Rn.Config.maxCameraNumber = 20;
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
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const primitivePlane  = readyPlaneVerticesData();
    const primitiveSphere = readySphereVerticesData();
    const primitiveCube = readyCubeVerticesData();

    Rn.MeshRendererComponent.manualTransparentSids = [];

    const entities = [];
    const mesh1 = new Rn.Mesh();
    const mesh2 = new Rn.Mesh();
    const mesh3 = new Rn.Mesh();
    mesh1.addPrimitive(primitivePlane);
    mesh2.addPrimitive(primitiveSphere);
    mesh3.addPrimitive(primitiveCube);

    const entity1 = Rn.EntityHelper.createMeshEntity();
    const entity2 = Rn.EntityHelper.createMeshEntity();
    const entity3 = Rn.EntityHelper.createMeshEntity();

    entities.push(entity1);
    entities.push(entity2);
    entities.push(entity3);
    const meshComponent1 = entity1.getComponent(Rn.MeshComponent);
    const meshComponent2 = entity2.getComponent(Rn.MeshComponent);
    const meshComponent3 = entity3.getComponent(Rn.MeshComponent);

    meshComponent1.setMesh(mesh1);
    entity1.getTransform().toUpdateAllTransform = false;
    entity1.getTransform().localPosition = Rn.Vector3.fromCopyArray([-3.0, 0, 0]);

    meshComponent2.setMesh(mesh2);
    entity2.getTransform().toUpdateAllTransform = false;
    entity2.getTransform().localPosition = Rn.Vector3.fromCopyArray([0.0, 0, 0]);

    meshComponent3.setMesh(mesh3);
    entity3.getTransform().toUpdateAllTransform = false;
    entity3.getTransform().localPosition = Rn.Vector3.fromCopyArray([3.0, 0, 0]);


    const startTime = Date.now();
    let p = null;
    const rotation1 = Rn.MutableVector3.zero();
    const rotation2 = Rn.MutableVector3.zero();
    const rotation3 = Rn.MutableVector3.zero();
    let count = 0

    // camera
    const cameraEntity = Rn.EntityHelper.createCameraControllerEntity();
    cameraEntity.localPosition = Rn.Vector3.fromCopyArray([0, 0, 8]);
    const cameraComponent = cameraEntity.getCamera();
    cameraComponent.zNear = 0.1;
    cameraComponent.zFar = 1000;
    cameraComponent.setFovyAndChangeFocalLength(45);
    cameraComponent.aspect = window.innerWidth / window.innerHeight;

    // renderPass
    const renderPass = new Rn.RenderPass();
    renderPass.cameraComponent = cameraComponent;
    renderPass.toClearColorBuffer = true;
    renderPass.clearColor = Rn.Vector4.fromCopyArray4([0, 0, 0, 1]);
    renderPass.addEntities(entities);

    // expression
    const expression = new Rn.Expression();
    expression.addRenderPasses([renderPass]);

    let axis = Rn.Vector3.fromCopyArray([1, 1, 1]);

    const draw = function(time) {

        const date = new Date();

        const rotation = 0.001 * (date.getTime() - startTime);

        entity1.getTransform().localEulerAngles = Rn.Vector3.fromCopyArray([-Math.PI / 2, rotation, 0]);
        entity2.getTransform().localEulerAngles = Rn.Vector3.fromCopyArray([0, rotation, 0]);
        entity3.getTransform().localEulerAngles = Rn.Vector3.fromCopyArray([-Math.PI, rotation, 0]);

        gl.disable(gl.CULL_FACE); // TODO:
        Rn.System.process([expression]);

        count++;
        requestAnimationFrame(draw);
    }

    draw();
}

document.body.onload = load;
