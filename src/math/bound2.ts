export class Bound2 {
    public x: number;
    public y: number;
    public w: number;
    public h: number;
    constructor({x = 0, y = 0, w = 1, h = 1} = {}) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    full() {
        this.x = 0;
        this.y = 0;
        this.w = 1;
        this.h = 1;
    }
}
