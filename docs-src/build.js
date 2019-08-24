const path = require('path');
const fs = require('fs').promises;
const webpack = require('webpack');
const config = require('./webpack.config.js');

config.mode = "development"; // "production" | "development" | "none"

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
    await compiler.run();
}

async function launch(destination){

}

async function run(){
    const destination = path.resolve(__dirname, '..', 'docs');

    await clean(destination);
    await copy(path.resolve(__dirname, 'static'), destination);
    await build();
    await launch(destination);
}

run();
