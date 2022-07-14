mod utils;

extern crate web_sys;
extern crate kmeans;

use wasm_bindgen::prelude::*;

macro_rules! log  {
  ( $( $t:tt )* ) => {
    web_sys::console::log_1(&format!( $( $t )* ).into());
  }
}

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
  fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
  alert("Hello, tartan-generator!");
}

#[wasm_bindgen]
pub fn take_img(img_data: &[u8]) {
  log!("it work? {0}", img_data[0]);
}

#[wasm_bindgen]
pub struct TartanGenerator {
  size: usize,
  pixels: Vec<f32>
}

#[wasm_bindgen]
impl TartanGenerator {
  pub fn new(s: u32, pxl: &[u8]) -> TartanGenerator {
    let size = s as usize;
    let mut pixels: Vec<f32> = vec![0.0f32;size];
    for i in 0..size {
      pixels[i as usize] = (pxl[i as usize] as f32) / 255.0;
    }

    log!("length??? {0}", pixels.len());

    TartanGenerator {
      size,
      pixels
    }
  }
}
