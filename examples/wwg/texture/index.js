var render = {
    env: {
        clear_color: [1.0, 1.0, 1.0, 1.0]
    },
    vshader: {
        text: document.getElementById('vshader').innerText
    },
    fshader: {
        text: document.getElementById('fshader').innerText
    },
    vs_uni: {
        mvpMatrix: [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    },
    fs_uni:{
        tex: 0
    },
    texture: [{
        src: "../../../assets/textures/frog.jpg", // 256x256
        opt: {
            flevel: 2,
            anisotropy: 4
        }
    }],
    model: [{
        geo: {
            mode: "tri", // TRIANGLES
            vtx_at: ["position", "textureCoord"],
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
            vtx: [
                // Front face
                -0.5, -0.5,  0.5,   0.0, 0.0,
                 0.5, -0.5,  0.5,   1.0, 0.0,
                 0.5,  0.5,  0.5,   1.0, 1.0,
                -0.5,  0.5,  0.5,   0.0, 1.0,
                // Back face
                -0.5, -0.5, -0.5,   1.0, 0.0,
                 0.5, -0.5, -0.5,   1.0, 1.0,
                 0.5,  0.5, -0.5,   0.0, 1.0,
                -0.5,  0.5, -0.5,   0.0, 0.0,
                // Top face
                 0.5,  0.5,  0.5,   0.0, 1.0,
                -0.5,  0.5,  0.5,   0.0, 0.0,
                -0.5,  0.5, -0.5,   1.0, 0.0,
                 0.5,  0.5, -0.5,   1.0, 1.0,
                // Bottom face
                -0.5, -0.5,  0.5,   1.0, 1.0,
                 0.5, -0.5,  0.5,   0.0, 1.0,
                 0.5, -0.5, -0.5,   0.0, 0.0,
                -0.5, -0.5, -0.5,   1.0, 0.0,
                 // Right face
                 0.5, -0.5,  0.5,   1.0, 0.0,
                 0.5,  0.5,  0.5,   1.0, 1.0,
                 0.5,  0.5, -0.5,   0.0, 1.0,
                 0.5, -0.5, -0.5,   0.0, 0.0,
                 // Left face
                -0.5, -0.5,  0.5,   0.0, 0.0,
                -0.5,  0.5,  0.5,   1.0, 0.0,
                -0.5,  0.5, -0.5,   1.0, 1.0,
                -0.5, -0.5, -0.5,   0.0, 1.0
            ],
            idx: [
                 0,  1,  2,    0,  2 , 3,  // Front face
                 4,  5,  6,    4,  6 , 7,  // Back face
                 8,  9, 10,    8, 10, 11,  // Top face
                12, 13, 14,   12, 14, 15,  // Bottom face
                16, 17, 18,   16, 18, 19,  // Right face
                20, 21, 22,   20, 22, 23   // Left face
            ]
        }
    }]
};

var wwg = new WWG();
var can = document.getElementById('screen1');
wwg.init(can);
resizeCanvas();
window.addEventListener("resize", function(){
    resizeCanvas();
});

function resizeCanvas() {
    wwg.can.width = window.innerWidth;
    wwg.can.height = window.innerHeight;
    wwg.gl.viewport(0, 0, wwg.can.width, wwg.can.height);
}

var r = wwg.createRender();
var p = {
    camRX: 30,
    camRY: -30,
    rotX: 0,
    rotY: 0,
    ofsY: 0
};
r.setRender(render).then(function() {
    var st = new Date().getTime();
    var lt = st;
    var eyex = 0;
    var eyey = 0;
    var eyez = 3;
    var centerx = 0;
    var centery = 0;
    var centerz = 0;
    var upx = 0;
    var upy = 1;
    var upz = 0;
    var fovy = 40;
    var aspect = window.innerWidth / window.innerHeight;
    var zNear = 0.1;
    var zFar = 1000;
    (function loop() {
        window.requestAnimationFrame(loop);
        var ct = new Date().getTime();
        var tint = (ct - st);
        r.draw({
            vs_uni: {
                mvpMatrix: new CanvasMatrix4().
                    rotate(tint / 20 - 90, 1, 1, 0).    // rotate(angle,x,y,z)
                    lookat(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz).
                    perspective(fovy, aspect, zNear, zFar).
                    getAsWebGLFloatArray()
            }
        });
        lt = ct;
    })();
}).catch(function(err) {
    console.log(err);
});
