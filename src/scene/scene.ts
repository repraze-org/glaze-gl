import {Color} from "../color";
import {SceneObject, SceneObjectType} from "./scene-object";

export class Scene extends SceneObject {
    public clearColor: Color;

    constructor() {
        super(SceneObjectType.OTHER);
        this.clearColor = new Color();
    }
}
