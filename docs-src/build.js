const path = require('path');
const fs = require('fs').promises;
const http = require('http');
const finalhandler = require('finalhandler');
const open = require('open');
const webpack = require('webpack');
const serveStatic = require('serve-static');

const config = require('./webpack.config.js');

config.mode = "development"; // "production" | "development" | "none"
config.watch = true;

async function clean(destination){
    const files = await fs.readdir(destination);
    for(const file of files){
        const location = path.join(destination, file);
        const stats = await fs.stat(location);
        if(stats.isDirectory()){
            await clean(location);
            await fs.rmdir(location);
        }else{
            await fs.unlink(location);
        }
    }
}

async function copy(source, destination){
    const files = await fs.readdir(source);
    for(const file of files){
        const sourceLocation = path.join(source, file);
        const destinationLocation = path.join(destination, file);
        const stats = await fs.stat(sourceLocation);
        if(stats.isDirectory()){
            await fs.mkdir(destinationLocation);
            await copy(sourceLocation, destinationLocation);
        }else{
            await fs.copyFile(sourceLocation, destinationLocation);
        }
    }
}

async function build(){
    const compiler = webpack(config);
    await new Promise((res, rej)=>{
        compiler.watch({
            aggregateTimeout: 1,
            ignored: /node_modules/,
        }, (err, stats)=>{
            res();
            if(err || stats.hasErrors()){
                // TODO
            }
        });
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
    const name = 'glaze-reload-watch';

    compile.tap(name, invalidNext);
    invalid.tap(name, invalidNext);
    done.tap(name, (stats)=>{
        validNext(stats);
    });
}

async function run(){
    const destination = path.resolve(__dirname, '..', 'docs');
    const port = 8080;
    const host = `http://localhost:${port}`;

    console.log(`Building Glaze Docs`);

    console.log(`Cleaning ${destination}`);
    await clean(destination);

    console.log(`Copying static files`);
    await copy(path.resolve(__dirname, 'static'), destination);

    console.log(`Building project`);
    const compiler = await build();

    console.log(`Launching dev server on ${port}`);
    await launch(destination, port);

    console.log(`Opening browser`);
    await open(host);

    console.log(`Listening for changes`);
    await watch(compiler, (params)=>{
        console.log(`Project build failed`);
    }, (params)=>{
        console.log(`Project updated, reloading`);
    });
}

run();
