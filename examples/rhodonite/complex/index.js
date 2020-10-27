
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
    scale: 0.01,
    rotation: [0, Math.PI / 2, 0],
    position: [0, 0, 3],
    url: "https://rawcdn.githack.com/BabylonJS/Exporters/9bc140006be149687be045f60b4a25cdb45ce4fc/Maya/Samples/glTF 2.0/T-Rex/trex_running.gltf"
}];

let p = null;
let scale = 1;

const c = document.getElementById('world');
c.width = window.innerWidth;
c.height = window.innerHeight;

const load = async function () {
  await Rn.ModuleManager.getInstance().loadModule('webgl');
  await Rn.ModuleManager.getInstance().loadModule('pbr');
  const system = Rn.System.getInstance();
  const c = document.getElementById('world');
  const gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.FastestWebGL1, c);
  //const gl = system.setProcessApproachAndCanvas(Rn.ProcessApproach.UniformWebGL1, c);
  
  // camera
  const entityRepository = Rn.EntityRepository.getInstance();
  const cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent, Rn.CameraControllerComponent]);
  const cameraComponent = cameraEntity.getComponent(Rn.CameraComponent);
  cameraComponent.zNear = 0.1;
  cameraComponent.zFar = 1000.0;
  cameraComponent.setFovyAndChangeFocalLength(60.0);
  cameraComponent.aspect = c.width / c.height;
  const cameraControllerComponent = cameraEntity.getComponent(Rn.CameraControllerComponent);

  // Lights
  const lightEntity1 = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.LightComponent])
  lightEntity1.getTransform().translate = new Rn.Vector3(1.0, 1.0, 100000.0);
  lightEntity1.getComponent(Rn.LightComponent).intensity = new Rn.Vector3(1, 1, 1);
  lightEntity1.getComponent(Rn.LightComponent).type = Rn.LightType.Directional;
  lightEntity1.getTransform().rotate = new Rn.Vector3(-Math.PI / 2, -Math.PI / 4, Math.PI / 4);

  const lightEntity2 = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.LightComponent])
  lightEntity2.getTransform().translate = new Rn.Vector3(1.0, 1.0, 100000.0);
  lightEntity2.getComponent(Rn.LightComponent).intensity = new Rn.Vector3(1, 1, 1);
  lightEntity2.getComponent(Rn.LightComponent).type = Rn.LightType.Directional;
  lightEntity2.getTransform().rotate = new Rn.Vector3(Math.PI / 2, Math.PI / 4, -Math.PI / 4);

  // expressions
  const expressions = [];

  const importer = Rn.Gltf2Importer.getInstance();
  let promises = [];
  for (let i = 0; i < modelInfoSet.length; i++ ) {
    const promise = importer.import(modelInfoSet[i].url);
    promises.push(promise);
  }
  
  Promise.all(promises).then(function (gltfModels) {
    const modelConverter = Rn.ModelConverter.getInstance();
    const rootGroups = [];

    for (let i = 0; i < modelInfoSet.length; i++) {
      let modelInfo = modelInfoSet[i];
      const rootGroup = modelConverter.convertToRhodoniteObject(gltfModels[i]);
      rootGroup.getTransform().scale = new Rn.Vector3(modelInfo.scale, modelInfo.scale, modelInfo.scale);
      rootGroup.getTransform().rotate = new Rn.Vector3(modelInfo.rotation[0], modelInfo.rotation[1], modelInfo.rotation[2]);
      rootGroup.getTransform().translate = new Rn.Vector3(modelInfo.position[0], modelInfo.position[1], modelInfo.position[2]);

      if (modelInfo.name == "Fox") {
        cameraControllerComponent.controller.setTarget(rootGroup);
      }
      
      rootGroups.push(rootGroup);
    }
    
    const renderPass = new Rn.RenderPass();

    renderPass.addEntities(rootGroups);
    renderPass.toClearColorBuffer = true;
    renderPass.toClearDepthBuffer = true;
    renderPass.clearColor = new Rn.Vector4(0.2, 0.2, 0.2, 1);

    // gamma correction
    const gammaTargetFramebuffer = Rn.RenderableHelper.createTexturesForRenderTarget(1024, 1024, 1, {});
    renderPass.setFramebuffer(gammaTargetFramebuffer);

    const gammaRenderPass = createPostEffectRenderPass('createGammaCorrectionMaterial');
    setTextureParameterForMeshComponents(gammaRenderPass.meshComponents, Rn.ShaderSemantics.BaseColorTexture, gammaTargetFramebuffer.colorAttachments[0]);

    const expression = new Rn.Expression();
    expression.addRenderPasses([renderPass, gammaRenderPass]);
    expressions.push(expression);
  
    draw();
  });

  function createPostEffectRenderPass(materialHelperFunctionStr, arrayOfHelperFunctionArgument = []) {
    const boardPrimitive = new Rn.Plane();
    boardPrimitive.generate({
      width: 1, height: 1, uSpan: 1, vSpan: 1, isUVRepeat: false,
      material: Rn.MaterialHelper[materialHelperFunctionStr].apply(this, arrayOfHelperFunctionArgument)
    });
  
    const boardEntity = generateEntity();
    boardEntity.getTransform().rotate = new Rn.Vector3(Math.PI / 2, 0.0, 0.0);
    boardEntity.getTransform().translate = new Rn.Vector3(0.0, 0.0, -0.5);
  
    const boardMesh = new Rn.Mesh();
    boardMesh.addPrimitive(boardPrimitive);
    const boardMeshComponent = boardEntity.getComponent(Rn.MeshComponent);
    boardMeshComponent.setMesh(boardMesh);
  
    if (createPostEffectRenderPass.cameraComponent == null) {
      const entityRepository = Rn.EntityRepository.getInstance();
      const cameraEntity = entityRepository.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.CameraComponent]);
      const cameraComponent = cameraEntity.getComponent(Rn.CameraComponent);
      cameraComponent.zFarInner = 1.0;
      createPostEffectRenderPass.cameraComponent = cameraComponent;
    }
  
    const renderPass = new Rn.RenderPass();
    renderPass.toClearColorBuffer = true;
    renderPass.clearColor = new Rn.Vector4(0.0, 0.0, 0.0, 1.0);
    renderPass.cameraComponent = createPostEffectRenderPass.cameraComponent;
    renderPass.addEntities([boardEntity]);
  
    return renderPass;
  }

  function generateEntity() {
    const repo = Rn.EntityRepository.getInstance();
    const entity = repo.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
    return entity;
  }
  
  function setTextureParameterForMeshComponents(meshComponents, shaderSemantic, value) {
    for (let i = 0; i < meshComponents.length; i++) {
      const mesh = meshComponents[i].mesh;
      if (!mesh) continue;
  
      const primitiveNumber = mesh.getPrimitiveNumber();
      for (let j = 0; j < primitiveNumber; j++) {
        const primitive = mesh.getPrimitiveAt(j);
        primitive.material.setTextureParameter(shaderSemantic, value);
      }
    }
  }
  
  let startTime = Date.now();
  const draw = function () {
    const date = new Date();
    const rotation = 0.001 * (date.getTime() - startTime);
    const angle = 0.02 * date.getTime();
    const time = (date.getTime() - startTime) / 1000;
    Rn.AnimationComponent.globalTime = time;
    if (time > Rn.AnimationComponent.endInputValue) {
      startTime = date.getTime();
    }
    
    cameraControllerComponent.controller.rotX = -angle;
    
    system.process(expressions);
    requestAnimationFrame(draw);
  };
}

document.body.onload = load;
