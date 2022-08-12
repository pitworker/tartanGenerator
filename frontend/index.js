import p5 from "p5";
import { memory } from "tartan-generator/tartan_generator_bg";
import { TartanGenerator, Sett, log_something } from "tartan-generator";

let imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

let imgCanvas = document.getElementById('imageCanvas');
let ctx = imgCanvas.getContext('2d');

let numColors = 5;
let numThreads = 64;

let gotSett = false;
let sett = null;
let fullSett = null;
let s = null;

const WARP = true;
const WEFT = false;

const THREAD_SIZE = 2;

/************************************
 * IMAGE HANDLING / SETT GENERATION *
 ************************************/
function handleImage(e){
  let reader = new FileReader();
  reader.onload = function(event){
    let img = new Image();
    img.onload = function(){
      imgCanvas.width = 50;
      imgCanvas.height = 50 / img.width * img.height;
      ctx.drawImage(img,0,0,imgCanvas.width,imgCanvas.height);

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
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}

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
    s.background(0);
    drawSett();
  };
};
new p5(SKETCH);
