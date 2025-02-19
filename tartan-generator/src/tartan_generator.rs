extern crate js_sys;
extern crate alloc;

use alloc::{vec::Vec, format};
use wasm_bindgen::prelude::*;
use palette::{FromColor, IntoColor, Lab, Pixel, Srgb};
use kmeans_colors::{get_kmeans, Kmeans};

use super::utils::{log, set_panic_hook};
use super::color_group::ColorGroup;
use super::sett::Sett;

const NUM_CLUSTERING_RUNS: usize = 250;
const MAX_CLUSTERING_ITERATIONS: usize = 250;
const CLUSTERING_CONVERGENCE_FACTOR: f32 = 0.05;
const CLUSTERING_OUTPUT_IS_VERBOSE: bool = false;

#[wasm_bindgen]
pub struct TartanGenerator {
  image_pixels: Vec<Lab>
}

impl TartanGenerator {
  fn remove_alpha(channels_rgba: &[u8]) -> Vec<u8> {
    let num_pixels = channels_rgba.len() / 4;
    log!("num_pixels is {0}", num_pixels);

    let mut channels_rgb: Vec<u8> = alloc::vec![0u8; num_pixels * 3];

    log!("pixels_no_alpha has len {0}", channels_rgb.len());

    for pixel_index_offset in 0..num_pixels {
      let channel_index_offset_rgba = pixel_index_offset * 4;
      let channel_index_offset_rgb = pixel_index_offset * 3;

      let channel_rgba_index_r = channel_index_offset_rgba;
      let channel_rgba_index_g = channel_index_offset_rgba + 1;
      let channel_rgba_index_b = channel_index_offset_rgba + 2;
      let channel_rgba_index_a = channel_index_offset_rgba + 3;

      let channel_rgb_index_r = channel_index_offset_rgb;
      let channel_rgb_index_g = channel_index_offset_rgb + 1;
      let channel_rgb_index_b = channel_index_offset_rgb + 2;

      let (channel_r, channel_g, channel_b, channel_a) = (
        channels_rgba[channel_rgba_index_r],
        channels_rgba[channel_rgba_index_g],
        channels_rgba[channel_rgba_index_b],
        channels_rgba[channel_rgba_index_a]
      );

      // Use alpha channel to modify intensity of red, green, blue channels
      let channel_a_as_float: f32 = channel_a as f32 / 255.0;

      channels_rgb[channel_rgb_index_r] =
        (channel_r as f32 * channel_a_as_float) as u8;
      channels_rgb[channel_rgb_index_g] =
        (channel_g as f32 * channel_a_as_float) as u8;
      channels_rgb[channel_rgb_index_b] =
        (channel_b as f32 * channel_a_as_float) as u8;
    }

    channels_rgb
  }
}

#[wasm_bindgen]
impl TartanGenerator {
  #[wasm_bindgen(constructor)]
  pub fn new(channels_rgba: &[u8]) -> TartanGenerator {
    set_panic_hook();
    log!("making new tartan");
    let channels_rgb = Self::remove_alpha(channels_rgba);


    log!("made size");
    let pixels_lab: Vec<Lab> = Srgb::from_raw_slice(channels_rgb.as_slice())
      .iter()
      .map(|pixel_rgb| pixel_rgb.into_format().into_color())
      .collect();

    log!("lab generated");

    TartanGenerator {
      image_pixels: pixels_lab
    }
  }

  /**
   * color_count: number of colors
   * thread_count: thread count. Requires thread_count >= color_count
   */
  pub fn make_sett(
    &self,
    color_count: usize,
    thread_count: usize
  ) -> Sett {
    log!("Making sett");
    let mut result = Kmeans::new();
    let rand_seed = (js_sys::Math::random() * 255.0) as u64;
    for run_idx in 0..NUM_CLUSTERING_RUNS {
      let run_result = get_kmeans(
        color_count,
        MAX_CLUSTERING_ITERATIONS,
        CLUSTERING_CONVERGENCE_FACTOR,
        CLUSTERING_OUTPUT_IS_VERBOSE,
        &self.image_pixels,
        rand_seed + run_idx as u64
      );
      if run_result.score < result.score {
        result = run_result;
      }
    }

    log!("Got kmeans value");

    let centroid_rgb_pixels = &result.centroids
      .iter()
      .map(|centroid_lab| Srgb::from_color(*centroid_lab).into_format())
      .collect::<Vec<Srgb<u8>>>();

    let mut centroid_rgb_color_groups = centroid_rgb_pixels
      .iter()
      .map(|pixel| ColorGroup {
        r: pixel.red,
        g: pixel.green,
        b: pixel.blue,
        count: 0 }
      )
      .collect::<Vec<ColorGroup>>();

    let total_color_count: usize = result.indices.len();
    let mut unassigned_color_count = total_color_count;
    let mut total_unassigned_thread_count = thread_count;
    let mut total_remaining_thread_count = total_unassigned_thread_count;
    let mut thread_counts: Vec<usize> =
      alloc::vec![0usize; centroid_rgb_color_groups.len()];

    result.indices
      .iter()
      .for_each(|result_idx| thread_counts[*result_idx as usize] += 1);

    // Assign 1 thread to all colors with thread proportions <= 1
    for thread_idx in 0..thread_counts.len() {
      if ((
        thread_counts[thread_idx] as f32 / total_color_count as f32
      ) * thread_count as f32) <= 1.0 {
        centroid_rgb_color_groups[thread_idx].count = 1;
        total_remaining_thread_count -= 1;
        unassigned_color_count -= thread_counts[thread_idx];
      }
    }

    total_unassigned_thread_count = total_remaining_thread_count;

    // Assign floor of thread proportion to all remaining colors
    for thread_idx in 0..thread_counts.len() {
      if centroid_rgb_color_groups[thread_idx].count == 0 {
        let proportional_thread_count = ((
          thread_counts[thread_idx] as f32 / unassigned_color_count as f32
        ) * total_unassigned_thread_count as f32) as usize;

        centroid_rgb_color_groups[thread_idx].count = proportional_thread_count;
        total_remaining_thread_count -= proportional_thread_count;
      }
    }

    total_unassigned_thread_count = total_remaining_thread_count;

    // For any remaining threads, assign to color with proportion closest to
    // ceiling, but not exceeding it
    for _thread in 0..total_unassigned_thread_count {
      let mut closest: usize = 0;

      for color_idx in 0..thread_counts.len() {
        let prop = (
          thread_counts[color_idx] as f32 / total_color_count as f32
        ) * thread_count as f32;
        let prop_ceil = prop.ceil();
        let prop_diff = prop_ceil - prop;
        let prop_assigned = centroid_rgb_color_groups[color_idx].count as f32;

        let closest_prop = (
          thread_counts[closest] as f32 / total_color_count as f32
        ) * thread_count as f32;
        let closest_prop_diff = closest_prop.ceil() - closest_prop;

        if centroid_rgb_color_groups[color_idx].count == 0 || (
          prop_diff < closest_prop_diff &&
          prop_ceil - prop_assigned > 0.0 &&
          centroid_rgb_color_groups[closest].count != 0
        ) {
          closest = color_idx;
        }
      }
      centroid_rgb_color_groups[closest].count += 1;
    }

    log!("Got centroids");

    Sett::new(centroid_rgb_color_groups, thread_count)
  }
}
