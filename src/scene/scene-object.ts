import {Matrix4} from "@math.gl/core";

export enum SceneObjectType {
    OTHER = 0,
    MESH = 1,
    AMBIENT_LIGHT = 2,
    DIRECTIONAL_LIGHT = 3,
    POINT_LIGHT = 4,
}

export abstract class SceneObject {
    public type: SceneObjectType;

    public visible: boolean;

    public parent: SceneObject | null;
    public readonly children: SceneObject[];

    public matrix: Matrix4; // local transform relative to parent or origin
    // calculated matrix
    public modelMatrix: Matrix4; // transform into model / world space
    public modelViewMatrix: Matrix4; // transform into camera space
    public normalMatrix: Matrix4; // transform normal vertex to object space

    constructor(type: SceneObjectType) {
        this.type = type;

        this.visible = true;

        this.parent = null;
        this.children = [];

        this.matrix = new Matrix4();
        this.modelMatrix = new Matrix4();
        this.modelViewMatrix = new Matrix4();
        this.normalMatrix = new Matrix4();
    }

    add(...objects: SceneObject[]): void {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            object.parent = this;
            this.children.push(object);
        }
    }
    remove(...objects: SceneObject[]): void {
        for (let i = 0; i < objects.length; i++) {
            const object = objects[i];
            const index = this.children.indexOf(object);
            if (index >= 0) {
                object.parent = null;
                this.children.splice(index, 1);
            }
        }
    }
    clear(): void {
        for (let i = 0; i < this.children.length; i++) {
            const object = this.children[i];
            object.parent = null;
        }
        this.children.length = 0;
    }

    // traversal
    forEach(callback: (object: SceneObject) => void): void {
        callback(this);
        // children
        for (let i = 0; i < this.children.length; i++) {
            this.children[i].forEach(callback);
        }
    }
    forEachVisible(callback: (object: SceneObject) => void): void {
        if (this.visible) {
            callback(this);
            // children
            for (let i = 0; i < this.children.length; i++) {
                this.children[i].forEachVisible(callback);
            }
        }
    }
}
