let prg;
let VBO;

let position = [ 
     0.0, 0.5, 0.0, // v0
    -0.5,-0.5, 0.0, // v1
     0.5,-0.5, 0.0  // v2
];

function init() {
    gl3.init('c');
    prg = gl3.createProgramFromId(
        'vs',
        'fs',
        ['position'],
        [3],
        [],
        []
    );
    
    VBO = [
        gl3.createVbo(position)
    ];

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

function render(){
    prg.useProgram();
    prg.setAttribute(VBO);

    gl3.drawArrays(gl3.gl.TRIANGLES, 3);
}

init();
render();
