let render = {
    env: {
        clear_color: [0.0, 0.0, 0.0, 1.0]
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
        ],
        lightVec: [1.0, 1.0, 1.0],
    },
    fs_uni:{
        color: [1.0, 1.0, 1.0, 1.0],
        tex: 0,
    },
    texture: [{
        src: "../../../assets/textures/earth.jpg", // 256x256
        opt: {
            flevel: 2,
            anisotropy: 4
        }
    }],
    model: [{
        geo: new WWModel().primitive("box", {wz: 1.0}).objModel()
    }, {
        geo: new WWModel().primitive("sphere", {wz: 1.0}).objModel()
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
    let eyez = 10;
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
            model: [{
                vs_uni: {
                    mvpMatrix: new CanvasMatrix4().
                    rotate(tint / 20 - 90, 0, 1, 0). // rotate(angle,x,y,z)
                    translate(-1.5, 0, 0).
                    lookat(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz).
                    perspective(fovy, aspect, zNear, zFar).
                    getAsWebGLFloatArray(),
                    invMatrix: new CanvasMatrix4().invert().getAsWebGLFloatArray()
                }
            }, {
                vs_uni: {
                    mvpMatrix: new CanvasMatrix4().
                    rotate(tint / 20 - 90, 0, 1, 0). // rotate(angle,x,y,z)
                    translate(1.5, 0, 0).
                    lookat(eyex, eyey, eyez, centerx, centery, centerz, upx, upy, upz).
                    perspective(fovy, aspect, zNear, zFar).
                    getAsWebGLFloatArray(),
                    invMatrix: new CanvasMatrix4().invert().getAsWebGLFloatArray()
                }
            }]
        });
        lt = ct;
    })();
}).catch(function(err) {
    console.log(err);
});
