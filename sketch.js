let canvas;

let effect;
let blurH;
let blurV;
let edge;

var fbo;
var effectFbo;
var bhFbo;
var bvFbo;
var edgeFbo;

var charFbos = {};

var cl1, cl2, cl3, cl4;

var mm;
var WW, HH;
var ratio = 1.33;
//var resx = map(fxrand(), 0, 1,  1000, 1400);
//var resy = Math.round(1580*1000/resx);
var resx, resy;
if(fxrand() < -.5){
    resx = 1400;
    resy = Math.round(1400/ratio);
}
else{
    resx = Math.round(1400/ratio);
    resy = 1400;
}
resx=resy=1400;
var res = Math.min(resx, resy);
var zoom = .8;
var globalseed = Math.floor(fxrand()*1000000);

var hasmargin = 1.0 * (fxrand()*100 < 50);
var numleaves = 10;
let inconsolata;
var letters = 'abcdefghijklmnopqrstuvwxyz!?$%&()<>';
var letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!?$%&()<>';
var letters = 'abcdefghijklmnopqrstuvwxyz';
var letters = '023456789';
var letters = 'abcdeghkmnopqsuvwxyz';

var randomtint = map2(Math.round(fxrand()*5)/5.);
randomtint = brightencol(randomtint, -.1);
randomtint = saturatecol(randomtint, -.3);
randomtint = [.1, .1, .1]

var pts = [];
///////
/*function getOrthoString(value) {
    if (value) return "yes";
    else return "no";
}
function getCountString(value) {
    if (value) return "big";
    else return "small";
}

window.$fxhashFeatures = {
    "ortho": getOrthoString(orth),
    "exploded": getOrthoString(crazy),
    "mono": getOrthoString(ismono),
    "count": getCountString(afew),
    "uniform": getOrthoString(uniform && (!crazy)),
}*/
///////

var palettesstrings = [
    '121212-F05454-30475E-F5F5F5-F39189-BB8082-6E7582-046582',
    '084c61-db504a-e3b505-4f6d7a-56a3a6-177e89-084c61-db3a34-ffc857-323031',
    '32373b-4a5859-f4d6cc-f4b860-c83e4d-de6b48-e5b181-f4b9b2-daedbd-7dbbc3',
    'fa8334-fffd77-ffe882-388697-54405f-ffbc42-df1129-bf2d16-218380-73d2de',
    '3e5641-a24936-d36135-282b28-83bca9-ed6a5a-f4f1bb-9bc1bc-e6ebe0-36c9c6',
    '304d7d-db995a-bbbbbb-222222-fdc300-664c43-873d48-dc758f-e3d3e4-00ffcd',
    '5fad56-f2c14e-f78154-4d9078-b4431c-8789c0-45f0df-c2cae8-8380b6-111d4a',
    '4C3A51-774360-B25068-FACB79-dddddd-2FC4B2-12947F-E71414-F17808-Ff4828',
    '087e8b-ff5a5f-3c3c3c-f5f5f5-c1839f-1B2430-51557E-816797-D6D5A8-ff2222',
    '4C3F61-B958A5-9145B6-FF5677-65799B-C98B70-EB5353-394359-F9D923-36AE7C-368E7C-187498',
    '283d3b-197278-edddd4-c44536-772e25-0d3b66-faf0ca-f4d35e-ee964b-f95738-fe5d26-f2c078-faedca-c1dbb3-7ebc89-3d5a80-98c1d9-e0fbfc-ee6c4d-293241',
    '99e2b4-99d4e2-f94144-f3722c-f8961e-f9844a-f9c74f-90be6d-43aa8b-4d908e-577590-277da1',
    '080708-3772ff-df2935-fdca40-e6e8e6-d8dbe2-a9bcd0-58a4b0-373f51-1b1b1e',
    'f46036-5b85aa-414770-372248-f55d3e-878e88-f7cb15-76bed0-9cfffa-acf39d-b0c592-a97c73-af3e4d',
];

var pall = '';
palettesstrings.forEach((element, ind) => {
    if(ind < palettesstrings.length-1)
        pall = pall + element + '-';
    else
        pall = pall + element
});
//palettesstrings = [pall]

var palettes = [];
palettesstrings.forEach(stri => {
  var palette = [];
  var swatches = stri.split('-');
  for(var s = 0; s < swatches.length; s++){
    palette.push(hex2rgb(swatches[s]));
  }
  palettes.push(palette);
})


var palette0 = palettes[Math.floor(palettes.length*fxrand())];
palette0 = shuffle(palette0);

var mypal = createPalette();;

function getRandomColor(i){
    if (typeof i === "undefined") {
        return mypal[Math.floor(fxrand()*mypal.length)];
    }
    else{
        return getIndexColor(i);
    }
}

function getIndexColor(i){
    return mypal[i%mypal.length];
}

function getRandomColorOld(pal){
    if(pal){
        return pal[Math.floor(pal.length*fxrand())];
    }
    else{
        return palette0[Math.floor(palette0.length*fxrand())];
    }
}

function preload() {
    effect = loadShader('assets/shaders/effect.vert', 'assets/shaders/effect.frag');
    blurH = loadShader('assets/shaders/blur.vert', 'assets/shaders/blur.frag');
    blurV = loadShader('assets/shaders/blur.vert', 'assets/shaders/blur.frag');
    edge = loadShader('assets/shaders/edge.vert', 'assets/shaders/edge.frag');
    inconsolata = loadFont('assets/fonts/couriermb.ttf');
}

var deadness = map(fxrand(), 0, 1, 3, 16);
var slant = map(fxrand(), 0, 1, 11, 51);

function getRandomRYB(p){
    if(!p)
        p = fxrand();
    p = p%1.;
    var cryb = map2(p);
    cryb = saturatecol(cryb, map(fxrand(), 0, 1, -.3, .3));
    cryb = brightencol(cryb, map(fxrand(), 0, 1, -.3, .3));
    return cryb;
}

function setup(){
    pixelDensity(2);
    var or = windowWidth/windowHeight;
    var cr = resx / resy;
    var cw, ch;

    if(or > cr){
        ch = windowHeight;
        cw = round(ch*cr);
    }
    else{
        cw = windowWidth;
        ch = round(cw/cr);
    }

    canvas = createCanvas(cw-50, ch-50, WEBGL);
    canvas.id('maincanvas');

    var p5Canvas = document.getElementById("maincanvas");
    var w = document.getElementById("maincanvas").offsetWidth;
    var h = document.getElementById("maincanvas").offsetHeight;
    //p5Canvas.style.height = h-50 + 'px';
    //p5Canvas.style.width = w-50 + 'px';


    imageMode(CENTER);
    randomSeed(globalseed);
    noiseSeed(globalseed+123.1341);

    print('fxhash:', fxhash);

    //setAttributes('premultipliedAlpha', true);
    //setAttributes('antialias', true);

    //pg = createGraphics(resx, resy, WEBGL);
    //pg.colorMode(RGB, 1);
    //pg.noStroke();
    curveDetail(44);
    //pg.textFont(inconsolata);
    //ortho(-resx/2, resx/2, -resy/2, resy/2, 0, 4444);
    textFont(inconsolata);
    textAlign(CENTER, CENTER);
    imageMode(CENTER);
    rectMode(CENTER);
    colorMode(RGB, 1);

    //prepareFbos();

    //drawCube(pg);


    //pg.rotateY(accas);
    //mask.rotateY(accas);

    fbo = new p5Fbo({renderer: canvas, width: resx*2, height: resy*2});
    effectFbo = new p5Fbo({renderer: canvas, width: resx*2, height: resy*2});
    bhFbo = new p5Fbo({renderer: canvas, width: resx*2, height: resy*2});
    bvFbo = new p5Fbo({renderer: canvas, width: resx*2, height: resy*2});
    edgeFbo = new p5Fbo({renderer: canvas, width: resx*2, height: resy*2});
    
    fbo.begin();
    clear();
    ortho(-resx/2, resx/2, -resy/2, resy/2, 0, 4444);
    scale(1, -1, 1);
    background(.0);
    rectMode(CENTER);
    //drawPlants();
    //drawShapes();
    drawSim();

    fbo.end();
    //drawShapes(mask, shapes);
    //drawLines(bgpg, shapes);
    showall();
    showall();
    //fbo.draw();
    //fbo.draw();
    fxpreview();

    //frameRate(6);
    //noLoop();

}

