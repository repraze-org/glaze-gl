export class ShaderLibrary {
    private bindings: Map<string, string>;
    private links?: ShaderLibrary[];
    constructor({links}: {links?: ShaderLibrary[]} = {}) {
        this.bindings = new Map<string, string>();
        this.links = links;
    }
    set(name: string, source: string): void {
        this.bindings.set(name, source);
    }
    get(name: string): string | undefined {
        return this.bindings.get(name);
    }
    delete(name: string): boolean {
        return this.bindings.delete(name);
    }
    resolve(name: string): {source: string; location: ShaderLibrary} | undefined {
        const source = this.bindings.get(name);
        if (source !== undefined) {
            return {source: source, location: this};
        }
        if (this.links !== undefined) {
            for (let i = 0; i < this.links.length; i++) {
                const link = this.links[i];
                const value = link.resolve(name);
                if (value !== undefined) {
                    return value;
                }
            }
        }
        return undefined;
    }
    static replaceIncludes(source: string, library: ShaderLibrary): string {
        const setMapGet = (setMap: Map<ShaderLibrary, Set<string>>, key: ShaderLibrary) => {
            let set = setMap.get(key);
            if (set === undefined) {
                set = new Set<string>();
                setMap.set(key, set);
            }
            return set;
        };

        const replace = (source: string, library: ShaderLibrary, included: Map<ShaderLibrary, Set<string>>): string => {
            return source.replace(/#include\s+<([a-zA-Z0-9_-]+)>/g, (match, name) => {
                const include = library.resolve(name);
                if (include === undefined) {
                    throw new Error(`Could not find "${name}" in shader library`);
                }
                // avoid double include definition
                const includedSet = setMapGet(included, include.location);
                if (includedSet.has(name)) {
                    return "";
                } else {
                    includedSet.add(name);
                }
                // recursive include resolution with context
                return replace(include.source, include.location, included);
            });
        };
        const included = new Map<ShaderLibrary, Set<string>>();
        return replace(source, library, included);
    }
}
