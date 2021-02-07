import {Color} from "../../color";
import {SceneObjectType} from "../scene-object";
import {Light} from "./light";

export class AmbientLight extends Light {
    public color: Color;
    public intensity: number;

    constructor(color = new Color(0xffffff), intensity = 1) {
        super(SceneObjectType.AMBIENT_LIGHT);

        this.color = color;
        this.intensity = intensity;
    }
}
