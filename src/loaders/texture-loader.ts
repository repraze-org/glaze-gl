import {ImageLoader} from "./image-loader";
import {Texture} from "../texture";

export class TextureLoader {
    constructor() {
        // Empty
    }
    async load(src: string): Promise<Texture> {
        const image = await new ImageLoader().load(src);
        return new Texture(image);
    }
}
