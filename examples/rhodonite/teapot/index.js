function generateEntity() {
    const repo = Rn.EntityRepository.getInstance();
    const entity = repo.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
    return entity;
}

function readyTeapotVerticesData(data) {

    const positions = new Float32Array(data.vertexPositions);
    const normals = new Float32Array(data.vertexNormals);
    const texcoords = new Float32Array(data.vertexTextureCoords);
    const indices = new Uint32Array(data.indices);
        
    const primitive = Rn.Primitive.createPrimitive({
        indices: indices,
        attributeCompositionTypes: [Rn.CompositionType.Vec3, Rn.CompositionType.Vec3, Rn.CompositionType.Vec2],
        attributeSemantics: [Rn.VertexAttribute.Position, Rn.VertexAttribute.Normal, Rn.VertexAttribute.Texcoord0],
        attributes: [positions, normals, texcoords],
        primitiveMode: Rn.PrimitiveMode.Triangles
    });

    const texture = new Rn.Texture();
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
    texture.generateTextureFromUri('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg');
    primitive.material.setTextureParameter(Rn.ShaderSemantics.DiffuseColorTexture, texture);

    // https://github.com/actnwit/RhodoniteTS/blob/master/src/foundation/definitions/ShadingModel.ts
    // ShadingModel enum has the following values.
    // 0: Constant(No Lights)
    // 1: Lambert
    // 2: BlinnPhong
    // 3: Phong
    primitive.material.setParameter(Rn.ShaderSemantics.ShadingModel, 1);

    return primitive;
}

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

const promise = Rn.ModuleManager.getInstance().loadModule('webgl');
promise.then(function() {
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
    $.getJSON("../../../assets/json/teapot.json", function (data) {
        const system = Rn.System.getInstance();
        const c = document.getElementById('world');
        const gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.FastestWebGL1, c);
        //const gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.UniformWebGL1, c);
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
        
        const primitive = readyTeapotVerticesData(data);

        Rn.MeshRendererComponent.manualTransparentSids = [];

        const entities = [];
        const originalMesh = new Rn.Mesh();
        originalMesh.addPrimitive(primitive);
        const entity = generateEntity();

        entities.push(entity);
        const meshComponent = entity.getComponent(Rn.MeshComponent);

        meshComponent.setMesh(originalMesh);
        entity.getTransform().toUpdateAllTransform = false;

        const startTime = Date.now();
        const rotationVec3 = Rn.MutableVector3.zero();

        // camera
        const cameraComponent = createCameraComponent();
        cameraComponent.zNear = 0.1;
        cameraComponent.zFar = 1000;
        cameraComponent.setFovyAndChangeFocalLength(45);
        cameraComponent.aspect = window.innerWidth / window.innerHeight;
        const cameraEntity = cameraComponent.entity;
        cameraEntity.getTransform().translate = new Rn.Vector3(0, 0, 35);

        // TODO: Light is not applied correctly
        // Lights
        const entityRepository = Rn.EntityRepository.getInstance();
        const lightEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.LightComponent])
        const lightComponent = lightEntity.getComponent(Rn.LightComponent);
        //lightComponent.type = Rn.LightType.Directional;
        lightComponent.type = Rn.LightType.Point;
        lightComponent.intensity = new Rn.Vector3(1.0, 1.0, 1.0);
        lightEntity.getTransform().translate = new Rn.Vector3(100.0, 0.0, 100.0);

        // renderPass
        const renderPass = new Rn.RenderPass();
        renderPass.cameraComponent = cameraComponent;
        renderPass.toClearColorBuffer = true;
        renderPass.toClearDepthBuffer = true;
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

        const draw = function(time) {

            const date = new Date();

            const rotation = 0.001 * (date.getTime() - startTime);
            entities.forEach(function (entity) {
                //rotationVec3.x = rotation;
                rotationVec3.y = rotation;
                //rotationVec3.z = rotation;
                entity.getTransform().rotate = rotationVec3;
            });

            system.process([expression]);

            requestAnimationFrame(draw);
        }

        draw();
    });

});