function drawSim(){
    background(.7);

    var Engine = Matter.Engine,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite;

    var engine = Engine.create();
    engine.world.gravity.y = -1;
    var bodies = [];
    bodies.push(Bodies.rectangle(0, -400, 800, 20, { isStatic: true, label:'ground' }));
    bodies.push(Bodies.rectangle(-400, 0, 20, 800, { isStatic: true, label:'ground' }));
    bodies.push(Bodies.rectangle(400, 0, 20, 800, { isStatic: true, label:'ground' }));
    for(var k = 0; k < 1333; k++){
        var box = Bodies.rectangle(random(-300, 300), random(-200, 400), 6, 50);
        Matter.Body.rotate(box, radians(random(-30, 30)));
        bodies.push(box);
    }

    Composite.add(engine.world, bodies);

    for(var k = 0; k < 266; k++){
        Engine.update(engine, 1000 / 60);
        if(k == 5)
            engine.gravity.y = 0;
    }

    var bodies = Composite.allBodies(engine.world);

    for (var i = 0; i < bodies.length; i += 1) {
        if(bodies[i].label == 'ground')
            continue;
        var vertices = bodies[i].vertices;

        noFill();
        stroke(0);
        fill((i/100)%.5+.2);
        beginShape();
        for (var j = 0; j < vertices.length; j += 1) {
            vertex(vertices[j].x, vertices[j].y);
        }
        endShape(CLOSE);

        push();
        noStroke();
        fill(0);
        translate(bodies[i].position.x, bodies[i].position.y);
        rotate(bodies[i].angle);
        if(abs(bodies[i].angle) > PI/2)
            rotate(PI);
        textSize(34);
        //text("a", 0, 0);
        pop();
    }
}

function drawCloth(){
    background(.8);
    noFill();
    stroke(1);
    strokeWeight(3);
    var initLine = [];
    for(var x = -200; x < -33; x += random(8, 30)){
        initLine.push(createVector(x, 0));
    }
    var ww = initLine.length;
    for(var k = 0; k < ww; k++){
        var cc = initLine[ww-1-k].copy();
        cc.x *= -1;
        initLine.push(cc);
    }

    var lines = [];
    for(var y = -333; y < 333; y += 12){
        var line = [];
        for(var k = 0; k < initLine.length; k++){
            var cp = initLine[k].copy();
            cp.y = y;
            line.push(cp);
        }
        lines.push(line);
    }
    
    var ainfo = [];
    for(var k = 0; k < lines.length; k++){
        var srez = subdividePath(lines[k], 10);
        var npath = srez[0];
        var isanchors = srez[1];
        lines[k] = npath;
        ainfo.push(isanchors);
    }

    for(var k = 0; k < lines.length; k++){
        for(var t = 0; t < lines[k].length; t++){
            lines[k][t].x += 15*(-.5 + power(noise(t*.02, k*.02, 22.1222), 3));
            lines[k][t].y += 30*(-.5 + power(noise(t*.02, k*.02, 44.5134), 3));
        }
    }


    for(var it = 0; it < 4; it++){
        for(var k = 0; k < lines.length; k++){
            for(var t = 0; t < lines[k].length; t++){
                var cp = lines[k][t];

                var totalforce = createVector(0, 0);
                var totalcnt = 0;
                for(var kk = -3; kk <= 3; kk++){
                    if(kk == 0)
                        continue;
                    if(k+kk < 0)
                        continue;
                    if(k+kk > lines.length-1)
                        continue;
                    for(var tt = 0; tt < lines[k+kk].length; tt++){
                        var cp2 = lines[k+kk][tt];

                        var d = p5.Vector.sub(cp2, cp);
                        if(d.mag() > 22){
                            continue;
                        }
                        //d.mult(1./d.mag()*1./d.mag()*3.);
                        d.mult(22.-d.mag())
                        d.mult(6./22);

                        totalcnt++;
                        totalforce.add(d);
                    }
                }
                totalforce.div(totalcnt+1.);
                if(k!=0 && k!=lines.length-1 && t!=0 && t!=lines[k].length-1 || true) lines[k][t] = p5.Vector.add(cp, totalforce);
            }
            
            //balancing
            for(var itt = 0; itt < 5; itt++){
                for(var t = 0; t < lines[k].length; t++){
                    var pt = lines[k][t];

                    if(t != 0){
                        var ptl = lines[k][t-1];
                        if(pt.dist(ptl) > 10){
                            var dir = p5.Vector.sub(pt, ptl);
                            dir.normalize();
                            dir.mult(pt.dist(ptl)-10.);
                            dir.mult(.39);
                            if(k!=0 && k!=lines.length-1 && t-1!=0 || true) lines[k][t-1].add(dir);
                        }
                    }
                    if(t != lines[k].length-1){
                        var ptr = lines[k][t+1];
                        if(pt.dist(ptr) > 10){
                            var dir = p5.Vector.sub(pt, ptr);
                            dir.normalize();
                            dir.mult(pt.dist(ptr)-10.);
                            dir.mult(.39);
                            if(k!=0 && k!=lines.length-1 && t+1!=lines[k].length-1 || true) lines[k][t+1].add(dir);
                        }
                    }
                }
            }
        }
    }


    noStroke();
    fill(.8, .2, .0);
    for(var k = 0; k < lines.length; k++){
        beginShape();
        for(var t = 0; t < lines[k].length; t++){
            var cp = lines[k][t];
            //ellipse(cp.x, cp.y, 6, 6);
        }
        endShape();
    }

    noFill();
    strokeWeight(3);
    stroke(1);

    for(var k = 0; k < lines.length; k++){
        stroke(...rybcol(floor(random(3))/3, .25, .45));
        stroke(0);
        beginShape();
        for(var t = 0; t < lines[k].length; t++){
            var cp = lines[k][t];
            vertex(cp.x, cp.y);
        }
        endShape();
    }
    for(var k = 0; k < lines[0].length; k++){
        //if(ainfo[0][k] == false)
            //continue;
        stroke(...rybcol(floor(random(3))/3, .25, .45));
        stroke(0);
        for(var q = 0; q < lines.length-1; q++){
            if(lines[q][k].dist(lines[q+1][k]) < 14){
                beginShape();
                vertex(lines[q][k].x, lines[q][k].y);
                vertex(lines[q+1][k].x, lines[q+1][k].y);
                endShape();
            }
        }
        
        if(k == lines[0].length-1)
            continue;
        for(var q = 0; q < lines.length-1; q++){
            if(random(100) < 2){
                fill(...rybcol(floor(random(3))/3, .25, .45));
                fill(0);
                noStroke();
                beginShape();
                //vertex(lines[q][k].x, lines[q][k].y);
                //vertex(lines[q+1][k].x, lines[q+1][k].y);
                //vertex(lines[q+1][k+1].x, lines[q+1][k+1].y);
                //vertex(lines[q][k+1].x, lines[q][k+1].y);
                endShape();
            }
        }
    }
}

