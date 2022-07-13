const THREAD_COUNT = 64;

const THREAD_SIZE = 2;

let imgPath = "../rootImages/pittFlag.png";
let fontPathReg = "../fonts/Archivo-Regular.ttf";
let fontPathBlack = "../fonts/ArchivoBlack-Regular.ttf";

let img;
let fontBlack;
let fontReg;

let colors;

let sett;
let fullSett;

function colorsFromImg() {
  // referencing this stackoverflow post:
  // https://stackoverflow.com/questions/54707586/getting-pixel-values-of-images-in-p5js
  //image(img, 0, 0, width, height);

  col = [];
  num = [];
  colors = [];
  
  img.loadPixels();
  numPix = 4 * img.width * img.height;
  for (let i = 0; i < numPix; i += 4) {
    let r = img.pixels[i];
    let g = img.pixels[i+1];
    let b = img.pixels[i+2];
    let pixelCol = "#" + hex(((r << 16) | (g << 8) | b), 6);

    colI = col.indexOf(pixelCol);
    if (colI == -1) {
      col.push(pixelCol);
      num.push(1);
    } else {
      ++ num[colI];
    }
  }

  for (let i = 0; i < col.length; i++) {
    colors.push([col[i], num[i]]);
  }
}

function generateSett() {
  let totalWeight = 0;

  for (let i = 0; i < colors.length; ++ i) {
    totalWeight += colors[i][1];
  }

  console.log("original colors:\n" + colors);

  let weightFactor = (THREAD_COUNT / 2) / totalWeight;

  let colorsWeighted = [];

  for (let i = 0; i < colors.length; ++ i) {
    let newWeight = Math.floor(colors[i][1] * weightFactor);
    if (newWeight > 0) colorsWeighted.push([colors[i][0], newWeight]);
  }

  let weightSum = 0;
  let largest = 0;
  
  for (let i = 0; i < colorsWeighted.length; ++ i) {
    weightSum += colorsWeighted[i][1];
    if (colorsWeighted[largest][1] < colorsWeighted[i][1]) largest = i;
  }

  if (weightSum < THREAD_COUNT / 2)
    colorsWeighted[largest][1] += (THREAD_COUNT / 2) - weightSum;

  for (let i = 0; i < colorsWeighted.length; ++ i) {
    colorsWeighted[i][1] *= 2;
  }
  
  sett = colorsWeighted;

  console.log("sett:\n" + sett);
}

function expandSett() {
  fullSett = [];
  for (let i = 0; i < sett.length; ++ i) {
    for (let j = 0; j < sett[i][1]; ++ j) {
      fullSett.push(sett[i][0]);
    }
  }
  for (let i = sett.length - 1; i >= 0; -- i) {
    for (let j = 0; j < sett[i][1]; ++ j) {
      fullSett.push(sett[i][0]);
    }
  }
}

function drawWarp() {
  for (let i = 0; i < width / THREAD_SIZE; ++ i) {
    let vStart = i % 4 - 2.5;
    let thread = i % (THREAD_COUNT * 2);
    stroke(fullSett[thread]);
    for (let j = vStart; j < height / (THREAD_SIZE); j += 4) {
      line(i * THREAD_SIZE,
           j * THREAD_SIZE,
           i * THREAD_SIZE,
           (j + 2) * THREAD_SIZE);
    }
  }
}

function drawWeft() {
  for (let i = 0; i < height / THREAD_SIZE; ++ i) {
    let hStart = i % 4 - 1.5;
    let thread = i % (THREAD_COUNT * 2);
    stroke(fullSett[thread]);
    for (let j = hStart; j < width / (THREAD_SIZE); j += 4) {
      line(j * THREAD_SIZE,
           i * THREAD_SIZE,
           (j + 2) * THREAD_SIZE,
           i * THREAD_SIZE);
    }
  }
}

function drawSett() {
  strokeWeight(THREAD_SIZE);
  strokeCap(SQUARE);
  drawWarp();
  drawWeft();
}

function writeSett() {
  noStroke();
  textSize(36);
  textFont(fontBlack);
  textAlign(LEFT, TOP);
  
  let title = "thread count";
  let margin = 15;
  let sWidth = textWidth(title);
  
  fill(255);
  rect(width - sWidth - margin * 2, 0, sWidth + margin * 2, height);

  fill(0);
  text(title, width - margin - sWidth, margin);

  let lastTextY = margin;
  let lastTextSize = 36;

  textSize(36);
  textFont(fontReg);
  fill(0);
  
  for (let i = 0; i < sett.length; ++ i) {
    let str = '[' + sett[i][0] + '] ' + sett[i][1];
    stroke(0);
    strokeWeight(2);
    fill(sett[i][0]);
    rect(width - sWidth - margin, lastTextY + lastTextSize + margin,
	 textWidth(str) + 4, 36 + 4);

    noStroke();
    fill(brightness(color(sett[i][0])) > 128 ? 0 : 255);
    text(str,
	 width - sWidth - margin, lastTextY + lastTextSize + margin);
    lastTextY = lastTextY + lastTextSize + margin;
    lastTextSize = 36;
  }
}

function preload() {
  fontBlack = loadFont(fontPathBlack);
  fontReg = loadFont(fontPathReg);
  img = loadImage(imgPath);
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 255);
  colorsFromImg();
  generateSett();
  expandSett();
}

function draw() {
  background(0);
  drawSett();
  writeSett();
  noLoop()
}
