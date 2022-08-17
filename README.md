# Tartan Generator

## Description

Tartan Generator is a web app that generates symmetrical tartans based on color palettes of user-uploaded images. After a user uploads an image, raw pixel data is passed to a WebAssembly backend (compiled from Rust) that uses K-Means clustering to find K dominant colors. These colors, and their relative proportions are passed back to the frontend in order to draw the tartan.

A production version of the app can be found [here](https://pitworker.github.io/tartanGenerator/).

## License

Copyright © 2022 Swan Carpenter

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License for more details.

A copy of the GNU General Public License can be found in this repository, as well as at the [GNU website](https://www.gnu.org/licenses/).

## How to Run

1. Compile the Rust backend to WASM in the command line:
   From the terminal, in this repo's main directory: `cd tartan-generator && wasm-pack build`
2. Launch the server:
   From the terminal, in this repo's main directory: `cd frontend && npm run start`
3. Navigate to `localhost:8080` in a web browser.
