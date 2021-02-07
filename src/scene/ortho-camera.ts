import {Camera} from "./camera";
import {Bound2} from "../math/bound2";

export class OrthoCamera extends Camera {
    public near: number;
    public far: number;

    public left: number;
    public right: number;
    public bottom: number;
    public top: number;

    constructor({
        left,
        right,
        bottom,
        top,
        near,
        far,
    }: {
        left: number;
        right: number;
        bottom: number;
        top: number;
        near: number;
        far: number;
        viewport?: Bound2;
    }) {
        super();

        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;

        this.projectionMatrix.ortho({
            left,
            right,
            bottom,
            top,
            near,
            far,
        });
    }
    updateProjection(): void {
        this.projectionMatrix.ortho({
            left: this.left,
            right: this.right,
            bottom: this.bottom,
            top: this.top,
            near: this.near,
            far: this.far,
        });
    }
}
