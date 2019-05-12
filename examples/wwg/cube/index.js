let render = {
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
    model: [{
        geo: {
            mode: "tri", // TRIANGLES
            vtx_at: ["position", "color"],
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
                -0.5, -0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
                 0.5, -0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
                 0.5,  0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
                -0.5,  0.5,  0.5,   1.0, 0.0, 0.0, 1.0,
                // Back face
                -0.5, -0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
                 0.5, -0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
                 0.5,  0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
                -0.5,  0.5, -0.5,   1.0, 1.0, 0.0, 1.0,
                // Top face
                 0.5,  0.5,  0.5,   0.0, 1.0, 0.0, 1.0,
                -0.5,  0.5,  0.5,   0.0, 1.0, 0.0, 1.0,
                -0.5,  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
                 0.5,  0.5, -0.5,   0.0, 1.0, 0.0, 1.0,
                // Bottom face
                -0.5, -0.5,  0.5,   1.0, 0.5, 0.5, 1.0,
                 0.5, -0.5,  0.5,   1.0, 0.5, 0.5, 1.0,
                 0.5, -0.5, -0.5,   1.0, 0.5, 0.5, 1.0,
                -0.5, -0.5, -0.5,   1.0, 0.5, 0.5, 1.0,
                 // Right face
                 0.5, -0.5,  0.5,   1.0, 0.0, 1.0, 1.0,
                 0.5,  0.5,  0.5,   1.0, 0.0, 1.0, 1.0,
                 0.5,  0.5, -0.5,   1.0, 0.0, 1.0, 1.0,
                 0.5, -0.5, -0.5,   1.0, 0.0, 1.0, 1.0,
                 // Left face
                -0.5, -0.5,  0.5,   0.0, 0.0, 1.0, 1.0,
                -0.5,  0.5,  0.5,   0.0, 0.0, 1.0, 1.0,
                -0.5,  0.5, -0.5,   0.0, 0.0, 1.0, 1.0,
                -0.5, -0.5, -0.5,   0.0, 0.0, 1.0, 1.0
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

let wwg = new WWG();
let can = document.getElementById('screen1');
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

let r = wwg.createRender();
let p = {
    camRX: 30,
    camRY: -30,
    rotX: 0,
    rotY: 0,
    ofsY: 0
};
r.setRender(render).then(function() {
    let st = new Date().getTime();
    let lt = st;
    let eyex = 0;
    let eyey = 0;
    let eyez = 3;
    let centerx = 0;
    let centery = 0;
    let centerz = 0;
    let upx = 0;
    let upy = 1;
    let upz = 0;
    let fovy = 40;
    let aspect = window.innerWidth / window.innerHeight;
    let zNear = 0.1;
    let zFar = 1000;
    (function loop() {
        window.requestAnimationFrame(loop);
        let ct = new Date().getTime();
        let tint = (ct - st);
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
