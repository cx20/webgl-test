let angle = 0.0;
function setup() {
    createCanvas(windowWidth, windowHeight, 'webgl');
    noStroke();
    fill(255, 255, 255);
}

function draw(){
    angle += Math.PI / 180;
    background(255, 255, 255);
    rotate(angle, [1, 1, 1]);
    normalMaterial();
    box(500);
}