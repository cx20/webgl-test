var GeometryFactory = gr.lib.fundamental.Geometry.GeometryFactory;
var Geometry = gr.lib.fundamental.Geometry.Geometry;
GeometryFactory.addType('custom', {}, function(gl,attrs){
  var geometry = new Geometry(gl);
  var position = [
     0.0,  0.5,  0.0,
    -0.5, -0.5,  0.0,
     0.5, -0.5,  0.0
  ];
  var indices = [0, 1, 2];
  geometry.addAttributes(position, {
    POSITION:{size: 3}
  });
  geometry.addIndex('default', indices, WebGLRenderingContext.TRIANGLES);
  return geometry;
});

gr(function() {
  var $$ = gr('#canvas');
});
