import {Texture} from "./texture";
import {GeometryBuffer} from "./geometry-buffer";
import {FrameBuffer} from "./frame-buffer";

import {Disposable} from "./interfaces/disposable";

export class RenderingState implements Disposable {
    private gl: WebGL2RenderingContext;

    private textures: Map<string, WebGLTexture>;
    private buffers: Map<string, WebGLBuffer>;
    private frameBuffers: Map<string, WebGLFramebuffer>;

    constructor(gl: WebGL2RenderingContext) {
        this.gl = gl;

        this.textures = new Map();
        this.buffers = new Map();
        this.frameBuffers = new Map();
    }
    // getProgram(program: ShaderProgram) {
    //     throw new Error("Method not implemented.");
    // }
    getTexture(texture: Texture): WebGLTexture {
        const gl = this.gl;

        let glTexture = this.textures.get(texture.id);
        if (glTexture === undefined) {
            const newTexture = gl.createTexture();
            if (newTexture === null) {
                throw new Error("Could not create texture");
            }
            this.textures.set(texture.id, newTexture);
            glTexture = newTexture;
        }

        // update texture
        if (texture.needsUpdate == true) {
            gl.bindTexture(gl.TEXTURE_2D, glTexture);

            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, texture.wrapS);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, texture.wrapT);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, texture.minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, texture.magFilter);

            const format = texture.format;
            const internalFormat = texture.internalFormat;
            const type = texture.type;

            if (texture.image !== undefined) {
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, format, type, texture.image);

                // TODO: if square size there ?
                gl.generateMipmap(gl.TEXTURE_2D);
            }

            gl.bindTexture(gl.TEXTURE_2D, null);
            texture.needsUpdate = false;
        }

        return glTexture;
    }
    getGeometryBuffer(buffer: GeometryBuffer): WebGLBuffer {
        const gl = this.gl;

        let glBuffer = this.buffers.get(buffer.id);
        if (glBuffer === undefined) {
            const newBuffer = gl.createBuffer();
            if (newBuffer === null) {
                throw new Error("Could not create buffer");
            }
            this.buffers.set(buffer.id, newBuffer);
            glBuffer = newBuffer;
        }

        // update buffer
        if (buffer.needsUpdate) {
            gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);

            gl.bufferData(gl.ARRAY_BUFFER, buffer.data, gl.STATIC_DRAW);

            gl.bindBuffer(gl.ARRAY_BUFFER, null);
            buffer.needsUpdate = false;
        }

        return glBuffer;
    }
    getFrameBuffer(frameBuffer: FrameBuffer): WebGLFramebuffer {
        const gl = this.gl;

        let glFrameBuffer = this.frameBuffers.get(frameBuffer.id);
        if (glFrameBuffer === undefined) {
            const newFrameBuffer = gl.createFramebuffer();
            if (newFrameBuffer === null) {
                throw new Error("Could not create frame buffer");
            }
            this.frameBuffers.set(frameBuffer.id, newFrameBuffer);
            glFrameBuffer = newFrameBuffer;
        }

        // update linked textures
        for (const texture of frameBuffer.attachments.values()) {
            const glTexture = this.getTexture(texture);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);

            // fill empty
            gl.texImage2D(
                gl.TEXTURE_2D,
                0,
                texture.internalFormat,
                texture.width,
                texture.height,
                0,
                texture.format,
                texture.type,
                null,
            );
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        // update frame buffer
        if (frameBuffer.needsUpdate == true) {
            gl.bindFramebuffer(gl.FRAMEBUFFER, glFrameBuffer);

            for (const [attachment, texture] of frameBuffer.attachments.entries()) {
                const glTexture = this.getTexture(texture);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, attachment, gl.TEXTURE_2D, glTexture, 0);
            }

            if (frameBuffer.drawBuffers !== undefined) {
                gl.drawBuffers(frameBuffer.drawBuffers);
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            frameBuffer.needsUpdate = false;
        }

        return glFrameBuffer;
    }
    dispose(): void {
        // TODO: clear all textures and buffers?
        // this.gl.deleteFramebuffer(this.glFrameBuffer);
        throw new Error("Method not implemented.");
    }
}