function draw(){

    //fbo.begin();
    //ortho(-resx/2, resx/2, -resy/2, resy/2, 0, 4444);
    //drawww();
    //fbo.end();
    //showall();
    //drawAutomata();
    //stepAutomata();


    //stroke(1,0,0);
    //line(-1000,-1000,1000,1000)
    //line(+1000,-1000,-1000,1000)
    //drawShapes(mask, shapes);
    //drawLines(bgpg, shapes);
    //showall();
    //fbo.draw();
    //fbo.draw();
    //drawPlants(pg);

}

function drawww(){
    fill(0, .1);
    rect(0,0,resx,resy);
    noStroke();
    var shf = floor(random(5))/5.;
    var range = random(.1, .24);
    for(var k = 0; k < 44; k++){

        var cx = map(power(noise(k, 14.312), 1), 0, 1, -resx/2, resx/2);
        var cy = map(power(noise(k, 33.222), 21.5), 0, 1, -resy/2, resy/2) + 33*sin(k+frameCount*.0031*(k+1));

        var chc = floor(random(3));
        if(chc == 0)
            fill(rybcol(.0, .8, .4));
        if(chc == 1)
            fill(rybcol(.2, .8, .4));
        if(chc == 2)
            fill(rybcol(.6, .8, .4));
        fill(rybcol((fxrand()*range+shf)%1., .99, .1));
        if(fxrand() < .004){
            shf = floor(random(5))/5.;
        }
        if(fxrand() < .1){
            fill(.8);
        }
        if(fxrand() < .3){
            fill(.05);
        }
        fill(rybcol(
            map(power(noise(k, 41.1415), 4), 0, 1, .9, .93), 
            map(power(noise(k, 62.445), 4), 0, 1, .4, .6), 
            map(power(noise(k, 33.884), 4), 0, 1, .4, .6), 
            ));
        push();
        translate(cx, cy);
        //rotate(random(100));
        //rect(0,0, 200, 22);
        ellipse(0,0, 111, 111);
        pop();
    }
}

function drawShapes(){
    clear();
    randomSeed(globalseed);
    noiseSeed(globalseed+123.1341);
    background(rybcol(random(1), .15, .15));
    background(0);
    var shf = random(1);
    var ee = random(.5, 2);
    for(var k = 0; k < 3; k++){
        var cx = random(-700, 700);
        var cy = random(-700, 700);

        fill(rybcol((pow(random(1), ee)+shf)%1, .5, .4));
        fill(rybcol(floor(random(5))/5., .9, .36));
        noStroke();
        beginShape();
        var shfc = floor(random(5))/5.;
        for(var q = 0; q < 17; q++){
            var x = cx + random(-444, 444) * map(k, 0, 30-1, 1, .1);
            var y = cy + random(-444, 444) * map(k, 0, 30-1, 1, .1);
            fill(rybcol(floor(random(5))/5., .9, .36));
            fill(rybcol((floor(random(5))/5.*.2 + shfc)%1., .9, random(.1, .9)));

            vertex(x, y, 1);
        }
        endShape();
    }
    
    for(var k = 0; k < 33; k++){
        var cx = random(-700, 700);
        var cy = random(-700, 700);

        fill(rybcol((pow(random(1), ee)+shf)%1, .5, .4));
        fill(rybcol(floor(random(5))/5., .9, .36));
        noStroke();

        var ww = random(400, 500);
        var hh = random(30, 150);
        if(fxrand() < .5){
            ww = random(30, 150);
            hh = random(400, 500);
        }
        ww = 50;
        hh = 50;

        ellipse(cx, cy, ww, hh);
    }
    
    var ss = random(100);
    for(var k = 0; k < 1333; k++){
        
        var cx = map(power(noise(k*.004, 12.31), 3), 0, 1, -resx/2, resx/2)*.3;
        var cy = map(power(noise(k*.004, 32.11), 3), 0, 1, -resy/2, resy/2)*.3;

        var ang = k*0.05 + frameCount*.1;
        var rad = 100 + 20*power(noise(k*0.01), 3);
        rad = 300 + 120*sin(k*0.01+ss);
        cx = rad*cos(ang);
        cy = rad*sin(ang);

        fill(rybcol((pow(random(1), ee)+shf)%1, .5, .4));
        fill(rybcol(floor(random(5))/5., .9, .36));
        fill(rybcol((k/145.)%1., .9, .36));

        noStroke();
        var ww = 66;
        var hh = 66;

        push();
        translate(cx, cy, 100);
        rect(0, 0, ww, hh);
        pop();
    }

    stroke(1);
    for(var k = 0; k < 100; k++){
        var x1 = map(power(noise(k, 11), 3), 0, 1, -resx/2, resx/2)*1.3;
        var y1 = map(power(noise(k, 22), 3), 0, 1, -resy/2, resy/2)*1.3;
        var z1 = map(power(noise(k, 22), 3), 0, 1, -resy/2, resy/2)*1.3;
        var x2 = map(power(noise(k, 133), 3), 0, 1, -resx/2, resx/2)*1.3;
        var y2 = map(power(noise(k, 44), 3), 0, 1, -resy/2, resy/2)*1.3;
        var z2 = map(power(noise(k, 414), 3), 0, 1, -resy/2, resy/2)*1.3;
        //line(x1, y1, random(-30, 30), x2, y2, z2);
    }

    var pts = [];
    for(var k = 0; k < 30; k++){
        pts.push(createVector(random(-resx/2, resx/2), random(-resx/2, resx/2)));
    }

    var knots = makeknots(pts, 1, true);
    var hobbypts = gethobbypoints(knots, true, 11);

    noFill();
    stroke(1,0,0);
    strokeWeight(3);
    beginShape();
    for(var k = 0; k < hobbypts.length; k++){
        vertex(hobbypts[k].x, hobbypts[k].y);
    }
    endShape();

    for(var k = 0; k < 30; k++){
        noStroke();
        stroke(1);
        fill(rybcol(random(1), .9, .36));
        push();
        translate(0, 0, 200);
        translate(random(-600, 600), random(-600, 600), 0);
        rotateX(-radians(33))
        rotateY(radians(45))
        //box(200);
        pop();
}

}


var sideRepel = .3;
function drawPlants(){
    fill(0);
    noStroke();

    var x = map(mouseX, 0, width, -resx/2, resx/2);
    var y = map(mouseY, 0, height, -resy/2, resy/2);

    for(var k = 0; k < 11; k++){
        var pos = createVector(random(-446, 446), -resy/2+random(-50, 50));
        var dir = createVector(0, 1, 0);
        dir.rotate(radians(random(-30, 30)));
        var properties = {
            'pos': pos,
            'dir': dir,
            'id': 0,
            'hasBranches': true,
            'level': 0,
            'baseLen': random(400, 500),
            'sca': 1,
            'angsca': random(.6, 3.2),
        }
        plant = new Plant(properties);
        plant.createStem();
    
        //plant.drawStem(true);
        //plant.drawChildStems(true);
        //plant.drawTip();
        //plant.drawShsh(true);
        
        plant.drawStem();
        plant.drawChildStems();
        //plant.drawTip();
        plant.drawShsh();
    }
    
}

var plant;

class Plant{
    constructor(properties){
        this.colorSpread = random(.05, .3);
        this.colorShift = random(1.);
        this.properties = properties;
        this.id = round(random(100, 100000));
    }

    createStem(){
        this.stem = new Stem(this, this.properties);
    }

    drawStem(isblack=false){
        this.stem.drawStem(isblack);
    }

    drawChildStems(isblack=false){
        this.stem.drawChildStems(isblack);
    }

    drawTip(isblack=false){
        this.stem.drawTip(isblack);
    }

    drawShsh(isblack=false){
        this.stem.drawShsh(isblack);
    }
}

function rybcol(h, s, b){
    var col = map2(h);
    col = saturatecol(col, s-.5);
    col = brightencol(col, b-.5);
    return col;
}

