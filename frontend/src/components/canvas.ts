import * as P5 from "p5";
import { Sett } from "tartan-generator";

const DEFAULT_THREAD_SIZE = 2;

const WARP = true;
const WEFT = false;

const WARP_OFFSET_MULTIPLIER = 1.25;
const WEFT_OFFSET_MULTIPLIER = 0.75;

const WHITE = 255;

/************************
 * TARTAN DRAWING STUFF *
 ************************/

export default class Canvas {
  private threadSize = DEFAULT_THREAD_SIZE;
  private sketch: P5 | null = null;
  private p5Instance: P5 | null = null;

  gotSett = false;

  private fullSett: Sett | null = null;

  private elements: { loading: HTMLElement | null } = {
    loading: null,
  };

  constructor(threadSize?: number) {
    if (threadSize) {
      this.threadSize = threadSize;
    }

    this.elements.loading = document.getElementById("loading");
    this.p5Instance = new P5(
      (sketch: P5) => this.initSketch(sketch),
      document.body
    );
  }

  private initSketch(sketch: P5) {
    try {
      this.sketch = sketch;

      this.sketch.setup = () => {
        this.sketch.createCanvas(
          this.sketch.windowWidth,
          this.sketch.windowHeight
        );
        this.sketch.noLoop();
        this.sketch.draw();
      };

      this.sketch.windowResized = () => {
        this.sketch.resizeCanvas(
          this.sketch.windowWidth,
          this.sketch.windowHeight
        );
        this.sketch.draw();
      };

      this.sketch.draw = () => {
        this.sketch.background(WHITE);
        this.drawSett();
      };
    } catch (err: any) {
      console.error("Error initializing sketch:", err);
    }
  }

  private drawThreads(isWarp: boolean) {
    if (this.sketch) {
      try {
        const numThreads: number = isWarp ?
          this.sketch.width :
          this.sketch.height;
        const threadLength: number = isWarp ?
          this.sketch.height :
          this.sketch.width;

        for (
          let threadIdx = 0;
          threadIdx < numThreads / this.threadSize;
          threadIdx++
        ) {
          const startOffset = isWarp ?
            this.threadSize * WARP_OFFSET_MULTIPLIER :
            this.threadSize * WEFT_OFFSET_MULTIPLIER;
          const start = threadIdx % (this.threadSize * 2) - startOffset;
          const thread = threadIdx % this.fullSett.get_count();
          const color = this.fullSett.get_color(thread);

          this.sketch.stroke(color.get_r(), color.get_g(), color.get_b());

          for (
            let threadSection = start;
            threadSection < threadLength / this.threadSize;
            threadSection += this.threadSize * 2
          ) {
            const x = isWarp ? threadIdx : threadSection;
            const y = isWarp ? threadSection : threadIdx;

            const startX = x * this.threadSize;
            const startY = y * this.threadSize;
            const endX = startX + (isWarp ? 0 : 2) * this.threadSize;
            const endY = startY + (isWarp ? 2 : 0) * this.threadSize;

            this.sketch.line(startX, startY, endX, endY);
          }
        }
      } catch (err: any) {
        console.error("Error drawing threads:", err);
      }
    }
  }

  private drawSett() {
    if (this.sketch && this.gotSett) {
      try {
        console.log("Drawing Sett");
        this.sketch.strokeWeight(this.threadSize);
        this.sketch.strokeCap(this.sketch.SQUARE);
        this.drawThreads(WARP);
        this.drawThreads(WEFT);
        this.hideLoading();
      } catch (err: any) {
        console.error("Error drawing sett:", err);
      }
    } else if (this.sketch) {
      console.warn("Attempted to draw tartan without sett");
    } else if (this.gotSett) {
      console.warn("Attempted to draw tartan without p5 instance");
    } else {
      console.warn("Attempted to draw tartan without sett or p5 instance");
    }
  }

  draw(fullSett: Sett, gotSett: boolean) {
    this.fullSett = fullSett;
    this.gotSett = gotSett;
    if (this.sketch) {
      try {
        this.sketch.draw();
      } catch (err: any) {
        console.error("Error drawing sett:", err);
      }
    } else {
      console.warn("Attempting to draw without valid sketch object");
    }
  }

  showLoading() {
    if (this.elements.loading) {
      this.elements.loading.style.width = `${window.innerWidth - 200}px`;
      this.elements.loading.style.visibility = "visible";
    } else {
      console.warn("Attempting to display loading state before page load");
    }
  }

  hideLoading() {
    if (this.elements.loading) {
      this.elements.loading.style.visibility = "hidden";
    } else {
      console.warn("Attempting to hide loading state before page load");
    }
  }
}
