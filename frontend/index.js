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
      let tg = TartanGenerator.new(imgData.length, imgData);
      console.log("made new tartan generator");
      tg.make_sett(3);
      console.log("made sett");
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}
