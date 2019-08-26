const path = require("path");
const http = require("http");
const parseArgs = require("minimist");
const finalhandler = require("finalhandler");
const open = require("open");
const webpack = require("webpack");
const serveStatic = require("serve-static");

const logger = require("./logger");
const {File, Directory} = require("./file-utils");

async function build(params, config, handler){
    config.buildConfig.mode = config.buildConfig.mode || params.mode || "production";
    const compiler = webpack(config.buildConfig);
    if(params.watch){
        await new Promise((res, rej)=>{
            compiler.watch(
                {
                    aggregateTimeout: 1,
                    ignored:          /node_modules/
                },
                (err, stats)=>{
                    if(err){
                        rej(err);
                    }else{
                        handler(err, stats);
                        res(stats);
                    }
                }
            );
        });
    }else{
        await new Promise((res, rej)=>{
            compiler.run((err, stats)=>{
                if(err){
                    rej(err);
                }else{
                    handler(err, stats);
                    res(stats);
                }
            });
        });
    }
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

async function run(prm){
    const params = Object.assign(
        {
            run:    false,
            watch:  true,
            mode:   "development",
            port:   8081,
            config: "./docs.config.js"
        },
        prm
    );

    const configPath = path.resolve(params.config);
    if(!File.exists(configPath)){
        throw new Error("Could not find config file.");
    }
    const config = require(configPath);

    const port = params.port;
    const host = `http://localhost:${port}`;

    logger.info("Building Glaze Docs");

    logger.info(`Cleaning ${config.destination}`);
    await Directory.empty(config.destination);

    logger.info("Copying static files");
    await Directory.copy(config.static, config.destination);

    function handler(err, stats){
        if(err){
            logger.error(err);
        }

        if(stats && (stats.hasErrors() || stats.hasWarnings())){
            const {errors, warnings} = stats.toJson();

            errors.forEach(e=>logger.error(e));
            warnings.forEach(w=>logger.error(w));
        }

        if(!err && !stats.hasErrors() && !stats.hasWarnings()){
            logger.info("Project built");
        }
    }

    logger.info("Building project");
    await build(params, config, handler);

    if(params.run){
        logger.info(`Launching dev server on ${port}`);
        await launch(config.destination, port);

        logger.info("Opening browser");
        await open(host);

        if(params.watch){
            logger.info("Listening for changes");
        }
    }
}

const args = parseArgs(process.argv.slice(2), {
    alias: {
        run:    "r",
        watch:  "w",
        mode:   "m",
        config: "c",
        port:   "p"
    }
});
run(args);
