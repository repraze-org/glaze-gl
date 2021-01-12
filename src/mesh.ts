import {Matrix4} from "@math.gl/core";

import {Drawable} from "./interfaces/drawable";
import {ShaderProgram} from "./shader-program";
import {Buffer} from "./buffer";
import {Camera} from "./camera";

export class Mesh implements Drawable {
    private gl: WebGLRenderingContext;
    private buffer: Buffer;
    private program: ShaderProgram;
    private position: Matrix4;

    constructor(gl: WebGLRenderingContext, program: ShaderProgram) {
        this.gl = gl;
        this.buffer = new Buffer(gl);
        this.program = program;
        this.position = new Matrix4();
    }
    draw(camera: Camera) {
        const program = this.program;

        this.buffer.bind();
        program.use();

        // uniforms
        program.uniforms["uProjectionMatrix"].setMat4(camera.projection);
        program.uniforms["uModelViewMatrix"].setMat4(this.position);

        // attributes

        // TODO: fix consts
        const numComponents = 2; // pull out 2 values per iteration
        const type = this.gl.FLOAT; // the data in the buffer is 32bit floats
        const normalize = false; // don't normalize
        const stride = 0; // how many bytes to get from one set of values to the next
        // 0 = use type and numComponents above
        const offset = 0; // how many bytes inside the buffer to start from
        const vertexCount = 4;
        // TODO: make attribute better
        this.gl.vertexAttribPointer(
            program.attributes["aVertexPosition"],
            numComponents,
            type,
            normalize,
            stride,
            offset,
        );
        this.gl.enableVertexAttribArray(program.attributes["aVertexPosition"]);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, vertexCount);

        program.unuse();
        this.buffer.unbind();
    }
    dispose() {
        // TODO: dispose
    }
}
