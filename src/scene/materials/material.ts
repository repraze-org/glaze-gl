import {Camera} from "../camera";
import {Mesh} from "../mesh";
import {ShaderProgram} from "../../shader-program";

export abstract class Material {
    public program: ShaderProgram;

    constructor(program: ShaderProgram) {
        this.program = program;
    }

    abstract bind(mesh: Mesh, camera: Camera): void;
}
