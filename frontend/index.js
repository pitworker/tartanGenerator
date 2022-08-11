import { memory } from "tartan-generator/tartan_generator_bg";
import { TartanGenerator, Sett, log_something } from "tartan-generator";

//wasm.greet();

let imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

let canvas = document.getElementById('imageCanvas');
let ctx = canvas.getContext('2d');


function handleImage(e){
  let reader = new FileReader();
  reader.onload = function(event){
    let img = new Image();
    img.onload = function(){
      canvas.width = 50;
      canvas.height = 50 / img.width * img.height;
      ctx.drawImage(img,0,0,canvas.width,canvas.height);

      let imgData = ctx.getImageData(0,0,canvas.width, canvas.height).data;
      console.log(imgData);
      log_something();
      let tg = new TartanGenerator(imgData.length, imgData);
      console.log("made new tartan generator");
      let sett = tg.make_sett(3,7);
      console.log(`made sett with ${sett.get_count()} colors`);

      let colors = "[";
      for (let i = 0;  i < 3; i++) {
        let clr = sett.get_color(i);
        colors += `{r: ${clr.get_r()}, g: ${clr.get_g()}, b: ${clr.get_b()}, count: ${clr.get_count()}}`;
      }
      colors += "]";
      console.log("colors", colors);
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}
