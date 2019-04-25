let { Asset, EntityMgr, Screen, MeshRenderer, Shader, Material, Mesh, Accessor, bufferView } = Ashes;

async function main() {
    let screen = new Screen('#screen');
    screen.bgColor = [1, 1, 1, 1];

    let scene = EntityMgr.create('root');
    document.querySelector('body').appendChild(scene);

    let triangle = scene.appendChild(EntityMgr.create('triangle'));

    // Load a material
    let vs = document.getElementById("vs").textContent;
    let fs = document.getElementById("fs").textContent;
    let macro = {};
    let shader = new Shader(vs, fs, macro);
    let triangleMat = new Material(shader);

    // Create a renderer component
    let triangleMR = new MeshRenderer(screen, new TriangleMesh(), triangleMat);

    EntityMgr.addComponent(triangle, triangleMR);
}

class TriangleMesh extends Mesh {
    constructor() {
        let meshVBO = new Float32Array([
             0.0, 0.5, 0.0, // v0 
            -0.5,-0.5, 0.0, // v1
             0.5,-0.5, 0.0  // v2
        ]);
        let meshEBO = new Uint16Array([
            0, 1, 2
        ]);
        let vbo = new bufferView(meshVBO.buffer, {
            byteOffset: meshVBO.byteOffset,
            byteLength: meshVBO.byteLength,
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
            count: 3
        }, 'POSITION');
        let indices = new Accessor({
            bufferView: ebo,
            componentType: WebGL2RenderingContext.UNSIGNED_SHORT,
            byteOffset: 0,
            type: "SCALAR",
            count: 3
        });
        super([position], indices);
    }
}

main();
