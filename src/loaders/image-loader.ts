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
