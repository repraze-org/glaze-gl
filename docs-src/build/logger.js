const LEVELS = Object.freeze({
    debug: 0,
    info:  1,
    warn:  2,
    error: 3
});

const SYM = Object.freeze({
    LOG:   Symbol("log"),
    LEVEL: Symbol("level")
});

class Logger{
    constructor(params){
        this.params = Object.assign(
            {
                level:     "info",
                transport: console.log
            },
            params
        );
        this[SYM.LEVEL] = LEVELS[this.params.level] || LEVELS["info"];
        Object.entries(LEVELS).forEach(([name, level])=>{
            this[name] = (...args)=>this[SYM.LOG](level, ...args);
        });
    }
    setLevel(level){
        this[SYM.LEVEL] = LEVELS[level] || LEVELS["info"];
    }
    [SYM.LOG](level, ...args){
        if(level >= this[SYM.LEVEL]){
            this.params.transport(...args);
        }
    }
    log(...args){
        this.params.transport(...args);
    }
}

const instance = new Logger();

module.exports = instance;
