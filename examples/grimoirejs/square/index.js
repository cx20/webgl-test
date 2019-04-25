var GeometryFactory = gr.lib.fundamental.Geometry.GeometryFactory;
var Geometry = gr.lib.fundamental.Geometry.Geometry;
GeometryFactory.addType("custom", {}, function(gl,attrs){
  var geometry = new Geometry(gl);
  var positions = new Float32Array([
   -0.5,  0.5, 0.0, // v0
    0.5,  0.5, 0.0, // v1
   -0.5, -0.5, 0.0, // v2
    0.5, -0.5, 0.0  // v3
  ]);
  var colors = new Float32Array([
    1.0, 0.0, 0.0,  // v0
    0.0, 1.0, 0.0,  // v1
    0.0, 0.0, 1.0,  // v2
    1.0, 1.0, 0.0   // v3
  ]);
  geometry.addAttributes(positions, {
    POSITION:{
      size: 3
    }
  });
  geometry.addAttributes(colors, {
    COLOR:{
      size: 3
    }
  });
  var indices = [
    0, 2, 1,
    2, 3, 1
  ];
  geometry.addIndex("default", indices, WebGLRenderingContext.TRIANGLES);
  return geometry;
});

gr(function() {
  var $$ = gr('#canvas');
});
