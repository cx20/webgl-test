function init()
{
	//create the rendering context
	var container = document.body;

	var gl = GL.create({width: container.offsetWidth, height: container.offsetHeight});
	resizeCanvas();
	window.addEventListener("resize", function(){
		resizeCanvas();
	});

	function resizeCanvas() {
		gl.canvas.width = window.innerWidth;
		gl.canvas.height = window.innerHeight;
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
	}

	container.appendChild(gl.canvas);
	gl.animate();

	//build the mesh
	var objects = [];
	for(var i = 0; i < 3; i++)
	{
		var object = {};
		object.primitive = gl.TRIANGLES;
		object.model = mat4.create();
		objects.push(object);
	}

	objects[0].mesh = GL.Mesh.plane({size:1});
	objects[1].mesh = GL.Mesh.cube({size:1});
	objects[2].mesh = GL.Mesh.sphere({size:0.5});

	var texture = GL.Texture.fromURL("../../../assets/textures/earth.jpg",{minFilter: gl.LINEAR_MIPMAP_LINEAR});

	//create basic matrices for cameras and transformation
	var proj = mat4.create();
	var view = mat4.create();
	var model = mat4.create();
	var mvp = mat4.create();
	var temp = mat4.create();

	mat4.translate( objects[0].model, objects[0].model, [-1.5, 0.0, 5] );
	mat4.translate( objects[1].model, objects[1].model, [ 0.0, 0.0, 5] );
	mat4.translate( objects[2].model, objects[2].model, [ 1.5, 0.0, 5] );

	//set the camera position
	mat4.perspective(proj, 45 * DEG2RAD, gl.canvas.width / gl.canvas.height, 0.1, 1000);
	mat4.lookAt(view, [0,0,10],[0,0,0], [0,1,0]);

	//basic phong shader
	var shader = new Shader(
		document.getElementById("vs").textContent,
		document.getElementById("fs").textContent
	);

	var uniforms = {
		u_color: [1,1,1,1],
		u_lightvector: vec3.normalize(vec3.create(),[1,1,1]),
		u_model: model,
		u_mvp: mvp,
		u_texture: 0
	};

	//generic gl flags and settings
	gl.clearColor(0.0, 0.0, 0.0, 1);
	gl.enable( gl.DEPTH_TEST );

	//rendering loop
	gl.ondraw = function()
	{
		gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

		//compute rotation matrix for normals
		texture.bind(0);

		//create modelview and projection matrices
		for(var i in objects)
		{
			var object = objects[i];
			mat4.multiply(temp, view, object.model);
			mat4.multiply(mvp, proj, temp);

			//render mesh using the shader
			uniforms.u_model = object.model;
			shader.uniforms(uniforms).draw(object.mesh, object.primitive);
		}
	};

	//update loop
	gl.onupdate = function(dt)
	{
		//rotate mesh
		mat4.rotateY(objects[0].model, objects[0].model, dt*1.0);
		mat4.rotateY(objects[1].model, objects[1].model, dt*1.0);
		mat4.rotateY(objects[2].model, objects[2].model, dt*1.0);
	};
}	

init();
