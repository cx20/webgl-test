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
    model: [{
        geo: {
            mode: "tri_strip",
            vtx_at: ["position"],
            vtx: [
                 0.0,  0.5, 0.0, 
                -0.5, -0.5, 0.0,
                 0.5, -0.5, 0.0
            ],
            idx: [
                0, 1, 2
            ]
        }
    }]
};
var wwg = new WWG();
wwg.init(document.getElementById('screen1'));
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
r.setRender(render).then(function() {
    console.log(r);
    r.draw();
}).catch(function(err) {
    console.log(err);
});
