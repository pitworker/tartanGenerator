#![no_std]

mod utils;

extern crate js_sys;
extern crate web_sys;
extern crate alloc;

use alloc::{vec::Vec, format};
use wasm_bindgen::prelude::*;
use palette::{FromColor, IntoColor, Lab, Pixel, Srgb};
use kmeans_colors::{get_kmeans, Kmeans};

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
#[derive(Copy, Clone)]
pub struct ColorValue {
  r: u8,
  g: u8,
  b: u8,
  count: usize
}

impl ColorValue {
  fn new() -> ColorValue {
    ColorValue {
      r: 0u8,
      g: 0u8,
      b: 0u8,
      count: 0usize
    }
  }
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
  count: usize,
  num_threads: usize
}

impl Sett {
  fn new(centroids: Vec<ColorValue>, t: usize) -> Sett {
    let colors: Vec<ColorValue> = centroids
      .iter()
      .map(|c| ColorValue { r: c.r, g: c.g, b: c.b, count: c.count })
      .collect::<Vec<ColorValue>>();

    let count = colors.len();

    Sett {
      colors: colors,
      count: count,
      num_threads: t
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
  pub fn get_num_threads(&self) -> usize {
    self.num_threads
  }
  pub fn get_sett_per_thread(&self) -> Sett {
    let t_cnt: usize = self.num_threads * 2;
    let mut color_per_thread: Vec<ColorValue> =
      alloc::vec![ColorValue::new(); t_cnt];
    let num_cols = self.colors.len();
    let mut cur_thread: usize = 0;

    log!("color_per_thread has size {}", color_per_thread.len());

    for i in 0..num_cols {
      let color = self.colors[i];
      for _j in 0..color.count {
        let inv_thread: usize = t_cnt - cur_thread - 1;

        color_per_thread[cur_thread].r = self.colors[i].r;
        color_per_thread[cur_thread].g = self.colors[i].g;
        color_per_thread[cur_thread].b = self.colors[i].b;
        color_per_thread[cur_thread].count = 1;

        color_per_thread[inv_thread].r = self.colors[i].r;
        color_per_thread[inv_thread].g = self.colors[i].g;
        color_per_thread[inv_thread].b = self.colors[i].b;
        color_per_thread[inv_thread].count = 1;

        cur_thread += 1;
      }
    }

    Sett {
      colors: color_per_thread,
      count: t_cnt,
      num_threads: t_cnt
    }
  }
}

#[wasm_bindgen]
pub struct TartanGenerator {
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
  pub fn new(pxl: &[u8]) -> TartanGenerator {
    utils::set_panic_hook();
    log!("making new tartan");
    let pxl_no_alpha = Self::remove_alpha(pxl);


    log!("made size");
    let pixels: Vec<Lab> = Srgb::from_raw_slice(pxl_no_alpha.as_slice())
      .iter()
      .map(|p| p.into_format().into_color())
      .collect();

    log!("lab generated");

    TartanGenerator {
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

    let total_count: usize = result.indices.len();
    let mut new_count = total_count;
    let mut new_t = t;
    let mut tmp_t = new_t;
    let mut counts: Vec<usize> = alloc::vec![0usize; centroid_vals.len()];
    result.indices
      .iter()
      .for_each(|i| counts[*i as usize] +=1);

    // Assign 1 thread to all colors with thread proportions <= 1
    for i in 0..counts.len() {
      if ((counts[i] as f32 / total_count as f32) * t as f32) <= 1.0 {
        centroid_vals[i].count = 1;
        tmp_t -= 1;
        new_count -= counts[i];
      }
    }
    new_t = tmp_t;

    // Assign floor of thread proportion to all remaining colors
    for i in 0..counts.len() {
      if centroid_vals[i].count == 0 {
        let t_cnt =
          ((counts[i] as f32 / new_count as f32) * new_t as f32) as usize;
        centroid_vals[i].count = t_cnt;
        tmp_t -= t_cnt;
      }
    }
    new_t = tmp_t;

    // For any remaining threads, assign to color with proportion closest to
    // ceiling, but not exceeding it
    for _i in 0..new_t {
      let mut closest: usize = 0;
      for j in 0..counts.len() {
        let prop = (counts[j] as f32 / total_count as f32) * t as f32;
        let prop_ceil = prop.ceil();
        let prop_diff = prop_ceil - prop;
        let prop_assigned = centroid_vals[j].count as f32;

        let closest_prop =
          (counts[closest] as f32 / total_count as f32) * t as f32;
        let closest_diff = closest_prop.ceil() - closest_prop;

        if centroid_vals[j].count == 0 ||
          (prop_diff < closest_diff &&
           prop_ceil - prop_assigned > 0.0 &&
           centroid_vals[closest].count != 0) {
          closest = j;
        }
      }
      centroid_vals[closest].count += 1;
    }

    log!("Got centroids");

    Sett::new(centroid_vals, t)
  }
}
