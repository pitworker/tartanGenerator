#![no_std]

mod utils;
mod color_group;

extern crate alloc;

use alloc::{vec::Vec, format};
use wasm_bindgen::prelude::*;

use utils::log;
use color_group::ColorGroup;

#[wasm_bindgen]
pub struct Sett {
  colors: Vec<ColorGroup>,
  color_count: usize,
  thread_count: usize
}

impl Sett {
  fn new(centroids: Vec<ColorGroup>, t: usize) -> Sett {
    let colors: Vec<ColorGroup> = centroids
      .iter()
      .map(|color| ColorGroup {
        r: color.r,
        g: color.g,
        b: color.b,
        count: color.count
      })
      .collect::<Vec<ColorGroup>>();

    let color_count = colors.len();

    Sett {
      colors: colors,
      color_count: color_count,
      thread_count: t
    }
  }
}

#[wasm_bindgen]
impl Sett {
  pub fn get_color_count(&self) -> usize {
    self.color_count
  }

  pub fn get_color(&self, i: usize) -> Option<ColorGroup> {
    if i < self.color_count {
      Some(self.colors[i])
    } else {
      None
    }
  }

  pub fn get_thread_count(&self) -> usize {
    self.thread_count
  }

  pub fn get_sett_per_thread(&self) -> Sett {
    let mirrored_thread_count usize = self.thread_count * 2;
    let mut colors_per_thread: Vec<ColorGroup> =
      alloc::vec![ColorGroup::new(); mirrored_thread_count];
    let num_cols = self.colors.len();
    let mut cur_thread: usize = 0;

    log!("colors_per_thread has size {}", colors_per_thread.len());

    for i in 0..num_cols {
      let color = self.colors[i];
      for _j in 0..color.count {
        let inv_thread: usize = mirrored_thread_count - cur_thread - 1;

        colors_per_thread[cur_thread].r = self.colors[i].r;
        colors_per_thread[cur_thread].g = self.colors[i].g;
        colors_per_thread[cur_thread].b = self.colors[i].b;
        colors_per_thread[cur_thread].count = 1;

        colors_per_thread[inv_thread].r = self.colors[i].r;
        colors_per_thread[inv_thread].g = self.colors[i].g;
        colors_per_thread[inv_thread].b = self.colors[i].b;
        colors_per_thread[inv_thread].count = 1;

        cur_thread += 1;
      }
    }

    Sett {
      colors: colors_per_thread,
      color_count: mirrored_thread_count,
      thread_count: mirrored_thread_count
    }
  }
}
