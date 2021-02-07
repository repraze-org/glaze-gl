import {Color} from "../../color";
import {ShaderProgram} from "../../shader-program";
import {Texture} from "../../texture";
import {Camera} from "../camera";
import {Mesh} from "../mesh";
import {Material} from "./material";

const VERTEX_SHADER = `#version 300 es
uniform mat4 uProjectionMatrix;
uniform mat4 uModelViewMatrix;
uniform mat4 uNormalMatrix;

in vec4 aVertex;
in vec2 aUv;
in vec4 aNormal;

out vec2 vUv;
out vec4 vNormal;

void main() {
    vUv = aUv;
    vNormal = (uNormalMatrix * aNormal) * 0.5 + 0.5;
    gl_Position = uProjectionMatrix * uModelViewMatrix * aVertex;
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

uniform vec3 uColor;
uniform bool uEnableMap;
uniform sampler2D uMap;

in vec2 vUv;
in vec4 vNormal;
in vec4 vPosition;

layout (location = 0) out vec4 oColor;
layout (location = 1) out vec4 oNormal;

void main(){
    vec3 color = uColor;
    if(uEnableMap) {
        color *= texture(uMap, vUv).xyz;
    }
    oColor = vec4(color, 1.0);
    oNormal = vNormal;
}
`;

export class SimpleMaterial extends Material {
    public color: Color;
    public map?: Texture; // TODO: rename map

    constructor(gl: WebGLRenderingContext) {
        super(new ShaderProgram(gl, {vs: VERTEX_SHADER, fs: FRAGMENT_SHADER}));
        this.color = new Color(0xffffff);
    }
    bind(mesh: Mesh, camera: Camera): void {
        // uniforms
        this.program.uniforms["uProjectionMatrix"].setMat4(camera.projectionMatrix);
        this.program.uniforms["uModelViewMatrix"].setMat4(mesh.modelViewMatrix);
        this.program.uniforms["uNormalMatrix"].setMat4(mesh.normalMatrix);

        this.program.uniforms["uColor"].setVec3(this.color);
        this.program.uniforms["uEnableMap"].setBool(this.map !== undefined);
        if (this.map !== undefined) {
            this.program.uniforms["uMap"].setSampler2D(this.map);
        }

        // attributes
        this.program.attributes["aVertex"].setVec4(mesh.geometry.getAttribute("vertex"));
        this.program.attributes["aNormal"].setVec4(mesh.geometry.getAttribute("normal"));
        this.program.attributes["aUv"].setVec2(mesh.geometry.getAttribute("uv"));
    }
}
