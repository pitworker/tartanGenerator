import p5 from "p5";
import { memory } from "tartan-generator/tartan_generator_bg";
import { TartanGenerator, Sett, log_something } from "tartan-generator";

let imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

let imgCanvas = document.getElementById('imageCanvas');
let ctx = imgCanvas.getContext('2d');

let numColors = 7;
let numThreads = 64;

let gotSett = false;
let sett = null;
let fullSett = null;
let s = null;

let loading = document.getElementById("loading");
let colorSlider = document.getElementById("colorSlider");
let colorSliderNum = document.getElementById("numColors");
let renderBtn = document.getElementById("renderBtn");
let settInfo = document.getElementById("settInfo");

const IMG_WIDTH = 160;

const WARP = true;
const WEFT = false;

const THREAD_SIZE = 2;

/************************************
 * IMAGE HANDLING / SETT GENERATION *
 ************************************/
async function loadSett() {
  let imgData =
      ctx.getImageData(0,0,imgCanvas.width, imgCanvas.height).data;
  console.log(imgData);
  log_something();
  let tg = new TartanGenerator(imgData.length, imgData);
  console.log("made new tartan generator");
  sett = tg.make_sett(numColors,numThreads);
  fullSett = sett.get_sett_per_thread();
  console.log(`made sett with ${sett.get_count()} colors`);

  let colors = "[";
  for (let i = 0;  i < numColors; i++) {
    let clr = sett.get_color(i);
    colors += "\n  {";
    colors += `\n    r: ${clr.get_r()}, `
    colors += `\n    g: ${clr.get_g()}, `
    colors += `\n    b: ${clr.get_b()}, `
    colors += `\n    count: ${clr.get_count()}`
    colors += "\n  }";
    if (i != numColors - 1) colors += ","
  }
  colors += "\n]";
  console.log("colors: ", colors);

  gotSett = true;
  if (s) s.draw();
}

function handleImage(e) {
  let reader = new FileReader();
  reader.onload = function(event){
    let img = new Image();
    img.onload = () => {
      imgCanvas.width = IMG_WIDTH;
      imgCanvas.height = IMG_WIDTH / img.width * img.height;
      ctx.drawImage(img,0,0,imgCanvas.width,imgCanvas.height);
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}

function loadSampleSett() {
  let img = new Image();
  numColors = colorSlider.value;
  showLoading();
  img.onload = () => {
    imgCanvas.width = IMG_WIDTH;
    imgCanvas.height = IMG_WIDTH / img.width * img.height;
    ctx.drawImage(img,0,0,imgCanvas.width,imgCanvas.height);
    setTimeout(loadSett, 15);
  }
  img.src = "./media/kandinsky.jpg";
}
loadSampleSett();

/************************
 * TARTAN DRAWING STUFF *
 ************************/
function drawThreads(isWarp) {
  let dim = isWarp ? s.width : s.height;
  let len = isWarp ? s.height : s.width;

  for (let i = 0; i < dim / THREAD_SIZE; i++) {
    let start = i % 4 - (isWarp ? 2.5 : 1.5);
    let thread = i % fullSett.get_count();
    let clr = fullSett.get_color(thread);
    s.stroke(clr.get_r(), clr.get_g(), clr.get_b());
    /*console.log(`Drawing threads with color [${clr.get_r},${clr.get_g},${clr.get_b}] at position ${i}`);*/
    for (let j = start; j < len / THREAD_SIZE; j += 4) {
      let x = isWarp ? i : j;
      let y = isWarp ? j : i;
      s.line(
        x * THREAD_SIZE,
        y * THREAD_SIZE,
        (x + (isWarp ? 0 : 2)) * THREAD_SIZE,
        (y + (isWarp ? 2 : 0)) * THREAD_SIZE
      );
    }
  }
}
function drawSett() {
  if (s && gotSett) {
    console.log("Drawing Sett");
    s.strokeWeight(THREAD_SIZE);
    s.strokeCap(s.SQUARE);
    drawThreads(WARP);
    drawThreads(WEFT);
    hideLoading();
  } else if (s) {
    console.warn("Attempted to draw tartan without sett");
  } else if (gotSett) {
    console.warn("Attempted to draw tartan without p5 instance");
  } else {
    console.warn("Attempted to draw tartan without sett or p5 instance");
  }
}

const SKETCH = (sketch) => {
  s = sketch;
  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight);
    s.noLoop();
    s.draw();
  };
  s.windowResized = () => {
    s.resizeCanvas(s.windowWidth, s.windowHeight);
    s.draw();
  };
  s.draw = () => {
    s.background(1);
    drawSett();
    showSettInfo();
  };
};
new p5(SKETCH);

/*************************
 * SIDE PANEL INFORMATION*
 *************************/
colorSliderNum.innerText = colorSlider.value;
colorSlider.oninput = () => {
  colorSliderNum.innerText = colorSlider.value;
  numColors = colorSlider.value;
};

renderBtn.onclick = () => {
  showLoading();
  setTimeout(loadSett, 5);
};

function getHex(r,g,b) {
  let hexVals = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i in hexVals) {
    if (hexVals[i].length == 1) hexVals[i] = `0${hexVals[i]}`;
  }
  return `#${hexVals[0]}${hexVals[1]}${hexVals[2]}`;
}

function showSettInfo() {
  if (settInfo && gotSett) {
    // Clear out any old children
    while (settInfo.hasChildNodes()) {
      settInfo.removeChild(settInfo.firstChild);
    }

    // Add element for each color
    for (let i = 0;  i < numColors; i++) {
      let clr = sett.get_color(i);
      let hex = getHex(clr.get_r(), clr.get_g(), clr.get_b());
      let count = clr.get_count();

      let elem = document.createElement("DIV");
      let txt = document.createElement("DIV");
      elem.className = "settItem";
      elem.id = `settItem${i}`;
      txt.className = "settItemTxt";
      txt.innerText = `${hex}: ${count}`;
      elem.style.backgroundColor = hex;
      txt.style.color = (clr.get_r() + clr.get_g() + clr.get_b()) > 382 ?
        "#000" :
        "#fff";

      elem.appendChild(txt);
      settInfo.appendChild(elem);
    }
  }
}

/*********
 * MISC. *
 *********/
function showLoading() {
  console.log("!!!!!!!!!!WHAT THE FUCK!!!!!!");
  if (loading) {
    loading.style.width = `${window.innerWidth - 200}px`;
    loading.style.visibility = "visible";
  }
}
function hideLoading() {
  if (loading) loading.style.visibility = "hidden";
}
