const SYM = Object.freeze({
    PAGES:    Symbol("pages"),
    INDEX:    Symbol("index"),
    SECTIONS: Symbol("section")
});

function key(str){
    return str.trim().toLocaleLowerCase().replace(/\s+/g, "-");
}

function path(str){
    return "/" + str.split("/").map(s=>key(s)).join("/");
}

class Page{
    constructor(name){
        this.name = name;
        this.key = key(name);
        this.path = path(name);

        this[SYM.INDEX] = null;
        this[SYM.SECTIONS] = [];
    }
    section(name, component){
        const section = new Section(name, component);
        if(name === "index"){
            this[SYM.INDEX] = section;
        }else{
            this[SYM.SECTIONS].push(section);
        }
        return this;
    }
    index(){
        return this[SYM.INDEX];
    }
    sections(){
        return this[SYM.SECTIONS];
    }
}

class Section{
    constructor(name, component){
        this.name = name;
        this.key = key(name);
        this.component = component;
    }
}

export default class Docs{
    constructor(){
        this[SYM.INDEX] = null;
        this[SYM.PAGES] = new Map();
    }
    load(loader){
        const context = {
            page: (name, config)=>{
                const page = new Page(name);
                if(name === "index"){
                    this[SYM.INDEX] = page;
                }else{
                    if(!this[SYM.PAGES].has(name)){
                        this[SYM.PAGES].set(name, page);
                    }
                }
                return page;
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
    pages(){
        return Array.from(this[SYM.PAGES].values());
    }
}