var maxlevels = Math.round(map(fxrand(), 0, 1, 3, 4));
class Stem{
    constructor(parentPlant, properties){
        this.pos = properties.pos.copy();
        this.dir = properties.dir.copy();
        this.id = properties.id | 0;
        this.level = properties.level;
        this.branchShortening = random(.2, .3);
        this.baseLen = properties.baseLen;
        this.stemLen = pow(.6, this.level) * this.baseLen * random(.2, 1.3) * properties.sca;
        this.branchSpread = map(this.level, 0, maxlevels, 1, 4);
        this.stemPoints = [];
        this.parentPlant = parentPlant;
        this.createStem();

        this.branches = [];
        var tmp = map(this.level, 0, maxlevels, 1, 0);
        tmp = pow(tmp, .4);
        this.branchProb = map(tmp, 0, 1, 0, .05);
        this.colorShift = parentPlant.colorShift;
        this.colorSpread = parentPlant.colorSpread;


        this.branches1 = this.createBranches(this.branchProb, properties.sca, properties.angsca);
        //this.branches2 = this.createBranches(.2, properties.sca*.03*random(.5, 1.2), properties.angsca*random(.9, 2.));

    }

    drawTip(isblack){
        //if(this.level < maxlevels-1)
        //    return;
        for(var k = 0; k < this.branches1.length; k++){
            this.branches1[k].drawTip(isblack);
        }


        var tip = this.stemPoints[this.stemPoints.length-1];
        var tipp = this.stemPoints[this.stemPoints.length-5];
        var x = tip.x;
        var y = tip.y;
        noStroke();
        fill(0);
        for(var k = 0; k < 20; k++){
            var nzx = 5*(-.5 + power(noise(x*0.01, y*0.01, 125.321), 3));
            var nzy = 5*(-.5 + power(noise(x*0.01, y*0.01, 556.665), 3));
            ellipse(x+random(-5,5), y+random(-5,5), 10, 10);
            var col = map2((fxrand()*this.colorSpread+this.colorShift)%1);
            col = saturatecol(col, -.3);    
            fill(...col);
        }
        fill(...map2((fxrand()*this.colorSpread*3.+this.colorShift)%1), .6);
        if(isblack)
            fill(0);
        ellipse(x+random(-2, 2), y+random(-2, 2), 10, 10);

    }

    drawShsh(isblack){
        strokeWeight(3);
        for(var k = 0; k < this.branches1.length; k++){
            this.branches1[k].drawShsh(isblack);
        }

        if(this.level == 0)
            return;

        var tip = this.stemPoints[this.stemPoints.length-1];
        var tipp = this.stemPoints[this.stemPoints.length-5];

        stroke(...rybcol(.33+.2*this.parentPlant.colorShift + .01*random(-1,1), random(.1, .4)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1), 1.7*random(.4, .7)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1)));
        //if(isblack)
        //    stroke(0);
        var angs = random(20, 30);
        var angsoff = random(0, 90);
        for(var k = 0; k < 18; k++){
            var randang = random(2*PI);
            var dir0 = createVector(0, 1, 0);
            var dir = p5.Vector.sub(tip, tipp);
            if(!dir)
                dir = createVector(0, -1, 0);
            dir.rotate(PI);
            dir0.rotate(randang);
            dir0.mult(random(11, 14));
            dir0.x *= .35;
            dir0.rotate(dir.heading());
            dir0.add(p5.Vector.mult(p5.Vector.normalize(dir), -6));
            //if(k%2 == 0)
            //    dir.rotate(-radians(random(angsoff, angsoff + angs)));
            //else
            //    dir.rotate(+radians(random(angsoff, angsoff + angs)));
            //dir.rotate(random(31));
            //dir0.normalize();
            //dir0.mult(13);
            var x1 = tip.x;
            var y1 = tip.y;
            var x2 = tip.x + dir0.x;
            var y2 = tip.y + dir0.y;
            line(x1, y1, x2, y2);
        }

        var dir = p5.Vector.sub(tip, tipp);
        push();
        translate(tip.x, tip.y, 0);
        rotateZ(dir.heading());
        stroke(...rybcol(.33+.2*this.parentPlant.colorShift + .01*random(-1,1), random(.1, .4)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1), random(.4, .7)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1)));
        fill(...rybcol(.33+.2*this.parentPlant.colorShift + .01*random(-1,1), random(.1, .4)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1), random(.4, .7)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1)));
        noStroke();
        if(isblack)
            fill(0);
        ellipse(0, 0, 5.3, 6);
        pop();
    }

    createStem(){
        var cp = this.pos.copy();
        var dir = this.dir.copy();
        var stemLen = this.stemLen;
        var stemSegLen = 10;
        var parts = 1 + round(stemLen/stemSegLen);
        this.stemPoints.push(cp.copy());
        for(var k = 0; k < parts; k++){
            if(fxrand() < .05)
                dir.x += random(-.4, .4);
            if(cp.x < -(resx/2-100)){
                dir.x += sideRepel;
            }
            if(cp.y < -(resy/2-100)){
                dir.y += sideRepel;
            }
            if(cp.x > +(resx/2-100)){
                dir.x -= sideRepel;
            }
            if(cp.y > +(resy/2-100)){
                dir.y -= sideRepel;
            }
            dir.normalize();
            cp.add(p5.Vector.mult(dir, stemSegLen));
            this.stemPoints.push(cp.copy());
        }
        this.stemPoints = this.subdividePath(this.stemPoints, 4);
        for(var k = 0; k < this.stemPoints.length; k++){
            var x = this.stemPoints[k].x;
            var y = this.stemPoints[k].y;
            var env = map(k, 0, this.stemPoints.length-1, 0, 1);
            env = pow(env, .5);
            var nzx = env*35*(-.5 + power(noise(x*0.005, y*0.005, this.parentPlant.id+125.321), 3));
            var nzy = env*35*(-.5 + power(noise(x*0.005, y*0.005, this.parentPlant.id+556.665), 3));
            this.stemPoints[k].x = x + nzx;
            this.stemPoints[k].y = y + nzy;
        }
    }


    createBranches(branchProb, sca, angsca){
        var branches = [];
        for(var k = 0; k < this.stemPoints.length; k++){
            if(fxrand() < branchProb && k < this.stemPoints.length-6 && k > 3){
                var dir = p5.Vector.sub(this.stemPoints[k+6], this.stemPoints[k]);
                dir.normalize();
                if(fxrand() < .5)
                    dir.rotate(radians(+random(5, 10)*this.branchSpread*angsca));
                else
                    dir.rotate(radians(-random(5, 10)*this.branchSpread*angsca));
                if(this.level+1 >= maxlevels)
                    continue;
                var properties = {
                    'pos': this.stemPoints[k],
                    'dir': dir,
                    'id': branches.length,
                    'angsca': angsca,
                    'sca': sca,
                    'baseLen': this.baseLen,
                    'level': this.level+1,
                }
                var branch = new Stem(this.parentPlant, properties);
                branches.push(branch);
            }
        }
        return branches;
    }

    
    subdividePath(path, det){
        var newpath = [];
        var anchors = [];
        this.stemSegLen = det;
        for(var k = 0; k < path.length-1; k++){
            var p1 = path[k];
            var p2 = path[k+1];
            var parts = 2 + round(p1.dist(p2)/det);
            for(var pa = 0; pa < parts; pa++){
                var isanchor = pa == 0;
                var ppa = map(pa, 0, parts-1, 0, 1);
                var cp = createVector(0, 0, 0);
                cp.x = lerp(p1.x, p2.x, ppa);
                cp.y = lerp(p1.y, p2.y, ppa);
                cp.z = lerp(p1.z, p2.z, ppa);
                newpath.push(cp.copy());
                anchors.push(isanchor);
            }
        }
        anchors[anchors.length-1] = true;
        return [newpath, anchors];
    }

    drawChildStems(isblack=false){
        for(var k = 0; k < this.branches1.length; k++){
            this.branches1[k].drawStem(isblack);
            this.branches1[k].drawShsh(isblack);
            //this.branches1[k].drawTip();
        }
        //for(var k = 0; k < this.branches2.length; k++){
            //this.branches2[k].drawStem(isblack);
        //}
        
        for(var k = 0; k < this.branches1.length; k++){
            this.branches1[k].drawChildStems(isblack);
        }
        //for(var k = 0; k < this.branches2.length; k++){
            //this.branches2[k].drawChildStems(isblack);
        //}
    }

    drawStem(isblack=false){

        noFill();
        stroke(...map2((this.level*.2)%1.));
        stroke(map(this.level, 0, maxlevels-1, 0., 0.4))
        stroke(random(.2));
        stroke(...rybcol(.33+.2*this.parentPlant.colorShift + .01*random(-1,1), random(.1, .4)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1), random(.4, .7)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1)));
        if(this.level == 0){
            //stroke(0);
        }
        strokeWeight(3);
        if(this.level > 0)
            strokeWeight(2);
        var zz = 0;
        if(isblack){
            stroke(0);
            stroke(...rybcol(.33+.2*this.parentPlant.colorShift + .01*random(-1,1), random(.1, .1), .8), .9);
            //strokeWeight(13);
            zz = -10;
        }
        if(this.level != 0){
            stroke(...rybcol(.33+.2*this.parentPlant.colorShift + .01*random(-1,1), random(.1, .4)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1), .16*random(.4, .7)*map(pow(this.level/(maxlevels-1), 2), 0, 1, .3, 1)));
        }
        beginShape();
        for(var k = 0; k < this.stemPoints.length; k++){
            var x = this.stemPoints[k].x;
            var y = this.stemPoints[k].y;
            vertex(x, y, zz);
        }
        endShape();
        
        fill(1,0,0);
        noStroke();
        for(var k = 0; k < this.stemPoints.length; k++){
            var x = this.stemPoints[k].x;
            var y = this.stemPoints[k].y;
            //ellipse(x, y, 8, 8);
        }
        
    }
}

    
function subdividePath(path, det){
    var newpath = [];
    var anchors = [];
    this.stemSegLen = det;
    for(var k = 0; k < path.length-1; k++){
        var p1 = path[k];
        var p2 = path[k+1];
        var parts = 2 + round(p1.dist(p2)/det);
        for(var pa = 0; pa < parts; pa++){
            var isanchor = pa == 0;
            var ppa = map(pa, 0, parts-1, 0, 1);
            var cp = createVector(0, 0, 0);
            cp.x = lerp(p1.x, p2.x, ppa);
            cp.y = lerp(p1.y, p2.y, ppa);
            cp.z = lerp(p1.z, p2.z, ppa);
            newpath.push(cp.copy());
            anchors.push(isanchor);
        }
    }
    anchors[anchors.length-1] = true;
    return [newpath, anchors];
}

