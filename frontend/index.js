import p5 from "p5";
import { memory } from "tartan-generator/tartan_generator_bg";
import { TartanGenerator, Sett, log_something } from "tartan-generator";

let imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

let imgCanvas = document.getElementById('imageCanvas');
let ctx = imgCanvas.getContext('2d');

let numColors = 5;
let numThreads = 64;

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
      let sett = tg.make_sett(numColors,numThreads);
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
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}

/************************
 * TARTAN DRAWING STUFF *
 ************************/
const SKETCH = (s) => {
  s.setup = () => {
    s.createCanvas(s.windowWidth, s.windowHeight);
    s.background(0);
  };
  s.draw = () => {

  };
};
new p5(SKETCH);
