class TriangleRenderer {
  constructor(canvas) {
    this.engine = new BABYLON.ThinEngine(canvas, true);
    this.clearColor = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

    this.setupGeometry();
    this.createEffect();
    this.setupCanvas();
  }

  setupGeometry() {
    const positions = [ 
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ];

    this.positionBuffer = new BABYLON.VertexBuffer(this.engine, positions, "position", true, false, 3, false);
    this.vertexBuffers = { position: this.positionBuffer, color: this.colorBuffer };
  }

  createEffect() {
    const vertexShader = document.getElementById("vs").textContent;;
    const fragmentShader = document.getElementById("fs").textContent;;

    this.effectWrapper = new BABYLON.EffectWrapper({
      engine: this.engine,
      name: "triangle",
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      attributeNames: ["position"]
    });
  }

  setupCanvas() {
    const canvas = this.engine.getRenderingCanvas();
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    this.engine.setSize(window.innerWidth, window.innerHeight);
  }

  render() {
    if (!this.effectWrapper.effect.isReady()) return false;

    this.engine.clear(this.clearColor, true, true, true);
    this.engine.enableEffect(this.effectWrapper.effect);
    this.engine.bindBuffers(this.vertexBuffers, null, this.effectWrapper.effect);
    this.engine.drawUnIndexed(true, 0, 3);

    return true;
  }

  resize() {
    const canvas = this.engine.getRenderingCanvas();
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
    this.engine.setSize(width, height);
  }

  start() {
    this.resize();

    const waitForReady = () => {
      if (this.render()) {
      } else {
        requestAnimationFrame(waitForReady);
      }
    };
    waitForReady();

    window.addEventListener('resize', () => {
      this.resize();
      if (this.effectWrapper.effect.isReady()) {
        this.render();
      }
    });
  }

  dispose() {
    this.effectWrapper.dispose();
    this.positionBuffer.dispose();
    this.colorBuffer.dispose();
    this.engine.dispose();
  }
}

function initDemo() {
  const canvas = document.getElementById("c");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  const renderer = new TriangleRenderer(canvas);
  renderer.start();
}

document.addEventListener("DOMContentLoaded", initDemo);