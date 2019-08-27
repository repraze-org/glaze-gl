const path = require("path");

module.exports = {
    entry:  ["babel-polyfill", path.resolve(__dirname, "src", "index.js")],
    output: {
        filename:      "bundle.js",
        path:          path.resolve(__dirname, "..", "docs", "js"),
        publicPath:    "js/",
        chunkFilename: "[name].chunk.js"
    },
    module: {
        rules: [
            {
                test:    /\.(jsx|js)?$/,
                exclude: /node_modules/,
                use:     {
                    loader: "babel-loader"
                }
            },
            {
                test: /\.css/,
                use:  [
                    {
                        loader: "style-loader" // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    }
                ]
            },
            {
                test: /\.(sass|scss)$/,
                use:  [
                    {
                        loader: "style-loader" // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "sass-loader" // compiles Less to CSS
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: [".js", ".jsx", ".json"],
        modules:    ["node_modules", "./src"],
        alias:      {
            glaze: path.resolve(__dirname, "..")
        }
    }
};
