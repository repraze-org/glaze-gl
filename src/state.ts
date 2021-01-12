import {Disposable} from "./interfaces/disposable";
import {SizeListenerCallbackParameters} from "./size-listener";

export abstract class State implements Disposable {
    load?(): Promise<void> | void;
    abstract begin(container: HTMLElement): void;
    abstract frame(delta: number): void;
    abstract resize(params: SizeListenerCallbackParameters): void;
    abstract end(container: HTMLElement): void;
    abstract dispose(): Promise<void> | void;
}
