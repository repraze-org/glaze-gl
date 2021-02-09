import {Light} from "./light";
import {SceneObjectType} from "../scene-object";
import {Color} from "../../color";
import {Vector3} from "@math.gl/core";

export class DirectionalLight extends Light {
    public color: Color;
    public intensity: number;
    public position: Vector3;
    public enableShadows: boolean;

    constructor(color = new Color(0xffffff), intensity = 1, direction = new Vector3(0, 0, 1)) {
        super(SceneObjectType.DIRECTIONAL_LIGHT);

        this.color = color;
        this.intensity = intensity;
        this.position = direction;
        this.enableShadows = true;
    }
}
