export type TextureSource =
    | ImageBitmap
    | ImageData
    | HTMLImageElement
    | HTMLCanvasElement
    | HTMLVideoElement
    | OffscreenCanvas;

export class Texture {
    public image: TextureSource;

    public wrapS: number;
    public wrapT: number;

    public minFilter: number;
    public magFilter: number;

    public format: number;
    public internalFormat: number;
    public type: number;

    constructor(image: TextureSource) {
        this.image = image;

        this.wrapS = 0;
        this.wrapT = 0;

        this.minFilter = 0;
        this.magFilter = 0;

        this.format = 0;
        this.internalFormat = 0;
        this.type = 0;
    }
}

export class ImageLoader {
    constructor() {
        // Empty
    }
    async load(src: string): Promise<HTMLImageElement> {
        const image = new Image();
        return new Promise<HTMLImageElement>((res, rej) => {
            image.onload = () => {
                res(image);
            };
            image.onerror = (event) => {
                rej(new Error(`Could not load image "${src}"`));
            };
            image.src = src;
        });
    }
}

export class TextureLoader {
    constructor() {
        // Empty
    }
    async load(src: string): Promise<Texture> {
        const image = await new ImageLoader().load(src);
        return new Texture(image);
    }
}
