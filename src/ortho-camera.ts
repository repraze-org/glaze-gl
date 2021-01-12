import {Matrix4} from "@math.gl/core";
import {Camera} from "./camera";
import {Bound2} from "./math/bound2";

const DEFAULT_VIEWPORT = new Bound2();

export class OrthoCamera implements Camera {
    public left: number;
    public right: number;
    public bottom: number;
    public top: number;
    public near: number;
    public far: number;
    public viewport: Bound2;

    public projection: Matrix4;
    constructor({
        left,
        right,
        bottom,
        top,
        near,
        far,
        viewport = DEFAULT_VIEWPORT,
    }: {
        left: number;
        right: number;
        bottom: number;
        top: number;
        near: number;
        far: number;
        viewport?: Bound2;
    }) {
        this.left = left;
        this.right = right;
        this.bottom = bottom;
        this.top = top;
        this.near = near;
        this.far = far;
        this.viewport = viewport;

        this.projection = new Matrix4().ortho({
            left,
            right,
            bottom,
            top,
            near,
            far,
        });
    }
    update() {
        this.projection.ortho({
            left: this.left,
            right: this.right,
            bottom: this.bottom,
            top: this.top,
            near: this.near,
            far: this.far,
        });
    }
}
