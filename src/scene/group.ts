import {SceneObject, SceneObjectType} from "./scene-object";

export class Group extends SceneObject {
    constructor() {
        super(SceneObjectType.OTHER);
    }
}