function prepareFbos(){
    for(var k = 0; k < letters.length; k++){
        var c = letters[k];
        var cfbo = new p5Fbo({renderer: canvas, width: 40, height: 40});

        cfbo.begin();
        ortho(-20, 20, -20, 20, 0, 4444);
        clear();
        textAlign(CENTER, CENTER);
        noStroke();
        fill(0);
        textSize(34);
        text(c, 0, 0);
        cfbo.end();

        charFbos[c] = cfbo;
    }
}

function blurHorizontaly(result, anfbo){
    var an = fxrand()*PI;
    var dir = [cos(an), sin(an)]
    dir = [1, 0];
    blurH.setUniform('tex0', anfbo.getTexture());
    //blurH.setUniform('tex1', mask);
    blurH.setUniform('texelSize', [1.0/resx, 1.0/resy]);
    blurH.setUniform('direction', [dir[0], dir[1]]);
    blurH.setUniform('u_time', frameCount*0+globalseed*.01);
    blurH.setUniform('amp', .25);
    blurH.setUniform('seed', (globalseed*.12134)%33.+random(.1,11));
    result.begin();
    clear();
    shader(blurH);
    quad(-1,-1,1,-1,1,1,-1,1);
    result.end();
}

function blurVerticaly(result, anfbo){
    var an = fxrand()*PI;
    var dir = [cos(an), sin(an)]
    dir = [1, 0];
    
    blurV.setUniform('tex0', anfbo.getTexture());
    //blurV.setUniform('tex1', mask);
    blurV.setUniform('texelSize', [1.0/resx, 1.0/resy]);
    blurV.setUniform('direction', [-dir[1], dir[0]]);
    blurV.setUniform('u_time', frameCount*0+globalseed*.01);
    blurV.setUniform('amp', .25);
    blurV.setUniform('seed', (globalseed*.12134)%33.+random(.1,11));
    result.begin();
    clear();
    shader(blurV);
    quad(-1,-1,1,-1,1,1,-1,1);
    result.end();
}

function applyEdge(result, anfbo){
    
    edge.setUniform('tex0', anfbo.getTexture());
    edge.setUniform('texelSize', [1.0/resx, 1.0/resy]);
    edge.setUniform('u_time', frameCount*0+globalseed*.01);
    edge.setUniform('seed', (globalseed*.12134)%33.+random(.1,11));
    result.begin();
    clear();
    shader(edge);
    quad(-1,-1,1,-1,1,1,-1,1);
    result.end();
}

function applyEffect(result, fbo1, fbo2, fbo3){
    
    effect.setUniform('tex0', fbo1.getTexture());
    effect.setUniform('tex1', fbo2.getTexture());
    effect.setUniform('tex2', fbo3.getTexture());
    //effect.setUniform('tex2', blurpass2);
    //effect.setUniform('tex3', bgpg);
    effect.setUniform('u_usemask', 0.);
    effect.setUniform('u_resolution', [resx, resy]);
    effect.setUniform('u_mouse',[0, 0]);
    effect.setUniform('u_time', frameCount);
    effect.setUniform('incolor', randomtint);
    effect.setUniform('seed', globalseed+random(.1,11));
    effect.setUniform('noiseamp', mouseX/width*0+1);
    effect.setUniform('hasmargin', hasmargin);
    //effect.setUniform('tintColor', HSVtoRGB(fxrand(), 0.2, 0.95));
    var hue1 = fxrand();
   //effect.setUniform('tintColor', HSVtoRGB(fxrand(),.3,.9));
    //effect.setUniform('tintColor2', HSVtoRGB((hue1+.45+fxrand()*.1)%1,.3,.9));
    var ridx1 = floor(fxrand()*palette0.length)
    var ridx2 = floor(fxrand()*palette0.length)
    effect.setUniform('tintColor', palette0[ridx1]);
    effect.setUniform('tintColor2', palette0[ridx2]);

    result.begin();
    clear();
    shader(effect);
    quad(-1,-1,1,-1,1,1,-1,1);
    result.end();
}

function showall(){
    background(1);
    //pg.push();
    //pg.scale(0.8);
    //pg.pop();
    //pg.line(0,0,mouseX-width/2,mouseY-height/2);

    blurHorizontaly(bhFbo, fbo);
    blurVerticaly(bvFbo, bhFbo);
    applyEdge(edgeFbo, fbo);
    applyEffect(effectFbo, fbo, bvFbo, edgeFbo);
    

    //effectpass.shader(effect);
    //effectpass.quad(-1,-1,1,-1,1,1,-1,1);
  
    // draw the second pass to the screen
    //image(effectpass, 0, 0, mm-18, mm-18);
    var xx = 0;
    //image(pg, 0, 0, mm*resx/resy-xx, mm-xx);
    effectFbo.draw(0, 0, width, height);

}

