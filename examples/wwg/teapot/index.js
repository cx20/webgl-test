// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    var vertexPositions = data.vertexPositions;
    var vertexTextureCoords = data.vertexTextureCoords;
    var vertexNormals = data.vertexNormals;
    var indices = data.indices;

    var interleaveDataBuffer = [];
    var len = vertexPositions.length / 3;
    for (var i = 0; i < len; i++ ) {
        interleaveDataBuffer.push(vertexPositions[i*3+0]);
        interleaveDataBuffer.push(vertexPositions[i*3+1]);
        interleaveDataBuffer.push(vertexPositions[i*3+2]);
        interleaveDataBuffer.push(vertexNormals[i*3+0]);
        interleaveDataBuffer.push(vertexNormals[i*3+1]);
        interleaveDataBuffer.push(vertexNormals[i*3+2]);
        interleaveDataBuffer.push(vertexTextureCoords[i*2+0]);
        interleaveDataBuffer.push(vertexTextureCoords[i*2+1]);
    }

    var render = {
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
        var eyez = 50;
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
