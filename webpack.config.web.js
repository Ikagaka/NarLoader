const config = require("webpack-config-narazaka-ts-js").web;

config.entry.NarLoader = "./src/lib/NarLoader.ts";
config.output.library = "narLoader";

module.exports = config;
