import {RenderingState} from "./rendering-state";
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
    abstract update(state: RenderingState): void;
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
        throw new Error(`Unsupported vec2 value for uniform "${this.name}"`);
    }
    setVec3(value: ArrayLike<number>): void {
        throw new Error(`Unsupported vec3 value for uniform "${this.name}"`);
    }
    setVec4(value: ArrayLike<number>): void {
        throw new Error(`Unsupported vec4 value for uniform "${this.name}"`);
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
    update(): void {
        this.gl.uniform1i(this.location, this.value ? 1 : 0);
    }
    setBool(value: boolean): void {
        this.value = value;
    }
}

export class IntUniform extends ShaderUniform {
    private value?: number;
    update(): void {
        this.gl.uniform1i(this.location, this.value || 0);
    }
    setInt(value: number): void {
        this.value = value;
    }
}

export class FloatUniform extends ShaderUniform {
    private value?: number;
    update(): void {
        this.gl.uniform1f(this.location, this.value || 0);
    }
    setFloat(value: number): void {
        this.value = value;
    }
}

// vectors
export class Vec2Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(2);
    private value?: ArrayLike<number>;
    update(): void {
        if (this.value !== undefined) {
            Vec2Uniform.CACHE.set(this.value);
            this.gl.uniform2fv(this.location, Vec2Uniform.CACHE);
        }
    }
    setVec2(value: ArrayLike<number>): void {
        this.value = value;
    }
}

export class Vec3Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(3);
    private value?: ArrayLike<number>;
    update(): void {
        if (this.value !== undefined) {
            Vec3Uniform.CACHE.set(this.value);
            this.gl.uniform3fv(this.location, Vec3Uniform.CACHE);
        }
    }
    setVec3(value: ArrayLike<number>): void {
        this.value = value;
    }
}

export class Vec4Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(4);
    private value?: ArrayLike<number>;
    update(): void {
        if (this.value !== undefined) {
            Vec4Uniform.CACHE.set(this.value);
            this.gl.uniform4fv(this.location, Vec4Uniform.CACHE);
        }
    }
    setVec4(value: ArrayLike<number>): void {
        this.value = value;
    }
}

// matrices
export class Matrix3Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(9);
    private value?: ArrayLike<number>;
    update(): void {
        if (this.value !== undefined) {
            Matrix3Uniform.CACHE.set(this.value);
            this.gl.uniformMatrix3fv(this.location, false, Matrix3Uniform.CACHE);
        }
    }
    setMat3(value: ArrayLike<number>): void {
        this.value = value;
    }
}

export class Matrix4Uniform extends ShaderUniform {
    private static CACHE = new Float32Array(16);
    private value?: ArrayLike<number>;
    update(): void {
        if (this.value !== undefined) {
            Matrix4Uniform.CACHE.set(this.value);
            this.gl.uniformMatrix4fv(this.location, false, Matrix4Uniform.CACHE);
        }
    }
    setMat4(value: ArrayLike<number>): void {
        this.value = value;
    }
}

// samplers
function getTextureTarget(gl: WebGLRenderingContext, count: number) {
    // per specification, at least 8 supported
    const target = [
        gl.TEXTURE0,
        gl.TEXTURE1,
        gl.TEXTURE2,
        gl.TEXTURE3,
        gl.TEXTURE4,
        gl.TEXTURE5,
        gl.TEXTURE6,
        gl.TEXTURE7,
    ][count];
    if (target === undefined) {
        throw new Error("Unsupported number of texture on shader");
    }
    return target;
}
export class Sampler2DUniform extends ShaderUniform {
    private count: number;
    private target: number;
    private value?: Texture;
    constructor(gl: WebGLRenderingContext, name: string, location: WebGLUniformLocation, count: number) {
        super(gl, name, location);
        this.count = count;
        this.target = getTextureTarget(gl, this.count);
    }
    update(state: RenderingState): void {
        const gl = this.gl;
        const texture = this.value;
        gl.activeTexture(this.target);
        gl.uniform1i(this.location, this.count);
        if (texture !== undefined) {
            const glTexture = state.getTexture(texture);
            gl.bindTexture(gl.TEXTURE_2D, glTexture);
        } else {
            gl.bindTexture(gl.TEXTURE_2D, null);
        }
    }
    setSampler2D(value: Texture | undefined): void {
        this.value = value;
    }
}
