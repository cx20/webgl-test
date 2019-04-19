var regl = createREGL();

var position = [
  [-0.5, +0.5, +0.5], [+0.5, +0.5, +0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5], // positive z face.
  [+0.5, +0.5, +0.5], [+0.5, +0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], // positive x face
  [+0.5, +0.5, -0.5], [-0.5, +0.5, -0.5], [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], // negative z face
  [-0.5, +0.5, -0.5], [-0.5, +0.5, +0.5], [-0.5, -0.5, +0.5], [-0.5, -0.5, -0.5], // negative x face.
  [-0.5, +0.5, -0.5], [+0.5, +0.5, -0.5], [+0.5, +0.5, +0.5], [-0.5, +0.5, +0.5], // top face
  [-0.5, -0.5, -0.5], [+0.5, -0.5, -0.5], [+0.5, -0.5, +0.5], [-0.5, -0.5, +0.5]  // bottom face
]

const indices = [
  [2, 1, 0], [2, 0, 3],       // positive z face.
  [6, 5, 4], [6, 4, 7],       // positive x face.
  [10, 9, 8], [10, 8, 11],    // negative z face.
  [14, 13, 12], [14, 12, 15], // negative x face.
  [18, 17, 16], [18, 16, 19], // top face.
  [20, 21, 22], [23, 20, 22]  // bottom face
]
const colors = [
  [1.0, 0.0, 0.0, 1.0], // Front face
  [1.0, 0.0, 0.0, 1.0], // Front face
  [1.0, 0.0, 0.0, 1.0], // Front face
  [1.0, 0.0, 0.0, 1.0], // Front face
  [1.0, 1.0, 0.0, 1.0], // Back face
  [1.0, 1.0, 0.0, 1.0], // Back face
  [1.0, 1.0, 0.0, 1.0], // Back face
  [1.0, 1.0, 0.0, 1.0], // Back face
  [0.0, 1.0, 0.0, 1.0], // Top face
  [0.0, 1.0, 0.0, 1.0], // Top face
  [0.0, 1.0, 0.0, 1.0], // Top face
  [0.0, 1.0, 0.0, 1.0], // Top face
  [1.0, 0.5, 0.5, 1.0], // Bottom face
  [1.0, 0.5, 0.5, 1.0], // Bottom face
  [1.0, 0.5, 0.5, 1.0], // Bottom face
  [1.0, 0.5, 0.5, 1.0], // Bottom face
  [1.0, 0.0, 1.0, 1.0], // Right face
  [1.0, 0.0, 1.0, 1.0], // Right face
  [1.0, 0.0, 1.0, 1.0], // Right face
  [1.0, 0.0, 1.0, 1.0], // Right face
  [0.0, 0.0, 1.0, 1.0], // Left face
  [0.0, 0.0, 1.0, 1.0], // Left face
  [0.0, 0.0, 1.0, 1.0], // Left face
  [0.0, 0.0, 1.0, 1.0]  // Left face
];

const drawTriangle = regl({
  vert: document.getElementById("vs").textContent,
  frag: document.getElementById("fs").textContent,
  attributes: {
    position: position,
    color: colors
  },
  elements: indices,
  uniforms: {
    view: ({tick}) => {
      const t = 0.01 * tick
      return mat4.lookAt([],
        [5 * Math.cos(t), 2.5 * Math.sin(t), 5 * Math.sin(t)],
        [0, 0.0, 0],
        [0, 1, 0])
    },
    projection: ({viewportWidth, viewportHeight}) =>
      mat4.perspective([],
        Math.PI / 4,
        viewportWidth / viewportHeight,
        0.01,
        10),
  },
  primitive: "triangles",
  count: 36
})

regl.frame(({time}) => {
  regl.clear({
    color: [0, 0, 0, 0],
    depth: 1
  })

  drawTriangle({
  })
})
