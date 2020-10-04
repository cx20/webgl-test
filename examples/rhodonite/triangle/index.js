function generateEntity() {
    const repo = Rn.EntityRepository.getInstance();
    const entity = repo.createEntity([Rn.TransformComponent, Rn.SceneGraphComponent, Rn.MeshComponent, Rn.MeshRendererComponent]);
    return entity;
}

function readyBasicVerticesData() {

    const positions = new Float32Array([
         0.0,  0.5, 0.0, // v0
        -0.5, -0.5, 0.0, // v1
         0.5, -0.5, 0.0  // v2
    ]);

    const colors = new Float32Array([
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
    ]);

    const indices = new Uint32Array([
        0, 1, 2
    ]);

    const primitive = Rn.Primitive.createPrimitive({
        indices: indices,
        attributeCompositionTypes: [Rn.CompositionType.Vec3, Rn.CompositionType.Vec3],
        attributeSemantics: [Rn.VertexAttribute.Position, Rn.VertexAttribute.Color0],
        attributes: [positions, colors],
        primitiveMode: Rn.PrimitiveMode.Triangles
    });

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
    
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const primitive = readyBasicVerticesData();

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
    let p = null;
    const rotationVec3 = Rn.MutableVector3.zero();
    let count = 0

    // renderPass
    const renderPass = new Rn.RenderPass();
    renderPass.toClearColorBuffer = true;
    renderPass.addEntities(entities);

    // expression
    const expression = new Rn.Expression();
    expression.addRenderPasses([renderPass]);

    const draw = function(time) {

        const date = new Date();

        if (window.isAnimating) {}

        system.process([expression]);

        count++;
        requestAnimationFrame(draw);
    }

    draw();

});