import {Color} from "../../color";
import {SceneObjectType} from "../scene-object";
import {Light} from "./light";

export class PointLight extends Light {
    public color: Color;
    public intensity: number;
    public decay: number;

    constructor(color = new Color(0xffffff), intensity = 1, decay = 2) {
        super(SceneObjectType.POINT_LIGHT);

        this.color = color;
        this.intensity = intensity;
        this.decay = decay;
    }
}
