var prg;
var VBO;
var IBO;
var mat4 = gl3.Math.Mat4;
var mMatrix;
var vMatrix;
var pMatrix;
var vpMatrix;
var mvpMatrix;
var rad = 0;

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    var vertexPositions = data.vertexPositions;
    var vertexTextureCoords = data.vertexTextureCoords;
    var vertexNormals = data.vertexNormals;
    var indices = data.indices;

    function init(){
        gl3.init('c');
        VBO = [
            gl3.createVbo(vertexPositions), 
            gl3.createVbo(vertexTextureCoords),
            gl3.createVbo(vertexNormals)
        ];
        IBO = gl3.createIbo(indices);
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
        var cameraPosition = [0.0, 0.0, 40.0];
        var centerPoint    = [0.0, 0.0, 0.0];
        var cameraUp       = [0.0, 1.0, 0.0];
        mat4.lookAt(cameraPosition, centerPoint, cameraUp, vMatrix);

        var fovy = 30;
        var aspect = gl3.canvas.width / gl3.canvas.height;
        var near = 0.1;
        var far = 1000.0;
        mat4.perspective(fovy, aspect, near, far, pMatrix);

        var axis = [0.0, 1.0, 0.0];
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


