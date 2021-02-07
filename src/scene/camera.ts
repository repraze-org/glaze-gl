import {Matrix4} from "@math.gl/core";
import {SceneObject, SceneObjectType} from "./scene-object";

export abstract class Camera extends SceneObject {
    public projectionMatrix: Matrix4;
    // calculated matrix
    public viewMatrix: Matrix4;

    constructor() {
        super(SceneObjectType.OTHER);
        this.projectionMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
    }
}
