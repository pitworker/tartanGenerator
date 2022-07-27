mod utils;

extern crate web_sys;
//extern crate kmeans;

use wasm_bindgen::prelude::*;
use kmeans::*;
use rand::prelude::*;

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
pub fn greet() {
  alert("Hello, tartan-generator!");
}

#[wasm_bindgen]
pub fn take_img(img_data: &[u8]) {
  log!("it work? {0}", img_data[0]);
}


#[wasm_bindgen]
pub struct Sett {
  colors: Vec<(u8,usize)>
}

#[wasm_bindgen]
impl Sett {
  fn new(centroids: Vec<f32>, cent_freq: Vec<usize>) -> Sett{
    let l: usize = centroids.len();
    let mut colors: Vec<(u8,usize)> = vec![(0u8,0usize);l];

    for i in 0..l {
      if centroids[i] < 0.0f32 {
        colors[i] = (0u8, cent_freq[i]);
      } else {
        colors[i] = ((centroids[i] * 255.0).round() as u8, cent_freq[i]);
      }
    }

    Sett {
      colors: colors
    }
  }
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

    TartanGenerator {
      size,
      pixels
    }
  }

  pub fn replace_img(&mut self, s: u32, pxl: &[u8]) {
    let size = s as usize;

    if self.size > size {
      self.pixels.resize(size, 0.0f32);
    } else if self.size < size {
      self.pixels.truncate(size);
    }
    self.size = size;
    for i in 0..size {
      self.pixels[i as usize] = (pxl[i as usize] as f32) / 255.0;
    }
  }

  pub fn make_sett(&self, n: usize) -> Sett {
    let subpix = 3; // number of subpixels, 3 for RGB
    let (sample_cnt, sample_dims, k, max_iter) =
      (self.size / subpix, subpix, n, 1000);

    // Generate some random data
    let mut samples = vec![0.0f32;sample_cnt * sample_dims];
    samples.iter_mut().for_each(|v| *v = rand::random());

    // Calculate kmeans, using kmean++ as initialization-method
    let kmean = KMeans::new(samples, sample_cnt, sample_dims);
    let result = kmean.kmeans_lloyd(
      k, max_iter, KMeans::init_kmeanplusplus, &KMeansConfig::default()
    );

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
  }
}
