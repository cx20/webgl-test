let regl = createREGL();

const drawTriangle = regl({
  frag: document.getElementById("fs").textContent,
  vert: document.getElementById("vs").textContent,
  attributes: {
    position: regl.buffer([
      [ 0.0,  0.5],
      [-0.5, -0.5],
      [ 0.5, -0.5]
    ])
  },
  uniforms: {
    color: regl.prop('color')
  },
  count: 3
})

regl.frame(({time}) => {
  regl.clear({
    color: [0, 0, 0, 0],
    depth: 1
  })

  drawTriangle({
    color: [0, 0, 1, 1]
  })
})
