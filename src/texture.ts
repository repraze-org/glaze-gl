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

        this.wrapS = 0;
        this.wrapT = 0;

        this.minFilter = 0;
        this.magFilter = 0;

        this.format = 0;
        this.internalFormat = 0;
        this.type = 0;

        this.flipY = true;

        this.needsUpdate = true;
    }
}
