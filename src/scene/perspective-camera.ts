import {Camera} from "./camera";
import {Bound2} from "../math/bound2";

export class PerspectiveCamera extends Camera {
    public near: number;
    public far: number;

    public fov: number;
    public aspect: number;

    constructor({fov, aspect, near, far}: {fov: number; aspect: number; near: number; far: number; viewport?: Bound2}) {
        super();

        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;

        this.projectionMatrix.perspective({
            fov,
            aspect,
            near,
            far,
        });
    }
    updateProjection(): void {
        this.projectionMatrix.perspective({
            fov: this.fov,
            aspect: this.aspect,
            near: this.near,
            far: this.far,
        });
    }
}
