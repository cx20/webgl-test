const renderer = new CZPG.Renderer('c').setSize('100%', '100%');
const context = renderer.context;
const scene = new CZPG.Scene(renderer);

let camera = new CZPG.PerspectiveCamera(45, context.canvas.width/context.canvas.height, 0.01, 2000);
camera.transform.position = [0, 1, 50];
camera.updateViewMatrix();

$.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
    const vertexPositions = data.vertexPositions;
    const vertexTextureCoords = data.vertexTextureCoords;
    const vertexNormals = data.vertexNormals;
    const indices = data.indices;

    const attribArrays = {
        indices: { data: indices },
    };
    const textures = CZPG.createTextures(context, {pic: {
        src:"../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg",
        min : context.LINEAR_MIPMAP_LINEAR,
        mag : context.LINEAR}});

    attribArrays['a_position'] = { data: vertexPositions, numComponents: 3 };
    attribArrays['a_normal'] = { data: vertexNormals, numComponents: 3 };
    attribArrays['a_textureCoord'] = { data: vertexTextureCoords, numComponents: 2 };
    var mesh = new CZPG.Mesh('quad', attribArrays, {cullFace: false});
    var model = new CZPG.Model(mesh);
    var shader = new CZPG.Shader(context, 'vs', 'fs').setCamera(camera).setUniformObj({u_texture: textures.pic});

    scene.add({shader: shader, model: model});

    let resized = false;
    let rad = 0;
    let loop = new CZPG.Render(function(timespan) {
        resized = renderer.clear(0.0, 0.0, 0.0, 1.0).fixCanvasToDisplay(window.devicePixelRatio);
        if(resized) camera.updateProjMatrix( context.canvas.width / context.canvas.height );
        rad += Math.PI * 1 / 180;
        model.rotation = [0, rad, 0];
        scene.render();
    }).start();
});
