let xgl;
let program;

function initWebGL() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    xgl = new XenoGL.WebGL2(canvas);
}

function initShaders() {
    const vertexShaderSource = document.getElementById("vs").textContent;
    const fragmentShaderSource = document.getElementById("fs").textContent;

    const vertexShader = new XenoGL.VertexShader(vertexShaderSource);
    const fragmentShader = new XenoGL.FragmentShader(fragmentShaderSource);
     
    program = new XenoGL.Program({
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
    
    xgl.addProgram(program);
}

function initBuffers() {
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
    //         |        |
    //         |        |
    //         |        |
    //        [2]------[3]
    //
    const positions = new Float32Array([ 
        -0.5, 0.5, 0.0, // v0
         0.5, 0.5, 0.0, // v1 
        -0.5,-0.5, 0.0, // v2
         0.5,-0.5, 0.0  // v3
    ]);

    const colors = new Float32Array([ 
         1.0, 0.0, 0.0, 1.0, // v0
         0.0, 1.0, 0.0, 1.0, // v1
         0.0, 0.0, 1.0, 1.0, // v2
         1.0, 1.0, 0.0, 1.0  // v3
    ]);
    
    const positionAttribute = new XenoGL.Attribute('position', 3);
    const positionBuffer = new XenoGL.ArrayBuffer({
        dataOrLength: positions,
        attributes: [positionAttribute],
        dataType: XenoGL.FLOAT
    });
    program.addBuffer(positionBuffer);

    const colorAttribute = new XenoGL.Attribute('color', 4);
    const colorBuffer = new XenoGL.ArrayBuffer({
        dataOrLength: colors,
        attributes: [colorAttribute],
        dataType: XenoGL.FLOAT
    });

    program.addBuffer(colorBuffer);
}

function draw() {
    xgl.draw(XenoGL.TRIANGLE_STRIP);
}

initWebGL();
initShaders();
initBuffers();
draw();
