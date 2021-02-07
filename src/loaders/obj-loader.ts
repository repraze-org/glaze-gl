import {Geometry} from "../geometry";
import {buildObjGeometry} from "../geometry-builder";

export class ObjLoader {
    constructor() {
        // Empty
    }
    async load(src: string): Promise<Geometry> {
        const str = await (await fetch(src)).text();
        return buildObjGeometry(str);
    }
}
