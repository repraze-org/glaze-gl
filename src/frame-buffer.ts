import {uuid} from "./utils";
import {RenderTexture} from "./render-texture";

export class FrameBuffer {
    public readonly id: string;

    public attachments: Map<number, RenderTexture>;
    public drawBuffers?: number[];

    public needsUpdate: boolean;

    constructor() {
        this.id = uuid();

        this.attachments = new Map<number, RenderTexture>();

        this.needsUpdate = true;
    }
    setAttachment(id: number, texture: RenderTexture): void {
        this.attachments.set(id, texture);
    }
    getAttachment(id: number): RenderTexture | undefined {
        return this.attachments.get(id);
    }
    setDrawBuffers(drawBuffers: number[]): void {
        this.drawBuffers = drawBuffers;
    }
}
