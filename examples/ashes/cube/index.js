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
    let colorMat = new Material(shader);
    colorMat.doubleSided = true;

    // Create a renderer component
    let colorMR = new MeshRenderer(screen, new ColorMesh(), colorMat);

    EntityMgr.addComponent(custom, colorMR);
    
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
class ColorMesh extends Mesh {
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
        let colorVBO = new Float32Array([
            1.0, 0.0, 0.0, 1.0, // Front face
            1.0, 0.0, 0.0, 1.0, // Front face
            1.0, 0.0, 0.0, 1.0, // Front face
            1.0, 0.0, 0.0, 1.0, // Front face
            1.0, 1.0, 0.0, 1.0, // Back face
            1.0, 1.0, 0.0, 1.0, // Back face
            1.0, 1.0, 0.0, 1.0, // Back face
            1.0, 1.0, 0.0, 1.0, // Back face
            0.0, 1.0, 0.0, 1.0, // Top face
            0.0, 1.0, 0.0, 1.0, // Top face
            0.0, 1.0, 0.0, 1.0, // Top face
            0.0, 1.0, 0.0, 1.0, // Top face
            1.0, 0.5, 0.5, 1.0, // Bottom face
            1.0, 0.5, 0.5, 1.0, // Bottom face
            1.0, 0.5, 0.5, 1.0, // Bottom face
            1.0, 0.5, 0.5, 1.0, // Bottom face
            1.0, 0.0, 1.0, 1.0, // Right face
            1.0, 0.0, 1.0, 1.0, // Right face
            1.0, 0.0, 1.0, 1.0, // Right face
            1.0, 0.0, 1.0, 1.0, // Right face
            0.0, 0.0, 1.0, 1.0, // Left face
            0.0, 0.0, 1.0, 1.0, // Left face
            0.0, 0.0, 1.0, 1.0, // Left face
            0.0, 0.0, 1.0, 1.0  // Left face
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
        let cvbo = new bufferView(colorVBO.buffer, {
            byteOffset: colorVBO.byteOffset,
            byteLength: colorVBO.byteLength,
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
        let color = new Accessor({
            bufferView: cvbo,
            componentType: WebGL2RenderingContext.FLOAT,
            byteOffset: 0,
            type: "VEC4",
            count: 24
        }, 'COLOR_0');
        let indices = new Accessor({
            bufferView: ebo,
            componentType: WebGL2RenderingContext.UNSIGNED_SHORT,
            byteOffset: 0,
            type: "SCALAR",
            count: 36
        });
        super([position, color], indices, WebGL2RenderingContext.TRIANGLES);
    }
}

main();
