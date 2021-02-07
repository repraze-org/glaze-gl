import {RenderingState} from "./rendering-state";

export interface RenderViewport {
    x: 0;
    y: 0;
    width: number;
    height: number;
}

export class RenderingContext {
    public component: HTMLCanvasElement;
    public width: number;
    public height: number;
    public pixelRatio: number;
    public viewport: RenderViewport;

    public gl: WebGL2RenderingContext;
    public state: RenderingState;

    constructor({width = 256, height = 256, pixelRatio = window.devicePixelRatio} = {}) {
        this.component = document.createElement("canvas");
        this.component.style.backgroundColor = "black";
        this.width = width;
        this.height = height;
        this.pixelRatio = pixelRatio;
        this.viewport = {x: 0, y: 0, width: 1, height: 1};
        this.updateSize();

        const gl = this.component.getContext("webgl2");
        if (gl === null) {
            throw new Error("Could not init WebGL2 context");
        }
        this.gl = gl;
        this.state = new RenderingState(gl);
    }
    setSize(width: number, height: number): void {
        this.width = width;
        this.height = height;
        this.updateSize();
    }
    setPixelRatio(pixelRatio: number): void {
        this.pixelRatio = pixelRatio;
        this.updateSize();
    }
    updateSize(): void {
        this.viewport.width = Math.floor(this.pixelRatio * this.width);
        this.viewport.height = Math.floor(this.pixelRatio * this.height);
        this.component.width = this.viewport.width;
        this.component.style.width = `${this.width}px`;
        this.component.height = this.viewport.height;
        this.component.style.height = `${this.height}px`;
    }
}
