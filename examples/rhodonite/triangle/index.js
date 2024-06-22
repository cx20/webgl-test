import Rn from 'rhodonite';

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
        attributeSemantics: [Rn.VertexAttribute.Position.XYZ, Rn.VertexAttribute.Color0.XYZ],
        attributes: [positions, colors],
        material: void 0,
        primitiveMode: Rn.PrimitiveMode.Triangles
    });

    return primitive;
}

const load = async function () {
    Rn.Config.maxCameraNumber = 20;
    Rn.Config.dataTextureWidth  = 2 ** 9; // default: 2 ** 11;
    Rn.Config.dataTextureHeight = 2 ** 9; // default: 2 ** 11;
    
    await Rn.ModuleManager.getInstance().loadModule('webgl');
    await Rn.ModuleManager.getInstance().loadModule('pbr');
    const c = document.getElementById('world');

    await Rn.System.init({
      approach: Rn.ProcessApproach.DataTexture,
      canvas: c,
    });

    resizeCanvas();
    
    window.addEventListener("resize", function(){
        resizeCanvas();
    });

    function resizeCanvas() {
        Rn.System.resizeCanvas(window.innerWidth, window.innerHeight);
    }
    
    const primitive = readyBasicVerticesData();

    Rn.MeshRendererComponent.manualTransparentSids = [];

    const originalMesh = new Rn.Mesh();
    originalMesh.addPrimitive(primitive);
    
    const firstEntity = Rn.EntityHelper.createMeshEntity();
    const meshComponent = firstEntity.getMesh();
    meshComponent.setMesh(originalMesh);

    const draw = function(time) {
        Rn.System.processAuto();
        requestAnimationFrame(draw);
    }

    draw();
}

document.body.onload = load;
