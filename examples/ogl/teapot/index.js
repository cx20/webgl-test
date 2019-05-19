import {Renderer, Geometry, Transform, Camera, Texture, Program, Color, Mesh} from 'https://rawcdn.githack.com/oframe/ogl/1148a0941ce823dc6c342b3f54cce14cb6a14812/src/Core.js';

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

// copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/Teapot.json
$.getJSON("../../../assets/json/teapot.json", function (data) {
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;

    const renderer = new Renderer();
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 1);
    gl.disable(gl.CULL_FACE);

    const camera = new Camera(gl, {fov: 45});
    camera.position.set(0, 1, 50);
    camera.lookAt([0, 0, 0]);

    function resize() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.perspective({aspect: gl.canvas.width / gl.canvas.height});
    }
    window.addEventListener('resize', resize, false);
    resize();
    
    const scene = new Transform();

    const texture = new Texture(gl);
    texture.wrapS = gl.REPEART;
    texture.wrapT = gl.REPEART;
    const img = new Image();

    img.onload = () => texture.image = img;
    // copy from: https://github.com/gpjt/webgl-lessons/blob/master/lesson14/arroway.de_metal%2Bstructure%2B06_d100_flat.jpg
    img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
    
    vertexPositions = data.vertexPositions;
    vertexTextureCoords = data.vertexTextureCoords;
    vertexNormals = data.vertexNormals;
    indices = data.indices;
    
    const geometry = new Geometry(gl, {
        position: {size: 3, data: new Float32Array(vertexPositions)},
        normal: {size: 3, data: new Float32Array(vertexNormals)},
        textureCoord: {size: 2, data: new Float32Array(vertexTextureCoords)},
        index: {data: new Uint16Array(indices)}
    });

    const program = new Program(gl, {
        vertex: document.getElementById("vs").textContent,
        fragment: document.getElementById("fs").textContent,
        uniforms: {
            texture: {value: texture},
            uPointLightingLocation: {value: [100.0, 0.0, 100.0]}
        },
        cullFace: null
    });

    const mesh = new Mesh(gl, {geometry, program});
    mesh.setParent(scene);

    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
        mesh.rotation.y += 0.01;
        renderer.render({scene, camera});
    }
});
