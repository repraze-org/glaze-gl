const SYM = Object.freeze({
    LOOKUP:   Symbol("lookup"),
    CHAPTERS: Symbol("chapter"),
    PAGES:    Symbol("pages"),
    INDEX:    Symbol("index")
});

function makeKey(str){
    return str
        .trim()
        .toLocaleLowerCase()
        .replace(/\s+/g, "-");
}

function makePath(str){
    return str.split("/").map(s=>makeKey(s));
}

export class Chapter{
    constructor(name, path){
        this.name = name;
        this.key = makeKey(name);
        this.path = "/" + path.join("/");

        this[SYM.INDEX] = null;
        this[SYM.PAGES] = [];
        this[SYM.CHAPTERS] = new Map();
    }
    page(name, component){
        const section = new Page(name, component);
        if(name === "index"){
            this[SYM.INDEX] = section;
        }else{
            this[SYM.PAGES].push(section);
        }
        return this;
    }
    index(){
        return this[SYM.INDEX];
    }
    pages(){
        return this[SYM.PAGES];
    }
    chapters(){
        return Array.from(this[SYM.CHAPTERS].values());
    }
}

export class Page{
    constructor(name, component){
        this.name = name;
        this.key = makeKey(name);
        this.component = component;
    }
}

export class Documentation{
    constructor(){
        this[SYM.INDEX] = null;
        this[SYM.CHAPTERS] = new Map();
        this[SYM.LOOKUP] = new Map();
    }
    load(loader){
        const context = {
            chapter: (name, config)=>{
                if(name === "index"){
                    const chapter = new Chapter("index", []);
                    this[SYM.INDEX] = chapter;
                    return chapter;
                }

                const path = makePath(name);
                const key = path.join("/");

                // compute all leading paths
                const paths = path.reduce((paths, key)=>{
                    let path = [key];
                    if(paths.length > 0){
                        path = paths[paths.length - 1].slice();
                        path.push(key);
                    }
                    paths.push(path);
                    return paths;
                }, []);
                // add chapters if missing
                paths.forEach(path=>{
                    const key = path.join("/");
                    const parentKey = path.slice(0, -1).join("/");
                    const name = path[path.length - 1];
                    if(!this[SYM.LOOKUP].has(key)){
                        const chapter = new Chapter(name, path);
                        this[SYM.LOOKUP].set(name, chapter);
                        if(parentKey === ""){
                            this[SYM.CHAPTERS].set(name, chapter);
                        }else{
                            this[SYM.LOOKUP].get(parentKey)[SYM.CHAPTERS].set(name, chapter);
                        }
                    }
                });
                return this[SYM.LOOKUP].get(key);
            }
        };

        loader.keys().forEach(filename=>{
            const loaded = loader(filename);
            if(loaded && loaded.default){
                loaded.default(context);
            }
        });
    }
    index(){
        return this[SYM.INDEX];
    }
    chapters(){
        return Array.from(this[SYM.CHAPTERS].values());
    }
}