function windowResized() {
    var or = windowWidth/windowHeight;
    var cr = resx / resy;
    var cw, ch;

    if(or > cr){
        ch = windowHeight;
        cw = round(ch*cr);
    }
    else{
        cw = windowWidth;
        ch = round(cw/cr);
    }
    resizeCanvas(cw-50, ch-50);
    
    var p5Canvas = document.getElementById("maincanvas");
    var w = document.getElementById("maincanvas").offsetWidth;
    var h = document.getElementById("maincanvas").offsetHeight;
    //p5Canvas.style.height = h-50 + 'px';
    //p5Canvas.style.width = w-50 + 'px';

    effectFbo.draw(0, 0, width, height);
}

var randomstring = function(){
    var le = round(random(1, 33));
    var ou = '';
    for(var k = 0; k < le; k++){
        ou += letters[floor(random(letters.length))];
    }
    return ou;
}

function footer(){
    var fu = 30;
    var dd = resx-fu*2;
    var nn = round(dd/12);
    for(var k = 0; k < nn; k++){
        var x = map(k, 0, nn-1, -resx/2+fu, resx/2-fu);
        var y = resy/2-fu*1.;
        text('=', x, y);
        text('=', x, -y);
    }
}

function lines(){
    for(var qq = 0; qq < 5; qq++){
        var cx = random(-444, 444);
        var cy = random(-444, 444);
        var rad = random(resx/2*.6, resx/2*.8)*1.5;
        var nn = round(rad*2*PI/24);
        for(var k = 0; k < nn; k++){
            var ang1 = map(k, 0, nn, 0, 2*PI);
            var ang2 = map(k+1, 0, nn, 0, 2*PI);
            var x1 = cx;
            var y1 = cy;
            var x2 = cx + rad*cos(ang1);
            var y2 = cy + rad*sin(ang1);
            var x3 = cx + rad*cos(ang2);
            var y3 = cy + rad*sin(ang2);
            //myline(x1, y1, 0, x2, y2, 0);

            var c1 = map2(.8*power(noise(qq), 3)+(k/15.)%.1);
            var c2 = map2(.8*power(noise(qq), 3)+(k/15.)%.1 + .2);

            c2 = saturatecol(c2, .1);
            c2 = brightencol(c2, +.2);

            stroke(0.01);
            noStroke();
            beginShape();
            fill(...c1);
            vertex(x1, y1, random(-10,10));
            fill(...c2);
            vertex(x2, y2, random(-10,10));
            vertex(x3, y3, random(-10,10));
            endShape();

            stroke(0.01, .3);
            if(fxrand() < .15){
                line(x1, y1, random(-10,10), x2, y2, random(-10,10));
            }

        }
    }
}


function reducePoly(poly, amp){
    var normals = [];

    for(var k = 0; k < poly.length; k++){
        var p = poly[k];
        var pn = poly[(k+1)%poly.length];
        var pp = poly[(k-1+poly.length)%poly.length];
        var left = p5.Vector.sub(pn, p);
        var right = p5.Vector.sub(pp, p);
        left.normalize();
        right.normalize();
        var normal = p5.Vector.add(left, right);
        normal.normalize();
        normal.mult(amp);
        normals.push(normal);
    }

    var npts = [];
    for(var k= 0; k < poly.length; k++){
        var p = poly[k].copy();
        var n = normals[k].copy();
        p.add(n);
        npts.push(p);
    }

    return npts;
}


var accas = fxrand()*6.28;
var paalsh = Math.round(fxrand()*mypal.length/2);
var ooo = Math.round(1+3*fxrand());
function drawColorViz(pgr){
    pgr.push();
    //pg.translate(random(-.5,.5), random(-.5,.5), 0);
    //pg.rotateZ(radians(random(-2,2)));
    pgr.clear();
    pgr.background(.12);
    pgr.rectMode(CENTER);

    pgr.noStroke();
    var Nx = 9;
    var Ny = 9;
    var dd = 40;
    var ppp = 1;
    for(var j = 0; j < Ny; j++){
        for(var i = 0; i < Nx; i++){
            var x = i*dd - dd*(Nx-1)/2;
            var y = j*dd - dd*(Ny-1)/2;
            //var rcd = getRandomColor(j*Nx+i);
            //pgr.fill(...rcd);
            var idd = round(ppp*((i+1)*(i+1)*1*(j+1)+j+i*ooo));
            idd = idd%(mypal.length+paalsh);
            rcd1 = getRandomColor(idd);
            rcd2 = getRandomColor(idd+1);
            pgr.fill(...rcd1);
            pgr.rect(x, y, dd+1, dd+1);
            //pgr.beginShape();
            //pgr.fill(...rcd1);
            //pgr.vertex(x + (dd/2+1), y - (dd/2+1));
            //pgr.vertex(x + (dd/2+1), y + (dd/2+1));
            //pgr.fill(...rcd2);
            //pgr.vertex(x - (dd/2+1), y + (dd/2+1));
            //pgr.vertex(x - (dd/2+1), y - (dd/2+1));
            //pgr.endShape();
        }
    }
    for(var k = 0; k < mypal.length; k++){
        var x = k*dd - dd*(mypal.length-1)/2;
        var y = -dd*(Ny-1)/2 - dd*3;
        
        var ccc = getRandomColor(k);
        pgr.fill(...ccc);
        pgr.rect(x, y, dd+1, dd+1);
    }

    var kp = 6;
    for(var k = 0; k < kp; k++){
        var pp = map(k, 0, kp, 0, 1);
        var x = k*dd - dd*kp/2;
        var y = +dd*(Ny-1)/2 + 3*dd;

        var ccc = map2(pp);
        ccc = brightencol(ccc, 0);
        ccc = saturatecol(ccc, 0);
        pgr.fill(...ccc);
        //pg.rect(x, y, dd+1, dd+1);
        
        pgr.fill(...hsv2rgb(pp, 1., 1.));
        //pgr.rect(x, y+2*dd, dd+1, dd+1);
    }

    pgr.push();
    pgr.translate(0, res/4+30, 0);
    var cn = round(36 / mypal.length) * mypal.length;
    for(var k = 0; k < cn; k++){
        var ang1 = map(k, 0, cn-1, 0, 2*PI);
        var ang2 = map(k+1, 0, cn-1, 0, 2*PI);
        var x1 = 100 * cos(ang1);
        var y1 = 100 * sin(ang1);
        var x2 = 100 * cos(ang2);
        var y2 = 100 * sin(ang2);
        var ccc1 = getRandomColor();
        var ccc2 = getRandomColor();
        var ccc3 = getRandomColor();
        pgr.noStroke();
        pgr.beginShape();
        pgr.fill(...ccc1);
        pgr.vertex(0, 0);
        pgr.vertex(x1, y1);
        pgr.fill(...ccc2);
        pgr.vertex(x2, y2);
        pgr.endShape();
    }
    pgr.pop();

    pgr.pop();
}

function max(a, b){
    if(a >= b)
        return a;
    return b;
}

function min(a, b){
    if(a <= b)
        return a;
    return b;
}

