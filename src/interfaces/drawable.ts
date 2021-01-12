import {Disposable} from "./disposable";
import {Camera} from "../camera";

export interface Drawable extends Disposable {
    draw(camera: Camera): void;
}
