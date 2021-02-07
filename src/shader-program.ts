import {Disposable} from "./interfaces/disposable";
import {Shader} from "./shader";
import {ShaderLibrary} from "./shader-library";
import {RenderingState} from "./rendering-state";
import {
    ShaderUniform,
    FloatUniform,
    Vec2Uniform,
    BoolUniform,
    IntUniform,
    Vec3Uniform,
    Vec4Uniform,
    Matrix3Uniform,
    Matrix4Uniform,
    Sampler2DUniform,
} from "./shader-uniform";
import {ShaderAttribute, Vec2Attribute, Vec3Attribute, Vec4Attribute} from "./shader-attribute";

interface UniformInfo {
    info: WebGLActiveInfo;
    location: WebGLUniformLocation;
}

function createUniformHooks(gl: WebGLRenderingContext, uniforms: UniformInfo[]): {[name: string]: ShaderUniform} {
    const output: {[name: string]: ShaderUniform} = {};
    let textureCount = 0;
    for (let i = 0; i < uniforms.length; i++) {
        const {info, location} = uniforms[i];
        switch (info.type) {
            // primitive
            case gl.BOOL:
                output[info.name] = new BoolUniform(gl, info.name, location);
                break;
            case gl.INT:
                output[info.name] = new IntUniform(gl, info.name, location);
                break;
            case gl.FLOAT:
                output[info.name] = new FloatUniform(gl, info.name, location);
                break;
            // vectors
            case gl.FLOAT_VEC2:
                output[info.name] = new Vec2Uniform(gl, info.name, location);
                break;
            case gl.FLOAT_VEC3:
                output[info.name] = new Vec3Uniform(gl, info.name, location);
                break;
            case gl.FLOAT_VEC4:
                output[info.name] = new Vec4Uniform(gl, info.name, location);
                break;
            // matrices
            case gl.FLOAT_MAT3:
                output[info.name] = new Matrix3Uniform(gl, info.name, location);
                break;
            case gl.FLOAT_MAT4:
                output[info.name] = new Matrix4Uniform(gl, info.name, location);
                break;
            // samplers
            case gl.SAMPLER_2D:
                output[info.name] = new Sampler2DUniform(gl, info.name, location, textureCount);
                textureCount += 1;
                break;
            default:
                throw new Error(`Unrecognized type "${info.type}" for uniform "${info.name}" shader program`);
        }
    }
    return output;
}

function createAttributeHook(gl: WebGLRenderingContext, info: WebGLActiveInfo, location: number): ShaderAttribute {
    switch (info.type) {
        // primitive
        // case gl.BOOL:
        //     return new BoolUniform(gl, info.name, location);
        // case gl.INT:
        //     return new IntUniform(gl, info.name, location);
        // case gl.FLOAT:
        //     return new FloatUniform(gl, info.name, location);
        // vectors
        case gl.FLOAT_VEC2:
            return new Vec2Attribute(gl, info.name, location);
        case gl.FLOAT_VEC3:
            return new Vec3Attribute(gl, info.name, location);
        case gl.FLOAT_VEC4:
            return new Vec4Attribute(gl, info.name, location);
        // matrices
        // case gl.FLOAT_MAT3:
        //     return new Matrix3Uniform(gl, info.name, location);
        // case gl.FLOAT_MAT4:
        //     return new Matrix4Uniform(gl, info.name, location);
        default:
            throw new Error(`Unrecognized type "${info.type}" for attribute "${info.name}" shader program`);
    }
}

export class ShaderProgram implements Disposable {
    private gl: WebGLRenderingContext;
    private glProgram: WebGLProgram;
    private vs: Shader;
    private fs: Shader;

    public uniforms: {[name: string]: ShaderUniform};
    public attributes: {[name: string]: ShaderAttribute};

    constructor(gl: WebGLRenderingContext, {vs, fs, library}: {vs: string; fs: string; library?: ShaderLibrary}) {
        this.gl = gl;

        this.vs = new Shader(
            gl,
            gl.VERTEX_SHADER,
            library !== undefined ? ShaderLibrary.replaceIncludes(vs, library) : vs,
        );
        this.fs = new Shader(
            gl,
            gl.FRAGMENT_SHADER,
            library !== undefined ? ShaderLibrary.replaceIncludes(fs, library) : fs,
        );

        const glProgram = gl.createProgram();
        if (glProgram === null) {
            throw new Error("Could not create shader program");
        }
        this.vs.attachProgram(glProgram);
        this.fs.attachProgram(glProgram);
        gl.linkProgram(glProgram);

        if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
            const info = gl.getProgramInfoLog(glProgram);
            gl.deleteProgram(glProgram);
            throw new Error(`Could not create shader program: ${info}`);
        }

        // uniforms
        const uniformsCount = gl.getProgramParameter(glProgram, gl.ACTIVE_UNIFORMS);
        const uniformInfos: UniformInfo[] = [];
        for (let u = 0; u < uniformsCount; u++) {
            const info = gl.getActiveUniform(glProgram, u);
            if (info !== null) {
                const location = gl.getUniformLocation(glProgram, info.name);
                if (location !== null) {
                    uniformInfos.push({info, location});
                }
            }
        }
        this.uniforms = createUniformHooks(gl, uniformInfos);

        // attributes
        this.attributes = {};
        const attributeCount = gl.getProgramParameter(glProgram, gl.ACTIVE_ATTRIBUTES);
        for (let a = 0; a < attributeCount; a++) {
            const info = gl.getActiveAttrib(glProgram, a);
            if (info !== null) {
                const location = gl.getAttribLocation(glProgram, info.name);
                if (location !== null) {
                    this.attributes[info.name] = createAttributeHook(gl, info, location);
                }
            }
        }

        this.glProgram = glProgram;
    }
    use(): void {
        this.gl.useProgram(this.glProgram);
    }
    unuse(): void {
        this.gl.useProgram(null);
    }
    update(state: RenderingState): void {
        for (const name in this.uniforms) {
            this.uniforms[name].update(state);
        }
        for (const name in this.attributes) {
            this.attributes[name].update(state);
        }
    }
    dispose(): void {
        this.gl.deleteShader(this.glProgram);
        this.vs.dispose();
        this.fs.dispose();
    }
}
