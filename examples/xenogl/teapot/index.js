let xgl;
let program;
let uMVMatrix;
let uPMatrix;
let uTexture;

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    let vertexPositions = data.vertexPositions;
    let vertexTextureCoords = data.vertexTextureCoords;
    let vertexNormals = data.vertexNormals;
    let indices = data.indices;

    function initWebGL() {
        const canvas = document.createElement('canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        document.body.appendChild(canvas);
        xgl = new XenoGL.WebGL2(canvas);
        xgl.enable(XenoGL.DEPTH_TEST);
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

    async function initBuffers() {

        const positions = new Float32Array(vertexPositions);
        const textureCoords = new Float32Array(vertexTextureCoords);
        const normals = new Float32Array(vertexNormals);
        
        const positionAttribute = new XenoGL.Attribute('position', 3);
        const positionBuffer = new XenoGL.ArrayBuffer({
            dataOrLength: positions,
            attributes: [positionAttribute],
            dataType: XenoGL.FLOAT
        });
        program.addBuffer(positionBuffer);

        const textureCoordAttribute = new XenoGL.Attribute('textureCoord', 2);
        const textureCoordBuffer = new XenoGL.ArrayBuffer({
            dataOrLength: textureCoords,
            attributes: [textureCoordAttribute],
            dataType: XenoGL.FLOAT
        });
        program.addBuffer(textureCoordBuffer);

        const normalAttribute = new XenoGL.Attribute('normal', 3);
        const normalBuffer = new XenoGL.ArrayBuffer({
            dataOrLength: normals,
            attributes: [normalAttribute],
            dataType: XenoGL.FLOAT
        });
        program.addBuffer(normalBuffer);

        const indices_ = new Uint16Array(indices);
        const indexBuffer = new XenoGL.ElementArrayBuffer({
            dataOrLength: indices_,
            dataType: XenoGL.UNSIGNED_SHORT,
            usage: XenoGL.DYNAMIC_DRAW
        });
        
        program.addBuffer(indexBuffer);

        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        const textureSource = await fetch('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg')
            .then((res) => res.blob())
            .then((blob) => createImageBitmap(blob));
        const texture = new XenoGL.Texture2D(textureSource);
        xgl.addTexture(texture);
        
        uMVMatrix = new XenoGL.Uniform('uMVMatrix');
        uPMatrix = new XenoGL.Uniform('uPMatrix');
        uTexture = new XenoGL.Uniform('uTexture');
        
        program.addUniform(uMVMatrix);
        program.addUniform(uPMatrix);
        program.addUniform(uTexture);
    }


    function animate() {
        draw();
        requestAnimationFrame(animate);
    }

    let rad = 0;
    async function draw() {

        rad += Math.PI * 1.0 / 180.0;

        const camera = new Vector3(0, 0, 50);
        const lookAt = new Vector3(0, 0, 0);
        const cameraUpDirection = new Vector3(0, 1, 0);
        const view = Matrix4.lookAt(camera, lookAt, cameraUpDirection);

        const pMatrix = Matrix4.perspective({fovYRadian: 45 * Math.PI/180, aspectRatio: window.innerWidth / window.innerHeight, near: 0.1, far: 1000});
        const identity = Matrix4.identity();
        const translation = Matrix4.translation(0, 0, 0);
        const axis = new Vector3(0, 1, 0).normalize();
        const q = Quaternion.rotationAround(axis, rad);
        const rotation = q.toRotationMatrix4();
        const mvMatrix = identity.mulByMatrix4(translation)
                                 .mulByMatrix4(view)
                                 .mulByMatrix4(rotation)

        if ( uMVMatrix !== undefined ) uMVMatrix.setMatrix(mvMatrix.values);
        if ( uPMatrix !== undefined ) uPMatrix.setMatrix(pMatrix.values);

        xgl.draw(XenoGL.TRIANGLES);
    }

    initWebGL();
    initShaders();
    initBuffers();
    animate();

});
