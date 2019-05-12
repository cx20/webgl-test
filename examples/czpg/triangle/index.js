const renderer = new CZPG.Renderer('c').setSize('100%', '100%').clear(1.0, 1.0, 1.0, 1.0);
const context = renderer.context;

const positions = [ 
    0.0,  0.5, 0.0, 
   -0.5, -0.5, 0.0, 
    0.5, -0.5, 0.0 
];
const attribArrays = {};
attribArrays['position'] = { data: positions, numComponents: 3 };
let mesh = new CZPG.Mesh('triangle', attribArrays);
let model = new CZPG.Model(mesh);
let shader = new CZPG.Shader(context, 'vs', 'fs');

shader.renderModel(model);
