function setup() {
    createCanvas(windowWidth, windowHeight, 'webgl');
}

function draw() {
    beginShape(TRIANGLE_STRIP);
    noStroke();
    fill(255,   0,   0); vertex(-512/2, -512/2);
    fill(  0, 255,   0); vertex( 512/2, -512/2);
    fill(  0,   0, 255); vertex(-512/2,  512/2);
    fill(255, 255,   0); vertex( 512/2,  512/2);
    endShape(CLOSE);
}