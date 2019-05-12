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
    const positions = new Float32Array([ 
        0.0,  0.5, 0.0, 
       -0.5, -0.5, 0.0, 
        0.5, -0.5, 0.0 
    ]);
    
    const positionAttribute = new XenoGL.Attribute('position', 3);
    const positionBuffer = new XenoGL.ArrayBuffer({
        dataOrLength: positions,
        attributes: [positionAttribute],
        dataType: XenoGL.FLOAT
    });
     
    program.addBuffer(positionBuffer);
}

function draw() {
    xgl.draw(XenoGL.TRIANGLES);
}

initWebGL();
initShaders();
initBuffers();
draw();
