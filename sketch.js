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
let numTargSlider, targDistSlider, resetButton, heatmapButton;
var minTargs = 2;
var maxTargs = 15; 
var steps = 360/minTargs;
var targs = [];
var targX = [];
var targY = [];
var expAccs = [];
var minDist = h*.15;
var maxDist = h*.75;
var stepDist = h*.01

// target placement information
var areaR = maxDist;
var cWbound = (w - areaR)/2;
var cHbound = (h - areaR)/2;

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

// heat map settings 
var res = 6;
var heatmap = false;

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

    heatmapButton = createButton("Heatmap");
    heatmapButton.position(w*.04, h*.18);
    heatmapButton.mousePressed(toggleHeat);
    heatmapButton.mouseReleased(toggleHeat);

}

function draw(){
    background(whi);
    
    // refresh target list in case there's a change 
    targs = [];
    targX = [];
    targY = [];
    expAccs = [];

    // slider title
    noStroke();
    fill(blk);
    textAlign(LEFT, CENTER);
    textSize(h*.018);
    text("Number of Targets: " + numTargSlider.value(), w*.02, h*.02);
    text("Delta (\u0394)", w*.02, h*.08);

    noFill();
    stroke(blk);
    ellipse(w/2, h/2, areaR);

    steps = 360/numTargSlider.value();
    for(let i = 0; i < numTargSlider.value(); i++){
        // sort location
        var ang = ((i * steps)/180)*Math.PI;
        var x = (targDistSlider.value()/2 * Math.cos(ang)) + w/2;
        var y = (targDistSlider.value()/2 * Math.sin(ang)) + h/2;

        // push the distances to a list
        targs.push(dist(x, y, donkey.x, donkey.y));
        targX.push(x);
        targY.push(y);
        expAccs.push(ExpectedAcc(targs[i]));
    }

    
    // loop through all points in the cirle
    // colour each point based on expAcc
    if(heatmap){
        for(let x = cWbound; x < w - cWbound; x+=res){
            for(let y = cHbound; y < h-cHbound; y+=res){
                var distance = dist(x, y, w/2, h/2);
                if(distance < areaR/2){
                    var tempCol = [];
                    for(let i = 0; i < targs.length; i++){
                        tempCol.push(ExpectedAcc(dist(x, y, targX[i], targY[i])));
                    }
                    var tempAcc = tempCol.reduce(function(a, b){return a + b})/tempCol.length;
                    push()
                    colorMode(HSB);
                    strokeWeight(res);
                    stroke(map(tempAcc, 0, 1, 0, 360), 90, 80);
                    point(x, y);
                    pop();
                }
            }
        }
        // draw a scale 
        for(let i = 0; i < 101; i++){
            push();
            colorMode(HSB);
            noStroke();
            fill(map(i, 0, 100, 0, 359), 90, 90);
            rect(w*.25 + i*((w*.5)/100), h*.05, (w*.5)/100, 10);
            pop();
        }
        push();
        noStroke();
        fill(blk);
        textAlign(CENTER, CENTER);
        text("Probability of Reaching Target", w/2, h*.025)
        textAlign(LEFT, CENTER);
        text("0%", w*.25, h*.075);
        textAlign(RIGHT, CENTER);
        text("100%", w*.75, h*0.075);
        pop();
    }

    for(let i = 0; i < targs.length; i++){
        // show images
        stroke(blk)
        line(targX[i], targY[i], donkey.x, donkey.y);
        push();
        push();
        imageMode(CENTER)
        image(blueT, targX[i], targY[i], tDims[0], tDims[1])
        pop();
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

// functions
function resetPos() {
    donkey.x = w/2;
    donkey.y = h/2;
}

function toggleHeat() {
    if(heatmap){
        heatmap = false;
    } else {
        heatmap = true;
    }
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
    if(locked & dist(w/2, h/2, mouseX, mouseY) < maxDist*.6){
        donkey.x = mouseX;
        donkey.y = mouseY;
    }
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

