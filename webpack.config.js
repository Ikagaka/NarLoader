const webpack = require("webpack");
const path = require("path");
const tsconfig = require("./tsconfig.json");

tsconfig.compilerOptions.target = "es5";
tsconfig.compilerOptions.outDir = "web";

module.exports = {
  entry:  {NarLoader: "./lib/NarLoader.ts"},
  output: {
    library:       "narLoader",
    libraryTarget: "umd",
    path:          path.resolve("."),
    filename:      "web/lib/[name].js",
  },
  module: {
    rules: [
      {
        test:    /\.ts$/,
        use: [
          {
            loader: "webpack-espower-loader",
          },
          {
            loader:  "ts-loader",
            options: {compilerOptions: tsconfig.compilerOptions},
          },
        ],
        exclude: /node_modules/,
      },
    ],
    noParse: /browserfs\.js/,
  },
  resolve: {
    extensions: [
      ".ts",
      ".js",
    ],
    alias: {
      "fs": "browserfs/dist/shims/fs.js",
      "buffer": "browserfs/dist/shims/buffer.js",
      "path": "browserfs/dist/shims/path.js",
      "processGlobal": "browserfs/dist/shims/process.js",
      "bufferGlobal": "browserfs/dist/shims/bufferGlobal.js",
      "bfsGlobal": require.resolve("browserfs"),
    },
  },
  node: {
    process: false,
    Buffer: false,
  },
  plugins: [
    new webpack.ProvidePlugin({BrowserFS: "bfsGlobal", process: "processGlobal", Buffer: "bufferGlobal"}),
  ],
  devtool: "source-map",
};
