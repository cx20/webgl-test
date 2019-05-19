import {Renderer, Geometry, Program, Color, Mesh} from 'https://rawcdn.githack.com/oframe/ogl/1148a0941ce823dc6c342b3f54cce14cb6a14812/src/Core.js';

{
    const renderer = new Renderer();
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    gl.clearColor(1, 1, 1, 1);

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    window.addEventListener('resize', resize, false);
    resize();

    let positions = [ 
         0.0, 0.5, 0.0, // v0
        -0.5,-0.5, 0.0, // v1
         0.5,-0.5, 0.0  // v2
    ];
    
    const geometry = new Geometry(gl, {
        position: {size: 3, data: new Float32Array(positions)},
    });

    const program = new Program(gl, {
        vertex: document.getElementById("vs").textContent,
        fragment: document.getElementById("fs").textContent,
        uniforms: {}
    });

    const mesh = new Mesh(gl, {geometry, program});

    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
        renderer.render({scene: mesh});
    }
}
