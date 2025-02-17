use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Copy, Clone)]
pub struct ColorGroup {
  pub r: u8,
  pub g: u8,
  pub b: u8,
  pub count: usize
}

impl ColorGroup {
  pub fn new() -> ColorGroup {
    ColorGroup {
      r: 0u8,
      g: 0u8,
      b: 0u8,
      count: 0usize
    }
  }
}

#[wasm_bindgen]
impl ColorGroup {
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
