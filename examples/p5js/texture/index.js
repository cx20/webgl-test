let angle = 0.0;
var img;
function preload(){
    img = loadImage("../../../assets/textures/frog.jpg");
}

function setup() {
    createCanvas(windowWidth, windowHeight, 'webgl');
    noStroke();
    fill(255, 255, 255);
}

function draw(){
    angle += Math.PI / 180;
    background(255, 255, 255);
    translate(0, 0, -100);
    rotate(angle, [1, 1, 1]);
    texture(img);
    box(500);
}
