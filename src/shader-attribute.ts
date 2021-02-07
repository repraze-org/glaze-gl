import {GeometryBuffer} from "./geometry-buffer";
import {RenderingState} from "./rendering-state";

export abstract class ShaderAttribute {
    protected gl: WebGLRenderingContext;
    protected name: string;
    protected location: number;
    // protected stride: number;
    // protected offset: number;
    constructor(gl: WebGLRenderingContext, name: string, location: number /*, stride: number, offset: number*/) {
        this.gl = gl;
        this.name = name;
        this.location = location;
        // this.stride = stride;
        // this.offset = offset;
    }
    abstract update(state: RenderingState): void;
    // primitive
    // setBool(value: boolean): void {
    //     throw new Error(`Unsupported bool value for attribute "${this.name}"`);
    // }
    // setInt(value: number): void {
    //     throw new Error(`Unsupported int value for attribute "${this.name}"`);
    // }
    // setFloat(value: number): void {
    //     throw new Error(`Unsupported float value for attribute "${this.name}"`);
    // }
    // vectors
    setVec2(value?: GeometryBuffer): void {
        throw new Error(`Unsupported vec2 value for attribute "${this.name}"`);
    }
    setVec3(value?: GeometryBuffer): void {
        throw new Error(`Unsupported vec3 value for attribute "${this.name}"`);
    }
    setVec4(value?: GeometryBuffer): void {
        throw new Error(`Unsupported vec4 value for attribute "${this.name}"`);
    }
}

// primitive

// TODO: primitives ?

// vectors

// common vec implementation, missing vec values gets expanded to 1 or trimmed out
abstract class VecAttribute extends ShaderAttribute {
    protected value?: GeometryBuffer;
    update(state: RenderingState): void {
        const buffer = this.value;
        if (buffer !== undefined) {
            const glBuffer = state.getGeometryBuffer(buffer);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, glBuffer);

            this.gl.enableVertexAttribArray(this.location);
            this.gl.vertexAttribPointer(this.location, buffer.dataSize, this.gl.FLOAT, buffer.dataNormalized, 0, 0);
            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
        } else {
            this.gl.disableVertexAttribArray(this.location);
        }
    }
}

export class Vec2Attribute extends VecAttribute {
    setVec2(value?: GeometryBuffer): void {
        this.value = value;
    }
}

export class Vec3Attribute extends VecAttribute {
    setVec3(value?: GeometryBuffer): void {
        this.value = value;
    }
}

export class Vec4Attribute extends VecAttribute {
    setVec4(value?: GeometryBuffer): void {
        this.value = value;
    }
}

// matrices

// TODO: matrices ?
