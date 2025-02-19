const CopyWebpackPlugin = require("copy-webpack-plugin");
const path = require('path');

module.exports = {
  entry: "./src/bootstrap.ts",
  output: {
    path: path.resolve(__dirname, "dev"),
    filename: "bundle.js",
  },
  mode: "development",
  plugins: [
    new CopyWebpackPlugin(["src/index.html", "src/style.css", "media/*"])
  ],
};
