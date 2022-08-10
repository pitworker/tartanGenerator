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
struct ColorValue {
  r: u8,
  g: u8,
  b: u8,
  count: usize
}
/*
//#[wasm_bindgen]
impl fmt::Debug for ColorValue {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    f.debug_struct("ColorValue")
      .field("r", &self.r)
      .field("g", &self.g)
      .field("b", &self.b)
      .field("count", &self.count)
      .finish()
  }
}
*/
#[wasm_bindgen]
pub struct Sett {
  colors: Vec<ColorValue>,
  count: usize
}

#[wasm_bindgen]
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
    //centroids.iter().for_each(|c|

    /*
    for i in 0..l {
      if centroids[i] < 0.0f32 {
        colors[i] = (0u8, cent_freq[i]);
      } else {
        colors[i] = ((centroids[i] * 255.0).round() as u8, cent_freq[i]);
      }
    }
    */
    Sett {
      colors: colors,
      count: count
    }
  }
}

#[wasm_bindgen]
pub struct TartanGenerator {
  size: usize,
  pixels: Vec<Lab>
}

#[wasm_bindgen]
impl TartanGenerator {
  pub fn new(s: u32, pxl: &[u8]) -> TartanGenerator {
    utils::set_panic_hook();
    log!("making new tartan");
    const pxl_cnt: usize = s * 3;
    let size = s as usize;

    let mut random_pxl: [u8; pxl_cnt] = [0; pxl_cnt];
    for i in 0..pxl_cnt {
      random_pxl[i] = (js_sys::Math::random() * 255.0) as u8;
    }

    log!("made size");
    let pixels: Vec<Lab> = Srgb::from_raw_slice(&random_pxl)
      .iter()
      .map(|p| p.into_format().into_color())
      .collect();

    log!("lab generated");

    TartanGenerator {
      size,
      pixels
    }
  }

  /*** Keeping this one on the backburner for now.
  pub fn replace_img(&mut self, s: u32, pxl: &[u8]) {
    let size = s as usize;

    if self.size > size {
      self.pixels.resize(size, Lab::new(0.0,0.0,0.0));
    } else if self.size < size {
      self.pixels.truncate(size);
    }
    self.size = size;

    pxl
      .iter()
      .for_each(|p|)
      .collect();

    for i in 0..size {
      self.pixels[i as usize] = (pxl[i as usize] as f32) / 255.0;
    }
  }
  */

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
    result.indices
      .iter()
      .for_each(|i| centroid_vals[*i as usize].count +=1);

    log!("Got centroids");

    //log!("Centroids: {:?}", centroid_vals);

    Sett::new(centroid_vals, t)

    /*** Using the old kmeans library
    let subpix = 3; // number of subpixels, 3 for RGB
    let (sample_cnt, sample_dims, k, max_iter) =
      (self.size / subpix, subpix, n, 1000);

    let (sample_cnt, sample_dims, k, max_iter) =
      (10000, 3, 4, 100);

    // Generate some random data
    let mut samples = vec![0.0f32;sample_cnt * sample_dims];
    samples.iter_mut().for_each(|v| *v = js_sys::Math::random() as f32);

    // Calculate kmeans, using kmean++ as initialization-method
    log!("WHAT");
    let kmean = KMeans::new(samples, sample_cnt, sample_dims);
    log!("IS");
    let result = kmean.kmeans_lloyd(
      k, max_iter, KMeans::init_kmeanplusplus, &KMeansConfig::default()
    );
    log!("UP");

    println!("Centroids: {:?}", result.centroids);
    println!("Cluster-Assignments: {:?}", result.assignments);
    println!("Error: {}", result.distsum);
    /*
    let conf = kmeans::KMeansConfig::build()
      .init_done(&|_| log!("Initialization completed."))
      .iteration_done(&|s, nr, new_distsum|
        log!("Iteration {} - Error: {:.2} -> {:.2} | Improvement: {:.2}",
          nr, s.distsum, new_distsum, s.distsum - new_distsum))
      .build();
    log!("it work???");
    let kmean = KMeans::new(self.pixels.to_vec(), sample_cnt, sample_dims);

    let result = kmean.kmeans_minibatch(
      4, k, max_iter, KMeans::init_random_sample, &conf
    );

    log!("Centroids: {:?}", result.centroids);
    log!("Cluster-Sizes: {:?}", result.centroid_frequency);
    log!("Error: {}", result.distsum);
    */
    Sett::new(result.centroids, result.centroid_frequency)
    */
  }
}
