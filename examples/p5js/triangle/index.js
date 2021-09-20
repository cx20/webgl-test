function setup() {
    createCanvas(windowWidth, windowHeight, 'webgl');
}

function draw() {
    background(255, 255, 255);
    noStroke();
    beginShape(TRIANGLES);
    fill(0, 0, 255);
    vertex(     0,-512/2, 0);
    vertex(-512/2, 512/2, 0);
    vertex( 512/2, 512/2, 0);
    endShape(CLOSE);
}
