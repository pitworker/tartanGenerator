import * as wasm from "tartan-generator";

wasm.greet();

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
      ctx.drawImage(img,0,0,50,50 / img.width * img.height);
      console.log(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
    }
    img.src = event.target.result;
  }
  reader.readAsDataURL(e.target.files[0]);
}
