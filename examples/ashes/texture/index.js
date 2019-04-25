let { Asset, EntityMgr, Camera, vec3, mat4, quat, Screen, MeshRenderer, Shader, Material, Mesh, Accessor, bufferView } = Ashes;

async function main() {
    let screen = new Screen('#screen');
    screen.bgColor = [1, 1, 1, 1];

    let scene = EntityMgr.create('root');

    // Camera
    let mainCamera = EntityMgr.create('camera');
    let cam = EntityMgr.addComponent(mainCamera, new Camera(screen.width / screen.height));

    // Set default position
    let cameraTrans = mainCamera.components.Transform;
    vec3.set(cameraTrans.translate, 0, 0, 1.5);

    // Add it to scene
    scene.appendChild(mainCamera);
    screen.mainCamera = cam;
    
    document.querySelector('body').appendChild(scene);

    let custom = scene.appendChild(EntityMgr.create('custom'));

    // Load a material
    let vs = document.getElementById("vs").textContent;
    let fs = document.getElementById("fs").textContent;
    let macro = {};
    let shader = new Shader(vs, fs, macro);
    let textureMat = new Material(shader);
    textureMat.doubleSided = true;
    let frog = await Asset.loadTexture('../../../assets/textures/frog.jpg', { minFilter: screen.gl.NEAREST_MIPMAP_NEAREST });

    // Create a renderer component
    let textureMR = new MeshRenderer(screen, new TextureMesh(), textureMat);

    EntityMgr.addComponent(custom, textureMR);
    Material.setTexture(textureMat, 'texture', frog);
    
    let angle = 0;
    let loop = () => {
        requestAnimationFrame(loop);
        quat.fromEuler(custom.components.Transform.quaternion, angle++, angle++, angle++);
    };
    loop();
}

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
class TextureMesh extends Mesh {
    constructor() {
        let meshVBO = new Float32Array([
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
        ]);
        let uvVBO = new Float32Array([
            // Front face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Back face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Top face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Bottom face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Right face
            1, 0,
            0, 0,
            0, 1,
            1, 1,
            // Left face
            1, 0,
            0, 0,
            0, 1,
            1, 1
        ]);
        let meshEBO = new Uint16Array([
             0,  1,  2,    0,  2 , 3,  // Front face
             4,  5,  6,    4,  6 , 7,  // Back face
             8,  9, 10,    8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15,  // Bottom face
            16, 17, 18,   16, 18, 19,  // Right face
            20, 21, 22,   20, 22, 23   // Left face
        ]);
        let vbo = new bufferView(meshVBO.buffer, {
            byteOffset: meshVBO.byteOffset,
            byteLength: meshVBO.byteLength,
            byteStride: 0,
            target: WebGL2RenderingContext.ARRAY_BUFFER
        });
        let uvVbo = new bufferView(uvVBO.buffer, {
            byteOffset: uvVBO.byteOffset,
            byteLength: uvVBO.byteLength,
            byteStride: 0,
            target: WebGL2RenderingContext.ARRAY_BUFFER
        });
        let ebo = new bufferView(meshEBO.buffer, {
            byteOffset: meshEBO.byteOffset,
            byteLength: meshEBO.byteLength,
            byteStride: 0,
            target: WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER
        });
        let position = new Accessor({
            bufferView: vbo,
            componentType: WebGL2RenderingContext.FLOAT,
            byteOffset: 0,
            type: "VEC3",
            count: 24
        }, 'POSITION');
        let uv = new Accessor({
            bufferView: uvVbo,
            componentType: WebGL2RenderingContext.FLOAT,
            byteOffset: 0,
            type: "VEC2",
            count: 24
        }, 'TEXCOORD_0');
        let indices = new Accessor({
            bufferView: ebo,
            componentType: WebGL2RenderingContext.UNSIGNED_SHORT,
            byteOffset: 0,
            type: "SCALAR",
            count: 36
        });
        super([position, uv], indices, WebGL2RenderingContext.TRIANGLES);
    }
}

main();
