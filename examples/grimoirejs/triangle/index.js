let GeometryFactory = gr.lib.fundamental.Geometry.GeometryFactory;
let Geometry = gr.lib.fundamental.Geometry.Geometry;
GeometryFactory.addType('custom', {}, function(gl,attrs){
  let geometry = new Geometry(gl);
  let position = [
     0.0,  0.5,  0.0,
    -0.5, -0.5,  0.0,
     0.5, -0.5,  0.0
  ];
  let indices = [0, 1, 2];
  geometry.addAttributes(position, {
    POSITION:{size: 3}
  });
  geometry.addIndex('default', indices, WebGLRenderingContext.TRIANGLES);
  return geometry;
});

gr(function() {
  let $$ = gr('#canvas');
});
