// setup display 
var w = 800;
var h = 800;

// colours 
var org = [230, 126, 34];
var blu = [41 , 128, 185];
var grn = [39 , 174, 96];
var gry = [149, 165, 166];
var whi = [236, 240, 241];
var blk = [44 , 62 , 80];

// target params
let numTargSlider, targDistSlider, resetButton;
var minTargs = 2;
var maxTargs = 15; 
var steps = 360/minTargs;
var targs = [];
var expAccs = [];
var minDist = h*.15;
var maxDist = h*.75;
var stepDist = h*.01

// target placement information
var areaR = maxDist;

// Donkey 
var donkey;

// image dimensions 
var dDims = [147, 255];
var tDims = [177, 99];

// scale images to be a bit smaller 
var dRatio = dDims[0] / dDims[1];
var tRatio = tDims[0] / tDims[1];

// setup dimensions
tDims[0] = 40;
tDims[1] = tDims[0] / tRatio;

dDims[0] = 25;
dDims[1] = dDims[0] / dRatio;

// mouse settings 
var locked = false;

// load images
function preload() {
    blueT = loadImage("img/blueTrough_177_99.png");
    Donkey = loadImage("img/donkey_147_255.png");
}

// setup 
function setup() { 
    createCanvas(w, h);

    // setup the donkey 
    donkey = new Agent(w/2, h/2);

    // create the sliders
    numTargSlider = createSlider(minTargs, maxTargs, minTargs, 1);
    numTargSlider.position(w*.02, h*.04);

    targDistSlider = createSlider(minDist, maxDist, minDist, stepDist);
    targDistSlider.position(w*.02, h*.1);

    resetButton = createButton("Reset Position");
    resetButton.position(w*.04, h*.14);
    resetButton.mouseClicked(resetPos);

}

function draw(){
    background(whi);
    
    // refresh target list in case there's a change 
    targs = [];
    expAccs = [];

    // slider title
    noStroke();
    fill(blk);
    textAlign(LEFT, CENTER);
    textSize(h*.018);
    text("Number of Targets: " + numTargSlider.value(), w*.02, h*.02);
    text("Delta (\u0394)", w*.02, h*.08);

    noFill();
    var mouseDist = dist(w/2, h/2, mouseX, mouseY);
    stroke(blk);
    ellipse(w/2, h/2, areaR);



    steps = 360/numTargSlider.value();
    for(let i = 0; i < numTargSlider.value(); i++){
        // sort location
        var ang = ((i * steps)/180)*Math.PI;
        var x = (targDistSlider.value()/2 * Math.cos(ang)) + w/2;
        var y = (targDistSlider.value()/2 * Math.sin(ang)) + h/2;
        
        // show images
        stroke(gry)
        line(x, y, donkey.x, donkey.y);
        push();
        push();
        imageMode(CENTER)
        image(blueT, x, y, tDims[0], tDims[1])
        pop();

        // push the distances to a list
        targs.push(dist(x, y, donkey.x, donkey.y));
        expAccs.push(ExpectedAcc(targs[i]));
    }

    // work out exp acc
    expAcc = Math.round(expAccs.reduce(function(a, b){return a + b})/expAccs.length * 1000)/10;
    noStroke();
    fill(blk);
    push();
    textAlign(CENTER, CENTER);
    text("ExpectedAccuray = " + expAcc + "%", w/2, h*.95);
    pop();

    // show Donkey
    donkey.show()
}

class Agent {
    constructor(x, y){
        this.x = x,
        this.y = y
    }

    show() {
        push();
        imageMode(CENTER);
        image(Donkey, this.x, this.y, dDims[0], dDims[1]);
        pop();
    }   
}

function resetPos() {
    donkey.x = w/2;
    donkey.y = h/2;
}

// work out chance 
function ExpectedAcc(dist) {
    var b = .03;
    var a = -5
    Acc = 1 / (1 + Math.exp(b * abs(dist) + a));

    return Acc;
}

// Mouse stuff
function mousePressed(){
    locked = true;
}

function mouseDragged(){
    if(locked & dist(w/2, h/2, mouseX, mouseY) < maxDist*.6){
        donkey.x = mouseX;
        donkey.y = mouseY;
    }
}

function mouseReleased(){
    locked = false;
}

