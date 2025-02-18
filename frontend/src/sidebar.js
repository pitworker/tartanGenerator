const DEFAULT_IMAGE_WIDTH = 160;

const COLOR_BRIGHTNESS_SUM = 382;

const BLACK = "#000";
const WHITE = "#fff";

function getHex(r, g, b) {
  let hexVals = [r.toString(16), g.toString(16), b.toString(16)];
  for (let i in hexVals) {
    if (hexVals[i].length === 1) hexVals[i] = `0${hexVals[i]}`;
  }
  return `#${hexVals[0]}${hexVals[1]}${hexVals[2]}`;
}

/*************************
 * SIDE PANEL INFORMATION*
 *************************/
export default class Sidebar {
  #isWebkit = false;

  #imageWidth = DEFAULT_IMAGE_WIDTH;

  #imageCanvasContext = null;

  #settGenerator = null;
  #canvas = null;

  #elements = {
    colorSlider: null,
    colorSliderNum: null,
    uploadButton: null,
    renderButton: null,
    settInfo: null,
    sideBar: null,
    imageLoader: null,
    imageCanvas: null
  }

  constructor(canvas, settGenerator, imageWidth) {
    this.#trackElements();
    this.#assignListeners();

    this.#elements.colorSliderNum.innerText = this.#elements.colorSlider.value;

    this.#imageCanvasContext = this.#elements.imageCanvas.getContext("2d");

    this.#canvas = canvas;
    this.#settGenerator = settGenerator;

    if (imageWidth && typeof imageWidth === "number") {
      this.#imageWidth = imageWidth;
    }
  }

  #trackElements() {
    this.#elements.colorSlider = document.getElementById("colorSlider");
    this.#elements.colorSliderNum = document.getElementById("numColors");
    this.#elements.uploadButton = document.getElementById("uploadBtn");
    this.#elements.renderButton = document.getElementById("renderBtn");
    this.#elements.settInfo = document.getElementById("settInfo");
    this.#elements.sideBar = document.getElementById("sideBar");
    this.#elements.imageLoader = document.getElementById("imageLoader");
    this.#elements.imageCanvas = document.getElementById("imageCanvas");
  }

  #assignListeners() {
    window.addEventListener("load", () => {
      const browser = (Array.prototype.slice.call(
        window.getComputedStyle(document.documentElement, ""
        )).join("").match(/-(moz|webkit|ms)-/))[1];

      this.#isWebkit = browser === "webkit";
    });

    this.#elements.imageLoader.addEventListener(
      "change",
      (uploadEvent) => this.#imageUploadHandler(uploadEvent),
      false
    );

    this.#elements.colorSlider.oninput =
      () => this.#colorSliderInputHandler();

    this.#elements.renderButton.onclick =
      () => this.#renderButtonClickHandler();

    this.#elements.uploadButton.onclick =
      () => this.#uploadButtonClickHandler();
  }

  #imageUploadHandler(uploadEvent) {
    const reader = new FileReader();
    reader.onload = (readerLoadEvent) => {
      const image = new Image();
      image.onload = () => this.#imageLoadHandler();
      image.src = readerLoadEvent.target.result;
    }
    reader.readAsDataURL(uploadEvent.target.files[0]);
  }

  #imageLoadHandler() {
    try {
      this.#elements.imageCanvas.width = this.#imageWidth;

      this.#elements.imageCanvas.height =
        this.#imageWidth / image.width * image.height;

      this.#imageCanvasContext.drawImage(
        image,
        0,
        0,
        this.#elements.imageCanvas.width,
        this.#elements.imageCanvas.height
      );
    } catch (err) {
      console.error("Error handling image load:", err);
    }
  }

  #colorSliderInputHandler() {
    try {
      this.#elements.colorSliderNum.innerText =
        this.#elements.colorSlider.value;
      this.#settGenerator.numColors = this.#elements.colorSlider.value;
    } catch (err) {
      console.error("Error handling slider input:", err);
    }
  }

  #renderButtonClickHandler() {
    try {
      this.#canvas.showLoading();

      const imageData = this.#imageCanvasContext.getImageData(
        0,
        0,
        this.#elements.imageCanvas.width,
        this.#elements.imageCanvas.height
      ).data;

      setTimeout(
        () => this.#settGenerator.load(imageData).then(() => {
          this.#canvas.drawSett(this.#settGenerator.fullSett);
          this.#showSettInfo();
        }).catch(err => {
          console.warn(err);
        }),
        5
      );
    } catch (err) {
      console.error("Error handling render button click:", err);
    }
  }

  #uploadButtonClickHandler() {
    try {
      this.#elements.imageLoader.click();
    } catch (err) {
      console.error("Error handling upload button click:", err);
    }
  }

  #showSettInfo() {
    try {
      if (this.#elements.settInfo && this.#settGenerator.gotSett) {
        // Clear out any old children
        while (this.#elements.settInfo.hasChildNodes()) {
          settInfo.removeChild(settInfo.firstChild);
        }

        // Add element for each color
        for (
          let colorIdx = 0;
          colorIdx < this.#settGenerator.numColors;
          colorIdx++
        ) {
          const color = sett.get_color(i);
          const colorHex = getHex(color.get_r(), color.get_g(), color.get_b());
          const count = color.get_count();

          const colorContainer = document.createElement("DIV");
          const colorLabel = document.createElement("DIV");

          colorContainer.className = "settItem";
          colorContainer.id = `settItem${i}`;
          colorContainer.style.backgroundColor = hex;

          colorLabel.className = "settItemTxt";
          colorLabel.innerText = `${hex}: ${count}`;

          colorLabel.style.color = (
            color.get_r() + color.get_g() + color.get_b()
          ) > COLOR_BRIGTHNESS_SUM ? BLACK : WHITE;

          colorContainer.appendChild(colorLabel);
          this.#elements.settInfo.appendChild(colorContainer);
        }

        // Adjust margins for scrollbar if necessary
        const sideBarElem = this.#elements.sideBar;
        if (
          sideBarElem.scrollHeight > sideBarElem.clientHeight && this.#isWebkit
        ) {
          sideBarElem.style.paddingRight = "15px";
          sideBarElem.style.outline = "none";
        } else {
          sideBarElem.style.paddingRight = null;
          sideBarElem.style.outline = null;
        }
      }
    } catch (err) {
      console.error("Error showing sett info:", err);
    }
  }

  loadSampleSett() {
    const image = new Image();

    try {
      this.#settGenerator.numColors = this.#elements.colorSlider.value;

      this.#canvas.showLoading();

      image.onload = () => {
        this.#imageLoadHandler();

        const imageData = this.#imageCanvasContext.getImageData(
          0,
          0,
          this.#elements.imageCanvas.width,
          this.#elements.imageCanvas.height
        ).data;

        setTimeout(() => this.#settGenerator.load(imageData).then(() => {
          this.#canvas.drawSett(this.#settGenerator.fullSett);
          this.#showSettInfo();
        }).catch(err => {
          console.warn(err);
        }), 15);
      }

      image.src = "./media/kandinsky.jpg";
    } catch (err) {
      console.error("Failed to load sample sett:", err);
    }
  }
}
