const vertexShaderSrc = document.getElementById("vs").textContent;
const fragmentShaderSrc = document.getElementById("fs").textContent;

let canvas = document.getElementById('c');
let gl = canvas.getContext('webgl');
document.body.appendChild(canvas);

let viewportWidth, viewportHeight;
let square = {};

resize();
window.addEventListener('resize', resize);

// create square
{
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
	square.progoram = dsr.createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
	square.buffers = {
		position: dsr.createBufferWithLocation(
			gl,
			square.progoram,
			new Float32Array(positions),
			'position'
		),
		color: dsr.createBufferWithLocation(
			gl,
			square.progoram,
			new Float32Array(colors),
			'color'
		),
	};
}

tick();

function resize() {
	viewportWidth = window.innerWidth;
	viewportHeight = window.innerHeight;
	canvas.width = viewportWidth;
	canvas.height = viewportHeight;
}

function tick() {
	gl.clearColor(1, 1, 1, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, viewportWidth, viewportHeight);

	gl.useProgram(square.progoram);

	dsr.bindBuffer(
		gl,
		square.buffers.position.buffer,
		square.buffers.position.location,
		3
	);
	dsr.bindBuffer(
		gl,
		square.buffers.color.buffer,
		square.buffers.color.location,
		4
	);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	loopId = requestAnimationFrame(tick);
}
