import {Disposable} from "./interfaces/disposable";
import {Shader} from "./shader";
import {ShaderLibrary} from "./shader-library";
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

function createUniformHook(
    gl: WebGLRenderingContext,
    info: WebGLActiveInfo,
    location: WebGLUniformLocation,
): ShaderUniform {
    switch (info.type) {
        // primitive
        case gl.BOOL:
            return new BoolUniform(gl, info.name, location);
        case gl.INT:
            return new IntUniform(gl, info.name, location);
        case gl.FLOAT:
            return new FloatUniform(gl, info.name, location);
        // vectors
        case gl.FLOAT_VEC2:
            return new Vec2Uniform(gl, info.name, location);
        case gl.FLOAT_VEC3:
            return new Vec3Uniform(gl, info.name, location);
        case gl.FLOAT_VEC4:
            return new Vec4Uniform(gl, info.name, location);
        // matrices
        case gl.FLOAT_MAT3:
            return new Matrix3Uniform(gl, info.name, location);
        case gl.FLOAT_MAT4:
            return new Matrix4Uniform(gl, info.name, location);
        // samplers
        case gl.SAMPLER_2D:
            return new Sampler2DUniform(gl, info.name, location);
        default:
            throw new Error(`Unrecognized type "${info.type}" for uniform "${info.name}" shader program`);
    }
}

export class ShaderProgram implements Disposable {
    private gl: WebGLRenderingContext;
    private glProgram: WebGLProgram;
    private vs: Shader;
    private fs: Shader;

    public uniforms: {[name: string]: ShaderUniform};
    public attributes: {[name: string]: number};

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

        // pull uniforms
        this.uniforms = {};
        const uniformsCount = gl.getProgramParameter(glProgram, gl.ACTIVE_UNIFORMS);
        for (let u = 0; u < uniformsCount; u++) {
            const info = gl.getActiveUniform(glProgram, u);
            if (info !== null) {
                const location = gl.getUniformLocation(glProgram, info.name);
                if (location !== null) {
                    this.uniforms[info.name] = createUniformHook(gl, info, location);
                }
            }
        }

        // attributes
        this.attributes = {};
        //vertexPosition: gl.getAttribLocation(glProgram, "aVertexPosition"),
        const attributeCount = gl.getProgramParameter(glProgram, gl.ACTIVE_ATTRIBUTES);
        for (let a = 0; a < attributeCount; a++) {
            const info = gl.getActiveAttrib(glProgram, a);
            if (info !== null) {
                const location = gl.getAttribLocation(glProgram, info.name);
                if (location !== null) {
                    this.attributes[info.name] = location; //createUniformHook(gl, info, location);
                }
            }
        }

        this.glProgram = glProgram;
    }
    use() {
        this.gl.useProgram(this.glProgram);
        for (const name in this.uniforms) {
            this.uniforms[name].update();
        }
    }
    unuse() {
        this.gl.useProgram(null);
    }
    dispose() {
        this.gl.deleteShader(this.glProgram);
        this.vs.dispose();
        this.fs.dispose();
    }
}
