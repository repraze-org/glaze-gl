import {CLAMP_TO_EDGE, LINEAR, RGBA, UNSIGNED_BYTE} from "./constants";
import {uuid} from "./utils";

export type TextureSource =
    | ImageBitmap
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | OffscreenCanvas;

export class Texture {
    public readonly id: string;

    public image?: TextureSource;

    public wrapS: number;
    public wrapT: number;

    public minFilter: number;
    public magFilter: number;

    public format: number;
    public internalFormat: number;
    public type: number;

    public flipY: boolean;

    public needsUpdate: boolean;

    constructor(image?: TextureSource) {
        this.id = uuid();

        this.image = image;

        this.wrapS = CLAMP_TO_EDGE;
        this.wrapT = CLAMP_TO_EDGE;

        this.minFilter = LINEAR;
        this.magFilter = LINEAR;

        this.format = RGBA;
        this.internalFormat = RGBA;
        this.type = UNSIGNED_BYTE;

        this.flipY = true;

        this.needsUpdate = true;
    }
}
