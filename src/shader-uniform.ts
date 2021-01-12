import {Texture} from "./texture";

export abstract class ShaderUniform {
    protected gl: WebGLRenderingContext;
    protected name: string;
    protected location: WebGLUniformLocation;
    constructor(gl: WebGLRenderingContext, name: string, location: WebGLUniformLocation) {
        this.gl = gl;
        this.name = name;
        this.location = location;
    }
    abstract update(): void;
    // primitive
    setBool(value: boolean): void {
        throw new Error(`Unsupported bool value for uniform "${this.name}"`);
    }
    setInt(value: number): void {
        throw new Error(`Unsupported int value for uniform "${this.name}"`);
    }
    setFloat(value: number): void {
        throw new Error(`Unsupported float value for uniform "${this.name}"`);
    }
    // vectors
    setVec2(value: ArrayLike<number>): void {
        throw new Error(`Unsupported mat2 value for uniform "${this.name}"`);
    }
    setVec3(value: ArrayLike<number>): void {
        throw new Error(`Unsupported mat2 value for uniform "${this.name}"`);
    }
    setVec4(value: ArrayLike<number>): void {
        throw new Error(`Unsupported mat2 value for uniform "${this.name}"`);
    }
    // matrices
    setMat2(value: ArrayLike<number>): void {
        throw new Error(`Unsupported mat2 value for uniform "${this.name}"`);
    }
    setMat3(value: ArrayLike<number>): void {
        throw new Error(`Unsupported mat3 value for uniform "${this.name}"`);
    }
    setMat4(value: ArrayLike<number>): void {
        throw new Error(`Unsupported mat4 value for uniform "${this.name}"`);
    }
    // samplers
    setSampler2D(value: Texture): void {
        throw new Error(`Unsupported sampler 2D value for uniform "${this.name}"`);
    }
}

// primitive
export class BoolUniform extends ShaderUniform {
    private value?: boolean;
    update() {
        this.gl.uniform1i(this.location, this.value ? 1 : 0);
    }
    setBool(value: boolean) {
        this.value = value;
    }
}

export class IntUniform extends ShaderUniform {
    private value?: number;
    update() {
        this.gl.uniform1i(this.location, this.value || 0);
    }
    setInt(value: number) {
        this.value = value;
    }
}

export class FloatUniform extends ShaderUniform {
    private value?: number;
    update() {
        this.gl.uniform1f(this.location, this.value || 0);
    }
    setFloat(value: number) {
        this.value = value;
    }
}

// vectors
export class Vec2Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(2);
    private value?: ArrayLike<number>;
    update() {
        if (this.value !== undefined) {
            Vec2Uniform.CACHE.set(this.value);
            this.gl.uniform2fv(this.location, Vec2Uniform.CACHE);
        }
    }
    setVec2(value: ArrayLike<number>) {
        this.value = value;
    }
}

export class Vec3Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(3);
    private value?: ArrayLike<number>;
    update() {
        if (this.value !== undefined) {
            Vec3Uniform.CACHE.set(this.value);
            this.gl.uniform3fv(this.location, Vec3Uniform.CACHE);
        }
    }
    setVec3(value: ArrayLike<number>) {
        this.value = value;
    }
}

export class Vec4Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(4);
    private value?: ArrayLike<number>;
    update() {
        if (this.value !== undefined) {
            Vec4Uniform.CACHE.set(this.value);
            this.gl.uniform4fv(this.location, Vec4Uniform.CACHE);
        }
    }
    setVec4(value: ArrayLike<number>) {
        this.value = value;
    }
}

// matrices
export class Matrix3Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(9);
    private value?: ArrayLike<number>;
    update() {
        if (this.value !== undefined) {
            Matrix3Uniform.CACHE.set(this.value);
            this.gl.uniformMatrix3fv(this.location, false, Matrix3Uniform.CACHE);
        }
    }
    setMat3(value: ArrayLike<number>) {
        this.value = value;
    }
}

export class Matrix4Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(16);
    private value?: ArrayLike<number>;
    update() {
        if (this.value !== undefined) {
            Matrix4Uniform.CACHE.set(this.value);
            this.gl.uniformMatrix4fv(this.location, false, Matrix4Uniform.CACHE);
        }
    }
    setMat4(value: ArrayLike<number>) {
        this.value = value;
    }
}

// samplers
export class Sampler2DUniform extends ShaderUniform {
    private value?: Texture;
    private glTexture?: WebGLTexture;
    update() {
        const gl = this.gl;
        if (this.value !== undefined) {
            const texture = this.value;
            gl.activeTexture(gl.TEXTURE0);

            if (this.glTexture === undefined) {
                const glTexture = gl.createTexture();
                if (glTexture === null) {
                    throw new Error("Could not create texture");
                }
                this.glTexture = glTexture;

                gl.bindTexture(gl.TEXTURE_2D, this.glTexture);

                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

                const wrapS = texture.wrapS || gl.CLAMP_TO_EDGE;
                const wrapT = texture.wrapS || gl.CLAMP_TO_EDGE;
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapS);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapT);

                const minFilter = texture.minFilter || gl.LINEAR;
                const magFilter = texture.magFilter || gl.LINEAR;
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);

                const format = texture.format || gl.RGBA;
                const internalFormat = texture.internalFormat || gl.RGBA;
                const type = texture.type || gl.UNSIGNED_BYTE;
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, format, type, texture.image);
                gl.generateMipmap(gl.TEXTURE_2D);

                gl.uniform1i(this.location, 0);
            }
        }
    }
    setSampler2D(value: Texture) {
        this.value = value;
    }
}
