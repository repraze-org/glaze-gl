const path = require("path");
const fs = require("fs").promises;
const http = require("http");
const finalhandler = require("finalhandler");
const open = require("open");
const webpack = require("webpack");
const serveStatic = require("serve-static");
const fileUtils = require("./file-utils");

async function build(config){
    config.mode = "development"; // "production" | "development" | "none"
    config.watch = true;

    const compiler = webpack(config);
    await new Promise((res, rej)=>{
        compiler.watch(
            {
                aggregateTimeout: 1,
                ignored:          /node_modules/
            },
            (err, stats)=>{
                res();
                if(err || stats.hasErrors()){
                    // TODO
                }
            }
        );
    });
    return compiler;
}

async function launch(destination, port){
    const serve = serveStatic(destination);
    const server = http.createServer(function(req, res){
        const done = finalhandler(req, res);
        serve(req, res, done);
    });
    server.listen(port);
}

async function watch(compiler, invalidNext, validNext){
    const {compile, invalid, done} = compiler.hooks;
    const name = "glaze-reload-watch";

    compile.tap(name, invalidNext);
    invalid.tap(name, invalidNext);
    done.tap(name, stats=>{
        validNext(stats);
    });
}

async function run(configSrc){
    const configPath = path.resolve(configSrc || "./docs.config.js");
    if(!fileUtils.file.exists(configPath)){
        throw new Error("Could not find config file.");
    }
    const config = require(configPath);

    const port = 8080;
    const host = `http://localhost:${port}`;

    console.log(`Building Glaze Docs`);

    console.log(`Cleaning ${config.destination}`);
    await fileUtils.directory.empty(config.destination);

    console.log(`Copying static files`);
    await fileUtils.directory.copy(config.static, config.destination);

    console.log(`Building project`);
    const compiler = await build(config.buildConfig);

    console.log(`Launching dev server on ${port}`);
    await launch(config.destination, port);

    console.log(`Opening browser`);
    await open(host);

    console.log(`Listening for changes`);
    await watch(
        compiler,
        params=>{
            console.log(`Project build failed`);
        },
        params=>{
            console.log(`Project updated, reloading`);
        }
    );
}

const args = process.argv.slice(2);
run(args[0]);
