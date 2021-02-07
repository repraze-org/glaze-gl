import {RenderingContext, RenderViewport} from "../rendering-context";

export abstract class RenderPass {
    protected context: RenderingContext;
    protected viewport?: RenderViewport;

    constructor(context: RenderingContext) {
        this.context = context;
    }
    setSize(width: number, height: number): void {
        this.viewport = {
            x: 0,
            y: 0,
            width: width,
            height: height,
        };
    }
    setViewport(viewport?: RenderViewport): void {
        this.viewport = viewport;
    }
}
