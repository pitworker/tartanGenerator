import { memory } from "tartan-generator/tartan_generator_bg";
import { TartanGenerator, Sett } from "tartan-generator";

export default class SettGenerator {
  #gotSett;
  #sett;
  #fullSett;

  numColors = NUM_COLORS_DEFAULT;
  numThreads = NUM_THREADS_DEFAULT;

  constructor() {
    this.#gotSett = false;
    this.#sett = null;
    this.#fullSett = null;
  }

  #printColors() {
    if (this.#sett) {
      let colors = "[";
      for (let colorIdx = 0; colorIdx < this.numColors; colorIdx++) {
        let color = this.#sett.get_color(colorIdx);
        colors += "\n  {";
        colors += `\n    r: ${color.get_r()}, `
        colors += `\n    g: ${color.get_g()}, `
        colors += `\n    b: ${color.get_b()}, `
        colors += `\n    count: ${color.get_count()}`
        colors += "\n  }";
        if (colorIdx != this.numColors - 1) colors += ","
      }
      colors += "\n]";
      console.log("colors:", colors);
    }
  }

  load(imageData) {
    return new Promise((resolve, reject) => {
      if (imageData) {
        console.log("Got image data:", imageData);

        const tartanGenerator = new TartanGenerator(imageData);

        console.log("made new tartan generator");

        this.#sett = tartanGenerator.make_sett(this.numColors, this.numThreads);
        this.#fullSett = this.#sett.get_sett_per_thread();

        console.log(`made sett with ${sett.get_count()} colors`);

        this.#printColors();

        this.#gotSett = true;

        resolve();
      } else {
        reject("No image data");
      }
    };
  }

  get gotSett() {
    return this.#gotSett;
  }

  get sett() {
    return this.#sett;
  }

  get fullSett() {
    return this.#fullSett;
  }
}
