const config = require("webpack-config-narazaka-ts-js").node;

config.entry.NarLoader = "./src/lib/NarLoader.ts";
config.output.library = "narLoader";

module.exports = config;
