function readyTeapotVerticesData(data) {

    const positions = new Float32Array(data.vertexPositions);
    const normals = new Float32Array(data.vertexNormals);
    const texcoords = new Float32Array(data.vertexTextureCoords);
    const indices = new Uint32Array(data.indices);
        
    const primitive = Rn.Primitive.createPrimitive({
        indices: indices,
        attributeSemantics: [Rn.VertexAttribute.Position.XYZ, Rn.VertexAttribute.Normal.XYZ, Rn.VertexAttribute.Texcoord0.XY],
        attributes: [positions, normals, texcoords],
        material: void 0,
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

const load = async function () {
    const c = document.getElementById('world');
    const gl = await Rn.System.init({
      //approach: Rn.ProcessApproach.UniformWebGL1,
      //approach: Rn.ProcessApproach.FastestWebGL1,
      //approach: Rn.ProcessApproach.UniformWebGL2,
      approach: Rn.ProcessApproach.FastestWebGL2,
      canvas: c,
    });

    function resizeCanvas() {
        c.width = window.innerWidth;
        c.height = window.innerHeight;
        gl.viewport(0, 0, c.width, c.height);
    }
    
    const promise1 = Rn.ModuleManager.getInstance().loadModule('webgl');
    const promise2 = Rn.ModuleManager.getInstance().loadModule('pbr');
    Promise.all([promise1, promise2]).then(function() {
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
        $.getJSON("../../../assets/json/teapot.json", function (data) {
            init(data);
        });

    });
    
    function init(data) {
        resizeCanvas();
        
        window.addEventListener("resize", function(){
            resizeCanvas();
        });
        
        const primitive = readyTeapotVerticesData(data);

        Rn.MeshRendererComponent.manualTransparentSids = [];

        const entities = [];
        const originalMesh = new Rn.Mesh();
        originalMesh.addPrimitive(primitive);
        const entity = Rn.EntityHelper.createMeshEntity();

        entities.push(entity);
        const meshComponent = entity.getComponent(Rn.MeshComponent);

        meshComponent.setMesh(originalMesh);
        entity.getTransform().toUpdateAllTransform = false;

        const startTime = Date.now();
        const rotationVec3 = Rn.MutableVector3.zero();

        // camera
        const cameraEntity = Rn.EntityHelper.createCameraControllerEntity();
        cameraEntity.translate = Rn.Vector3.fromCopyArray([0, 0, 35]);
        const cameraComponent = cameraEntity.getCamera();
        cameraComponent.zNear = 0.1;
        cameraComponent.zFar = 1000;
        cameraComponent.setFovyAndChangeFocalLength(45);
        cameraComponent.aspect = window.innerWidth / window.innerHeight;

        // TODO: Light is not applied correctly
        // Lights
        const lightEntity = Rn.EntityHelper.createLightEntity();
        const lightComponent = lightEntity.getLight();
        lightComponent.type = Rn.LightType.Point;
        lightComponent.intensity = Rn.Vector3.fromCopyArray([1, 1, 1]);
        lightEntity.translate = Rn.Vector3.fromCopyArray([100, 0, 100]);

        // renderPass
        const renderPass = new Rn.RenderPass();
        renderPass.cameraComponent = cameraComponent;
        renderPass.toClearColorBuffer = true;
        renderPass.toClearDepthBuffer = true;
        renderPass.clearColor = Rn.Vector4.fromCopyArray4([0, 0, 0, 1]);
        renderPass.addEntities(entities);

        // expression
        const expression = new Rn.Expression();
        expression.addRenderPasses([renderPass]);

        const draw = function(time) {

            const date = new Date();

            const rotation = 0.001 * (date.getTime() - startTime);
            entities.forEach(function (entity) {
                entity.getTransform().rotate = Rn.Vector3.fromCopyArray([0, rotation, 0]);
            });

            Rn.System.process([expression]);

            requestAnimationFrame(draw);
        }

        draw();
    }
}

document.body.onload = load;
