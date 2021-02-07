import {Geometry} from "../geometry";
import {SceneObject, SceneObjectType} from "./scene-object";
import {Material} from "./materials/material";

export class Mesh<M extends Material = any> extends SceneObject {
    public geometry: Geometry;
    public material: M;

    constructor(geometry: Geometry, material: M) {
        super(SceneObjectType.MESH);

        this.geometry = geometry;
        this.material = material;
    }
}
