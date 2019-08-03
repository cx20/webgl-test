import {Renderer, Geometry, Transform, Camera, Texture, Program, Color, Mesh} from 'https://rawcdn.githack.com/oframe/ogl/c9842ecd96e7de54397b1add70709e1efd8ebf4d/src/Core.js';
import {Plane, Box, Sphere} from 'https://rawcdn.githack.com/oframe/ogl/c9842ecd96e7de54397b1add70709e1efd8ebf4d/src/Extras.js';

{
    const renderer = new Renderer({dpr: 2});
    const gl = renderer.gl;
    document.body.appendChild(gl.canvas);
    gl.clearColor(0, 0, 0, 1);
    gl.disable(gl.CULL_FACE);

    const camera = new Camera(gl, {fov: 45});
    camera.position.set(0, 1, 5);
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
    img.src = "../../../assets/textures/earth.jpg";

    const program = new Program(gl, {
        vertex: document.getElementById("vs").textContent,
        fragment: document.getElementById("fs").textContent,
        uniforms: {
            texture: {value: texture},
        },
        cullFace: null
    });

    // plane
    const geometryPlane = new Plane(gl);
    const meshPlane = new Mesh(gl, {geometry: geometryPlane, program});
    meshPlane.position.set(-1.5, 0.0, 0.0);
    meshPlane.setParent(scene);

    // cube
    const geometryCube = new Box(gl);
    const meshCube = new Mesh(gl, {geometry: geometryCube, program});
    meshCube.position.set(0.0, 0.0, 0.0);
    meshCube.setParent(scene);

    // sphere
    const geometrySphere = new Sphere(gl);
    const meshSphere = new Mesh(gl, {geometry: geometrySphere, program});
    meshSphere.position.set(1.5, 0.0, 0.0);
    meshSphere.setParent(scene);

    requestAnimationFrame(update);
    function update(t) {
        requestAnimationFrame(update);
        meshPlane.rotation.y += 0.01;
        meshCube.rotation.y += 0.01;
        meshSphere.rotation.y += 0.01;
        renderer.render({scene, camera});
    }
}
