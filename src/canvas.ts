export class Canvas {
    public component: HTMLCanvasElement;
    public width: number;
    public height: number;
    public pixelRatio: number;
    constructor({width = 300, height = 200, pixelRatio = window.devicePixelRatio} = {}) {
        this.component = document.createElement("canvas");
        this.width = width;
        this.height = height;
        this.pixelRatio = pixelRatio;
        this.updateSize();

        this.component.style.backgroundColor = "black";
    }
    setSize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.updateSize();
    }
    setPixelRatio(pixelRatio: number) {
        this.pixelRatio = pixelRatio;
        this.updateSize();
    }
    updateSize() {
        this.component.width = Math.floor(this.pixelRatio * this.width);
        this.component.style.width = `${this.width}px`;
        this.component.height = Math.floor(this.pixelRatio * this.height);
        this.component.style.height = `${this.height}px`;
    }
}
