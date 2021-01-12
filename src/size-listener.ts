import {Disposable} from "./interfaces/disposable";

export interface SizeListenerCallbackParameters {
    width: number;
    height: number;
    pixelRatio: number;
}

export type SizeListenerCallback = (params: SizeListenerCallbackParameters) => void;

export class SizeListener implements Disposable {
    private element: HTMLElement;
    private callback: SizeListenerCallback;

    private width: number;
    private height: number;
    private pixelRatio: number;
    constructor(element: HTMLElement, callback: SizeListenerCallback) {
        this.element = element;
        this.callback = callback;

        const {width, height} = this.element.getBoundingClientRect();
        this.width = width;
        this.height = height;
        this.pixelRatio = window ? window.devicePixelRatio : 1;
    }
    check() {
        const {width, height} = this.element.getBoundingClientRect();
        const pixelRatio = window ? window.devicePixelRatio : 1;
        if (width != this.width || height != this.height || pixelRatio != this.pixelRatio) {
            this.width = width;
            this.height = height;
            this.pixelRatio = pixelRatio;

            this.callback({width, height, pixelRatio});
        }
    }
    dispose(): void {
        // Empty
    }
}
