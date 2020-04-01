/*
// file : cube.mat
// usage : matc -o cube.filamat cube.mat
material {
    name : cube,
    requires : [
        color
    ],
    shadingModel : unlit,
    doubleSided : true
}

fragment {
    void material(inout MaterialInputs material) {
        prepareMaterial(material);
        material.baseColor = getColor();
    }
}
*/

class App {
  constructor() {
    this.canvas = document.getElementsByTagName('canvas')[0];
    const engine = this.engine = Filament.Engine.create(this.canvas);
    this.scene = engine.createScene();
    this.triangle = Filament.EntityManager.get()
      .create();
    this.scene.addEntity(this.triangle);
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
    const CUBE_POSITIONS = new Float32Array([
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
    const CUBE_COLORS = new Uint32Array([
      0xff0000ff, // Front face
      0xff0000ff, // Front face
      0xff0000ff, // Front face
      0xff0000ff, // Front face
      0xff00ffff, // Back face
      0xff00ffff, // Back face
      0xff00ffff, // Back face
      0xff00ffff, // Back face
      0xff00ff00, // Top face
      0xff00ff00, // Top face
      0xff00ff00, // Top face
      0xff00ff00, // Top face
      0xff0f0fff, // Bottom face
      0xff0f0fff, // Bottom face
      0xff0f0fff, // Bottom face
      0xff0f0fff, // Bottom face
      0xffff00ff, // Right face
      0xffff00ff, // Right face
      0xffff00ff, // Right face
      0xffff00ff, // Right face
      0xffff0000, // Left face
      0xffff0000, // Left face
      0xffff0000, // Left face
      0xffff0000  // Left face
    ]);
    const VertexAttribute = Filament.VertexAttribute;
    const AttributeType = Filament.VertexBuffer$AttributeType;
    this.vb = Filament.VertexBuffer.Builder()
      .vertexCount(24)
      .bufferCount(2)
      .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT3, 0, 0)
      .attribute(VertexAttribute.COLOR, 1, AttributeType.UBYTE4, 0, 0)
      .normalized(VertexAttribute.COLOR)
      .build(engine);
    this.vb.setBufferAt(engine, 0, CUBE_POSITIONS);
    this.vb.setBufferAt(engine, 1, CUBE_COLORS);
    this.ib = Filament.IndexBuffer.Builder()
      .indexCount(36)
      .bufferType(Filament.IndexBuffer$IndexType.USHORT)
      .build(engine);
    this.ib.setBuffer(engine, new Uint16Array([
       0,  1,  2,    0,  2 , 3,  // Front face
       4,  5,  6,    4,  6 , 7,  // Back face
       8,  9, 10,    8, 10, 11,  // Top face
      12, 13, 14,   12, 14, 15,  // Bottom face
      16, 17, 18,   16, 18, 19,  // Right face
      20, 21, 22,   20, 22, 23   // Left face
    ]));
    const mat = engine.createMaterial('cube.filamat');
    const matinst = mat.getDefaultInstance();
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
    this.camera = engine.createCamera();
    this.view = engine.createView();
    this.view.setCamera(this.camera);
    this.view.setScene(this.scene);
    this.view.setClearColor([1.0, 1.0, 1.0, 1.0]);
    this.resize(); // adjust the initial viewport
    this.render = this.render.bind(this);
    this.resize = this.resize.bind(this);
    window.addEventListener('resize', this.resize);
    window.requestAnimationFrame(this.render);
  }
  render() {
    // Rotate the triangle.
    const radians = Date.now() / 1000;
    const transform = mat4.fromRotation(mat4.create(), radians, [1, 1, 1]);
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
    this.camera.setProjectionFov(45, width / height, 1.0, 10.0, Fov.VERTICAL);
    const eye = [0, 0, 3], center = [0, 0, 0], up = [0, 1, 0];
    this.camera.lookAt(eye, center, up);
  }
}

Filament.init(['cube.filamat'], () => {
  window.app = new App()
});