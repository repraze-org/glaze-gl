function parsePath(namePath){
    return namePath
        .split("/")
        .map(name=>name.trim());
}

function parseKey(name){
    return name
        .trim()
        .toLocaleLowerCase()
        .replace(/\s+/g, "-");
}

export class Page{
    constructor(name, component){
        this.name = name;
        this.key = parseKey(name);
        this.component = component;
    }
}

export class Chapter{
    constructor(name, path){
        this.name = name;
        this._path = path;

        this.key = parseKey(name);
        this.path = "/" + path.join("/");

        this._index = null;
        this._pages = [];
        this._chapters = new Map();

    }
    context(){
        return {
            chapter: (namePath)=>{
                const path = parsePath(namePath);
                const [name, ...restPath] = path;
                if(restPath.length > 0){
                    if(!this._chapters.has(name)){
                        this._chapters.set(name, new Chapter(name, [...this._path, name]));
                    }
                    const restNamePath = restPath.join("/");
                    return this._chapters.get(name).context().chapter(restNamePath);
                }else{
                    if(!this._chapters.has(name)){
                        this._chapters.set(name, new Chapter(name, [...this._path, name]));
                    }
                    return this._chapters.get(name).context();
                }
            },
            page: (name, component)=>{
                const page = new Page(name, component);
                if(name === "index"){
                    this._index = page;
                }else{
                    this._pages.push(page);
                }
                return this.context();
            }
        };
    }
    get index(){
        return this._index;
    }
    get chapters(){
        return Array.from(this._chapters.values());
    }
    get pages(){
        return this._pages;
    }
    deepChapters(){
        const chapters = Array.from(this._chapters.values());
        chapters
            .forEach(chapter=>{
                chapters.push(...chapter.deepChapters());
            });
        return chapters;
    }
}

export class Book{
    constructor(){
        this._index = new Chapter("index", ["index"]);
        this._chapters = new Map();
    }
    load(loader){
        const context = this.context();
        loader.keys()
            .forEach(filename=>{
                const loaded = loader(filename);
                if(loaded && loaded.default){
                    loaded.default(context);
                }
            });
    }
    context(){
        return {
            chapter: (namePath)=>{
                const path = parsePath(namePath);
                const [name, ...restPath] = path;

                if(name === "index"){
                    if(restPath.length > 0){
                        const restNamePath = restPath.join("/");
                        return this._index.context().chapter(restNamePath);
                    }else{
                        return this._index.context();
                    }
                }

                if(restPath.length > 0){
                    if(!this._chapters.has(name)){
                        this._chapters.set(name, new Chapter(name, [name]));
                    }
                    const restNamePath = restPath.join("/");
                    return this._chapters.get(name).context().chapter(restNamePath);
                }else{
                    if(!this._chapters.has(name)){
                        this._chapters.set(name, new Chapter(name, [name]));
                    }
                    return this._chapters.get(name).context();
                }
            }
        };
    }
    get index(){
        return this._index;
    }
    get chapters(){
        return Array.from(this._chapters.values());
    }
    deepChapters(){
        const chapters = Array.from(this._chapters.values());
        chapters
            .forEach(chapter=>{
                chapters.push(...chapter.deepChapters());
            });
        return chapters;
    }
}
