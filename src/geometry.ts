import {GeometryBuffer} from "./geometry-buffer";

export class Geometry {
    private attributes: Map<string, GeometryBuffer>;
    private reference?: GeometryBuffer;

    constructor() {
        this.attributes = new Map<string, GeometryBuffer>();
    }
    setAttribute(name: string, buffer: GeometryBuffer): void {
        if (this.reference === undefined) {
            this.reference = buffer;
        } else if (this.reference.count !== buffer.count) {
            throw new Error(`Invalid buffer count given for attribute "${name}"`);
        }
        this.attributes.set(name, buffer);
    }
    getAttribute(name: string): GeometryBuffer | undefined {
        return this.attributes.get(name);
    }
    get count(): number {
        return this.reference?.count || 0;
    }
    fromBuffers(buffers: {[name: string]: GeometryBuffer}): void {
        for (const [name, buffer] of Object.entries(buffers)) {
            this.setAttribute(name, buffer);
        }
    }
    merge(other: Geometry): void {
        // TODO: other
    }
}
