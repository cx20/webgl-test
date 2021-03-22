function generateEntity() {
    const repo = Rn.EntityRepository.getInstance();
    const entity = repo.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
    return entity;
}

function readyBasicVerticesData() {

    // Cube data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //         [7]------[6]
    //        / |      / |
    //      [3]------[2] |
    //       |  |     |  |
    //       | [4]----|-[5]
    //       |/       |/
    //      [0]------[1]
    //
    const positions = new Float32Array([ 
        // Front face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        // Back face
        -0.5, -0.5, -0.5, // v4
         0.5, -0.5, -0.5, // v5
         0.5,  0.5, -0.5, // v6
        -0.5,  0.5, -0.5, // v7
        // Top face
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5, // v7
         0.5,  0.5, -0.5, // v6
        // Bottom face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5, -0.5, -0.5, // v5
        -0.5, -0.5, -0.5, // v4
         // Right face
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
         0.5,  0.5, -0.5, // v6
         0.5, -0.5, -0.5, // v5
         // Left face
        -0.5, -0.5,  0.5, // v0
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5, // v7
        -0.5, -0.5, -0.5  // v4
    ]);
    
    const texcoords = new Float32Array([ 
        // Front face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        
        // Back face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        
        // Top face
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        
        // Bottom face
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
        
        // Right face
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0,
        0.0, 0.0,
        
        // Left face
        0.0, 0.0,
        1.0, 0.0,
        1.0, 1.0,
        0.0, 1.0
    ]);

    const indices = new Uint32Array([
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ]);
        
    const primitive = Rn.Primitive.createPrimitive({
        indices: indices,
        attributeCompositionTypes: [Rn.CompositionType.Vec3, Rn.CompositionType.Vec2],
        attributeSemantics: [Rn.VertexAttribute.Position, Rn.VertexAttribute.Texcoord0],
        attributes: [positions, texcoords],
        primitiveMode: Rn.PrimitiveMode.Triangles
    });

    const texture = new Rn.Texture();
    texture.generateTextureFromUri('../../../assets/textures/frog.jpg');
    primitive.material.setTextureParameter(Rn.ShaderSemantics.DiffuseColorTexture, texture);

    return primitive;
}

const promise = Rn.ModuleManager.getInstance().loadModule('webgl');
promise.then(function() {
    const system = Rn.System.getInstance();
    const c = document.getElementById('world');
    const gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.FastestWebGL1, c);
    gl.enable(gl.DEPTH_TEST);

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

    const primitive = readyBasicVerticesData();

    Rn.MeshRendererComponent.manualTransparentSids = [];

    const entities = [];
    const mesh1 = new Rn.Mesh();
    const mesh2 = new Rn.Mesh();
    mesh1.addPrimitive(primitive);
    mesh2.addPrimitive(primitive);
    const entity1 = generateEntity();
    const entity2 = generateEntity();

    entities.push(entity1);
    entities.push(entity2);
    const meshComponent1 = entity1.getComponent(Rn.MeshComponent);
    const meshComponent2 = entity2.getComponent(Rn.MeshComponent);

    meshComponent1.setMesh(mesh1);
    entity1.getTransform().toUpdateAllTransform = false;
    entity1.getTransform().translate = new Rn.Vector3(-1.0, 0, 0);

    meshComponent2.setMesh(mesh2);
    entity2.getTransform().toUpdateAllTransform = false;
    entity2.getTransform().translate = new Rn.Vector3(1.0, 0, 0);

    const startTime = Date.now();
    let p = null;
    const rotationVec3 = Rn.MutableVector3.zero();
    let count = 0

    // camera
    const cameraComponent = createCameraComponent();
    cameraComponent.zNear = 0.1;
    cameraComponent.zFar = 1000;
    cameraComponent.setFovyAndChangeFocalLength(45);
    cameraComponent.aspect = window.innerWidth / window.innerHeight;
    const cameraEntity = cameraComponent.entity;
    cameraEntity.getTransform().translate = new Rn.Vector3(0, 0, 5);

    // renderPass
    const renderPass = new Rn.RenderPass();
    renderPass.cameraComponent = cameraComponent;
    renderPass.toClearColorBuffer = true;
    renderPass.clearColor = new Rn.Vector4(0, 0, 0, 1);
    renderPass.addEntities(entities);

    // expression
    const expression = new Rn.Expression();
    expression.addRenderPasses([renderPass]);

    function createCameraComponent() {
        const entityRepository = Rn.EntityRepository.getInstance();
        const cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent]);
        const cameraComponent = cameraEntity.getComponent(Rn.CameraComponent);
        return cameraComponent;
    }

    let axis = new Rn.Vector3(1, 1, 1);

    const draw = function(time) {

        const date = new Date();

        const rotation = 0.001 * (date.getTime() - startTime);

/*
        rotationVec3.v[0] = rotation;
        rotationVec3.v[1] = rotation;
        rotationVec3.v[2] = rotation;
*/
        rotationVec3.x = rotation;
        rotationVec3.y = rotation;
        rotationVec3.z = rotation;
        
        // Rotation by Euler angles
        entity1.getTransform().rotate = rotationVec3;
        
        // Rotation by Qaternions
        entity2.getTransform().quaternion = Rn.MutableQuaternion.axisAngle(axis, rotation);

        gl.disable(gl.CULL_FACE); // TODO:
        system.process([expression]);

        count++;
        requestAnimationFrame(draw);
    }

    draw();

});