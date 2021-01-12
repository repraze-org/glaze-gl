import {Disposable} from "./interfaces/disposable";

export class Buffer implements Disposable {
    private gl: WebGLRenderingContext;
    private glBuffer: WebGLBuffer;

    constructor(gl: WebGLRenderingContext) {
        this.gl = gl;

        const glBuffer = gl.createBuffer();
        if (glBuffer === null) {
            throw new Error("Could not create buffer");
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

        // load data
        // const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
        const positions = [-0.5, 0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.glBuffer = glBuffer;
    }
    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.glBuffer);
    }
    unbind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
    dispose() {
        // Empty
    }
}
