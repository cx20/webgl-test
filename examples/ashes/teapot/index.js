let { Asset, EntityMgr, Camera, vec3, mat4, quat, Screen, MeshRenderer, Shader, Material, Mesh, Accessor, bufferView } = Ashes;

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    let vertexPositions = data.vertexPositions;
    let vertexTextureCoords = data.vertexTextureCoords;
    let vertexNormals = data.vertexNormals;
    let indices = data.indices;
    let len = vertexPositions.length / 3;

    async function main() {
        let screen = new Screen('#screen');
        screen.bgColor = [0, 0, 0, 1];

        let scene = EntityMgr.create('root');

        // Camera
        let mainCamera = EntityMgr.create('camera');
        let cam = EntityMgr.addComponent(mainCamera, new Camera(screen.width / screen.height));

        // Set default position
        let cameraTrans = mainCamera.components.Transform;
        vec3.set(cameraTrans.translate, 0, 0, 25);

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
        let frog = await Asset.loadTexture('../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg', { minFilter: screen.gl.NEAREST_MIPMAP_NEAREST });

        // Create a renderer component
        let textureMR = new MeshRenderer(screen, new TextureMesh(), textureMat);

        EntityMgr.addComponent(custom, textureMR);
        Material.setTexture(textureMat, 'texture', frog);
        
        let angle = 0;
        let loop = () => {
            requestAnimationFrame(loop);
            quat.fromEuler(custom.components.Transform.quaternion, 0, angle++, 0);
        };
        loop();
    }

    class TextureMesh extends Mesh {
        constructor() {

            let meshVBO = new Float32Array(vertexPositions);
            let normalVBO = new Float32Array(vertexNormals);
            let uvVBO = new Float32Array(vertexTextureCoords);
            let meshEBO = new Uint16Array(indices);
            let vbo = new bufferView(meshVBO.buffer, {
                byteOffset: meshVBO.byteOffset,
                byteLength: meshVBO.byteLength,
                byteStride: 0,
                target: WebGL2RenderingContext.ARRAY_BUFFER
            });
            let normalVbo = new bufferView(normalVBO.buffer, {
                byteOffset: normalVBO.byteOffset,
                byteLength: normalVBO.byteLength,
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
                count: len
            }, 'POSITION');
            let normal = new Accessor({
                bufferView: normalVbo,
                componentType: WebGL2RenderingContext.FLOAT,
                byteOffset: 0,
                type: "VEC3",
                count: len
            }, 'NORMAL');
            let uv = new Accessor({
                bufferView: uvVbo,
                componentType: WebGL2RenderingContext.FLOAT,
                byteOffset: 0,
                type: "VEC2",
                count: len
            }, 'TEXCOORD_0');
            let indices_ = new Accessor({
                bufferView: ebo,
                componentType: WebGL2RenderingContext.UNSIGNED_SHORT,
                byteOffset: 0,
                type: "SCALAR",
                count: indices.length
            });
            super([position, normal, uv], indices_, WebGL2RenderingContext.TRIANGLES);
        }
    }

    main();

});

