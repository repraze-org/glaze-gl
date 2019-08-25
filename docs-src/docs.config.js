const path = require("path");
const buildConfig = require("./webpack.config.js");

module.exports = {
    static:      path.resolve(__dirname, "static"),
    destination: path.resolve(__dirname, "..", "docs"),
    buildConfig: buildConfig
};