function createPalette(){
    var cshif = fxrand();
    var invsat = Math.round(fxrand());
    var invs1 = Math.round(fxrand());
    var invb1 = Math.round(fxrand());
    var invs2 = Math.round(fxrand());
    var invb2 = Math.round(fxrand());
    var invs3 = Math.round(fxrand());
    var nc = Math.round(fxrand()*3 + 3);
    var range = Math.round(2 + fxrand()*7)*100/360;
    var off1 = 90*(.5 + Math.floor(fxrand()*2)/2);
    var off2 = 180*(.5 + Math.floor(fxrand()*2)/2);

    var colors = [];
    for(var k = 0; k < nc; k++){
        var ang = (k%nc)*(360/nc)/360 + cshif;
        if(k%nc < nc-2){
           ang = ((k%nc)*(360/nc)/360*range)%range + cshif;
        }
        else if(k%nc < nc-1){
           ang = max(off1/360., ((k%nc)*(360/nc)/360*range)%range+15/360.) + cshif;
        }
        else{
           ang = off2/360. + cshif;
        }

        var cryb = map2(ang%1.);

        if((k+1)%nc < nc-2) cryb = saturatecol(cryb, .4*(-1+2*invsat)*(-1+2*invs1));
        if((k+1)%nc < nc-2) cryb = brightencol(cryb, +.3*(-1+2*invsat)*(-1+2*invb1));
        if((k+1)%nc == nc-1) cryb = saturatecol(cryb, -.5*(-1+2*invsat)*(-1+2*invs2));
        if((k+1)%nc == nc-1) cryb = brightencol(cryb, -.5*(-1+2*invsat)*(-1+2*invb2));
        if((k+1)%nc == nc-2) cryb = saturatecol(cryb, +.5*(-1+2*invsat)*(-1+2*invs3));
        if((k+1)%nc == nc-2) cryb = brightencol(cryb, +.0);

        colors.push(cryb);
    }

    return colors;
}

/*
var cshif = fxrand();
var range = Math.round(2 + fxrand()*7)*45/360;
var invsat = Math.round(fxrand());
var invs1 = Math.round(fxrand());
var invb1 = Math.round(fxrand());
var invs2 = Math.round(fxrand());
var invb2 = Math.round(fxrand());
var invs3 = Math.round(fxrand());
var fff = map(fxrand(), 0, 1, .05, .4);
var aaa = fxrand()*3.14;
var ooo = Math.round(1+3*fxrand());
var ppp = 1;
function drawColorArray(pgr, index=0){

    //COLORS
     pgr.push();
     var nn = 30;
     var dd = 500;
     var rr = dd/nn;
     pgr.noStroke();
     var nc = round(random(3, 12));
     nc = 3 + index%5;
     nc = round(8 + 5*sin(index*fff+aaa));
     for(var k = 0; k < nn; k++){
         var p = map(k, 0, nn, 0, 1);
         var x = map(k, 0, nn-1, -dd/2, dd/2);
         var y = 0;
 
         var ang = ((k+1)%nc)*(360/nc)/360 + cshif;

         if((k+1)%nc < nc-2){
            ang = (((k+1)%nc)*(360/nc)/360*range)%range + cshif;
         }
         else if((k+1)%nc < nc-1){
            ang = max(90/360., (((k+1)%nc)*(360/nc)/360*range)%range+15/360.) + cshif;
         }
         else{
            ang = 180/360. + cshif;
         }

         var pp = ang%1.;

         var cryb = map2(p);
         pgr.fill(...cryb);
         //pgr.rect(x, y-rr*8, rr+1, rr+1);
         
         var cryb = map2(ang);
         if((k+1)%nc < nc-2) cryb = saturatecol(cryb, .4*(-1+2*invsat)*(-1+2*invs1));
         if((k+1)%nc < nc-2) cryb = brightencol(cryb, +.0*(-1+2*invsat)*(-1+2*invb1));
         if((k+1)%nc == nc-1) cryb = saturatecol(cryb, -.5*(-1+2*invsat)*(-1+2*invs2));
         if((k+1)%nc == nc-1) cryb = brightencol(cryb, -.2*(-1+2*invsat)*(-1+2*invb2));
         if((k+1)%nc == nc-2) cryb = saturatecol(cryb, +.5*(-1+2*invsat)*(-1+2*invs3));
         if((k+1)%nc == nc-2) cryb = brightencol(cryb, +.0);
         //if(k%nc == nc-1) cryb = saturatecol(cryb, .5*(invsat));
         //if(k%nc == nc-2) cryb = saturatecol(cryb, .5*(invsat));
         //if(k%nc == nc-1) cryb = brightencol(cryb, -.2*(1.-invsat));
         //if(k%nc == nc-2) cryb = brightencol(cryb, -.2*(1.-invsat));
         pgr.fill(...cryb);

         pgr.fill(...getRandomColor(round(ppp*((k+1)*(k+1)*1*(index+1)+index+k*ooo))));
         pgr.rect(x, y-rr*4*0, rr+1, rr*1+2);

         var chsv = hsv2rgb(p, 1., 1.);
         pgr.fill(...chsv);
         //pgr.rect(x, y+rr*4, rr+1, rr+1);
         
         var chsv = hsv2rgb(ang, 1., 1.);
         if(k%nc == nc-1) cryb = hsv2rgb(ang, .5, .8);
         if(k%nc == nc-2) cryb = hsv2rgb(ang, 1.2, 1.2);
         pgr.fill(...chsv);
         //pgr.rect(x, y+rr*8, rr+1, rr+1);
         
     }

     pg.fill(1.);
     pg.noStroke();
     for(var k = 0; k < nc; k++){
        
        var ang = (k%nc)*(360/nc)/360 + cshif;

        if(k%nc < nc-2){
           ang = (k*(360/nc)/360*range)%range + cshif;
        }
        else if(k%nc < nc-1){
           ang = max(90/360., (k*(360/nc)/360*range)%range+15/360.) + cshif;
        }
        else{
           ang = 180/360. + cshif;
        }

        var pp = ang%1.;

        var x = map(pp, 0, 1-1./nn, -(dd/2-rr/2), (dd/2-rr/2));
        //pg.ellipse(x, 0-rr*8-rr/2, 4, 4);
        //pg.ellipse(x, 0+rr*4-rr/2, 4, 4);
     }
     pgr.pop();
}
*/


function rotateAround(vect, axis, angle) {
    // Make sure our axis is a unit vector
    axis = p5.Vector.normalize(axis);
  
    return p5.Vector.add(
      p5.Vector.mult(vect, cos(angle)),
      p5.Vector.add(
        p5.Vector.mult(
          p5.Vector.cross(axis, vect),
          sin(angle)
        ),
        p5.Vector.mult(
          p5.Vector.mult(
            axis,
            p5.Vector.dot(axis, vect)
          ),
          (1 - cos(angle))
        )
      )
    );
  }



function myline(x1, y1, z1, x2, y2, z2){
    var d = dist(x1,y1,z1,x2,y2,z2);
    var det = 1.5;
    var parts = 2 + round(d/det);
    var amp = 2.;
    var frq = 0.01;
    for(var k = 0; k < parts; k++){
        var p = map(k, 0, parts-1, 0, 1);
        var x = lerp(x1, x2, p);
        var y = lerp(y1, y2, p);
        var z = lerp(z1, z2, p);
        var nx = x + amp*(-.5 + power(noise(x*frq, y*frq, z*frq+311.13), 2));
        var ny = y + amp*(-.5 + power(noise(x*frq, y*frq, z*frq+887.62), 2));
        var rr = map(power(noise(k*0.03, x1+x2), 3), 0, 1, .5, 1.6);
        ellipse(nx, ny, rr, rr);
    }
}

