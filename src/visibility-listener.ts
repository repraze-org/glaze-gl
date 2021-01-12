import {Disposable} from "./interfaces/disposable";

export type VisibilityListenerCallback = (visible: boolean) => void;

export class VisibilityListener implements Disposable {
    private window: Window;
    private callback: VisibilityListenerCallback;
    constructor(window: Window, callback: VisibilityListenerCallback) {
        this.window = window;
        this.callback = callback;

        window.addEventListener("visibilitychange", this.update);
    }
    update = () => {
        const visible = !this.window.document.hidden;
        this.callback(visible);
    };
    dispose(): void {
        window.removeEventListener("visibilitychange", this.update);
    }
}
