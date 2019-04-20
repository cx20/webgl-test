/*
// file : square.mat
// usage : matc -o square.filamat square.mat
material {
    name : square,
    requires : [
        color
    ],
    shadingModel : unlit,
    culling : none
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
    // Square data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //        [0]------[1]
    //         |      / |
    //         |    /   |
    //         |  /     |
    //        [2]------[3]
    //
    const SQUARE_POSITIONS = new Float32Array([
      -0.5, 0.5, 0.0, // v0
       0.5, 0.5, 0.0, // v1 
      -0.5,-0.5, 0.0, // v2
       0.5,-0.5, 0.0  // v3
    ]);
    const SQUARE_COLORS = new Uint32Array([
      0xff0000ff,
      0xff00ff00,
      0xffff0000,
      0xff00ffff
    ]);
    const VertexAttribute = Filament.VertexAttribute;
    const AttributeType = Filament.VertexBuffer$AttributeType;
    this.vb = Filament.VertexBuffer.Builder()
      .vertexCount(4)
      .bufferCount(2)
      .attribute(VertexAttribute.POSITION, 0, AttributeType.FLOAT3, 0, 12)
      .attribute(VertexAttribute.COLOR, 1, AttributeType.UBYTE4, 0, 4)
      .normalized(VertexAttribute.COLOR)
      .build(engine);
    this.vb.setBufferAt(engine, 0, SQUARE_POSITIONS);
    this.vb.setBufferAt(engine, 1, SQUARE_COLORS);
    this.ib = Filament.IndexBuffer.Builder()
      .indexCount(6)
      .bufferType(Filament.IndexBuffer$IndexType.USHORT)
      .build(engine);
    this.ib.setBuffer(engine, new Uint16Array([
      2, 0, 1, // v2-v0-v1
      2, 1, 3  // v2-v1-v3
    ]));
    const mat = engine.createMaterial('square.filamat');
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
    this.camera.setProjection(Projection.ORTHO, -aspect, aspect, -1, 1, 0, 1);
  }
}
Filament.init(['square.filamat'], () => {
  window.app = new App()
});