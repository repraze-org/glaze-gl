import {Light} from "./light";
import {SceneObjectType} from "../scene-object";
import {Color} from "../../color";

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
