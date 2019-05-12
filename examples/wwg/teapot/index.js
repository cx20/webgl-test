// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    let vertexPositions = data.vertexPositions;
    let vertexTextureCoords = data.vertexTextureCoords;
    let vertexNormals = data.vertexNormals;
    let indices = data.indices;

    let interleaveDataBuffer = [];
    let len = vertexPositions.length / 3;
    for (let i = 0; i < len; i++ ) {
        interleaveDataBuffer.push(vertexPositions[i*3+0]);
        interleaveDataBuffer.push(vertexPositions[i*3+1]);
        interleaveDataBuffer.push(vertexPositions[i*3+2]);
        interleaveDataBuffer.push(vertexNormals[i*3+0]);
        interleaveDataBuffer.push(vertexNormals[i*3+1]);
        interleaveDataBuffer.push(vertexNormals[i*3+2]);
        interleaveDataBuffer.push(vertexTextureCoords[i*2+0]);
        interleaveDataBuffer.push(vertexTextureCoords[i*2+1]);
    }

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
            ]
        },
        fs_uni:{
            tex: 0
        },
        texture: [{
            // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
            src: "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg",
            opt: {
                flevel: 2,
                anisotropy: 4
            }
        }],
        model: [{
            geo: {
                mode: "tri", // TRIANGLES
                vtx_at: ["position", "normal", "textureCoord"],
                vtx: interleaveDataBuffer,
                idx: indices
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
        let eyez = 50;
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
                        rotate(tint / 20 - 90, 0, 1, 0).    // rotate(angle,x,y,z)
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

});
