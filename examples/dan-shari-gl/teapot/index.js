const vertexShaderSrc = document.getElementById("vs").textContent;
const fragmentShaderSrc = document.getElementById("fs").textContent;

let canvas = document.getElementById('c');
let gl = canvas.getContext('webgl');
document.body.appendChild(canvas);

let viewportWidth, viewportHeight;
let teapot = {};
let rad = 0;
let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

let camera = new dsr.PerspectiveCamera(
	window.innerWidth,
	window.innerHeight,
	45,
	0.1,
	1000
);
camera.updatePosition(0, 0, 35);
camera.updateLookAtPosition(0, 0, 0);
camera.updateViewMatrix();

let cameraController = new dsr.CameraController(camera);

resize();
window.addEventListener('resize', resize);

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
		teapot.matrix.mvMatrix,
		camera.viewMatrix,
		teapot.matrix.modelMatrix
	);
	mat4.multiply(
		teapot.matrix.mvpMatrix,
		camera.projectionMatrix,
		teapot.matrix.mvMatrix
	);
	
	mat4.rotate(
		teapot.matrix.mvpMatrix,
		teapot.matrix.mvpMatrix,
		rad, 
		[0, 1, 0]
	);	

	gl.clearColor(0, 0, 0, 1);
	gl.enable(gl.DEPTH_TEST);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.viewport(0, 0, viewportWidth, viewportHeight);

	gl.useProgram(teapot.progoram);

	dsr.bindBuffer(
		gl,
		teapot.buffers.position.buffer,
		teapot.buffers.position.location,
		3
	);
	dsr.bindBuffer(
		gl,
		teapot.buffers.textureCoord.buffer,
		teapot.buffers.textureCoord.location,
		2
	);
	dsr.bindBuffer(
		gl,
		teapot.buffers.normal.buffer,
		teapot.buffers.normal.location,
		3
	);

	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, teapot.buffers.index.buffer);

	gl.uniformMatrix4fv(teapot.uniforms.uMVPMatrix, false, teapot.matrix.mvpMatrix);
	
	gl.drawElements(gl.TRIANGLES, teapot.buffers.index.cnt, gl.UNSIGNED_SHORT, 0);

	loopId = requestAnimationFrame(tick);
}

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

	// create teapot
    {
        let img = new Image();
        img.onload = function(){
            texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
            gl.generateMipmap(gl.TEXTURE_2D);
            tick();
        };
        // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
        img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
        
        teapot.progoram = dsr.createProgram(gl, vertexShaderSrc, fragmentShaderSrc);
        teapot.buffers = {
            position: dsr.createBufferWithLocation(
                gl,
                teapot.progoram,
                new Float32Array(vertexPositions),
                'position'
            ),
            textureCoord: dsr.createBufferWithLocation(
                gl,
                teapot.progoram,
                new Float32Array(vertexTextureCoords),
                'textureCoord'
            ),
            normal: dsr.createBufferWithLocation(
                gl,
                teapot.progoram,
                new Float32Array(vertexNormals),
                'normal'
            ),
            index: dsr.createIndex(gl, new Uint16Array(indices))
        };
        teapot.matrix = {
            modelMatrix: mat4.create(),
            mvMatrix: mat4.create(),
            mvpMatrix: mat4.create()
        };
        teapot.uniforms = dsr.getUniformLocations(gl, teapot.progoram, ['uMVPMatrix', 'texture']);

    }
    //tick();
});
