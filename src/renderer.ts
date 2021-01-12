import {Drawable} from "./interfaces/drawable";
import {Canvas} from "./canvas";
import {Camera} from "./camera";
import {Bound2} from "./math/bound2";

export class Renderer {
    private gl: WebGLRenderingContext;
    private canvas: Canvas;
    constructor(gl: WebGLRenderingContext, canvas: Canvas) {
        this.gl = gl;
        this.canvas = canvas;
    }
    draw(subject: Drawable, camera: Camera, target?: Bound2) {
        const gl = this.gl;

        const width = this.canvas.width * this.canvas.pixelRatio;
        const height = this.canvas.height * this.canvas.pixelRatio;

        // set rendering target rect
        if (target !== undefined) {
            gl.enable(gl.SCISSOR_TEST);
            gl.scissor(target.x * width, target.y * height, target.w * width, target.h * height);
        }

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        // set camera target rect
        const viewport = camera.viewport;
        gl.viewport(viewport.x * width, viewport.y * height, viewport.w * width, viewport.h * height);

        subject.draw(camera);

        if (target !== undefined) {
            gl.disable(gl.SCISSOR_TEST);
        }
    }
}
