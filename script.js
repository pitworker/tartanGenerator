const THREAD_COUNT = 64;

const THREAD_SIZE = 2;

let colors = [
  ["#fcc111", 6],
  ["#0ff0ce", 43],
  ["#fc2a8c", 21],
  ["#15872a", 43],
  ["#000000", 12]
];

let sett;
let fullSett;

function generateSett() {
  let totalWeight = 0;

  for (let i = 0; i < colors.length; ++ i) {
    totalWeight += colors[i][1];
  }

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

function setup() {
  createCanvas(windowWidth, windowHeight);
  generateSett();
  expandSett();
  background(0);
  drawSett();
}

function draw() {
  //background(220);
}
