import {Matrix4, Vector2} from "@math.gl/core";
import {RenderPass} from "./render-pass";
import {RenderingContext} from "../rendering-context";
import {ShaderProgram} from "../shader-program";
import {buildPlaneGeometry} from "../geometry-builder";
import {FrameBuffer} from "../frame-buffer";
import {RenderTexture} from "../render-texture";

const EFFECT_PROJECTION = new Matrix4().ortho({left: -0.5, right: 0.5, top: 0.5, bottom: -0.5, near: -0.1, far: 0.1});

export const EFFECT_VERTEX_SHADER = `
attribute vec4 aVertex;
attribute vec2 aUv;

uniform mat4 uProjectionMatrix;

varying vec2 vPosition;

void main() {
    vPosition = aUv;
    gl_Position = uProjectionMatrix * aVertex;
}
`;

const EFFECT_GEOMETRY = buildPlaneGeometry(new Vector2(1, 1));

export abstract class EffectPass extends RenderPass {
    protected program: ShaderProgram;

    protected outputBuffer: FrameBuffer;
    public output: RenderTexture;

    constructor(context: RenderingContext, program: ShaderProgram) {
        super(context);
        this.program = program;

        const gl = context.gl;

        this.output = new RenderTexture(256, 256);
        this.output.format = gl.RGBA;
        this.output.internalFormat = gl.RGBA;
        this.output.type = gl.UNSIGNED_BYTE;

        this.outputBuffer = new FrameBuffer();
        this.outputBuffer.setAttachment(gl.COLOR_ATTACHMENT0, this.output);
    }
    render(): void {
        const gl = this.context.gl;

        const viewport = this.viewport || this.context.viewport;
        const width = viewport.width - viewport.x;
        const height = viewport.height - viewport.y;
        this.output.setSize(width, height);

        const glFramebuffer = this.context.state.getFrameBuffer(this.outputBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, glFramebuffer);

        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        gl.disable(gl.DEPTH_TEST);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

        this.program.use();
        this.program.uniforms["uProjectionMatrix"].setMat4(EFFECT_PROJECTION);

        // effect specific uniforms
        this.bind();

        this.program.attributes["aVertex"].setVec4(EFFECT_GEOMETRY.getAttribute("vertex"));
        this.program.attributes["aUv"].setVec2(EFFECT_GEOMETRY.getAttribute("uv"));
        this.program.update(this.context.state);
        gl.drawArrays(gl.TRIANGLES, 0, EFFECT_GEOMETRY.count);
        this.program.unuse();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }
    abstract bind(): void;
}
