import {Disposable} from "./interfaces/disposable";

export class Shader implements Disposable {
    private gl: WebGLRenderingContext;
    private type: number;
    private glShader: WebGLShader;

    constructor(gl: WebGLRenderingContext, type: number, source: string) {
        this.gl = gl;

        if (type !== gl.VERTEX_SHADER && type !== gl.FRAGMENT_SHADER) {
            throw new Error(`Shader type not recognized: "${type}"`);
        }
        this.type = type;

        const glShader = gl.createShader(type);
        if (glShader === null) {
            throw new Error("Could not create shader");
        }
        gl.shaderSource(glShader, source);
        gl.compileShader(glShader);

        if (!gl.getShaderParameter(glShader, gl.COMPILE_STATUS)) {
            const info = gl.getShaderInfoLog(glShader);
            gl.deleteShader(glShader);
            throw new Error(`Could not create shader: ${info}\n"${source}"`);
        }

        this.glShader = glShader;
    }
    attachProgram(program: WebGLProgram): void {
        this.gl.attachShader(program, this.glShader);
    }
    dispose(): void {
        this.gl.deleteShader(this.glShader);
    }
}
