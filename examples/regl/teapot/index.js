let regl = createREGL();

let vertexPositions;
let vertexNormals;
let vertexTextureCoords;
let indices;

let img = new Image();
img.src = "../../../assets/textures/arroway.de_metal+structure+06_d100_flat.jpg";
img.onload = function(){

    $.getJSON("https://rawcdn.githack.com/gpjt/webgl-lessons/a227a62af468272a06d55d815971273628874067/lesson14/Teapot.json", function (data) {
        vertexPositions = data.vertexPositions;
        vertexTextureCoords = data.vertexTextureCoords;
        vertexNormals = data.vertexNormals;
        indices = data.indices;
        
        let positions = [];
        let textureCoords = [];
        let normals = [];
        let indices_ = [];
        
        for (let i = 0; i < vertexPositions.length; i += 3 ) {
            positions.push( [vertexPositions[i+0], vertexPositions[i+1], vertexPositions[i+2] ]);
        }
        for (let i = 0; i < vertexTextureCoords.length; i += 2 ) {
            textureCoords.push( [vertexTextureCoords[i+0], vertexTextureCoords[i+1] ]);
        }
        for (let i = 0; i < vertexNormals.length; i += 3 ) {
            normals.push( [vertexNormals[i+0], vertexNormals[i+1], vertexNormals[i+2] ]);
        }
        for (let i = 0; i < indices.length; i += 3 ) {
            indices_.push( [indices[i+0], indices[i+1], indices[i+2] ]);
        }
        
        let texture = regl.texture(img);
        
        const drawTriangle = regl({
          vert: document.getElementById("vs").textContent,
          frag: document.getElementById("fs").textContent,
          attributes: {
            position: positions,
            textureCoord: textureCoords,
            normal: normals
          },
          elements: indices_,
          uniforms: {
            texture: texture,
            view: ({tick}) => {
              const t = 0.01 * tick
              return mat4.lookAt([],
                [100 * Math.cos(t), 0, 100 * Math.sin(t)],
                [0, 0.0, 0],
                [0, 1, 0])
            },
            projection: ({viewportWidth, viewportHeight}) =>
              mat4.perspective([],
                Math.PI / 4,
                viewportWidth / viewportHeight,
                0.01,
                1000),
          },
          primitive: "triangles",
          count: indices_.length * 3
        })
        
        regl.frame(({time}) => {
          regl.clear({
            color: [0, 0, 0, 1],
            depth: 1
          })
        
          drawTriangle({
          })
        })
    });
}
