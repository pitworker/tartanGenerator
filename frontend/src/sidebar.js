import { memory } from "tartan-generator/tartan_generator_bg";
import { TartanGenerator, Sett } from "tartan-generator";

let imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', handleImage, false);

let imgCanvas = document.getElementById('imageCanvas');
let ctx = imgCanvas.getContext('2d');

let loading = document.getElementById("loading");
let colorSlider = document.getElementById("colorSlider");
let colorSliderNum = document.getElementById("numColors");
let uploadBtn = document.getElementById("uploadBtn");
let renderBtn = document.getElementById("renderBtn");
let settInfo = document.getElementById("settInfo");
let sideBar = document.getElementById("sideBar");


const IMG_WIDTH = 160;

/*************************
 * SIDE PANEL INFORMATION*
 *************************/
class SideBar {
  #numColors = 7;
  #numThreads = 64;

  #isWebkit = false;

  #elements = {
    colorSlider: null,
    colorSliderNum: null,
    uploadBtn: null,
    renderBtn: null,
    settInfo: null,
    sideBar: null,
    imageLoader: null
  }
}

colorSliderNum.innerText = colorSlider.value;
colorSlider.oninput = () => {
  colorSliderNum.innerText = colorSlider.value;
  numColors = colorSlider.value;
};

renderBtn.onclick = () => {
  showLoading();
  setTimeout(loadSett, 5);
};

uploadBtn.onclick = () => {
  imageLoader.click();
}

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

    // Adjust margins for scrollbar if necessary
    if (sideBar.scrollHeight > sideBar.clientHeight && isWebkit) {
      sideBar.style.paddingRight = "15px";
      sideBar.style.outline = "none";
    } else {
      sideBar.style.paddingRight = null;
      sideBar.style.outline = null;
    }
  }
}

/*********
 * MISC. *
 *********/
function showLoading() {
  if (loading) {
    loading.style.width = `${window.innerWidth - 200}px`;
    loading.style.visibility = "visible";
  }
}
function hideLoading() {
  if (loading) loading.style.visibility = "hidden";
}

window.addEventListener("load", () => {
  let pref = (Array.prototype.slice
  .call(window.getComputedStyle(document.documentElement, ""))
  .join("")
  .match(/-(moz|webkit|ms)-/))[1];

  isWebkit = pref == "webkit";
});
