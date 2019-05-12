let prg;
let VBO;
let IBO;
let mat4 = gl3.Math.Mat4;
let mMatrix;
let vMatrix;
let pMatrix;
let vpMatrix;
let mvpMatrix;
let rad = 0;

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    let vertexPositions = data.vertexPositions;
    let vertexTextureCoords = data.vertexTextureCoords;
    let vertexNormals = data.vertexNormals;
    let indices = data.indices;

    function init(){
        gl3.init('c');
        VBO = [
            gl3.createVbo(vertexPositions), 
            gl3.createVbo(vertexTextureCoords),
            gl3.createVbo(vertexNormals)
        ];
        IBO = gl3.createIbo(indices);
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        gl3.createTextureFromFile('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg',  0, initShader);

        resizeCanvas();

        window.addEventListener("resize", function(){
            resizeCanvas();
        });
    }

    function resizeCanvas() {
        gl3.canvas.width = window.innerWidth;
        gl3.canvas.height = window.innerHeight;
        gl3.gl.viewport(0, 0, gl3.canvas.width, gl3.canvas.height);
    }

    function initShader() {
        prg = gl3.createProgramFromId(
            'vs',
            'fs',
            ['position' ,'texcoord', 'normal'],
            [3, 2, 3],
            ['mvpMatrix', 'texture'],
            ['matrix4fv', '1i']
        );
        gl3.gl.activeTexture(gl3.gl.TEXTURE0);
        gl3.gl.bindTexture(gl3.gl.TEXTURE_2D, gl3.textures[0].texture);
        gl3.gl.texParameteri(gl3.gl.TEXTURE_2D, gl3.gl.TEXTURE_WRAP_S, gl3.gl.REPEAT);
        gl3.gl.texParameteri(gl3.gl.TEXTURE_2D, gl3.gl.TEXTURE_WRAP_T, gl3.gl.REPEAT);

        mMatrix = mat4.identity(mat4.create());
        vMatrix = mat4.identity(mat4.create());
        pMatrix = mat4.identity(mat4.create());
        vpMatrix = mat4.identity(mat4.create());
        mvpMatrix = mat4.identity(mat4.create());

        gl3.gl.enable(gl3.gl.DEPTH_TEST);

        render();
    }

    function render(){
        rad += Math.PI * 1.0 / 180.0;

        prg.useProgram();
        prg.setAttribute(VBO, IBO);
        let cameraPosition = [0.0, 0.0, 50.0];
        let centerPoint    = [0.0, 0.0, 0.0];
        let cameraUp       = [0.0, 1.0, 0.0];
        mat4.lookAt(cameraPosition, centerPoint, cameraUp, vMatrix);

        let fovy = 45;
        let aspect = gl3.canvas.width / gl3.canvas.height;
        let near = 0.1;
        let far = 1000.0;
        mat4.perspective(fovy, aspect, near, far, pMatrix);

        let axis = [0.0, 1.0, 0.0];
        mat4.identity(mMatrix);
        mat4.rotate(mMatrix, rad, axis, mMatrix);
        mat4.multiply(pMatrix, vMatrix, vpMatrix);
        mat4.multiply(vpMatrix, mMatrix, mvpMatrix);

        prg.pushShader([mvpMatrix]);

        gl3.drawElements(gl3.gl.TRIANGLES, indices.length);

        requestAnimationFrame(render);
    }

    init();
});


