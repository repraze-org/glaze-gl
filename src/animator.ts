import {State} from "./state";
import {SizeListener, SizeListenerCallbackParameters} from "./size-listener";
import {VisibilityListener} from "./visibility-listener";
import {Disposable} from "./interfaces/disposable";

export class Animator implements Disposable {
    private container: HTMLElement;

    private nextFrame?: number;
    private running: boolean;
    private visible: boolean;
    private state?: State;
    private last: number;
    private sizeListener: SizeListener;
    private visibilityListener: VisibilityListener;
    constructor(container: HTMLElement) {
        this.container = container;

        this.running = false;
        this.visible = true;
        this.last = 0;
        this.sizeListener = new SizeListener(container, this.resize);
        this.visibilityListener = new VisibilityListener(window, this.visibility);
    }
    start() {
        if (!this.running) {
            this.running = true;

            this.nextFrame = requestAnimationFrame(this.frame);
        }
    }
    stop() {
        if (!this.running) {
            this.running = false;
        }
    }
    async setState(state: State) {
        if (state.load !== undefined) {
            await state.load();
        }
        if (this.state) {
            this.state.end(this.container);
            await this.state.dispose();
        }
        this.state = state;
        this.state.begin(this.container);
    }
    frame = (now: number) => {
        if (this.running && this.visible) {
            // timing
            const delta = Math.min(this.last === 0 ? 0 : (now - this.last) / 1000, 1);
            this.last = now;

            if (this.state) {
                this.state.frame(delta);
            }
            this.sizeListener.check();

            this.nextFrame = requestAnimationFrame(this.frame);
        }
    };
    resize = (params: SizeListenerCallbackParameters) => {
        if (this.running && this.state) {
            this.state.resize(params);
        }
    };
    visibility = (visible: boolean) => {
        // restart if needed
        if (this.running) {
            if (this.visible && !visible && this.nextFrame) {
                cancelAnimationFrame(this.nextFrame);
                this.nextFrame = undefined;
            } else if (!this.visible && visible && !this.nextFrame) {
                this.nextFrame = requestAnimationFrame(this.frame);
            }
        }
        this.visible = visible;
    };
    dispose() {
        this.sizeListener.dispose();
        this.visibilityListener.dispose();
    }
}
