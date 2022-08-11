#![no_std]

mod utils;

extern crate js_sys;
extern crate web_sys;
extern crate alloc;

use core::fmt;
use alloc::{vec::Vec, format};
use wasm_bindgen::prelude::*;
use palette::{FromColor, IntoColor, Lab, Pixel, Srgb};
use kmeans_colors::{get_kmeans, Kmeans};

//use kmeans::*;

macro_rules! log  {
  ( $( $t:tt )* ) => {
    web_sys::console::log_1(&format!( $( $t )* ).into())
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
pub fn log_something() {
  log!("Hello, tartan-generator!");
}

#[wasm_bindgen]
pub fn take_img(img_data: &[u8]) {
  log!("it work? {0}", img_data[0]);
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub struct ColorValue {
  r: u8,
  g: u8,
  b: u8,
  count: usize
}

#[wasm_bindgen]
impl ColorValue {
  pub fn get_r(&self) -> u8 {
    self.r
  }
  pub fn get_g(&self) -> u8 {
    self.g
  }
  pub fn get_b(&self) -> u8 {
    self.b
  }
  pub fn get_count(&self) -> usize {
    self.count
  }
}


#[wasm_bindgen]
pub struct Sett {
  colors: Vec<ColorValue>,
  count: usize
}

impl Sett {
  fn new(centroids: Vec<ColorValue>, t: usize) -> Sett {
    let total_pxls : usize = centroids
      .iter()
      .fold(0, |total, c| total + c.count);
    let colors: Vec<ColorValue> = centroids
      .iter()
      .map(|c| ColorValue { r: c.r, g: c.g, b: c.b, count: c.count })
      .collect::<Vec<ColorValue>>();

    let count = colors.len();

    Sett {
      colors: colors,
      count: count
    }
  }
}

#[wasm_bindgen]
impl Sett {
  pub fn get_count(&self) -> usize {
    self.count
  }
  pub fn get_color(&self, i: usize) -> Option<ColorValue> {
    if i < self.count {
      Some(self.colors[i])
    } else {
      None
    }
  }
}

#[wasm_bindgen]
pub struct TartanGenerator {
  size: usize,
  pixels: Vec<Lab>
}

impl TartanGenerator {
  fn remove_alpha(pxl: &[u8]) -> Vec<u8> {
    let l = pxl.len() / 4;
    log!("l is {0}", l);

    let mut pxl_no_alpha: Vec<u8> = alloc::vec![0u8; l * 3];

    log!("pxl_no_alpha has len {0}", pxl_no_alpha.len());

    for i in 0..l {
      let i4 = i * 4;
      let i3 = i * 3;
      let a: f32 = pxl[i4 + 3] as f32 / 255.0;
      let (r, g, b) = (
        (pxl[i4] as f32 * a) as u8,
        (pxl[i4 + 1] as f32 * a) as u8,
        (pxl[i4 + 2] as f32 * a) as u8
      );
      pxl_no_alpha[i3] = r;
      pxl_no_alpha[i3 + 1] = g;
      pxl_no_alpha[i3 + 2] = b;
    }

    pxl_no_alpha
  }
}

#[wasm_bindgen]
impl TartanGenerator {
  #[wasm_bindgen(constructor)]
  pub fn new(s: u32, pxl: &[u8]) -> TartanGenerator {
    utils::set_panic_hook();
    log!("making new tartan");
    let size = s as usize;

    let pxl_no_alpha = Self::remove_alpha(pxl);


    log!("made size");
    let pixels: Vec<Lab> = Srgb::from_raw_slice(pxl_no_alpha.as_slice())
      .iter()
      .map(|p| p.into_format().into_color())
      .collect();

    log!("lab generated");

    TartanGenerator {
      size,
      pixels
    }
  }

  /**
   * n: number of colors
   * t: thread count. Requires t >= n
   */
  pub fn make_sett(&self, n: usize, t: usize) -> Sett {
    log!("Making sett");
    let mut result = Kmeans::new();
    let rand_seed = (js_sys::Math::random() * 255.0) as u64;
    for i in 0..250 {
      let run_result = get_kmeans(
        n,
        250,
        0.05,
        false,
        &self.pixels,
        rand_seed + i as u64
      );
      if run_result.score < result.score {
        result = run_result;
      }
    }

    log!("Got kmeans value");

    let rgb = &result.centroids
      .iter()
      .map(|x| Srgb::from_color(*x).into_format())
      .collect::<Vec<Srgb<u8>>>();

    let mut centroid_vals = rgb
      .iter()
      .map(|c| ColorValue { r: c.red, g: c.green, b: c.blue, count: 0 })
      .collect::<Vec<ColorValue>>();

    let mut total_count: usize = result.indices.len();
    let mut new_total_count = total_count;
    let mut counts: Vec<usize> = alloc::vec![0usize; centroid_vals.len()];
    result.indices
      .iter()
      .for_each(|i| counts[*i as usize] +=1);

    for i in 0..counts.len() {
      if ((counts[i] as f32 / total_count as f32) * t as f32) < 1.0 {
        centroid_vals[i].count = 1;
        new_total_count -= 1;
      }
    }
    total_count = new_total_count;
    for i in 0..counts.len() {
      if centroid_vals[i].count == 0 {
        let p_cnt =
          ((counts[i] as f32 / total_count as f32) * t as f32) as usize;
        centroid_vals[i].count = p_cnt;
        new_total_count -= p_cnt;
      }
    }

    log!("Got centroids");

    //log!("Centroids: {:?}", centroid_vals);

    Sett::new(centroid_vals, t)
  }
}
