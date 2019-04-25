let { Asset, EntityMgr, Screen, MeshRenderer, Shader, Material, Mesh, Accessor, bufferView } = Ashes;

async function main() {
    let screen = new Screen('#screen');
    screen.bgColor = [1, 1, 1, 1];

    let scene = EntityMgr.create('root');
    document.querySelector('body').appendChild(scene);

    let custom = scene.appendChild(EntityMgr.create('custom'));

    // Load a material
    let vs = document.getElementById("vs").textContent;
    let fs = document.getElementById("fs").textContent;
    let macro = {};
    let shader = new Shader(vs, fs, macro);
    let colorMat = new Material(shader);

    // Create a renderer component
    let colorMR = new MeshRenderer(screen, new ColorMesh(), colorMat);

    EntityMgr.addComponent(custom, colorMR);
}

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
//         |      / |
//         |    /   |
//         |  /     |
//        [2]------[3]
//
class ColorMesh extends Mesh {
    constructor() {
        let meshVBO = new Float32Array([
            -0.5, 0.5, 0.0, // v0
             0.5, 0.5, 0.0, // v1 
            -0.5,-0.5, 0.0, // v2
             0.5,-0.5, 0.0  // v3
        ]);
        let colorVBO = new Float32Array([
            1.0, 0.0, 0.0, 1.0, // v0
            0.0, 1.0, 0.0, 1.0, // v1
            0.0, 0.0, 1.0, 1.0, // v2
            1.0, 1.0, 0.0, 1.0  // v3
        ]);
        let meshEBO = new Uint16Array([
            2, 0, 1, // v2-v0-v1
            2, 1, 3  // v2-v1-v3
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
            count: 4
        }, 'POSITION');
        let color = new Accessor({
            bufferView: cvbo,
            componentType: WebGL2RenderingContext.FLOAT,
            byteOffset: 0,
            type: "VEC4",
            count: 4
        }, 'COLOR_0');
        let indices = new Accessor({
            bufferView: ebo,
            componentType: WebGL2RenderingContext.UNSIGNED_SHORT,
            byteOffset: 0,
            type: "SCALAR",
            count: 6
        });
        super([position, color], indices, WebGL2RenderingContext.TRIANGLE_STRIP);
    }
}

main();
