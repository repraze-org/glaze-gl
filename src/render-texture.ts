import {Texture} from "./texture";

export class RenderTexture extends Texture {
    public width: number;
    public height: number;

    constructor(width: number, height: number) {
        super();

        this.width = width;
        this.height = height;
    }

    setSize(width: number, height: number): void {
        if (width !== this.width || height !== this.height) {
            this.width = width;
            this.height = height;
            this.needsUpdate = true;
        }
    }
}
