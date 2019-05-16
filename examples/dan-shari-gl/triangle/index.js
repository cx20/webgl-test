const vertexShaderSrc = document.getElementById("vs").textContent;
const fragmentShaderSrc = document.getElementById("fs").textContent;

let canvas = document.getElementById('c');
let gl = canvas.getContext('webgl');
document.body.appendChild(canvas);

let viewportWidth, viewportHeight;
let triangle = {};

resize();
window.addEventListener('resize', resize);

// create triangle
{
	let positions = [ 
	     0.0, 0.5, 0.0, // v0
	    -0.5,-0.5, 0.0, // v1
	     0.5,-0.5, 0.0  // v2
	];
		
	triangle.progoram = dsr.createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
	triangle.buffers = {
		position: dsr.createBufferWithLocation(
			gl,
			triangle.progoram,
			new Float32Array(positions),
			'position'
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

	gl.useProgram(triangle.progoram);

	dsr.bindBuffer(
		gl,
		triangle.buffers.position.buffer,
		triangle.buffers.position.location,
		3
	);
	gl.drawArrays(gl.TRIANGLES, 0, 3);

	loopId = requestAnimationFrame(tick);
}
