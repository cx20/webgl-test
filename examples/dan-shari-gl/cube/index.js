const vertexShaderSrc = document.getElementById("vs").textContent;
const fragmentShaderSrc = document.getElementById("fs").textContent;

let canvas = document.getElementById('c');
let gl = canvas.getContext('webgl');
document.body.appendChild(canvas);

let viewportWidth, viewportHeight;
let cube = {};
let rad = 0;

let camera = new dsr.PerspectiveCamera(
	window.innerWidth,
	window.innerHeight,
	45,
	0.1,
	1000
);
camera.updatePosition(0, 0, 3);
camera.updateLookAtPosition(0, 0, 0);
camera.updateViewMatrix();

let cameraController = new dsr.CameraController(camera);

resize();
window.addEventListener('resize', resize);

// create cube
{
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
    let positions = [ 
        // Front face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        // Back face
        -0.5, -0.5, -0.5, // v4
         0.5, -0.5, -0.5, // v5
         0.5,  0.5, -0.5, // v6
        -0.5,  0.5, -0.5, // v7
        // Top face
         0.5,  0.5,  0.5, // v2
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5, // v7
         0.5,  0.5, -0.5, // v6
        // Bottom face
        -0.5, -0.5,  0.5, // v0
         0.5, -0.5,  0.5, // v1
         0.5, -0.5, -0.5, // v5
        -0.5, -0.5, -0.5, // v4
         // Right face
         0.5, -0.5,  0.5, // v1
         0.5,  0.5,  0.5, // v2
         0.5,  0.5, -0.5, // v6
         0.5, -0.5, -0.5, // v5
         // Left face
        -0.5, -0.5,  0.5, // v0
        -0.5,  0.5,  0.5, // v3
        -0.5,  0.5, -0.5, // v7
        -0.5, -0.5, -0.5  // v4
    ];
        
    let colors = [
        [1.0, 0.0, 0.0, 1.0], // Front face
        [1.0, 1.0, 0.0, 1.0], // Back face
        [0.0, 1.0, 0.0, 1.0], // Top face
        [1.0, 0.5, 0.5, 1.0], // Bottom face
        [1.0, 0.0, 1.0, 1.0], // Right face
        [0.0, 0.0, 1.0, 1.0]  // Left face
    ];
    let unpackedColors = [];
    for (let i in colors) {
        let color = colors[i];
        for (let j=0; j < 4; j++) {
            unpackedColors = unpackedColors.concat(color);
        }
    }
    let indices = [
         0,  1,  2,    0,  2 , 3,  // Front face
         4,  5,  6,    4,  6 , 7,  // Back face
         8,  9, 10,    8, 10, 11,  // Top face
        12, 13, 14,   12, 14, 15,  // Bottom face
        16, 17, 18,   16, 18, 19,  // Right face
        20, 21, 22,   20, 22, 23   // Left face
    ];
    
	cube.progoram = dsr.createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
	cube.buffers = {
		position: dsr.createBufferWithLocation(
			gl,
			cube.progoram,
			new Float32Array(positions),
			'position'
		),
		color: dsr.createBufferWithLocation(
			gl,
			cube.progoram,
			new Float32Array(unpackedColors),
			'color'
		),
		index: dsr.createIndex(gl, new Uint16Array(indices))
	};
	cube.matrix = {
		modelMatrix: mat4.create(),
		mvMatrix: mat4.create(),
		mvpMatrix: mat4.create()
	};
	cube.uniforms = dsr.getUniformLocations(gl, cube.progoram, ['uMVPMatrix']);

}

tick();

function resize() {
	viewportWidth = window.innerWidth;
	viewportHeight = window.innerHeight;
	canvas.width = viewportWidth;
	canvas.height = viewportHeight;
	if (camera) camera.updateSize(viewportWidth, viewportHeight);
}

function tick() {
	rad += Math.PI * 1.0 / 180.0;
	mat4.multiply(
		cube.matrix.mvMatrix,
		camera.viewMatrix,
		cube.matrix.modelMatrix
	);
	mat4.multiply(
		cube.matrix.mvpMatrix,
		camera.projectionMatrix,
		cube.matrix.mvMatrix
	);
	
	mat4.rotate(
		cube.matrix.mvpMatrix,
		cube.matrix.mvpMatrix,
		rad, 
		[1, 1, 1]
	);	

	gl.clearColor(1, 1, 1, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, viewportWidth, viewportHeight);

	gl.useProgram(cube.progoram);

	dsr.bindBuffer(
		gl,
		cube.buffers.position.buffer,
		cube.buffers.position.location,
		3
	);
	dsr.bindBuffer(
		gl,
		cube.buffers.color.buffer,
		cube.buffers.color.location,
		4
	);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.buffers.index.buffer);

	gl.uniformMatrix4fv(cube.uniforms.uMVPMatrix, false, cube.matrix.mvpMatrix);

	gl.drawElements(gl.TRIANGLES, cube.buffers.index.cnt, gl.UNSIGNED_SHORT, 0);

	loopId = requestAnimationFrame(tick);
}
