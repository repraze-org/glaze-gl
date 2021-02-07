import {uuid} from "./utils";
import {TypedArray} from "@math.gl/core";

export class GeometryBuffer {
    public readonly id: string;

    public data: TypedArray;
    public dataSize: number;
    public dataNormalized: boolean;
    public readonly count: number;

    public needsUpdate: boolean;

    constructor(data: TypedArray, dataSize: number, dataNormalized = false) {
        this.id = uuid();

        this.data = data;
        this.dataSize = dataSize;
        this.dataNormalized = dataNormalized;
        this.count = data.length / dataSize; // count should not change

        this.needsUpdate = true;
    }
    merge(other: GeometryBuffer): void {
        // TODO: dat
    }
}
