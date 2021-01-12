import {Drawable} from "./interfaces/drawable";
import {Camera} from "./camera";

export class Scene implements Drawable {
    private children: Drawable[];
    constructor() {
        this.children = new Array<Drawable>();
    }
    addDrawable(child: Drawable) {
        this.children.push(child);
    }
    remove(child: Drawable): boolean {
        const childIndex = this.children.indexOf(child);
        if (childIndex >= 0) {
            this.children.splice(childIndex, 1);
            return true;
        }
        return false;
    }
    draw(camera: Camera) {
        const length = this.children.length;
        for (let i = 0; i < length; i++) {
            this.children[i].draw(camera);
        }
    }
    dispose() {
        const length = this.children.length;
        for (let i = 0; i < length; i++) {
            this.children[i].dispose();
        }
    }
}
