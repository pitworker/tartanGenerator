import SettGenerator from "./sett-generator";
import Canvas from "./canvas";

const DEFAULT_IMAGE_WIDTH = 160;

const COLOR_BRIGHTNESS_SUM = 382;

const BLACK = "#000";
const WHITE = "#fff";

const DEFAULT_IMAGE = "./media/kandinsky.jpg";

function getHex({ r, g, b }: { r: number, g: number, b: number }) {
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
  private isWebkit = false;

  private imageWidth = DEFAULT_IMAGE_WIDTH;

  private imageCanvasContext: CanvasRenderingContext2D | null = null;

  private settGenerator: SettGenerator | null = null;
  private canvas: Canvas | null = null;

  private elements: {
    colorSlider: null | HTMLInputElement,
    colorSliderNum: null | HTMLDivElement,
    uploadButton: null | HTMLInputElement,
    renderButton: null | HTMLInputElement,
    settInfo: null | HTMLDivElement,
    sideBar: null | HTMLDivElement,
    imageLoader: null | HTMLInputElement,
    imageCanvas: null | HTMLCanvasElement
  } = {
      colorSlider: null,
      colorSliderNum: null,
      uploadButton: null,
      renderButton: null,
      settInfo: null,
      sideBar: null,
      imageLoader: null,
      imageCanvas: null
    };

  constructor(
    canvas: Canvas,
    settGenerator: SettGenerator,
    imageWidth?: number
  ) {
    this.trackElements();
    this.assignListeners();

    this.elements.colorSliderNum.innerText = this.elements.colorSlider.value;

    this.imageCanvasContext = this.elements.imageCanvas.getContext("2d");

    this.canvas = canvas;
    this.settGenerator = settGenerator;

    if (imageWidth) {
      this.imageWidth = imageWidth;
    }
  }

  private trackElements() {
    try {
      this.elements.colorSlider = document.getElementById("colorSlider");
      this.elements.colorSliderNum = document.getElementById("numColors");
      this.elements.uploadButton = document.getElementById("uploadBtn");
      this.elements.renderButton = document.getElementById("renderBtn");
      this.elements.settInfo = document.getElementById("settInfo");
      this.elements.sideBar = document.getElementById("sideBar");
      this.elements.imageLoader = document.getElementById("imageLoader");
      this.elements.imageCanvas = document.getElementById("imageCanvas");
    } catch (err: any) {
      console.error("Failing to get page elements with error:", err);
    }
  }

  private assignListeners() {
    window.addEventListener("load", () => {
      const browser = (Array.prototype.slice.call(
        window.getComputedStyle(document.documentElement, "")
      ).join("").match(/-(moz|webkit|ms)-/))[1] as string;

      this.isWebkit = browser === "webkit";
    });

    if (this.elements.imageLoader) {
      this.elements.imageLoader.addEventListener(
        "change",
        (uploadEvent) => this.imageUploadHandler(uploadEvent),
        false
      );
    } else {
      console.error(
        "Attempted to add listener to imageLoader before page load"
      );
    }

    if (this.elements.colorSlider) {
      this.elements.colorSlider.oninput = () => {
        this.colorSliderInputHandler();
      };
    } else {
      console.error(
        "Attempted to add listener to colorSlider before page load"
      );
    }

    if (this.elements.renderButton) {
      this.elements.renderButton.onclick = () => {
        this.renderButtonClickHandler();
      };
    } else {
      console.error(
        "Attempted to add listener to renderButton before page load"
      );
    }

    if (this.elements.uploadButton) {
      this.elements.uploadButton.onclick = () => {
        this.uploadButtonClickHandler();
      };
    } else {
      console.error(
        "Attempted to add listener to uploadButton before page load"
      );
    }
  }

  private imageUploadHandler(uploadEvent: Event) {
    const reader = new FileReader();
    reader.onload = (readerLoadEvent) => {
      const image = new Image();
      image.src = readerLoadEvent.target.result;
      image.onload = () => this.imageLoadHandler(image);
    }
    reader.readAsDataURL(uploadEvent.target.files[0]);
  }

  private imageLoadHandler(image: HTMLImageElement) {
    try {
      this.elements.imageCanvas.width = this.imageWidth;

      this.elements.imageCanvas.height =
        this.imageWidth / image.width * image.height;

      this.imageCanvasContext.drawImage(
        image,
        0,
        0,
        this.elements.imageCanvas.width,
        this.elements.imageCanvas.height
      );
    } catch (err: any) {
      console.error("Error handling image load:", err);
    }
  }

  private colorSliderInputHandler() {
    try {
      this.elements.colorSliderNum.innerText = this.elements.colorSlider.value;
      this.settGenerator.numColors = parseInt(this.elements.colorSlider.value);
    } catch (err: any) {
      console.error("Error handling slider input:", err);
    }
  }

  private renderButtonClickHandler() {
    try {
      this.canvas.showLoading();

      const imageData = this.imageCanvasContext.getImageData(
        0,
        0,
        this.elements.imageCanvas.width,
        this.elements.imageCanvas.height
      ).data;

      setTimeout(
        () => this.settGenerator.load(imageData).then(() => {
          this.canvas.drawSett(this.settGenerator.fullSett);
          this.showSettInfo();
        }).catch((err: any) => {
          console.error(err);
        }),
        5
      );
    } catch (err: any) {
      console.error("Error handling render button click:", err);
    }
  }

  private uploadButtonClickHandler() {
    try {
      this.elements.imageLoader.click();
    } catch (err: any) {
      console.error("Error handling upload button click:", err);
    }
  }

  private showSettInfo() {
    try {
      if (this.elements.settInfo && this.settGenerator.gotSett) {
        // Clear out any old children
        while (this.elements.settInfo.hasChildNodes()) {
          this.elements.settInfo.removeChild(this.elements.settInfo.firstChild);
        }

        // Add element for each color
        for (
          let colorIdx = 0;
          colorIdx < this.settGenerator.numColors;
          colorIdx++
        ) {
          const color = this.settGenerator.sett.get_color(i)!;
          const colorHex = getHex({
            r: color.get_r(),
            g: color.get_g(),
            b: color.get_b()
          });
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
          this.elements.settInfo.appendChild(colorContainer);
        }

        // Adjust margins for scrollbar if necessary
        const sideBarElem = this.elements.sideBar;
        if (
          sideBarElem.scrollHeight > sideBarElem.clientHeight && this.isWebkit
        ) {
          sideBarElem.style.paddingRight = "15px";
          sideBarElem.style.outline = "none";
        } else {
          sideBarElem.style.paddingRight = null;
          sideBarElem.style.outline = null;
        }
      }
    } catch (err: any) {
      console.error("Error showing sett info:", err);
    }
  }

  loadSampleSett() {
    const image = new Image();

    try {
      this.settGenerator.numColors = parseInt(this.elements.colorSlider.value);

      this.canvas.showLoading();

      image.onload = () => {
        this.imageLoadHandler(image);

        const imageData = this.imageCanvasContext.getImageData(
          0,
          0,
          this.elements.imageCanvas.width,
          this.elements.imageCanvas.height
        ).data;

        setTimeout(() => this.settGenerator.load(imageData).then(() => {
          this.canvas.drawSett(this.settGenerator.fullSett);
          this.showSettInfo();
        }).catch(err => {
          console.warn(err);
        }), 15);
      }

      image.src = DEFAULT_IMAGE;
    } catch (err: any) {
      console.error("Failed to load sample sett:", err);
    }
  }
}
