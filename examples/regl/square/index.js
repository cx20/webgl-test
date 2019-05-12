let regl = createREGL();

const drawTriangle = regl({
  frag: document.getElementById("fs").textContent,
  vert: document.getElementById("vs").textContent,
  attributes: {
    elements: [
        [0, 1, 2], 
        [2, 3, 1]
    ],
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
    //         |        |
    //         |        |
    //         |        |
    //        [2]------[3]
    //
    position: regl.buffer([
      [ -0.5, 0.5, 0.0 ], // v0
      [  0.5, 0.5, 0.0 ], // v1 
      [ -0.5,-0.5, 0.0 ], // v2
      [  0.5,-0.5, 0.0 ]  // v3
    ]),
    color : [ 
      [1.0, 0.0, 0.0, 1.0], // v0
      [0.0, 1.0, 0.0, 1.0], // v1
      [0.0, 0.0, 1.0, 1.0], // v2
      [1.0, 1.0, 0.0, 1.0]  // v3
    ]
 },
  primitive: "triangle strip",
  count: 4
})

regl.frame(({time}) => {
  regl.clear({
    color: [0, 0, 0, 0],
    depth: 1
  })

  drawTriangle({
  })
})