function gethobbypoints(knots, cycle, det=12){
    var hobbypts = [];
    for (var i=0; i<knots.length; i++) {
        var p0x = knots[i].x_pt;
        var p1x = knots[i].rx_pt;
        var p2x = knots[(i+1)%knots.length].lx_pt;
        var p3x = knots[(i+1)%knots.length].x_pt;
        var p0y = knots[i].y_pt;
        var p1y = knots[i].ry_pt;
        var p2y = knots[(i+1)%knots.length].ly_pt;
        var p3y = knots[(i+1)%knots.length].y_pt;

        //bezier(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y);

        var steps = 44;
        var totald = 0;
        var algorithm = 1;
        if(algorithm == 0){
            for(var st = 0; st < steps; st++){
                var t = map(st, 0, steps, 0, 1);
                var tn = map(st+1, 0, steps, 0, 1);
                x = (1-t)*(1-t)*(1-t)*p0x + 3*(1-t)*(1-t)*t*p1x + 3*(1-t)*t*t*p2x + t*t*t*p3x;
                y = (1-t)*(1-t)*(1-t)*p0y + 3*(1-t)*(1-t)*t*p1y + 3*(1-t)*t*t*p2y + t*t*t*p3y;
                
                xn = (1-tn)*(1-tn)*(1-tn)*p0x + 3*(1-tn)*(1-tn)*tn*p1x + 3*(1-tn)*tn*tn*p2x + tn*tn*tn*p3x;
                yn = (1-tn)*(1-tn)*(1-tn)*p0y + 3*(1-tn)*(1-tn)*tn*p1y + 3*(1-tn)*tn*tn*p2y + tn*tn*tn*p3y;
    
                var tonext = dist(xn, yn, x, y);
                totald += tonext;
            }
            steps = 2 + round(totald/det);
    
    
            for(var st = 0; st < steps; st++){
                var t = map(st, 0, steps, 0, 1);
                x = (1-t)*(1-t)*(1-t)*p0x + 3*(1-t)*(1-t)*t*p1x + 3*(1-t)*t*t*p2x + t*t*t*p3x;
                y = (1-t)*(1-t)*(1-t)*p0y + 3*(1-t)*(1-t)*t*p1y + 3*(1-t)*t*t*p2y + t*t*t*p3y;
    
                hobbypts.push(createVector(x, y));
            }
        }
        if(algorithm == 1){
            var t = 0;
            var dt = 0.05;
            while(t < 1.-dt/2){
                x = (1-t)*(1-t)*(1-t)*p0x + 3*(1-t)*(1-t)*t*p1x + 3*(1-t)*t*t*p2x + t*t*t*p3x;
                y = (1-t)*(1-t)*(1-t)*p0y + 3*(1-t)*(1-t)*t*p1y + 3*(1-t)*t*t*p2y + t*t*t*p3y;
                hobbypts.push(createVector(x, y));
    
                var tn = t + dt;
                xn = (1-tn)*(1-tn)*(1-tn)*p0x + 3*(1-tn)*(1-tn)*tn*p1x + 3*(1-tn)*tn*tn*p2x + tn*tn*tn*p3x;
                yn = (1-tn)*(1-tn)*(1-tn)*p0y + 3*(1-tn)*(1-tn)*tn*p1y + 3*(1-tn)*tn*tn*p2y + tn*tn*tn*p3y;
                var tonext = dist(xn, yn, x, y);
                var offsc = tonext/det;
                dt = dt/offsc;
    
                t = t + dt;
            }
        }
        
    }
    return hobbypts;
}


function drawhobby(knots, cycle) {
    
    for (var i=0; i<knots.length-1; i++) {
        push();
        fill(0);
        noStroke();
        translate(knots[i].x_pt, knots[i].y_pt, 0);
        ellipse(0, 0, 5, 5);
        pop();
    }

    var det = 10;
    for (var i=0; i<knots.length; i++) {
        var p0x = knots[i].x_pt;
        var p1x = knots[i].rx_pt;
        var p2x = knots[(i+1)%knots.length].lx_pt;
        var p3x = knots[(i+1)%knots.length].x_pt;
        var p0y = knots[i].y_pt;
        var p1y = knots[i].ry_pt;
        var p2y = knots[(i+1)%knots.length].ly_pt;
        var p3y = knots[(i+1)%knots.length].y_pt;

        //bezier(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y);

        var steps = 10;
        var totald = 0;
        for(var st = 0; st < steps; st++){
            var t = map(st, 0, steps, 0, 1);
            var tn = map(st+1, 0, steps, 0, 1);
            x = (1-t)*(1-t)*(1-t)*p0x + 3*(1-t)*(1-t)*t*p1x + 3*(1-t)*t*t*p2x + t*t*t*p3x;
            y = (1-t)*(1-t)*(1-t)*p0y + 3*(1-t)*(1-t)*t*p1y + 3*(1-t)*t*t*p2y + t*t*t*p3y;
            
            xn = (1-tn)*(1-tn)*(1-tn)*p0x + 3*(1-tn)*(1-tn)*tn*p1x + 3*(1-tn)*tn*tn*p2x + tn*tn*tn*p3x;
            yn = (1-tn)*(1-tn)*(1-tn)*p0y + 3*(1-tn)*(1-tn)*tn*p1y + 3*(1-tn)*tn*tn*p2y + tn*tn*tn*p3y;

            totald += dist(xn, yn, x, y);
        }
        steps = 2 + round(totald/det);


        for(var st = 0; st < steps; st++){
            var t = map(st, 0, steps, 0, 1);
            x = (1-t)*(1-t)*(1-t)*p0x + 3*(1-t)*(1-t)*t*p1x + 3*(1-t)*t*t*p2x + t*t*t*p3x;
            y = (1-t)*(1-t)*(1-t)*p0y + 3*(1-t)*(1-t)*t*p1y + 3*(1-t)*t*t*p2y + t*t*t*p3y;

            push();
            fill(0);
            noStroke();
            translate(x, y, 0);
            ellipse(0, 0, 5, 5);
            pop();
        }
    }

    return;

    beginShape();
    vertex(knots[0].x_pt, knots[0].y_pt, 0);
    for (var i=0; i<knots.length-1; i++) {
      //   knots[i+1].lx_pt.toFixed(4), knots[i+1].ly_pt.toFixed(4),
      //   knots[i+1].x_pt.toFixed(4), knots[i+1].y_pt.toFixed(4));
        
        bezierVertex(
            knots[i].rx_pt, knots[i].ry_pt,
            knots[i+1].lx_pt, knots[i+1].ly_pt, 
            knots[i+1].x_pt, knots[i+1].y_pt,
        );
  
        //push();
        //noStroke();
        //fill(...getRandomColor());
        //ellipse(knots[i].x_pt,  knots[i].y_pt, 3, 3);
        //ellipse(knots[i].rx_pt, knots[i].ry_pt, 1, 1);
        //ellipse(knots[i+1].lx_pt, knots[i+1].ly_pt, 1, 1);
        //ellipse(knots[i+1].x_pt,  knots[i+1].y_pt, 3, 3);
        //pop();
    }
    if (cycle) {
        i = knots.length-1;
        bezierVertex(
            knots[i].rx_pt, knots[i].ry_pt,
            knots[0].lx_pt, knots[0].ly_pt,
            knots[0].x_pt, knots[0].y_pt,
        );
    }
    endShape();

}

function map(v, v1, v2, v3, v4){
    return (v-v1)/(v2-v1)*(v4-v3)+v3;
}


function mouseClicked(){
    //createShapes();
}

function keyPressed(){
    //noiseSeed(round(random(1000)));
    //createShapes();
    if(key == 's'){
        var data = effectFbo.readToPixels();
        var img = createImage(effectFbo.width, effectFbo.height);
        for (i = 0; i < effectFbo.width; i++){
          for (j = 0; j < effectFbo.height; j++){
            var pos = (j * effectFbo.width*4) + i * 4;
            img.set(i,effectFbo.height-1-j, [data[pos], data[pos+1], data[pos+2],255]);
          }
        }
        img.updatePixels();
        img.save('outputTest', 'png');
    }
}

function rnoise(s, v1, v2){
    return v1 + (v2-v1)*((power(noise(s), 3)*1)%1.0);
}


function power(p, g) {
    if (p < 0.5)
        return 0.5 * Math.pow(2*p, g);
    else
        return 1 - 0.5 * Math.pow(2*(1 - p), g);
}
