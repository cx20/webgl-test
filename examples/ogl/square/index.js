import {Renderer, Geometry, Program, Color, Mesh} from 'https://rawcdn.githack.com/oframe/ogl/1148a0941ce823dc6c342b3f54cce14cb6a14812/src/Core.js';

{
    const renderer = new Renderer();
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    gl.clearColor(1, 1, 1, 1);
    gl.disable(gl.CULL_FACE);

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize, false);
    resize();

    // Square data
    //             1.0 y 
    //              ^  -1.0 
    //              | / z
    //              |/       x
    // -1.0 -----------------> +1.0
    //            / |
    //      +1.0 /  |
    //           -1.0
    // 
    //        [0]------[1]
    //         |        |
    //         |        |
    //         |        |
    //        [2]------[3]
    //
    let positions = [ 
        -0.5, 0.5, 0.0, // v0
         0.5, 0.5, 0.0, // v1 
        -0.5,-0.5, 0.0, // v2
         0.5,-0.5, 0.0  // v3
    ];
    
    let colors = [ 
         1.0, 0.0, 0.0, 1.0, // v0
         0.0, 1.0, 0.0, 1.0, // v1
         0.0, 0.0, 1.0, 1.0, // v2
         1.0, 1.0, 0.0, 1.0  // v3
    ];
    
    let indices = [
        2, 0, 1, // v2-v0-v1
        2, 1, 3  // v2-v1-v3
    ];

    const geometry = new Geometry(gl, {
        position: {size: 3, data: new Float32Array(positions)},
        color: {size: 4, data: new Float32Array(colors)},
        index: {data: new Uint16Array(indices)}
    });

    const program = new Program(gl, {
        vertex: document.getElementById("vs").textContent,
        fragment: document.getElementById("fs").textContent,
        uniforms: {},
        cullFace: null
    });

    const mesh = new Mesh(gl, {geometry, program});

    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
        renderer.render({scene: mesh});
    }
}
