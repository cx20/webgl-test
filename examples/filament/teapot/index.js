/*
// file : teapot.mat
// usage : matc -o teapot.filamat teapot.mat
material {
    name : teapot,
    parameters : [
        {
           type : sampler2d,
           name : texture
        }
    ],
    requires : [
        uv0,
        tangents
    ],
    shadingModel : lit,
    culling : none
}

fragment {
    void material(inout MaterialInputs material) {
        prepareMaterial(material);
        material.baseColor = texture(materialParams_texture, getUV0());
        material.normal = getWorldNormalVector();
    }
}
*/

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

class App {
  constructor() {
    this.canvas = document.getElementsByTagName('canvas')[0];
    const engine = this.engine = Filament.Engine.create(this.canvas);
    this.scene = engine.createScene();

    const sunlight = Filament.EntityManager.get().create();
    Filament.LightManager.Builder(Filament.LightManager$Type.SUN)
        .color([0.98, 0.92, 0.89])
        .intensity(30000.0)
        .direction([0.6, -1.0, -0.8])
        .sunAngularRadius(10.0)
        .sunHaloSize(10.0)
        .sunHaloFalloff(80.0)
        .build(engine, sunlight);
    this.scene.addEntity(sunlight);

    this.triangle = Filament.EntityManager.get()
      .create();
    this.scene.addEntity(this.triangle);
    const TRIANGLE_POSITIONS = new Float32Array(vertexPositions);
    const TRIANGLE_UVS = new Float32Array(vertexTextureCoords);
    const TRIANGLE_TANGENTS = new Float32Array(vertexNormals);
    const VertexAttribute = Filament.VertexAttribute;
    const AttributeType = Filament.VertexBuffer$AttributeType;
    this.vb = Filament.VertexBuffer.Builder()
      .vertexCount(vertexPositions.length)
      .bufferCount(3)
      .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT3, 0, 0)
      .attribute(VertexAttribute.UV0, 1, AttributeType.FLOAT2, 0, 0)
      .attribute(VertexAttribute.TANGENTS, 2, AttributeType.FLOAT3, 0, 0)
      //.normalized(VertexAttribute.COLOR)
      .build(engine);
    this.vb.setBufferAt(engine, 0, TRIANGLE_POSITIONS);
    this.vb.setBufferAt(engine, 1, TRIANGLE_UVS);
    this.vb.setBufferAt(engine, 2, TRIANGLE_TANGENTS);
    this.ib = Filament.IndexBuffer.Builder()
      .indexCount(indices.length)
      .bufferType(Filament.IndexBuffer$IndexType.USHORT)
      .build(engine);
    this.ib.setBuffer(engine, new Uint16Array(indices));
    const mat = engine.createMaterial('teapot.filamat');
    const matinst = mat.getDefaultInstance();

    const sampler = new Filament.TextureSampler(
      Filament.MinFilter.LINEAR_MIPMAP_LINEAR,
      Filament.MagFilter.LINEAR,
      Filament.WrapMode.REPEAT);
    const texture    = engine.createTextureFromJpeg('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg', {nomips: true});
    matinst.setTextureParameter('texture',    texture,    sampler)

    Filament.RenderableManager.Builder(1)
    .boundingBox({
      center: [-1, -1, -1],
      halfExtent: [1, 1, 1]
    })
    .material(0, matinst)
    .geometry(0, Filament.RenderableManager$PrimitiveType.TRIANGLES, this.vb, this.ib)
    .build(engine, this.triangle);
    this.swapChain = engine.createSwapChain();
    this.renderer = engine.createRenderer();
    this.camera = engine.createCamera(Filament.EntityManager.get().create());
    this.view = engine.createView();
    this.view.setCamera(this.camera);
    this.view.setScene(this.scene);
    this.renderer.setClearOptions({clearColor: [0.0, 0.0, 0.0, 1.0], clear: true});
    this.resize(); // adjust the initial viewport
    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.requestAnimationFrame(this.render);
  }
  render() {
    // Rotate the triangle.
    const radians = Date.now() / 1000;
    const transform = mat4.fromRotation(mat4.create(), radians, [0, 1, 0]);
    const tcm = this.engine.getTransformManager();
    const inst = tcm.getInstance(this.triangle);
    tcm.setTransform(inst, transform);
    inst.delete();
    // Render the frame.
    this.renderer.render(this.swapChain, this.view);
    window.requestAnimationFrame(this.render);
  }
  resize() {
    const dpr = window.devicePixelRatio;
    const width = this.canvas.width = window.innerWidth * dpr;
    const height = this.canvas.height = window.innerHeight * dpr;
    this.view.setViewport([0, 0, width, height]);
    const aspect = width / height;
    const Projection = Filament.Camera$Projection;
    const Fov = Filament.Camera$Fov;
    //this.camera.setProjection(Projection.PERSPECTIVE, -aspect, aspect, -1, 1, 0.1, 1000);
    this.camera.setProjectionFov(45, width / height, 1.0, 1000.0, Fov.VERTICAL);
    const eye = [0, 0, 50], center = [0, 0, 0], up = [0, 1, 0];
    this.camera.lookAt(eye, center, up);
  }
}

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    Filament.init([
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        '../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg',
        'teapot.filamat'
    ], () => {
      window.app = new App()
    });
});


